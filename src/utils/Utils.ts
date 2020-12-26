import * as THREE from 'three';
import {Geometry, Material, Object3D, Vector3} from 'three';

export class Utils {

    static maxComponent(vector: Vector3) {
        return Math.max(vector.x, Math.max(vector.x, vector.z));
    }

    static dispose2(obj: Object3D) {
        obj.traverse((child) => {
            if (child instanceof Geometry) {
                console.debug('dispose Geometry', child);
                child.dispose();
            } else if (child instanceof Material) {
                console.debug('dispose Material', child);
                child.dispose();
            }
        });
    }

    static dispose(mesh: THREE.Mesh) {
        if (mesh.geometry) {
            mesh.geometry.dispose();
        }
        Utils.disposeMaterial(mesh.material);
    }

    static disposeMaterial(material: Material | Material[]) {
        if (material instanceof Material) {
            material.dispose();
        } else if (material instanceof Array) {
            for (let i = 0; i < material.length; ++i) {
                material[i].dispose();
            }
        }
    }

    static consumeMaterial(material: Material | Material[], consumer: (mat: Material) => void) {
        if (material instanceof Material) {
            consumer(material);
        } else if (material instanceof Array) {
            for (let i = 0; i < material.length; ++i) {
                consumer(material[i]);
            }
        }
    }

    static toMaterialArray(material: Material | Material[]): Material[] {
        if (material instanceof Material) {
            return [material];
        } else if (material instanceof Array) {
            return material;
        } else {
            return [];
        }
    }

    static recursiveConsumer(obj: any, consumer: (o: any) => void) {
        return Utils.recursiveConsumerWithDepth(obj, consumer, 3);
    }

    static recursiveConsumerWithDepth(obj: any, consumer: (o: any) => void, depth: number) {
        return Utils.recursiveConditionalConsumerWithDepth(obj, (o) => {
            consumer(o);
            return true;
        }, depth);
    }

    static recursiveConditionalConsumer(obj: any, consumer: (o: any) => boolean) {
        return Utils.recursiveConditionalConsumerWithDepth(obj, consumer, 3);
    }

    static recursiveConditionalConsumerWithDepth(obj: any, consumer: (o: any) => boolean, depth: number) {
        if (obj && depth-- > 0) {
            const continueRecursion = consumer(obj);
            if (continueRecursion && obj.children) {
                for (const child of obj.children) {
                    Utils.recursiveConsumerWithDepth(child, consumer, depth);
                }
            }
        }
    }
}

