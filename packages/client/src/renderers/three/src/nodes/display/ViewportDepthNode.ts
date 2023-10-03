import { Node } from '../core/Node.js';
import { nodeImmutable, nodeProxy } from '../shadernode/ShaderNode.js';
import { CameraNodes } from '../accessors/CameraNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { viewportDepthTexture } from './ViewportDepthTextureNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { TextureNode } from '../accessors/TextureNode.js';
import { NodeType } from '../core/constants.js';

export class ViewportDepthNode extends Node {
  isViewportDepthNode: boolean = true;

  scope: ViewportDepthNode.Scope;
  textureNode: TextureNode | null;

  constructor(scope: ViewportDepthNode.Scope, textureNode: TextureNode | null = null) {
    super(NodeType.Float);
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

export const viewZToOrthographicDepth = (viewZ: number, near: number, far: number) =>
  //@ts-expect-error
  viewZ.add(near).div(near.sub(far));
export const orthographicDepthToViewZ = (depth: number, near: number, far: number) =>
  //@ts-expect-error
  near.sub(far).mul(depth).sub(near);
export const viewZToPerspectiveDepth = (viewZ: number, near: number, far: number) =>
  //@ts-expect-error
  near.add(viewZ).mul(far).div(near.sub(far).mul(viewZ));
export const perspectiveDepthToViewZ = (depth: number, near: number, far: number) =>
  //@ts-expect-error
  near.mul(far).div(far.sub(near).mul(depth).sub(far));

export default ViewportDepthNode;

export const depth = nodeImmutable(ViewportDepthNode, ViewportDepthNode.Scope.Depth);
export const depthTexture = nodeProxy(ViewportDepthNode, ViewportDepthNode.Scope.DepthTexture);
