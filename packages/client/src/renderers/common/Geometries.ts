import { AttributeType } from './Constants.js';
import { Uint16BufferAttribute, Uint32BufferAttribute } from 'three';
import { Statistics } from './createStatistics.js';
import RenderObject from './RenderObject.js';
import Attributes from './Attributes.js';

type Geometry = any;

const arrayNeedsUint32 = (array: number[]) => array.some(value => value >= 65535);
const getWireframeVersion = (geometry: Geometry) => geometry?.index.version ?? geometry.attributes.position.version;
const getWireframeIndex = (geometry: Geometry) => {
  const indices = [];

  const geometryIndex = geometry.index;
  const geometryPosition = geometry.attributes.position;

  if (geometryIndex) {
    const array = geometryIndex.array;

    for (let i = 0, l = array.length; i < l; i += 3) {
      const a = array[i];
      const b = array[i + 1];
      const c = array[i + 2];

      indices.push(a, b, b, c, c, a);
    }
  } else {
    const array = geometryPosition.array;

    for (let i = 0, l = array.length / 3 - 1; i < l; i += 3) {
      const a = i;
      const b = i + 1;
      const c = i + 2;

      indices.push(a, b, b, c, c, a);
    }
  }

  const attribute = new (arrayNeedsUint32(indices) ? Uint32BufferAttribute : Uint16BufferAttribute)(indices, 1);
  attribute.version = getWireframeVersion(geometry);

  return attribute;
};

export interface Geometries {
  updateForRender: (renderObject: RenderObject) => void;
  getIndex: (renderObject: RenderObject) => any;
}

export const createGeometries = (attributes: Attributes, statistics: Statistics) => {
  const map = new WeakMap();
  const attributeFrame = new WeakMap();
  const wireframes = new WeakMap();

  const get = (object: object) => {
    let item = map.get(object);

    if (!item) {
      item = {};
      map.set(object, item);
    }

    return item;
  };
  const has = ({ geometry }: RenderObject) => !!get(geometry)?.initialized;

  const updateForRender = (renderObject: RenderObject) => {
    if (!has(renderObject)) initialize(renderObject);
    updateAttributes(renderObject);
  };
  const initialize = (item: RenderObject) => {
    const geometryCpu = item.geometry;
    const geometryGpu = get(geometryCpu);

    geometryGpu.initialized = true;

    ++statistics.memory.geometries;

    const onDispose = () => {
      --statistics.memory.geometries;

      attributes.delete(geometryCpu.index);
      for (const attribute of item.getAttributes()) attributes.delete(attribute);

      attributes.delete(wireframes.get(geometryCpu));
      geometryCpu.removeEventListener('dispose', onDispose);
    };

    geometryCpu.addEventListener('dispose', onDispose);
  };
  const updateAttributes = (renderObject: RenderObject) => {
    const attributes = renderObject.getAttributes();

    for (const attribute of attributes) updateAttribute(attribute, AttributeType.Vertex);

    const index = getIndex(renderObject);
    if (index) updateAttribute(index, AttributeType.Index);
  };
  const updateAttribute = (attribute: any, type: any) => {
    const frame = statistics.render.frame;

    if (attributeFrame.get(attribute) !== frame) {
      attributes.update(attribute, type);

      attributeFrame.set(attribute, frame);
    }
  };
  const getIndex = (renderObject: RenderObject) => {
    const { geometry, material } = renderObject;

    if (material.wireframe) {
      let index = wireframes.get(geometry);

      if (!index) {
        index = getWireframeIndex(geometry);

        wireframes.set(geometry, index);
      } else if (index.version !== getWireframeVersion(geometry)) {
        attributes.delete(index);

        index = getWireframeIndex(geometry);

        wireframes.set(geometry, index);
      }

      return index;
    }

    return geometry.index;
  };

  return { updateForRender, getIndex };
};
