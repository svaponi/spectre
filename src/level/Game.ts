import * as THREE from 'three';
import {Color, GridHelper, MathUtils, Matrix4, Object3D, PerspectiveCamera, Scene, Vector3} from 'three';
import {Euler} from 'three/src/math/Euler';
import {CircularBuffer} from '../utils/circularBuffer';
import {Interceptable, Interception, isRefreshable, Keys, LevelParams, LevelStatus, Pr, Refreshable} from '../model';
import {Controls} from './controls';
import {HUD} from './hud';
import {PRESSED_KEYS} from './PressedKeys';
import {Car} from '../objects/car';
import {Flag} from '../objects/flag';
import {Wall} from '../objects/wall';
import {TrigonometryUtils} from '../utils/TrigonometryUtils';
import {Utils} from '../utils/Utils';
import {AUDIO} from '../audio/Audio';

const FREE_CENTER_SIZE = 5;
const HEIGHT = 1;
const MAX_HEIGHT = 2;
const WIDTH = 2;
const MAX_WIDTH = 5;
const POSITION_BUFFER_SIZE = 20;
const VECTOR3_000 = new Vector3();

export class Game extends THREE.Object3D implements Refreshable {

    context: any = {};

    scene: Scene;
    camera: PerspectiveCamera;
    controls: Controls;
    grid: Object3D;
    car: Car;
    hud: HUD;

    private paused = false;

    private levelParams: LevelParams[];

    private currentLevel: number;
    private currentLevelParams: LevelParams;

    private keys = PRESSED_KEYS;

    private elements: Interceptable[] = [];
    private carPositionBuffer = new CircularBuffer<Pr>(POSITION_BUFFER_SIZE);
    private pristine: boolean = true;

    constructor(scene: Scene, camera: PerspectiveCamera, levelParams: LevelParams[]) {

        super();

        this.name = 'level';
        this.parent = scene;
        this.scene = scene;
        this.camera = camera;
        this.levelParams = levelParams;
        scene.add(this);


        // controls
        this.controls = new Controls(this.context);

        this.controls.initControl('cameraPositionHeight', 5, -1, 10, .5);
        this.controls.initControl('cameraPositionDistance', 10, -1, 30, .5);
        this.controls.initControl('cameraZoom', 5, -1, 10, 1);
        this.controls.initControl('carSpeed', 3, 1, 5, 1);
        this.controls.initControl('carSteerAngle', 5, 1, 10, 1);

        this.controls.initOutput('carPosX');
        this.controls.initOutput('carPosY');
        this.controls.initOutput('carPosZ');
        this.controls.initOutput('carRotX');
        this.controls.initOutput('carRotY');
        this.controls.initOutput('carRotZ');
        this.controls.initOutput('cameraPosX');
        this.controls.initOutput('cameraPosY');
        this.controls.initOutput('cameraPosZ');


        // heads up display
        this.hud = new HUD();
        this.hud.onLevelCompleted = () => {
            this.initLevel(this.currentLevel + 1);
        };
        this.hud.onGameOver = async () => {
            this.car.fallDown();
            this.initLevel(0);
        };

        // to detect pressed keys
        const game = this;
        this.keys.addKeydownHook(Keys.CAMERA_ZOOM_UP, () => this.controls.add('cameraZoom', 1));
        this.keys.addKeydownHook(Keys.CAMERA_ZOOM_DOWN, () => this.controls.add('cameraZoom', -1));
        this.keys.addKeydownHook(Keys.CAMERA_HEIGHT_UP, () => this.controls.add('cameraPositionHeight', 1));
        this.keys.addKeydownHook(Keys.CAMERA_HEIGHT_DOWN, () => this.controls.add('cameraPositionHeight', -1));
        this.keys.addKeydownHook(Keys.CAMERA_DISTANCE_UP, () => this.controls.add('cameraPositionDistance', 1));
        this.keys.addKeydownHook(Keys.CAMERA_DISTANCE_DOWN, () => this.controls.add('cameraPositionDistance', -1));
        this.keys.addKeydownHook(Keys.TOGGLE_CONTROLS, () => this.controls.toggleControls());
        this.keys.addKeydownHook(Keys.PAUSE, () => game.pause(!this.paused));
        this.keys.addKeydownHook(Keys.EXIT, () => game.exit());
        this.keys.addKeydownHook(Keys.YOU_LOSE, () => game.hud.gameOver());
        this.keys.addKeydownHook(Keys.STOP_CAMERA, () => game.car.detachCamera());
        this.keys.addKeyupHook(Keys.STOP_CAMERA, () => game.car.attachCamera());

        this.initLevel(0);
    }

    async initLevel(level: number = this.currentLevel) {
        if (this.pristine) {
            AUDIO.preload();
            await this.hud.centerText([{slideInText: 'Press ENTER to start'}, {waitForKey: 'Enter'}, {clear: true}], 100);
            AUDIO.playWelcome({startIn: 200});
            await this.hud.centerText([{slideInText: 'welcome'}, {blink: 3}, {clear: true}], 100);
            this.pristine = false;
        }
        this.setLevel(level);
        this.drawLevel();
        this.resetCamera();
        await AUDIO.playDropInFX({waitStart: true});
        this.car.dropIn();
        this.hud.init(this.currentLevelParams);
        this.controls.set('carSpeed', this.currentLevelParams.carSpeed);
        this.controls.set('carSteerAngle', this.currentLevelParams.carSteerAngle);
    }

