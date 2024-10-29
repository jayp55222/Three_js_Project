import './style.css'
import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/Addons.js'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import gsap from 'gsap'
import LocomotiveScroll from 'locomotive-scroll';

const scroll = new LocomotiveScroll();


const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.z = 4

// const geometry = new THREE.BoxGeometry(1, 1, 1)
// const material = new THREE.MeshBasicMaterial({ color: "green" })
// const cube = new THREE.Mesh(geometry, material)
// scene.add(cube)
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
  alpha: true
})

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // to get great performance without sacrificing resources
renderer.setSize(window.innerWidth, window.innerHeight)

// Create OrbitControls
// const controls = new OrbitControls(camera, renderer.domElement)
// controls.enableDamping=true
// controls.enableZoom=true

let model


// Load HDRI environment map
const rgbeLoader = new RGBELoader()
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/klippad_sunrise_2_1k.hdr', function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = texture
  // scene.background = texture
})

// Enable physically correct lighting
renderer.physicallyCorrectLights = true
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.outputEncoding = THREE.sRGBEncoding

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader()

// Setup post-processing
const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.uniforms['amount'].value = 0.0015
composer.addPass(rgbShiftPass)

// Load GLTF model
const loader = new GLTFLoader()
loader.load(
  './DamagedHelmet.gltf',
  (gltf) => {
    model=gltf.scene
    scene.add(model)
  },
  (progress) => {
    console.log((progress.loaded / progress.total * 100) + '% loaded')
  },
  (error) => {
    console.error('An error happened', error)
  }
)

window.addEventListener('mousemove',(e)=>{
  if(model){
    const rotationX=(e.clientX/window.innerWidth-0.5)*(Math.PI*.12)
    const rotationY=(e.clientY/window.innerHeight-0.5)*(Math.PI*.12)

    gsap.to(model.rotation, {
      x: rotationY,
      y: rotationX,
      duration: 0.9,
      ease: "power2.out"
    })

  }
})

window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight)
  composer.setSize(window.innerWidth,window.innerHeight)
})

// Render loop function
function animate() {
  window.requestAnimationFrame(animate)
  // controls.update() // Update controls in each frame
  composer.render() // Use composer instead of renderer
}

// Start the render loop
animate()