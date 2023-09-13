export const CullFaceNone = 0;
export const CullFaceBack = 1;
export const CullFaceFront = 2;
export const CullFaceFrontBack = 3;
export const BasicShadowMap = 0;
export const PCFShadowMap = 1;
export const PCFSoftShadowMap = 2;
export const VSMShadowMap = 3;
export const FrontSide = 0;
export const BackSide = 1;
export const DoubleSide = 2;
export const TwoPassDoubleSide = 2; // r149
export const NoBlending = 0;
export const NormalBlending = 1;
export const AdditiveBlending = 2;
export const SubtractiveBlending = 3;
export const MultiplyBlending = 4;
export const CustomBlending = 5;
export const AddEquation = 100;
export const SubtractEquation = 101;
export const ReverseSubtractEquation = 102;
export const MinEquation = 103;
export const MaxEquation = 104;
export const ZeroFactor = 200;
export const OneFactor = 201;
export const SrcColorFactor = 202;
export const OneMinusSrcColorFactor = 203;
export const SrcAlphaFactor = 204;
export const OneMinusSrcAlphaFactor = 205;
export const DstAlphaFactor = 206;
export const OneMinusDstAlphaFactor = 207;
export const DstColorFactor = 208;
export const OneMinusDstColorFactor = 209;
export const SrcAlphaSaturateFactor = 210;
export const NeverDepth = 0;
export const AlwaysDepth = 1;
export const LessDepth = 2;
export const LessEqualDepth = 3;
export const EqualDepth = 4;
export const GreaterEqualDepth = 5;
export const GreaterDepth = 6;
export const NotEqualDepth = 7;
export const MultiplyOperation = 0;
export const MixOperation = 1;
export const AddOperation = 2;
export const NoToneMapping = 0;
export const LinearToneMapping = 1;
export const ReinhardToneMapping = 2;
export const CineonToneMapping = 3;
export const ACESFilmicToneMapping = 4;
export const CustomToneMapping = 5;

export const UVMapping = 300;
export const CubeReflectionMapping = 301;
export const CubeRefractionMapping = 302;
export const EquirectangularReflectionMapping = 303;
export const EquirectangularRefractionMapping = 304;
export const CubeUVReflectionMapping = 306;
export const RepeatWrapping = 1000;
export const ClampToEdgeWrapping = 1001;
export const MirroredRepeatWrapping = 1002;
export const NearestFilter = 1003;
export const NearestMipmapNearestFilter = 1004;
export const NearestMipMapNearestFilter = 1004;
export const NearestMipmapLinearFilter = 1005;
export const NearestMipMapLinearFilter = 1005;
export const LinearFilter = 1006;
export const LinearMipmapNearestFilter = 1007;
export const LinearMipMapNearestFilter = 1007;
export const LinearMipmapLinearFilter = 1008;
export const LinearMipMapLinearFilter = 1008;
export const UnsignedByteType = 1009;
export const ByteType = 1010;
export const ShortType = 1011;
export const UnsignedShortType = 1012;
export const IntType = 1013;
export const UnsignedIntType = 1014;
export const FloatType = 1015;
export const HalfFloatType = 1016;
export const UnsignedShort4444Type = 1017;
export const UnsignedShort5551Type = 1018;
export const UnsignedInt248Type = 1020;
export const AlphaFormat = 1021;
export const RGBAFormat = 1023;
export const LuminanceFormat = 1024;
export const LuminanceAlphaFormat = 1025;
export const DepthFormat = 1026;
export const DepthStencilFormat = 1027;
export const RedFormat = 1028;
export const RedIntegerFormat = 1029;
export const RGFormat = 1030;
export const RGIntegerFormat = 1031;
export const RGBAIntegerFormat = 1033;

