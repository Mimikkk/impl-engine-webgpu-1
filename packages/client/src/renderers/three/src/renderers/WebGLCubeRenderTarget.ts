import { BackSide, LinearFilter, LinearMipmapLinearFilter, NoBlending } from '../constants.js';
import { Mesh } from '../objects/Mesh.js';
import { BoxGeometry } from '../geometries/BoxGeometry.js';
import { ShaderMaterial } from '../materials/ShaderMaterial.js';
import { cloneUniforms } from './shaders/UniformsUtils.js';
import { WebGLRenderTarget } from './WebGLRenderTarget.js';
import { CubeCamera } from '../cameras/CubeCamera.js';
import { CubeTexture } from '../textures/CubeTexture.js';
import { RenderTargetOptions } from '../core/RenderTarget.js';
import { WebGLRenderer } from './WebGLRenderer.js';
import { Texture } from '../textures/Texture.js';

export class WebGLCubeRenderTarget extends WebGLRenderTarget {
  declare isWebGLCubeRenderTarget: true;
  texture: Texture;

  constructor(size: number = 1, options: RenderTargetOptions = {}) {
    super(size, size, options);
    this.isWebGLCubeRenderTarget = true;

    const image = { width: size, height: size, depth: 1 };
    const images = [image, image, image, image, image, image];

    this.texture = new CubeTexture(
      images,
      options.mapping,
      options.wrapS,
      options.wrapT,
      options.magFilter,
      options.minFilter,
      options.format,
      options.type,
      options.anisotropy,
      options.colorSpace,
    );

    this.texture.isRenderTargetTexture = true;
    this.texture.generateMipmaps = options?.generateMipmaps ?? false;
    this.texture.minFilter = options?.minFilter ?? LinearFilter;
  }

  fromEquirectangularTexture(renderer: WebGLRenderer, texture: Texture): this {
    this.texture.type = texture.type;
    this.texture.colorSpace = texture.colorSpace;

    this.texture.generateMipmaps = texture.generateMipmaps;
    this.texture.minFilter = texture.minFilter;
    this.texture.magFilter = texture.magFilter;

    const shader = {
      uniforms: {
        tEquirect: { value: null },
      },

      vertexShader: /* glsl */ `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,

      fragmentShader: /* glsl */ `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`,
    };

    const geometry = new BoxGeometry(5, 5, 5);

    const material = new ShaderMaterial({
      name: 'CubemapFromEquirect',

      uniforms: cloneUniforms(shader.uniforms),
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      side: BackSide,
      blending: NoBlending,
    });

    material.uniforms.tEquirect.value = texture;

    const mesh = new Mesh(geometry, material);

    const currentMinFilter = texture.minFilter;

    // Avoid blurred poles
    if (texture.minFilter === LinearMipmapLinearFilter) texture.minFilter = LinearFilter;

    const camera = new CubeCamera(1, 10, this);
    camera.update(renderer, mesh);

    texture.minFilter = currentMinFilter;

    mesh.geometry.dispose();
    mesh.material.dispose();

    return this;
  }

  clear(renderer: WebGLRenderer, color: boolean, depth: boolean, stencil: boolean): void {
    const currentRenderTarget = renderer.getRenderTarget();

    for (let i = 0; i < 6; i++) {
      renderer.setRenderTarget(this, i);

      renderer.clear(color, depth, stencil);
    }

    renderer.setRenderTarget(currentRenderTarget);
  }
}
