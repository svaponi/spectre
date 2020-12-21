import {Color} from 'three/src/math/Color';
import {Material, MeshBasicMaterial} from 'three';
import {Utils} from './utils';

export class ColorUtils {

    static shadeColor(color: Color | string | number, percent: number): number {
        const f = ColorUtils.toIntColor(color);
        const t = percent < 0 ? 0 : 255;
        const p = percent < 0 ? percent * -1 : percent;
        const R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
        return (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B));
    }

    static blendColors(color1: Color | string | number, color2: Color | string | number, perc: number): number {
        const f = ColorUtils.toIntColor(color1);
        const t = ColorUtils.toIntColor(color2);
        const R1 = f >> 16, G1 = f >> 8 & 0x00FF, B1 = f & 0x0000FF, R2 = t >> 16, G2 = t >> 8 & 0x00FF, B2 = t & 0x0000FF;
        return (0x1000000 + (Math.round((R2 - R1) * perc) + R1) * 0x10000 + (Math.round((G2 - G1) * perc) + G1) * 0x100 + (Math.round((B2 - B1) * perc) + B1));
    }

    static lightenDarkenColor(color: Color | string | number, amt: number): number {
        const num = ColorUtils.toIntColor(color);
        const r = (num >> 16) + amt;
        const b = ((num >> 8) & 0x00FF) + amt;
        const g = (num & 0x0000FF) + amt;
        const newColor = g | (b << 8) | (r << 16);
        return newColor;
    }

    static toIntColor(color: Color | string | number): number {
        if (typeof color === 'string') {
            let c = color;
            if (c.startsWith('#')) {
                c = color.slice(1);
            }
            return parseInt(c, 16);
        } else if (typeof color === 'number') {
            return color;
        } else if (color instanceof Color) {
            return color.getHex();
        } else {
            return 0x000000;
        }
    }

    static setColor(obj: any, color: Color | string | number, recursive = false) {
        if (recursive)
            Utils.recursiveConsumer(obj, (o) => ColorUtils._setColor(o, color));
        else
            ColorUtils._setColor(obj, color)
    }

    private static _setColor(obj: any, color: Color | string | number) {
        if (obj.material && obj.material instanceof Material) {
            ColorUtils.setMaterialColor(obj.material, color);
        }
    }

    static setMaterialColor(material: Material | Material[], color: Color | string | number) {
        Utils.toMaterialArray(material)
            .forEach(mat => ColorUtils._setMaterialColor(mat, color));
    }

    private static _setMaterialColor(material: Material, color: Color | string | number) {
        if (material instanceof MeshBasicMaterial) {
            material.color.set(color);
        }
    }
}

