import CodeNode from './CodeNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import NodeBuilder from '../core/NodeBuilder.js';

class FunctionNode extends CodeNode {
  constructor(code = '', includes: any[] = [], language = '') {
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

  generate(builder: NodeBuilder, output) {
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
        const nodeProperty = keywords[property].build(builder, 'property');

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

export default FunctionNode;

const nativeFn = (code: string, includes: string, language: string = '') => {
  let functionNode = null;

  return (...params) => {
    if (functionNode === null) functionNode = nodeObject(new FunctionNode(code, includes, language));

    return functionNode.call(...params);
  };
};

export const glslFn = (code: string, includes: string) => nativeFn(code, includes, 'glsl');
export const wgslFn = (code: string, includes: string) => nativeFn(code, includes, 'wgsl');

export const func = (code: string, includes: string) => {
  // @deprecated, r154

  console.warn('TSL: func() is deprecated. Use nativeFn(), wgslFn() or glslFn() instead.');

  return nodeObject(new FunctionNode(code, includes));
};
