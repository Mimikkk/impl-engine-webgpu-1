import { EventDispatcher, MathUtils } from '../../Three.js';
import { NodeType, NodeUpdateType } from './constants.js';
import { getCacheKey, getNodeChildren } from './NodeUtils.js';
import NodeBuilder from './NodeBuilder.js';
import NodeFrame from './NodeFrame.js';

let _nodeId = 0;

export class Node extends EventDispatcher<'dispose'> {
  static is(node: any): node is Node {
    return node?.isNode;
  }
  nodeType: string | null;
  updateType: NodeUpdateType;
  updateBeforeType: NodeUpdateType;
  uuid: string;
  isNode: boolean;

  constructor(nodeType: NodeType | null = null) {
    super();

    this.nodeType = nodeType;

    this.updateType = NodeUpdateType.None;
    this.updateBeforeType = NodeUpdateType.None;

    this.uuid = MathUtils.generateUUID();

    this.isNode = true;

    Object.defineProperty(this, 'id', { value: _nodeId++ });
  }

  get type() {
    return this.constructor.name;
  }

  isGlobal(builder: NodeBuilder) {
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

  getHash(builder: NodeBuilder) {
    return this.uuid;
  }

  getUpdateType() {
    return this.updateType;
  }

  getUpdateBeforeType() {
    return this.updateBeforeType;
  }

  getNodeType(builder: NodeBuilder, output?: string) {
    return this.nodeType;
  }

  getReference(builder: NodeBuilder) {
    const hash = this.getHash(builder);
    const nodeFromHash = builder.getNodeFromHash(hash);

    return nodeFromHash || this;
  }

  construct(builder: NodeBuilder): Node | null | undefined {
    const nodeProperties = builder.getNodeProperties(this);

    for (const { childNode } of this.getChildren()) {
      nodeProperties['_node' + childNode.id] = childNode;
    }

    return null;
  }

  analyze(builder: NodeBuilder) {
    const nodeData = builder.getDataFromNode(this);
    nodeData.dependenciesCount = nodeData.dependenciesCount === undefined ? 1 : nodeData.dependenciesCount + 1;

    if (nodeData.dependenciesCount === 1) {
      const nodeProperties = builder.getNodeProperties(this);
      for (const childNode of Object.values(nodeProperties)) {
        if (Node.is(childNode)) childNode.build(builder);
      }
    }
  }

  generate(builder: NodeBuilder, output?: NodeType): string | undefined {
    const { outputNode } = builder.getNodeProperties(this);

    if (outputNode?.isNode) return outputNode.build(builder, output);
  }

  updateBefore(frame: NodeFrame) {
    console.warn('Abstract function.');
  }

  update(frame: NodeFrame) {
    console.warn('Abstract function.');
  }

  build(builder: NodeBuilder, output?: NodeType) {
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
          if (Node.is(childNode)) childNode.build(builder);
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

        if (result === undefined) {
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
