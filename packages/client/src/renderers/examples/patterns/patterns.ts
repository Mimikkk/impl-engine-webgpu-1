import { Renderer } from '../../webgpu/createRenderer.js';
import { PerspectiveCamera } from '../../webgpu/core/camera/PerspectiveCamera.js';

export const createResize = (renderer: Renderer, camera: PerspectiveCamera) => () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

export const containRenderer = (renderer: Renderer) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  container.appendChild(renderer.domElement);
};
