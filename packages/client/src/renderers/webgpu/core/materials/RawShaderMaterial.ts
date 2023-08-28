import { ShaderMaterial } from './ShaderMaterial.js';

export class RawShaderMaterial extends ShaderMaterial {
  isRawShaderMaterial: boolean;
  constructor(parameters?: any) {
    super(parameters);

    this.isRawShaderMaterial = true;

    this.type = 'RawShaderMaterial';
  }
}
