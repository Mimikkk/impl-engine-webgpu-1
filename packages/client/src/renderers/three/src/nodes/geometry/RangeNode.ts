import { Node } from '../core/Node.js';
import { getValueType } from '../core/NodeUtils.js';
import { buffer } from '../accessors/BufferNode.js';
import { instanceIndex } from '../core/IndexNode.js';
import { float, nodeProxy } from '../shadernode/ShaderNode.js';

import { MathUtils, Vector4 } from '../../Three.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

let min: Vector4 | null = null;
let max: Vector4 | null = null;

export class RangeNode extends Node {
  minNode: Node;
  maxNode: Node;

  constructor(minNode: Node = float(), maxNode: Node = float()) {
    super();

    this.minNode = minNode;
    this.maxNode = maxNode;
  }

  getVectorLength(builder: NodeBuilder) {
    const minLength = builder.getTypeLength(getValueType(this.minNode.value));
    const maxLength = builder.getTypeLength(getValueType(this.maxNode.value));

    return minLength > maxLength ? minLength : maxLength;
  }

  getNodeType(builder: NodeBuilder) {
    return builder.object.isInstancedMesh === true ? builder.getTypeFromLength(this.getVectorLength(builder)) : 'float';
  }

  construct(builder: NodeBuilder) {
    const object = builder.object;

    let output = null;

    if (object.isInstancedMesh === true) {
      const minValue = this.minNode.value;
      const maxValue = this.maxNode.value;

      const minLength = builder.getTypeLength(getValueType(minValue));
      const maxLength = builder.getTypeLength(getValueType(maxValue));

      min = min || new Vector4();
      max = max || new Vector4();

      min.setScalar(0);
      max.setScalar(0);

      if (minLength === 1) min.setScalar(minValue);
      else if (minValue.isColor) min.set(minValue.r, minValue.g, minValue.b);
      else min.set(minValue.x, minValue.y, minValue.z || 0, minValue.w || 0);

      if (maxLength === 1) max.setScalar(maxValue);
      else if (maxValue.isColor) max.set(maxValue.r, maxValue.g, maxValue.b);
      else max.set(maxValue.x, maxValue.y, maxValue.z || 0, maxValue.w || 0);

      const stride = 4;

      const length = stride * object.count;
      const array = new Float32Array(length);

      for (let i = 0; i < length; i++) {
        const index = i % stride;

        const minElementValue = min.getComponent(index);
        const maxElementValue = max.getComponent(index);

        array[i] = MathUtils.lerp(minElementValue, maxElementValue, Math.random());
      }

      const nodeType = this.getNodeType(builder);

      output = buffer(array, NodeType.Vector4, object.count).element(instanceIndex).convert(nodeType);
    } else {
      output = float(0);
    }

    return output;
  }
}

export const range = nodeProxy(RangeNode);
