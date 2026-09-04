"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ContactShadows,
  Environment,
  Html,
  MeshReflectorMaterial,
  OrbitControls,
  PerspectiveCamera,
  Sparkles,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { Color, Vector3 } from "three";
import { Check, CircleDot, Eye, Paintbrush, RotateCw, Sofa, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VehicleColorOption, WheelOption } from "@/features/cars/detail/car-detail-data";

type ViewMode = "exterior" | "interior";

export type CarViewerConfig = {
  modelUrl?: string;
  environmentUrl?: string;
  fallbackGeometry: "suv" | "sedan" | "crossover" | "wagon";
  defaultColor: string;
  colors: VehicleColorOption[];
  wheels: WheelOption[];
};

type Car3DViewerProps = {
  config: CarViewerConfig;
  label: string;
};

export function Car3DViewer({ config, label }: Car3DViewerProps) {
  const [selectedColor, setSelectedColor] = useState(config.defaultColor);
  const [selectedWheel, setSelectedWheel] = useState(config.wheels[0]?.finish ?? "#111827");
  const [viewMode, setViewMode] = useState<ViewMode>("exterior");
  const [transitionKey, setTransitionKey] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (config.modelUrl) {
      useGLTF.preload(config.modelUrl);
    }
  }, [config.modelUrl]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setTransitionKey((current) => current + 1);
  };

  const handleWheelChange = (finish: string) => {
    setSelectedWheel(finish);
    setTransitionKey((current) => current + 1);
  };

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setTransitionKey((current) => current + 1);
  };

  return (
    <div className="relative min-h-[680px] overflow-hidden rounded-lg border border-white/70 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.98),rgba(226,232,240,0.72)_44%,rgba(203,213,225,0.55)_100%)] shadow-[0_36px_120px_rgba(15,23,42,0.18)]">
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_20%,rgba(255,255,255,0.75)_48%,rgba(255,255,255,0)_72%)] opacity-50" />
      <Canvas
        camera={{ fov: 36, position: [5.6, 2.3, 5.6] }}
        dpr={[1, 1.55]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        shadows
      >
        <PerspectiveCamera makeDefault fov={36} position={[5.6, 2.3, 5.6]} />
        <color args={["#f8fafc"]} attach="background" />
        <fog args={["#e2e8f0", 9, 18]} attach="fog" />
        <ambientLight intensity={0.72} />
        <directionalLight castShadow intensity={2.2} position={[4.8, 5.5, 3.2]} shadow-mapSize={[1024, 1024]} />
        <spotLight
          angle={0.42}
          castShadow
          intensity={2.8}
          penumbra={0.85}
          position={[-4, 5, 6]}
          shadow-mapSize={[1024, 1024]}
        />
        <Suspense fallback={<ViewerLoading label={label} />}>
          <SceneLighting environmentUrl={config.environmentUrl} />
          <CameraRig transitionKey={transitionKey} viewMode={viewMode} />
          <VehicleModel
            color={selectedColor}
            geometry={config.fallbackGeometry}
            interior={viewMode === "interior"}
            modelUrl={config.modelUrl}
            reducedMotion={Boolean(prefersReducedMotion)}
            wheelFinish={selectedWheel}
          />
          <ReflectiveStage />
        </Suspense>
        <OrbitControls
          autoRotate={!prefersReducedMotion && viewMode === "exterior"}
          autoRotateSpeed={0.55}
          enableDamping
          enablePan={false}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2.08}
          minDistance={3.15}
          minPolarAngle={Math.PI / 4.4}
          target={viewMode === "interior" ? [0, 0.82, 0.2] : [0, 0.24, 0]}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-6 top-6 flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-md border border-white/70 bg-white/62 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-xl">
          <span className="block text-xs font-medium uppercase tracking-[0.22em] text-slate-500">3D configurator</span>
          {label}
        </div>
        <div className="rounded-full border border-white/70 bg-white/62 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm backdrop-blur-xl">
          GLTF ready
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="rounded-lg border border-white/70 bg-white/72 p-3 shadow-sm backdrop-blur-2xl">
          <div className="flex flex-wrap gap-2">
            <Button
              className={cn("bg-white/80 text-slate-950 hover:bg-white", viewMode === "exterior" && "ring-2 ring-slate-950/12")}
              onClick={() => handleModeChange("exterior")}
              size="sm"
              type="button"
              variant="glass"
            >
              <Eye className="mr-2 size-4" />
              Exterior
            </Button>
            <Button
              className={cn("bg-white/80 text-slate-950 hover:bg-white", viewMode === "interior" && "ring-2 ring-slate-950/12")}
              onClick={() => handleModeChange("interior")}
              size="sm"
              type="button"
              variant="glass"
            >
              <Sofa className="mr-2 size-4" />
              Interior
            </Button>
            <div className="flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              <RotateCw className="size-4" />
              360
            </div>
            <div className="flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              <ZoomIn className="size-4" />
              Zoom
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <OptionStrip icon={<Paintbrush className="size-4" />} label="Paint">
              {config.colors.map((color) => (
                <button
                  aria-label={`Use ${color.name}`}
                  className={cn(
                    "grid size-9 place-items-center rounded-full border border-white shadow-sm transition hover:scale-105",
                    selectedColor === color.value && "ring-2 ring-slate-950 ring-offset-2 ring-offset-white",
                  )}
                  key={color.name}
                  onClick={() => handleColorChange(color.value)}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  type="button"
                >
                  {selectedColor === color.value ? <Check className="size-4 text-white mix-blend-difference" /> : null}
                </button>
              ))}
            </OptionStrip>

            <OptionStrip icon={<CircleDot className="size-4" />} label="Wheels">
              {config.wheels.map((wheel) => (
                <button
                  className={cn(
                    "flex items-center gap-2 rounded-md border border-slate-200 bg-white/72 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white",
                    selectedWheel === wheel.finish && "border-slate-950 text-slate-950",
                  )}
                  key={wheel.name}
                  onClick={() => handleWheelChange(wheel.finish)}
                  type="button"
                >
                  <span className="size-3 rounded-full" style={{ backgroundColor: wheel.finish }} />
                  {wheel.name}
                </button>
              ))}
            </OptionStrip>
          </div>
        </div>

        <div className="rounded-lg border border-white/70 bg-slate-950/92 p-4 text-white shadow-sm backdrop-blur-2xl lg:w-64">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/48">Render stack</div>
          <div className="mt-3 space-y-2 text-sm text-white/78">
            <div>HDR studio lighting</div>
            <div>Dynamic soft shadows</div>
            <div>Progressive model loading</div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          animate={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 bg-white/42 backdrop-blur-[2px]"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0.5 }}
          key={transitionKey}
          transition={{ duration: 0.42, ease: "easeOut" }}
        />
      </AnimatePresence>
    </div>
  );
}

