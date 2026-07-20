import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import emblemUrl from '../assets/models/emblem.glb?url'

const NEON = new THREE.Color('#FFD301') // Cyber Yellow — replaces the old cyan/teal brand color
// matches the new Blender ring geometry: Ring_NeonStrip sits at radius ~1.03-1.06.
// used only by the ambient halo plane now — the ring's own glow comes from a real
// separate emissive material (M_NeonAccent), not a distance-based mask on the metal.
const RING_RADIUS_INNER = 0.95
const RING_RADIUS_OUTER = 1.06

// ---- metal shader: procedural brushed/weathered variation (object-space, no UV dependency
// so it works correctly across all 31 independently-fractured shards) + electric arc veins.
// This replaces the old distance-based ring-glow hack now that the neon strip is real geometry
// with its own material.
function attachMetalShader(material, { arcEnabled = true } = {}) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 }
    shader.uniforms.uArc = { value: 0 }
    shader.uniforms.uNeon = { value: NEON }

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vWorldPos;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform float uTime;
         uniform float uArc;
         uniform vec3 uNeon;
         varying vec3 vWorldPos;

         float hash21(vec2 p) {
           p = fract(p * vec2(123.34, 456.21));
           p += dot(p, p + 45.32);
           return fract(p.x * p.y);
         }
         float vnoise(vec2 p) {
           vec2 i = floor(p); vec2 f = fract(p);
           float a = hash21(i), b = hash21(i + vec2(1.0, 0.0));
           float c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
           vec2 u = f * f * (3.0 - 2.0 * f);
           return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
         }
         float bumpHeight(vec3 p) {
           return vnoise(p.xy * 30.0) * 0.6 + vnoise(p.xz * 46.0 + 5.0) * 0.4
                + vnoise(p.xy * 5.0 + 2.0) * 0.5; // low-frequency dents under the fine pitting`
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         // brushed streaks + fine scratch noise, both in object-space world position —
         // reads consistently across every fractured shard regardless of its own UV layout
         float brush = vnoise(vWorldPos.xy * 18.0 + vWorldPos.z * 4.0);
         float scratch = vnoise(vec2(vWorldPos.x * 3.0 + vWorldPos.z * 42.0, vWorldPos.y * 42.0));
         roughnessFactor = clamp(roughnessFactor + (brush - 0.5) * 0.28 + (scratch - 0.5) * 0.16, 0.15, 0.95);`
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
         // real bump — perturbs the shading normal via the noise field's surface gradient,
         // not just a roughness value, so it actually catches/blocks light like pitting and dents
         {
           float h = bumpHeight(vWorldPos);
           vec3 dPdx = dFdx(vWorldPos);
           vec3 dPdy = dFdy(vWorldPos);
           float dHdx = dFdx(h);
           float dHdy = dFdy(h);
           vec3 r1 = cross(dPdy, normal);
           vec3 r2 = cross(normal, dPdx);
           float det = dot(dPdx, r1);
           vec3 surfGrad = sign(det) * (dHdx * r1 + dHdy * r2);
           normal = normalize(abs(det) * normal - 0.045 * surfGrad);
         }`
      )

    if (arcEnabled) {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         vec2 np = vWorldPos.xy * 7.0 + vec2(uTime * 1.6, -uTime * 1.1);
         np += vnoise(np * 0.6 + uTime * 0.4) * 1.3;
         float veinA = pow(1.0 - abs(vnoise(np) * 2.0 - 1.0), 8.0);
         float veinB = pow(1.0 - abs(vnoise(np * 2.4 + 11.0) * 2.0 - 1.0), 10.0);
         float veins = clamp(veinA + veinB * 0.6, 0.0, 1.0);
         totalEmissiveRadiance += uNeon * veins * uArc * 2.8;

         // edge wear: a tight fresnel term brightens exposed edges/rims, the small highlight
         // that makes worn metal read as real rather than a flat uniform shader.
         // uses cameraPosition (always available) rather than vViewPosition, which is only
         // conditionally declared by three.js and caused a silent full-material shader
         // compile failure the last time this mistake was made in this file
         vec3 viewDir = normalize(cameraPosition - vWorldPos);
         float fresnel = pow(1.0 - clamp(dot(normalize(normal), viewDir), 0.0, 1.0), 4.0);
         totalEmissiveRadiance += vec3(0.35, 0.33, 0.28) * fresnel * 0.5;`
      )
    }

    material.userData.shader = shader
  }
  material.needsUpdate = true
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

// ---- outer neon ring: a literal thin ring that appears just outside the physical ring
// after the arc effect finishes, per spec — a deliberate second ring with a visible gap
// from the model's own neon strip, not a soft blob blended into it
function buildOuterNeonRing() {
  const innerR = RING_RADIUS_OUTER + 0.05
  const outerR = innerR + 0.03
  const geo = new THREE.RingGeometry(innerR, outerR, 128)
  const mat = new THREE.MeshBasicMaterial({
    color: NEON,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  return new THREE.Mesh(geo, mat)
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
  mesh.position.y = -1.25
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
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.inset = '0'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50)
    camera.position.set(0, 0, 5.7)

    // lightweight procedural environment for believable metal reflections —
    // no HDR file to ship, avoids the extra weight while still giving the
    // brushed gunmetal something real to reflect
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
    keyLight.position.set(2, 3, 4)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0x6688aa, 0.25) // dimmed — was flattening contrast
    fillLight.position.set(-3, 1, 2)
    scene.add(fillLight)
    const rimLight = new THREE.DirectionalLight(0xccddee, 0.9) // was stale cyan brand color, now neutral cool white
    rimLight.position.set(0, 1.5, -4)
    scene.add(rimLight)
    scene.add(new THREE.AmbientLight(0x223344, 0.22)) // lower ambient — crisper shadows, better separation

    // ---- postprocessing: multisampled render target gives real AA even with post-fx
    // (the renderer's own antialias flag only covers the default framebuffer, not this) ----
    const renderTarget = new THREE.WebGLRenderTarget(1, 1, {
      samples: isMobile ? 0 : 4,
      type: THREE.HalfFloatType,
    })
    const composer = new EffectComposer(renderer, renderTarget)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      isMobile ? 0.35 : 0.5, // strength — controlled, not oversized
      0.35, // radius — tighter for a crisp emissive core
      0.5 // threshold — only true emissive (neon material + halo) blooms
    )
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())

    // ---- particle field + glow pool + outer neon ring (always present, ambient) ----
    const particles = buildParticleField(isMobile ? 60 : 110)
    scene.add(particles)
    const glowPool = buildGlowPool()
    scene.add(glowPool)
    const outerRing = buildOuterNeonRing()
    scene.add(outerRing)

    // ---- state machine ----
    // sequence: assembling (shards only) -> floating_pause (glyph floats, ring stays still)
    // -> spinning (ring spins, plays as its own independent action) -> arcing (electricity
    // crawls) -> settling (outer ring fades in) -> idle
    let mixer = null
    let shardActions = []
    let spinAction = null
    let phase = 'loading'
    let phaseStart = 0
    let hasPlayedOnce = false
    let skipAssemblyThisPlay = isMobile
    const clock = new THREE.Clock()
    const FLOAT_PAUSE_DURATION = 0.7
    const ARC_DURATION = 1.1
    const SETTLE_DURATION = 0.6

    let spinPivot = null
    let floatBaseY = 0
    const FLOAT_AMPLITUDE = 0.045
    const FLOAT_SPEED = 0.55
    let floatBlend = 0

    let metalMaterial = null
    let pedestalMaterial = null
    let neonMaterial = null
    let rootGroup = null

    const loader = new GLTFLoader()
    let disposed = false

    loader.load(emblemUrl, (gltf) => {
      if (disposed) return
      const root = gltf.scene
      rootGroup = root
      // vertical centering computed from the new geometry's actual bounding span
      // (ring+glyph group top ~1.28, pedestal bottom ~-1.49 → midpoint offset +0.1)
      root.position.y = 0.1
      scene.add(root)

      root.traverse((obj) => {
        if (!obj.isMesh) return
        obj.castShadow = false
        obj.receiveShadow = false

        if (obj.name === 'Pedestal_AccentGroove') {
          // separate material instance so this doesn't get swept into the ring's
          // phase-driven emissive — it's a constant, modest accent light
          const clone = Array.isArray(obj.material) ? obj.material.map((m) => m.clone()) : obj.material.clone()
          obj.material = clone
          const c = Array.isArray(clone) ? clone[0] : clone
          c.emissiveIntensity = 0.9
          return
        }

        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((m) => {
          if (m.name === 'M_PremiumGunmetal' && !metalMaterial) {
            metalMaterial = m
            attachMetalShader(m, { arcEnabled: true })
          } else if (m.name === 'M_PedestalMetal' && !pedestalMaterial) {
            pedestalMaterial = m
            attachMetalShader(m, { arcEnabled: false })
          } else if (m.name === 'M_NeonAccent' && !neonMaterial) {
            neonMaterial = m
            neonMaterial.emissiveIntensity = 0
          }
        })
      })

      mixer = new THREE.AnimationMixer(root)
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip)
        action.setLoop(THREE.LoopOnce)
        action.clampWhenFinished = true
        const targetsSpinPivot = clip.tracks.some((t) => t.name.startsWith('Emblem_SpinPivot'))
        if (targetsSpinPivot) {
          spinAction = action
        } else {
          shardActions.push(action)
        }
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

      shardActions.forEach((action) => {
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
      if (spinAction) {
        spinAction.reset()
        spinAction.play()
        spinAction.paused = true // held until the floating-pause phase completes
      }

      if (skipShards) {
        // mobile first-load skip: jump straight past assembly/float/spin into the arc
        if (spinAction) {
          spinAction.time = spinAction.getClip().duration
          spinAction.play()
          spinAction.paused = true
        }
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

      let arcValue = 0
      let idleGlowValue = 0

      if (phase === 'assembling') {
        const allDone = shardActions.every((a) => a._clip && (a.paused || a.time >= a.getClip().duration - 0.001))
        if (allDone) {
          phase = 'floating_pause'
          phaseStart = t
        }
      } else if (phase === 'floating_pause') {
        // glyph floats, ring stays still — matches the "keeps floating, then spins" spec
        const elapsed = t - phaseStart
        if (elapsed >= FLOAT_PAUSE_DURATION) {
          if (spinAction) {
            spinAction.paused = false
            spinAction.play()
          }
          phase = 'spinning'
          phaseStart = t
        }
      } else if (phase === 'spinning') {
        const spinDone = !spinAction || spinAction.paused || spinAction.time >= spinAction.getClip().duration - 0.001
        if (spinDone) {
          phase = 'arcing'
          phaseStart = t
        }
      } else if (phase === 'arcing') {
        const elapsed = t - phaseStart
        const progress = Math.min(elapsed / ARC_DURATION, 1)
        // a few discrete flickers rather than one smooth pulse, reads more like electricity
        arcValue = Math.max(0, Math.sin(progress * Math.PI * 3.5)) * (1 - progress * 0.3)
        if (progress >= 1) {
          phase = 'settling'
          phaseStart = t
        }
      } else if (phase === 'settling') {
        const elapsed = t - phaseStart
        const progress = Math.min(elapsed / SETTLE_DURATION, 1)
        arcValue = (1 - progress) * 0.3
        idleGlowValue = progress
        if (progress >= 1) {
          phase = 'idle'
          phaseStart = t
        }
      } else if (phase === 'idle') {
        idleGlowValue = 1
      }

      if (metalMaterial?.userData.shader) {
        metalMaterial.userData.shader.uniforms.uTime.value = t
        metalMaterial.userData.shader.uniforms.uArc.value = arcValue
      }
      if (neonMaterial) {
        neonMaterial.emissiveIntensity = arcValue * 3.2 + idleGlowValue * 3.0
      }
      outerRing.material.opacity = idleGlowValue * 0.9

      if (spinPivot) {
        // floating starts at the floating_pause phase and continues through every phase after
        const floatActive = phase !== 'assembling' && phase !== 'loading'
        floatBlend = floatActive ? Math.min(floatBlend + dt / FLOAT_PAUSE_DURATION, 1) : 0
        const floatOffset = Math.sin(t * FLOAT_SPEED) * FLOAT_AMPLITUDE * floatBlend
        spinPivot.position.y = floatBaseY + floatOffset
        // bug fix: outerRing was never given a Y position, so it defaulted to world origin
        // instead of the emblem's actual height, causing it to sit low and overlap the
        // pedestal. Track the emblem's true world Y (root offset + pivot + float) every frame.
        if (rootGroup) outerRing.position.y = rootGroup.position.y + spinPivot.position.y
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
