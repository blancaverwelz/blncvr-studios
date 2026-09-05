import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

const DOT_COLOR = new THREE.Color('#FFD301')
const AURORA_COLOR = new THREE.Color('#FFD301')

// Sparse everywhere, fewer on small viewports — "if it's noticeable as
// particles, it's too much." These are deliberately low; verified in
// isolation (count/bounds/no-NaN) before wiring into the renderer.
function pointCountFor(width) {
  if (width < 640) return 30
  if (width < 1024) return 50
  return 70
}

// Pure position/drift-parameter builder, kept separate from any three.js
// object so it can be sanity-checked on its own (count, bounds, NaNs)
// independent of whether anything renders correctly.
function buildPointField(count, halfW, halfH) {
  const positions = new Float32Array(count * 3)
  const drift = []
  for (let i = 0; i < count; i++) {
    const x = (Math.random() * 2 - 1) * halfW
    const y = (Math.random() * 2 - 1) * halfH
    const z = (Math.random() * 2 - 1) * 40
    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
    drift.push({
      baseX: x,
      baseY: y,
      ampX: 6 + Math.random() * 10,
      ampY: 6 + Math.random() * 10,
      speedX: 0.05 + Math.random() * 0.08,
      speedY: 0.04 + Math.random() * 0.07,
      phase: Math.random() * Math.PI * 2,
    })
  }
  return { positions, drift }
}

// Aurora band configuration, per viewport. Each band is a soft horizontal
// glow whose centerline drifts slowly with a single sine term (gentle flow,
// not a wave simulation). `base`/`amp` are in the shader's -1..1 local space
// (0 = vertical center of the divider). Mobile intentionally uses only 2
// bands with tighter widths/positions rather than a shrunk copy of the
// desktop composition (per kickoff).
function buildAuroraProfile(width) {
  const isMobile = width < 640
  if (isMobile) {
    return {
      planeHeightMultiplier: 1.6,
      bands: [
        { base: 0.22, amp: 0.09, freq: 1.2, speed: 0.04, phase: 0.6, width: 0.16, glow: 0.3 },
        { base: -0.22, amp: 0.1, freq: 1.6, speed: -0.035, phase: 2.3, width: 0.15, glow: 0.24 },
        { base: 0, amp: 0, freq: 0, speed: 0, phase: 0, width: 1, glow: 0 },
      ],
    }
  }
  return {
    planeHeightMultiplier: 1.7,
    bands: [
      { base: 0.3, amp: 0.1, freq: 1.0, speed: 0.035, phase: 0.4, width: 0.15, glow: 0.32 },
      { base: -0.05, amp: 0.12, freq: 0.7, speed: -0.03, phase: 2.0, width: 0.16, glow: 0.26 },
      { base: -0.38, amp: 0.09, freq: 1.3, speed: 0.025, phase: 4.1, width: 0.13, glow: 0.22 },
    ],
  }
}

// Flattened uniform arrays for the shader (fixed size 3 — an unused band on
// mobile simply has glow = 0 and contributes nothing).
function bandUniforms(bands) {
  const pick = (key) => bands.map((b) => b[key])
  return {
    base: pick('base'),
    amp: pick('amp'),
    freq: pick('freq'),
    speed: pick('speed'),
    phase: pick('phase'),
    width: pick('width'),
    glow: pick('glow'),
  }
}

