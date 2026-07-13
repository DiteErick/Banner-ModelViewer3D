/**
 * Exportadores STL / OBJ / GLB para rack (Group multi-material).
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

export function exportRackToStl(object: THREE.Object3D): ArrayBuffer {
  const result = new STLExporter().parse(object, { binary: true });
  if (result instanceof DataView) {
    const copy = new Uint8Array(result.buffer.byteLength);
    copy.set(new Uint8Array(result.buffer, result.byteOffset, result.byteLength));
    return copy.buffer;
  }
  return new TextEncoder().encode(String(result)).buffer;
}

export function exportRackToObj(object: THREE.Object3D): string {
  return new OBJExporter().parse(object);
}

export function exportRackToGlb(object: THREE.Object3D): Promise<ArrayBuffer> {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      object,
      (result) => {
        if (result instanceof ArrayBuffer) resolve(result);
        else reject(new Error('GLTFExporter devolvió JSON; se esperaba GLB binario.'));
      },
      (error) => reject(error),
      { binary: true },
    );
  });
}
