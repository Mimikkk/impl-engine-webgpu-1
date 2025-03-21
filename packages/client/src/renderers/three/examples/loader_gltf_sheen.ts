import * as THREE from '../src/Three.js';

import WebGPURenderer from '../src/WebGPURenderer.js';

import { OrbitControls } from '../src/controls/OrbitControls.js';
import { GLTFLoader } from '../src/loaders/GLTFLoader.js';
import { RGBELoader } from '../src/loaders/RGBELoader.js';

import { GUI } from 'lil-gui';

let camera, scene, renderer, controls;

init();
animate();

function init() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20);
  camera.position.set(-0.75, 0.7, 1.25);

  scene = new THREE.Scene();
  //scene.add( new THREE.DirectionalLight( 0xffffff, 2 ) );

  // model

  new GLTFLoader().setPath('models/gltf/').load('SheenChair.glb', function (gltf) {
    scene.add(gltf.scene);

    const object = gltf.scene.getObjectByName('SheenChair_fabric');

    const gui = new GUI();

    gui.add(object.material, 'sheen', 0, 1);
    gui.open();
  });

  renderer = new WebGPURenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  container.appendChild(renderer.domElement);

  scene.background = new THREE.Color(0xaaaaaa);

  new RGBELoader().setPath('textures/equirectangular/').load('royal_esplanade_1k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;

    scene.background = texture;
    //scene.backgroundBlurriness = 1; // @TODO: Needs PMREM
    scene.environment = texture;
  });

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 1;
  controls.maxDistance = 10;
  controls.target.set(0, 0.35, 0);
  controls.update();

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  requestAnimationFrame(animate);

  controls.update(); // required if damping enabled

  render();
}

function render() {
  renderer.render(scene, camera);
}