function OptionStrip({
  children,
  icon,
  label,
}: {
  children: ReactNode;
  icon: ReactNode;
  label: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {icon}
        {label}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ViewerLoading({ label }: { label: string }) {
  return (
    <Html center>
      <div className="rounded-full border border-white/70 bg-white/78 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl">
        Loading {label}
      </div>
    </Html>
  );
}

function SceneLighting({ environmentUrl }: { environmentUrl?: string | undefined }) {
  return environmentUrl ? <Environment background={false} files={environmentUrl} /> : <Environment preset="city" />;
}

function CameraRig({ transitionKey, viewMode }: { transitionKey: number; viewMode: ViewMode }) {
  const { camera } = useThree();
  const target = useMemo(
    () => (viewMode === "interior" ? new Vector3(0.05, 1.08, 0.28) : new Vector3(5.6, 2.3, 5.6)),
    [viewMode],
  );
  const lookAt = useMemo(
    () => (viewMode === "interior" ? new Vector3(0, 0.86, -0.2) : new Vector3(0, 0.25, 0)),
    [viewMode],
  );

  useEffect(() => {
    camera.position.copy(target);
    camera.lookAt(lookAt);
  }, [camera, lookAt, target, transitionKey]);

  useFrame((_state, delta) => {
    camera.position.lerp(target, 1 - Math.pow(0.002, delta));
    camera.lookAt(lookAt);
  });

  return null;
}

function VehicleModel({
  color,
  geometry,
  interior,
  modelUrl,
  reducedMotion,
  wheelFinish,
}: {
  color: string;
  geometry: CarViewerConfig["fallbackGeometry"];
  interior: boolean;
  modelUrl?: string | undefined;
  reducedMotion: boolean;
  wheelFinish: string;
}) {
  if (modelUrl) {
    return <LoadedGltfModel color={color} interior={interior} url={modelUrl} wheelFinish={wheelFinish} />;
  }

  return (
    <ProceduralVehicle
      color={color}
      geometry={geometry}
      interior={interior}
      reducedMotion={reducedMotion}
      wheelFinish={wheelFinish}
    />
  );
}

function LoadedGltfModel({
  color,
  interior,
  url,
  wheelFinish,
}: {
  color: string;
  interior: boolean;
  url: string;
  wheelFinish: string;
}) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => {
    const nextScene = gltf.scene.clone(true);
    nextScene.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) {
        return;
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const material = mesh.material as MeshStandardMaterial | MeshStandardMaterial[];
      const materials = Array.isArray(material) ? material : [material];
      const nextMaterials = materials.map((entry) => {
        const nextMaterial = entry.clone();
        const materialName = `${entry.name} ${mesh.name}`.toLowerCase();
        if (materialName.includes("body") || materialName.includes("paint")) {
          nextMaterial.color = new Color(color);
          nextMaterial.metalness = 0.72;
          nextMaterial.roughness = 0.24;
          nextMaterial.transparent = interior;
          nextMaterial.opacity = interior ? 0.2 : 1;
        }
        if (materialName.includes("wheel") || materialName.includes("rim")) {
          nextMaterial.color = new Color(wheelFinish);
          nextMaterial.metalness = 0.86;
          nextMaterial.roughness = 0.22;
        }
        return nextMaterial;
      });
      const firstMaterial = nextMaterials[0];
      if (firstMaterial) {
        mesh.material = Array.isArray(material) ? nextMaterials : firstMaterial;
      }
    });

    return nextScene;
  }, [color, gltf.scene, interior, wheelFinish]);

  return <primitive object={scene} position={[0, -0.42, 0]} rotation={[0, Math.PI, 0]} scale={1.82} />;
}