const AURORA_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Three soft glow bands (a fourth "unused" slot would just be more of the
// same) whose centerlines drift with one gentle sine term each — restrained
// premium flow, not a wave simulation. A faint shimmer breaks up perfect
// uniformity, and edge falloffs on both axes fade the whole effect cleanly
// into the surrounding black rather than ending in a hard rectangle.
const AURORA_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uBandBase[3];
  uniform float uBandAmp[3];
  uniform float uBandFreq[3];
  uniform float uBandSpeed[3];
  uniform float uBandPhase[3];
  uniform float uBandWidth[3];
  uniform float uBandGlow[3];
  varying vec2 vUv;

  void main() {
    float x = vUv.x * 2.0 - 1.0;
    float y = vUv.y * 2.0 - 1.0;

    float intensity = 0.0;
    for (int i = 0; i < 3; i++) {
      float centerY = uBandBase[i] + uBandAmp[i] * sin(x * uBandFreq[i] + uTime * uBandSpeed[i] + uBandPhase[i]);
      float d = y - centerY;
      float w = uBandWidth[i];
      intensity += exp(-(d * d) / (w * w)) * uBandGlow[i];
    }

    float shimmer = 1.0 + 0.04 * sin(x * 8.0 + y * 5.0 + uTime * 0.08);
    intensity *= shimmer;

    float edgeX = 1.0 - smoothstep(0.6, 1.0, abs(x));
    float edgeY = 1.0 - smoothstep(0.45, 1.0, abs(y));

    float alpha = clamp(intensity, 0.0, 1.0) * edgeX * edgeY;
    gl_FragColor = vec4(uColor * intensity, alpha);
  }
`

/**
 * Pure background atmosphere for the contact section — a sparse, slow-drifting
 * Points field sitting behind both columns, plus (below the services hint) a
 * compact aurora-light divider. No focal object, no camera movement, no
 * interactivity. Mirrors EmblemScene's composer/bloom pattern but with a much
 * lighter scene graph (no glyph/ring geometry, no phase state machine) since
 * there's no shared geometry or state between them.
 */
export default function ContactAmbient({ terrainStageRef } = {}) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)
    camera.position.z = 100

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    // Deliberately gentle bloom — this is atmosphere, not a centerpiece glow.
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.3, 0.4, 0.4)
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())

    let geometry = null
    let points = null
    let drift = []

    // Compact aurora divider — sits in the same reserved stage element the
    // old terrain used, behind the particle field (renderOrder 0 vs 1).
    // Additive blending is a material-level property of this one mesh, not
    // a change to the shared bloom pass, so the particles' bloom look is
    // unaffected.
    let auroraGeometry = null
    let auroraMesh = null
    const auroraMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: AURORA_COLOR },
        uBandBase: { value: [0, 0, 0] },
        uBandAmp: { value: [0, 0, 0] },
        uBandFreq: { value: [0, 0, 0] },
        uBandSpeed: { value: [0, 0, 0] },
        uBandPhase: { value: [0, 0, 0] },
        uBandWidth: { value: [1, 1, 1] },
        uBandGlow: { value: [0, 0, 0] },
      },
      vertexShader: AURORA_VERTEX_SHADER,
      fragmentShader: AURORA_FRAGMENT_SHADER,
    })

    // The stage element reserves the vertical room this divider is meant to
    // occupy. The plane is built taller than that reserved box (see
    // `planeHeightMultiplier`) purely so the shader's own top/bottom edge
    // falloff has room to fade before the plane's hard edge, then centered
    // on the box the same way the previous terrain was.
    function buildAurora(width, clientHeight) {
      if (auroraMesh) {
        scene.remove(auroraMesh)
        auroraGeometry.dispose()
      }

      const stageEl = terrainStageRef && terrainStageRef.current
      const stageHeight = stageEl ? stageEl.getBoundingClientRect().height : 200

      const profile = buildAuroraProfile(width)
      const uniforms = bandUniforms(profile.bands)
      auroraMaterial.uniforms.uBandBase.value = uniforms.base
      auroraMaterial.uniforms.uBandAmp.value = uniforms.amp
      auroraMaterial.uniforms.uBandFreq.value = uniforms.freq
      auroraMaterial.uniforms.uBandSpeed.value = uniforms.speed
      auroraMaterial.uniforms.uBandPhase.value = uniforms.phase
      auroraMaterial.uniforms.uBandWidth.value = uniforms.width
      auroraMaterial.uniforms.uBandGlow.value = uniforms.glow

      const planeHeight = stageHeight * profile.planeHeightMultiplier
      auroraGeometry = new THREE.PlaneGeometry(width, planeHeight)
      auroraMesh = new THREE.Mesh(auroraGeometry, auroraMaterial)
      auroraMesh.renderOrder = 0

      let centerY = 0
      if (stageEl) {
        const mountRect = mount.getBoundingClientRect()
        const stageRect = stageEl.getBoundingClientRect()
        const stageCenterViewport = (stageRect.top + stageRect.bottom) / 2
        centerY = clientHeight / 2 - (stageCenterViewport - mountRect.top)
      }

      auroraMesh.position.set(0, centerY, -20)
      scene.add(auroraMesh)
    }

    function buildField(width, height) {
      if (points) {
        scene.remove(points)
        geometry.dispose()
        points.material.dispose()
      }
      const count = pointCountFor(width)
      const field = buildPointField(count, width / 2, height / 2)
      drift = field.drift
      geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(field.positions, 3))
      const material = new THREE.PointsMaterial({
        color: DOT_COLOR,
        size: 2.2,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      })
      points = new THREE.Points(geometry, material)
      points.renderOrder = 1
      scene.add(points)
    }

    function handleResize() {
      const { clientWidth, clientHeight } = mount
      if (!clientWidth || !clientHeight) return
      camera.left = -clientWidth / 2
      camera.right = clientWidth / 2
      camera.top = clientHeight / 2
      camera.bottom = -clientHeight / 2
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight)
      composer.setSize(clientWidth, clientHeight)
      // Rebuild so density/spread matches the new viewport rather than
      // stretching a fixed point set (this is also what lets small
      // viewports get fewer points instead of the same 70 crowded in).
      buildField(clientWidth, clientHeight)
      buildAurora(clientWidth, clientHeight)
      if (reducedMotion) composer.render()
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(mount)
    handleResize()

    let rafId = null
    const clock = new THREE.Clock()

    function animate() {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const posAttr = geometry.attributes.position
      for (let i = 0; i < drift.length; i++) {
        const d = drift[i]
        posAttr.setX(i, d.baseX + Math.sin(t * d.speedX + d.phase) * d.ampX)
        posAttr.setY(i, d.baseY + Math.cos(t * d.speedY + d.phase) * d.ampY)
      }
      posAttr.needsUpdate = true

      auroraMaterial.uniforms.uTime.value = t

      composer.render()
    }

    // Reduced motion: freeze drift and aurora flow entirely, rendering a
    // static frame once per resize, rather than running a continuous rAF
    // loop for nothing.
    if (!reducedMotion) {
      animate()
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      renderer.dispose()
      composer.dispose()
      if (geometry) geometry.dispose()
      if (points) points.material.dispose()
      if (auroraGeometry) auroraGeometry.dispose()
      auroraMaterial.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    />
  )
}
