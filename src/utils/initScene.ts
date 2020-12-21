import * as THREE from 'three'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function copyCamera(camera: THREE.PerspectiveCamera) {
    const copyed = new THREE.PerspectiveCamera(camera.fov, window.innerWidth / window.innerHeight, camera.near, camera.far);
    copyed.position.copy(camera.position);
    copyed.rotation.copy(camera.rotation);
    return copyed;
}

export {
    scene, camera, renderer, copyCamera
}
