import { Node } from '../core/Node.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { reference } from './ReferenceNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { Scene } from '../../scenes/Scene.js';

export class SceneNode extends Node {
  scope: SceneNode.Scope;
  scene: Scene | null;

  constructor(scope: SceneNode.Scope, scene: Scene | null = null) {
    super();
    this.scope = scope;
    this.scene = scene;
  }

  construct(builder: NodeBuilder) {
    const scene = this?.scene ?? builder.scene;

    switch (this.scope) {
      case SceneNode.Scope.BackgroundBlurriness:
        return reference('backgroundBlurriness', 'float', scene);
      case SceneNode.Scope.BackgroundIntensity:
        return reference('backgroundIntensity', 'float', scene);
    }
  }
}

export namespace SceneNode {
  export enum Scope {
    BackgroundBlurriness = 'backgroundBlurriness',
    BackgroundIntensity = 'backgroundIntensity',
  }
}

export namespace SceneNodes {
  export const blurriness = nodeImmutable(SceneNode, SceneNode.Scope.BackgroundBlurriness);
  export const intensity = nodeImmutable(SceneNode, SceneNode.Scope.BackgroundIntensity);
}
