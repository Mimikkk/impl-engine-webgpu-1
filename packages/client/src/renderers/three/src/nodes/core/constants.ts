export const NodeShaderStage = {
  VERTEX: 'vertex',
  FRAGMENT: 'fragment',
};

export const NodeUpdateType = {
  NONE: 'none',
  FRAME: 'frame',
  RENDER: 'render',
  OBJECT: 'object',
};

export enum NodeType {
  Void = 'void',
  Boolean = 'bool',
  Integer = 'int',
  Float = 'float',
  Vector2 = 'vec2',
  Vector3 = 'vec3',
  Vector4 = 'vec4',
  Matrix3 = 'mat3',
  Matrix4 = 'mat4',
}

export const defaultShaderStages = ['fragment', 'vertex'];
export const defaultBuildStages = ['construct', 'analyze', 'generate'];
export const shaderStages = [...defaultShaderStages, 'compute'];
export const vectorComponents = ['x', 'y', 'z', 'w'];
