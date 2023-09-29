import * as THREE from '../src/Three.js';

import { GLTFLoader } from '../src/loaders/GLTFLoader.js';
import { KTX2Loader } from '../src/loaders/KTX2Loader.js';
import { MeshoptDecoder } from '../src/libs/meshopt_decoder.module.js';

import { OrbitControls } from '../src/controls/OrbitControls.js';

import WebGPURenderer from '../src/WebGPURenderer.js';

let camera, scene, renderer;

init();

async function init() {
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 20);
  camera.position.set(2, 2, 2);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  //lights

  const light = new THREE.PointLight(0xffffff);
  light.power = 1300;
  camera.add(light);
  scene.add(camera);

  //renderer

  renderer = new WebGPURenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 1;
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 3;
  controls.maxDistance = 6;
  controls.update();

  const ktx2Loader = new KTX2Loader().setTranscoderPath('../src/libs/basis/').detectSupport(renderer);

  const loader = new GLTFLoader();
  loader.setKTX2Loader(ktx2Loader);
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load('models/gltf/coffeemat.glb', function (gltf) {
    const gltfScene = gltf.scene;
    gltfScene.position.y = -0.8;
    gltfScene.scale.setScalar(0.01);

    scene.add(gltfScene);
  });

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.render(scene, camera);
}
