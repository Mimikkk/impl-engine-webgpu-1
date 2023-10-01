import { TempNode } from '../core/TempNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';
import { Node } from '../core/Node.js';

export enum Operation {
  Add = '+',
  Sub = '-',
  Mul = '*',
  Div = '/',
  Remainder = '%',
  Equal = '==',
  Assign = '=',
  LessThan = '<',
  GreaterThan = '>',
  LessThanEqual = '<=',
  GreaterThanEqual = '>=',
  And = '&&',
  Or = '||',
  Xor = '^^',
  BitAnd = '&',
  BitOr = '|',
  BitXor = '^',
  ShiftLeft = '<<',
  ShiftRight = '>>',
}

export class OperatorNode extends TempNode {
  operator: string;
  aNode: Node;
  bNode: Node;

  constructor(op: string, aNode: Node, bNode: Node, ...params: Node[]) {
    super();

    for (let node of params) bNode = new OperatorNode(op, bNode, node);

    this.operator = op;
    this.aNode = aNode;
    this.bNode = bNode;
  }

  hasDependencies(builder: NodeBuilder) {
    return this.operator !== '=' && super.hasDependencies(builder);
  }

  getNodeType(builder: NodeBuilder, output?: NodeType) {
    const op = this.operator;
    const aNode = this.aNode;
    const bNode = this.bNode;

    const typeA = aNode.getNodeType(builder);
    const typeB = bNode.getNodeType(builder);

    if (typeA === 'void' || typeB === 'void') return 'void';
    if (op === '=' || op === '%') return typeA;
    if (op === '&' || op === '|' || op === '^' || op === '>>' || op === '<<') return builder.getIntegerType(typeA);
    if (op === '==' || op === '&&' || op === '||' || op === '^^') return 'bool';
    if (op === '<' || op === '>' || op === '<=' || op === '>=') {
      const typeLength = output
        ? builder.getTypeLength(output)
        : Math.max(builder.getTypeLength(typeA), builder.getTypeLength(typeB));

      return typeLength > 1 ? `bvec${typeLength}` : 'bool';
    }
    if (typeA === 'float' && builder.isMatrix(typeB)) return typeB;
    if (builder.isMatrix(typeA) && builder.isVector(typeB)) return builder.getVectorFromMatrix(typeA);
    if (builder.isVector(typeA) && builder.isMatrix(typeB)) return builder.getVectorFromMatrix(typeB);
    if (builder.getTypeLength(typeB) > builder.getTypeLength(typeA)) return typeB;
    return typeA;
  }

  generate(builder: NodeBuilder, output?: NodeType) {
    const op = this.operator;

    const aNode = this.aNode;
    const bNode = this.bNode;

    const type = this.getNodeType(builder, output);

    let typeA = null;
    let typeB = null;

    if (type !== 'void') {
      typeA = aNode.getNodeType(builder);
      typeB = bNode.getNodeType(builder);

      if (op === '=') {
        typeB = typeA;
      } else if (op === '<' || op === '>' || op === '<=' || op === '>=' || op === '==') {
        if (builder.isVector(typeA)) {
          typeB = typeA;
        } else {
          typeA = typeB = 'float';
        }
      } else if (op === '>>' || op === '<<') {
        typeA = type;
        typeB = builder.changeComponentType(typeB, 'uint');
      } else if (builder.isMatrix(typeA) && builder.isVector(typeB)) {
        // matrix x vector

        typeB = builder.getVectorFromMatrix(typeA);
      } else if (builder.isVector(typeA) && builder.isMatrix(typeB)) {
        // vector x matrix

        typeA = builder.getVectorFromMatrix(typeB);
      } else {
        // anytype x anytype

        typeA = typeB = type;
      }
    } else {
      typeA = typeB = type;
    }

    const a = aNode.build(builder, typeA);
    const b = bNode.build(builder, typeB);

    const outputLength = builder.getTypeLength(output);

    if (output !== 'void') {
      if (op === '=') {
        builder.addLineFlowCode(`${a} ${this.operator} ${b}`);

        return a;
      } else if (op === '<' && outputLength > 1) {
        return builder.format(`${builder.getMethod('lessThan')}( ${a}, ${b} )`, type, output);
      } else if (op === '<=' && outputLength > 1) {
        return builder.format(`${builder.getMethod('lessThanEqual')}( ${a}, ${b} )`, type, output);
      } else if (op === '>' && outputLength > 1) {
        return builder.format(`${builder.getMethod('greaterThan')}( ${a}, ${b} )`, type, output);
      } else if (op === '>=' && outputLength > 1) {
        return builder.format(`${builder.getMethod('greaterThanEqual')}( ${a}, ${b} )`, type, output);
      } else {
        return builder.format(`( ${a} ${this.operator} ${b} )`, type, output);
      }
    } else if (typeA !== 'void') {
      return builder.format(`${a} ${this.operator} ${b}`, type, output);
    }
  }
}

