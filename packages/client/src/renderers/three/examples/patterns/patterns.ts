import { PerspectiveCamera } from '../../src/cameras/PerspectiveCamera.js';
import { WebGPURenderer } from '../../src/WebGPURenderer.js';

export const withResizer = (renderer: WebGPURenderer, camera: PerspectiveCamera) => {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};

export const withRender = (renderer: WebGPURenderer) => {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);
};
