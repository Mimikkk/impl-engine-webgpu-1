import { Node } from './Node.js';
import { NodeBuilder } from './NodeBuilder.js';
import { NodeType } from './constants.js';

export class TempNode extends Node {
  static is(item: any): item is TempNode {
    return item?.isTempNode;
  }
  isTempNode: boolean = true;

  constructor(type: NodeType | null = null) {
    super(type);
  }

  hasDependencies(builder: NodeBuilder) {
    return builder.getDataFromNode(this).dependenciesCount > 1;
  }

  build(builder: NodeBuilder, output?: NodeType) {
    const buildStage = builder.getBuildStage();

    if (buildStage === 'generate') {
      const type = builder.getVectorType(this.getNodeType(builder, output));
      const nodeData = builder.getDataFromNode(this);

      if (builder.context.tempRead !== false && nodeData.propertyName !== undefined) {
        return builder.format(nodeData.propertyName, type, output);
      } else if (
        builder.context.tempWrite !== false &&
        type !== 'void' &&
        output !== 'void' &&
        this.hasDependencies(builder)
      ) {
        const snippet = super.build(builder, type);

        const nodeVar = builder.getVarFromNode(this, type);
        const propertyName = builder.getPropertyName(nodeVar);

        builder.addLineFlowCode(`${propertyName} = ${snippet}`);

        nodeData.snippet = snippet;
        nodeData.propertyName = propertyName;

        return builder.format(nodeData.propertyName, type, output);
      }
    }

    return super.build(builder, output);
  }
}
