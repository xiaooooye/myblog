<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'

const leftRef = ref<HTMLDivElement | null>(null)
const rightRef = ref<HTMLDivElement | null>(null)

type Runtime = {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  frameId: number
  resizeObserver: ResizeObserver
}

const runtimes: Runtime[] = []

onMounted(() => {
  if (leftRef.value) {
    runtimes.push(createSideScene(leftRef.value, 'left'))
  }
  if (rightRef.value) {
    runtimes.push(createSideScene(rightRef.value, 'right'))
  }
})

onBeforeUnmount(() => {
  for (const runtime of runtimes) {
    cancelAnimationFrame(runtime.frameId)
    runtime.resizeObserver.disconnect()
    runtime.renderer.dispose()
    runtime.renderer.domElement.remove()
  }
  runtimes.length = 0
})

function createSideScene(host: HTMLDivElement, side: 'left' | 'right'): Runtime {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100)
  camera.position.set(0, 0, 12)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
  host.appendChild(renderer.domElement)

  const particlesCount = 110
  const positions = new Float32Array(particlesCount * 3)
  for (let i = 0; i < particlesCount; i += 1) {
    const stride = i * 3
    positions[stride] = (Math.random() - 0.5) * 10
    positions[stride + 1] = (Math.random() - 0.5) * 16
    positions[stride + 2] = (Math.random() - 0.5) * 7
  }
  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particleMaterial = new THREE.PointsMaterial({
    color: side === 'left' ? '#2f5d50' : '#c87f56',
    size: 0.065,
    transparent: true,
    opacity: 0.2,
  })
  const particles = new THREE.Points(particleGeometry, particleMaterial)
  particles.position.x = 0
  scene.add(particles)

  const accent = new THREE.Mesh(
    side === 'left' ? new THREE.TorusKnotGeometry(0.68, 0.095, 120, 16) : new THREE.IcosahedronGeometry(0.74, 1),
    new THREE.MeshBasicMaterial({
      color: side === 'left' ? '#2f5d50' : '#c87f56',
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    }),
  )
  accent.position.set(0, side === 'left' ? 1.5 : -1.4, -1)
  scene.add(accent)

  const clock = new THREE.Clock()
  let frameId = 0
  const render = () => {
    const t = clock.getElapsedTime()
    particles.rotation.y = side === 'left' ? t * 0.06 : -t * 0.06
    particles.position.y = Math.sin(t * 0.4) * 0.2
    accent.rotation.x += 0.002
    accent.rotation.y += side === 'left' ? 0.0018 : -0.0018
    accent.position.y += Math.sin(t * 0.8) * 0.0012
    renderer.render(scene, camera)
    frameId = requestAnimationFrame(render)
  }

  const resizeObserver = new ResizeObserver(() => {
    const w = Math.max(host.clientWidth, 220)
    const h = Math.max(host.clientHeight, 300)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })
  resizeObserver.observe(host)
  render()

  return { renderer, scene, camera, frameId, resizeObserver }
}
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-[1] hidden xl:block">
    <div class="absolute inset-y-0 left-1/2 w-full max-w-7xl -translate-x-1/2">
      <div class="absolute inset-y-0 left-0 w-[360px] -translate-x-[68%] overflow-visible opacity-85">
        <div class="h-full w-full overflow-visible bg-[linear-gradient(to_right,rgba(244,241,234,0.58)_0%,rgba(244,241,234,0.28)_45%,rgba(244,241,234,0)_78%)]">
          <div ref="leftRef" class="h-full w-full"></div>
        </div>
      </div>
      <div class="absolute inset-y-0 right-0 w-[360px] translate-x-[68%] overflow-visible opacity-85">
        <div class="h-full w-full overflow-visible bg-[linear-gradient(to_left,rgba(244,241,234,0.58)_0%,rgba(244,241,234,0.28)_45%,rgba(244,241,234,0)_78%)]">
          <div ref="rightRef" class="h-full w-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>
