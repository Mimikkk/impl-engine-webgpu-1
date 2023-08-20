import { Color, Matrix3, Matrix4, Vector2, Vector3, Vector4 } from 'three';

export class FloatUniform {
  name: string;
  boundary: number;
  itemSize: number;
  value: number;
  isFloatUniform: boolean;

  constructor(name: string, value = 0) {
    this.name = name;
    this.value = value;

    this.isFloatUniform = true;

    this.boundary = 4;
    this.itemSize = 1;
  }
}

export class Vector2Uniform {
  name: string;
  boundary: number;
  itemSize: number;
  value: Vector2;
  isVector2Uniform: boolean;

  constructor(name: string, value = new Vector2()) {
    this.name = name;
    this.value = value;

    this.isVector2Uniform = true;

    this.boundary = 8;
    this.itemSize = 2;
  }
}

export class Vector3Uniform {
  name: string;
  boundary: number;
  itemSize: number;
  value: Vector3;
  isVector3Uniform: boolean;

  constructor(name: string, value = new Vector3()) {
    this.name = name;
    this.value = value;

    this.isVector3Uniform = true;

    this.boundary = 16;
    this.itemSize = 3;
  }
}

export class Vector4Uniform {
  name: string;
  boundary: number;
  itemSize: number;
  value: Vector4;
  isVector4Uniform: boolean;

  constructor(name: string, value = new Vector4()) {
    this.name = name;
    this.value = value;

    this.isVector4Uniform = true;

    this.boundary = 16;
    this.itemSize = 4;
  }
}

export class ColorUniform {
  name: string;
  boundary: number;
  itemSize: number;
  value: Color;
  isColorUniform: boolean;

  constructor(name: string, value = new Color()) {
    this.name = name;
    this.value = value;

    this.isColorUniform = true;

    this.boundary = 16;
    this.itemSize = 3;
  }
}

export class Matrix3Uniform {
  name: string;
  boundary: number;
  itemSize: number;
  value: Matrix3;
  isMatrix3Uniform: boolean;

  constructor(name: string, value = new Matrix3()) {
    this.name = name;
    this.value = value;

    this.isMatrix3Uniform = true;

    this.boundary = 48;
    this.itemSize = 12;
  }
}

export class Matrix4Uniform {
  name: string;
  boundary: number;
  itemSize: number;
  value: Matrix4;
  isMatrix4Uniform: boolean;

  constructor(name: string, value = new Matrix4()) {
    this.name = name;
    this.value = value;

    this.isMatrix4Uniform = true;

    this.boundary = 64;
    this.itemSize = 16;
  }
}
