import { NodeFunction } from '../core/NodeFunction.js';
import { NodeFunctionInput } from '../core/NodeFunctionInput.js';
import { NodeType } from '../core/constants.js';

const declarationRegexp = /^\s*(highp|mediump|lowp)?\s*([a-z_0-9]+)\s*([a-z_0-9]+)?\s*\(([\s\S]*?)\)/i;
const propertiesRegexp = /[a-z_0-9]+/gi;

const pragmaMain = '#pragma main';

const parse = (
  source: string,
): {
  type: NodeType | string;
  inputs: NodeFunctionInput[];
  name: string;
  precision: string;
  inputsCode: string;
  blockCode: string;
  headerCode: string;
} => {
  source = source.trim();

  const pragmaMainIndex = source.indexOf(pragmaMain);
  const mainCode = pragmaMainIndex !== -1 ? source.slice(pragmaMainIndex + pragmaMain.length) : source;
  const declaration = mainCode.match(declarationRegexp);

  if (declaration?.length !== 5) throw Error('FunctionNode: Function is not a GLSL code.');

  const inputsCode = declaration[4];
  const propsMatches = [];

  let nameMatch = null;

  while ((nameMatch = propertiesRegexp.exec(inputsCode)) !== null) {
    propsMatches.push(nameMatch);
  }
  const inputs = [];

  let i = 0;
  while (i < propsMatches.length) {
    const isConst = propsMatches[i][0] === 'const';
    if (isConst) i++;

    let qualifier = propsMatches[i][0];
    if (qualifier === 'in' || qualifier === 'out' || qualifier === 'inout') {
      i++;
    } else qualifier = '';

    const type = propsMatches[i++][0];

    let count: number | null = Number.parseInt(propsMatches[i][0]);

    if (!Number.isNaN(count)) i++;
    else count = null;

    const name = propsMatches[i++][0];
    inputs.push(NodeFunctionInput.create({ type, name, count, qualifier, isConst }));
  }

  const blockCode = mainCode.substring(declaration[0].length);
  const precision = declaration[1] ?? '';
  const type = declaration[2];
  const name = declaration[3] ?? '';
  const headerCode = pragmaMainIndex !== -1 ? source.slice(0, pragmaMainIndex) : '';

  return {
    type,
    inputs,
    name,
    precision,
    inputsCode,
    blockCode,
    headerCode,
  };
};

export class Glsl extends NodeFunction {
  inputsCode: string;
  blockCode: string;
  headerCode: string;

  constructor(source: string) {
    const { type, inputs, name, precision, inputsCode, blockCode, headerCode } = parse(source);

    super(type, inputs, name, precision);

    this.inputsCode = inputsCode;
    this.blockCode = blockCode;
    this.headerCode = headerCode;
  }

  getCode(name = this.name) {
    const blockCode = this.blockCode;

    if (blockCode !== '') {
      const { type, inputsCode, headerCode, precision } = this;
      let declarationCode = `${type} ${name} ( ${inputsCode.trim()} )`;
      if (precision !== '') declarationCode = `${precision} ${declarationCode}`;

      return headerCode + declarationCode + blockCode;
    }

    return '';
  }
}
