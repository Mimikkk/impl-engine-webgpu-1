type Chain = WeakMap<object, Chain>;

export default class ChainMap {
  map: WeakMap<object, Chain>;
  constructor() {
    this.map = new WeakMap();
  }

  get(keys: object[]) {
    let map: Chain | undefined = this.map;

    for (let i = 0; i < keys.length - 1; i++) {
      map = map.get(keys[i]);
      if (map === undefined) return;
    }

    return map.get(keys[keys.length - 1]);
  }

  set(keys: object[], value: any) {
    let map: Chain | undefined = this.map;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!map!.has(key)) map!.set(key, new WeakMap());
      map = map!.get(key);
    }

    return map!.set(keys[keys.length - 1], value);
  }

  delete(keys: object[]) {
    let map: Chain | undefined = this.map;

    for (let i = 0; i < keys.length - 1; i++) {
      map = map.get(keys[i]);
      if (!map) return false;
    }

    return map.delete(keys[keys.length - 1]);
  }
}
