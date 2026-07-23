import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import glyphContour from '../assets/emblem/glyph_contour.json'

// Brand palette — literal hex, matches --color-neon-teal / --color-neon-pink
// exactly. No CSS variables here: three.js materials need real color values.
const BASE = new THREE.Color('#ffd301')
const ACCENT = new THREE.Color('#9e1a0f')

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const lerp = (a, b, t) => a + (b - a) * t
const randRange = (a, b) => a + Math.random() * (b - a)
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3)

/* ------------------------------------------------------------------ */
/* Shared particle material — per-particle color + brightness jitter,  */
/* soft round sprite, additive blending. No postprocessing/bloom pass. */
/* ------------------------------------------------------------------ */

function makeParticleMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: { uSize: { value: 1 } },
    vertexShader: `
      attribute float aBrightness;
      varying float vBrightness;
      varying vec3 vColor;
      uniform float uSize;
      void main() {
        vBrightness = aBrightness;
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = uSize * (280.0 / max(-mv.z, 0.001));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying float vBrightness;
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float a = smoothstep(0.5, 0.0, d) * vBrightness;
        gl_FragColor = vec4(vColor, a);
      }
    `,
  })
}

function makeParticles(count, size) {
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const brightness = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const c = BASE.clone().lerp(ACCENT, Math.random() * 0.35)
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
    brightness[i] = randRange(0.45, 1)
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1))
  const mat = makeParticleMaterial()
  mat.uniforms.uSize.value = size
  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  return points
}

/* ------------------------------------------------------------------ */
/* Preset 1 — Design & Development: circuit-trace assembly + pulse.    */
/* ------------------------------------------------------------------ */

function buildTraces(branchCount) {
  const traces = []
  for (let b = 0; b < branchCount; b++) {
    const pts = []
    let x = randRange(-1.7, 1.7)
    let y = randRange(-1.1, 1.1)
    pts.push(new THREE.Vector3(x, y, randRange(-0.1, 0.1)))
    const steps = 5 + Math.floor(Math.random() * 4)
    for (let s = 0; s < steps; s++) {
      if (Math.random() > 0.5) x += randRange(-0.55, 0.55)
      else y += randRange(-0.4, 0.4)
      x = clamp(x, -1.9, 1.9)
      y = clamp(y, -1.25, 1.25)
      pts.push(new THREE.Vector3(x, y, randRange(-0.1, 0.1)))
    }
    traces.push(pts)
  }
  return traces
}

function flattenTraces(traces) {
  const segments = []
  let total = 0
  traces.forEach((pts) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const len = pts[i].distanceTo(pts[i + 1])
      segments.push({ a: pts[i], b: pts[i + 1], len, start: total })
      total += len
    }
  })
  return { segments, total }
}

function pointAtU(field, u) {
  const target = clamp(u) * field.total
  for (const seg of field.segments) {
    if (target <= seg.start + seg.len || seg === field.segments[field.segments.length - 1]) {
      const local = seg.len > 0 ? clamp((target - seg.start) / seg.len) : 0
      return seg.a.clone().lerp(seg.b, local)
    }
  }
  return field.segments[0].a.clone()
}

