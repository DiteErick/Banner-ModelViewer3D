import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { FC } from 'react';
import { Canvas, useThree, invalidate } from '@react-three/fiber';
import { TrackballControls } from '@react-three/drei';
import * as THREE from 'three';
import { buildRackGroup } from '../rack';
import type { RackParams } from '../rack/types';
import { getStudioExposure, StudioLights } from './StudioLights';

export type RackViewerProps = {
  params: RackParams;
  width?: number | string;
  height?: number | string;
  defaultZoom?: number;
  defaultRotationX?: number;
  defaultRotationY?: number;
  autoOscillate?: boolean;
  oscillateDegrees?: number;
  oscillateSpeed?: number;
};

const deg2rad = (d: number) => (d * Math.PI) / 180;

function getFitDistance(radius: number, camera: THREE.Camera) {
  const persp = camera as THREE.PerspectiveCamera;
  if (!persp.isPerspectiveCamera || radius <= 0) return 1;
  const vFov = (persp.fov * Math.PI) / 180;
  return radius / Math.tan(vFov / 2);
}

const RackScene: FC<{
  params: RackParams;
  defaultZoom: number;
  initPitch: number;
  initYaw: number;
  autoOscillate: boolean;
  oscillateDegrees: number;
  oscillateSpeed: number;
}> = ({
  params,
  defaultZoom,
  initPitch,
  initYaw,
  autoOscillate,
  oscillateDegrees,
  oscillateSpeed,
}) => {
  const { camera, controls } = useThree();
  const pivot = useRef<THREE.Group>(null!);
  const phase = useRef(0);
  const framing = useRef({ distance: 1, min: 0.5, max: 2 });

  const rack = useMemo(() => {
    const { group } = buildRackGroup(params);
    // Centrar en origen
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    group.position.sub(center);
    return group;
  }, [params]);

  useEffect(() => {
    return () => {
      rack.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      });
    };
  }, [rack]);

  useLayoutEffect(() => {
    pivot.current.rotation.set(initPitch, initYaw, 0);
    pivot.current.updateWorldMatrix(true, true);

    const sphere = new THREE.Box3().setFromObject(pivot.current).getBoundingSphere(new THREE.Sphere());
    const fit = getFitDistance(sphere.radius || 1, camera);
    const zoom = THREE.MathUtils.clamp(defaultZoom, 0.5, 3);
    const distance = fit * zoom;
    // Sin tope práctico de zoom (solo rack).
    framing.current = { distance, min: fit * 0.05, max: fit * 25 };

    const dir = new THREE.Vector3(0.85, 0.45, 0.55).normalize();
    camera.position.copy(dir.multiplyScalar(distance));
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const persp = camera as THREE.PerspectiveCamera;
      persp.near = Math.max(distance / 100, 0.01);
      persp.far = Math.max(distance * 100, 50);
      persp.updateProjectionMatrix();
    }

    const orbit = controls as {
      target: THREE.Vector3;
      minDistance: number;
      maxDistance: number;
      update: () => void;
      target0?: THREE.Vector3;
      position0?: THREE.Vector3;
      up0?: THREE.Vector3;
      reset?: () => void;
    } | null;

    if (orbit) {
      orbit.target.set(0, 0, 0);
      orbit.minDistance = framing.current.min;
      orbit.maxDistance = framing.current.max;
      if (orbit.target0 && orbit.position0 && orbit.up0 && orbit.reset) {
        orbit.target0.set(0, 0, 0);
        orbit.position0.copy(camera.position);
        orbit.up0.set(0, 1, 0);
        orbit.reset();
      } else {
        orbit.update();
      }
    }
    invalidate();
  }, [rack, camera, controls, defaultZoom, initPitch, initYaw]);

  useEffect(() => {
    let raf = 0;
    if (!autoOscillate) return;
    const tick = () => {
      phase.current += 0.016 * oscillateSpeed;
      pivot.current.rotation.y = initYaw + Math.sin(phase.current) * deg2rad(oscillateDegrees);
      invalidate();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoOscillate, oscillateDegrees, oscillateSpeed, initYaw]);

  return (
    <>
      <StudioLights preset="structure" />
      <group ref={pivot}>
        <primitive object={rack} />
      </group>
      <TrackballControls
        makeDefault
        noPan
        rotateSpeed={1.1}
        zoomSpeed={0.55}
        dynamicDampingFactor={0.08}
        minDistance={framing.current.min}
        maxDistance={framing.current.max}
        onChange={() => invalidate()}
      />
    </>
  );
};

const RackViewer: FC<RackViewerProps> = ({
  params,
  width = '100%',
  height = '100%',
  defaultZoom = 1.45,
  defaultRotationX = 32,
  defaultRotationY = -28,
  autoOscillate = true,
  oscillateDegrees = 8,
  oscillateSpeed = 0.35,
}) => {
  const initYaw = deg2rad(defaultRotationX);
  const initPitch = deg2rad(defaultRotationY);

  return (
    <div style={{ width, height }} className="relative">
      <Canvas
        frameloop="demand"
        gl={{ alpha: true, antialias: true }}
        camera={{ fov: 40, position: [2, 1.2, 1.5], near: 0.01, far: 50000 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = getStudioExposure('structure');
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        style={{ background: 'transparent', touchAction: 'pan-y pinch-zoom' }}
      >
        <Suspense fallback={null}>
          <RackScene
            params={params}
            defaultZoom={defaultZoom}
            initPitch={initPitch}
            initYaw={initYaw}
            autoOscillate={autoOscillate}
            oscillateDegrees={oscillateDegrees}
            oscillateSpeed={oscillateSpeed}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default RackViewer;
