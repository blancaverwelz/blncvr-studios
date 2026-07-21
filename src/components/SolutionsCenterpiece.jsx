import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

const GLOW_COLOR = new THREE.Color('#ffd301')
const SETTLE_LERP = 0.06

// One tuned "posture" per service — never a hue change (palette stays black /
// white / yellow), only how fast the core turns, how tightly the ring sits,
// and how strongly it glows. This is what "the centerpiece evolves with the
// active service" means here.
const POSTURES = [
  { spin: 0.06, ringTilt: 0.28, glow: 0.55, scale: 1.0 }, // Website Design
  { spin: 0.1, ringTilt: 0.16, glow: 0.5, scale: 0.97 }, // Web Development
  { spin: 0.18, ringTilt: 0.42, glow: 0.85, scale: 1.05 }, // 3D Web Experiences
  { spin: 0.14, ringTilt: 0.34, glow: 0.7, scale: 1.02 }, // Motion Design
  { spin: 0.08, ringTilt: 0.22, glow: 0.6, scale: 1.0 }, // Visual Identity
]
const DEFAULT_POSTURE = { spin: 0.07, ringTilt: 0.24, glow: 0.4, scale: 0.96 }

function buildCore() {
  const geo = new THREE.IcosahedronGeometry(1.15, 1)
  const mat = new THREE.MeshStandardMaterial({
    color: '#14161c',
    metalness: 0.82,
    roughness: 0.38,
    envMapIntensity: 1.15,
    flatShading: true,
  })
  const mesh = new THREE.Mesh(geo, mat)

  const edges = new THREE.EdgesGeometry(geo)
  const lineMat = new THREE.LineBasicMaterial({ color: GLOW_COLOR, transparent: true, opacity: 0.35 })
  const wire = new THREE.LineSegments(edges, lineMat)
  mesh.add(wire)

  return mesh
}

function buildRing() {
  const geo = new THREE.TorusGeometry(1.85, 0.012, 8, 128)
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: GLOW_COLOR }, uIntensity: { value: 0.4 } },
    vertexShader: `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uIntensity;
      void main() {
        gl_FragColor = vec4(uColor, uIntensity);
      }
    `,
  })
  const pivot = new THREE.Group()
  const ring = new THREE.Mesh(geo, mat)
  pivot.add(ring)
  return { pivot, ring }
}

function buildDust(count = 46) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = 2.3 + Math.random() * 1.3
    const theta = Math.random() * Math.PI * 2
    const y = -1.4 + Math.random() * 2.8
    positions[i * 3] = Math.cos(theta) * r
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = Math.sin(theta) * r
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({
    color: '#fff4bf',
    size: 0.018,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  })
  return new THREE.Points(geo, mat)
}

const SolutionsCenterpiece = forwardRef(function SolutionsCenterpiece(_, ref) {
  const mountRef = useRef(null)
  const wrapRef = useRef(null)
  const stateRef = useRef({ target: DEFAULT_POSTURE, current: { ...DEFAULT_POSTURE } })

  useImperativeHandle(ref, () => ({
    setActive(index) {
      stateRef.current.target = POSTURES[index] ?? DEFAULT_POSTURE
    },
  }))

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
    camera.position.set(0, 0.2, 7.2)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(3, 4, 5)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xfff0c2, 1.0)
    rim.position.set(-4, -1, -3)
    scene.add(rim)

    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.05).texture

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.3, 0.82)
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())

    const core = buildCore()
    scene.add(core)

    const { pivot: ringPivot, ring } = buildRing()
    ringPivot.rotation.x = Math.PI / 2.4
    scene.add(ringPivot)

    const dust = buildDust()
    scene.add(dust)

    let isVisible = !reducedMotion
    let rafId
    let disposed = false
    const clock = new THREE.Clock()

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false
      },
      { threshold: 0.15 }
    )
    if (wrapRef.current) observer.observe(wrapRef.current)

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

    function renderStatic() {
      const s = stateRef.current.current
      core.rotation.y = 0.5
      core.rotation.x = 0.18
      core.scale.setScalar(s.scale)
      ringPivot.rotation.z = s.ringTilt
      ring.material.uniforms.uIntensity.value = s.glow
      composer.render()
    }

    function animate() {
      rafId = requestAnimationFrame(animate)
      if (!isVisible) return

      const t = clock.getElapsedTime()
      const s = stateRef.current.current
      const target = stateRef.current.target
      s.spin += (target.spin - s.spin) * SETTLE_LERP
      s.ringTilt += (target.ringTilt - s.ringTilt) * SETTLE_LERP
      s.glow += (target.glow - s.glow) * SETTLE_LERP
      s.scale += (target.scale - s.scale) * SETTLE_LERP

      core.rotation.y = t * s.spin
      core.rotation.x = 0.18 + Math.sin(t * 0.18) * 0.05
      core.scale.setScalar(s.scale)

      ringPivot.rotation.z = s.ringTilt + Math.sin(t * 0.1) * 0.03
      ringPivot.rotation.y = t * s.spin * 0.6

      ring.material.uniforms.uIntensity.value = s.glow * (0.85 + 0.15 * Math.sin(t * 0.6))
      dust.rotation.y = t * 0.015

      composer.render()
    }

    if (reducedMotion) {
      renderStatic()
    } else {
      animate()
    }

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      observer.disconnect()
      resizeObserver.disconnect()
      pmremGenerator.dispose()
      scene.environment?.dispose()
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
      void disposed
    }
  }, [])

  return (
    <div ref={wrapRef} className="relative aspect-square w-full">
      <div className="pointer-events-none absolute inset-8 rounded-full bg-[#ffd301]/10 blur-3xl" />
      <div ref={mountRef} className="relative h-full w-full" />
    </div>
  )
})

export default SolutionsCenterpiece