function buildCircuitField() {
  const count = 360
  const points = makeParticles(count, 3.2)
  const traces = buildTraces(6)
  const field = flattenTraces(traces)
  const us = new Float32Array(count)
  const targets = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const u = (i + Math.random() * 0.4) / count
    us[i] = u
    const p = pointAtU(field, u)
    targets[i * 3] = p.x
    targets[i * 3 + 1] = p.y
    targets[i * 3 + 2] = p.z
  }
  const positions = points.geometry.attributes.position.array
  for (let i = 0; i < count; i++) {
    positions[i * 3] = targets[i * 3] + randRange(-2.5, 2.5)
    positions[i * 3 + 1] = targets[i * 3 + 1] + randRange(-2.5, 2.5)
    positions[i * 3 + 2] = targets[i * 3 + 2] + randRange(-1.5, 1.5)
  }

  const lineGeo = new THREE.BufferGeometry()
  const lineVerts = []
  traces.forEach((pts) => {
    for (let i = 0; i < pts.length - 1; i++) {
      lineVerts.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z)
    }
  })
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3))
  const lineMat = new THREE.LineBasicMaterial({ color: BASE, transparent: true, opacity: 0.12 })
  const lines = new THREE.LineSegments(lineGeo, lineMat)

  const group = new THREE.Group()
  group.add(lines)
  group.add(points)

  const brightness = points.geometry.attributes.aBrightness.array
  const baseBrightness = brightness.slice()
  const pulseHeads = [0, 0.33, 0.66]
  const pulseSpeed = 0.16

  return {
    group,
    update(elapsed) {
      const settle = easeOutCubic(clamp(elapsed / 1.4))
      const pos = points.geometry.attributes.position.array
      for (let i = 0; i < count; i++) {
        pos[i * 3] = lerp(pos[i * 3], targets[i * 3], settle * 0.12 + 0.02)
        pos[i * 3 + 1] = lerp(pos[i * 3 + 1], targets[i * 3 + 1], settle * 0.12 + 0.02)
        pos[i * 3 + 2] = lerp(pos[i * 3 + 2], targets[i * 3 + 2], settle * 0.12 + 0.02)

        let pulse = 0
        for (const head of pulseHeads) {
          const h = (elapsed * pulseSpeed + head) % 1
          const dist = Math.abs(us[i] - h)
          pulse = Math.max(pulse, 1 - clamp(dist / 0.03))
        }
        brightness[i] = clamp(baseBrightness[i] * 0.6 + pulse * 1.1)
      }
      points.geometry.attributes.position.needsUpdate = true
      points.geometry.attributes.aBrightness.needsUpdate = true
      lineMat.opacity = 0.08 + settle * 0.08
    },
  }
}

/* ------------------------------------------------------------------ */
/* Preset 2 — 3D Web Experiences: spiral formation, continuous spin.   */
/* ------------------------------------------------------------------ */

function buildSpiralField() {
  const count = 780
  const points = makeParticles(count, 2.6)
  const targets = new Float32Array(count * 3)
  const arms = 4
  const perArm = Math.ceil(count / arms)
  const turns = 2.4
  let idx = 0
  for (let a = 0; a < arms && idx < count; a++) {
    for (let i = 0; i < perArm && idx < count; i++) {
      const t = i / perArm
      const theta = t * Math.PI * 2 * turns + (a / arms) * Math.PI * 2
      const r = 0.25 + t * 1.85 + randRange(-0.06, 0.06)
      const y = randRange(-0.18, 0.18) * (1 - t * 0.4)
      targets[idx * 3] = Math.cos(theta) * r
      targets[idx * 3 + 1] = y
      targets[idx * 3 + 2] = Math.sin(theta) * r
      idx++
    }
  }
  const positions = points.geometry.attributes.position.array
  for (let i = 0; i < count; i++) {
    const r = randRange(2.4, 3.4)
    const theta = Math.random() * Math.PI * 2
    positions[i * 3] = Math.cos(theta) * r
    positions[i * 3 + 1] = randRange(-1.5, 1.5)
    positions[i * 3 + 2] = Math.sin(theta) * r
  }

  const colors = points.geometry.attributes.color.array
  for (let i = 0; i < count; i++) {
    const dist = Math.hypot(targets[i * 3], targets[i * 3 + 2])
    const c = BASE.clone().lerp(new THREE.Color('#ffffff'), clamp(1 - dist / 2.1) * 0.5)
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  points.geometry.attributes.color.needsUpdate = true

  const coreGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      color: '#fff4bf',
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  )
  coreGlow.scale.set(1.1, 1.1, 1.1)

  const group = new THREE.Group()
  group.add(points)
  group.add(coreGlow)

  return {
    group,
    update(elapsed) {
      const settle = easeOutCubic(clamp(elapsed / 1.6))
      const pos = points.geometry.attributes.position.array
      for (let i = 0; i < count; i++) {
        pos[i * 3] = lerp(pos[i * 3], targets[i * 3], settle * 0.1 + 0.015)
        pos[i * 3 + 1] = lerp(pos[i * 3 + 1], targets[i * 3 + 1], settle * 0.1 + 0.015)
        pos[i * 3 + 2] = lerp(pos[i * 3 + 2], targets[i * 3 + 2], settle * 0.1 + 0.015)
      }
      points.geometry.attributes.position.needsUpdate = true
      group.rotation.y = elapsed * 0.09
      coreGlow.material.opacity = settle * (0.5 + 0.15 * Math.sin(elapsed * 0.8))
    },
  }
}

