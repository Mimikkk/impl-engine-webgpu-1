import { BufferGeometry } from '../BufferGeometry.js';
import { Float32BufferAttribute } from '../BufferAttribute.js';
import { Vector3 } from '../Vector3.js';
import { Vector2 } from '../Vector2.js';

export class CylinderGeometry extends BufferGeometry {
  constructor(
    radiusTop: number = 1,
    radiusBottom: number = 1,
    height: number = 1,
    radialSegments: number = 32,
    heightSegments: number = 1,
    openEnded: boolean = false,
    thetaStart: number = 0,
    thetaLength: number = Math.PI * 2,
  ) {
    super();

    this.type = 'CylinderGeometry';

    this.parameters = {
      radiusTop: radiusTop,
      radiusBottom: radiusBottom,
      height: height,
      radialSegments: radialSegments,
      heightSegments: heightSegments,
      openEnded: openEnded,
      thetaStart: thetaStart,
      thetaLength: thetaLength,
    };

    const scope = this;

    radialSegments = Math.floor(radialSegments);
    heightSegments = Math.floor(heightSegments);

    // buffers

    const indices: number[] = [];
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    // helper variables

    let index = 0;
    const indexArray: number[][] = [];
    const halfHeight = height / 2;
    let groupStart = 0;

    // generate geometry

    generateTorso();

    if (openEnded === false) {
      if (radiusTop > 0) generateCap(true);
      if (radiusBottom > 0) generateCap(false);
    }

    // build geometry

    this.setIndex(indices);
    this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

    function generateTorso() {
      const normal = new Vector3();
      const vertex = new Vector3();

      let groupCount = 0;

      // this will be used to calculate the normal
      const slope = (radiusBottom - radiusTop) / height;

      // generate vertices, normals and uvs

      for (let y = 0; y <= heightSegments; y++) {
        const indexRow: number[] = [];

        const v = y / heightSegments;

        // calculate the radius of the current row

        const radius = v * (radiusBottom - radiusTop) + radiusTop;

        for (let x = 0; x <= radialSegments; x++) {
          const u = x / radialSegments;

          const theta = u * thetaLength + thetaStart;

          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);

          // vertex

          vertex.x = radius * sinTheta;
          vertex.y = -v * height + halfHeight;
          vertex.z = radius * cosTheta;
          vertices.push(vertex.x, vertex.y, vertex.z);

          // normal

          normal.set(sinTheta, slope, cosTheta).normalize();
          normals.push(normal.x, normal.y, normal.z);

          // uv

          uvs.push(u, 1 - v);

          // save index of vertex in respective row

          indexRow.push(index++);
        }

        // now save vertices of the row in our index array

        indexArray.push(indexRow);
      }

      // generate indices

      for (let x = 0; x < radialSegments; x++) {
        for (let y = 0; y < heightSegments; y++) {
          // we use the index array to access the correct indices

          const a = indexArray[y][x];
          const b = indexArray[y + 1][x];
          const c = indexArray[y + 1][x + 1];
          const d = indexArray[y][x + 1];

          // faces

          indices.push(a, b, d);
          indices.push(b, c, d);

          // update group counter

          groupCount += 6;
        }
      }

      // add a group to the geometry. this will ensure multi material support

      scope.addGroup(groupStart, groupCount, 0);

      // calculate new start value for groups

      groupStart += groupCount;
    }

    function generateCap(top: boolean) {
      // save the index of the first center vertex
      const centerIndexStart = index;

      const uv = new Vector2();
      const vertex = new Vector3();

      let groupCount = 0;

      const radius = top === true ? radiusTop : radiusBottom;
      const sign = top === true ? 1 : -1;

      // first we generate the center vertex data of the cap.
      // because the geometry needs one set of uvs per face,
      // we must generate a center vertex per face/segment

      for (let x = 1; x <= radialSegments; x++) {
        // vertex

        vertices.push(0, halfHeight * sign, 0);

        // normal

        normals.push(0, sign, 0);

        // uv

        uvs.push(0.5, 0.5);

        // increase index

        index++;
      }

      // save the index of the last center vertex
      const centerIndexEnd = index;

      // now we generate the surrounding vertices, normals and uvs

      for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;
        const theta = u * thetaLength + thetaStart;

        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        // vertex

        vertex.x = radius * sinTheta;
        vertex.y = halfHeight * sign;
        vertex.z = radius * cosTheta;
        vertices.push(vertex.x, vertex.y, vertex.z);

        // normal

        normals.push(0, sign, 0);

        // uv

        uv.x = cosTheta * 0.5 + 0.5;
        uv.y = sinTheta * 0.5 * sign + 0.5;
        uvs.push(uv.x, uv.y);

        // increase index

        index++;
      }

      // generate indices

      for (let x = 0; x < radialSegments; x++) {
        const c = centerIndexStart + x;
        const i = centerIndexEnd + x;

        if (top === true) {
          // face top

          indices.push(i, i + 1, c);
        } else {
          // face bottom

          indices.push(i + 1, i, c);
        }

        groupCount += 3;
      }

      // add a group to the geometry. this will ensure multi material support

      scope.addGroup(groupStart, groupCount, top === true ? 1 : 2);

      // calculate new start value for groups

      groupStart += groupCount;
    }
  }

  copy(source: CylinderGeometry) {
    super.copy(source);

    this.parameters = Object.assign({}, source.parameters);

    return this;
  }
}
