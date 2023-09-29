import type { NodeType } from './constants.js';

export interface NodeFunctionInput {
  type: NodeType | string;
  name: string;
  count: number | null;
  qualifier: string;
  isConst: boolean;
}

export namespace NodeFunctionInput {
  export interface Options {
    type: NodeType | string;
    name: string;
    count?: number | null;
    qualifier?: string;
    isConst?: boolean;
  }

  export const create = ({
    type,
    name,
    count = null,
    qualifier = '',
    isConst = false,
  }: Options): NodeFunctionInput => ({ type, name, count, qualifier, isConst });
}
