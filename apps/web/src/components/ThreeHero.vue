<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'

const mountRef = ref<HTMLDivElement | null>(null)
const loadingText = ref('Loading Steve...')

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let actorGroup: THREE.Group | null = null
let controls: any | null = null
let frameId = 0
let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  const host = mountRef.value
  if (!host) {
    return
  }

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
  camera.position.set(0.2, 1.1, 5.0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  host.appendChild(renderer.domElement)

  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 3
  controls.maxDistance = 6
  controls.minPolarAngle = Math.PI * 0.28
  controls.maxPolarAngle = Math.PI * 0.62
  controls.target.set(0, 0.65, 0)

  const ambient = new THREE.AmbientLight('#ffffff', 0.72)
  scene.add(ambient)

  const key = new THREE.DirectionalLight('#fff7eb', 1.45)
  key.position.set(2.4, 3.8, 2.5)
  key.castShadow = true
  scene.add(key)

  const fill = new THREE.DirectionalLight('#87a9ff', 0.34)
  fill.position.set(-3, 2, -2)
  scene.add(fill)

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.6, 0.16, 32),
    new THREE.MeshStandardMaterial({ color: '#2f5d50', roughness: 0.5, metalness: 0.15 }),
  )
  platform.position.set(0, -0.86, 0.22)
  platform.receiveShadow = true
  scene.add(platform)

  actorGroup = await createActorGroup()
  scene.add(actorGroup)
  fitActor(actorGroup)
  loadingText.value = 'Drag to rotate'

  const clock = new THREE.Clock()
  const render = () => {
    if (!scene || !camera || !renderer || !actorGroup) {
      return
    }
    const t = clock.getElapsedTime()
    actorGroup.position.y = 0.0 + Math.sin(t * 1.4) * 0.02
    controls?.update()
    renderer.render(scene, camera)
    frameId = requestAnimationFrame(render)
  }

  resizeObserver = new ResizeObserver(() => {
    if (!renderer || !camera || !host) {
      return
    }
    const w = Math.max(host.clientWidth, 160)
    const h = Math.max(host.clientHeight, 160)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })
  resizeObserver.observe(host)
  render()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
  resizeObserver?.disconnect()
  controls?.dispose()
  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
  }
})

function fitActor(group: THREE.Group) {
  const box = new THREE.Box3().setFromObject(group)
  const size = box.getSize(new THREE.Vector3())
  if (size.y <= 0) {
    return
  }
  const targetHeight = 2.1
  const scale = targetHeight / size.y
  group.scale.setScalar(scale)

  const scaledBox = new THREE.Box3().setFromObject(group)
  const center = scaledBox.getCenter(new THREE.Vector3())
  group.position.x -= center.x
  group.position.z -= center.z
}

async function createActorGroup() {
  const fromFbx = await tryLoadSteveFbx()
  if (fromFbx) {
    return fromFbx
  }
  return createFallbackSteve()
}

async function tryLoadSteveFbx() {
  try {
    const [{ FBXLoader }] = await Promise.all([
      import('three/examples/jsm/loaders/FBXLoader.js'),
    ])
    const texture = await new THREE.TextureLoader().loadAsync('/models/textures/steve.png')
    texture.colorSpace = THREE.SRGBColorSpace
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestMipmapNearestFilter

    const loader = new FBXLoader()
    const model = await loader.loadAsync('/models/source/steve.fbx')
    const group = new THREE.Group()

    model.traverse((obj: THREE.Object3D) => {
      if (!(obj as THREE.Mesh).isMesh) {
        return
      }
      const mesh = obj as THREE.Mesh
      const meshBox = new THREE.Box3().setFromObject(mesh)
      const meshSize = meshBox.getSize(new THREE.Vector3())
      const maybeGround = meshSize.y < 0.06 || ((meshSize.x > 4 || meshSize.z > 4) && meshSize.y < 0.25) || /ground/i.test(mesh.name)
      if (maybeGround) {
        mesh.visible = false
        return
      }

      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.75,
        metalness: 0.02,
      })
    })

    group.add(model)
    return group
  } catch {
    return null
  }
}

function createFallbackSteve() {
  const group = new THREE.Group()
  const skin = new THREE.MeshStandardMaterial({ color: '#d4a77f', roughness: 0.7 })
  const shirt = new THREE.MeshStandardMaterial({ color: '#5bb6d8', roughness: 0.62 })
  const pants = new THREE.MeshStandardMaterial({ color: '#4044a8', roughness: 0.64 })
  const hair = new THREE.MeshStandardMaterial({ color: '#4c2f22', roughness: 0.66 })
  const shoes = new THREE.MeshStandardMaterial({ color: '#2f2f2f', roughness: 0.8 })

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.84, 1.02, 0.36), shirt)
  torso.position.y = 0.28
  group.add(torso)

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.56), skin)
  head.position.y = 1.16
  group.add(head)

  const hairCap = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.24, 0.6), hair)
  hairCap.position.y = 1.42
  group.add(hairCap)

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.96, 0.24), shirt)
  leftArm.position.set(-0.56, 0.28, 0)
  group.add(leftArm)

  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.96, 0.24), shirt)
  rightArm.position.set(0.56, 0.28, 0)
  group.add(rightArm)

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.04, 0.28), pants)
  leftLeg.position.set(-0.18, -0.8, 0)
  group.add(leftLeg)

  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.04, 0.28), pants)
  rightLeg.position.set(0.18, -0.8, 0)
  group.add(rightLeg)

  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.34), shoes)
  shoeL.position.set(-0.18, -1.38, 0.03)
  group.add(shoeL)

  const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.34), shoes)
  shoeR.position.set(0.18, -1.38, 0.03)
  group.add(shoeR)

  return group
}
</script>

<template>
  <div class="fixed bottom-5 right-5 z-20 hidden md:block">
    <div class="relative h-[240px] w-[220px] overflow-hidden rounded-2xl border border-black/10 bg-[radial-gradient(circle_at_30%_20%,#f7f2e7,#e8dfd1)] shadow-soft">
      <div ref="mountRef" class="h-full w-full"></div>
      <div class="pointer-events-none absolute right-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[10px] text-white/90">
        {{ loadingText }}
      </div>
    </div>
  </div>
</template>
