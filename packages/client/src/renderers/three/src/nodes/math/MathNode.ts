import { TempNode } from '../core/TempNode.js';
import { div, mul, sub } from './OperatorNode.js';
import { addNodeElement, float, nodeObject, nodeProxy, vec3, vec4 } from '../shadernode/ShaderNode.js';
import NodeBuilder from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

export enum UnaryMathNode {
  RADIANS = 'radians',
  DEGREES = 'degrees',
  EXP = 'exp',
  EXP2 = 'exp2',
  LOG = 'log',
  LOG2 = 'log2',
  SQRT = 'sqrt',
  INVERSE_SQRT = 'inversesqrt',
  FLOOR = 'floor',
  CEIL = 'ceil',
  NORMALIZE = 'normalize',
  FRACT = 'fract',
  SIN = 'sin',
  COS = 'cos',
  TAN = 'tan',
  ASIN = 'asin',
  ACOS = 'acos',
  ATAN = 'atan',
  ABS = 'abs',
  SIGN = 'sign',
  LENGTH = 'length',
  NEGATE = 'negate',
  ONE_MINUS = 'oneMinus',
  DFDX = 'dFdx',
  DFDY = 'dFdy',
  ROUND = 'round',
  RECIPROCAL = 'reciprocal',
  TRUNC = 'trunc',
  FWIDTH = 'fwidth',
}
export enum BinaryMathNode {
  ATAN2 = 'atan2',
  MIN = 'min',
  MAX = 'max',
  MOD = 'mod',
  STEP = 'step',
  REFLECT = 'reflect',
  DISTANCE = 'distance',
  DIFFERENCE = 'difference',
  DOT = 'dot',
  CROSS = 'cross',
  POW = 'pow',
  TRANSFORM_DIRECTION = 'transformDirection',
}
export enum TrinaryMathNode {
  MIX = 'mix',
  CLAMP = 'clamp',
  REFRACT = 'refract',
  SMOOTHSTEP = 'smoothstep',
  FACEFORWARD = 'faceforward',
}

export type MathNodeMethod = UnaryMathNode | BinaryMathNode | TrinaryMathNode;

export class MathNode extends TempNode {
  aNode: TempNode;
  bNode: TempNode | null;
  cNode: TempNode | null;
  method: MathNodeMethod;

  constructor(method: MathNodeMethod, aNode: TempNode, bNode: TempNode | null = null, cNode: TempNode | null = null) {
    super();

    this.method = method;

    this.aNode = aNode;
    this.bNode = bNode;
    this.cNode = cNode;
  }

  getInputType(builder: NodeBuilder): NodeType {
    const aType = this.aNode.getNodeType(builder)!;
    const bType = this.bNode ? this.bNode.getNodeType(builder) : null;
    const cType = this.cNode ? this.cNode.getNodeType(builder) : null;

    const aLen = builder.isMatrix(aType) ? 0 : builder.getTypeLength(aType);
    const bLen = builder.isMatrix(bType) ? 0 : builder.getTypeLength(bType);
    const cLen = builder.isMatrix(cType) ? 0 : builder.getTypeLength(cType);

    if (aLen > bLen && aLen > cLen) return aType;
    if (bLen > cLen) return bType!;
    if (cLen > aLen) return cType!;
    return aType;
  }

  getNodeType(builder: NodeBuilder): NodeType {
    switch (this.method) {
      case BinaryMathNode.DOT:
      case BinaryMathNode.DISTANCE:
      case UnaryMathNode.LENGTH:
        return NodeType.Float;
      case BinaryMathNode.CROSS:
        return NodeType.Vector3;
      default:
        return this.getInputType(builder)!;
    }
  }

