import * as THREE from 'three'
import {setControl} from './utils/controls';
import {camera, renderer, scene} from './utils/initScene';
import {Wall} from './objects/wall';

const geometry = new THREE.BoxGeometry(1, 1, 1);
const cube = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    color: 0x00ff99
}));

const points = [];
points.push(new THREE.Vector3(-1, 0, 0));
points.push(new THREE.Vector3(0, 1, 0));
points.push(new THREE.Vector3(1, 0, 0));
points.push(new THREE.Vector3(0, -1, 0));
points.push(new THREE.Vector3(-1, 0, 0));
points.push(new THREE.Vector3(0, 0, 1));
points.push(new THREE.Vector3(1, 0, 0));
points.push(new THREE.Vector3(0, 0, -1));
points.push(new THREE.Vector3(-1, 0, 0));
points.push(new THREE.Vector3(0, -1, 0));
points.push(new THREE.Vector3(0, 0, 1));
points.push(new THREE.Vector3(0, 1, 0));
points.push(new THREE.Vector3(0, 0, -1));
points.push(new THREE.Vector3(0, -1, 0));
const geometry3 = new THREE.BufferGeometry().setFromPoints(points);
const diamond = new THREE.Line(geometry3, new THREE.MeshBasicMaterial({
    color: 0x0099ff
}));

const geometry4 = new THREE.BufferGeometry();
const vertices = new Float32Array([

    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,

    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,

    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,

    1.0, 1.0, -1.0,
    -1.0, 1.0, -1.0,
    -1.0, -1.0, -1.0,

]);
// itemSize = 3 because there are 3 values (components) per vertex
geometry4.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
const triangles = new THREE.Mesh(geometry4, new THREE.MeshBasicMaterial({
    color: 0xff0099
}));
triangles.rotation.z = Math.PI / 4;

const wall = new Wall(3, 3, {color: 0xff9900});

const obj = new THREE.Object3D();
obj.add(wall);
obj.add(triangles);
obj.add(diamond);
obj.add(cube);
scene.add(obj);

const config: any = {};

setControl(config, 'cameraPositionZ', 3, 1, 10, 1);
setControl(config, 'x', 0, -1, 1, 0.1);
setControl(config, 'y', 0, -1, 1, 0.1);
setControl(config, 'z', 0, -1, 1, 0.1);
setControl(config, 'scaleCube', 1, 0, 5, 0.1);
setControl(config, 'scaleDiamond', 1, 0, 5, 0.1);

config.set_x(0.1);
config.set_y(0.01);
// config.set_z(0.1);

const AXES = ['x', 'y', 'z'];

camera.position.z = config.cameraPositionZ;

export const animate = function () {

    requestAnimationFrame(animate);

    for (let axis of AXES) {
        obj.rotation[axis] += config[axis] / 10;
    }

    cube.scale.set(config.scaleCube, config.scaleCube, config.scaleCube);

    diamond.scale.set(config.scaleDiamond, config.scaleDiamond, config.scaleDiamond);

    camera.position.z = config.cameraPositionZ;

    renderer.render(scene, camera);
};
