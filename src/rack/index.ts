/**
 * Generador paramétrico de Rack Selectivo (naranja + azul).
 */

export type {
  RackColors,
  RackExportPaths,
  RackMaterialDef,
  RackParams,
  RackValidationResult,
} from './types';

export { validateRackParams, assertValidRackParams } from './validate';
export { createRackMaterial, DEFAULT_RACK_COLORS, DEFAULT_RACK_MATERIAL } from './material';
export { buildRackGroup, buildRackSceneObject } from './geometry';
export type { RackBuildResult } from './geometry';
export { exportRackToStl, exportRackToObj, exportRackToGlb } from './export/formats';
export {
  ISOMETRIC_VIEW_DIR,
  createIsometricCamera,
  generateIsometricSvg,
} from './render/isometric';
