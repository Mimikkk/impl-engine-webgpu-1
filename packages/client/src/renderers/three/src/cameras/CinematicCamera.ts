import {
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  UniformsUtils,
  WebGLRenderTarget,
} from '../Three.js';
import { BokehDepthShader, BokehShader } from '../shaders/BokehShader2.js';
import Renderer from '../common/Renderer.js';

export class CinematicCamera extends PerspectiveCamera {
  declare isCinematicCamera: true;
  declare type: 'CinematicCamera';
  filmGaugeMM: number;
  fNumber: number;
  coc: number;
  aperture: number;
  hyperFocal: number;
  focus: number;
  nearPoint: number;
  farPoint: number;
  depthOfField: number;
  sdistance: number;
  ldistance: number;
  postprocessing: {
    enabled: boolean;
    scene?: Scene;
    camera?: OrthographicCamera;
    rtTextureDepth?: WebGLRenderTarget;
    rtTextureColor?: WebGLRenderTarget;
    bokeh_uniforms?: any;
    materialBokeh?: ShaderMaterial;
    quad?: Mesh;
  };
  shaderSettings: {
    rings: number;
    samples: number;
  };
  materialDepth: ShaderMaterial;

  constructor(fov: number, aspect: number, near: number, far: number) {
    super(fov, aspect, near, far);

    this.type = 'CinematicCamera';

    this.postprocessing = { enabled: true };
    this.shaderSettings = {
      rings: 3,
      samples: 4,
    };

    const depthShader = BokehDepthShader;

    this.materialDepth = new ShaderMaterial({
      uniforms: depthShader.uniforms,
      vertexShader: depthShader.vertexShader,
      fragmentShader: depthShader.fragmentShader,
    });

    this.materialDepth.uniforms['mNear'].value = near;
    this.materialDepth.uniforms['mFar'].value = far;

    this.setLens();
    this.initPostProcessing();
  }

  setLens(focalLength: number = 35, filmGauge: number = 35, fNumber: number = 8, coc: number = 0.019) {
    this.filmGaugeMM = filmGauge;
    this.setFocalLength(focalLength);
    this.fNumber = fNumber;
    this.coc = coc;
    this.aperture = focalLength / this.fNumber;
    this.hyperFocal = (focalLength * focalLength) / (this.aperture * this.coc);
  }

  linearize(depth: number): number {
    const zfar = this.far;
    const znear = this.near;
    return (-zfar * znear) / (depth * (zfar - znear) - zfar);
  }

  smoothstep(near: number, far: number, depth: number): number {
    const x = this.saturate((depth - near) / (far - near));
    return x * x * (3 - 2 * x);
  }

  saturate(x: number): number {
    return Math.max(0, Math.min(1, x));
  }

  focusAt(focusDistance: number = 20): void {
    const focalLength = this.getFocalLength();

    // distance from the camera (normal to frustrum) to focus on
    this.focus = focusDistance;

    // the nearest point from the camera which is in focus (unused)
    this.nearPoint = (this.hyperFocal * this.focus) / (this.hyperFocal + (this.focus - focalLength));

    // the farthest point from the camera which is in focus (unused)
    this.farPoint = (this.hyperFocal * this.focus) / (this.hyperFocal - (this.focus - focalLength));

    // the gap or width of the space in which is everything is in focus (unused)
    this.depthOfField = this.farPoint - this.nearPoint;

    // Considering minimum distance of focus for a standard lens (unused)
    if (this.depthOfField < 0) this.depthOfField = 0;

    this.sdistance = this.smoothstep(this.near, this.far, this.focus);

    this.ldistance = this.linearize(1 - this.sdistance);

    this.postprocessing.bokeh_uniforms['focalDepth'].value = this.ldistance;
  }

  initPostProcessing(): void {
    if (this.postprocessing.enabled) {
      this.postprocessing.scene = new Scene();

      this.postprocessing.camera = new OrthographicCamera(
        window.innerWidth / -2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / -2,
        -10000,
        10000,
      );

      this.postprocessing.scene.add(this.postprocessing.camera);

      this.postprocessing.rtTextureDepth = new WebGLRenderTarget(window.innerWidth, window.innerHeight);
      this.postprocessing.rtTextureColor = new WebGLRenderTarget(window.innerWidth, window.innerHeight);

      const bokeh_shader = BokehShader;

      this.postprocessing.bokeh_uniforms = UniformsUtils.clone(bokeh_shader.uniforms);

      this.postprocessing.bokeh_uniforms['tColor'].value = this.postprocessing.rtTextureColor.texture;
      this.postprocessing.bokeh_uniforms['tDepth'].value = this.postprocessing.rtTextureDepth.texture;

      this.postprocessing.bokeh_uniforms['manualdof'].value = 0;
      this.postprocessing.bokeh_uniforms['shaderFocus'].value = 0;

      this.postprocessing.bokeh_uniforms['fstop'].value = 2.8;

      this.postprocessing.bokeh_uniforms['showFocus'].value = 1;

      this.postprocessing.bokeh_uniforms['focalDepth'].value = 0.1;

      //console.log( this.postprocessing.bokeh_uniforms[ "focalDepth" ].value );

      this.postprocessing.bokeh_uniforms['znear'].value = this.near;
      this.postprocessing.bokeh_uniforms['zfar'].value = this.near;

      this.postprocessing.bokeh_uniforms['textureWidth'].value = window.innerWidth;

      this.postprocessing.bokeh_uniforms['textureHeight'].value = window.innerHeight;

      this.postprocessing.materialBokeh = new ShaderMaterial({
        uniforms: this.postprocessing.bokeh_uniforms,
        vertexShader: bokeh_shader.vertexShader,
        fragmentShader: bokeh_shader.fragmentShader,
        defines: {
          RINGS: this.shaderSettings.rings,
          SAMPLES: this.shaderSettings.samples,
          DEPTH_PACKING: 1,
        },
      });

      this.postprocessing.quad = new Mesh(
        new PlaneGeometry(window.innerWidth, window.innerHeight),
        this.postprocessing.materialBokeh,
      );
      this.postprocessing.quad.position.z = -500;
      this.postprocessing.scene.add(this.postprocessing.quad);
    }
  }

  renderCinematic(scene: Scene, renderer: Renderer): void {
    if (this.postprocessing.enabled) {
      const currentRenderTarget = renderer.getRenderTarget();
      renderer.clear();
      scene.overrideMaterial = null;
      renderer.setRenderTarget(this.postprocessing.rtTextureColor);
      renderer.clear();
      renderer.render(scene, this);
      scene.overrideMaterial = this.materialDepth;
      renderer.setRenderTarget(this.postprocessing.rtTextureDepth);
      renderer.clear();
      renderer.render(scene, this);
      renderer.setRenderTarget(null);
      renderer.render(this.postprocessing.scene, this.postprocessing.camera);
      renderer.setRenderTarget(currentRenderTarget);
    }
  }
}
