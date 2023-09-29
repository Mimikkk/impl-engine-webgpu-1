import { PerspectiveCamera } from '../../src/cameras/PerspectiveCamera.js';
import { WebGPURenderer } from '../../src/WebGPURenderer.js';
import { Renderer } from '../../../webgpu/createRenderer.js';

export const createResizer = (renderer: WebGPURenderer, camera: PerspectiveCamera) => {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};

export const containRenderer = (renderer: Renderer) => {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const container = document.createElement('div');
  document.body.appendChild(container);
  container.appendChild(renderer.domElement);
};