/* ------------------------------------------------------------------ */
/* Preset 3 — Motion Design: flowing ribbon trails + scattering embers.*/
/* No fixed formation — continuous flow from the moment it's active.   */
/* ------------------------------------------------------------------ */

function buildFlowField() {
  const converge = new THREE.Vector3(0.9, 0.1, 0)
  const curveCount = 3
  const curves = []
  for (let c = 0; c < curveCount; c++) {
    const start = new THREE.Vector3(randRange(-2.1, -1.3), randRange(-1.1, 1.1), randRange(-0.4, 0.4))
    const mid1 = new THREE.Vector3(randRange(-1.1, -0.2), randRange(-0.9, 0.9), randRange(-0.3, 0.3))
    const mid2 = new THREE.Vector3(randRange(-0.2, 0.6), randRange(-0.5, 0.5), randRange(-0.2, 0.2))
    curves.push(new THREE.CatmullRomCurve3([start, mid1, mid2, converge]))
  }

  const mainCount = 420
  const points = makeParticles(mainCount, 3)
  const curveIndex = new Uint8Array(mainCount)
  const uOffset = new Float32Array(mainCount)
  for (let i = 0; i < mainCount; i++) {
    curveIndex[i] = i % curveCount
    uOffset[i] = Math.random()
  }
  const brightness = points.geometry.attributes.aBrightness.array

  const emberCount = 220
  const embers = makeParticles(emberCount, 2)
  const emberLife = new Float32Array(emberCount)
  const emberCurve = new Uint8Array(emberCount)
  const emberU = new Float32Array(emberCount)
  const emberDrift = new Float32Array(emberCount * 3)
  for (let i = 0; i < emberCount; i++) {
    emberLife[i] = Math.random()
    emberCurve[i] = i % curveCount
    emberU[i] = Math.random()
  }
  const emberBrightness = embers.geometry.attributes.aBrightness.array

  const group = new THREE.Group()
  group.add(points)
  group.add(embers)

  const flowSpeed = 0.09

  return {
    group,
    update(elapsed, dt) {
      const pos = points.geometry.attributes.position.array
      for (let i = 0; i < mainCount; i++) {
        const u = (elapsed * flowSpeed + uOffset[i]) % 1
        const p = curves[curveIndex[i]].getPoint(u)
        pos[i * 3] = p.x
        pos[i * 3 + 1] = p.y
        pos[i * 3 + 2] = p.z
        brightness[i] = 0.35 + u * 0.75
      }
      points.geometry.attributes.position.needsUpdate = true
      points.geometry.attributes.aBrightness.needsUpdate = true

      const ePos = embers.geometry.attributes.position.array
      for (let i = 0; i < emberCount; i++) {
        emberLife[i] += dt * 0.5
        if (emberLife[i] >= 1) {
          emberLife[i] = 0
          emberU[i] = Math.random() * 0.6
          const tangent = curves[emberCurve[i]].getTangent(emberU[i]).normalize()
          const perp = new THREE.Vector3(-tangent.y, tangent.x, tangent.z).normalize()
          const speed = randRange(0.4, 1)
          emberDrift[i * 3] = perp.x * speed
          emberDrift[i * 3 + 1] = perp.y * speed
          emberDrift[i * 3 + 2] = randRange(-0.3, 0.3)
        }
        const u = (emberU[i] + emberLife[i] * flowSpeed * 3) % 1
        const base = curves[emberCurve[i]].getPoint(u)
        ePos[i * 3] = base.x + emberDrift[i * 3] * emberLife[i]
        ePos[i * 3 + 1] = base.y + emberDrift[i * 3 + 1] * emberLife[i]
        ePos[i * 3 + 2] = base.z + emberDrift[i * 3 + 2] * emberLife[i]
        emberBrightness[i] = clamp(1 - emberLife[i]) * 0.9
      }
      embers.geometry.attributes.position.needsUpdate = true
      embers.geometry.attributes.aBrightness.needsUpdate = true
    },
  }
}

