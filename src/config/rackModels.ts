import type { RackParams } from '../rack/types';
import { DEFAULT_RACK_COLORS } from '../rack/material';

export type RackBannerModel = {
  id: string;
  title: string;
  description: string;
  params: RackParams;
  defaultZoom: number;
  minZoomDistance: number;
  maxZoomDistance: number;
  defaultRotationX?: number;
  defaultRotationY?: number;
};

export const RACK_COLORS = DEFAULT_RACK_COLORS;

export const RACK_MODELS: RackBannerModel[] = [
  {
    id: 'rack-2b-4n',
    title: 'Rack Selectivo',
    description:
      'Sistema de rack selectivo paramétrico. Montantes naranja y vigas azul, listo para explorar en 3D.',
    params: {
      bahias: 2,
      niveles: 4,
      anchoBahia: 2700,
      profundidad: 1100,
      altura: 6000,
      alturaPrimerNivel: 400,
      pasoNiveles: 1300,
      seccionMontante: 90,
      altoViga: 120,
      anchoViga: 50,
    },
    defaultZoom: 1.45,
    minZoomDistance: 1.2,
    maxZoomDistance: 2.8,
    defaultRotationX: 32,
    defaultRotationY: -28,
  },
];
