import * as THREE from 'three';
import {Game} from './level/Game';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({antialias: true});
document.body.appendChild(renderer.domElement);

// resize
const windowResizeHandler = () => {
    const {innerHeight, innerWidth} = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler);

const levels = [];
for (let i = 1; i <= 100; i++) {
    let levelName = `${i}`;
    let levelSize = 20 + (10 * i);
    let noOfWalls = Math.pow(levelSize, 2) / 100;
    let noOfFlags = 2 + Math.floor(i / 5);
    let levelTime = noOfFlags * 10000;
    let pointsPerFlag = 10 * Math.ceil(i / 5);
    let carSpeed = 2 + Math.floor(i / 5);
    let carSteerAngle = 3 + Math.floor(i / 5);
    levels.push({levelName, levelSize, noOfWalls, noOfFlags, levelTime, pointsPerFlag, carSpeed, carSteerAngle})
}
const level = new Game(scene, camera, levels);

export const animate = function (time: number) {
    requestAnimationFrame(animate);
    level.refresh(time);
    renderer.render(scene, camera);
};