/* ------------------------------------------------------------------ */
/* Preset 4 — Visual Identity: node cluster -> morph into the studio   */
/* glyph. Reuses the vectorized contour data from glyph_contour.json   */
/* (same source mark as the emblem asset) purely as position data —    */
/* motion/material treatment here is unrelated to EmblemScene.jsx.     */
/* ------------------------------------------------------------------ */

function pointInPolygon(pt, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1]
    const xj = poly[j][0], yj = poly[j][1]
    const intersect =
      yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function buildGlyphTargets(count) {
  const poly = glyphContour.points
  const outlineCount = Math.floor(count * 0.65)
  const fillCount = count - outlineCount

  const perim = []
  let total = 0
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    perim.push({ a, b, len, start: total })
    total += len
  }

  const targets = []
  for (let i = 0; i < outlineCount; i++) {
    const d = (i / outlineCount) * total
    const seg = perim.find((s) => d <= s.start + s.len) ?? perim[perim.length - 1]
    const t = seg.len > 0 ? (d - seg.start) / seg.len : 0
    targets.push([lerp(seg.a[0], seg.b[0], t), lerp(seg.a[1], seg.b[1], t)])
  }

  let filled = 0
  let guard = 0
  while (filled < fillCount && guard < fillCount * 40) {
    guard++
    const x = randRange(-1, 1)
    const y = randRange(-1, 1)
    if (pointInPolygon([x, y], poly)) {
      targets.push([x, y])
      filled++
    }
  }
  while (targets.length < count) targets.push(targets[targets.length % outlineCount])
  return targets
}

