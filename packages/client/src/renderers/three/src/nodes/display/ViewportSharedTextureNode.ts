import ViewportTextureNode from './ViewportTextureNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { viewportTopLeft } from './ViewportNode.js';
import { FramebufferTexture } from '../../Three.js';

let sharedFramebuffer = null;

class ViewportSharedTextureNode extends ViewportTextureNode {
  constructor(uvNode = viewportTopLeft, levelNode = null) {
    if (sharedFramebuffer === null) {
      sharedFramebuffer = new FramebufferTexture();
    }

    super(uvNode, levelNode, sharedFramebuffer);
  }
}

export default ViewportSharedTextureNode;

export const viewportSharedTexture = nodeProxy(ViewportSharedTextureNode);

addNodeElement('viewportSharedTexture', viewportSharedTexture);
