import * as THREE from '../src/Three.js';
import {
  checker,
  color,
  float,
  MeshStandardNodeMaterial,
  oscSine,
  PropertyNodes,
  timerLocal,
  toneMapping,
  uv,
  vec3,
  viewportSharedTexture,
  viewportTopLeft,
} from '../src/nodes/Nodes.js';
import { GLTFLoader } from '../src/loaders/GLTFLoader.js';
import WebGPURenderer from '../src/WebGPURenderer.js';
import { OrbitControls } from '../src/controls/OrbitControls.js';
import { withRender, withResizer } from './patterns/patterns.js';
import { LinearToneMapping } from '../src/constants.js';

let portals,
  rotate = true;
let mixer, clock;

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 100);
camera.position.set(1, 2, 3);

const scene = new THREE.Scene();
scene.background = new THREE.Color('lightblue');
camera.lookAt(0, 1, 0);

clock = new THREE.Clock();

//lights

const light = new THREE.SpotLight(0xffffff, 1);
light.power = 2000;
camera.add(light);
scene.add(camera);

const loader = new GLTFLoader();
loader.load('models/gltf/Michelle.glb', function (gltf) {
  const object = gltf.scene;
  mixer = new THREE.AnimationMixer(object);

  const material = object.children[0].children[0].material;

  // output material effect ( better using hsv )
  // ignore output.sRGBToLinear().linearTosRGB() for now

  material.outputNode = oscSine(timerLocal(0.1)).mix(
    PropertyNodes.output,
    PropertyNodes.output.add(0.1).posterize(4).mul(2),
  );

  const action = mixer.clipAction(gltf.animations[0]);
  action.play();

  scene.add(object);
});

// portals

const geometry = new THREE.SphereGeometry(0.3, 32, 16);

portals = new THREE.Group();
scene.add(portals);

function addBackdropSphere(backdropNode, backdropAlphaNode = null) {
  const distance = 1;
  const id = portals.children.length;
  const rotation = THREE.MathUtils.degToRad(id * 45);

  const material = new MeshStandardNodeMaterial({ color: 0x0066ff });
  material.roughnessNode = float(0.2);
  material.metalnessNode = float(0);
  material.backdropNode = backdropNode;
  material.backdropAlphaNode = backdropAlphaNode;
  material.transparent = true;

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(Math.cos(rotation) * distance, 1, Math.sin(rotation) * distance);

  portals.add(mesh);
}

addBackdropSphere(viewportSharedTexture().bgr.hue(oscSine().mul(Math.PI)));
addBackdropSphere(viewportSharedTexture().rgb.oneMinus());
addBackdropSphere(viewportSharedTexture().rgb.saturation(0));
addBackdropSphere(viewportSharedTexture().rgb.saturation(10), oscSine());
addBackdropSphere(viewportSharedTexture().rgb.overlay(checker(uv().mul(10))));
addBackdropSphere(viewportSharedTexture(viewportTopLeft.mul(40).floor().div(40)));
addBackdropSphere(viewportSharedTexture(viewportTopLeft.mul(80).floor().div(80)).add(color(0x0033ff)));
addBackdropSphere(vec3(0, 0, viewportSharedTexture().b));

const renderer = new WebGPURenderer();
renderer.toneMappingNode = toneMapping(LinearToneMapping, 0.15);
renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  if (rotate) portals.rotation.y += delta * 0.5;
  renderer.render(scene, camera);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.addEventListener('start', () => (rotate = false));
controls.addEventListener('end', () => (rotate = true));
controls.update();

withRender(renderer);
withResizer(renderer, camera);
