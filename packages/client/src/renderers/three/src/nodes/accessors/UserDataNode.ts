import { ReferenceNode } from './ReferenceNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { NodeType } from '../core/constants.js';
import { NodeFrame } from '../core/NodeFrame.js';

export class UserDataNode extends ReferenceNode {
  userData: any;

  constructor(property: string, inputType: NodeType, userData: any = null) {
    super(property, inputType, userData);

    this.userData = userData;
  }

  update(frame: NodeFrame) {
    this.object = this?.userData ?? frame.object?.userData;

    super.update(frame);
  }
}

export const userData = (name: string, inputType: NodeType, userData: any) =>
  nodeObject(new UserDataNode(name, inputType, userData));
