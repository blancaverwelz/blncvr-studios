import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import emblemUrl from '../assets/models/emblem.glb?url'

// Two related-but-distinct yellows so the charge-up sparks don't read as identical
// to the settled glow: the glow channel stays true cyberpunk yellow, the arc/spark
// effect runs hotter (more white mixed in) so it feels like the higher-energy phase.
const GLOW_COLOR = new THREE.Color('#FFD301')
const ARC_COLOR = new THREE.Color('#FFD301').lerp(new THREE.Color('#FFFFFF'), 0.35)

const SPIN_TURNS = 2.25
const SPIN_DURATION = 2.1
const CHARGE_DURATION = 1.3
const GLOW_FADE_DURATION = 0.9

// simple ease-out for the spin-to-a-stop feel
function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3)
}

function buildParticleField(count = 90) {
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const r = 1.6 + Math.random() * 2.6
    const theta = Math.random() * Math.PI * 2
    const y = -2.5 + Math.random() * 4.5
    positions[i * 3] = Math.cos(theta) * r
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = Math.sin(theta) * r
    seeds[i] = Math.random() * 100
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float aSeed;
      uniform float uTime;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.12 + aSeed) * 0.18;
        p.y += sin(uTime * 0.08 + aSeed * 1.7) * 0.14 + 0.02;
        p.z += cos(uTime * 0.1 + aSeed * 0.6) * 0.18;
        vAlpha = 0.35 + 0.35 * sin(uTime * 0.35 + aSeed * 3.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (10.0 / -mv.z) * (0.6 + 0.4 * sin(aSeed));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float a = smoothstep(0.5, 0.0, d) * clamp(vAlpha, 0.0, 1.0);
        gl_FragColor = vec4(vec3(0.85, 0.85, 0.9), a * 0.5);
      }
    `,
  })
  return new THREE.Points(geo, mat)
}

// Attaches the "electricity" behavior to the glow channel material: an object-space
// traveling pulse around the ring's circumference (angle-based, so it's independent
// of UV layout), plus a soft base glow once settled. uIntensity fades the whole thing
// in during the glow-reveal phase; uCrawl controls the traveling-pulse speed/visibility.
function attachGlowChannelShader(material) {
  material.emissive = GLOW_COLOR.clone()
  material.emissiveIntensity = 0
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 }
    shader.uniforms.uIntensity = { value: 0 }
    shader.uniforms.uGlow = { value: GLOW_COLOR }

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform float uTime;
         uniform float uIntensity;
         uniform vec3 uGlow;
         varying vec3 vObjPos;`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         float ang = atan(vObjPos.z, vObjPos.x);
         float pulse = sin(ang * 3.0 - uTime * 1.6) * 0.5 + 0.5;
         pulse = pow(pulse, 4.0);
         float base = 0.35 + 0.15 * sin(uTime * 0.6);
         float glowAmt = (base + pulse * 0.9) * uIntensity;
         totalEmissiveRadiance += uGlow * glowAmt * 2.2;`
      )

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vObjPos;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vObjPos = position;`
      )

    material.userData.shader = shader
  }
  material.needsUpdate = true
}

