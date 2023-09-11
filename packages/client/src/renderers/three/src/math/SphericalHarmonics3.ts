import { Vector3 } from './Vector3.js';

export class SphericalHarmonics3 {
  declare ['constructor']: typeof SphericalHarmonics3;
  declare isSphericalHarmonics3: boolean;
  coefficients: [Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3];

  constructor() {
    this.coefficients = [
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
    ];
  }

  static getBasisAt(
    normal: Vector3,
    shBasis: [number, number, number, number, number, number, number, number, number],
  ): void {
    // normal is assumed to be unit length

    const x = normal.x,
      y = normal.y,
      z = normal.z;

    // band 0
    shBasis[0] = 0.282095;

    // band 1
    shBasis[1] = 0.488603 * y;
    shBasis[2] = 0.488603 * z;
    shBasis[3] = 0.488603 * x;

    // band 2
    shBasis[4] = 1.092548 * x * y;
    shBasis[5] = 1.092548 * y * z;
    shBasis[6] = 0.315392 * (3 * z * z - 1);
    shBasis[7] = 1.092548 * x * z;
    shBasis[8] = 0.546274 * (x * x - y * y);
  }

  set(
    coefficients: [Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3],
  ): SphericalHarmonics3 {
    for (let i = 0; i < 9; i++) {
      this.coefficients[i].copy(coefficients[i]);
    }

    return this;
  }

  zero() {
    for (let i = 0; i < 9; i++) {
      this.coefficients[i].set(0, 0, 0);
    }

    return this;
  }

  getAt(normal: Vector3, target: Vector3): Vector3 {
    // normal is assumed to be unit length

    const x = normal.x,
      y = normal.y,
      z = normal.z;

    const coeff = this.coefficients;

    // band 0
    target.copy(coeff[0]).multiplyScalar(0.282095);

    // band 1
    target.addScaledVector(coeff[1], 0.488603 * y);
    target.addScaledVector(coeff[2], 0.488603 * z);
    target.addScaledVector(coeff[3], 0.488603 * x);

    // band 2
    target.addScaledVector(coeff[4], 1.092548 * (x * y));
    target.addScaledVector(coeff[5], 1.092548 * (y * z));
    target.addScaledVector(coeff[6], 0.315392 * (3.0 * z * z - 1.0));
    target.addScaledVector(coeff[7], 1.092548 * (x * z));
    target.addScaledVector(coeff[8], 0.546274 * (x * x - y * y));

    return target;
  }

  getIrradianceAt(normal: Vector3, target: Vector3): Vector3 {
    // normal is assumed to be unit length

    const x = normal.x,
      y = normal.y,
      z = normal.z;

    const coeff = this.coefficients;

    // band 0
    target.copy(coeff[0]).multiplyScalar(0.886227); // π * 0.282095

    // band 1
    target.addScaledVector(coeff[1], 2.0 * 0.511664 * y); // ( 2 * π / 3 ) * 0.488603
    target.addScaledVector(coeff[2], 2.0 * 0.511664 * z);
    target.addScaledVector(coeff[3], 2.0 * 0.511664 * x);

    // band 2
    target.addScaledVector(coeff[4], 2.0 * 0.429043 * x * y); // ( π / 4 ) * 1.092548
    target.addScaledVector(coeff[5], 2.0 * 0.429043 * y * z);
    target.addScaledVector(coeff[6], 0.743125 * z * z - 0.247708); // ( π / 4 ) * 0.315392 * 3
    target.addScaledVector(coeff[7], 2.0 * 0.429043 * x * z);
    target.addScaledVector(coeff[8], 0.429043 * (x * x - y * y)); // ( π / 4 ) * 0.546274

    return target;
  }

  add(sh: SphericalHarmonics3): SphericalHarmonics3 {
    for (let i = 0; i < 9; i++) {
      this.coefficients[i].add(sh.coefficients[i]);
    }

    return this;
  }

  addScaledSH(sh: SphericalHarmonics3, s: number): SphericalHarmonics3 {
    for (let i = 0; i < 9; i++) {
      this.coefficients[i].addScaledVector(sh.coefficients[i], s);
    }

    return this;
  }

  scale(s: number): SphericalHarmonics3 {
    for (let i = 0; i < 9; i++) {
      this.coefficients[i].multiplyScalar(s);
    }

    return this;
  }

  lerp(sh: SphericalHarmonics3, alpha: number): SphericalHarmonics3 {
    for (let i = 0; i < 9; i++) {
      this.coefficients[i].lerp(sh.coefficients[i], alpha);
    }

    return this;
  }

  equals(sh: SphericalHarmonics3): boolean {
    for (let i = 0; i < 9; i++) {
      if (!this.coefficients[i].equals(sh.coefficients[i])) {
        return false;
      }
    }

    return true;
  }

  copy(sh: SphericalHarmonics3): SphericalHarmonics3 {
    return this.set(sh.coefficients);
  }

  clone(): SphericalHarmonics3 {
    return new this.constructor().copy(this);
  }

  fromArray(array: number[], offset: number = 0): SphericalHarmonics3 {
    const coefficients = this.coefficients;

    for (let i = 0; i < 9; i++) {
      coefficients[i].fromArray(array, offset + i * 3);
    }

    return this;
  }

  // evaluate the basis functions

  toArray(array: number[] = [], offset: number = 0): number[] {
    const coefficients = this.coefficients;

    for (let i = 0; i < 9; i++) {
      coefficients[i].toArray(array, offset + i * 3);
    }

    return array;
  }
}
SphericalHarmonics3.prototype.isSphericalHarmonics3 = true;
