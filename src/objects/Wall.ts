import * as THREE from 'three';
import {Box3, MeshBasicMaterial} from 'three';
import {Color} from 'three/src/math/Color';
import {FontUtils} from '../fonts/FontUtils';
import {MeshBasicMaterialParameters} from 'three/src/materials/MeshBasicMaterial';
import {Interceptable, Refreshable} from '../model';

export class Wall extends THREE.Object3D implements Interceptable, Refreshable {

    width: number;
    height: number;
    params: MeshBasicMaterialParameters;
    boundaries: Box3;

    private tmpColor = new Color();
    private material: MeshBasicMaterial;
    private materialText: MeshBasicMaterial;
    private lastRefresh = 0;

    constructor(width: number, height: number, params: MeshBasicMaterialParameters, name = 'wall') {

        super();

        this.width = width;
        this.height = height;
        this.name = name;
        this.params = params;

        const geo = new THREE.BoxGeometry(width, height, 0.1, 1, 1, 1);
        geo.computeBoundingBox();
        this.boundaries = geo.boundingBox;

        this.material = new MeshBasicMaterial(params);

        const plane = new THREE.Mesh(
            new THREE.BoxBufferGeometry(width, height, 0.05, 1, 1, 1),
            this.material,
        );
        this.add(plane);

        this.position.setY(height / 2);
    }

    setText(value: string) {
        const params = this.params;
        if (params.color) {
            params.color = new Color(params.color).addScalar(-0.4);
        }
        this.materialText = new MeshBasicMaterial(params);
        const text = new THREE.Mesh(
            new THREE.TextBufferGeometry(value, {
                font: FontUtils.ARCADE_REGULAR,
                size: .5,
                height: .1
            }),
            this.materialText
        );
        text.position.x -= this.width / 2;
        text.position.y -= this.height / 2;
        text.position.z -= .05;
        this.add(text);
    }

    setColor(color: Color | string | number) {
        this.tmpColor.set(color);
        this.material.color.set(this.tmpColor);
        if (this.materialText) {
            this.materialText.color.set(this.tmpColor.addScalar(-0.4));
        }
    }

    refresh(_time: number) {
        if (Math.abs(this.lastRefresh - _time) > 50) {
            this.lastRefresh = _time;
            this.tmpColor.set(this.material.color);
            this.tmpColor.offsetHSL(0.01, 0, 0);
            this.material.color.set(this.tmpColor);
            if (this.materialText) {
                this.materialText.color.set(this.tmpColor.addScalar(-0.4));
            }
        }
    }
}
