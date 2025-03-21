import * as THREE from '../src/Three.js';
import { cubeTexture, float, mix, OscNodes, TimerNodes, toneMapping } from '../src/nodes/Nodes.js';

import WebGPURenderer from '../src/WebGPURenderer.js';

import { RGBMLoader } from '../src/loaders/RGBMLoader.js';

import { OrbitControls } from '../src/controls/OrbitControls.js';
import { GLTFLoader } from '../src/loaders/GLTFLoader.js';

let camera, scene, renderer;

init();

function init() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
  camera.position.set(-1.8, 0.6, 2.7);

  scene = new THREE.Scene();

  const rgbmUrls = ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'];
  const cube1Texture = new RGBMLoader().setMaxRange(16).setPath('./textures/cube/pisaRGBM16/').loadCubemap(rgbmUrls);

  cube1Texture.generateMipmaps = true;
  cube1Texture.minFilter = THREE.LinearMipmapLinearFilter;

  const cube2Urls = [
    'dark-s_px.jpg',
    'dark-s_nx.jpg',
    'dark-s_py.jpg',
    'dark-s_ny.jpg',
    'dark-s_pz.jpg',
    'dark-s_nz.jpg',
  ];
  const cube2Texture = new THREE.CubeTextureLoader().setPath('./textures/cube/MilkyWay/').load(cube2Urls);

  cube2Texture.generateMipmaps = true;
  cube2Texture.minFilter = THREE.LinearMipmapLinearFilter;

  scene.environmentNode = mix(
    cubeTexture(cube2Texture),
    cubeTexture(cube1Texture),
    OscNodes.sine(TimerNodes.local(0.1)),
  );

  scene.backgroundNode = scene.environmentNode.context({
    getSamplerLevelNode: () => float(1),
  });

  const loader = new GLTFLoader().setPath('models/gltf/DamagedHelmet/glTF/');
  loader.load('DamagedHelmet.gltf', function (gltf) {
    scene.add(gltf.scene);
  });

  renderer = new WebGPURenderer();

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMappingNode = toneMapping(THREE.LinearToneMapping, 1);
  renderer.setAnimationLoop(render);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 2;
  controls.maxDistance = 10;

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function render() {
  renderer.render(scene, camera);
}
