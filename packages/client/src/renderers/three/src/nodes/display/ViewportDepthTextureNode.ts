import { ViewportTextureNode } from './ViewportTextureNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { viewportTopLeft } from './ViewportNode.js';
import { Node } from '../core/Node.js';
import { DepthFormat, DepthTexture, LinearMipmapLinearFilter, UnsignedIntType } from '../../Three.js';

let sharedDepthbuffer: DepthTexture | null = null;

class ViewportDepthTextureNode extends ViewportTextureNode {
  constructor(uvNode = viewportTopLeft, levelNode: Node | null = null) {
    if (sharedDepthbuffer === null) {
      sharedDepthbuffer = new DepthTexture(0, 0);
      sharedDepthbuffer.minFilter = LinearMipmapLinearFilter;
      sharedDepthbuffer.type = UnsignedIntType;
      sharedDepthbuffer.format = DepthFormat;
    }

    super(uvNode, levelNode, sharedDepthbuffer as any);
  }
}

export default ViewportDepthTextureNode;

export const viewportDepthTexture = nodeProxy(ViewportDepthTextureNode);

addNodeElement('viewportDepthTexture', viewportDepthTexture);
