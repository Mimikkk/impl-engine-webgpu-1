export interface CreateAnimationOptions {
  animate?: (time: number) => void;
  immediate?: boolean;
  // wtf?
  nodes?: { nodeFrame: { update(): void } };
}

export const createAnimation = ({ animate, nodes, immediate = true }: CreateAnimationOptions = {}) => {
  let frameId: number = null as never;
  let ongoing = immediate;

  const animation = {
    start() {
      if (ongoing || !animation.animate || !animation.nodes) return;
      ongoing = true;

      frameId = self.requestAnimationFrame(function update(time: number) {
        frameId = self.requestAnimationFrame(update);
        animation.nodes!.nodeFrame.update();
        animation.animate!(time);
      });
    },
    stop() {
      if (!ongoing) return;
      self.cancelAnimationFrame(frameId);
      ongoing = false;
    },
    get ongoing() {
      return ongoing;
    },
    animate,
    nodes,
  };

  return animation;
};
