import * as THREE from '../src/Three.js';
import { toneMapping } from '../src/nodes/Nodes.js';

import { GLTFLoader } from '../src/loaders/GLTFLoader.js';

import WebGPURenderer from '../src/WebGPURenderer.js';

let camera, scene, renderer;

let mixer, clock;

init();

function init() {
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.set(1, 2, 3);

  scene = new THREE.Scene();
  scene.background = new THREE.Color('lightblue');
  camera.lookAt(0, 1, 0);

  clock = new THREE.Clock();

  //lights

  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.power = 2500;
  camera.add(light);
  scene.add(camera);

  const loader = new GLTFLoader();
  loader.load('models/gltf/Michelle.glb', function (gltf) {
    const object = gltf.scene;
    mixer = new THREE.AnimationMixer(object);

    const action = mixer.clipAction(gltf.animations[0]);
    action.play();

    scene.add(object);
  });

  //renderer

  renderer = new WebGPURenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.toneMappingNode = toneMapping(THREE.LinearToneMapping, 0.15);
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);
}
