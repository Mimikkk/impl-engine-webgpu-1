import {
  FloatUniform,
  Vector2Uniform,
  Vector3Uniform,
  Vector4Uniform,
  ColorUniform,
  Matrix3Uniform,
  Matrix4Uniform,
} from '../Uniform.ts';

export class FloatNodeUniform extends FloatUniform {
  constructor(nodeUniform) {
    super(nodeUniform.name, nodeUniform.value);

    this.nodeUniform = nodeUniform;
  }

  getValue() {
    return this.nodeUniform.value;
  }
}

export class Vector2NodeUniform extends Vector2Uniform {
  constructor(nodeUniform) {
    super(nodeUniform.name, nodeUniform.value);

    this.nodeUniform = nodeUniform;
  }

  getValue() {
    return this.nodeUniform.value;
  }
}

export class Vector3NodeUniform extends Vector3Uniform {
  constructor(nodeUniform) {
    super(nodeUniform.name, nodeUniform.value);

    this.nodeUniform = nodeUniform;
  }

  getValue() {
    return this.nodeUniform.value;
  }
}

export class Vector4NodeUniform extends Vector4Uniform {
  constructor(nodeUniform) {
    super(nodeUniform.name, nodeUniform.value);

    this.nodeUniform = nodeUniform;
  }

  getValue() {
    return this.nodeUniform.value;
  }
}

export class ColorNodeUniform extends ColorUniform {
  constructor(nodeUniform) {
    super(nodeUniform.name, nodeUniform.value);

    this.nodeUniform = nodeUniform;
  }

  getValue() {
    return this.nodeUniform.value;
  }
}

export class Matrix3NodeUniform extends Matrix3Uniform {
  constructor(nodeUniform) {
    super(nodeUniform.name, nodeUniform.value);

    this.nodeUniform = nodeUniform;
  }

  getValue() {
    return this.nodeUniform.value;
  }
}

export class Matrix4NodeUniform extends Matrix4Uniform {
  constructor(nodeUniform) {
    super(nodeUniform.name, nodeUniform.value);

    this.nodeUniform = nodeUniform;
  }

  getValue() {
    return this.nodeUniform.value;
  }
}
