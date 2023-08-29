export class Uniform<T extends { clone?: () => T } = any> {
  value: T;

  constructor(value: T) {
    this.value = value;
  }

  clone() {
    return new Uniform(this.value.clone?.() ?? this.value);
  }
}
