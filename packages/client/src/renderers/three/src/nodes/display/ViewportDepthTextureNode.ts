import { ViewportTextureNode } from './ViewportTextureNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { ViewportNodes } from './ViewportNode.js';
import { Node } from '../core/Node.js';
import { DepthFormat, DepthTexture, LinearMipmapLinearFilter, UnsignedIntType } from '../../Three.js';

let sharedDepthbuffer: DepthTexture | null = null;

export class ViewportDepthTextureNode extends ViewportTextureNode {
  constructor(uvNode = ViewportNodes.topLeft, levelNode: Node | null = null) {
    if (sharedDepthbuffer === null) {
      sharedDepthbuffer = new DepthTexture(0, 0);
      sharedDepthbuffer.minFilter = LinearMipmapLinearFilter;
      sharedDepthbuffer.type = UnsignedIntType;
      sharedDepthbuffer.format = DepthFormat;
    }

    super(uvNode, levelNode, sharedDepthbuffer as any);
  }
}

export const viewportDepthTexture = nodeProxy(ViewportDepthTextureNode);

addNodeElement('viewportDepthTexture', viewportDepthTexture);
