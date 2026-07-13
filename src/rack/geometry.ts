/**
 * Geometría de Rack Selectivo: frames naranja + vigas azul.
 */

import * as THREE from 'three';
import { createRackMaterial } from './material';
import type { RackMaterialDef, RackParams } from './types';
import { assertValidRackParams } from './validate';

export type RackBuildResult = {
  group: THREE.Group;
  params: RackParams;
  material: RackMaterialDef;
};

function boxMesh(
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Barra diagonal entre dos puntos (caja delgada orientada). */
function braceMesh(
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  thickness: number,
  material: THREE.Material,
): THREE.Mesh {
  const start = new THREE.Vector3(ax, ay, az);
  const end = new THREE.Vector3(bx, by, bz);
  const dir = end.clone().sub(start);
  const len = Math.max(dir.length(), 1e-6);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(thickness, thickness, len), material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Construye un rack selectivo como Group (montantes naranja, vigas azul).
 */
export function buildRackGroup(rawParams: RackParams, materialDef?: RackMaterialDef): RackBuildResult {
  const params = assertValidRackParams(rawParams);
  const material = materialDef ?? createRackMaterial();

  const matOrange = new THREE.MeshStandardMaterial({
    name: 'Rack_Montantes',
    color: new THREE.Color(material.colors.montantes),
    metalness: material.metalness,
    roughness: material.roughness,
    envMapIntensity: 0.9,
  });
  const matBlue = new THREE.MeshStandardMaterial({
    name: 'Rack_Vigas',
    color: new THREE.Color(material.colors.vigas),
    metalness: material.metalness,
    roughness: material.roughness,
    envMapIntensity: 0.9,
  });

  const group = new THREE.Group();
  group.name = 'RackSelectivo';

  const {
    anchoBahia: bayW,
    profundidad: depth,
    altura: H,
    bahias,
    niveles,
    alturaPrimerNivel: firstY,
    pasoNiveles: stepY,
    seccionMontante: post,
    altoViga: beamH,
    anchoViga: beamD,
  } = params;

  const halfPost = post / 2;
  const totalWidth = bahias * bayW + (bahias + 1) * post;
  const originX = -totalWidth / 2;
  const originZ = -depth / 2;

  // —— Frames (montantes + riostras) en naranja ——
  for (let f = 0; f <= bahias; f++) {
    const x = originX + f * (bayW + post) + halfPost;
    const zFront = originZ + halfPost;
    const zBack = originZ + depth - halfPost;

    // Montantes frente / fondo
    group.add(boxMesh(post, H, post, matOrange, x, H / 2, zFront));
    group.add(boxMesh(post, H, post, matOrange, x, H / 2, zBack));

    // Placas base
    const foot = post * 1.8;
    group.add(boxMesh(foot, post * 0.35, foot, matOrange, x, post * 0.175, zFront));
    group.add(boxMesh(foot, post * 0.35, foot, matOrange, x, post * 0.175, zBack));

    // Riostras horizontales frente–fondo
    const braceCount = Math.max(2, Math.floor(H / 900));
    for (let b = 1; b <= braceCount; b++) {
      const y = (b / (braceCount + 1)) * H;
      const span = depth - post;
      group.add(boxMesh(post * 0.55, post * 0.45, span, matOrange, x, y, originZ + depth / 2));
    }

    // Diagonales en el plano del frame
    const y1 = H * 0.18;
    const y2 = H * 0.82;
    group.add(
      braceMesh(x, y1, zFront, x, y2, zBack, post * 0.4, matOrange),
      braceMesh(x, y2, zFront, x, y1, zBack, post * 0.4, matOrange),
    );
  }

  // —— Vigas / travesaños en azul ——
  for (let bay = 0; bay < bahias; bay++) {
    const xLeft = originX + bay * (bayW + post) + post;
    const xRight = xLeft + bayW;
    const xMid = (xLeft + xRight) / 2;
    const beamLen = bayW;

    for (let level = 0; level < niveles; level++) {
      const y = firstY + level * stepY + beamH / 2;
      const zFront = originZ + halfPost;
      const zBack = originZ + depth - halfPost;

      // Viga frontal y trasera
      group.add(boxMesh(beamLen, beamH, beamD, matBlue, xMid, y, zFront));
      group.add(boxMesh(beamLen, beamH, beamD, matBlue, xMid, y, zBack));
    }
  }

  // Centrar en Y sobre el piso (ya está con base en y≈0)
  group.updateMatrixWorld(true);

  return { group, params, material };
}

/**
 * Clona el group listo para escena (materiales independientes).
 */
export function buildRackSceneObject(rawParams: RackParams, materialDef?: RackMaterialDef): RackBuildResult {
  return buildRackGroup(rawParams, materialDef);
}
