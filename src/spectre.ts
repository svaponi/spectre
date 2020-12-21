import * as THREE from 'three'
import {defineOutput, setControl} from './utils/controls';
import {camera, renderer, scene} from './utils/initScene';
import {Car} from './objects/car';
import {degrees_to_radians, findDeltaXZ, radians_to_degrees, round} from './utils/trigonometry';
import {PressedKeys} from './utils/pressedKeys';

enum Keys {
    RESET = 'KeyR',
    PRINT_DEBUG = 'KeyD',
    STOP_CAMERA = 'KeyA',
    MOVE_FORWARD = 'ArrowUp',
    MOVE_BACKWARD = 'ArrowDown',
    TURN_RIGHT = 'ArrowRight',
    TURN_LEFT = 'ArrowLeft',
}

const context: any = {};
setControl(context, 'cameraPositionHeight', 3, 0, 10, 1);
setControl(context, 'cameraPositionDistance', 5, 0, 100, 1);
setControl(context, 'speed', 1, -5, 5, 1);
setControl(context, 'steerAngle', 3, 1, 10, 1);
const outputCarPosX = defineOutput('carPosX');
const outputCarPosY = defineOutput('carPosY');
const outputCarPosZ = defineOutput('carPosZ');
const outputCarRotX = defineOutput('carRotX');
const outputCarRotY = defineOutput('carRotY');
const outputCarRotZ = defineOutput('carRotZ');
const outputCameraPosX = defineOutput('cameraPosX');
const outputCameraPosY = defineOutput('cameraPosY');
const outputCameraPosZ = defineOutput('cameraPosZ');


const grid = new THREE.GridHelper(100, 100);
scene.add(grid);

camera.position.x = 0;
camera.position.y = context.cameraPositionHeight;
camera.position.z = context.cameraPositionDistance;

const car = new Car();
car.add(camera); // Add the camera object to the pivot object (parent-child relationship)
camera.lookAt(car.position); // Point camera towards the pivot
scene.add(car);

const keys = new PressedKeys();

keys.setKeyupHook(Keys.STOP_CAMERA, () => {
    car.add(camera);
    camera.position.x = 0;
    camera.position.z = context.cameraPositionDistance;
    camera.lookAt(car.position);
});

keys.setKeydownHook(Keys.STOP_CAMERA, () => {
    car.remove(camera);
    camera.position.x = car.position.x;
    camera.position.z = car.position.z;
    const delta = findDeltaXZ(car.rotation, context.cameraPositionDistance);
    camera.position.sub(delta);
    camera.lookAt(car.position);
});

let counter = 0;
export const animate = function () {

    requestAnimationFrame(animate);

    if (keys.get(Keys.TURN_RIGHT)) {
        car.rotateY(-degrees_to_radians(context.steerAngle));
    }
    if (keys.get(Keys.TURN_LEFT)) {
        car.rotateY(degrees_to_radians(context.steerAngle));
    }
    if (keys.get(Keys.MOVE_FORWARD)) {
        car._moveForward(context.speed / 10);
    }
    if (keys.get(Keys.MOVE_BACKWARD)) {
        car._moveBackward(context.speed / 10);
    }
    if (keys.get(Keys.STOP_CAMERA)) {
        camera.lookAt(car.position);
    }
    if (keys.get(Keys.PRINT_DEBUG)) {
        console.log('keys', keys);
        console.log('car.rotation', car.rotation.y);
        console.log('car.matrix', car.matrix);
    }
    if (keys.get(Keys.RESET)) {
        car.position.x = 0;
        car.position.y = 0;
        car.position.z = 0;
    }

    if (counter % 10 == 0) {
        outputCameraPosX(camera.position.x);
        outputCameraPosY(camera.position.y);
        outputCameraPosZ(camera.position.z);
        outputCarPosX(car.position.x);
        outputCarPosY(car.position.y);
        outputCarPosZ(car.position.z);
        outputCarRotX(`${round(car.rotation.x)} ${round(radians_to_degrees(car.rotation.x))}`);
        outputCarRotY(`${round(car.rotation.y)} ${round(radians_to_degrees(car.rotation.y))}`);
        outputCarRotZ(`${round(car.rotation.z)} ${round(radians_to_degrees(car.rotation.z))}`);
    }

    camera.position.y = context.cameraPositionHeight;

    renderer.render(scene, camera);
    counter++
};
