import React from 'react';
// @ts-ignore
import FluidGlass from '../ui/FluidGlass';

export default function FloatingDock() {
    const navItems = [
        { label: 'Home', link: '/' },
        { label: 'Explore', link: '/explore' },
        { label: 'Artists', link: '/artists' },
        { label: 'Studios', link: '/studios' },
        { label: 'Blog', link: '/blog' },
        { label: 'Login', link: '/auth/login' }
    ];

    return (
        <div style={{ height: '150px', width: '100%', position: 'fixed', bottom: 0, left: 0, zIndex: 100, pointerEvents: 'none' }}>
            {/* The Canvas itself handles pointer events for mapped meshes */}
            <div className="w-full h-full pointer-events-auto">
                <FluidGlass
                    mode="bar"
                    navItems={navItems}
                    barProps={{
                        scale: 0.12,
                        ior: 1.25,
                        thickness: 10,
                        chromaticAberration: 0.1,
                        anisotropy: 0.03
                    }}
                />
            </div>
        </div>
    );
}
