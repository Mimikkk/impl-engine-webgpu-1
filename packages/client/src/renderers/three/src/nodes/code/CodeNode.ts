import Node from '../core/Node.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import NodeBuilder from '../core/NodeBuilder.js';

export interface CodeNodeInclude {
  build(builder: NodeBuilder): void;
}

export class CodeNode extends Node {
  static is = (node: Node): node is CodeNode => 'isCodeNode' in node;
  isCodeNode: true = true;
  includes: CodeNodeInclude[];
  language: string;
  code: string;

  constructor(code = '', includes: CodeNodeInclude[] = [], language = '') {
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

export default CodeNode;

export const code = nodeProxy(CodeNode);
export const js = (src: string, includes: CodeNodeInclude[]) => code(src, includes, 'js');
export const wgsl = (src: string, includes: CodeNodeInclude[]) => code(src, includes, 'wgsl');
export const glsl = (src: string, includes: CodeNodeInclude[]) => code(src, includes, 'glsl');