function ProceduralVehicle({
  color,
  geometry,
  interior,
  reducedMotion,
  wheelFinish,
}: {
  color: string;
  geometry: CarViewerConfig["fallbackGeometry"];
  interior: boolean;
  reducedMotion: boolean;
  wheelFinish: string;
}) {
  const groupRef = useRef<Group>(null);
  const dimensions = getVehicleDimensions(geometry);

  useFrame((_state, delta) => {
    if (groupRef.current && !reducedMotion) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.0012) * 0.018;
      groupRef.current.rotation.y += delta * 0.012;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.02, 0]}>
      <Sparkles color="#94a3b8" count={28} opacity={0.42} scale={[7, 2.8, 4]} size={1.2} speed={0.25} />
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[dimensions.length, dimensions.bodyHeight, dimensions.width]} />
        <meshStandardMaterial
          color={color}
          metalness={0.72}
          opacity={interior ? 0.22 : 1}
          roughness={0.2}
          transparent={interior}
        />
      </mesh>
      <mesh castShadow position={[dimensions.cabinOffset, 0.74, 0]}>
        <boxGeometry args={[dimensions.cabinLength, dimensions.cabinHeight, dimensions.width * 0.76]} />
        <meshPhysicalMaterial
          clearcoat={0.8}
          color="#dbeafe"
          metalness={0.12}
          opacity={interior ? 0.18 : 0.48}
          roughness={0.08}
          transparent
          transmission={0.2}
        />
      </mesh>
      <mesh castShadow position={[0.2, 0.46, -dimensions.width / 2 - 0.02]}>
        <boxGeometry args={[dimensions.length * 0.62, 0.08, 0.04]} />
        <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.5} />
      </mesh>
      <mesh castShadow position={[dimensions.length / 2 + 0.02, 0.22, 0]}>
        <boxGeometry args={[0.04, 0.14, dimensions.width * 0.58]} />
        <meshStandardMaterial color="#f8fafc" emissive="#ffffff" emissiveIntensity={1.4} />
      </mesh>
      <mesh castShadow position={[-dimensions.length / 2 - 0.02, 0.24, 0]}>
        <boxGeometry args={[0.04, 0.12, dimensions.width * 0.54]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.1} />
      </mesh>

      {[-1, 1].map((xDirection) =>
        [-1, 1].map((zDirection) => (
          <Wheel
            key={`${xDirection}-${zDirection}`}
            position={[
              xDirection * (dimensions.length * 0.34),
              -0.24,
              zDirection * (dimensions.width * 0.54),
            ]}
            wheelFinish={wheelFinish}
          />
        )),
      )}

      {interior ? <Interior geometry={geometry} /> : null}
    </group>
  );
}