function buildClusterField() {
  const count = 420
  const points = makeParticles(count, 3.4)

  const clusterTargets = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const lobe = Math.floor(Math.random() * 3)
    const center = [
      [0, 0.15, 0],
      [-0.35, -0.2, 0.1],
      [0.32, -0.15, -0.1],
    ][lobe]
    const r = randRange(0.15, 0.62)
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(randRange(-1, 1))
    clusterTargets[i * 3] = center[0] + r * Math.sin(phi) * Math.cos(theta)
    clusterTargets[i * 3 + 1] = center[1] + r * Math.sin(phi) * Math.sin(theta) * 0.8
    clusterTargets[i * 3 + 2] = center[2] + r * Math.cos(phi) * 0.6
  }

  const glyphPts = buildGlyphTargets(count)
  const glyphTargets = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    glyphTargets[i * 3] = glyphPts[i][0] * 1.05
    glyphTargets[i * 3 + 1] = glyphPts[i][1] * 1.05
    glyphTargets[i * 3 + 2] = randRange(-0.02, 0.02)
  }

  const positions = points.geometry.attributes.position.array
  for (let i = 0; i < count; i++) {
    positions[i * 3] = clusterTargets[i * 3] + randRange(-2, 2)
    positions[i * 3 + 1] = clusterTargets[i * 3 + 1] + randRange(-2, 2)
    positions[i * 3 + 2] = clusterTargets[i * 3 + 2] + randRange(-1.5, 1.5)
  }

  const linkGeo = new THREE.BufferGeometry()
  const linkVerts = new Float32Array(count * 2 * 3)
  linkGeo.setAttribute('position', new THREE.BufferAttribute(linkVerts, 3))
  const linkMat = new THREE.LineBasicMaterial({ color: BASE, transparent: true, opacity: 0.16 })
  const links = new THREE.LineSegments(linkGeo, linkMat)

  const group = new THREE.Group()
  group.add(links)
  group.add(points)

  const HOLD = 2.4
  const MORPH = 1.6

  return {
    group,
    update(elapsed) {
      const pos = points.geometry.attributes.position.array
      const morphT = clamp((elapsed - HOLD) / MORPH)
      const morph = easeOutCubic(morphT)
      const settle = easeOutCubic(clamp(elapsed / 1.3))

      for (let i = 0; i < count; i++) {
        const cx = lerp(pos[i * 3], clusterTargets[i * 3], settle * 0.11 + 0.02)
        const cy = lerp(pos[i * 3 + 1], clusterTargets[i * 3 + 1], settle * 0.11 + 0.02)
        const cz = lerp(pos[i * 3 + 2], clusterTargets[i * 3 + 2], settle * 0.11 + 0.02)
        pos[i * 3] = lerp(cx, glyphTargets[i * 3], morph)
        pos[i * 3 + 1] = lerp(cy, glyphTargets[i * 3 + 1], morph)
        pos[i * 3 + 2] = lerp(cz, glyphTargets[i * 3 + 2], morph)
      }
      points.geometry.attributes.position.needsUpdate = true

      if (morphT < 1) {
        const linkPos = links.geometry.attributes.position.array
        let vi = 0
        const step = Math.max(1, Math.floor(count / 140))
        for (let i = 0; i < count; i += step) {
          const j = (i + 1 + Math.floor(Math.random() * 4)) % count
          linkPos[vi++] = pos[i * 3]
          linkPos[vi++] = pos[i * 3 + 1]
          linkPos[vi++] = pos[i * 3 + 2]
          linkPos[vi++] = pos[j * 3]
          linkPos[vi++] = pos[j * 3 + 1]
          linkPos[vi++] = pos[j * 3 + 2]
        }
        for (; vi < linkPos.length; vi++) linkPos[vi] = 0
        links.geometry.attributes.position.needsUpdate = true
      }
      linkMat.opacity = 0.16 * (1 - morph) * settle

      group.rotation.y = elapsed * (morphT < 1 ? 0.05 : 0.02)
    },
  }
}

/* ------------------------------------------------------------------ */

const CHAPTER_BUILDERS = [buildCircuitField, buildSpiralField, buildFlowField, buildClusterField]

/* ------------------------------------------------------------------ */
/* Generic engine — one instance per chapter. Mounts/disposes its own  */
/* WebGL context only while its wrapper intersects the viewport, so    */
/* at most one chapter canvas is ever live at a time. A static CSS     */
/* placeholder always sits behind it, so a WebGL failure shows the     */
/* placeholder rather than a silent black canvas.                      */
/* ------------------------------------------------------------------ */

export default function SolutionsCenterpiece({ index = 0 }) {
  const wrapRef = useRef(null)
  const mountRef = useRef(null)
  const [active, setActive] = useState(false)
  const [failed, setFailed] = useState(false)
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (reducedMotion) return
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0.2,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion])

  useEffect(() => {
    if (!active || reducedMotion) return
    const mount = mountRef.current
    if (!mount) return

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    } catch {
      setFailed(true)
      return undefined
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 30)
    camera.position.set(0, 0, 5.4)
    camera.lookAt(0, 0, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const build = CHAPTER_BUILDERS[index] ?? CHAPTER_BUILDERS[0]
    const field = build()
    scene.add(field.group)

    function handleResize() {
      const { clientWidth, clientHeight } = mount
      if (!clientWidth || !clientHeight) return
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight)
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(mount)
    handleResize()

    const clock = new THREE.Clock()
    let rafId
    let lastT = 0
    function animate() {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const dt = Math.min(t - lastT, 0.1)
      lastT = t
      field.update(t, dt)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
      })
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [active, reducedMotion, index])

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(255,211,1,0.10) 0%, rgba(158,26,15,0.05) 45%, transparent 70%)',
        }}
        aria-hidden
      />
      {!reducedMotion && !failed && <div ref={mountRef} className="absolute inset-0" />}
    </div>
  )
}
