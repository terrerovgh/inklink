/* eslint-disable react/no-unknown-property */
import * as THREE from 'three';
import React, { useRef, useState, useEffect, memo } from 'react';
import type { ReactNode } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import {
    useFBO,
    useGLTF,
    MeshTransmissionMaterial,
    Text,
    RoundedBox
} from '@react-three/drei';
import { easing } from 'maath';

type Mode = 'lens' | 'bar' | 'cube';

export interface NavItem {
    label: string;
    link: string;
}

type ModeProps = Record<string, unknown>;

interface FluidGlassProps {
    mode?: Mode;
    navItems?: NavItem[];
    lensProps?: ModeProps;
    barProps?: ModeProps;
    cubeProps?: ModeProps;
}

export default function FluidGlass({ mode = 'bar', navItems = [], lensProps = {}, barProps = {}, cubeProps = {} }: FluidGlassProps) {
    const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens;
    const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;

    // Merge defaults with overrides
    const modeProps = { ...rawOverrides };

    return (
        <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
            {mode === 'bar' && <NavItems items={navItems} />}
            <Wrapper modeProps={modeProps}>
                {/* No scroll content for navbar mode, just the glass effect */}
            </Wrapper>
        </Canvas>
    );
}

type MeshProps = JSX.IntrinsicElements['mesh'];

interface ModeWrapperProps extends MeshProps {
    children?: ReactNode;
    glb?: string; // Made optional for fallback
    geometryKey?: string; // Made optional
    lockToBottom?: boolean;
    followPointer?: boolean;
    modeProps?: ModeProps;
}

// Reusable transmission material logic
const ModeWrapper = memo(function ModeWrapper({
    children,
    glb,
    geometryKey,
    lockToBottom = false,
    followPointer = true,
    modeProps = {},
    ...props
}: ModeWrapperProps) {
    const ref = useRef<THREE.Mesh>(null!);
    const buffer = useFBO();
    const { viewport: vp } = useThree();
    const [scene] = useState<THREE.Scene>(() => new THREE.Scene());

    // Logic for procedural fallback vs GLTF
    const { nodes } = glb ? useGLTF(glb) as any : { nodes: {} };

    useFrame((state, delta) => {
        const { gl, camera, pointer, viewport } = state;
        const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

        const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
        // Modified Y calculation for navbar position (bottom center)
        const destY = lockToBottom ? -v.height / 2 + 1.5 : followPointer ? (pointer.y * v.height) / 2 : 0;

        easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

        if ((modeProps as { scale?: number }).scale == null) {
            // Manual scale logic if not provided
            ref.current.scale.setScalar(0.15);
        }

        gl.setRenderTarget(buffer);
        gl.setClearColor(0x000000, 0); // Transparent clear
        gl.render(scene, camera);
        gl.setRenderTarget(null);
    });

    const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps as {
        scale?: number;
        ior?: number;
        thickness?: number;
        anisotropy?: number;
        chromaticAberration?: number;
        [key: string]: unknown;
    };

    const getGeometry = () => {
        if (glb && geometryKey && nodes[geometryKey]) {
            return (nodes[geometryKey] as THREE.Mesh).geometry;
        }
        // Fallback creates a rounded box if no GLB provided
        return undefined;
    };

    const geometry = getGeometry();

    return (
        <>
            {createPortal(children, scene)}
            {/* Background Plane for Portal - transparent for this use case */}

            <mesh
                ref={ref}
                scale={scale ?? 0.15}
                rotation-x={Math.PI / 2}
                geometry={geometry}
                {...props}
            >
                {!geometry && <RoundedBox args={[60, 10, 5]} radius={1} smoothness={4} />}

                <MeshTransmissionMaterial
                    buffer={buffer.texture}
                    ior={ior ?? 1.15}
                    thickness={thickness ?? 5}
                    anisotropy={anisotropy ?? 0.01}
                    chromaticAberration={chromaticAberration ?? 0.1}
                    background={new THREE.Color('transparent')}
                    {...(typeof extraMat === 'object' && extraMat !== null ? extraMat : {})}
                />
            </mesh>
        </>
    );
});

function Lens({ modeProps, ...p }: { modeProps?: ModeProps } & MeshProps) {
    // Fallback to procedural shape if GLB missing
    return <ModeWrapper followPointer modeProps={modeProps} {...p} />;
}

function Cube({ modeProps, ...p }: { modeProps?: ModeProps } & MeshProps) {
    return <ModeWrapper followPointer modeProps={modeProps} {...p} />;
}

function Bar({ modeProps = {}, ...p }: { modeProps?: ModeProps } & MeshProps) {
    const defaultMat = {
        transmission: 0.95,
        roughness: 0.1,
        thickness: 10,
        ior: 1.15,
        color: '#ffffff',
        attenuationColor: '#ffffff',
        attenuationDistance: 0.25
    };

    // Using procedural fallback (no GLB path passed)
    return (
        <ModeWrapper
            lockToBottom
            followPointer={false}
            modeProps={{ ...defaultMat, ...modeProps }}
            {...p}
        />
    );
}

function NavItems({ items }: { items: NavItem[] }) {
    const group = useRef<THREE.Group>(null!);
    const { viewport, camera } = useThree();

    const DEVICE = {
        mobile: { max: 639, spacing: 1.5, fontSize: 0.4 }, // Adjusted for 3D units
        tablet: { max: 1023, spacing: 2.0, fontSize: 0.6 },
        desktop: { max: Infinity, spacing: 2.5, fontSize: 0.7 }
    };

    const getDevice = () => {
        if (typeof window === 'undefined') return 'desktop';
        const w = window.innerWidth;
        return w <= DEVICE.mobile.max ? 'mobile' : w <= DEVICE.tablet.max ? 'tablet' : 'desktop';
    };

    const [device, setDevice] = useState<keyof typeof DEVICE>(getDevice());

    useEffect(() => {
        const onResize = () => setDevice(getDevice());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const { spacing, fontSize } = DEVICE[device];

    useFrame(() => {
        if (!group.current) return;
        const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
        // Adjust position to sit inside the glass bar
        group.current.position.set(0, -v.height / 2 + 1.5, 15.1);

        group.current.children.forEach((child, i) => {
            child.position.x = (i - (items.length - 1) / 2) * spacing;
        });
    });

    const handleNavigate = (link: string) => {
        if (!link) return;
        window.location.href = link;
    };

    return (
        <group ref={group} renderOrder={10}>
            {items.map(({ label, link }) => (
                <Text
                    key={label}
                    fontSize={fontSize}
                    color="black" // Dark text for contrast against glass
                    anchorX="center"
                    anchorY="middle"
                    fillOpacity={0.8}
                    renderOrder={11} // Render on top of glass
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(link);
                    }}
                    onPointerOver={() => {
                        if (document.body) document.body.style.cursor = 'pointer';
                    }}
                    onPointerOut={() => {
                        if (document.body) document.body.style.cursor = 'auto';
                    }}
                >
                    {label}
                </Text>
            ))}
        </group>
    );
}