    setLevel(level: number) {
        if (this.currentLevel != level) {
            if (!this.levelParams[level]) {
                throw new Error(`invalid level ${level}`);
            }
            this.currentLevel = level;
            this.currentLevelParams = this.levelParams[level];
        }
    }

    private drawLevel() {

        // the car
        if (this.car) {
            Utils.dispose2(this.car);
            this.scene.remove(this.car);
        }
        this.car = new Car(this);
        this.car.add(this.camera); // Add the camera object to the pivot object (parent-child relationship)
        this.scene.add(this.car);

        // the grid
        if (this.grid) {
            Utils.dispose2(this.grid);
            this.scene.remove(this.grid);
        }
        this.grid = new GridHelper(this.currentLevelParams.levelSize, this.currentLevelParams.levelSize);
        this.grid.name = 'grid';
        this.scene.add(this.grid);

        for (let element of this.elements) {
            if (element instanceof Object3D) {
                this.remove(element);
                Utils.dispose2(element);
            }
        }
        this.elements.splice(0, this.elements.length);

        for (let i = 0; i < this.currentLevelParams.noOfWalls; i++) {
            const color = new Color(0x99ff00).offsetHSL(0, 0, MathUtils.randFloatSpread(0.25));
            const wall = new Wall(MathUtils.randInt(WIDTH, MAX_WIDTH), MathUtils.randInt(HEIGHT, MAX_HEIGHT), {color}, `l${this.currentLevel}.wall${i}`);
            do {
                wall.position.setX(MathUtils.randFloatSpread(this.currentLevelParams.levelSize));
                wall.position.setZ(MathUtils.randFloatSpread(this.currentLevelParams.levelSize));
                wall.rotation.set(0, MathUtils.randInt(0, 3) * (Math.PI / 2), 0);
            } while (this.invalidPosition(wall));
            wall.setText('' + i);
            this.addElement(wall);
        }

        for (let i = 0; i < this.currentLevelParams.noOfFlags; i++) {
            const color = MathUtils.randInt(0xff9900, 0xff3300);
            const flag = new Flag(1, {color}, `l${this.currentLevel}.flag${i}`);
            let counter = 0;
            do {
                if (counter++ > 5) throw new Error('too many retry');
                flag.position.setX(MathUtils.randFloatSpread(this.currentLevelParams.levelSize));
                flag.position.setZ(MathUtils.randFloatSpread(this.currentLevelParams.levelSize));
            } while (this.invalidPosition(flag));
            this.addElement(flag);
        }
    }

    resetCamera() {
        let cameraPivot = this.car.position;
        if (this.context.cameraZoom < 0) {
        } else if (this.context.cameraZoom == 0) {
            this.controls.set('cameraPositionHeight', 0.5);
            this.controls.set('cameraPositionDistance', -1);
            cameraPivot = this.car.position.clone().add(TrigonometryUtils.findDeltaXZ(this.car.rotation, 100));
        } else {
            this.controls.set('cameraPositionHeight', this.context.cameraZoom);
            this.controls.set('cameraPositionDistance', this.context.cameraZoom * Math.max(3, 6 - this.context.cameraZoom));
        }
        this.camera.position.x = 0;
        this.camera.position.y = this.context.cameraPositionHeight;
        this.camera.position.z = this.context.cameraPositionDistance;
        this.camera.lookAt(cameraPivot); // Point camera towards the pivot
    }

    private addElement(element) {
        this.add(element);
        this.elements.push(element);
    }

    private removeElement(element) {
        this.remove(element);
        this.elements.splice(this.elements.indexOf(element), 1);
    }

    private invalidPosition(element: Wall | Flag) {
        if (element instanceof Wall) {
            const distanceFromOriginXZ = Math.sqrt(Math.pow(element.position.x, 2) + Math.pow(element.position.z, 2));
            return FREE_CENTER_SIZE >= distanceFromOriginXZ;
        }
        if (element instanceof Flag) {
            let interceptionFound = this.findFirstInterception(element, this.elements) != null;
            if (interceptionFound) {
                console.log('interception by findFirstInterception');
                return true;
            }
            for (let el of this.elements) {
                const distanceSquared = element.position.distanceToSquared(el.position);
                if (distanceSquared <= 2) {
                    console.log('interception by distanceToSquared');
                    return true;
                }
            }
            return false;
        }
        throw new Error('unsupported argument');
    }

    turnCar(euler: Euler) {
        this.car.rotateY(euler.y);
    }

