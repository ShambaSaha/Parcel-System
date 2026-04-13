"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, useGLTF } from "@react-three/drei";
import { useEffect } from "react";

/* =========================
   Truck 3D Model
========================= */

const CONTAINER = {
  length: 12,
  height: 5,
  width: 5
};

function TruckModel() {
  const { scene } = useGLTF("/models/truck.glb");


  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true;
        child.material.opacity = 0.6; // 👈 adjust (0.3 – 0.6 recommended)
        child.material.depthWrite = false; // prevents z-fighting
      }
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      scale={[2, 3, 3.25]}    // match container footprint
      rotation={[0, Math.PI / 2, 0]} // sideways
      position={[
        4,
        -4, // BELOW container
        0
      ]}
    />
  );
}




/* =========================
   Parcel Box
========================= */

const ParcelBox = ({ position, size }) => (
  <mesh position={position}>
    <boxGeometry args={size} />
    <meshStandardMaterial
      color="#ff0000"
      emissive="#ff0000"
      emissiveIntensity={0.35}
      metalness={0.1}
      roughness={0.4}
    />
  </mesh>
);


/* =========================
   Container + Parcels
========================= */

const TruckContainer = ({ parcels }) => {
  return (
    <>
      {/* 🚛 Cargo container */}
      <Box
        args={[CONTAINER.length-2, CONTAINER.height, CONTAINER.width]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          transparent
          opacity={0.15}
          wireframe
        />
      </Box>


      {/* 📦 Parcels inside */}
      {parcels
        ?.filter(p => p?.position && p?.size)
        .map((p, i) => (
          <ParcelBox key={i} position={p.position} size={p.size} />
        ))}

    </>
  );
};


/* =========================
   Main Scene
========================= */

export default function TruckVolume3D({ parcels }) {
  return (
    <div style={{ height: "450px", marginBottom: "20px" }}>
      <Canvas camera={{ position: [22, 12, 22], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 15, 10]} intensity={1} />

        {/* 🔽 Truck model FIRST */}
        <TruckModel />

        {/* 🔼 Cargo + parcels ABOVE */}
        <TruckContainer parcels={parcels} />

        <OrbitControls />
      </Canvas>

    </div>
  );
}
