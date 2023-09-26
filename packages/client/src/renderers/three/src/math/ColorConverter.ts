import { MathUtils } from 'three';
import { Color, Hsl, Hsv } from './Color.js';

const _hsl = <Hsl>{};

export namespace ColorConverter {
  export const setHSV = (color: Color, h: number, s: number, v: number) => {
    h = MathUtils.euclideanModulo(h, 1);
    s = MathUtils.clamp(s, 0, 1);
    v = MathUtils.clamp(v, 0, 1);

    return color.setHSL(h, (s * v) / ((h = (2 - s) * v) < 1 ? h : 2 - h), h * 0.5);
  };

  export const getHSV = (color: Color, target: Hsv) => {
    color.getHSL(_hsl);

    _hsl.s *= _hsl.l < 0.5 ? _hsl.l : 1 - _hsl.l;

    target.h = _hsl.h;
    target.s = (2 * _hsl.s) / (_hsl.l + _hsl.s);
    target.v = _hsl.l + _hsl.s;

    return target;
  };
}
