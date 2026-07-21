import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import glyphContour from '../assets/emblem/glyph_contour.json'
import normalMapUrl from '../assets/emblem/emblem_normal_map.png?url'

const GLOW_COLOR = new THREE.Color('#FFD301')
const ARC_COLOR = new THREE.Color('#FFD301').lerp(new THREE.Color('#FFFFFF'), 0.35)

// Ring geometry, in the same normalized units glyph_contour.json is in (glyph's
// longest dimension is 2.0, max radial extent from center is ~1.03). Generous
// clearance so the ring never approaches the glyph as it tumbles on rotation.y.
const RING_INNER_RADIUS = 1.4
const RING_OUTER_RADIUS = 1.85
const RING_THICKNESS = 0.12
const GLYPH_THICKNESS = 0.12

// Shared planar-projection half-extent used to derive UVs for both meshes, so the
// single normal map (which covers ring + glyph in one image) lines up across both
// without per-mesh offset fiddling.
const UV_HALF_EXTENT = RING_OUTER_RADIUS + 0.1

const SPIN_TURNS = 2
const SPIN_DURATION = 2.1
const CHARGE_DURATION = 1.3
const GLOW_FADE_DURATION = 0.9

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3)
}

// Maps object-space (x, y) straight into UV space using one shared transform, so
// ring and glyph geometries (built in the same centered coordinate system) sample
// the normal map consistently.
function applyPlanarUV(geometry) {
  const pos = geometry.attributes.position
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / (UV_HALF_EXTENT * 2) + 0.5
    uv[i * 2 + 1] = pos.getY(i) / (UV_HALF_EXTENT * 2) + 0.5
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
}

function buildGlyphGeometry() {
  const points = glyphContour.points
  const shape = new THREE.Shape()
  shape.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i][0], points[i][1])
  }
  shape.closePath()

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: GLYPH_THICKNESS,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
    curveSegments: 1,
  })
  geo.center()
  applyPlanarUV(geo)
  return geo
}

function buildRingGeometry() {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, RING_OUTER_RADIUS, 0, Math.PI * 2, false)
  const hole = new THREE.Path()
  hole.absarc(0, 0, RING_INNER_RADIUS, 0, Math.PI * 2, true)
  shape.holes.push(hole)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: RING_THICKNESS,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 64,
  })
  geo.center()
  applyPlanarUV(geo)
  return geo
}

function buildMetalMaterial(normalMap) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0a0c11'),
    metalness: 0.9,
    roughness: 0.35,
    normalMap,
  })
}

// Angle-based traveling pulse on the ring's own material, independent of UV layout.
// uIntensity fades the whole glow channel in during the reveal phase; the pulse and
// a soft breathing base run continuously once intensity is up.
function attachRingGlow(material) {
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
         float ang = atan(vObjPos.y, vObjPos.x);
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

// Progressively-revealed, flickering emissive tube tracing the ring's circumference —
// the "electrical discharge climbing the ring" read for the charge phase.
function buildChargeArc() {
  const radius = (RING_INNER_RADIUS + RING_OUTER_RADIUS) / 2
  const segments = 64
  const curvePoints = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    curvePoints.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, RING_THICKNESS * 0.5 + 0.02))
  }
  const curve = new THREE.CatmullRomCurve3(curvePoints)
  const geo = new THREE.TubeGeometry(curve, 128, 0.025, 6, false)
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
        float flicker = hash(floor(uTime * 24.0) + floor(vUv.x * 30.0));
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

// Continuous ambient debris — small angular low-poly rocks, not soft round points.
// Runs independent of the phase state machine, idle and settled alike.
function buildAmbientDebris(count = 70) {
  const geo = new THREE.TetrahedronGeometry(0.035)
  const mat = new THREE.MeshStandardMaterial({ color: '#8a8a92', roughness: 0.8, metalness: 0.1 })
  const mesh = new THREE.InstancedMesh(geo, mat, count)
  const seeds = []
  const dummy = new THREE.Object3D()
  for (let i = 0; i < count; i++) {
    const r = 2.2 + Math.random() * 1.6
    const theta = Math.random() * Math.PI * 2
    const y = -1.6 + Math.random() * 3.2
    seeds.push({
      baseX: Math.cos(theta) * r,
      baseY: y,
      baseZ: Math.sin(theta) * r,
      seed: Math.random() * 100,
      rotSpeed: 0.3 + Math.random() * 0.6,
    })
    dummy.position.set(Math.cos(theta) * r, y, Math.sin(theta) * r)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.userData.seeds = seeds
  return mesh
}

function updateAmbientDebris(mesh, t) {
  const dummy = new THREE.Object3D()
  const seeds = mesh.userData.seeds
  for (let i = 0; i < seeds.length; i++) {
    const s = seeds[i]
    dummy.position.set(
      s.baseX + Math.sin(t * 0.15 + s.seed) * 0.25,
      s.baseY + Math.sin(t * 0.1 + s.seed * 1.6) * 0.2,
      s.baseZ + Math.cos(t * 0.13 + s.seed * 0.7) * 0.25
    )
    dummy.rotation.set(t * s.rotSpeed, t * s.rotSpeed * 0.7, s.seed)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
}

// Short-lived sparks tied specifically to the charge phase, scattering outward from
// the ring's circumference. Separate pool/timing from the ambient debris above.
function buildSparks(count = 60) {
  const positions = new Float32Array(count * 3)
  const angles = new Float32Array(count)
  const seeds = new Float32Array(count)
  const radius = (RING_INNER_RADIUS + RING_OUTER_RADIUS) / 2
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    angles[i] = a
    seeds[i] = Math.random()
    positions[i * 3] = Math.cos(a) * radius
    positions[i * 3 + 1] = Math.sin(a) * radius
    positions[i * 3 + 2] = RING_THICKNESS * 0.5
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uElapsed: { value: 0 },
      uActive: { value: 0 },
      uColor: { value: ARC_COLOR },
      uRadius: { value: radius },
    },
    vertexShader: `
      attribute float aAngle;
      attribute float aSeed;
      uniform float uElapsed;
      uniform float uRadius;
      varying float vAlpha;
      void main() {
        float life = fract(uElapsed * 0.6 + aSeed);
        float outward = life * (0.6 + aSeed * 0.8);
        vec3 p = vec3(cos(aAngle) * (uRadius + outward), sin(aAngle) * (uRadius + outward), position.z);
        vAlpha = 1.0 - smoothstep(0.0, 1.0, life);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (6.0 / -mv.z) * (0.5 + 0.5 * aSeed);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform float uActive;
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float a = smoothstep(0.5, 0.0, d) * vAlpha * uActive;
        gl_FragColor = vec4(uColor, a);
      }
    `,
  })
  return new THREE.Points(geo, mat)
}

