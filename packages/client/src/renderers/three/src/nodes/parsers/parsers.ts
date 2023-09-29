import { Wgsl } from './wgsl.js';
import { Glsl } from './glsl.js';

export namespace Parsers {
  export const wgsl = (source: string) => new Wgsl(source);
  export const glsl = (source: string) => new Glsl(source);
}
