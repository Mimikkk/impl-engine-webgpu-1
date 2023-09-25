import { ShaderMaterial } from './ShaderMaterial.js';
import { Material } from './Material.js';

export class RawShaderMaterial extends ShaderMaterial {
  declare isRawShaderMaterial: boolean;
  declare type: string | 'RawShaderMaterial';

  constructor(parameters?: Material.Parameters) {
    super(parameters);

    this.isRawShaderMaterial = true;

    this.type = 'RawShaderMaterial';
  }
}