export namespace OperatorNodes {
  export const add = nodeProxy(OperatorNode, '+');
  export const sub = nodeProxy(OperatorNode, '-');
  export const mul = nodeProxy(OperatorNode, '*');
  export const div = nodeProxy(OperatorNode, '/');
  export const remainder = nodeProxy(OperatorNode, '%');
  export const equal = nodeProxy(OperatorNode, '==');
  export const assign = nodeProxy(OperatorNode, '=');
  export const lessThan = nodeProxy(OperatorNode, '<');
  export const greaterThan = nodeProxy(OperatorNode, '>');
  export const lessThanEqual = nodeProxy(OperatorNode, '<=');
  export const greaterThanEqual = nodeProxy(OperatorNode, '>=');
  export const and = nodeProxy(OperatorNode, '&&');
  export const or = nodeProxy(OperatorNode, '||');
  export const xor = nodeProxy(OperatorNode, '^^');
  export const bitAnd = nodeProxy(OperatorNode, '&');
  export const bitOr = nodeProxy(OperatorNode, '|');
  export const bitXor = nodeProxy(OperatorNode, '^');
  export const shiftLeft = nodeProxy(OperatorNode, '<<');
  export const shiftRight = nodeProxy(OperatorNode, '>>');
}

export const add = nodeProxy(OperatorNode, '+');
export const sub = nodeProxy(OperatorNode, '-');
export const mul = nodeProxy(OperatorNode, '*');
export const div = nodeProxy(OperatorNode, '/');
export const remainder = nodeProxy(OperatorNode, '%');
export const equal = nodeProxy(OperatorNode, '==');
export const assign = nodeProxy(OperatorNode, '=');
export const lessThan = nodeProxy(OperatorNode, '<');
export const greaterThan = nodeProxy(OperatorNode, '>');
export const lessThanEqual = nodeProxy(OperatorNode, '<=');
export const greaterThanEqual = nodeProxy(OperatorNode, '>=');
export const and = nodeProxy(OperatorNode, '&&');
export const or = nodeProxy(OperatorNode, '||');
export const xor = nodeProxy(OperatorNode, '^^');
export const bitAnd = nodeProxy(OperatorNode, '&');
export const bitOr = nodeProxy(OperatorNode, '|');
export const bitXor = nodeProxy(OperatorNode, '^');
export const shiftLeft = nodeProxy(OperatorNode, '<<');
export const shiftRight = nodeProxy(OperatorNode, '>>');

addNodeElement('add', add);
addNodeElement('sub', sub);
addNodeElement('mul', mul);
addNodeElement('div', div);
addNodeElement('remainder', remainder);
addNodeElement('equal', equal);
addNodeElement('assign', assign);
addNodeElement('lessThan', lessThan);
addNodeElement('greaterThan', greaterThan);
addNodeElement('lessThanEqual', lessThanEqual);
addNodeElement('greaterThanEqual', greaterThanEqual);
addNodeElement('and', and);
addNodeElement('or', or);
addNodeElement('xor', xor);
addNodeElement('bitAnd', bitAnd);
addNodeElement('bitOr', bitOr);
addNodeElement('bitXor', bitXor);
addNodeElement('shiftLeft', shiftLeft);
addNodeElement('shiftRight', shiftRight);
