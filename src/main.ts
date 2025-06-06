import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// Theatre.js
import studio from '@theatre/studio'
import { getProject, types, val } from '@theatre/core'
import projectState from './state.json'

// Initialize Theatre.js studio
studio.initialize()
studio.ui.hide()

// Scene setup
const scene = new THREE.Scene()
scene.background = new THREE.Color('#87ceeb')

// Camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 5, 20)

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 3))
const dirLight = new THREE.DirectionalLight(0xffffff, 1)
dirLight.position.set(10, 20, 10)
scene.add(dirLight)

// Theatre.js setup
const project = getProject('SwampScroll', { state: projectState })
const sheet = project.sheet('Main')

// Camera Theatre binding (including target)
const cameraObj = sheet.object('Camera', {
  position: types.compound({
    x: types.number(camera.position.x, { range: [-100, 100] }),
    y: types.number(camera.position.y, { range: [-100, 100] }),
    z: types.number(camera.position.z, { range: [-100, 100] }),
  }),
  target: types.compound({
    x: types.number(0, { range: [-100, 100] }),
    y: types.number(0, { range: [-100, 100] }),
    z: types.number(0, { range: [-100, 100] }),
  }),
})

// Update camera position and target each frame via Theatre
let theatreTarget = new THREE.Vector3()
cameraObj.onValuesChange((v) => {
  camera.position.set(v.position.x, v.position.y, v.position.z)
  theatreTarget.set(v.target.x, v.target.y, v.target.z)
})

// Scroll-driven animation
const updateScrollAnimation = () => {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const scrollProgress = scrollY / maxScroll;

  const sequenceLength = val(sheet.sequence.pointer.length);
  sheet.sequence.position = scrollProgress * sequenceLength;
};
window.addEventListener('scroll', updateScrollAnimation)

// Load GLB
const loader = new GLTFLoader()
loader.load('/swamp_location.glb', (gltf) => {
  const swamp = gltf.scene
  swamp.scale.set(0.5, 0.5, 0.5)
  swamp.position.set(0, 0, 0)
  scene.add(swamp)
})

// Render loop
const animate = () => {
  camera.lookAt(theatreTarget)
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// Debug
// const button = document.createElement('button')
// button.innerText = 'Log Camera Info'
// button.style.position = 'fixed'
// button.style.top = '20px'
// button.style.right = '20px'
// button.style.padding = '10px 15px'
// button.style.background = '#000'
// button.style.color = '#fff'
// button.style.border = 'none'
// button.style.borderRadius = '5px'
// button.style.cursor = 'pointer'
// button.style.zIndex = '1000'
// document.body.appendChild(button)

// button.addEventListener('click', () => {
//   console.log(`camera.position.set(${camera.position.x}, ${camera.position.y}, ${camera.position.z})`)
//   console.log(`camera.lookAt(${theatreTarget.x}, ${theatreTarget.y}, ${theatreTarget.z})`)
// })
