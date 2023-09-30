import { Node } from '../core/Node.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

export class CodeNode extends Node {
  static is = (node: Node): node is CodeNode => 'isCodeNode' in node;
  isCodeNode: true = true;
  includes: CodeNode.Include[];
  language: string;
  code: string;

  constructor(code = '', includes: CodeNode.Include[] = [], language = '') {
    super('code');

    this.code = code;
    this.language = language;
    this.includes = includes;
  }

  generate(builder: NodeBuilder) {
    const includes = this.includes;

    for (const include of includes) include.build(builder);

    const nodeCode = builder.getCodeFromNode(this, this.getNodeType(builder));
    nodeCode.code = this.code;

    return nodeCode.code;
  }
}

export namespace CodeNode {
  export interface Include {
    build(builder: NodeBuilder): void;
  }
}

export const code = nodeProxy(CodeNode);
export const js = (src: string, includes: CodeNode.Include[]) => code(src, includes, 'js');
export const wgsl = (src: string, includes: CodeNode.Include[]) => code(src, includes, 'wgsl');
export const glsl = (src: string, includes: CodeNode.Include[]) => code(src, includes, 'glsl');
