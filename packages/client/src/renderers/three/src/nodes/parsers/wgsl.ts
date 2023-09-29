import { NodeFunction } from '../core/NodeFunction.js';
import { NodeFunctionInput } from '../core/NodeFunctionInput.js';
import { NodeType } from '../core/constants.js';

const declarationRegexp = /^[fn]*\s*([a-z_0-9]+)?\s*\(([\s\S]*?)\)\s*[\-\>]*\s*([a-z_0-9]+)?/i;
const propertiesRegexp = /[a-z_0-9]+/gi;

const wgslTypeLib = {
  f32: 'float',
};

const parse = (
  source: string,
): {
  type: NodeType | string;
  inputs: NodeFunctionInput[];
  name: string;
  inputsCode: string;
  blockCode: string;
} => {
  source = source.trim();

  const declaration = source.match(declarationRegexp);
  if (declaration?.length !== 4) throw Error('Invalid wgsl code.');

  const inputsCode = declaration[2];
  const propsMatches = [];

  let nameMatch = null;
  while ((nameMatch = propertiesRegexp.exec(inputsCode)) !== null) propsMatches.push(nameMatch);

  const inputs: NodeFunctionInput[] = [];

  let i = 0;
  while (i < propsMatches.length) {
    const name = propsMatches[i++][0];
    let type = propsMatches[i++][0];
    type = wgslTypeLib[type as keyof typeof wgslTypeLib] ?? type;

    if (i < propsMatches.length && /^[fui]\d{2}$/.test(propsMatches[i][0])) i++;

    inputs.push(NodeFunctionInput.create({ type, name }));
  }

  const blockCode = source.substring(declaration[0].length);
  const name = declaration[1] ?? '';
  const type = declaration[3] ?? 'void';

  return { type, inputs, name, inputsCode, blockCode };
};

export class Wgsl extends NodeFunction {
  inputsCode: string;
  blockCode: string;

  constructor(source: string) {
    const { type, inputs, name, inputsCode, blockCode } = parse(source);
    super(type, inputs, name);

    this.inputsCode = inputsCode;
    this.blockCode = blockCode;
  }

  getCode(name = this.name) {
    return `fn ${name}(${this.inputsCode.trim()})${this.type !== 'void' ? ` -> ${this.type}` : ''} ${this.blockCode}`;
  }
}
