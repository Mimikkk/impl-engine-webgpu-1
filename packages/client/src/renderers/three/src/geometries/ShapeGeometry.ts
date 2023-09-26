import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { Shape } from '../extras/core/Shape.js';
import { ShapeUtils } from '../extras/ShapeUtils.js';
import { Vector2 } from '../math/Vector2.js';

export class ShapeGeometry extends BufferGeometry {
  constructor(
    shapes: Shape | Shape[] = new Shape([new Vector2(0, 0.5), new Vector2(-0.5, -0.5), new Vector2(0.5, -0.5)]),
    curveSegments = 12,
  ) {
    super();

    this.type = 'ShapeGeometry';

    this.parameters = {
      shapes: shapes,
      curveSegments: curveSegments,
    };

    // buffers

    const indices: number[] = [];
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    // helper variables

    let groupStart = 0;
    let groupCount = 0;

    // allow single and array values for "shapes" parameter

    if (!Array.isArray(shapes)) {
      addShape(shapes);
    } else {
      for (let i = 0; i < shapes.length; i++) {
        addShape(shapes[i]);
        // enables MultiMaterial support
        this.addGroup(groupStart, groupCount, i);

        groupStart += groupCount;
        groupCount = 0;
      }
    }

    // build geometry

    this.setIndex(indices);
    this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

    // helper functions

    function addShape(shape: Shape) {
      const indexOffset = vertices.length / 3;
      const points = shape.extractPoints(curveSegments);

      let shapeVertices = points.shape;
      const shapeHoles = points.holes;

      // check direction of vertices

      if (ShapeUtils.isClockWise(shapeVertices) === false) {
        shapeVertices = shapeVertices.reverse();
      }

      for (let i = 0, l = shapeHoles.length; i < l; i++) {
        const shapeHole = shapeHoles[i];

        if (ShapeUtils.isClockWise(shapeHole) === true) {
          shapeHoles[i] = shapeHole.reverse();
        }
      }

      const faces = ShapeUtils.triangulateShape(shapeVertices, shapeHoles);

      // join vertices of inner and outer paths to a single array

      for (let i = 0, l = shapeHoles.length; i < l; i++) {
        const shapeHole = shapeHoles[i];
        shapeVertices = shapeVertices.concat(shapeHole);
      }

      // vertices, normals, uvs

      for (let i = 0, l = shapeVertices.length; i < l; i++) {
        const vertex = shapeVertices[i];

        vertices.push(vertex.x, vertex.y, 0);
        normals.push(0, 0, 1);
        uvs.push(vertex.x, vertex.y); // world uvs
      }

      // indices

      for (let i = 0, l = faces.length; i < l; i++) {
        const face = faces[i];

        const a = face[0] + indexOffset;
        const b = face[1] + indexOffset;
        const c = face[2] + indexOffset;

        indices.push(a, b, c);
        groupCount += 3;
      }
    }
  }

  copy(source: ShapeGeometry) {
    super.copy(source);

    this.parameters = Object.assign({}, source.parameters);

    return this;
  }
}
