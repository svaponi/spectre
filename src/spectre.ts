import {setControl, setOutput, toggleControls} from './utils/controls';
import {camera, renderer, scene} from './utils/initScene';
import {Car} from './objects/car';
import {degrees_to_radians, findDeltaXZ, radians_to_degrees, round} from './utils/trigonometry';
import {PressedKeys} from './utils/pressedKeys';
import {Level} from './objects/level';

enum Keys {
    RESET = 'KeyR',
    TOGGLE_CONTROLS = 'KeyC',
    PRINT_DEBUG = 'KeyD',
    STOP_CAMERA = 'KeyA',
    SHOOT = 'KeyS',
    MOVE_FORWARD = 'ArrowUp',
    MOVE_BACKWARD = 'ArrowDown',
    TURN_RIGHT = 'ArrowRight',
    TURN_LEFT = 'ArrowLeft',
}

const context: any = {};
setControl(context, 'cameraPositionHeight', 2, 0, 10, 1);
setControl(context, 'cameraPositionDistance', 5, 0, 100, 1);
setControl(context, 'speed', 2, -5, 5, 1);
setControl(context, 'steerAngle', 4, 1, 10, 1);
const outputCarPosX = setOutput('carPosX');
const outputCarPosY = setOutput('carPosY');
const outputCarPosZ = setOutput('carPosZ');
const outputCarRotX = setOutput('carRotX');
const outputCarRotY = setOutput('carRotY');
const outputCarRotZ = setOutput('carRotZ');
const outputCameraPosX = setOutput('cameraPosX');
const outputCameraPosY = setOutput('cameraPosY');
const outputCameraPosZ = setOutput('cameraPosZ');


const level = new Level(scene);

camera.position.x = 0;
camera.position.y = context.cameraPositionHeight;
camera.position.z = context.cameraPositionDistance;

const car = new Car(scene, level);

car.add(camera); // Add the camera object to the pivot object (parent-child relationship)
camera.lookAt(car.position); // Point camera towards the pivot

const keys = new PressedKeys();

keys.setKeydownHook(Keys.TOGGLE_CONTROLS, () => toggleControls());

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

let lastRefresh = 0;
export const animate = function (time: number) {

    requestAnimationFrame(animate);

    if (keys.get(Keys.TURN_RIGHT)) {
        car._steerRight(degrees_to_radians(context.steerAngle));
    }
    if (keys.get(Keys.TURN_LEFT)) {
        car._steerLeft(degrees_to_radians(context.steerAngle));
    }
    if (keys.get(Keys.MOVE_FORWARD)) {
        car._moveForward(context.speed / 10);
    }
    if (keys.get(Keys.MOVE_BACKWARD)) {
        car._moveBackward(context.speed / 10);
    }
    if (keys.get(Keys.SHOOT)) {
        car._shoot(time);
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

    if (time - lastRefresh >= 200) {
        lastRefresh = time;
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

    car.refresh(time);
    level.refresh(time);

    camera.position.y = context.cameraPositionHeight;

    renderer.render(scene, camera);
};
