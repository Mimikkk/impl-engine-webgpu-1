import { Color, Mesh, Scene, SphereGeometry } from 'three';
import {
  backgroundBlurriness,
  backgroundIntensity,
  context,
  modelViewProjection,
  NodeMaterial,
  normalWorld,
  vec4,
} from 'three/examples/jsm/nodes/Nodes.js';
import { Renderer } from '../createRenderer.js';
import RenderList from './RenderList.js';
import { RenderContext } from './RenderContext.js';
import DataMap from './DataMap.js';
import { BackSide } from './Constants.js';

let _clearAlpha: number;
const _clearColor = new Color();

export interface Background {
  update: (scene: Scene, renderList: RenderList, renderContext: RenderContext) => void;
}

export const createBackground = (renderer: Renderer): Background => {
  let map = new DataMap<any>();
  let backgroundMesh: any = null;
  let backgroundMeshNode: any = null;

  return {
    update: (scene: Scene, renderList: RenderList, renderContext: RenderContext) => {
      const background = renderer.nodes.getBackgroundNode(scene) || scene.background;

      let forceClear = false;
      if (!background) {
        _clearColor.copyLinearToSRGB(renderer._clearColor);
        _clearAlpha = renderer._clearAlpha;
      } else if (background.isColor) {
        _clearColor.copyLinearToSRGB(background);
        _clearAlpha = 1;
        forceClear = true;
      } else if (background.isNode) {
        const sceneData = map.get(scene);
        const backgroundNode = background;

        _clearColor.copy(renderer._clearColor);
        _clearAlpha = renderer._clearAlpha;

        if (!backgroundMesh) {
          backgroundMeshNode = (
            context(backgroundNode, {
              getUVNode: () => normalWorld,
              getSamplerLevelNode: () => backgroundBlurriness,
            }) as unknown as { mul: (a: any) => any }
          ).mul(backgroundIntensity);

          let viewProj = modelViewProjection();
          viewProj = vec4(viewProj.x, viewProj.y, viewProj.w, viewProj.w);

          const nodeMaterial = new NodeMaterial() as NodeMaterial & { vertexNode: any; outputNode: any };
          nodeMaterial.outputNode = backgroundMeshNode;
          nodeMaterial.side = BackSide;
          nodeMaterial.depthTest = false;
          nodeMaterial.depthWrite = false;
          nodeMaterial.fog = false;
          nodeMaterial.vertexNode = viewProj;

          backgroundMesh = backgroundMesh = new Mesh(new SphereGeometry(1, 32, 32), nodeMaterial);
          backgroundMesh.frustumCulled = false;

          backgroundMesh.onBeforeRender = function (renderer: Renderer, scene: any, camera: any) {
            this.matrixWorld.copyPosition(camera.matrixWorld);
          };
        }

        const backgroundCacheKey = backgroundNode.getCacheKey();

        if (sceneData.backgroundCacheKey !== backgroundCacheKey) {
          backgroundMeshNode.node = backgroundNode;

          backgroundMesh.material.needsUpdate = true;

          sceneData.backgroundCacheKey = backgroundCacheKey;
        }

        renderList.unshift(backgroundMesh, backgroundMesh.geometry, backgroundMesh.material, 0, 0, null);
      }

      if (renderer.autoClear || forceClear) {
        _clearColor.multiplyScalar(_clearAlpha);
        renderContext.clearColorValue.r = _clearColor.r;
        renderContext.clearColorValue.g = _clearColor.g;
        renderContext.clearColorValue.b = _clearColor.b;
        renderContext.clearColorValue.a = _clearAlpha;
        renderContext.clearColor = !!renderer.autoClearColor;
        renderContext.clearDepth = !!renderer.autoClearDepth;
        renderContext.clearStencil = !!renderer.autoClearStencil;
      } else {
        renderContext.clearColor = false;
        renderContext.clearDepth = false;
        renderContext.clearStencil = false;
      }
    },
  };
};
