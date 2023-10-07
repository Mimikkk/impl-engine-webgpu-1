import { TempNode } from '../core/TempNode.js';
import { EPSILON } from '../math/MathNode.js';
import { addNodeElement, nodeProxy, tslFn, vec3 } from '../shadernode/ShaderNode.js';
import { Node } from '../core/Node.js';

const BurnNode = tslFn(({ base, blend }) => {
  const fn = c => blend[c].lessThan(EPSILON).cond(blend[c], base[c].oneMinus().div(blend[c]).oneMinus().max(0));

  return vec3(fn('x'), fn('y'), fn('z'));
});
const DodgeNode = tslFn(({ base, blend }) => {
  const fn = c => blend[c].equal(1.0).cond(blend[c], base[c].div(blend[c].oneMinus()).max(0));

  return vec3(fn('x'), fn('y'), fn('z'));
});
const ScreenNode = tslFn(({ base, blend }) => {
  const fn = c => base[c].oneMinus().mul(blend[c].oneMinus()).oneMinus();

  return vec3(fn('x'), fn('y'), fn('z'));
});
const OverlayNode = tslFn(({ base, blend }) => {
  const fn = c =>
    base[c].lessThan(0.5).cond(base[c].mul(blend[c], 2.0), base[c].oneMinus().mul(blend[c].oneMinus()).oneMinus());

  return vec3(fn('x'), fn('y'), fn('z'));
});

export class BlendModeNode extends TempNode {
  mode: BlendModeNode.Mode;
  nodeA: Node;
  nodeB: Node;

  constructor(blendMode: BlendModeNode.Mode, baseNode: Node, blendNode: Node) {
    super();
    this.mode = blendMode;
    this.nodeA = baseNode;
    this.nodeB = blendNode;
  }

  construct() {
    const params = { base: this.nodeA, blend: this.nodeB };

    switch (this.mode) {
      case BlendModeNode.Mode.Burn:
        return BurnNode(params);
      case BlendModeNode.Mode.Dodge:
        return DodgeNode(params);
      case BlendModeNode.Mode.Screen:
        return ScreenNode(params);
      case BlendModeNode.Mode.Overlay:
        return OverlayNode(params);
    }
  }
}

export namespace BlendModeNode {
  export enum Mode {
    Burn = 'burn',
    Dodge = 'dodge',
    Screen = 'screen',
    Overlay = 'overlay',
  }
}

export namespace BlendModeNodes {
  export const burn = nodeProxy(BlendModeNode, BlendModeNode.Mode.Burn);
  export const dodge = nodeProxy(BlendModeNode, BlendModeNode.Mode.Dodge);
  export const overlay = nodeProxy(BlendModeNode, BlendModeNode.Mode.Overlay);
  export const screen = nodeProxy(BlendModeNode, BlendModeNode.Mode.Screen);
}

addNodeElement('burn', BlendModeNodes.burn);
addNodeElement('dodge', BlendModeNodes.dodge);
addNodeElement('overlay', BlendModeNodes.overlay);
addNodeElement('screen', BlendModeNodes.screen);
