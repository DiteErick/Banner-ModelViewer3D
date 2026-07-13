/**
 * Vista isométrica SVG del rack (respeta colores naranja / azul por mesh).
 */

import * as THREE from 'three';

export const ISOMETRIC_VIEW_DIR = new THREE.Vector3(1, 1, 1).normalize();

export function createIsometricCamera(
  object: THREE.Object3D,
  options: { frustumSize?: number; aspect?: number; near?: number; far?: number } = {},
): THREE.OrthographicCamera {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
  const frustumSize = options.frustumSize ?? maxDim * 1.4;
  const aspect = options.aspect ?? 1;
  const halfH = frustumSize / 2;
  const halfW = halfH * aspect;
  const camera = new THREE.OrthographicCamera(
    -halfW,
    halfW,
    halfH,
    -halfH,
    options.near ?? 0.01,
    options.far ?? maxDim * 20,
  );
  camera.position.copy(center).addScaledVector(ISOMETRIC_VIEW_DIR, maxDim * 3);
  camera.up.set(0, 1, 0);
  camera.lookAt(center);
  camera.updateProjectionMatrix();
  return camera;
}

type Vec3 = { x: number; y: number; z: number };

function isoProject(p: Vec3) {
  const x = (p.x - p.z) * Math.cos(Math.PI / 6);
  const y = p.y + (p.x + p.z) * Math.sin(Math.PI / 6);
  return { x, y, depth: p.x + p.y + p.z };
}

export function generateIsometricSvg(
  object: THREE.Object3D,
  options: { width?: number; height?: number; background?: string; stroke?: string } = {},
): string {
  const width = options.width ?? 1024;
  const height = options.height ?? 1024;
  const background = options.background ?? '#0b0e11';
  const stroke = options.stroke ?? 'rgba(243,240,234,0.08)';

  object.updateMatrixWorld(true);
  const light = { x: 0.45, y: 0.85, z: 0.3 };
  const lightLen = Math.hypot(light.x, light.y, light.z);
  const tris: Array<{ points: Array<{ x: number; y: number }>; depth: number; color: string }> = [];

  const pos = new THREE.Vector3();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();

  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const geom = mesh.geometry as THREE.BufferGeometry;
    const posAttr = geom.getAttribute('position');
    if (!posAttr) return;
    const index = geom.getIndex();
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const base = mat.color ? mat.color.clone() : new THREE.Color('#888');

    const triCount = index ? index.count / 3 : posAttr.count / 3;
    for (let t = 0; t < triCount; t++) {
      const i0 = index ? index.getX(t * 3) : t * 3;
      const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
      const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;
      a.fromBufferAttribute(posAttr, i0).applyMatrix4(mesh.matrixWorld);
      b.fromBufferAttribute(posAttr, i1).applyMatrix4(mesh.matrixWorld);
      c.fromBufferAttribute(posAttr, i2).applyMatrix4(mesh.matrixWorld);

      const ab = b.clone().sub(a);
      const ac = c.clone().sub(a);
      const n = ab.cross(ac).normalize();
      const shade = 0.3 + 0.7 * Math.max(0, n.dot(new THREE.Vector3(light.x / lightLen, light.y / lightLen, light.z / lightLen)));
      const hex = `#${base.clone().multiplyScalar(shade).getHexString()}`;

      const pa = isoProject(a);
      const pb = isoProject(b);
      const pc = isoProject(c);
      tris.push({
        points: [
          { x: pa.x, y: pa.y },
          { x: pb.x, y: pb.y },
          { x: pc.x, y: pc.y },
        ],
        depth: (pa.depth + pb.depth + pc.depth) / 3,
        color: hex,
      });
    }
  });

  tris.sort((t0, t1) => t0.depth - t1.depth);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const t of tris) {
    for (const p of t.points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }

  const spanX = Math.max(maxX - minX, 1e-6);
  const spanY = Math.max(maxY - minY, 1e-6);
  const pad = 0.08;
  const scale = (1 - pad * 2) * Math.min(width / spanX, height / spanY);
  const ox = width / 2 - ((minX + maxX) / 2) * scale;
  const oy = height / 2 + ((minY + maxY) / 2) * scale;

  const paths = tris.map((t) => {
    const d = t.points
      .map((p, idx) => {
        const x = ox + p.x * scale;
        const y = oy - p.y * scale;
        return `${idx === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
    return `<path d="${d} Z" fill="${t.color}" stroke="${stroke}" stroke-width="0.3" />`;
  });

  void pos;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${background}"/>
  <g>
    ${paths.join('\n    ')}
  </g>
</svg>
`;
}
