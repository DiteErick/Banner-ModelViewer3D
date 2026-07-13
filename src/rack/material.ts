/**
 * Materiales del rack: montantes naranja + vigas azul.
 */

import type { RackColors, RackMaterialDef } from './types';

export const DEFAULT_RACK_COLORS: RackColors = {
  montantes: '#ff6b1a',
  vigas: '#3b82f6',
};

export const DEFAULT_RACK_MATERIAL: RackMaterialDef = {
  name: 'Rack_Selectivo',
  colors: DEFAULT_RACK_COLORS,
  metalness: 0.22,
  roughness: 0.58,
};

export function createRackMaterial(overrides?: Partial<RackMaterialDef>): RackMaterialDef {
  return {
    ...DEFAULT_RACK_MATERIAL,
    ...overrides,
    colors: { ...DEFAULT_RACK_COLORS, ...overrides?.colors },
  };
}
