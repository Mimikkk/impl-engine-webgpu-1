import DataMap, { createDataMap } from './DataMap.js';
import { AttributeType } from './Constants.js';
import { DynamicDrawUsage } from 'three';
import type { Organizer } from '../webgpu/createOrganizer.js';

// TODO - this is a mess
type Attribute = {
  version: any;
  /** whether inner buffer's layout contains attributes of multiple types */
  isInterleaved: boolean;
  data: any;
  usage: any;
};

class Attributes {
  map: DataMap<Attribute>;
  api: Organizer;

  constructor(api: Organizer) {
    this.map = createDataMap(() => ({}) as Attribute);
    this.api = api;
  }

  get = (attributeCpu: Attribute) => this.map.get(attributeCpu);

  delete(attributeCpu: Attribute) {
    const attributeGpu = this.map.delete(attributeCpu);
    if (attributeGpu) this.api.destroyAttribute(attributeCpu);
  }

  update(attribute: Attribute, type: AttributeType) {
    const data = this.get(attribute);

    if (!data.version) {
      if (type === AttributeType.Vertex) {
        this.api.createVertexAttribute(attribute);
      } else if (type === AttributeType.Index) {
        this.api.createIndexAttribute(attribute);
      } else if (type === AttributeType.Storage) {
        this.api.createStorageAttribute(attribute);
      }

      data.version = this._getBufferAttribute(attribute).version;
    } else {
      const bufferAttribute = this._getBufferAttribute(attribute);

      if (data.version < bufferAttribute.version || bufferAttribute.usage === DynamicDrawUsage) {
        this.api.updateAttribute(attribute);
        data.version = bufferAttribute.version;
      }
    }
  }

  _getBufferAttribute(attribute: Attribute) {
    if (attribute.isInterleaved) attribute = attribute.data;
    return attribute;
  }
}

export default Attributes;
