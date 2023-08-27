import { Matrix3 } from '../../core/Matrix3.js';
import { Matrix4 } from '../../core/Matrix4.js';
import { Vector2 } from '../../core/Vector2.js';
import { Vector3 } from '../../core/Vector3.js';
import { Vector4 } from '../../core/Vector4.js';
import { NodeUniform } from 'three/examples/jsm/nodes/Nodes.js';
import { Color } from '../../core/Color.js';

export class FloatNodeUniform {
  name: string;
  boundary: number;
  itemSize: number;
  value: number;
  isFloatUniform: boolean;

  nodeUniform: any;
  constructor(nodeUniform: NodeUniform) {
    this.name = nodeUniform.name;
    this.value = (nodeUniform.value ?? 0) as number;

    this.isFloatUniform = true;

    this.boundary = 4;
    this.itemSize = 1;

    this.nodeUniform = nodeUniform;
  }

  getValue() {
    return this.nodeUniform.value;
  }
}

export class Vector2NodeUniform {
  name: string;
  boundary: number;
  itemSize: number;
  value: Vector2;
  isVector2Uniform: boolean;
  nodeUniform: any;

  constructor(nodeUniform: NodeUniform) {
    this.name = nodeUniform.name;
    this.value = (nodeUniform.value ?? new Vector2()) as Vector2;

    this.isVector2Uniform = true;

    this.boundary = 8;
    this.itemSize = 2;
    this.nodeUniform = nodeUniform;
  }

  getValue() {
    return this.nodeUniform.value;
  }
}

export class Vector3NodeUniform {
  name: string;
  boundary: number;
  itemSize: number;
  value: Vector3;
  isVector3Uniform: boolean;

  nodeUniform: any;
  constructor(nodeUniform: NodeUniform) {
    this.name = nodeUniform.name;
    this.value = (nodeUniform.value ?? new Vector3()) as Vector3;

    this.isVector3Uniform = true;

    this.boundary = 16;
    this.itemSize = 3;
    this.nodeUniform = nodeUniform;
  }

  getValue() {
    return this.nodeUniform.value;
  }
}

export class Vector4NodeUniform {
  name: string;
  boundary: number;
  itemSize: number;
  value: Vector4;
  isVector4Uniform: boolean;

  nodeUniform: any;
  constructor(nodeUniform: NodeUniform) {
    this.name = nodeUniform.name;
    this.value = (nodeUniform.value ?? new Vector4()) as Vector4;

    this.isVector4Uniform = true;

    this.boundary = 16;
    this.itemSize = 4;
    this.nodeUniform = nodeUniform;
  }

  getValue() {
    return this.nodeUniform.value;
  }
}

export class ColorNodeUniform {
  name: string;
  boundary: number;
  itemSize: number;
  value: Color;
  isColorUniform: boolean;

  nodeUniform: any;
  constructor(nodeUniform: NodeUniform) {
    this.name = nodeUniform.name;
    this.value = (nodeUniform.value ?? new Color(1, 1, 1)) as Color;

    this.isColorUniform = true;

    this.boundary = 16;
    this.itemSize = 3;
    this.nodeUniform = nodeUniform;
  }

  getValue() {
    return this.nodeUniform.value;
  }
}

export class Matrix3NodeUniform {
  name: string;
  boundary: number;
  itemSize: number;
  value: Matrix3;
  isMatrix3Uniform: boolean;

  nodeUniform: any;
  constructor(nodeUniform: NodeUniform) {
    this.name = nodeUniform.name;
    this.value = (nodeUniform.value ?? new Matrix3()) as Matrix3;

    this.isMatrix3Uniform = true;

    this.boundary = 48;
    this.itemSize = 12;
    this.nodeUniform = nodeUniform;
  }

  getValue() {
    return this.nodeUniform.value;
  }
}

export class Matrix4NodeUniform {
  name: string;
  boundary: number;
  itemSize: number;
  value: Matrix4;
  isMatrix4Uniform: boolean;

  nodeUniform: any;
  constructor(nodeUniform: NodeUniform) {
    this.name = nodeUniform.name;
    this.value = (nodeUniform.value ?? new Matrix4()) as Matrix4;
    this.isMatrix4Uniform = true;

    this.boundary = 64;
    this.itemSize = 16;
    this.nodeUniform = nodeUniform;
  }

  getValue() {
    return this.nodeUniform.value;
  }
}
