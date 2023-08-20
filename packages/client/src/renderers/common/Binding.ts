import { ShaderStage } from './ShaderStage.js';

export interface BindingState {
  state: {
    name: string;
    visibility: ShaderStage;
  };
  actions: {
    visibility: {
      set: (visibility: ShaderStage) => ShaderStage;
      update: (visibility: ShaderStage) => ShaderStage;
      toggle: (visibility: ShaderStage) => ShaderStage;
      is: (visibility: ShaderStage) => boolean;
      remove: (visibility: ShaderStage) => number;
    };
  };
}

export const createBinding = (name: string): BindingState => {
  const self: BindingState = {
    state: { visibility: ShaderStage.None, name },
    actions: {
      visibility: {
        toggle: visibility => (self.state.visibility ^= visibility),
        update: visibility => (self.state.visibility |= visibility),
        remove: visibility => (self.state.visibility &= ~visibility),
        set: visibility => (self.state.visibility = visibility),
        is: visibility => !!(self.state.visibility & visibility),
      },
    },
  };

  return self;
};
