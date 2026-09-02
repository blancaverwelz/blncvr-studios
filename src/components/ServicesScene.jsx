import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/* ------------------------------------------------------------------ */
/* "What I Do" 3D constellation scene.                                 */
/*                                                                     */
/* Vanilla Three.js (no R3F), matching the pattern in EmblemScene.jsx: */
/* a single mount-time useEffect drives scene setup, an internal RAF   */
/* loop, and full dispose-on-unmount cleanup. Desktop labels and the   */
/* mobile carousel are real React-rendered buttons; their per-frame    */
/* screen position is written directly to DOM refs inside the RAF      */
/* loop rather than through React state, so 60fps label tracking       */
/* doesn't trigger 60 renders/sec.                                     */
/*                                                                     */
/* The scene pauses its own RAF loop via IntersectionObserver when     */
/* scrolled out of view — this page already runs EmblemScene's WebGL   */
/* context above the fold, so a second context left running off-screen */
/* is the most likely way this section could tank frame rate.          */
/* ------------------------------------------------------------------ */

const MOBILE_BREAKPOINT = 680

// Loose constellation layout, one slot per service, in the same order as
// services.js. Kept separate from service content so the data file only
// gains the optional `shape` field.
const SCATTER_POSITIONS = [
  new THREE.Vector3(-3.9, 1.5, 0.6),
  new THREE.Vector3(-1.6, -2.2, -1.5),
  new THREE.Vector3(1.8, 2.3, 0.3),
  new THREE.Vector3(3.9, -1.3, -1.0),
  new THREE.Vector3(0.3, -0.3, 2.1),
]

// Accent per slot, alternating between the two brand neons — mirrors the
// approved mockup's assignment. Lives here (not in services.js) since the
// kickoff scopes the data file to the `shape` field only.
const ACCENT_COLORS = [0xffd301, 0xffd301, 0x9e1a0f, 0x9e1a0f, 0xffd301]

function buildShape(shapeType, color) {
  const wrapper = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.22,
    metalness: 0.35,
    roughness: 0.25,
    flatShading: true,
    transparent: true,
    opacity: 0.92,
  })

  if (shapeType === 'gem') {
    const geo = new THREE.IcosahedronGeometry(0.6, 0)
    const mesh = new THREE.Mesh(geo, mat)
    const edges = new THREE.EdgesGeometry(geo)
    mesh.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })))
    wrapper.add(mesh)
  } else if (shapeType === 'cube') {
    const geo = new THREE.BoxGeometry(0.82, 0.82, 0.82)
    const mesh = new THREE.Mesh(geo, mat)
    const edges = new THREE.EdgesGeometry(geo)
    mesh.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })))
    wrapper.add(mesh)
  } else if (shapeType === 'mark') {
    // Abstract logo mark: a faceted triangular badge (equilateral, apex up,
    // circumradius 0.62, extruded 0.16 with a slight bevel for a metal-mark
    // look consistent with the gem/cube facets).
    const r = 0.62
    const triShape = new THREE.Shape()
    triShape.moveTo(0, r)
    triShape.lineTo(-r * 0.866, -r * 0.5)
    triShape.lineTo(r * 0.866, -r * 0.5)
    triShape.closePath()
    const geo = new THREE.ExtrudeGeometry(triShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    })
    geo.center()
    const mesh = new THREE.Mesh(geo, mat)
    const edges = new THREE.EdgesGeometry(geo)
    mesh.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 })))
    wrapper.add(mesh)
  } else if (shapeType === 'ribbon') {
    // Wireframe ribbon strip: a flat plane (length 1.15 x width 0.34, 28
    // length segments) twisted into a helix — angle(x) = (x / length) * PI
    // * 1.5 turns, applied to each vertex's (y, z) via rotation about the
    // strip's long axis. Rendered wireframe so the twist itself reads as
    // the "ribbon", not a solid surface.
    const length = 1.15
    const width = 0.34
    const twists = 1.5
    const geo = new THREE.PlaneGeometry(length, width, 28, 1)
    const posAttr = geo.attributes.position
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i)
      const y = posAttr.getY(i)
      const angle = (x / length) * Math.PI * twists
      posAttr.setY(i, y * Math.cos(angle))
      posAttr.setZ(i, y * Math.sin(angle))
    }
    posAttr.needsUpdate = true
    geo.computeVertexNormals()
    const wireMat = mat.clone()
    wireMat.wireframe = true
    wireMat.emissiveIntensity = 0.45
    wireMat.opacity = 0.85
    wrapper.add(new THREE.Mesh(geo, wireMat))
  } else if (shapeType === 'particles') {
    const count = 140
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 0.55 * Math.cbrt(Math.random())
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th)
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th)
      pos[i * 3 + 2] = r * Math.cos(ph)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const pMat = new THREE.PointsMaterial({ color, size: 0.045, transparent: true, opacity: 0.9 })
    wrapper.add(new THREE.Points(geo, pMat))
  }

  return wrapper
}

