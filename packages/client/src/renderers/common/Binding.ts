export const withFlagMethods = <T extends number>(enumeration: object) => {
  const toValues = (stage: T): number[] => {
    if (stage === 0) return [];
    const flags = [];
    while (stage) {
      const bit = stage & (~stage + 1);
      flags.push(bit);
      (stage as number) ^= bit;
    }
    return flags;
  };
  const toNames = (stage: T): string[] => toValues(stage).map(value => enumeration[value as keyof typeof enumeration]);
  const toString = (stage: T) => (stage ? toNames(stage).join(' | ') : 'None');

  return { toValues, toString, toNames } as const;
};

export enum ShaderStage {
  None = 0,
  Vertex = GPUShaderStage.VERTEX,
  Compute = GPUShaderStage.COMPUTE,
  Fragment = GPUShaderStage.FRAGMENT,
}

export namespace ShaderStage {
  export const { toNames, toValues, toString } = withFlagMethods<ShaderStage>(ShaderStage);
}

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
