import * as THREE from '../src/Three.js';
import * as Nodes from '../src/nodes/Nodes.js';
import { NodeLanguage } from '../src/nodes/Nodes.js';

import WebGPURenderer from '../src/WebGPURenderer.js';
import WGSLNodeBuilder from '../src/nodes/WebGPUNodeBuilder.js';

import { GUI } from 'lil-gui';

init();

function init() {
  // add the depedencies

  const width = 200;
  const height = 200;

  const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 10);
  camera.position.z = 0.72;
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  const rendererDOM = document.getElementById('renderer');

  const renderer = new WebGPURenderer();
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(200, 200);
  rendererDOM.appendChild(renderer.domElement);

  const material = new Nodes.NodeMaterial();
  material.outputNode = Nodes.vec4(0, 0, 0, 1);

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  scene.add(mesh);

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  // editor

  require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs' } });

  require(['vs/editor/editor.main'], () => {
    const options = {
      shader: 'fragment',
      outputColorSpace: THREE.LinearSRGBColorSpace,
      output: NodeLanguage.Wgsl,
      preview: true,
    };

    let timeout = null;
    let nodeBuilder = null;

    const editorDOM = document.getElementById('source');
    const resultDOM = document.getElementById('result');

    const tslCode = `
const { texture, uniform, vec2, vec4, uv, OscNodes, TimerNodes } = TSL;

const samplerTexture = new THREE.TextureLoader().load('./textures/uv_grid_opengl.jpg');
samplerTexture.wrapS = THREE.RepeatWrapping;

const timer = TimerNodes.local(.5);
const uv0 = uv();
const animateUv = vec2(uv0.x.add(OscNodes.sine(timer)), uv0.y);

const myMap = texture(samplerTexture, animateUv).rgb.label('myTexture');
const myColor = uniform(new THREE.Color(0x0066ff)).label('myColor');
const opacity = .7;

const desaturatedMap = myMap.rgb.saturation(0);//.temp('myVar');
const finalColor = desaturatedMap.add(myColor);
output = vec4(finalColor, opacity);
`;

    const editor = window.monaco.editor.create(editorDOM, {
      value: tslCode,
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
    });

    const result = window.monaco.editor.create(resultDOM, {
      value: '',
      language: NodeLanguage.Wgsl,
      theme: 'vs-dark',
      automaticLayout: true,
      readOnly: true,
    });

    const showCode = () => {
      result.setValue(nodeBuilder[options.shader + 'Shader']);
      result.revealLine(1);
    };

    const build = () => {
      try {
        const tslCode = `let output = null;\n${editor.getValue()}\nreturn { output };`;
        const nodes = new Function('THREE', 'TSL', tslCode)(THREE, Nodes);

        mesh.material.outputNode = nodes.output;
        mesh.material.needsUpdate = true;

        const NodeBuilder = WGSLNodeBuilder;

        nodeBuilder = new NodeBuilder(mesh, renderer);
        nodeBuilder.build();

        showCode();
      } catch (e) {
        result.setValue('Error: ' + e.message);
      }
    };

    build();

    editor.getModel().onDidChangeContent(() => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(build, 1000);
    });

    // gui

    const gui = new GUI();

    gui.add(options, 'output', ['GLSL', 'WGSL']).onChange(build);
    gui.add(options, 'shader', ['vertex', 'fragment']).onChange(showCode);

    gui.add(options, 'outputColorSpace', [THREE.LinearSRGBColorSpace, THREE.SRGBColorSpace]).onChange(value => {
      renderer.outputColorSpace = value;

      build();
    });

    gui.add(options, 'preview').onChange(value => {
      rendererDOM.style.display = value ? '' : 'none';
    });
  });
}