export default function ServicesScene({ services }) {
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const labelRefs = useRef([])
  const dotRefs = useRef([])
  const mNumRef = useRef(null)
  const mTitleRef = useRef(null)

  const initialIsMobile = typeof window !== 'undefined'
    && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches

  const [activeIndex, setActiveIndex] = useState(-1)
  const [mobileIndex, setMobileIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(initialIsMobile)
  const [hint, setHint] = useState(
    initialIsMobile
      ? 'Swipe to browse · tap the shape to see details'
      : 'Click a node to focus · move your cursor to explore the field'
  )

  // Mirrors of state for use inside the RAF loop's closures without going
  // through React re-renders or stale-closure bugs.
  const activeIndexRef = useRef(activeIndex)
  const mobileIndexRef = useRef(mobileIndex)
  const isMobileRef = useRef(isMobile)
  useEffect(() => { activeIndexRef.current = activeIndex }, [activeIndex])
  useEffect(() => { mobileIndexRef.current = mobileIndex }, [mobileIndex])
  useEffect(() => { isMobileRef.current = isMobile }, [isMobile])

  // Stable callback refs so the mount-time effect (which sets up DOM
  // listeners once) always calls the latest version of these handlers.
  const setActiveRef = useRef(() => {})
  const goMobileRef = useRef(() => {})

  setActiveRef.current = (i) => {
    setActiveIndex((prev) => (prev === i ? -1 : i))
  }
  goMobileRef.current = (i) => {
    setMobileIndex((i + services.length) % services.length)
    setActiveIndex(-1)
  }

  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!stage || !canvas) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)

    let W = stage.clientWidth || 1
    let H = stage.clientHeight || 1

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x05060a, 0.045)

    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 100)
    camera.position.set(0, 0, 9)

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)

    scene.add(new THREE.AmbientLight(0x8899ff, 0.5))
    const key = new THREE.PointLight(0xffffff, 1.1, 20)
    key.position.set(3, 4, 6)
    scene.add(key)
    const rim = new THREE.PointLight(0xffd301, 0.8, 20)
    rim.position.set(-4, -2, 3)
    scene.add(rim)

    const group = new THREE.Group()
    scene.add(group)

    const shapes = services.map((svc, i) => {
      const wrapper = buildShape(svc.shape, ACCENT_COLORS[i % ACCENT_COLORS.length])
      wrapper.position.copy(SCATTER_POSITIONS[i % SCATTER_POSITIONS.length])
      wrapper.userData.serviceIndex = i
      group.add(wrapper)
      const mats = []
      wrapper.traverse((obj) => { if (obj.material) mats.push(obj.material) })
      return {
        wrapper,
        mats,
        basePos: wrapper.position.clone(),
        spin: 0.15 + Math.random() * 0.15,
        offset: Math.random() * Math.PI * 2,
        shapeType: svc.shape,
      }
    })

    // Ambient dust.
    const particleCount = 200
    const pGeo = new THREE.BufferGeometry()
    const pPos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 14
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const dustMat = new THREE.PointsMaterial({ color: 0xffd301, size: 0.02, transparent: true, opacity: 0.3 })
    const dust = new THREE.Points(pGeo, dustMat)
    scene.add(dust)

    let camTarget = new THREE.Vector3(0, 0, 9)
    let camLookAt = new THREE.Vector3(0, 0, 0)

    function applyCameraForState() {
      const mobile = isMobileRef.current
      const active = activeIndexRef.current
      if (active === -1) {
        if (!mobile) { camTarget.set(0, 0, 9); camLookAt.set(0, 0, 0) }
        else { camTarget.set(0, 0, 4.2); camLookAt.set(0, 0, 0) }
      } else if (!mobile) {
        const p = shapes[active].basePos
        camTarget.set(p.x * 0.4, p.y * 0.4 + 0.6, p.z + 3.6)
        camLookAt.copy(p)
      } else {
        camTarget.set(0, 0.3, 3.1)
        camLookAt.set(0, 0, 0)
      }
    }

    function applyMode() {
      const mobile = mq.matches
      isMobileRef.current = mobile
      setIsMobile(mobile)
      if (mobile) {
        setHint('Swipe to browse · tap the shape to see details')
        canvas.style.cursor = 'default'
      } else {
        setHint('Click a node to focus · move your cursor to explore the field')
      }
      setActiveIndex(-1)
      applyCameraForState()
    }

    mq.addEventListener('change', applyMode)
    applyMode()

    // Mouse parallax (desktop only); also raycasts on move to toggle the
    // canvas cursor to 'pointer' when hovering a clickable shape.
    const raycaster = new THREE.Raycaster()
    const hoverNdc = new THREE.Vector2()
    let mouseX = 0
    let mouseY = 0
    function handleMouseMove(e) {
      if (isMobileRef.current) return
      const rect = stage.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1

      const canvasRect = canvas.getBoundingClientRect()
      hoverNdc.x = ((e.clientX - canvasRect.left) / canvasRect.width) * 2 - 1
      hoverNdc.y = -((e.clientY - canvasRect.top) / canvasRect.height) * 2 + 1
      raycaster.setFromCamera(hoverNdc, camera)
      const hovering = raycaster.intersectObject(group, true).length > 0
      canvas.style.cursor = hovering ? 'pointer' : 'default'
    }
    stage.addEventListener('mousemove', handleMouseMove)

    function handleMouseLeave() {
      canvas.style.cursor = 'default'
    }
    stage.addEventListener('mouseleave', handleMouseLeave)

    // Tap current mobile shape to open its panel; on desktop, raycast to
    // find which shape (if any) was clicked and activate it the same way
    // its label does.
    const pointerNdc = new THREE.Vector2()
    function handleCanvasClick(e) {
      if (isMobileRef.current) {
        setActiveRef.current(mobileIndexRef.current)
        return
      }
      const rect = canvas.getBoundingClientRect()
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointerNdc, camera)
      const hits = raycaster.intersectObject(group, true)
      if (hits.length === 0) return
      let obj = hits[0].object
      while (obj && obj.userData.serviceIndex === undefined) obj = obj.parent
      if (obj) setActiveRef.current(obj.userData.serviceIndex)
    }
    canvas.addEventListener('click', handleCanvasClick)

    // Swipe.
    let touchStartX = null
    function handleTouchStart(e) {
      if (isMobileRef.current) touchStartX = e.touches[0].clientX
    }
    function handleTouchEnd(e) {
      if (!isMobileRef.current || touchStartX === null) return
      const dx = e.changedTouches[0].clientX - touchStartX
      if (Math.abs(dx) > 40) goMobileRef.current(mobileIndexRef.current + (dx < 0 ? 1 : -1))
      touchStartX = null
    }
    stage.addEventListener('touchstart', handleTouchStart, { passive: true })
    stage.addEventListener('touchend', handleTouchEnd, { passive: true })

    function handleKeyDown(e) {
      if (e.key === 'Escape') setActiveRef.current(-1)
    }
    document.addEventListener('keydown', handleKeyDown)

    const vec = new THREE.Vector3()
    function updateLabelPositions() {
      shapes.forEach((s, i) => {
        const el = labelRefs.current[i]
        if (!el) return
        vec.copy(s.wrapper.position)
        vec.project(camera)
        const x = (vec.x * 0.5 + 0.5) * W
        const y = (-vec.y * 0.5 + 0.5) * H - 34
        const scale = THREE.MathUtils.clamp(1 - vec.z * 0.3, 0.65, 1.1)
        el.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px) scale(${scale})`
      })
    }

    const clock = new THREE.Clock()
    let rafId = null

    function tick() {
      rafId = requestAnimationFrame(tick)
      const t = clock.getElapsedTime()
      const mobile = isMobileRef.current
      const active = activeIndexRef.current
      const mobileIdx = mobileIndexRef.current

      shapes.forEach((s, i) => {
        const isCurrentMobile = mobile && i === mobileIdx
        const visible = mobile ? isCurrentMobile : true
        s.wrapper.visible = visible

        // Mobile shows exactly one shape at a time, centered on the
        // camera's look-at target (the origin) instead of its normal
        // desktop scatter position. Any shape that isn't the current
        // mobile shape — including one just swiped away from, or every
        // shape once back on desktop — is restored to its scatter
        // position so desktop layout is unaffected.
        if (isCurrentMobile) {
          s.wrapper.position.set(0, 0, 0)
        } else {
          s.wrapper.position.copy(s.basePos)
        }

        if (!visible) return

        if (!reduceMotion) {
          if (s.shapeType === 'particles') {
            s.wrapper.rotation.y = t * 0.25 + s.offset
          } else if (s.shapeType === 'ribbon') {
            s.wrapper.rotation.x = t * s.spin * 0.5 + s.offset
            s.wrapper.rotation.y = t * s.spin * 0.7 + s.offset
          } else if (s.shapeType === 'mark') {
            s.wrapper.rotation.y = t * s.spin * 0.6 + s.offset
          } else {
            s.wrapper.rotation.x = t * s.spin * 0.4 + s.offset
            s.wrapper.rotation.y = t * s.spin + s.offset
          }
          if (!mobile) s.wrapper.position.y = s.basePos.y + Math.sin(t * 0.6 + s.offset) * 0.12
        }

        const isActive = !mobile && i === active
        const dimmed = !mobile && active !== -1 && i !== active
        const targetIntensity = isActive ? 0.55 : (dimmed ? 0.06 : 0.22)
        const targetOpacity = isActive ? 1 : (dimmed ? 0.2 : 0.92)
        s.mats.forEach((m) => {
          if ('emissiveIntensity' in m) m.emissiveIntensity += (targetIntensity - m.emissiveIntensity) * 0.08
          m.opacity += (targetOpacity - m.opacity) * 0.08
        })
        const targetScale = isActive ? 1.3 : 1
        s.wrapper.scale.x += (targetScale - s.wrapper.scale.x) * 0.08
        s.wrapper.scale.y += (targetScale - s.wrapper.scale.y) * 0.08
        s.wrapper.scale.z += (targetScale - s.wrapper.scale.z) * 0.08
      })

      if (!reduceMotion && !mobile) {
        group.rotation.y = mouseX * 0.12
        group.rotation.x = mouseY * -0.08
      }
      if (!reduceMotion) dust.rotation.y = t * 0.02

      applyCameraForState()
      const lerpSpeed = reduceMotion ? 1 : 0.07
      camera.position.x += (camTarget.x - camera.position.x) * lerpSpeed
      camera.position.y += (camTarget.y - camera.position.y) * lerpSpeed
      camera.position.z += (camTarget.z - camera.position.z) * lerpSpeed
      camera.lookAt(camLookAt)

      if (!mobile) updateLabelPositions()
      renderer.render(scene, camera)
    }

    function startLoop() {
      if (rafId === null) tick()
    }
    function stopLoop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }

    // Pause the RAF loop entirely while the section is scrolled out of
    // view — the page already runs EmblemScene's WebGL context above the
    // fold, so an off-screen second context left animating is the likeliest
    // way this section could cost frame rate.
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) startLoop(); else stopLoop() },
      { threshold: 0.01 }
    )
    intersectionObserver.observe(stage)
    startLoop()

    function handleResize() {
      W = stage.clientWidth || 1
      H = stage.clientHeight || 1
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(stage)

    return () => {
      stopLoop()
      mq.removeEventListener('change', applyMode)
      stage.removeEventListener('mousemove', handleMouseMove)
      stage.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('click', handleCanvasClick)
      stage.removeEventListener('touchstart', handleTouchStart)
      stage.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('keydown', handleKeyDown)
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
      })
    }
    // Mount-time setup only — `services` is a stable module-level import.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the mobile carousel's text/dots in sync via direct DOM writes
  // (mirrors label position updates) so React state stays the single
  // source of truth without extra re-renders.
  useEffect(() => {
    const svc = services[mobileIndex]
    if (mNumRef.current) mNumRef.current.textContent = svc.num
    if (mTitleRef.current) mTitleRef.current.textContent = svc.title
    dotRefs.current.forEach((d, idx) => {
      if (d) d.classList.toggle('active', idx === mobileIndex)
    })
  }, [mobileIndex, services])

  return (
    <>
      <div className="services-stage" ref={stageRef}>
        <canvas className="services-canvas" ref={canvasRef} />

        <div className="services-labels" aria-hidden={isMobile}>
          {services.map((svc, i) => (
            <button
              key={svc.num}
              ref={(el) => { labelRefs.current[i] = el }}
              type="button"
              className={`services-label${activeIndex === i ? ' active' : ''}${activeIndex !== -1 && activeIndex !== i ? ' dim' : ''}`}
              tabIndex={isMobile ? -1 : 0}
              aria-expanded={activeIndex === i}
              aria-label={`${svc.title}. Show details.`}
              onClick={() => setActiveRef.current(i)}
            >
              <span className="num">{svc.num}</span>
              <span className="title">{svc.title}</span>
            </button>
          ))}
        </div>

        <div className="services-mobile-bar" aria-hidden={!isMobile}>
          <div className="m-title-row">
            <button
              type="button"
              className="services-arrow-btn"
              tabIndex={isMobile ? 0 : -1}
              aria-label="Previous service"
              onClick={() => goMobileRef.current(mobileIndex - 1)}
            >
              &#8592;
            </button>
            <div className="services-m-text">
              <span className="num" ref={mNumRef}>{services[mobileIndex].num}</span>
              <span className="title" ref={mTitleRef}>{services[mobileIndex].title}</span>
            </div>
            <button
              type="button"
              className="services-arrow-btn"
              tabIndex={isMobile ? 0 : -1}
              aria-label="Next service"
              onClick={() => goMobileRef.current(mobileIndex + 1)}
            >
              &#8594;
            </button>
          </div>
          <div className="services-dots">
            {services.map((svc, i) => (
              <span
                key={svc.num}
                ref={(el) => { dotRefs.current[i] = el }}
                className={`services-dot${i === mobileIndex ? ' active' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className={`services-panel${activeIndex !== -1 ? ' open' : ''}`}>
          {activeIndex !== -1 && (
            <>
              <div className="services-panel-top">
                <div>
                  <span className="services-panel-num">{services[activeIndex].num}</span>
                  <h3>{services[activeIndex].title}</h3>
                </div>
                <button
                  type="button"
                  className="services-close-btn"
                  aria-label="Close"
                  onClick={() => setActiveRef.current(-1)}
                >
                  &times;
                </button>
              </div>
              <p>{services[activeIndex].desc}</p>
            </>
          )}
        </div>
      </div>
      <p className="services-hint">{hint}</p>
    </>
  )
}
