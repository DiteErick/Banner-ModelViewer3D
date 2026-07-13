/**
 * Iluminación de estudio para el banner de rack.
 * Intensidades moderadas para no quemar montantes/vigas.
 */
import { Environment } from '@react-three/drei';

export type StudioLightsPreset = 'structure';

type StudioConfig = {
  ambient: number;
  hemi: number;
  hemiSky: string;
  hemiGround: string;
  key: number;
  fill: number;
  top: number;
  rim: number;
  wrap: number;
  bounce: number;
  envPreset: 'warehouse';
  envIntensity: number;
  exposureHint: number;
};

const STRUCTURE: StudioConfig = {
  ambient: 0.3,
  hemi: 0.3,
  hemiSky: '#f0f3f6',
  hemiGround: '#1a1e24',
  key: 0.8,
  fill: 0.45,
  top: 0.4,
  rim: 0.32,
  wrap: 0.5,
  bounce: 0.16,
  envPreset: 'warehouse',
  envIntensity: 0.28,
  exposureHint: 0.98,
};

export function StudioLights({ preset = 'structure' }: { preset?: StudioLightsPreset }) {
  void preset;
  const c = STRUCTURE;

  return (
    <>
      <Environment preset={c.envPreset} environmentIntensity={c.envIntensity} background={false} />
      <ambientLight intensity={c.ambient} />
      <hemisphereLight args={[c.hemiSky, c.hemiGround, c.hemi]} />
      <directionalLight position={[10, 14, 9]} intensity={c.key} />
      <directionalLight position={[-12, 7, 5]} intensity={c.fill} />
      <directionalLight position={[2, 18, 3]} intensity={c.top} />
      <directionalLight position={[-3, 8, -12]} intensity={c.rim} />
      <directionalLight position={[3, 5, 14]} intensity={c.wrap} />
      <directionalLight position={[0, -10, 4]} intensity={c.bounce} />
    </>
  );
}

export function getStudioExposure(_preset: StudioLightsPreset = 'structure'): number {
  void _preset;
  return STRUCTURE.exposureHint;
}