export const RGB_S3TC_DXT1_Format = 33776;
export const RGBA_S3TC_DXT1_Format = 33777;
export const RGBA_S3TC_DXT3_Format = 33778;
export const RGBA_S3TC_DXT5_Format = 33779;
export const RGB_PVRTC_4BPPV1_Format = 35840;
export const RGB_PVRTC_2BPPV1_Format = 35841;
export const RGBA_PVRTC_4BPPV1_Format = 35842;
export const RGBA_PVRTC_2BPPV1_Format = 35843;
export const RGB_ETC1_Format = 36196;
export const RGB_ETC2_Format = 37492;
export const RGBA_ETC2_EAC_Format = 37496;
export const RGBA_ASTC_4x4_Format = 37808;
export const RGBA_ASTC_5x4_Format = 37809;
export const RGBA_ASTC_5x5_Format = 37810;
export const RGBA_ASTC_6x5_Format = 37811;
export const RGBA_ASTC_6x6_Format = 37812;
export const RGBA_ASTC_8x5_Format = 37813;
export const RGBA_ASTC_8x6_Format = 37814;
export const RGBA_ASTC_8x8_Format = 37815;
export const RGBA_ASTC_10x5_Format = 37816;
export const RGBA_ASTC_10x6_Format = 37817;
export const RGBA_ASTC_10x8_Format = 37818;
export const RGBA_ASTC_10x10_Format = 37819;
export const RGBA_ASTC_12x10_Format = 37820;
export const RGBA_ASTC_12x12_Format = 37821;
export const RGBA_BPTC_Format = 36492;
export const RED_RGTC1_Format = 36283;
export const SIGNED_RED_RGTC1_Format = 36284;
export const RED_GREEN_RGTC2_Format = 36285;
export const SIGNED_RED_GREEN_RGTC2_Format = 36286;
export const LoopOnce = 2200;
export const LoopRepeat = 2201;
export const LoopPingPong = 2202;
export const InterpolateDiscrete = 2300;
export const InterpolateLinear = 2301;
export const InterpolateSmooth = 2302;
export const ZeroCurvatureEnding = 2400;
export const ZeroSlopeEnding = 2401;
export const WrapAroundEnding = 2402;
export const NormalAnimationBlendMode = 2500;
export const AdditiveAnimationBlendMode = 2501;
export const TrianglesDrawMode = 0;
export const TriangleStripDrawMode = 1;
export const TriangleFanDrawMode = 2;
/** @deprecated Use LinearSRGBColorSpace or NoColorSpace in three.js r152+. */
export const LinearEncoding = 3000;
/** @deprecated Use SRGBColorSpace in three.js r152+. */
export const sRGBEncoding = 3001;
export const BasicDepthPacking = 3200;
export const RGBADepthPacking = 3201;
export const TangentSpaceNormalMap = 0;
export const ObjectSpaceNormalMap = 1;

// Color space string identifiers, matching CSS Color Module Level 4 and WebGPU names where available.
export const NoColorSpace = '';
export const SRGBColorSpace = 'srgb';
export const LinearSRGBColorSpace = 'srgb-linear';
export const DisplayP3ColorSpace = 'display-p3';

export const ZeroStencilOp = 0;
export const KeepStencilOp = 7680;
export const ReplaceStencilOp = 7681;
export const IncrementStencilOp = 7682;
export const DecrementStencilOp = 7683;
export const IncrementWrapStencilOp = 34055;
export const DecrementWrapStencilOp = 34056;
export const InvertStencilOp = 5386;

export const NeverStencilFunc = 512;
export const LessStencilFunc = 513;
export const EqualStencilFunc = 514;
export const LessEqualStencilFunc = 515;
export const GreaterStencilFunc = 516;
export const NotEqualStencilFunc = 517;
export const GreaterEqualStencilFunc = 518;
export const AlwaysStencilFunc = 519;

export const NeverCompare = 512;
export const LessCompare = 513;
export const EqualCompare = 514;
export const LessEqualCompare = 515;
export const GreaterCompare = 516;
export const NotEqualCompare = 517;
export const GreaterEqualCompare = 518;
export const AlwaysCompare = 519;

