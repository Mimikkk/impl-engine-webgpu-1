import { Earcut } from './Earcut.js';
import { Vector2 } from '../math/Vector2.js';

export class ShapeUtils {
  // calculate area of the contour polygon
  static area(contour: Vector2[]) {
    const n = contour.length;
    let a = 0.0;

    for (let p = n - 1, q = 0; q < n; p = q++) {
      a += contour[p].x * contour[q].y - contour[q].x * contour[p].y;
    }

    return a * 0.5;
  }

  static isClockWise(pts: Vector2[]) {
    return ShapeUtils.area(pts) < 0;
  }

  static triangulateShape(contour: Vector2[], holes: Vector2[][]) {
    const vertices: number[] = []; // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
    const holeIndices: number[] = []; // array of hole indices
    const faces: [number, number, number][] = []; // final array of vertex indices like [ [ a,b,d ], [ b,c,d ] ]

    removeDupEndPts(contour);
    addContour(vertices, contour);

    let holeIndex = contour.length;

    holes.forEach(removeDupEndPts);

    for (let i = 0; i < holes.length; i++) {
      holeIndices.push(holeIndex);
      holeIndex += holes[i].length;
      addContour(vertices, holes[i]);
    }

    const triangles = Earcut.triangulate(vertices, holeIndices);

    for (let i = 0; i < triangles.length; i += 3) {
      faces.push(triangles.slice(i, i + 3) as [number, number, number]);
    }

    return faces;
  }
}

function removeDupEndPts(points: Vector2[]) {
  const l = points.length;

  if (l > 2 && points[l - 1].equals(points[0])) {
    points.pop();
  }
}

function addContour(vertices: number[], contour: Vector2[]) {
  for (let i = 0; i < contour.length; i++) {
    vertices.push(contour[i].x);
    vertices.push(contour[i].y);
  }
}
