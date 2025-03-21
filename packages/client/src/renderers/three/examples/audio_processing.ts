import {
  color,
  float,
  instanceIndex,
  ShaderNode,
  storage,
  texture,
  uniform,
  ViewportNodes,
} from '../src/nodes/Nodes.js';
import { GUI } from 'lil-gui';
import { createRenderer } from '../src/WebGPURenderer.js';
import { PerspectiveCamera } from '../src/cameras/PerspectiveCamera.js';
import { DataTexture } from '../src/textures/DataTexture.js';
import { Scene } from '../src/scenes/Scene.js';
import { InstancedBufferAttribute } from '../src/core/InstancedBufferAttribute.js';
import { RedFormat } from '../src/constants.js';
import { withRender, withResizer } from './patterns/patterns.js';

let audio: any;
let analyser: any;

const audioContext = new AudioContext();

const analyserBuffer = new Uint8Array(1024);
const soundBuffer = await fetch('sounds/webgpu-audio-processing.mp3').then(res => res.arrayBuffer());
const audioBuffer = await audioContext.decodeAudioData(soundBuffer);
const waveBuffer = new Float32Array([...audioBuffer.getChannelData(0), ...new Float32Array(200000)]);
const waveGPUBuffer = new InstancedBufferAttribute(waveBuffer, 1);

const sampleRate = audioBuffer.sampleRate / audioBuffer.numberOfChannels;

const waveStorageNode = storage(waveGPUBuffer, 'float', waveBuffer.length);

const waveNode = storage(new InstancedBufferAttribute(waveBuffer, 1), 'float', waveBuffer.length);

const pitch = uniform(1.5);
const delayVolume = uniform(0.2);
const delayOffset = uniform(0.55);

const computeShaderNode = new ShaderNode(stack => {
  const index = float(instanceIndex);

  // pitch

  const time = index.mul(pitch);

  let wave = waveNode.element(time);

  // delay

  for (let i = 1; i < 7; i++) {
    const waveOffset = waveNode.element(index.sub(delayOffset.mul(sampleRate).mul(i)).mul(pitch));
    const waveOffsetVolume = waveOffset.mul(delayVolume.div(i * i));

    wave = wave.add(waveOffsetVolume);
  }

  const waveStorageElementNode = waveStorageNode.element(instanceIndex);

  stack.assign(waveStorageElementNode, wave);
});

const computeNode = computeShaderNode.compute(waveBuffer.length);

const gui = new GUI({ title: 'Audio Processing' });
gui.add(pitch, 'value', 0.5, 2, 0.01).name('Pitch');
gui.add(delayVolume, 'value', 0, 1, 0.01).name('Delay Volume');
gui.add(delayOffset, 'value', 0.1, 1, 0.01).name('Delay Offset');

document.onclick = async () => {
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.remove();

  if (audio) audio.stop();
  await renderer.compute(computeNode);

  const waveArray = new Float32Array(await renderer.getArrayBufferAsync(waveGPUBuffer));

  const audioOutputContext = new AudioContext({ sampleRate });
  const audioOutputBuffer = audioOutputContext.createBuffer(1, waveArray.length, sampleRate);

  audioOutputBuffer.copyToChannel(waveArray, 0);

  const source = audioOutputContext.createBufferSource();
  source.connect(audioOutputContext.destination);
  source.buffer = audioOutputBuffer;
  source.start();

  audio = source;
  analyser = audioOutputContext.createAnalyser();
  analyser.fftSize = 2048;

  source.connect(analyser);
};

const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 30);
const analyserTexture = new DataTexture(analyserBuffer, analyserBuffer.length, 1, RedFormat);

const scene = new Scene();
scene.backgroundNode = color(0x0000ff).mul(
  texture(analyserTexture, ViewportNodes.topLeft.x).x.mul(ViewportNodes.topLeft.y),
);

const renderer = createRenderer();
renderer.setAnimationLoop(() => {
  if (analyser) {
    analyser.getByteFrequencyData(analyserBuffer);
    analyserTexture.needsUpdate = true;
  }
  renderer.render(scene, camera);
});
withRender(renderer);
withResizer(renderer, camera);
