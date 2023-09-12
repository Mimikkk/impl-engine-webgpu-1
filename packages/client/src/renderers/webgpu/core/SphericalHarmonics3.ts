import { Vector3 } from './Vector3.js';
/**
 * Primary reference:
 *   https://graphics.stanford.edu/papers/envmap/envmap.pdf
 *
 * Secondary reference:
 *   https://www.ppsloan.org/publications/StupidSH36.pdf
 */

// 3-band SH defined by 9 coefficients

export class SphericalHarmonics3 {
  coefficients: [Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3];
  isSphericalHarmonics3: boolean;
  declare ['constructor']: new () => this;

  constructor() {
    this.isSphericalHarmonics3 = true;
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

  set(coefficients: [Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3]) {
    for (let i = 0; i < 9; i++) this.coefficients[i].copy(coefficients[i]);
    return this;
  }

  zero() {
    for (let i = 0; i < 9; i++) this.coefficients[i].set(0, 0, 0);
    return this;
  }

  // get the radiance in the direction of the normal
  // target is a Vector3
  getAt({ x, y, z }: Vector3, target: Vector3) {
    // normal is assumed to be unit length

    // band 0
    target.copy(this.coefficients[0]).multiplyScalar(0.282095);

    // band 1
    target.addScaledVector(this.coefficients[1], 0.488603 * y);
    target.addScaledVector(this.coefficients[2], 0.488603 * z);
    target.addScaledVector(this.coefficients[3], 0.488603 * x);

    // band 2
    target.addScaledVector(this.coefficients[4], 1.092548 * (x * y));
    target.addScaledVector(this.coefficients[5], 1.092548 * (y * z));
    target.addScaledVector(this.coefficients[6], 0.315392 * (3.0 * z * z - 1.0));
    target.addScaledVector(this.coefficients[7], 1.092548 * (x * z));
    target.addScaledVector(this.coefficients[8], 0.546274 * (x * x - y * y));

    return target;
  }

  // get the irradiance (radiance convolved with cosine lobe) in the direction of the normal
  // target is a Vector3
  // https://graphics.stanford.edu/papers/envmap/envmap.pdf
  getIrradianceAt({ x, y, z }: Vector3, target: Vector3) {
    // band 0
    // π * 0.282095
    target.copy(this.coefficients[0]).multiplyScalar(0.886227);

    // band 1
    // ( 2 * π / 3 ) * 0.488603
    target.addScaledVector(this.coefficients[1], 2.0 * 0.511664 * y);
    target.addScaledVector(this.coefficients[2], 2.0 * 0.511664 * z);
    target.addScaledVector(this.coefficients[3], 2.0 * 0.511664 * x);

    // band 2
    // ( π / 4 ) * 1.092548
    target.addScaledVector(this.coefficients[4], 2.0 * 0.429043 * x * y);
    target.addScaledVector(this.coefficients[5], 2.0 * 0.429043 * y * z);
    // ( π / 4 ) * 0.315392 * 3
    target.addScaledVector(this.coefficients[6], 0.743125 * z * z - 0.247708);
    target.addScaledVector(this.coefficients[7], 2.0 * 0.429043 * x * z);
    // ( π / 4 ) * 0.546274
    target.addScaledVector(this.coefficients[8], 0.429043 * (x * x - y * y));

    return target;
  }

  add(sh: SphericalHarmonics3): SphericalHarmonics3 {
    for (let i = 0; i < 9; i++) {
      this.coefficients[i].add(sh.coefficients[i]);
    }

    return this;
  }

  addScaledSH(other: SphericalHarmonics3, scale: number): SphericalHarmonics3 {
    for (let i = 0; i < 9; i++) this.coefficients[i].addScaledVector(other.coefficients[i], scale);
    return this;
  }

  scale(scale: number) {
    for (let i = 0; i < 9; i++) this.coefficients[i].multiplyScalar(scale);
    return this;
  }

  lerp(other: SphericalHarmonics3, alpha: number): SphericalHarmonics3 {
    for (let i = 0; i < 9; i++) this.coefficients[i].lerp(other.coefficients[i], alpha);
    return this;
  }

  equals(other: SphericalHarmonics3): boolean {
    for (let i = 0; i < 9; i++) if (!this.coefficients[i].equals(other.coefficients[i])) return false;
    return true;
  }

  copy(other: SphericalHarmonics3): SphericalHarmonics3 {
    return this.set(other.coefficients);
  }

  clone(): SphericalHarmonics3 {
    return new this.constructor().copy(this);
  }

  fromArray(array: number[], offset: number = 0) {
    for (let i = 0; i < 9; i++) this.coefficients[i].fromArray(array, offset + i * 3);

    return this;
  }

  toArray(array: number[] = [], offset: number = 0) {
    for (let i = 0; i < 9; i++) this.coefficients[i].toArray(array, offset + i * 3);

    return array;
  }

  static getBasisAt(
    { x, y, z }: Vector3,
    basis: [number, number, number, number, number, number, number, number, number],
  ) {
    // band 0
    basis[0] = 0.282095;

    // band 1
    basis[1] = 0.488603 * y;
    basis[2] = 0.488603 * z;
    basis[3] = 0.488603 * x;

    // band 2
    basis[4] = 1.092548 * x * y;
    basis[5] = 1.092548 * y * z;
    basis[6] = 0.315392 * (3 * z * z - 1);
    basis[7] = 1.092548 * x * z;
    basis[8] = 0.546274 * (x * x - y * y);
  }
}
