import { ViewportTextureNode } from './ViewportTextureNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { Node } from '../core/Node.js';
import { ViewportNodes } from './ViewportNode.js';
import { FramebufferTexture } from '../../Three.js';

let sharedFramebuffer: FramebufferTexture | null = null;

export class ViewportSharedTextureNode extends ViewportTextureNode {
  constructor(uvNode = ViewportNodes.topLeft, levelNode: Node | null = null) {
    if (sharedFramebuffer === null) {
      sharedFramebuffer = new FramebufferTexture(0, 0);
    }

    super(uvNode, levelNode, sharedFramebuffer);
  }
}

export const viewportSharedTexture = nodeProxy(ViewportSharedTextureNode);

addNodeElement('viewportSharedTexture', viewportSharedTexture);
