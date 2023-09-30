import { CodeNode } from './CodeNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

export class FunctionNode extends CodeNode {
  keywords: Record<string, CodeNode>;

  constructor(code: string = '', includes: CodeNode.Include[] = [], language: 'wgsl' | 'glsl') {
    super(code, includes, language);

    this.keywords = {};
  }

  getNodeType(builder: NodeBuilder) {
    return this.getNodeFunction(builder).type;
  }

  getInputs(builder: NodeBuilder) {
    return this.getNodeFunction(builder).inputs;
  }

  getNodeFunction(builder: NodeBuilder) {
    const nodeData = builder.getDataFromNode(this);

    let nodeFunction = nodeData.nodeFunction;

    if (nodeFunction === undefined) {
      nodeFunction = builder.parser(this.code);

      nodeData.nodeFunction = nodeFunction;
    }

    return nodeFunction;
  }

  generate(builder: NodeBuilder, output: any) {
    super.generate(builder);

    const nodeFunction = this.getNodeFunction(builder);

    const name = nodeFunction.name;
    const type = nodeFunction.type;

    const nodeCode = builder.getCodeFromNode(this, type);

    if (name !== '') {
      // use a custom property name

      nodeCode.name = name;
    }

    const propertyName = builder.getPropertyName(nodeCode);

    let code = this.getNodeFunction(builder).getCode(propertyName);
    console.log({ code });
    const keywords = this.keywords;
    const keywordsProperties = Object.keys(keywords);

    if (keywordsProperties.length > 0) {
      for (const property of keywordsProperties) {
        const propertyRegExp = new RegExp(`\\b${property}\\b`, 'g');
        const nodeProperty = keywords[property as keyof typeof keywords].build(builder, 'property');

        code = code.replace(propertyRegExp, nodeProperty);
      }
    }

    nodeCode.code = code;

    if (output === 'property') {
      return propertyName;
    } else {
      return builder.format(`${propertyName}()`, type, output);
    }
  }
}

const nativeFn = (code: string, includes: CodeNode.Include[], language: string = '') => {
  let functionNode: FunctionNode | null = null;

  return (...params: any[]) => {
    if (!functionNode) functionNode = nodeObject(new FunctionNode(code, includes, language));

    return functionNode!.call(...params);
  };
};

export const glslFn = (code: string, includes: CodeNode.Include[]) => nativeFn(code, includes, 'glsl');
export const wgslFn = (code: string, includes: CodeNode.Include[]) => nativeFn(code, includes, 'wgsl');