  generate(builder: NodeBuilder, output?: NodeType) {
    const method = this.method;

    const type = this.getNodeType(builder);
    const inputType = this.getInputType(builder);

    const a = this.aNode;
    const b = this.bNode;
    const c = this.cNode;

    if (method === BinaryMathNode.TRANSFORM_DIRECTION) {
      // dir can be either a direction vector or a normal vector
      // upper-left 3x3 of matrix is assumed to be orthogonal

      let tA = a;
      let tB = b;

      if (builder.isMatrix(tA.getNodeType(builder))) {
        tB = vec4(vec3(tB), 0.0);
      } else {
        tA = vec4(vec3(tA), 0.0);
      }

      const mulNode = mul(tA, tB).xyz;

      return normalize(mulNode).build(builder, output);
    } else if (method === UnaryMathNode.NEGATE) {
      return builder.format('-' + a.build(builder, inputType), type, output);
    } else if (method === UnaryMathNode.ONE_MINUS) {
      return sub(1.0, a).build(builder, output);
    } else if (method === UnaryMathNode.RECIPROCAL) {
      return div(1.0, a).build(builder, output);
    } else if (method === BinaryMathNode.DIFFERENCE) {
      return abs(sub(a, b)).build(builder, output);
    } else {
      const params = [];

      if (method === BinaryMathNode.CROSS) {
        params.push(a.build(builder, type), b!.build(builder, type));
      } else if (method === BinaryMathNode.STEP) {
        params.push(
          a.build(builder, builder.getTypeLength(a.getNodeType(builder)) === 1 ? NodeType.Float : inputType),
          b!.build(builder, inputType),
        );
      } else if (method === BinaryMathNode.MOD) {
        params.push(
          a.build(builder, inputType),
          b!.build(builder, builder.getTypeLength(b!.getNodeType(builder)) === 1 ? NodeType.Float : inputType),
        );
      } else if (method === TrinaryMathNode.REFRACT) {
        params.push(a.build(builder, inputType), b!.build(builder, inputType), c!.build(builder, NodeType.Float));
      } else if (method === TrinaryMathNode.MIX) {
        params.push(
          a.build(builder, inputType),
          b!.build(builder, inputType),
          c!.build(builder, builder.getTypeLength(c!.getNodeType(builder)) === 1 ? NodeType.Float : inputType),
        );
      } else {
        params.push(a.build(builder, inputType));
        if (b !== null) params.push(b.build(builder, inputType));
        if (c !== null) params.push(c.build(builder, inputType));
      }

      return builder.format(`${builder.getMethod(method)}( ${params.join(', ')} )`, type, output);
    }
  }
}

export namespace MathConstants {
  export const EPSILON = float(1e-6);
  export const INFINITY = float(1e6);
}

export namespace MathNodes {
  export const x = 4;
}

export const EPSILON = float(1e-6);
export const INFINITY = float(1e6);

export const radians = nodeProxy(MathNode, UnaryMathNode.RADIANS);
export const degrees = nodeProxy(MathNode, UnaryMathNode.DEGREES);
export const exp = nodeProxy(MathNode, UnaryMathNode.EXP);
export const exp2 = nodeProxy(MathNode, UnaryMathNode.EXP2);
export const log = nodeProxy(MathNode, UnaryMathNode.LOG);
export const log2 = nodeProxy(MathNode, UnaryMathNode.LOG2);
export const sqrt = nodeProxy(MathNode, UnaryMathNode.SQRT);
export const inverseSqrt = nodeProxy(MathNode, UnaryMathNode.INVERSE_SQRT);
export const floor = nodeProxy(MathNode, UnaryMathNode.FLOOR);
export const ceil = nodeProxy(MathNode, UnaryMathNode.CEIL);
export const normalize = nodeProxy(MathNode, UnaryMathNode.NORMALIZE);
export const fract = nodeProxy(MathNode, UnaryMathNode.FRACT);
export const sin = nodeProxy(MathNode, UnaryMathNode.SIN);
export const cos = nodeProxy(MathNode, UnaryMathNode.COS);
export const tan = nodeProxy(MathNode, UnaryMathNode.TAN);
export const asin = nodeProxy(MathNode, UnaryMathNode.ASIN);
export const acos = nodeProxy(MathNode, UnaryMathNode.ACOS);
export const atan = nodeProxy(MathNode, UnaryMathNode.ATAN);
export const abs = nodeProxy(MathNode, UnaryMathNode.ABS);
export const sign = nodeProxy(MathNode, UnaryMathNode.SIGN);
export const length = nodeProxy(MathNode, UnaryMathNode.LENGTH);
export const negate = nodeProxy(MathNode, UnaryMathNode.NEGATE);
export const oneMinus = nodeProxy(MathNode, UnaryMathNode.ONE_MINUS);
export const dFdx = nodeProxy(MathNode, UnaryMathNode.DFDX);
export const dFdy = nodeProxy(MathNode, UnaryMathNode.DFDY);
export const round = nodeProxy(MathNode, UnaryMathNode.ROUND);
export const reciprocal = nodeProxy(MathNode, UnaryMathNode.RECIPROCAL);
export const trunc = nodeProxy(MathNode, UnaryMathNode.TRUNC);
export const fwidth = nodeProxy(MathNode, UnaryMathNode.FWIDTH);

