/**
 * Pipeline Node: rack selectivo → STL / OBJ / GLB / SVG.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Object3D, Mesh, Material } from 'three';
import { exportRackToGlb, exportRackToObj, exportRackToStl } from '../../src/rack/export/formats.ts';
import { buildRackGroup } from '../../src/rack/geometry.ts';
import { createRackMaterial } from '../../src/rack/material.ts';
import { generateIsometricSvg } from '../../src/rack/render/isometric.ts';
import type { RackExportPaths, RackParams } from '../../src/rack/types.ts';

export type GenerateRackOptions = {
  outDir?: string;
  basename?: string;
};

function ensureNodeExportPolyfills(): void {
  const g = globalThis as Record<string, unknown>;
  if (typeof g.FileReader !== 'undefined') return;
  g.FileReader = class FileReaderPolyfill {
    result: ArrayBuffer | string | null = null;
    onloadend: ((ev: unknown) => void) | null = null;
    readAsArrayBuffer(blob: Blob) {
      void blob.arrayBuffer().then((buffer) => {
        this.result = buffer;
        this.onloadend?.({ target: this });
      });
    }
  };
}

function defaultBasename(params: RackParams): string {
  return `RACK_${params.bahias}b_${params.niveles}n_${params.anchoBahia}x${params.profundidad}x${params.altura}`;
}

function disposeObject(object: Object3D) {
  object.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    const mat = mesh.material as Material | Material[];
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat.dispose();
  });
}

export async function generateRack(
  params: RackParams,
  options: GenerateRackOptions = {},
): Promise<{ paths: RackExportPaths; params: RackParams }> {
  ensureNodeExportPolyfills();

  const { group, params: valid } = buildRackGroup(params, createRackMaterial());
  const outDir = path.resolve(options.outDir ?? 'output/rack');
  const basename = options.basename ?? defaultBasename(valid);
  await mkdir(outDir, { recursive: true });

  const paths: RackExportPaths = {
    stl: path.join(outDir, `${basename}.stl`),
    obj: path.join(outDir, `${basename}.obj`),
    glb: path.join(outDir, `${basename}.glb`),
    isometricSvg: path.join(outDir, `${basename}_isometric.svg`),
  };

  const [stl, obj, glb, svg] = await Promise.all([
    Promise.resolve(exportRackToStl(group)),
    Promise.resolve(exportRackToObj(group)),
    exportRackToGlb(group),
    Promise.resolve(generateIsometricSvg(group)),
  ]);

  await Promise.all([
    writeFile(paths.stl, Buffer.from(stl)),
    writeFile(paths.obj, obj, 'utf8'),
    writeFile(paths.glb, Buffer.from(glb)),
    writeFile(paths.isometricSvg, svg, 'utf8'),
  ]);

  disposeObject(group);

  return { paths, params: valid };
}
