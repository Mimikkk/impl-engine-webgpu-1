import { EventDispatcher, MathUtils } from '../../Three.js';
import { NodeUpdateType } from './constants.js';
import { getCacheKey, getNodeChildren } from './NodeUtils.js';

const NodeClasses = new Map();

let _nodeId = 0;

class Node extends EventDispatcher {
  constructor(nodeType = null) {
    super();

    this.nodeType = nodeType;

    this.updateType = NodeUpdateType.NONE;
    this.updateBeforeType = NodeUpdateType.NONE;

    this.uuid = MathUtils.generateUUID();

    this.isNode = true;

    Object.defineProperty(this, 'id', { value: _nodeId++ });
  }

  get type() {
    return this.constructor.name;
  }

  isGlobal(/*builder*/) {
    return false;
  }

  *getChildren() {
    const self = this;

    for (const { property, index, childNode } of getNodeChildren(this)) {
      yield {
        childNode,
        replaceNode(node) {
          if (index === undefined) self[property] = node;
          else self[property][index] = node;
        },
      };
    }
  }

  dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }

  traverse(callback, replaceNode = null) {
    callback(this, replaceNode);

    for (const { childNode, replaceNode } of this.getChildren()) {
      childNode.traverse(callback, replaceNode);
    }
  }

  getCacheKey() {
    return getCacheKey(this);
  }

  getHash(/*builder*/) {
    return this.uuid;
  }

  getUpdateType() {
    return this.updateType;
  }

  getUpdateBeforeType() {
    return this.updateBeforeType;
  }

  getNodeType(/*builder*/) {
    return this.nodeType;
  }

  getReference(builder) {
    const hash = this.getHash(builder);
    const nodeFromHash = builder.getNodeFromHash(hash);

    return nodeFromHash || this;
  }

  construct(builder) {
    const nodeProperties = builder.getNodeProperties(this);

    for (const { childNode } of this.getChildren()) {
      nodeProperties['_node' + childNode.id] = childNode;
    }

    // return a outputNode if exists
    return null;
  }

  analyze(builder) {
    const nodeData = builder.getDataFromNode(this);
    nodeData.dependenciesCount = nodeData.dependenciesCount === undefined ? 1 : nodeData.dependenciesCount + 1;

    if (nodeData.dependenciesCount === 1) {
      // node flow children

      const nodeProperties = builder.getNodeProperties(this);

      for (const childNode of Object.values(nodeProperties)) {
        if (childNode && childNode.isNode === true) {
          childNode.build(builder);
        }
      }
    }
  }

  generate(builder, output) {
    const { outputNode } = builder.getNodeProperties(this);

    if (outputNode && outputNode.isNode === true) {
      return outputNode.build(builder, output);
    }
  }

  updateBefore(/*frame*/) {
    console.warn('Abstract function.');
  }

  update(/*frame*/) {
    console.warn('Abstract function.');
  }

  build(builder, output = null) {
    const refNode = this.getReference(builder);

    if (this !== refNode) {
      return refNode.build(builder, output);
    }

    builder.addNode(this);
    builder.addChain(this);

    /* Build stages expected results:
      - "construct"	-> Node
      - "analyze"		-> null
      - "generate"	-> String
    */
    let result = null;

    const buildStage = builder.getBuildStage();

    if (buildStage === 'construct') {
      const properties = builder.getNodeProperties(this);

      if (properties.initialized !== true || builder.context.tempRead === false) {
        const stackNodesBeforeConstruct = builder.stack.nodes.length;

        properties.initialized = true;
        properties.outputNode = this.construct(builder);

        if (properties.outputNode !== null && builder.stack.nodes.length !== stackNodesBeforeConstruct) {
          properties.outputNode = builder.stack;
        }

        for (const childNode of Object.values(properties)) {
          if (childNode && childNode.isNode === true) {
            childNode.build(builder);
          }
        }
      }
    } else if (buildStage === 'analyze') {
      this.analyze(builder);
    } else if (buildStage === 'generate') {
      const isGenerateOnce = this.generate.length === 1;

      if (isGenerateOnce) {
        const type = this.getNodeType(builder);
        const nodeData = builder.getDataFromNode(this);

        result = nodeData.snippet;

        if (result === undefined /*|| builder.context.tempRead === false*/) {
          result = this.generate(builder) || '';

          nodeData.snippet = result;
        }

        result = builder.format(result, type, output);
      } else {
        result = this.generate(builder, output) || '';
      }
    }

    builder.removeChain(this);

    return result;
  }
}

export default Node;

export function addNodeClass(nodeClass) {
  if (typeof nodeClass !== 'function' || !nodeClass.name)
    throw new Error(`Node class ${nodeClass.name} is not a class`);
  if (NodeClasses.has(nodeClass.name)) throw new Error(`Redefinition of node class ${nodeClass.name}`);

  NodeClasses.set(nodeClass.name, nodeClass);
}

export function createNodeFromType(type) {
  const Class = NodeClasses.get(type);

  if (Class !== undefined) {
    return new Class();
  }
}
