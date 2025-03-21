import { LineSegmentsGeometry } from './LineSegmentsGeometry.js';
import { LineMaterial } from './LineMaterial.js';
import { Vector3 } from '../math/Vector3.js';
import { Mesh } from '../objects/Mesh.js';
import { InstancedInterleavedBuffer } from '../core/InstancedInterleavedBuffer.js';
import { InterleavedBufferAttribute } from '../core/InterleavedBufferAttribute.js';

const _start = new Vector3();
const _end = new Vector3();

export class Wireframe extends Mesh {
  declare isWireframe: boolean;
  declare type: string;

  constructor(geometry = new LineSegmentsGeometry(), material = new LineMaterial({ color: Math.random() * 0xffffff })) {
    super(geometry, material);
  }

  computeLineDistances() {
    const geometry = this.geometry;

    const instanceStart = geometry.attributes.instanceStart;
    const instanceEnd = geometry.attributes.instanceEnd;
    const lineDistances = new Float32Array(2 * instanceStart.count);

    for (let i = 0, j = 0, l = instanceStart.count; i < l; i++, j += 2) {
      _start.fromBufferAttribute(instanceStart, i);
      _end.fromBufferAttribute(instanceEnd, i);

      lineDistances[j] = j === 0 ? 0 : lineDistances[j - 1];
      lineDistances[j + 1] = lineDistances[j] + _start.distanceTo(_end);
    }

    const instanceDistanceBuffer = new InstancedInterleavedBuffer(lineDistances, 2, 1); // d0, d1

    geometry.setAttribute('instanceDistanceStart', new InterleavedBufferAttribute(instanceDistanceBuffer, 1, 0) as any); // d0
    geometry.setAttribute('instanceDistanceEnd', new InterleavedBufferAttribute(instanceDistanceBuffer, 1, 1) as any); // d1

    return this;
  }
}
Wireframe.prototype.isWireframe = true;
Wireframe.prototype.type = 'Wireframe';
