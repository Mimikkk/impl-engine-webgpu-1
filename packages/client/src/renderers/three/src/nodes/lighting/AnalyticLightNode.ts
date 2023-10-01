import { LightingNode } from './LightingNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { vec3 } from '../shadernode/ShaderNode.js';
import { reference } from '../accessors/ReferenceNode.js';
import { texture } from '../accessors/TextureNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { NormalNodes } from '../accessors/NormalNode.js';
import { Color, DepthTexture, LessCompare, Light, NearestFilter } from '../../Three.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { Node } from '../core/Node.js';
import { NodeFrame } from '../core/NodeFrame.js';

let depthMaterial: DepthTexture | null = null;

export class AnalyticLightNode extends LightingNode {
  light: Light;
  colorNode: Node;
  rtt: Node | null;
  shadowNode: Node | null;
  color: Color;

  constructor(light: Light) {
    super();

    this.updateType = NodeUpdateType.Frame;

    this.light = light;

    this.rtt = null;
    this.shadowNode = null;

    this.color = new Color();
    this.colorNode = uniform(this.color);
  }

  getHash(builder: NodeBuilder) {
    return this.light.uuid;
  }

  constructShadow(builder: NodeBuilder) {
    let shadowNode = this.shadowNode;

    if (shadowNode === null) {
      if (depthMaterial === null) depthMaterial = builder.createNodeMaterial('MeshBasicNodeMaterial');

      const shadow = this.light.shadow;
      const rtt = builder.getRenderTarget(shadow.mapSize.width, shadow.mapSize.height);

      const depthTexture = new DepthTexture();
      depthTexture.minFilter = NearestFilter;
      depthTexture.magFilter = NearestFilter;
      depthTexture.image.width = shadow.mapSize.width;
      depthTexture.image.height = shadow.mapSize.height;
      depthTexture.compareFunction = LessCompare;

      rtt.depthTexture = depthTexture;

      shadow.camera.updateProjectionMatrix();

      //

      const bias = reference('bias', 'float', shadow);
      const normalBias = reference('normalBias', 'float', shadow);

      let shadowCoord = uniform(shadow.matrix).mul(PositionNodes.world.add(NormalNodes.world.mul(normalBias)));
      shadowCoord = shadowCoord.xyz.div(shadowCoord.w);

      const frustumTest = shadowCoord.x
        .greaterThanEqual(0)
        .and(shadowCoord.x.lessThanEqual(1))
        .and(shadowCoord.y.greaterThanEqual(0))
        .and(shadowCoord.y.lessThanEqual(1))
        .and(shadowCoord.z.lessThanEqual(1));

      shadowCoord = vec3(
        shadowCoord.x,
        shadowCoord.y.oneMinus(), // WebGPU: Flip Y
        shadowCoord.z.add(bias).mul(2).sub(1), // WebGPU: Convertion [ 0, 1 ] to [ - 1, 1 ]
      );

      const textureCompare = (depthTexture, shadowCoord, compare) =>
        texture(depthTexture, shadowCoord).compare(compare);
      //const textureCompare = ( depthTexture, shadowCoord, compare ) => compare.step( texture( depthTexture, shadowCoord ) );

      // BasicShadowMap

      shadowNode = textureCompare(depthTexture, shadowCoord.xy, shadowCoord.z);

      // PCFShadowMap
      /*
       const mapSize = reference( 'mapSize', 'vec2', shadow );
       const radius = reference( 'radius', 'float', shadow );

       const texelSize = vec2( 1 ).div( mapSize );
       const dx0 = texelSize.x.negate().mul( radius );
       const dy0 = texelSize.y.negate().mul( radius );
       const dx1 = texelSize.x.mul( radius );
       const dy1 = texelSize.y.mul( radius );
       const dx2 = dx0.mul( 2 );
       const dy2 = dy0.mul( 2 );
       const dx3 = dx1.mul( 2 );
       const dy3 = dy1.mul( 2 );

       shadowNode = add(
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx0, dy0 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( 0, dy0 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx1, dy0 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx2, dy2 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( 0, dy2 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx3, dy2 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx0, 0 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx2, 0 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy, shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx3, 0 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx1, 0 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx2, dy3 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( 0, dy3 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx3, dy3 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx0, dy1 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( 0, dy1 ) ), shadowCoord.z ),
       textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx1, dy1 ) ), shadowCoord.z )
       ).mul( 1 / 17 );
       */
      //

      this.rtt = rtt;
      this.colorNode = this.colorNode.mul(frustumTest.mix(1, shadowNode));

      this.shadowNode = shadowNode;

      //

      this.updateBeforeType = NodeUpdateType.Render;
    }
  }

  construct(builder: NodeBuilder) {
    if (this.light.castShadow) this.constructShadow(builder);
  }

  updateShadow(frame: NodeFrame) {
    const { rtt, light } = this;
    const { renderer, scene } = frame;

    scene.overrideMaterial = depthMaterial;

    rtt.setSize(light.shadow.mapSize.width, light.shadow.mapSize.height);

    light.shadow.updateMatrices(light);

    renderer.setRenderTarget(rtt);
    renderer.render(scene, light.shadow.camera);
    renderer.setRenderTarget(null);

    scene.overrideMaterial = null;
  }

  updateBefore(frame: NodeFrame) {
    const { light } = this;

    if (light.castShadow) this.updateShadow(frame);
  }

  update(frame: NodeFrame) {
    const { light } = this;

    this.color.copy(light.color).multiplyScalar(light.intensity);
  }
}
