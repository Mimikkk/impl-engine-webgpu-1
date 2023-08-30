import { Color } from './Color.js';
import { Path } from './Path.js';
import { Shape } from './Shape.js';
import { ShapeUtils } from './ShapeUtils.js';
import { Vector2 } from './Vector2.js';

export class ShapePath {
  type: string;
  color: Color;
  subPaths: Path[];
  currentPath: Path | null;

  constructor() {
    this.type = 'ShapePath';

    this.color = new Color(0xffffff);

    this.subPaths = [];
    this.currentPath = null;
  }

  moveTo(x: number, y: number) {
    this.currentPath = new Path();
    this.subPaths.push(this.currentPath);
    this.currentPath.moveTo(x, y);

    return this;
  }

  lineTo(x: number, y: number) {
    this.currentPath!.lineTo(x, y);

    return this;
  }

  quadraticCurveTo(aCPx: number, aCPy: number, aX: number, aY: number) {
    this.currentPath!.quadraticCurveTo(aCPx, aCPy, aX, aY);

    return this;
  }

  bezierCurveTo(aCP1x: number, aCP1y: number, aCP2x: number, aCP2y: number, aX: number, aY: number) {
    this.currentPath!.bezierCurveTo(aCP1x, aCP1y, aCP2x, aCP2y, aX, aY);

    return this;
  }

  splineThru(pts: Vector2[]) {
    this.currentPath!.splineThru(pts);

    return this;
  }

  toShapes(isCCW: boolean) {
    function toShapesNoHoles(inSubpaths: Path[]) {
      const shapes = [];

      for (let i = 0, l = inSubpaths.length; i < l; i++) {
        const tmpPath = inSubpaths[i];

        const tmpShape = new Shape();
        tmpShape.curves = tmpPath.curves;

        shapes.push(tmpShape);
      }

      return shapes;
    }

    function isPointInsidePolygon(inPt: Vector2, inPolygon: Vector2[]) {
      const polyLen = inPolygon.length;

      // inPt on polygon contour => immediate success    or
      // toggling of inside/outside at every single! intersection point of an edge
      //  with the horizontal line through inPt, left of inPt
      //  not counting lowerY endpoints of edges and whole edges on that line
      let inside = false;
      for (let p = polyLen - 1, q = 0; q < polyLen; p = q++) {
        let edgeLowPt = inPolygon[p];
        let edgeHighPt = inPolygon[q];

        let edgeDx = edgeHighPt.x - edgeLowPt.x;
        let edgeDy = edgeHighPt.y - edgeLowPt.y;

        if (Math.abs(edgeDy) > Number.EPSILON) {
          // not parallel
          if (edgeDy < 0) {
            edgeLowPt = inPolygon[q];
            edgeDx = -edgeDx;
            edgeHighPt = inPolygon[p];
            edgeDy = -edgeDy;
          }

          if (inPt.y < edgeLowPt.y || inPt.y > edgeHighPt.y) continue;

          if (inPt.y === edgeLowPt.y) {
            if (inPt.x === edgeLowPt.x) return true; // inPt is on contour ?
            // continue;				// no intersection or edgeLowPt => doesn't count !!!
          } else {
            const perpEdge = edgeDy * (inPt.x - edgeLowPt.x) - edgeDx * (inPt.y - edgeLowPt.y);
            if (perpEdge === 0) return true; // inPt is on contour ?
            if (perpEdge < 0) continue;
            inside = !inside; // true intersection left of inPt
          }
        } else {
          // parallel or collinear
          if (inPt.y !== edgeLowPt.y) continue; // parallel
          // edge lies on the same horizontal line as inPt
          if ((edgeHighPt.x <= inPt.x && inPt.x <= edgeLowPt.x) || (edgeLowPt.x <= inPt.x && inPt.x <= edgeHighPt.x))
            return true; // inPt: Point on contour !
          // continue;
        }
      }

      return inside;
    }

    const isClockWise = ShapeUtils.isClockWise;

    const subPaths = this.subPaths;
    if (subPaths.length === 0) return [];

    let solid, tmpPath, tmpShape;
    const shapes = [];

    if (subPaths.length === 1) {
      tmpPath = subPaths[0];
      tmpShape = new Shape();
      tmpShape.curves = tmpPath.curves;
      shapes.push(tmpShape);
      return shapes;
    }

    let holesFirst = !isClockWise(subPaths[0].getPoints());
    holesFirst = isCCW ? !holesFirst : holesFirst;

    // console.log("Holes first", holesFirst);

    const betterShapeHoles: { h: Path; p: Vector2 }[][] = [];
    const newShapes = [];
    let newShapeHoles: { h: Path; p: Vector2 }[][] = [];
    let mainIdx = 0;
    let tmpPoints;

    newShapes[mainIdx] = undefined;
    newShapeHoles[mainIdx] = [];

    for (let i = 0, l = subPaths.length; i < l; i++) {
      tmpPath = subPaths[i];
      tmpPoints = tmpPath.getPoints();
      solid = isClockWise(tmpPoints);
      solid = isCCW ? !solid : solid;

      if (solid) {
        if (!holesFirst && newShapes[mainIdx]) mainIdx++;

        newShapes[mainIdx] = { s: new Shape(), p: tmpPoints };
        newShapes[mainIdx]!.s.curves = tmpPath.curves;

        if (holesFirst) mainIdx++;
        newShapeHoles[mainIdx] = [];
      } else {
        newShapeHoles[mainIdx].push({ h: tmpPath, p: tmpPoints[0] });
      }
    }

    // only Holes? -> probably all Shapes with wrong orientation
    if (!newShapes[0]) return toShapesNoHoles(subPaths);

    if (newShapes.length > 1) {
      let ambiguous = false;
      let toChange = 0;

      for (let sIdx = 0, sLen = newShapes.length; sIdx < sLen; sIdx++) {
        betterShapeHoles[sIdx] = [];
      }

      for (let sIdx = 0, sLen = newShapes.length; sIdx < sLen; sIdx++) {
        const sho = newShapeHoles[sIdx];

        for (let hIdx = 0; hIdx < sho.length; hIdx++) {
          const ho = sho[hIdx];
          let hole_unassigned = true;

          for (let s2Idx = 0; s2Idx < newShapes.length; s2Idx++) {
            if (isPointInsidePolygon(ho.p, newShapes[s2Idx]!.p)) {
              if (sIdx !== s2Idx) toChange++;

              if (hole_unassigned) {
                hole_unassigned = false;
                betterShapeHoles[s2Idx].push(ho);
              } else {
                ambiguous = true;
              }
            }
          }

          if (hole_unassigned) {
            betterShapeHoles[sIdx].push(ho);
          }
        }
      }

      if (toChange > 0 && ambiguous === false) {
        newShapeHoles = betterShapeHoles;
      }
    }

    let tmpHoles;

    for (let i = 0, il = newShapes.length; i < il; i++) {
      tmpShape = newShapes[i]!.s;
      shapes.push(tmpShape);
      tmpHoles = newShapeHoles[i];

      for (let j = 0, jl = tmpHoles.length; j < jl; j++) {
        tmpShape.holes.push(tmpHoles[j].h);
      }
    }

    //console.log("shape", shapes);

    return shapes;
  }
}
