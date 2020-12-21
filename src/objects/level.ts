import * as THREE from 'three';
import {MathUtils} from 'three';
import {Wall} from './wall';
import {scene} from '../utils/initScene';
import {IntersectionUtils} from '../utils/interdactionUtils';
import {isRefreshable, Refreshable} from './refreshable';

const NO_OF_WALLS = 100;
const LEVEL_SIZE = 100;
const HEIGHT = 1;
const MAX_HEIGHT = 2;
const WIDTH = 2;
const MAX_WIDTH = 5;

export class Level extends THREE.Object3D implements Refreshable {

    obstacles: THREE.Object3D[] = [];

    constructor(parent: THREE.Object3D) {

        super();

        this.parent = parent;

        const grid = new THREE.GridHelper(LEVEL_SIZE, LEVEL_SIZE);
        scene.add(grid);

        for (let i = 0; i < NO_OF_WALLS; i++) {
            const wall = new Wall(MathUtils.randInt(WIDTH, MAX_WIDTH), MathUtils.randInt(HEIGHT, MAX_HEIGHT), 0xaaff00, `${i}`);
            do {
                wall.position.setX(MathUtils.randFloatSpread(LEVEL_SIZE));
                wall.position.setZ(MathUtils.randFloatSpread(LEVEL_SIZE));
                wall.rotation.set(0, MathUtils.randFloatSpread(2 * Math.PI), 0);
            } while (IntersectionUtils.findIntersectionsWithMany(this, this.obstacles).length);
            this.add(wall);
            this.obstacles.push(wall);
        }

        parent.add(this);
    }

    refresh(time: number) {
        for (let child of this.children) {
            if (isRefreshable(child)) {
                child.refresh(time);
            }
        }
    }
}
