import UniformNode from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeImmutable, nodeObject } from '../shadernode/ShaderNode.js';

class TimerNode extends UniformNode {
  constructor(scope = TimerNode.LOCAL, scale = 1, value = 0) {
    super(value);

    this.scope = scope;
    this.scale = scale;

    this.updateType = NodeUpdateType.Frame;
  }

  /*
  @TODO:
  getNodeType( builder ) {

    const scope = this.scope;

    if ( scope === TimerNode.FRAME ) {

      return 'uint';

    }

    return 'float';

  }
*/
  update(frame) {
    const scope = this.scope;
    const scale = this.scale;

    if (scope === TimerNode.LOCAL) {
      this.value += frame.deltaTime * scale;
    } else if (scope === TimerNode.DELTA) {
      this.value = frame.deltaTime * scale;
    } else if (scope === TimerNode.FRAME) {
      this.value = frame.frameId;
    } else {
      // global

      this.value = frame.time * scale;
    }
  }
}

TimerNode.LOCAL = 'local';
TimerNode.GLOBAL = 'global';
TimerNode.DELTA = 'delta';
TimerNode.FRAME = 'frame';

export default TimerNode;

// @TODO: add support to use node in timeScale
export const timerLocal = (timeScale, value = 0) => nodeObject(new TimerNode(TimerNode.LOCAL, timeScale, value));
export const timerGlobal = (timeScale, value = 0) => nodeObject(new TimerNode(TimerNode.GLOBAL, timeScale, value));
export const timerDelta = (timeScale, value = 0) => nodeObject(new TimerNode(TimerNode.DELTA, timeScale, value));
export const frameId = nodeImmutable(TimerNode, TimerNode.FRAME);
