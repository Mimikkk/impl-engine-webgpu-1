import * as THREE from '../src/Three.js';
import { MeshBasicNodeMaterial, texture } from '../src/nodes/Nodes.js';

import WebGPURenderer from '../src/WebGPURenderer.js';

import { OrbitControls } from '../src/controls/OrbitControls.js';

let camera, scene, controls, renderer;

let cameraFX, sceneFX, renderTarget;

const dpr = window.devicePixelRatio;

init();

function init() {
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 20);
  camera.position.z = 4;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);
  scene.overrideMaterial = new MeshBasicNodeMaterial();

  //

  const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 64);

  const count = 50;
  const scale = 5;

  for (let i = 0; i < count; i++) {
    const r = Math.random() * 2.0 * Math.PI;
    const z = Math.random() * 2.0 - 1.0;
    const zScale = Math.sqrt(1.0 - z * z) * scale;

    const mesh = new THREE.Mesh(geometry);
    mesh.position.set(Math.cos(r) * zScale, Math.sin(r) * zScale, z * scale);
    mesh.rotation.set(Math.random(), Math.random(), Math.random());
    scene.add(mesh);
  }

  //

  renderer = new WebGPURenderer();
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  const depthTexture = new THREE.DepthTexture();
  depthTexture.type = THREE.FloatType;

  renderTarget = new THREE.RenderTarget(window.innerWidth * dpr, window.innerHeight * dpr);
  renderTarget.depthTexture = depthTexture;

  window.addEventListener('resize', onWindowResize);

  // FX

  cameraFX = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  sceneFX = new THREE.Scene();

  const geometryFX = new THREE.PlaneGeometry(2, 2);

  //

  const materialFX = new MeshBasicNodeMaterial();
  materialFX.colorNode = texture(depthTexture);

  const quad = new THREE.Mesh(geometryFX, materialFX);
  sceneFX.add(quad);

  //

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderTarget.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
}

function animate() {
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, camera);

  renderer.setRenderTarget(null);
  renderer.render(sceneFX, cameraFX);
}
