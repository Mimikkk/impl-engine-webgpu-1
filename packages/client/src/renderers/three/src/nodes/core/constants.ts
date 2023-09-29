export enum NodeShaderStage {
  Vertex = 'vertex',
  Fragment = 'fragment',
}

export enum NodeUpdateType {
  None = 'none',
  Frame = 'frame',
  Render = 'render',
  Object = 'object',
}

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

export const defaultBuildStages = ['construct', 'analyze', 'generate'];
export const shaderStages = ['fragment', 'vertex', 'compute'];
export const vectorComponents = ['x', 'y', 'z', 'w'];
