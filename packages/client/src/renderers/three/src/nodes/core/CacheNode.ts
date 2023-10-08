import { Node } from './Node.js';
import { NodeCache } from './NodeCache.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from './NodeBuilder.js';

export class CacheNode extends Node {
  node: Node;
  cache: NodeCache;

  constructor(node: Node, cache: NodeCache = new NodeCache()) {
    super();

    this.node = node;
    this.cache = cache;
  }

  getNodeType(builder: NodeBuilder) {
    return this.node.getNodeType(builder);
  }

  build(builder: NodeBuilder, ...params: any[]) {
    const previousCache = builder.getCache();

    builder.setCache(this.cache);

    const data = this.node.build(builder, ...params);

    builder.setCache(previousCache);

    return data;
  }
}

export const cache = nodeProxy(CacheNode);

addNodeElement('cache', cache);