function Wheel({ position, wheelFinish }: { position: [number, number, number]; wheelFinish: string }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.34, 48]} />
        <meshStandardMaterial color="#09090b" metalness={0.4} roughness={0.32} />
      </mesh>
      <mesh castShadow position={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.27, 0.27, 0.04, 48]} />
        <meshStandardMaterial color={wheelFinish} metalness={0.88} roughness={0.18} />
      </mesh>
    </group>
  );
}

function Interior({ geometry }: { geometry: CarViewerConfig["fallbackGeometry"] }) {
  const secondRow = geometry === "suv" || geometry === "crossover" || geometry === "wagon";

  return (
    <group position={[0.15, 0.42, 0]}>
      <mesh castShadow position={[0.55, 0.18, -0.42]}>
        <boxGeometry args={[0.5, 0.54, 0.42]} />
        <meshStandardMaterial color="#111827" roughness={0.36} />
      </mesh>
      <mesh castShadow position={[0.55, 0.18, 0.42]}>
        <boxGeometry args={[0.5, 0.54, 0.42]} />
        <meshStandardMaterial color="#111827" roughness={0.36} />
      </mesh>
      {secondRow ? (
        <>
          <mesh castShadow position={[-0.42, 0.18, -0.42]}>
            <boxGeometry args={[0.5, 0.5, 0.42]} />
            <meshStandardMaterial color="#1f2937" roughness={0.36} />
          </mesh>
          <mesh castShadow position={[-0.42, 0.18, 0.42]}>
            <boxGeometry args={[0.5, 0.5, 0.42]} />
            <meshStandardMaterial color="#1f2937" roughness={0.36} />
          </mesh>
        </>
      ) : null}
      <mesh castShadow position={[1.05, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.38, 1.12]} />
        <meshStandardMaterial color="#020617" roughness={0.22} />
      </mesh>
      <mesh castShadow position={[1.22, 0.42, -0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.018, 12, 48]} />
        <meshStandardMaterial color="#111827" metalness={0.4} roughness={0.2} />
      </mesh>
      <mesh position={[1.12, 0.54, 0.28]}>
        <boxGeometry args={[0.04, 0.28, 0.52]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function ReflectiveStage() {
  return (
    <>
      <mesh receiveShadow position={[0, -0.68, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 10]} />
        <MeshReflectorMaterial
          blur={[420, 120]}
          color="#e5e7eb"
          depthScale={0.22}
          metalness={0.16}
          mirror={0.42}
          mixBlur={1.2}
          mixStrength={0.78}
          resolution={512}
          roughness={0.42}
        />
      </mesh>
      <ContactShadows blur={2.4} far={4.8} opacity={0.42} position={[0, -0.65, 0]} resolution={512} scale={7} />
    </>
  );
}

function getVehicleDimensions(geometry: CarViewerConfig["fallbackGeometry"]) {
  if (geometry === "sedan") {
    return {
      bodyHeight: 0.46,
      cabinHeight: 0.58,
      cabinLength: 1.8,
      cabinOffset: -0.18,
      length: 4.72,
      width: 1.78,
    };
  }

  if (geometry === "wagon") {
    return {
      bodyHeight: 0.52,
      cabinHeight: 0.64,
      cabinLength: 2.36,
      cabinOffset: -0.28,
      length: 4.88,
      width: 1.84,
    };
  }

  if (geometry === "crossover") {
    return {
      bodyHeight: 0.55,
      cabinHeight: 0.68,
      cabinLength: 2.14,
      cabinOffset: -0.2,
      length: 4.72,
      width: 1.88,
    };
  }

  return {
    bodyHeight: 0.62,
    cabinHeight: 0.72,
    cabinLength: 2.22,
    cabinOffset: -0.2,
    length: 5.08,
    width: 1.96,
  };
}
