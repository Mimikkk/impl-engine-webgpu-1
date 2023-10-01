import { NodeMaterial, addNodeMaterial } from './NodeMaterial.js';
import { PointsMaterial } from '../../Three.js';
import { ShaderMaterialParameters } from 'three/src/Three.js';
import { Node } from 'three/examples/jsm/nodes/Nodes.js';

const defaultValues = new PointsMaterial();

export class PointsNodeMaterial extends NodeMaterial {
  isPointsNodeMateria: true = true;
  lightNode: Node | null;
  sizeNode: Node | null;

  constructor(parameters?: ShaderMaterialParameters) {
    super();

    this.lights = false;
    this.normals = false;

    this.transparent = true;

    this.colorNode = null;
    this.opacityNode = null;

    this.alphaTestNode = null;

    this.lightNode = null;

    this.sizeNode = null;

    this.positionNode = null;

    this.setDefaultValues(defaultValues);

    this.setValues(parameters as any);
  }

  copy(source: PointsNodeMaterial) {
    this.sizeNode = source.sizeNode;

    return super.copy(source);
  }
}

addNodeMaterial(PointsNodeMaterial);
