import './style.css'
import * as THREE  from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
})

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
camera.position.setZ(2)

renderer.render(scene, camera)


const pointLight = new THREE.PointLight(0xffffff)
pointLight.position.set(5,5,5)

const ambientLight = new THREE.AmbientLight(0xffffff)

scene.add(pointLight, ambientLight)

//Helpers
// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50)

// scene.add(lightHelper, gridHelper)

const controls = new OrbitControls(camera, renderer.domElement)

const spaceTexture = new THREE.TextureLoader().load('bg.jpg')
scene.background = spaceTexture


const globeGroup = new THREE.Group();
scene.add(globeGroup);


// Earth
const earthTexture = new THREE.TextureLoader().load('earthmap1k.jpg')

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial({ 
    map: earthTexture,
    transparent: true,
    opacity: 1
  })
)

// scene.add(earth)
globeGroup.add(earth)

const cloudTexture = new THREE.TextureLoader().load('clouds.jpg')

const climate = new THREE.Mesh(
  new THREE.SphereGeometry(1.2, 32, 32),
  new THREE.MeshStandardMaterial({ 
    map: cloudTexture,
    color: 0x00ffa7,
    transparent: true, 
    opacity: 0.1,
    fog: true
  })
)

scene.add(climate)

let locations = [
  {
    city: 'Munich',
    lat: 48.13743,
    lng: 11.57549
  },
  {
    city: 'Amsterdam',
    lat: 52.3740300,
    lng: 4.8896900
  },
  {
    city: 'Vienna',
    lat: 48.2084900,
    lng: 16.3720800
  },
  {
    city: 'Brussels',
    lat: 50.8504500,
    lng: 4.3487800
  },
  {
    city: 'Copenhagen',
    lat: 55.67594,
    lng: 12.56553
  },
  {
    city: 'Stockholm',
    lat: 59.33258,
    lng: 18.0649
  },
  {
    city: 'Oslo',
    lat: 59.91273,
    lng: 10.74609
  },
  {
    city: 'Helsinki',
    lat: 60.16952,
    lng: 24.93545
  },
  {
    city: 'London',
    lat: 51.50853,
    lng: -0.12574
  }
]


locations.sort((a, b) => {
  return a.lat - b.lat
})


function convertCoordinatesToCartesian(lat, lng) {
  const phi = (90-lat)*(Math.PI/180)
  const theta = (lng+180)*(Math.PI/180)
  let x = -(Math.sin(phi)*Math.cos(theta))
  let z = (Math.sin(phi)*Math.sin(theta))
  let y = Math.cos(phi)

  return {x,y,z}
}



function getCurve(loc1, loc2) {
  const v1 = new THREE.Vector3(loc1.x, loc1.y, loc1.z)
  const v2 = new THREE.Vector3(loc2.x, loc2.y, loc2.z)
  const points = []
  for (let i = 0; i <= 10; i++) {
    let p = new THREE.Vector3().lerpVectors(v1, v2, i/10)
    p.normalize()
    p.multiplyScalar(1 + 0.1*Math.sin(Math.PI*i/10))
    points.push(p)
  }

  const path = new THREE.CatmullRomCurve3(points)

  const geometry = new THREE.TubeGeometry(path, 10, 0.001, 8, false)
  const material = new THREE.MeshBasicMaterial({ color: 0x00ffa7 })
  const mesh = new THREE.Mesh(geometry, material)
  // scene.add(mesh)
  globeGroup.add(mesh)
}




for (let i = 0; i < locations.length; i++) {
  let pos1 = convertCoordinatesToCartesian(locations[i].lat, locations[i].lng)

  let mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.01, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0x00ffa7 })
  )

  mesh.position.set(pos1.x, pos1.y, pos1.z)
  // scene.add(mesh)

  globeGroup.add(mesh)

  if (i < locations.length-1) {
    let pos2 = convertCoordinatesToCartesian(locations[i+1].lat, locations[i+1].lng)

    getCurve(pos1, pos2)
  }
}


window.addEventListener( 'resize', onWindowResize, false )

function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize( window.innerWidth, window.innerHeight )
}

function animate() {
  requestAnimationFrame(animate)

  climate.rotation.x += -0.005
  climate.rotation.y += -0.005
  climate.rotation.z += -0.005

  globeGroup.rotation.x += 0.002
  globeGroup.rotation.y += 0.002
  globeGroup.rotation.z += 0.002

 

  controls.update()

  renderer.render(scene, camera)
}

animate()
