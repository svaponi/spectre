import * as THREE from 'three';
import {Color} from 'three/src/math/Color';
import {ColorUtils} from '../utils/colorUtils';
import {FontUtils} from '../fonts/FontUtils';

export class Wall extends THREE.Object3D {

    text: THREE.Mesh;
    plane: THREE.Mesh;
    color: Color | string | number;

    constructor(width: number, height: number, color: Color | string | number, name: string = 'wall') {

        super();

        this.name = name;
        this.color = color;
        this.plane = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, 0.05, 1, 1, 1),
            new THREE.MeshBasicMaterial({color})
        );
        this.add(this.plane);

        this.text = new THREE.Mesh(
            new THREE.TextGeometry(name, {
                font: FontUtils.ARCADE_REGULAR,
                size: .5,
                height: .1
            }),
            new THREE.MeshBasicMaterial({color: new Color(color).addScalar(-0.2)})
        );
        this.text.position.x -= width / 2;
        this.text.position.y -= height / 2;
        this.text.position.z -= .05;
        this.add(this.text);

        this.position.setY(height / 2);
    }

    changeColor(color) {
        if (color != this.color) {
            console.log('Wall.changeColor', this.name, color);
            ColorUtils.setMaterialColor(this.plane.material, color);
        }
    }
}
