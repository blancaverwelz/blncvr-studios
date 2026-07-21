import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

const DOT_COLOR = new THREE.Color('#FFD301')

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

/**
 * Pure background atmosphere for the contact section — a sparse, slow-drifting
 * Points field sitting behind both columns. No focal object, no camera
 * movement, no interactivity. Mirrors EmblemScene's composer/bloom pattern
 * but with a much lighter scene graph (no glyph/ring geometry, no phase
 * state machine) since there's no shared geometry or state between them.
 */
export default function ContactAmbient() {
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
      composer.render()
    }

    // Reduced motion: freeze drift entirely and render the static field once
    // per resize, rather than running a continuous rAF loop for nothing.
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
