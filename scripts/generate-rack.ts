#!/usr/bin/env node
/**
 * CLI del generador de Rack Selectivo.
 *
 * Uso:
 *   pnpm rack -- --bahias 2 --niveles 4 --ancho 2700 --profundidad 1100 --altura 6000
 */

import path from 'node:path';
import { generateRack } from './rack/generate.ts';
import type { RackParams } from '../src/rack/types.ts';
import { validateRackParams } from '../src/rack/validate.ts';

type CliArgs = {
  bahias?: number;
  niveles?: number;
  ancho?: number;
  profundidad?: number;
  altura?: number;
  primerNivel?: number;
  paso?: number;
  montante?: number;
  altoViga?: number;
  anchoViga?: number;
  out?: string;
  name?: string;
  help?: boolean;
};

function printHelp() {
  console.log(`
Generador paramétrico de Rack Selectivo (naranja + azul)

Opciones:
  --bahias <n>          Número de bahías
  --niveles <n>         Niveles de carga
  --ancho <n>           Ancho libre de bahía
  --profundidad <n>     Profundidad del frame
  --altura <n>          Altura de montantes
  --primer-nivel <n>    Altura del primer nivel (default: 400)
  --paso <n>            Separación entre niveles (default: 1200)
  --montante <n>        Sección de montante (default: 90)
  --alto-viga <n>       Alto de viga (default: 120)
  --ancho-viga <n>      Canto de viga (default: 50)
  --out <dir>           Salida (default: output/rack)
  --name <base>         Nombre base
  --help

Ejemplo:
  pnpm rack -- --bahias 2 --niveles 4 --ancho 2700 --profundidad 1100 --altura 6000
`);
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    const next = argv[i + 1];
    const num = () => {
      const v = Number(next);
      if (!Number.isFinite(v)) throw new Error(`Valor inválido tras ${key}: ${next}`);
      i++;
      return v;
    };
    switch (key) {
      case '--help':
      case '-h':
        args.help = true;
        break;
      case '--bahias':
        args.bahias = num();
        break;
      case '--niveles':
        args.niveles = num();
        break;
      case '--ancho':
        args.ancho = num();
        break;
      case '--profundidad':
        args.profundidad = num();
        break;
      case '--altura':
        args.altura = num();
        break;
      case '--primer-nivel':
        args.primerNivel = num();
        break;
      case '--paso':
        args.paso = num();
        break;
      case '--montante':
        args.montante = num();
        break;
      case '--alto-viga':
        args.altoViga = num();
        break;
      case '--ancho-viga':
        args.anchoViga = num();
        break;
      case '--out':
        args.out = next;
        i++;
        break;
      case '--name':
        args.name = next;
        i++;
        break;
      default:
        if (key?.startsWith('-')) throw new Error(`Opción desconocida: ${key}`);
    }
  }
  return args;
}

function requireNumber(label: string, value: number | undefined): number {
  if (value == null || !Number.isFinite(value)) throw new Error(`Falta: ${label}`);
  return value;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const params: RackParams = {
    bahias: requireNumber('--bahias', args.bahias),
    niveles: requireNumber('--niveles', args.niveles),
    anchoBahia: requireNumber('--ancho', args.ancho),
    profundidad: requireNumber('--profundidad', args.profundidad),
    altura: requireNumber('--altura', args.altura),
    alturaPrimerNivel: args.primerNivel ?? 400,
    pasoNiveles: args.paso ?? 1200,
    seccionMontante: args.montante ?? 90,
    altoViga: args.altoViga ?? 120,
    anchoViga: args.anchoViga ?? 50,
  };

  const validation = validateRackParams(params);
  if (!validation.ok) {
    console.error('Validación fallida:');
    for (const err of validation.errors) console.error(`  - ${err}`);
    process.exitCode = 1;
    return;
  }

  const { paths, params: valid } = await generateRack(params, {
    outDir: args.out,
    basename: args.name,
  });

  console.log('Rack selectivo generado correctamente.');
  console.log(`  Bahías  : ${valid.bahias}`);
  console.log(`  Niveles : ${valid.niveles}`);
  console.log(`  Colores : montantes naranja + vigas azul`);
  console.log('Archivos:');
  console.log(`  STL : ${path.resolve(paths.stl)}`);
  console.log(`  OBJ : ${path.resolve(paths.obj)}`);
  console.log(`  GLB : ${path.resolve(paths.glb)}`);
  console.log(`  ISO : ${path.resolve(paths.isometricSvg)}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