export const StaticDrawUsage = 35044;
export const DynamicDrawUsage = 35048;
export const StreamDrawUsage = 35040;
export const StaticReadUsage = 35045;
export const DynamicReadUsage = 35049;
export const StreamReadUsage = 35041;
export const StaticCopyUsage = 35046;
export const DynamicCopyUsage = 35050;
export const StreamCopyUsage = 35042;

export const GLSL1 = '100';
export const GLSL3 = '300 es';

export const _SRGBAFormat = 1035; // fallback for WebGL 1

export const WebGLCoordinateSystem = 2000;
export const WebGPUCoordinateSystem = 2001;

export enum MOUSE {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2,
  ROTATE = 0,
  DOLLY = 1,
  PAN = 2,
}

export enum TOUCH {
  ROTATE = 0,
  PAN = 1,
  DOLLY_PAN = 2,
  DOLLY_ROTATE = 3,
}

export type CullFace = typeof CullFaceNone | typeof CullFaceBack | typeof CullFaceFront | typeof CullFaceFrontBack;

export type ShadowMapType = typeof BasicShadowMap | typeof PCFShadowMap | typeof PCFSoftShadowMap | typeof VSMShadowMap;

export type Side = typeof FrontSide | typeof BackSide | typeof DoubleSide | typeof TwoPassDoubleSide;

export type Blending =
  | typeof NoBlending
  | typeof NormalBlending
  | typeof AdditiveBlending
  | typeof SubtractiveBlending
  | typeof MultiplyBlending
  | typeof CustomBlending;

export type BlendingEquation =
  | typeof AddEquation
  | typeof SubtractEquation
  | typeof ReverseSubtractEquation
  | typeof MinEquation
  | typeof MaxEquation;

export type BlendingDstFactor =
  | typeof ZeroFactor
  | typeof OneFactor
  | typeof SrcColorFactor
  | typeof OneMinusSrcColorFactor
  | typeof SrcAlphaFactor
  | typeof OneMinusSrcAlphaFactor
  | typeof DstAlphaFactor
  | typeof OneMinusDstAlphaFactor
  | typeof DstColorFactor
  | typeof OneMinusDstColorFactor;

export type BlendingSrcFactor = typeof SrcAlphaSaturateFactor;

export type DepthModes =
  | typeof NeverDepth
  | typeof AlwaysDepth
  | typeof LessDepth
  | typeof LessEqualDepth
  | typeof EqualDepth
  | typeof GreaterEqualDepth
  | typeof GreaterDepth
  | typeof NotEqualDepth;

export type Combine = typeof MultiplyOperation | typeof MixOperation | typeof AddOperation;

export type ToneMapping =
  | typeof NoToneMapping
  | typeof LinearToneMapping
  | typeof ReinhardToneMapping
  | typeof CineonToneMapping
  | typeof ACESFilmicToneMapping
  | typeof CustomToneMapping;

export type Mapping =
  | typeof UVMapping
  | typeof EquirectangularReflectionMapping
  | typeof EquirectangularRefractionMapping;

export type CubeTextureMapping =
  | typeof CubeReflectionMapping
  | typeof CubeRefractionMapping
  | typeof CubeUVReflectionMapping;

export type AnyMapping = Mapping | CubeTextureMapping;
export type Wrapping = typeof RepeatWrapping | typeof ClampToEdgeWrapping | typeof MirroredRepeatWrapping;
export type MagnificationTextureFilter = typeof NearestFilter | typeof LinearFilter;
export type MinificationTextureFilter =
  | typeof NearestFilter
  | typeof NearestMipmapNearestFilter
  | typeof NearestMipMapNearestFilter
  | typeof NearestMipmapLinearFilter
  | typeof NearestMipMapLinearFilter
  | typeof LinearFilter
  | typeof LinearMipmapNearestFilter
  | typeof LinearMipMapNearestFilter
  | typeof LinearMipmapLinearFilter
  | typeof LinearMipMapLinearFilter;

