import { TempNode } from '../core/TempNode.js';
import { dot, mix } from '../math/MathNode.js';
import { add } from '../math/OperatorNode.js';
import { addNodeElement, float, mat3, nodeProxy, tslFn, vec3 } from '../shadernode/ShaderNode.js';
import { NodeType } from '../core/constants.js';
import { Node } from '../core/Node.js';

const saturationNode = tslFn(({ color, adjustment }) => adjustment.mix(ColorAdjustmentNodes.luminance(color), color));
const vibranceNode = tslFn(({ color, adjustment }) => {
  const average = add(color.r, color.g, color.b).div(3.0);

  const mx = color.r.max(color.g.max(color.b));
  const amt = mx.sub(average).mul(adjustment).mul(-3.0);

  return mix(color, mx, amt);
});
const hueNode = tslFn(({ color, adjustment }) => {
  const RGBtoYIQ = mat3(0.299, 0.587, 0.114, 0.595716, -0.274453, -0.321263, 0.211456, -0.522591, 0.311135);
  const YIQtoRGB = mat3(1.0, 0.9563, 0.621, 1.0, -0.2721, -0.6474, 1.0, -1.107, 1.7046);

  const yiq = RGBtoYIQ.mul(color);

  const hue = yiq.z.atan2(yiq.y).add(adjustment);
  const chroma = yiq.yz.length();

  return YIQtoRGB.mul(vec3(yiq.x, chroma.mul(hue.cos()), chroma.mul(hue.sin())));
});

export class ColorAdjustmentNode extends TempNode {
  method: ColorAdjustmentNode.Method;
  colorNode: Node;
  adjustmentNode: Node;

  constructor(method: ColorAdjustmentNode.Method, colorNode: Node, adjustmentNode: Node = float(1)) {
    super(NodeType.Vector3);

    this.method = method;

    this.colorNode = colorNode;
    this.adjustmentNode = adjustmentNode;
  }

  construct() {
    const callParams = { color: this.colorNode, adjustment: this.adjustmentNode };

    switch (this.method) {
      case ColorAdjustmentNode.Method.Saturation:
        return saturationNode(callParams);
      case ColorAdjustmentNode.Method.Vibrance:
        return vibranceNode(callParams);
      case ColorAdjustmentNode.Method.Hue:
        return hueNode(callParams);
    }
  }
}
export namespace ColorAdjustmentNode {
  export enum Method {
    Saturation = 'saturation',
    Vibrance = 'vibrance',
    Hue = 'hue',
  }
}
export namespace ColorAdjustmentNodes {
  export const saturation = nodeProxy(ColorAdjustmentNode, ColorAdjustmentNode.Method.Saturation);
  export const vibrance = nodeProxy(ColorAdjustmentNode, ColorAdjustmentNode.Method.Vibrance);
  export const hue = nodeProxy(ColorAdjustmentNode, ColorAdjustmentNode.Method.Hue);

  export const lumaCoeffs = vec3(0.2125, 0.7154, 0.0721);
  export const luminance = (color: any, luma: any = lumaCoeffs) => dot(color, luma);
}

addNodeElement('saturation', ColorAdjustmentNodes.saturation);
addNodeElement('vibrance', ColorAdjustmentNodes.vibrance);
addNodeElement('hue', ColorAdjustmentNodes.hue);
