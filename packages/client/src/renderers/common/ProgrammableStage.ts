import { ShaderStage } from './ShaderStage.js';
let id = 0;

export interface ProgrammableStage {
  usedTimes: number;
  code: string;
  stage: ShaderStage;
  id: number;
}

export const createProgrammableStage = (code: string, type: ShaderStage): ProgrammableStage => ({
  id: ++id,
  code,
  stage: type,
  usedTimes: 0,
});