// A lightning-like tube climbing from the pedestal up to the ring, revealed
// progressively via a "progress" uniform with a jittery, flickering edge.
function buildChargeArc(from, to) {
  const mid1 = from.clone().lerp(to, 0.35).add(new THREE.Vector3(0.4, 0, 0.15))
  const mid2 = from.clone().lerp(to, 0.7).add(new THREE.Vector3(-0.3, 0, -0.1))
  const curve = new THREE.CatmullRomCurve3([from, mid1, mid2, to])
  const geo = new THREE.TubeGeometry(curve, 48, 0.025, 6, false)
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uColor: { value: ARC_COLOR },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uProgress;
      uniform vec3 uColor;
      varying vec2 vUv;
      float hash(float n) { return fract(sin(n) * 43758.5453); }
      void main() {
        float head = uProgress;
        float reveal = smoothstep(head, head - 0.08, vUv.x);
        float flicker = hash(floor(uTime * 24.0) + floor(vUv.x * 20.0));
        float edgeGlow = smoothstep(0.0, 1.0, 1.0 - abs(vUv.y - 0.5) * 2.0);
        float a = reveal * edgeGlow * (0.6 + 0.4 * flicker);
        gl_FragColor = vec4(uColor, a);
      }
    `,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.renderOrder = 10
  return mesh
}

export default function EmblemScene() {
  const mountRef = useRef(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    let disposed = false

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0.3, 9.5)
    camera.lookAt(0, -0.3, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    mount.appendChild(renderer.domElement)

    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.4, 0.15)
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())

    const particles = buildParticleField()
    scene.add(particles)

    let ringNode = null
    let glyphNode = null
    let pedestalNode = null
    let glowMaterial = null
    let chargeArc = null

    // ---- phase state machine ----
    // idle_static -> spinning -> charging -> glow_reveal -> settled
    // "settled" holds indefinitely (with its own continuous shader crawl) until the
    // section scrolls out of view, at which point everything resets to idle_static.
    let phase = 'idle_static'
    let phaseStart = 0
    const clock = new THREE.Clock()

    const loader = new GLTFLoader()
    loader.load(emblemUrl, (gltf) => {
      if (disposed) return
      const root = gltf.scene
      scene.add(root)

      root.traverse((obj) => {
        if (obj.name === 'Ring') ringNode = obj
        if (obj.name === 'Glyph') glyphNode = obj
        if (obj.name === 'Pedestal') pedestalNode = obj
        if (obj.name === 'GlowChannel') {
          const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material
          glowMaterial = mat
          attachGlowChannelShader(mat)
        }
      })

      if (ringNode && pedestalNode) {
        const ringBox = new THREE.Box3().setFromObject(ringNode)
        const pedBox = new THREE.Box3().setFromObject(pedestalNode)
        const from = new THREE.Vector3(0, pedBox.max.y, pedBox.max.z * 0.92)
        const to = new THREE.Vector3(0, ringBox.min.y + 0.15, 0.1)
        chargeArc = buildChargeArc(from, to)
        chargeArc.material.uniforms.uProgress.value = 0
        scene.add(chargeArc)
      }

      resetToIdle()
    })

    function resetToIdle() {
      phase = 'idle_static'
      phaseStart = clock.getElapsedTime()
      if (ringNode) ringNode.rotation.z = 0
      if (chargeArc) chargeArc.material.uniforms.uProgress.value = 0
      if (glowMaterial?.userData.shader) {
        glowMaterial.userData.shader.uniforms.uIntensity.value = 0
      }
      glowMaterial && (glowMaterial.emissiveIntensity = 0)
    }

    function beginSequence() {
      phase = 'spinning'
      phaseStart = clock.getElapsedTime()
    }

    // ---- IntersectionObserver: play once on entry, reset on exit, replay on re-entry ----
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          if (phase === 'idle_static') beginSequence()
        } else {
          resetToIdle()
        }
      },
      { threshold: 0.25 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)

    function handleResize() {
      const { clientWidth, clientHeight } = mount
      if (!clientWidth || !clientHeight) return
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight)
      composer.setSize(clientWidth, clientHeight)
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(mount)
    handleResize()

    let rafId
    function animate() {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      particles.material.uniforms.uTime.value = t

      if (phase === 'spinning' && ringNode) {
        const elapsed = t - phaseStart
        const progress = Math.min(elapsed / SPIN_DURATION, 1)
        const eased = easeOutCubic(progress)
        ringNode.rotation.z = eased * Math.PI * 2 * SPIN_TURNS
        if (progress >= 1) {
          phase = 'charging'
          phaseStart = t
        }
      } else if (phase === 'charging' && chargeArc) {
        const elapsed = t - phaseStart
        const progress = Math.min(elapsed / CHARGE_DURATION, 1)
        chargeArc.material.uniforms.uProgress.value = progress
        chargeArc.material.uniforms.uTime.value = t
        if (progress >= 1) {
          phase = 'glow_reveal'
          phaseStart = t
        }
      } else if (phase === 'glow_reveal') {
        const elapsed = t - phaseStart
        const progress = Math.min(elapsed / GLOW_FADE_DURATION, 1)
        if (chargeArc) {
          chargeArc.material.uniforms.uProgress.value = 1
          chargeArc.material.uniforms.uTime.value = t
          chargeArc.material.opacity = 1 - progress
        }
        if (glowMaterial?.userData.shader) {
          glowMaterial.userData.shader.uniforms.uIntensity.value = progress
          glowMaterial.userData.shader.uniforms.uTime.value = t
        }
        if (progress >= 1) {
          phase = 'settled'
          phaseStart = t
          if (chargeArc) scene.remove(chargeArc)
        }
      } else if (phase === 'settled') {
        if (glowMaterial?.userData.shader) {
          glowMaterial.userData.shader.uniforms.uIntensity.value = 1
          glowMaterial.userData.shader.uniforms.uTime.value = t
        }
      }

      composer.render()
    }
    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      observer.disconnect()
      resizeObserver.disconnect()
      renderer.dispose()
      composer.dispose()
      scene.environment?.dispose()
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
      })
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={sectionRef}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
    >
      <div ref={mountRef} className="relative h-full w-full overflow-hidden" />
    </div>
  )
}
