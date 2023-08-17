class DataMap<T extends {}> {
  map = new WeakMap<object, T>();

  get(object: any) {
    let item = this.map.get(object);

    if (!item) {
      item = {} as T;
      this.map.set(object, item);
    }

    return item;
  }

  delete(object: T) {
    let item;

    if (this.map.has(object)) {
      item = this.map.get(object);

      this.map.delete(object);
    }

    return item;
  }

  has = (item: T) => this.map.has(item);
}

export default DataMap;
