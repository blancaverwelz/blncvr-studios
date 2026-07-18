import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import emblemUrl from '../assets/models/emblem.glb?url'

const NEON = new THREE.Color('#00f0ff')
const RING_RADIUS_INNER = 0.82
const RING_RADIUS_OUTER = 0.98

// ---- shard/pedestal material: dark scratched metal, blends to neon emissive past the ring radius ----
function buildEmblemMaterial(emblemCenter) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0x050506,
    metalness: 0.85,
    roughness: 0.4,
  })
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uCenter = { value: emblemCenter }
    shader.uniforms.uNeon = { value: NEON }
    shader.uniforms.uRingInner = { value: RING_RADIUS_INNER }
    shader.uniforms.uRingOuter = { value: RING_RADIUS_OUTER }
    shader.uniforms.uArc = { value: 0 } // 0..1 electric arc intensity
    shader.uniforms.uIdleGlow = { value: 0 } // 0..1 steady idle glow (ramps in after settle)
    shader.uniforms.uTime = { value: 0 }

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vWorldPos;`
      )
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
         vWorldPos = worldPosition.xyz;`
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform vec3 uCenter;
         uniform vec3 uNeon;
         uniform float uRingInner;
         uniform float uRingOuter;
         uniform float uArc;
         uniform float uIdleGlow;
         uniform float uTime;
         varying vec3 vWorldPos;

         float hash21(vec2 p) {
           p = fract(p * vec2(123.34, 456.21));
           p += dot(p, p + 45.32);
           return fract(p.x * p.y);
         }`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         float d = length(vWorldPos - uCenter);
         float ringMask = smoothstep(uRingInner, uRingOuter, d) * (1.0 - smoothstep(uRingOuter, uRingOuter + 0.35, d));
         vec3 glow = uNeon * ringMask * (0.4 + uIdleGlow * 1.8);

         // electric arc: thin noisy traveling bands, strongest near the ring, brief
         float band = hash21(floor(vWorldPos.xy * 40.0) + floor(uTime * 30.0));
         float arcNoise = smoothstep(0.88, 1.0, band) * uArc;
         vec3 arcColor = uNeon * arcNoise * 2.5;

         totalEmissiveRadiance += glow + arcColor;`
      )

    mat.userData.shader = shader
  }
  return mat
}

// ---- particle field: single Points object, sine-drift in shader, one draw call ----
function buildParticleField(count = 110) {
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const r = 1.4 + Math.random() * 2.2
    const theta = Math.random() * Math.PI * 2
    const y = -1.3 + Math.random() * 2.6
    positions[i * 3] = Math.cos(theta) * r
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = Math.sin(theta) * r
    seeds[i] = Math.random() * 100
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: NEON.clone().lerp(new THREE.Color('#ffffff'), 0.3) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float aSeed;
      uniform float uTime;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.15 + aSeed) * 0.15;
        p.y += sin(uTime * 0.09 + aSeed * 1.7) * 0.12 + 0.02;
        p.z += cos(uTime * 0.12 + aSeed * 0.6) * 0.15;
        vAlpha = 0.4 + 0.6 * sin(uTime * 0.4 + aSeed * 3.0) * 0.5 + 0.3;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (14.0 / -mv.z) * (0.6 + 0.4 * sin(aSeed));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float a = smoothstep(0.5, 0.0, d) * clamp(vAlpha, 0.0, 1.0);
        gl_FragColor = vec4(uColor, a * 0.6);
      }
    `,
  })
  return new THREE.Points(geo, mat)
}

function buildGlowPool() {
  const geo = new THREE.CircleGeometry(1.9, 48)
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: NEON } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float a = smoothstep(1.0, 0.0, d) * 0.25;
        gl_FragColor = vec4(uColor, a);
      }
    `,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = -1.42
  return mesh
}

