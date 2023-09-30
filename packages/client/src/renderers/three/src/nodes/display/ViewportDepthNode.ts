import { Node } from '../core/Node.js';
import { nodeImmutable, nodeProxy } from '../shadernode/ShaderNode.js';
import { CameraNodes } from '../accessors/CameraNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { viewportDepthTexture } from './ViewportDepthTextureNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

import TextureNode from '../accessors/TextureNode.js';

export class ViewportDepthNode extends Node {
  isViewportDepthNode: boolean = true;

  scope: ViewportDepthNode.Scope;
  textureNode: TextureNode | null;

  constructor(scope: ViewportDepthNode.Scope, textureNode: TextureNode | null = null) {
    super('float');
    this.scope = scope;
    this.textureNode = textureNode;
  }

  construct(builder: NodeBuilder) {
    const { scope } = this;

    let node = null;

    if (scope === ViewportDepthNode.Scope.Depth) {
      node = viewZToOrthographicDepth(PositionNodes.view.z, CameraNodes.near, CameraNodes.far);
    } else if (scope === ViewportDepthNode.Scope.DepthTexture) {
      const texture = this.textureNode || viewportDepthTexture();

      const viewZ = perspectiveDepthToViewZ(texture, CameraNodes.near, CameraNodes.far);
      node = viewZToOrthographicDepth(viewZ, CameraNodes.near, CameraNodes.far);
    }

    return node;
  }
}

export namespace ViewportDepthNode {
  export enum Scope {
    Depth = 'depth',
    DepthTexture = 'depthTexture',
  }
}

// NOTE: viewZ, the z-coordinate in camera space, is negative for points in front of the camera

// -near maps to 0; -far maps to 1
export const viewZToOrthographicDepth = (viewZ, near, far) => viewZ.add(near).div(near.sub(far));

// maps orthographic depth in [ 0, 1 ] to viewZ
export const orthographicDepthToViewZ = (depth, near, far) => near.sub(far).mul(depth).sub(near);

// NOTE: https://twitter.com/gonnavis/status/1377183786949959682

// -near maps to 0; -far maps to 1
export const viewZToPerspectiveDepth = (viewZ, near, far) => near.add(viewZ).mul(far).div(near.sub(far).mul(viewZ));

// maps perspective depth in [ 0, 1 ] to viewZ
export const perspectiveDepthToViewZ = (depth, near, far) => near.mul(far).div(far.sub(near).mul(depth).sub(far));

ViewportDepthNode.DEPTH = 'depth';
ViewportDepthNode.DEPTH_TEXTURE = 'depthTexture';

export default ViewportDepthNode;

export const depth = nodeImmutable(ViewportDepthNode, ViewportDepthNode.DEPTH);
export const depthTexture = nodeProxy(ViewportDepthNode, ViewportDepthNode.DEPTH_TEXTURE);