export const atan2 = nodeProxy(MathNode, BinaryMathNode.ATAN2);
export const min = nodeProxy(MathNode, BinaryMathNode.MIN);
export const max = nodeProxy(MathNode, BinaryMathNode.MAX);
export const mod = nodeProxy(MathNode, BinaryMathNode.MOD);
export const step = nodeProxy(MathNode, BinaryMathNode.STEP);
export const reflect = nodeProxy(MathNode, BinaryMathNode.REFLECT);
export const distance = nodeProxy(MathNode, BinaryMathNode.DISTANCE);
export const difference = nodeProxy(MathNode, BinaryMathNode.DIFFERENCE);
export const dot = nodeProxy(MathNode, BinaryMathNode.DOT);
export const cross = nodeProxy(MathNode, BinaryMathNode.CROSS);
export const pow = nodeProxy(MathNode, BinaryMathNode.POW);
export const pow2 = nodeProxy(MathNode, BinaryMathNode.POW, 2);
export const pow3 = nodeProxy(MathNode, BinaryMathNode.POW, 3);
export const pow4 = nodeProxy(MathNode, BinaryMathNode.POW, 4);
export const transformDirection = nodeProxy(MathNode, BinaryMathNode.TRANSFORM_DIRECTION);

export const mix = nodeProxy(MathNode, TrinaryMathNode.MIX);
export const clamp = (value: number, low: number = 0, high: number = 1) =>
  nodeObject(new MathNode(TrinaryMathNode.CLAMP, nodeObject(value), nodeObject(low), nodeObject(high)));
export const saturate = (value: number) => clamp(value);
export const refract = nodeProxy(MathNode, TrinaryMathNode.REFRACT);
export const smoothstep = nodeProxy(MathNode, TrinaryMathNode.SMOOTHSTEP);
export const faceForward = nodeProxy(MathNode, TrinaryMathNode.FACEFORWARD);

export const mixElement = (t: number, e1: number, e2: number) => mix(e1, e2, t);
export const smoothstepElement = (x: number, low: number, high: number) => smoothstep(low, high, x);

addNodeElement('radians', radians);
addNodeElement('degrees', degrees);
addNodeElement('exp', exp);
addNodeElement('exp2', exp2);
addNodeElement('log', log);
addNodeElement('log2', log2);
addNodeElement('sqrt', sqrt);
addNodeElement('inverseSqrt', inverseSqrt);
addNodeElement('floor', floor);
addNodeElement('ceil', ceil);
addNodeElement('normalize', normalize);
addNodeElement('fract', fract);
addNodeElement('sin', sin);
addNodeElement('cos', cos);
addNodeElement('tan', tan);
addNodeElement('asin', asin);
addNodeElement('acos', acos);
addNodeElement('atan', atan);
addNodeElement('abs', abs);
addNodeElement('sign', sign);
addNodeElement('length', length);
addNodeElement('negate', negate);
addNodeElement('oneMinus', oneMinus);
addNodeElement('dFdx', dFdx);
addNodeElement('dFdy', dFdy);
addNodeElement('round', round);
addNodeElement('reciprocal', reciprocal);
addNodeElement('trunc', trunc);
addNodeElement('fwidth', fwidth);
addNodeElement('atan2', atan2);
addNodeElement('min', min);
addNodeElement('max', max);
addNodeElement('mod', mod);
addNodeElement('step', step);
addNodeElement('reflect', reflect);
addNodeElement('distance', distance);
addNodeElement('dot', dot);
addNodeElement('cross', cross);
addNodeElement('pow', pow);
addNodeElement('pow2', pow2);
addNodeElement('pow3', pow3);
addNodeElement('pow4', pow4);
addNodeElement('transformDirection', transformDirection);
addNodeElement('mix', mixElement);
addNodeElement('clamp', clamp);
addNodeElement('refract', refract);
addNodeElement('smoothstep', smoothstepElement);
addNodeElement('faceForward', faceForward);
addNodeElement('difference', difference);
addNodeElement('saturate', saturate);
