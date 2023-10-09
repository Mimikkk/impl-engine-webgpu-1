import { Color, Matrix3, Matrix4, Vector2, Vector3, Vector4 } from '../../Three.js';
import { NodeType } from './constants.js';
import { Node } from './Node.js';

export function getCacheKey(object: any) {
  let cacheKey = '{';

  if (object.isNode) {
    cacheKey += `uuid:"${object.uuid}"`;
  }

  for (const { property, index, childNode } of getNodeChildren(object)) {
    let childCacheKey = getCacheKey(childNode);

    if (!childCacheKey.includes(','))
      childCacheKey = childCacheKey.slice(childCacheKey.indexOf('"'), childCacheKey.indexOf('}'));

    cacheKey += `,${property}${index !== undefined ? '/' + index : ''}:${childCacheKey}`;
  }

  cacheKey += '}';

  return cacheKey;
}

export function* getNodeChildren(node: Node, toJSON = false) {
  for (const property in node) {
    // Ignore private properties.
    if (property.startsWith('_')) continue;

    //@ts-ignore
    const object = node[property];

    if (Array.isArray(object) === true) {
      for (let i = 0; i < object.length; i++) {
        const child = object[i];

        if (child && (child.isNode === true || (toJSON && typeof child.toJSON === 'function'))) {
          yield { property, index: i, childNode: child };
        }
      }
    } else if (object && object.isNode === true) {
      yield { property, childNode: object };
    } else if (typeof object === 'object') {
      for (const subProperty in object) {
        const child = object[subProperty];

        if (child && (child.isNode === true || (toJSON && typeof child.toJSON === 'function'))) {
          yield { property, index: subProperty, childNode: child };
        }
      }
    }
  }
}

export function getValueType(value: any): NodeType {
  if (value === undefined || value === null) return null;
  const type = typeof value;

  if (value.isNode) {
    return NodeType.Node;
  } else if (type === 'number') {
    return NodeType.Float;
  } else if (type === 'boolean') {
    return NodeType.Boolean;
  } else if (type === 'string') {
    return NodeType.String;
  } else if (type === 'function') {
    return NodeType.Shader;
  } else if (value.isVector2) {
    return NodeType.Vector2;
  } else if (value.isVector3) {
    return NodeType.Vector3;
  } else if (value.isVector4) {
    return NodeType.Vector4;
  } else if (value.isMatrix3) {
    return NodeType.Matrix3;
  } else if (value.isMatrix4) {
    return NodeType.Matrix4;
  } else if (value.isColor) {
    return NodeType.Color;
  } else if (value instanceof ArrayBuffer) {
    return NodeType.ArrayBuffer;
  }
  return null as never;
}

export function getValueFromType(type: NodeType, ...params: any[]) {
  const last4 = type ? type.slice(-4) : undefined;

  if ((last4 === 'vec2' || last4 === 'vec3' || last4 === 'vec4') && params.length === 1) {
    // ensure same behaviour as in NodeBuilder.format()

    params = last4 === 'vec2' ? [params[0], params[0]] : [params[0], params[0], params[0]];
  }

  if (type === 'color') {
    return new Color(...params);
  } else if (last4 === 'vec2') {
    return new Vector2(...params);
  } else if (last4 === 'vec3') {
    return new Vector3(...params);
  } else if (last4 === 'vec4') {
    return new Vector4(...params);
  } else if (last4 === 'mat3') {
    //@ts-ignore
    return new Matrix3(...params);
  } else if (last4 === 'mat4') {
    //@ts-ignore
    return new Matrix4(...params);
  } else if (type === 'bool') {
    return params[0] || false;
  } else if (type === 'float' || type === 'int' || type === 'uint') {
    return params[0] || 0;
  } else if (type === 'string') {
    return params[0] || '';
  } else if (type === 'ArrayBuffer') {
    return base64ToArrayBuffer(params[0]);
  }

  return null;
}

export function base64ToArrayBuffer(base64: string) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;
}
