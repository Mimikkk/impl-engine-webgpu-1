import { Node } from '../core/Node.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeLanguage, NodeType } from '../core/constants.js';

export class CodeNode extends Node {
  static is(node: any): node is CodeNode {
    return node?.isCodeNode;
  }
  isCodeNode: true = true;
  includes: CodeNode.Include[];
  language: string;
  code: string;

  constructor(code: string, includes: CodeNode.Include[], language: NodeLanguage) {
    console.log({ code, includes, language });
    super(NodeType.Code);

    this.code = code;
    this.language = language;
    this.includes = includes;
  }

  generate(builder: NodeBuilder, output: NodeType = NodeType.Void) {
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

export namespace CodeNodes {
  export const code = nodeProxy(CodeNode);
  export const js = (src: string, includes: CodeNode.Include[] = []) => code(src, includes, NodeLanguage.Js);
  export const wgsl = (src: string, includes: CodeNode.Include[] = []) => code(src, includes, NodeLanguage.Wgsl);
  export const glsl = (src: string, includes: CodeNode.Include[] = []) => code(src, includes, NodeLanguage.Glsl);
}
