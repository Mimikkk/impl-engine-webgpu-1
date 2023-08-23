class NodeFunctionInput {
  static isNodeFunctionInput: boolean = true;
  type: any;
  name: any;
  count: null;
  qualifier: string;
  isConst: boolean;

  constructor(type: string, name: string, count = null, qualifier = '', isConst = false) {
    this.type = type;
    this.name = name;
    this.count = count;
    this.qualifier = qualifier;
    this.isConst = isConst;
  }
}

const declarationRegexp = /^[fn]*\s*([a-z_0-9]+)?\s*\(([\s\S]*?)\)\s*[\-\>]*\s*([a-z_0-9]+)?/i;
const propertiesRegexp = /[a-z_0-9]+/gi;

const wgslTypeLib: Record<string, string> = { f32: 'float' };

const parse = (source: string) => {
  source = source.trim();

  const declaration = source.match(declarationRegexp);

  if (declaration?.length !== 4) {
    throw Error('FunctionNode: Function is not a WGSL code.');
  }
  // tokenizer

  const inputsCode = declaration[2];
  const propsMatches = [];

  let nameMatch = null;

  while ((nameMatch = propertiesRegexp.exec(inputsCode)) !== null) {
    propsMatches.push(nameMatch);
  }

  // parser

  const inputs = [];

  let i = 0;

  while (i < propsMatches.length) {
    // default

    const name = propsMatches[i++][0];
    let type = propsMatches[i++][0];

    type = wgslTypeLib[type] || type;

    // precision
    if (i < propsMatches.length && /^[fui]\d{2}$/.test(propsMatches[i][0])) i++;

    // add input
    inputs.push(new NodeFunctionInput(type, name));
  }

  //
  const blockCode = source.substring(declaration[0].length);
  const name = declaration[1] !== undefined ? declaration[1] : '';
  const type = declaration[3] || 'void';

  return { type, inputs, name, inputsCode, blockCode };
};

class WebGPUNodeFunction {
  static isNodeFunction = true;
  type: any;
  inputs: NodeFunctionInput[];
  name: any;
  presicion: string;
  inputsCode: any;
  blockCode: any;

  constructor(source: string) {
    const { type, inputs, name, inputsCode, blockCode } = parse(source);

    this.type = type;
    this.inputs = inputs;
    this.name = name;
    this.presicion = '';

    this.inputsCode = inputsCode;
    this.blockCode = blockCode;
  }

  getCode(name = this.name) {
    const type = this.type === 'void' ? '' : `-> ${this.type}`;

    return `fn ${name}(${this.inputsCode.trim()}) ${type}` + this.blockCode;
  }
}

export default WebGPUNodeFunction;
