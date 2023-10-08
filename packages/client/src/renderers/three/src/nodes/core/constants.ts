export enum NodeShaderStage {
  Vertex = 'vertex',
  Fragment = 'fragment',
  Compute = 'compute',
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
  UnsignedVector2 = 'uvec2',
  UnsignedVector3 = 'uvec3',
  UnsignedVector4 = 'uvec4',
  UnsignedInteger = 'uint',
  UnsignedMatrix3 = 'umat3',
  UnsignedMatrix4 = 'umat4',

  Texture = 'texture',
  Color = 'color',
  Code = 'code',
  Property = 'property',

  String = 'string',
  ArrayBuffer = 'ArrayBuffer',
  Shader = 'shader',
  Node = 'node',
}

export enum NodeLanguage {
  Js = 'javascript',
  Glsl = 'glsl',
  Wgsl = 'wgsl',
}

export const defaultBuildStages = ['construct', 'analyze', 'generate'];
export const shaderStages = ['fragment', 'vertex', 'compute'];
export const vectorComponents = ['x', 'y', 'z', 'w'];
