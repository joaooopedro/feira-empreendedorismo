"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Image, OrbitControls, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import type { Banca } from "@/lib/tipos";
import { toldo } from "@/lib/cores";

// Sala de aula de dia, vista como maquete. O three.js não lê oklch, então os tons do tema vão em sRGB.
// slop-ok: hex espelhando os tokens de globals.css para o WebGL
const SALA = {
  fundo: "#F7F8FA",
  piso: "#EEF0F3",
  parede: "#F2F4F7",
  janela: "#CFE3F7",
  moldura: "#FFFFFF",
  mesa: "#FFFFFF",
  perna: "#9AA0AE",
  tinta: "#1B1E2B",
};

// Fileiras de mesas viradas para a porta. Tela larga: 2 fileiras. Celular em pé: 2 colunas.
function posicoes(total: number, retrato: boolean): [number, number, number][] {
  const colunas = retrato ? 2 : Math.ceil(total / 2);
  const fileiras = Math.ceil(total / colunas);
  return Array.from({ length: total }, (_, i) => {
    const fileira = Math.floor(i / colunas);
    const naFileira = fileira === fileiras - 1 ? total - fileira * colunas : colunas;
    const coluna = i % colunas;
    return [(coluna - (naFileira - 1) / 2) * 3.3, 0, -3.3 + fileira * (retrato ? 3.7 : 5.4)];
  });
}

function Mesa({
  banca,
  posicao,
  selecionada,
  aoEscolher,
}: {
  banca: Banca;
  posicao: [number, number, number];
  selecionada: boolean;
  aoEscolher: (id: string) => void;
}) {
  const grupo = useRef<THREE.Group>(null);
  const [mouse, setMouse] = useState(false);
  const { cor, tinta } = toldo(banca.numero);
  const esgotou = banca.produtos.length > 0 && banca.produtos.every((p) => p.esgotado);

  useFrame((_, delta) => {
    if (!grupo.current) return;
    const alvo = selecionada ? 0.28 : mouse ? 0.12 : 0;
    grupo.current.position.y = THREE.MathUtils.damp(grupo.current.position.y, alvo, 8, delta);
  });

  return (
    <group position={posicao}>
      {/* Marca no piso quando a banca está escolhida */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.2]} visible={selecionada}>
        <ringGeometry args={[1.55, 1.7, 64]} />
        <meshBasicMaterial color={cor} />
      </mesh>

      <group
        ref={grupo}
        onClick={(e) => {
          e.stopPropagation();
          aoEscolher(banca.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setMouse(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setMouse(false);
          document.body.style.cursor = "";
        }}
      >
        {/* Tampo e pernas */}
        <RoundedBox args={[2.4, 0.08, 1.1]} radius={0.03} position={[0, 0.78, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={SALA.mesa} roughness={0.6} />
        </RoundedBox>
        {[[-1.1, -0.45], [1.1, -0.45], [-1.1, 0.45], [1.1, 0.45]].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, 0.38, z]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.76]} />
            <meshStandardMaterial color={SALA.perna} />
          </mesh>
        ))}

        {/* Toalha na cor da banca, caindo na frente */}
        <mesh position={[0, 0.5, 0.56]} castShadow>
          <boxGeometry args={[2.42, 0.6, 0.02]} />
          <meshStandardMaterial color={cor} roughness={0.85} />
        </mesh>
        <Text position={[0, 0.5, 0.58]} fontSize={0.34} color={tinta} anchorX="center" anchorY="middle" fontWeight={700}>
          {String(banca.numero)}
        </Text>

        {/* Produtos em cima da mesa: caixinhas na cor da banca */}
        {[-0.6, 0, 0.6].map((x, i) => (
          <RoundedBox key={x} args={[0.38, 0.16 + i * 0.05, 0.3]} radius={0.04} position={[x, 0.9 + i * 0.025, -0.1]} castShadow>
            <meshStandardMaterial color={i === 1 ? SALA.mesa : cor} roughness={0.7} />
          </RoundedBox>
        ))}

        {/* Placa com o nome do grupo, sempre visível */}
        {[-1.05, 1.05].map((x) => (
          <mesh key={x} position={[x, 1.45, -0.5]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.4]} />
            <meshStandardMaterial color={SALA.perna} />
          </mesh>
        ))}
        <RoundedBox args={[2.5, 0.62, 0.06]} radius={0.04} position={[0, 2.15, -0.5]} castShadow>
          <meshStandardMaterial color={esgotou ? SALA.perna : cor} roughness={0.7} />
        </RoundedBox>
        <Text
          position={[0, 2.15, -0.465]}
          fontSize={0.25}
          maxWidth={2.3}
          textAlign="center"
          color={tinta}
          anchorX="center"
          anchorY="middle"
          fontWeight={700}
        >
          {esgotou ? `${banca.nome} · esgotou` : banca.nome}
        </Text>
      </group>
    </group>
  );
}

