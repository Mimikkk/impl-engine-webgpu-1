import { Node } from '../core/Node.js';
import { nodeImmutable, nodeProxy } from '../shadernode/ShaderNode.js';
import { CameraNodes } from '../accessors/CameraNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { viewportDepthTexture } from './ViewportDepthTextureNode.js';
import { TextureNode } from '../accessors/TextureNode.js';
import { NodeType } from '../core/constants.js';

export class ViewportDepthNode extends Node {
  scope: ViewportDepthNode.Scope;
  textureNode: TextureNode | null;

  constructor(scope: ViewportDepthNode.Scope, textureNode: TextureNode | null = null) {
    super(NodeType.Float);
    this.scope = scope;
    this.textureNode = textureNode;
  }

  construct() {
    switch (this.scope) {
      case ViewportDepthNode.Scope.Depth:
        return ViewportDepthNodes.viewZToOrthographicDepth(PositionNodes.view.z, CameraNodes.near, CameraNodes.far);
      case ViewportDepthNode.Scope.DepthTexture:
        const texture = this.textureNode || viewportDepthTexture();
        const viewZ = ViewportDepthNodes.perspectiveDepthToViewZ(texture, CameraNodes.near, CameraNodes.far);
        return ViewportDepthNodes.viewZToOrthographicDepth(viewZ, CameraNodes.near, CameraNodes.far);
    }
  }
}

export namespace ViewportDepthNode {
  export enum Scope {
    Depth = 'depth',
    DepthTexture = 'depthTexture',
  }
}
export namespace ViewportDepthNodes {
  export const viewZToOrthographicDepth = (viewZ: number, near: number, far: number) =>
    viewZ.add(near).div(near.sub(far));
  export const orthographicDepthToViewZ = (depth: number, near: number, far: number) =>
    near.sub(far).mul(depth).sub(near);
  export const viewZToPerspectiveDepth = (viewZ: number, near: number, far: number) =>
    near.add(viewZ).mul(far).div(near.sub(far).mul(viewZ));
  export const perspectiveDepthToViewZ = (depth: number, near: number, far: number) =>
    near.mul(far).div(far.sub(near).mul(depth).sub(far));

  export const depth = nodeImmutable(ViewportDepthNode, ViewportDepthNode.Scope.Depth);
  export const depthTexture = nodeProxy(ViewportDepthNode, ViewportDepthNode.Scope.DepthTexture);
}