export type TextureFilter = MagnificationTextureFilter | MinificationTextureFilter;
export type AttributeGPUType = typeof FloatType | typeof IntType;

export type TextureDataType =
  | typeof UnsignedByteType
  | typeof ByteType
  | typeof ShortType
  | typeof UnsignedShortType
  | typeof IntType
  | typeof UnsignedIntType
  | typeof FloatType
  | typeof HalfFloatType
  | typeof UnsignedShort4444Type
  | typeof UnsignedShort5551Type
  | typeof UnsignedInt248Type;

export type WebGL1PixelFormat =
  | typeof AlphaFormat
  | typeof LuminanceFormat
  | typeof LuminanceAlphaFormat
  | typeof DepthFormat
  | typeof DepthStencilFormat
  | typeof RedFormat
  | typeof RedIntegerFormat
  | typeof RGFormat
  | typeof _SRGBAFormat;

export type WebGL2PixelFormat =
  | typeof AlphaFormat
  | typeof RGBAFormat
  | typeof LuminanceFormat
  | typeof LuminanceAlphaFormat
  | typeof DepthFormat
  | typeof DepthStencilFormat
  | typeof RedFormat
  | typeof RedIntegerFormat
  | typeof RGFormat
  | typeof RGIntegerFormat
  | typeof RGBAIntegerFormat
  | typeof _SRGBAFormat;

export type PixelFormat = WebGL1PixelFormat | WebGL2PixelFormat;

export type DeepTexturePixelFormat = typeof DepthFormat | typeof DepthStencilFormat;

export type CompressedPixelFormat =
  | typeof RGB_S3TC_DXT1_Format
  | typeof RGBA_S3TC_DXT1_Format
  | typeof RGBA_S3TC_DXT3_Format
  | typeof RGBA_S3TC_DXT5_Format
  | typeof RGB_PVRTC_4BPPV1_Format
  | typeof RGB_PVRTC_2BPPV1_Format
  | typeof RGBA_PVRTC_4BPPV1_Format
  | typeof RGBA_PVRTC_2BPPV1_Format
  | typeof RGB_ETC1_Format
  | typeof RGB_ETC2_Format
  | typeof RGBA_ETC2_EAC_Format
  | typeof RGBA_ASTC_4x4_Format
  | typeof RGBA_ASTC_5x4_Format
  | typeof RGBA_ASTC_5x5_Format
  | typeof RGBA_ASTC_6x5_Format
  | typeof RGBA_ASTC_6x6_Format
  | typeof RGBA_ASTC_8x5_Format
  | typeof RGBA_ASTC_8x6_Format
  | typeof RGBA_ASTC_8x8_Format
  | typeof RGBA_ASTC_10x5_Format
  | typeof RGBA_ASTC_10x6_Format
  | typeof RGBA_ASTC_10x8_Format
  | typeof RGBA_ASTC_10x10_Format
  | typeof RGBA_ASTC_12x10_Format
  | typeof RGBA_ASTC_12x12_Format
  | typeof RGBA_BPTC_Format
  | typeof RED_RGTC1_Format
  | typeof SIGNED_RED_RGTC1_Format
  | typeof RED_GREEN_RGTC2_Format
  | typeof SIGNED_RED_GREEN_RGTC2_Format;

export type AnyPixelFormat = PixelFormat | DeepTexturePixelFormat | CompressedPixelFormat;
export type AnimationActionLoopStyle = typeof LoopOnce | typeof LoopRepeat | typeof LoopPingPong;
export type InterpolationModes = typeof InterpolateDiscrete | typeof InterpolateLinear | typeof InterpolateSmooth;
export type InterpolationEndingModes = typeof ZeroCurvatureEnding | typeof ZeroSlopeEnding | typeof WrapAroundEnding;
export type AnimationBlendMode = typeof NormalAnimationBlendMode | typeof AdditiveAnimationBlendMode;
export type TrianglesDrawModes = typeof TrianglesDrawMode | typeof TriangleStripDrawMode | typeof TriangleFanDrawMode;
export type TextureEncoding = typeof LinearEncoding | typeof sRGBEncoding;
export type DepthPackingStrategies = typeof BasicDepthPacking | typeof RGBADepthPacking;
export type NormalMapTypes = typeof TangentSpaceNormalMap | typeof ObjectSpaceNormalMap;
export type ColorSpace =
  | typeof NoColorSpace
  | typeof SRGBColorSpace
  | typeof LinearSRGBColorSpace
  | typeof DisplayP3ColorSpace;