function Sala() {
  return (
    <group>
      {/* Piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 8]} receiveShadow>
        <planeGeometry args={[26, 30]} />
        <meshStandardMaterial color={SALA.piso} roughness={0.9} />
      </mesh>
      {/* Parede do fundo com janelas */}
      <mesh position={[0, 2.5, -6]}>
        <planeGeometry args={[26, 5]} />
        <meshBasicMaterial color={SALA.parede} />
      </mesh>
      {[-7.5, -2.5, 2.5, 7.5].map((x) => (
        <group key={x} position={[x, 2.9, -5.98]}>
          <mesh>
            <planeGeometry args={[3.2, 2]} />
            <meshBasicMaterial color={SALA.moldura} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[3, 1.8]} />
            <meshBasicMaterial color={SALA.janela} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[0.06, 1.8]} />
            <meshBasicMaterial color={SALA.moldura} />
          </mesh>
        </group>
      ))}
      {/* Faixa da feira com o logo da UniAcademia */}
      <group position={[0, 4.45, -5.97]}>
        <mesh>
          <planeGeometry args={[9.6, 0.95]} />
          <meshBasicMaterial color={SALA.moldura} />
        </mesh>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- textura 3D, não é <img> */}
        <Image url="/uniacademia-selo.png" transparent scale={[3.4, 0.71]} position={[-2.75, 0, 0.01]} />
        <Text position={[2.15, 0, 0.01]} fontSize={0.36} color={SALA.tinta} anchorX="center" anchorY="middle" fontWeight={700}>
          Feira de Empreendedorismo
        </Text>
      </group>
      {/* Paredes laterais */}
      {[-12, 12].map((x) => (
        <mesh key={x} position={[x, 2.5, 8]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[30, 5]} />
          <meshStandardMaterial color={SALA.parede} />
        </mesh>
      ))}
    </group>
  );
}

// Câmera mais alta e distante no celular em pé, para caber as quatro fileiras.
function Enquadrar({ retrato }: { retrato: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useEffect(() => {
    camera.position.set(0, retrato ? 13.5 : 9.6, retrato ? 15.5 : 10.8);
    camera.fov = retrato ? 46 : 40;
    camera.updateProjectionMatrix();
  }, [camera, retrato]);
  return null;
}

function Cena({ bancas, selecionada, aoEscolher }: { bancas: Banca[]; selecionada: string | null; aoEscolher: (id: string | null) => void }) {
  const retrato = useThree((s) => s.size.width < s.size.height);
  const pos = useMemo(() => posicoes(bancas.length, retrato), [bancas.length, retrato]);
  return (
    <>
      <Enquadrar retrato={retrato} />
      {bancas.map((b, i) => (
        <Mesa key={b.id} banca={b} posicao={pos[i]} selecionada={selecionada === b.id} aoEscolher={aoEscolher} />
      ))}
      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={26}
        minPolarAngle={0.45}
        maxPolarAngle={1.2}
        minAzimuthAngle={-0.7}
        maxAzimuthAngle={0.7}
        target={retrato ? [0, 0.6, 1.4] : [0, 1.1, -0.8]}
      />
    </>
  );
}

export default function Mapa3D({
  bancas,
  selecionada,
  aoEscolher,
}: {
  bancas: Banca[];
  selecionada: string | null;
  aoEscolher: (id: string | null) => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 9.6, 10.8], fov: 40 }}
      gl={{ toneMappingExposure: 1.1 }}
      onPointerMissed={() => aoEscolher(null)}
      aria-label="Mapa 3D da sala da feira com as bancas"
    >
      <color attach="background" args={[SALA.fundo]} />
      <hemisphereLight args={["#FFFFFF", SALA.piso, 1.5]} />
      {/* Sol entrando pelas janelas */}
      <directionalLight
        position={[-6, 10, -4]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[5, 6, 10]} intensity={0.5} />

      <Sala />
      <ContactShadows position={[0, 0.01, 2]} opacity={0.35} scale={28} blur={2} far={3} />
      <Cena bancas={bancas} selecionada={selecionada} aoEscolher={aoEscolher} />
    </Canvas>
  );
}
