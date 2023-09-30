import { TempNode } from '../core/TempNode.js';
import { add } from '../math/OperatorNode.js';
import { BitangentNodes } from '../accessors/BitangentNode.js';
import { ModelNodes } from '../accessors/ModelNode.js';
import { NormalNodes } from '../accessors/NormalNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { TangentNodes } from '../accessors/TangentNode.js';
import { uv } from '../accessors/UVNode.js';
import { faceDirection } from './FrontFacingNode.js';
import { mat3, nodeProxy, tslFn, vec3 } from '../shadernode/ShaderNode.js';

import { ObjectSpaceNormalMap, TangentSpaceNormalMap } from '../../Three.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

// Normal Mapping Without Precomputed Tangents
// http://www.thetenthplanet.de/archives/1180

const perturbNormal2Arb = tslFn(inputs => {
  const { eye_pos, surf_norm, mapN, uv } = inputs;

  const q0 = eye_pos.dFdx();
  const q1 = eye_pos.dFdy();
  const st0 = uv.dFdx();
  const st1 = uv.dFdy();

  const N = surf_norm; // normalized

  const q1perp = q1.cross(N);
  const q0perp = N.cross(q0);

  const T = q1perp.mul(st0.x).add(q0perp.mul(st1.x));
  const B = q1perp.mul(st0.y).add(q0perp.mul(st1.y));

  const det = T.dot(T).max(B.dot(B));
  const scale = faceDirection.mul(det.inverseSqrt());

  return add(T.mul(mapN.x, scale), B.mul(mapN.y, scale), N.mul(mapN.z)).normalize();
});

class NormalMapNode extends TempNode {
  constructor(node, scaleNode = null) {
    super('vec3');

    this.node = node;
    this.scaleNode = scaleNode;

    this.normalMapType = TangentSpaceNormalMap;
  }

  construct(builder: NodeBuilder) {
    const { normalMapType, scaleNode } = this;

    let normalMap = this.node.mul(2.0).sub(1.0);

    if (scaleNode !== null) {
      normalMap = vec3(normalMap.xy.mul(scaleNode), normalMap.z);
    }

    let outputNode = null;

    if (normalMapType === ObjectSpaceNormalMap) {
      outputNode = ModelNodes.normalMatrix.mul(normalMap).normalize();
    } else if (normalMapType === TangentSpaceNormalMap) {
      const tangent = builder.hasGeometryAttribute('tangent');

      if (tangent === true) {
        outputNode = TBNViewMatrix.mul(normalMap).normalize();
      } else {
        outputNode = perturbNormal2Arb({
          eye_pos: PositionNodes.view,
          surf_norm: NormalNodes.view,
          mapN: normalMap,
          uv: uv(),
        });
      }
    }

    return outputNode;
  }
}

export default NormalMapNode;

export const normalMap = nodeProxy(NormalMapNode);

export const TBNViewMatrix = mat3(TangentNodes.view, BitangentNodes.view, NormalNodes.view);