export type StencilOp =
  | typeof ZeroStencilOp
  | typeof KeepStencilOp
  | typeof ReplaceStencilOp
  | typeof IncrementStencilOp
  | typeof DecrementStencilOp
  | typeof IncrementWrapStencilOp
  | typeof DecrementWrapStencilOp
  | typeof InvertStencilOp;
export type StencilFunc =
  | typeof NeverStencilFunc
  | typeof LessStencilFunc
  | typeof EqualStencilFunc
  | typeof LessEqualStencilFunc
  | typeof GreaterStencilFunc
  | typeof NotEqualStencilFunc
  | typeof GreaterEqualStencilFunc
  | typeof AlwaysStencilFunc;
export type TextureComparisonFunction =
  | typeof NeverCompare
  | typeof LessCompare
  | typeof EqualCompare
  | typeof LessEqualCompare
  | typeof GreaterCompare
  | typeof NotEqualCompare
  | typeof GreaterEqualCompare
  | typeof AlwaysCompare;
export type Usage =
  | typeof StaticDrawUsage
  | typeof DynamicDrawUsage
  | typeof StreamDrawUsage
  | typeof StaticReadUsage
  | typeof DynamicReadUsage
  | typeof StreamReadUsage
  | typeof StaticCopyUsage
  | typeof DynamicCopyUsage
  | typeof StreamCopyUsage;
export type GLSLVersion = typeof GLSL1 | typeof GLSL3;
export type CoordinateSystem = typeof WebGLCoordinateSystem | typeof WebGPUCoordinateSystem;
export type PixelFormatGPU =
  | 'ALPHA'
  | 'RGB'
  | 'RGBA'
  | 'LUMINANCE'
  | 'LUMINANCE_ALPHA'
  | 'RED_INTEGER'
  | 'R8'
  | 'R8_SNORM'
  | 'R8I'
  | 'R8UI'
  | 'R16I'
  | 'R16UI'
  | 'R16F'
  | 'R32I'
  | 'R32UI'
  | 'R32F'
  | 'RG8'
  | 'RG8_SNORM'
  | 'RG8I'
  | 'RG8UI'
  | 'RG16I'
  | 'RG16UI'
  | 'RG16F'
  | 'RG32I'
  | 'RG32UI'
  | 'RG32F'
  | 'RGB565'
  | 'RGB8'
  | 'RGB8_SNORM'
  | 'RGB8I'
  | 'RGB8UI'
  | 'RGB16I'
  | 'RGB16UI'
  | 'RGB16F'
  | 'RGB32I'
  | 'RGB32UI'
  | 'RGB32F'
  | 'RGB9_E5'
  | 'SRGB8'
  | 'R11F_G11F_B10F'
  | 'RGBA4'
  | 'RGBA8'
  | 'RGBA8_SNORM'
  | 'RGBA8I'
  | 'RGBA8UI'
  | 'RGBA16I'
  | 'RGBA16UI'
  | 'RGBA16F'
  | 'RGBA32I'
  | 'RGBA32UI'
  | 'RGBA32F'
  | 'RGB5_A1'
  | 'RGB10_A2'
  | 'RGB10_A2UI'
  | 'SRGB8_ALPHA8'
  | 'SRGB8'
  | 'DEPTH_COMPONENT16'
  | 'DEPTH_COMPONENT24'
  | 'DEPTH_COMPONENT32F'
  | 'DEPTH24_STENCIL8'
  | 'DEPTH32F_STENCIL8';
