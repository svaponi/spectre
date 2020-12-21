import {Font, FontLoader} from 'three';
import gentilis_regular from './gentilis_regular.json';
import arcade_regular from './arcade_regular.json';

export class FontUtils {
    private static fontLoader = new FontLoader();
    static GENTILIS_REGULAR: Font = FontUtils.fontLoader.parse(gentilis_regular);
    static ARCADE_REGULAR: Font = FontUtils.fontLoader.parse(arcade_regular);
}
