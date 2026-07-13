/**
 * Tipos del generador paramétrico de Rack Selectivo.
 */

export type RackParams = {
  /** Ancho libre de bahía (entre montantes), mm. */
  anchoBahia: number;
  /** Profundidad del frame (frente–fondo), mm. */
  profundidad: number;
  /** Altura total de montantes, mm. */
  altura: number;
  /** Número de bahías en línea. */
  bahias: number;
  /** Número de niveles de carga (travesaños). */
  niveles: number;
  /** Altura del primer nivel desde el piso, mm. */
  alturaPrimerNivel: number;
  /** Separación vertical entre niveles, mm. */
  pasoNiveles: number;
  /** Sección del montante (lado), mm. */
  seccionMontante: number;
  /** Alto de la viga / travesaño, mm. */
  altoViga: number;
  /** Ancho (canto) de la viga, mm. */
  anchoViga: number;
};

export type RackColors = {
  /** Color de montantes y diagonales (naranja). */
  montantes: string;
  /** Color de vigas / travesaños (azul). */
  vigas: string;
};

export type RackMaterialDef = {
  name: string;
  colors: RackColors;
  metalness: number;
  roughness: number;
};

export type RackValidationResult =
  | { ok: true; params: RackParams }
  | { ok: false; errors: string[] };

export type RackExportPaths = {
  stl: string;
  obj: string;
  glb: string;
  isometricSvg: string;
};
