type Chain<T extends object> = WeakMap<object, Chain<T>> | T;

export default class ChainMap<T extends object> {
  map: WeakMap<object, Chain<T>>;
  constructor() {
    this.map = new WeakMap();
  }
  get(keys: object[]) {
    let map = this.map;

    for (let i = 0; i < keys.length - 1; i++) {
      map = map.get(keys[i]) as WeakMap<object, Chain<T>>;
      if (!map) return;
    }

    return map.get(keys[keys.length - 1]);
  }
  set(keys: object[], value: T) {
    let map = this.map;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!map!.has(key)) map!.set(key, new WeakMap());
      map = map.get(keys[i]) as WeakMap<object, Chain<T>>;
    }

    return map!.set(keys[keys.length - 1], value);
  }
  delete(keys: object[]) {
    let map = this.map;

    for (let i = 0; i < keys.length - 1; i++) {
      map = map.get(keys[i]) as WeakMap<object, Chain<T>>;
      if (!map) return false;
    }

    return map.delete(keys[keys.length - 1]);
  }
}
