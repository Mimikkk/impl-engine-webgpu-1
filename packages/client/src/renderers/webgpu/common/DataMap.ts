class DataMap<T extends {}> {
  map = new WeakMap<object, T>();
  create: () => T;

  constructor(create: () => T = () => ({}) as T) {
    this.create = create;
  }

  get(object: object) {
    let item = this.map.get(object);

    if (!item) {
      item = this.create();
      this.map.set(object, item);
    }

    return item;
  }

  delete(object: object) {
    let item;

    if (this.map.has(object)) {
      item = this.map.get(object);

      this.map.delete(object);
    }

    return item;
  }

  has = (object: object) => this.map.has(object);
}

export default DataMap;
export const createDataMap = <T extends {}>(create: () => T) => new DataMap<T>(create);
