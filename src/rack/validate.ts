/**
 * Validación física de rack selectivo.
 */

import type { RackParams, RackValidationResult } from './types';

const EPS = 1e-9;

function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

export function validateRackParams(raw: RackParams): RackValidationResult {
  const errors: string[] = [];
  const p = raw;

  if (!isFiniteNumber(p.anchoBahia) || p.anchoBahia <= 0) errors.push('anchoBahia debe ser > 0.');
  if (!isFiniteNumber(p.profundidad) || p.profundidad <= 0) errors.push('profundidad debe ser > 0.');
  if (!isFiniteNumber(p.altura) || p.altura <= 0) errors.push('altura debe ser > 0.');
  if (!isFiniteNumber(p.bahias) || p.bahias < 1 || !Number.isInteger(p.bahias)) {
    errors.push('bahias debe ser un entero ≥ 1.');
  }
  if (!isFiniteNumber(p.niveles) || p.niveles < 1 || !Number.isInteger(p.niveles)) {
    errors.push('niveles debe ser un entero ≥ 1.');
  }
  if (!isFiniteNumber(p.alturaPrimerNivel) || p.alturaPrimerNivel <= 0) {
    errors.push('alturaPrimerNivel debe ser > 0.');
  }
  if (!isFiniteNumber(p.pasoNiveles) || p.pasoNiveles <= 0) errors.push('pasoNiveles debe ser > 0.');
  if (!isFiniteNumber(p.seccionMontante) || p.seccionMontante <= 0) {
    errors.push('seccionMontante debe ser > 0.');
  }
  if (!isFiniteNumber(p.altoViga) || p.altoViga <= 0) errors.push('altoViga debe ser > 0.');
  if (!isFiniteNumber(p.anchoViga) || p.anchoViga <= 0) errors.push('anchoViga debe ser > 0.');

  if (errors.length) return { ok: false, errors };

  const topBeam = p.alturaPrimerNivel + (p.niveles - 1) * p.pasoNiveles + p.altoViga;
  if (topBeam > p.altura + EPS) {
    errors.push(
      `Los niveles (${topBeam}) superan la altura de montantes (${p.altura}). Reduce niveles o pasoNiveles.`,
    );
  }

  if (p.seccionMontante * 2 >= p.profundidad - EPS) {
    errors.push('seccionMontante es demasiado grande para la profundidad del frame.');
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, params: { ...p } };
}

export function assertValidRackParams(raw: RackParams): RackParams {
  const result = validateRackParams(raw);
  if (!result.ok) {
    throw new Error(`Parámetros de rack inválidos:\n- ${result.errors.join('\n- ')}`);
  }
  return result.params;
}