export default function EmblemScene() {
  const mountRef = useRef(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const isMobile = window.matchMedia('(max-width: 767px)').matches

    // ---- renderer / scene / camera ----
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50)
    camera.position.set(0, 0.3, 6.2)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
    keyLight.position.set(2, 3, 4)
    scene.add(keyLight)
    scene.add(new THREE.AmbientLight(0x334455, 0.6))

    // ---- postprocessing (bloom) ----
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      isMobile ? 0.65 : 0.95, // strength
      0.5, // radius
      0.15 // threshold
    )
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())

    // ---- particle field + glow pool (always present, ambient) ----
    const particles = buildParticleField(isMobile ? 60 : 110)
    scene.add(particles)
    const glowPool = buildGlowPool()
    scene.add(glowPool)

    const emblemCenter = new THREE.Vector3(0, 0, 0)
    const emblemMaterial = buildEmblemMaterial(emblemCenter)

    // ---- state machine ----
    let mixer = null
    let actions = []
    let phase = 'loading' // loading -> assembling -> arcing -> idle
    let phaseStart = 0
    let hasPlayedOnce = false
    let skipAssemblyThisPlay = isMobile
    const clock = new THREE.Clock()
    const ARC_DURATION = 0.9

    // gentle idle float on the emblem group (ring + glyph), pedestal stays grounded
    let spinPivot = null
    let floatBaseY = 0
    const FLOAT_AMPLITUDE = 0.045
    const FLOAT_SPEED = 0.55
    let floatBlend = 0 // eases in once idle so it doesn't pop

    const loader = new GLTFLoader()
    let disposed = false

    loader.load(emblemUrl, (gltf) => {
      if (disposed) return
      const root = gltf.scene
      root.scale.setScalar(1.9)
      root.position.y = -0.15
      scene.add(root)

      root.traverse((obj) => {
        if (obj.isMesh) {
          obj.material = emblemMaterial
          obj.castShadow = false
          obj.receiveShadow = false
        }
      })

      mixer = new THREE.AnimationMixer(root)
      actions = gltf.animations.map((clip) => {
        const action = mixer.clipAction(clip)
        action.setLoop(THREE.LoopOnce)
        action.clampWhenFinished = true
        return action
      })

      spinPivot = root.getObjectByName('Emblem_SpinPivot')
      if (spinPivot) floatBaseY = spinPivot.position.y

      playFullCycle(true)
    })

    function playFullCycle(isFirstPlay) {
      phase = 'assembling'
      phaseStart = clock.getElapsedTime()
      floatBlend = 0
      if (spinPivot) spinPivot.position.y = floatBaseY
      const skipShards = isFirstPlay && skipAssemblyThisPlay

      actions.forEach((action) => {
        action.reset()
        if (skipShards) {
          action.time = action.getClip().duration
          action.paused = true
          action.play()
          action.paused = true
        } else {
          action.play()
        }
      })

      if (skipShards) {
        phase = 'arcing'
        phaseStart = clock.getElapsedTime()
      }
      hasPlayedOnce = true
    }

    // ---- IntersectionObserver: replay on re-entry ----
    let firstObservation = true
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (firstObservation) {
          firstObservation = false
          return
        }
        if (entry.isIntersecting && hasPlayedOnce && phase === 'idle') {
          skipAssemblyThisPlay = false
          playFullCycle(false)
        }
      },
      { threshold: 0.25 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)

    // ---- resize ----
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

    // ---- render loop ----
    let rafId
    function animate() {
      rafId = requestAnimationFrame(animate)
      const dt = clock.getDelta()
      const t = clock.getElapsedTime()

      if (mixer) mixer.update(dt)

      const shader = emblemMaterial.userData.shader
      if (shader) {
        shader.uniforms.uTime.value = t

        if (phase === 'assembling') {
          const allDone = actions.every((a) => a._clip && (a.paused || a.time >= a.getClip().duration - 0.001))
          if (allDone) {
            phase = 'arcing'
            phaseStart = t
          }
          shader.uniforms.uArc.value = 0
          shader.uniforms.uIdleGlow.value = 0
        } else if (phase === 'arcing') {
          const elapsed = t - phaseStart
          const progress = Math.min(elapsed / ARC_DURATION, 1)
          shader.uniforms.uArc.value = Math.sin(progress * Math.PI) // ramps up then down
          shader.uniforms.uIdleGlow.value = progress
          if (progress >= 1) {
            phase = 'idle'
            phaseStart = t
          }
        } else if (phase === 'idle') {
          shader.uniforms.uArc.value = 0
          shader.uniforms.uIdleGlow.value = 1
        }
      }

      if (spinPivot) {
        if (phase === 'arcing') {
          floatBlend = Math.min(floatBlend + dt / ARC_DURATION, 1)
        } else if (phase === 'idle') {
          floatBlend = 1
        } else {
          floatBlend = 0
        }
        const floatOffset = Math.sin(t * FLOAT_SPEED) * FLOAT_AMPLITUDE * floatBlend
        spinPivot.position.y = floatBaseY + floatOffset
      }

      particles.material.uniforms.uTime.value = t

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
      <div ref={mountRef} className="h-full w-full" />
    </div>
  )
}
