import { NodeMaterial, addNodeMaterial } from './NodeMaterial.js';
import { uniform } from '../core/UniformNode.js';
import { CameraNodes } from '../accessors/CameraNode.js';
import { MaterialNodes } from '../accessors/MaterialNode.js';
import { ModelNodes } from '../accessors/ModelNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { float, vec2, vec3, vec4 } from '../shadernode/ShaderNode.js';

import { SpriteMaterial } from '../../Three.js';
import Node from 'three/examples/jsm/nodes/core/Node.js';
import { ShaderMaterialParameters } from 'three/src/Three.js';

const defaultValues = new SpriteMaterial();

export class SpriteNodeMaterial extends NodeMaterial {
  isSpriteNodeMaterial: true;
  lightNode: Node | null;
  rotationNode: Node | null;
  scaleNode: Node | null;

  constructor(parameters?: ShaderMaterialParameters) {
    super();

    this.isSpriteNodeMaterial = true;

    this.lights = false;
    this.normals = false;

    this.colorNode = null;
    this.opacityNode = null;

    this.alphaTestNode = null;

    this.lightNode = null;

    this.positionNode = null;
    this.rotationNode = null;
    this.scaleNode = null;

    this.setDefaultValues(defaultValues);

    this.setValues(parameters as any);
  }

  constructPosition({ object, context }: any) {
    // < VERTEX STAGE >

    const { positionNode, rotationNode, scaleNode } = this;

    const vertex = PositionNodes.local;

    let mvPosition = ModelNodes.viewMatrix.mul(vec3(positionNode || 0));

    let scale = vec2(ModelNodes.worldMatrix[0].xyz.length(), ModelNodes.worldMatrix[1].xyz.length());

    if (scaleNode !== null) {
      scale = scale.mul(scaleNode);
    }

    let alignedPosition = vertex.xy;

    if (object.center && object.center.isVector2 === true) {
      alignedPosition = alignedPosition.sub(uniform(object.center).sub(0.5));
    }

    alignedPosition = alignedPosition.mul(scale);

    const rotation = float(rotationNode || MaterialNodes.rotation);

    const cosAngle = rotation.cos();
    const sinAngle = rotation.sin();

    const rotatedPosition = vec2(
      vec2(cosAngle, sinAngle.negate()).dot(alignedPosition),
      vec2(sinAngle, cosAngle).dot(alignedPosition),
    );

    mvPosition = vec4(mvPosition.xy.add(rotatedPosition), mvPosition.zw);

    const modelViewProjection = CameraNodes.matrix.projection.mul(mvPosition);

    context.vertex = vertex;

    return modelViewProjection;
  }

  copy(source: SpriteNodeMaterial) {
    this.positionNode = source.positionNode;
    this.rotationNode = source.rotationNode;
    this.scaleNode = source.scaleNode;

    return super.copy(source);
  }
}

export default SpriteNodeMaterial;

addNodeMaterial(SpriteNodeMaterial);
