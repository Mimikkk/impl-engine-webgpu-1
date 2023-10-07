import { TempNode } from '../core/TempNode.js';
import { mix } from '../math/MathNode.js';
import { addNodeElement, nodeObject, nodeProxy, tslFn, vec4 } from '../shadernode/ShaderNode.js';
import { LinearSRGBColorSpace, SRGBColorSpace } from '../../constants.js';
import { NodeType } from '../core/constants.js';
import { Node } from '../core/Node.js';

const sRGBToLinearShader = tslFn(inputs => {
  const { value } = inputs;
  const { rgb } = value;

  const a = rgb.mul(0.9478672986).add(0.0521327014).pow(2.4);
  const b = rgb.mul(0.0773993808);
  const factor = rgb.lessThanEqual(0.04045);

  const rgbResult = mix(a, b, factor);

  return vec4(rgbResult, value.a);
});

const LinearTosRGBShader = tslFn(inputs => {
  const { value } = inputs;
  const { rgb } = value;

  const a = rgb.pow(0.41666).mul(1.055).sub(0.055);
  const b = rgb.mul(12.92);
  const factor = rgb.lessThanEqual(0.0031308);

  const rgbResult = mix(a, b, factor);

  return vec4(rgbResult, value.a);
});

type SupportedColorSpace = typeof LinearSRGBColorSpace | typeof SRGBColorSpace;

const getColorSpaceMethod = (colorSpace: SupportedColorSpace) => {
  switch (colorSpace) {
    case LinearSRGBColorSpace:
      return 'Linear';
    case SRGBColorSpace:
      return 'sRGB';
  }
};

const getMethod = (source: SupportedColorSpace, target: SupportedColorSpace) =>
  `${getColorSpaceMethod(source)}To${getColorSpaceMethod(target)}`;

export class ColorSpaceNode extends TempNode {
  method: ColorSpaceNode.Method;
  node: Node;

  constructor(method: ColorSpaceNode.Method, node: Node) {
    super(NodeType.Vector4);
    this.method = method;
    this.node = node;
  }

  construct() {
    switch (this.method) {
      case ColorSpaceNode.Method.LinearToLinear:
        return this.node;
      case ColorSpaceNode.Method.LinearToSRgb:
        return LinearTosRGBShader({ value: this.node });
      case ColorSpaceNode.Method.SRgbToLinear:
        return sRGBToLinearShader({ value: this.node });
    }
  }
}
export namespace ColorSpaceNode {
  export enum Method {
    LinearToLinear = 'LinearToLinear',
    LinearToSRgb = 'LinearTosRGB',
    SRgbToLinear = 'sRGBToLinear',
  }
}
export namespace ColorSpaceNodes {
  export const linearTosRGB = nodeProxy(ColorSpaceNode, ColorSpaceNode.Method.LinearToSRgb);
  export const sRGBToLinear = nodeProxy(ColorSpaceNode, ColorSpaceNode.Method.SRgbToLinear);

  export const linearToColorSpace = (node: Node, colorSpace: SupportedColorSpace) =>
    nodeObject(new ColorSpaceNode(getMethod(LinearSRGBColorSpace, colorSpace) as any, nodeObject(node)));
  export const colorSpaceToLinear = (node: Node, colorSpace: SupportedColorSpace) =>
    nodeObject(new ColorSpaceNode(getMethod(colorSpace, LinearSRGBColorSpace) as any, nodeObject(node)));
}

addNodeElement('linearTosRGB', ColorSpaceNodes.linearTosRGB);
addNodeElement('sRGBToLinear', ColorSpaceNodes.sRGBToLinear);
addNodeElement('linearToColorSpace', ColorSpaceNodes.linearToColorSpace);
addNodeElement('colorSpaceToLinear', ColorSpaceNodes.colorSpaceToLinear);
