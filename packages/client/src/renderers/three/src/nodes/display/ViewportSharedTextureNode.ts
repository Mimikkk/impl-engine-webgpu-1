import { ViewportTextureNode } from './ViewportTextureNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { Node } from '../core/Node.js';
import { viewportTopLeft } from './ViewportNode.js';
import { FramebufferTexture } from '../../Three.js';

let sharedFramebuffer: FramebufferTexture | null = null;

class ViewportSharedTextureNode extends ViewportTextureNode {
  constructor(uvNode = viewportTopLeft, levelNode: Node | null = null) {
    if (sharedFramebuffer === null) {
      sharedFramebuffer = new FramebufferTexture(0, 0);
    }

    super(uvNode, levelNode, sharedFramebuffer);
  }
}

export default ViewportSharedTextureNode;

export const viewportSharedTexture = nodeProxy(ViewportSharedTextureNode);

addNodeElement('viewportSharedTexture', viewportSharedTexture);
