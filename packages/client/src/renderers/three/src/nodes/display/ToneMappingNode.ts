import { TempNode } from '../core/TempNode.js';
import { float, mat3, nodeObject, tslFn } from '../shadernode/ShaderNode.js';
import {
  ACESFilmicToneMapping,
  CineonToneMapping,
  Color,
  LinearToneMapping,
  NoToneMapping,
  ReinhardToneMapping,
} from '../../Three.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';
import { Node } from '../core/Node.js';

const LinearToneMappingNode = tslFn(({ color, exposure }) => {
  return color.mul(exposure).clamp();
});
const ReinhardToneMappingNode = tslFn(({ color, exposure }) => {
  color = color.mul(exposure);

  return color.div(color.add(1.0)).clamp();
});
const OptimizedCineonToneMappingNode = tslFn(({ color, exposure }) => {
  // optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
  color = color.mul(exposure);
  color = color.sub(0.004).max(0.0);

  const a = color.mul(color.mul(6.2).add(0.5));
  const b = color.mul(color.mul(6.2).add(1.7)).add(0.06);

  return a.div(b).pow(2.2);
});
const RRTAndODTFit = tslFn(({ color }) => {
  const a = color.mul(color.add(0.0245786)).sub(0.000090537);
  const b = color.mul(color.add(0.432951).mul(0.983729)).add(0.238081);

  return a.div(b);
});
const ACESFilmicToneMappingNode = tslFn(({ color, exposure }) => {
  // sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
  const ACESInputMat = mat3(0.59719, 0.35458, 0.04823, 0.076, 0.90834, 0.01566, 0.0284, 0.13383, 0.83777);

  // ODT_SAT => XYZ => D60_2_D65 => sRGB
  const ACESOutputMat = mat3(1.60475, -0.53108, -0.07367, -0.10208, 1.10813, -0.00605, -0.00327, -0.07276, 1.07602);

  color = color.mul(exposure).div(0.6);

  color = ACESInputMat.mul(color);

  // Apply RRT and ODT
  color = RRTAndODTFit({ color });

  color = ACESOutputMat.mul(color);

  // Clamp to [0, 1]
  return color.clamp();
});

type ToneMapping =
  | typeof NoToneMapping
  | typeof LinearToneMapping
  | typeof ReinhardToneMapping
  | typeof CineonToneMapping
  | typeof ACESFilmicToneMapping;

export class ToneMappingNode extends TempNode {
  toneMapping: ToneMapping;
  exposureNode: Node;
  colorNode: Node | null;

  constructor(toneMapping: ToneMapping = NoToneMapping, exposureNode: Node = float(1), colorNode: Node | null = null) {
    super(NodeType.Vector3);
    this.toneMapping = toneMapping;
    this.exposureNode = exposureNode;
    this.colorNode = colorNode;
  }

  getCacheKey() {
    return `{toneMapping:${this.toneMapping},nodes:${super.getCacheKey()}`;
  }

  construct(builder: NodeBuilder) {
    const colorNode = this.colorNode || builder.context.color;

    switch (this.toneMapping) {
      case NoToneMapping:
        return colorNode;
      case LinearToneMapping:
        return LinearToneMappingNode({ color: colorNode, exposure: this.exposureNode });
      case ReinhardToneMapping:
        return ReinhardToneMappingNode({ color: colorNode, exposure: this.exposureNode });
      case CineonToneMapping:
        return OptimizedCineonToneMappingNode({ color: colorNode, exposure: this.exposureNode });
      case ACESFilmicToneMapping:
        return ACESFilmicToneMappingNode({ color: colorNode, exposure: this.exposureNode });
    }
  }
}

export const toneMapping = (mapping: ToneMapping, exposure: number, color: Color) =>
  nodeObject(new ToneMappingNode(mapping, nodeObject(exposure), nodeObject(color)));