export default function EmblemScene() {
  const mountRef = useRef(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0.3, 9.5)
    camera.lookAt(0, -0.3, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(3, 4, 5)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x88aaff, 0.6)
    rim.position.set(-4, -2, -3)
    scene.add(rim)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.4, 0.15)
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())

    const textureLoader = new THREE.TextureLoader()
    const normalMap = textureLoader.load(normalMapUrl)
    normalMap.colorSpace = THREE.NoColorSpace

    const glyphGeo = buildGlyphGeometry()
    const glyphMat = buildMetalMaterial(normalMap)
    const glyphMesh = new THREE.Mesh(glyphGeo, glyphMat)
    scene.add(glyphMesh)

    const ringGeo = buildRingGeometry()
    const ringMat = buildMetalMaterial(normalMap)
    attachRingGlow(ringMat)
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    const ringPivot = new THREE.Group()
    ringPivot.add(ringMesh)
    scene.add(ringPivot)

    const chargeArc = buildChargeArc()
    ringPivot.add(chargeArc)

    const debris = buildAmbientDebris()
    scene.add(debris)

    const sparks = buildSparks()
    ringPivot.add(sparks)

    let phase = reducedMotion ? 'settled' : 'idle_static'
    let phaseStart = 0
    const clock = new THREE.Clock()

    function applySettledStatic() {
      ringPivot.rotation.y = 0
      chargeArc.material.opacity = 0
      sparks.material.uniforms.uActive.value = 0
      if (ringMat.userData.shader) {
        ringMat.userData.shader.uniforms.uIntensity.value = 1
      }
      ringMat.emissiveIntensity = 1
    }

    function resetToIdle() {
      phase = 'idle_static'
      phaseStart = clock.getElapsedTime()
      ringPivot.rotation.y = 0
      chargeArc.material.uniforms.uProgress.value = 0
      chargeArc.material.opacity = 1
      sparks.material.uniforms.uActive.value = 0
      if (ringMat.userData.shader) {
        ringMat.userData.shader.uniforms.uIntensity.value = 0
      }
      ringMat.emissiveIntensity = 0
    }

    function beginSequence() {
      phase = 'spinning'
      phaseStart = clock.getElapsedTime()
    }

    if (reducedMotion) {
      applySettledStatic()
    } else {
      resetToIdle()
    }

    let observer = null
    if (!reducedMotion) {
      observer = new IntersectionObserver(
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
    }

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
      updateAmbientDebris(debris, t)

      if (phase === 'spinning') {
        const elapsed = t - phaseStart
        const progress = Math.min(elapsed / SPIN_DURATION, 1)
        const eased = easeOutCubic(progress)
        ringPivot.rotation.y = eased * Math.PI * 2 * SPIN_TURNS
        if (progress >= 1) {
          ringPivot.rotation.y = 0
          phase = 'charging'
          phaseStart = t
          sparks.material.uniforms.uActive.value = 1
        }
      } else if (phase === 'charging') {
        const elapsed = t - phaseStart
        const progress = Math.min(elapsed / CHARGE_DURATION, 1)
        chargeArc.material.uniforms.uProgress.value = progress
        chargeArc.material.uniforms.uTime.value = t
        sparks.material.uniforms.uElapsed.value = elapsed
        if (progress >= 1) {
          phase = 'glow_reveal'
          phaseStart = t
        }
      } else if (phase === 'glow_reveal') {
        const elapsed = t - phaseStart
        const progress = Math.min(elapsed / GLOW_FADE_DURATION, 1)
        chargeArc.material.uniforms.uProgress.value = 1
        chargeArc.material.uniforms.uTime.value = t
        chargeArc.material.opacity = 1 - progress
        sparks.material.uniforms.uActive.value = 1 - progress
        if (ringMat.userData.shader) {
          ringMat.userData.shader.uniforms.uIntensity.value = progress
          ringMat.userData.shader.uniforms.uTime.value = t
        }
        if (progress >= 1) {
          phase = 'settled'
          phaseStart = t
          sparks.material.uniforms.uActive.value = 0
        }
      } else if (phase === 'settled') {
        if (ringMat.userData.shader) {
          ringMat.userData.shader.uniforms.uIntensity.value = 1
          ringMat.userData.shader.uniforms.uTime.value = t
        }
      }

      composer.render()
    }
    animate()

    return () => {
      cancelAnimationFrame(rafId)
      observer?.disconnect()
      resizeObserver.disconnect()
      renderer.dispose()
      composer.dispose()
      normalMap.dispose()
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