    moveCar(delta: Vector3) {

        let pr = {
            position: this.car.position.clone().add(delta),
            rotation: this.car.rotation.clone()
        };

        if (this.isInside(pr.position)) {
            const intersection = this.findFirstInterception(this.car, this.elements, pr.position);
            if (intersection) {

                console.debug('intersection', intersection);

                if (intersection.target instanceof Wall) {
                    const wall = intersection.target;
                    let index = this.elements.indexOf(wall);
                    if (index >= 0) {
                        AUDIO.playCollisionFX();
                        this.removeElement(wall);
                        wall.dispose();
                        pr.position = VECTOR3_000;
                        pr.rotation = new Euler();
                        this.car.dropIn();
                        this.hud.centerText([{text: 'collision'}, {blink: 3}, {clear: true}], 100);
                        this.hud.wallCollision(wall);
                    }
                } else if (intersection.target instanceof Flag) {
                    const flag = intersection.target;
                    let index = this.elements.indexOf(flag);
                    if (index >= 0) {
                        AUDIO.playFlagFX();
                        this.removeElement(flag);
                        flag.dispose();
                        this.hud.foundAFlag(flag);
                    }
                }
            }

            if (pr.position != null) {
                const playbackRate = 1 - ((5 - this.context.carSpeed) / 10);
                AUDIO.playCarMoveFX({playbackRate});
                this.car.position.copy(pr.position);
            }
            if (pr.rotation != null) {
                this.car.setRotationFromEuler(pr.rotation);
            }

            this.carPositionBuffer.push(pr);
        }
    }

    private lastOutputRefresh = 0;

    refresh(time: number) {

        if (this.pristine) {
            return;
        }

        if (this.hud.status == LevelStatus.IN_PROGRESS) {

            if (this.keys.get(Keys.TURN_RIGHT)) {
                this.car._steerRight(TrigonometryUtils.degrees_to_radians(this.context.carSteerAngle));
            }
            if (this.keys.get(Keys.TURN_LEFT)) {
                this.car._steerLeft(TrigonometryUtils.degrees_to_radians(this.context.carSteerAngle));
            }
            if (this.keys.get(Keys.MOVE_FORWARD)) {
                this.car._moveForward(this.context.carSpeed / 10);
            }
            if (this.keys.get(Keys.MOVE_BACKWARD)) {
                this.car._moveBackward(this.context.carSpeed / 10);
            }
            if (this.keys.get(Keys.SHOOT)) {
                this.car._shoot(time);
            }
        }

        this.car.refresh(time);

        if (this.keys.get(Keys.STOP_CAMERA)) {
            this.camera.lookAt(this.car.position);
        } else {
            // we can invoke resetCamera only when camera is following the car, not during STOP_CAMERA
            // (during STOP_CAMERA the actual position is too expensive to initLevel at every frame)
            this.resetCamera();
        }

        for (let child of this.children) {
            if (isRefreshable(child)) {
                child.refresh(time);
            }
        }

        if (time - this.lastOutputRefresh >= 200) {
            this.lastOutputRefresh = time;
            this.context.updateOutputCarPosX(this.car.position.x);
            this.context.updateOutputCarPosY(this.car.position.y);
            this.context.updateOutputCarPosZ(this.car.position.z);
            this.context.updateOutputCarRotX(TrigonometryUtils.prettyRadians(this.car.rotation.x));
            this.context.updateOutputCarRotY(TrigonometryUtils.prettyRadians(this.car.rotation.y));
            this.context.updateOutputCarRotZ(TrigonometryUtils.prettyRadians(this.car.rotation.z));
            this.context.updateOutputCameraPosX(this.camera.position.x);
            this.context.updateOutputCameraPosY(this.camera.position.y);
            this.context.updateOutputCameraPosZ(this.camera.position.z);
        }
    }

    private findFirstInterception(source: Interceptable, targets: Interceptable[], sourcePosition = source.position): Interception {
        for (let target of targets) {
            let intersection = this.interceptOne(source, target, sourcePosition);
            if (intersection) {
                return intersection;
            }
        }
        return null;
    }

    private interceptOne(source: Interceptable, target: Interceptable, sourcePosition = source.position): Interception | null {
        const sourceMatrixWorld = new Matrix4().setPosition(sourcePosition);
        const targetMatrixWorld = new Matrix4().setPosition(target.position);
        const sourceBox = source.boundaries.clone().applyMatrix4(sourceMatrixWorld);
        const targetBox = target.boundaries.clone().applyMatrix4(targetMatrixWorld);
        const intersectionBox = sourceBox.intersect(targetBox);
        if (!intersectionBox.isEmpty()) {
            var direction = new THREE.Vector3();
            direction.subVectors(sourcePosition, target.position);
            var rotation = new Euler().setFromVector3(direction, "XYZ");
            const result = {
                sourceMatrixWorld,
                targetMatrixWorld,
                targetBox,
                sourceBox,
                intersectionBox,
                target,
                source,
                rotation
            };
            return result;
        }
        return null;
    }

    isInside(pos: Vector3) {
        return Math.abs(pos.x) < this.currentLevelParams.levelSize / 2 && Math.abs(pos.z) < this.currentLevelParams.levelSize / 2;
    }

    private pause(paused: boolean = true) {
        this.paused = paused;
        this.hud.pause(paused);
    }

    private exit() {
        this.hud.exit().then(() => {
            document.location.href = "https://sawbla.de";
        });
    }
}
