import React, { useEffect, useState, useRef, useCallback } from "react";
import Map, { NavigationControl, Marker, Popup, useMap, type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from "../../../lib/supabase";
import maplibregl from 'maplibre-gl';

interface LocationState {
    lat: number;
    lng: number;
    city: string;
}

interface MapItem {
    id: string;
    lat: number;
    lng: number;
    title: string;
    type: 'studio' | 'artist';
    slug?: string;
    username?: string;
    avatar_url?: string | null;
    is_premium?: boolean;
}

interface MapWidgetProps {
    id?: string;
}

export default function MapWidget({ id = "map-widget" }: MapWidgetProps) {
    const [location, setLocation] = useState<LocationState | null>(null);
    const [mapItems, setMapItems] = useState<MapItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'studio' | 'artist'>('all');
    const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const mapRef = useRef<MapRef>(null);

    // Initial view state: Global view
    const [viewState, setViewState] = useState({
        longitude: -40,
        latitude: 20,
        zoom: 1.5,
        pitch: 0,
        bearing: 0
    });

    // Inject custom styles
    useEffect(() => {
        const styleId = 'map-popup-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                .maplibregl-popup-content {
                    background: transparent !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                }
                .maplibregl-popup-tip {
                    border-top-color: #09090b !important;
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    const fetchItems = useCallback(async () => {
        try {
            const { data: studiosData } = await supabase.from('studios').select('*');
            const { data: artistsData } = await supabase.from('profiles').select('*').eq('role', 'artist');

            const items: MapItem[] = [];

            if (studiosData) {
                studiosData.forEach((studio: any) => {
                    if (studio.location && studio.location.coordinates) {
                        const [lng, lat] = studio.location.coordinates;
                        items.push({
                            id: studio.id,
                            lat,
                            lng,
                            title: studio.name,
                            type: 'studio',
                            slug: studio.slug,
                            avatar_url: studio.logo_url,
                            is_premium: studio.is_premium
                        });
                    }
                });
            }

            if (artistsData) {
                artistsData.forEach((artist: any) => {
                    if (artist.location && artist.location.coordinates) {
                        const [lng, lat] = artist.location.coordinates;
                        items.push({
                            id: artist.id,
                            lat,
                            lng,
                            title: artist.full_name || artist.username || 'Artist',
                            type: 'artist',
                            username: artist.username,
                            avatar_url: artist.avatar_url
                        });
                    }
                });
            }
            setMapItems(items);
        } catch (err) {
            console.error("Error fetching map items:", err);
        }
    }, []);

    useEffect(() => {
        const initLocation = async () => {
            setLoading(true);
            try {
                // Check session storage
                if (typeof window !== 'undefined') {
                    const cached = sessionStorage.getItem('user_location');
                    if (cached) {
                        try {
                            const parsed = JSON.parse(cached);
                            setLocation(parsed);
                            fetchItems();
                            // If we have location, fly to it immediately after a slight delay for effect
                            setTimeout(() => {
                                mapRef.current?.flyTo({
                                    center: [parsed.lng, parsed.lat],
                                    zoom: 13,
                                    duration: 3000,
                                    essential: true
                                });
                            }, 1000);
                            setLoading(false);
                            return;
                        } catch (e) {
                            sessionStorage.removeItem('user_location');
                        }
                    }
                }

                const locationRes = await fetch('https://ipapi.co/json/');
                if (!locationRes.ok) throw new Error('IP API failed');

                const locationData = await locationRes.json();
                const userLoc: LocationState = {
                    lat: locationData.latitude || 23.1136,
                    lng: locationData.longitude || -82.3666,
                    city: locationData.city || 'Havana'
                };

                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('user_location', JSON.stringify(userLoc));
                }
                setLocation(userLoc);
                fetchItems();

                // Fly to location
                setTimeout(() => {
                    mapRef.current?.flyTo({
                        center: [userLoc.lng, userLoc.lat],
                        zoom: 13,
                        duration: 7000,
                        essential: true
                    });
                }, 1500);

            } catch (err) {
                console.error("Error initializing location:", err);
                const fallback = { lat: 23.1136, lng: -82.3666, city: 'Havana' };
                setLocation(fallback);
                fetchItems();
            } finally {
                setLoading(false);
            }
        };
        initLocation();
    }, [fetchItems]);

    // Toggle body class for global styling (hiding hero text)
    useEffect(() => {
        if (typeof document !== 'undefined') {
            if (isExpanded) {
                document.body.classList.add('hero-map-active');
            } else {
                document.body.classList.remove('hero-map-active');
            }
        }
        return () => {
            if (typeof document !== 'undefined') {
                document.body.classList.remove('hero-map-active');
            }
        };
    }, [isExpanded]);

    const handleExpand = () => {
        if (!isExpanded) {
            setIsExpanded(true);
            window.history.pushState({ path: '/map' }, '', '/map');
            setTimeout(() => {
                mapRef.current?.resize();
                // Fly to user location or default when entering map mode for better UX?
                // For now, keeping current view is fine, or maybe a slight zoom in.
            }, 100);
        }
    };

    // Listen for escape key to close expanded view
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isExpanded) {
                setIsExpanded(false);
                window.history.pushState({ path: '/' }, '', '/');
                setTimeout(() => {
                    mapRef.current?.resize();
                }, 100);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isExpanded]);

    const filteredItems = mapItems.filter(item => filter === 'all' || item.type === filter);

    return (
        <div
            id={id}
            onClick={!isExpanded ? handleExpand : undefined}
            className={`
                transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-zinc-950 overflow-hidden
                ${isExpanded
                    ? 'fixed inset-0 z-50 rounded-none'
                    : 'relative w-full h-full rounded-2xl border-none shadow-none cursor-zoom-in group'
                }
            `}
        >
            {/* Hint for non-expanded state */}
            {!isExpanded && !loading && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/50 text-xs font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-[1000]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    Click to Explore Map
                </div>
            )}

            {/* Map Controls Overlay - Visible ONLY when expanded */}
            <div className={`absolute top-6 left-6 right-6 flex items-center justify-between z-[60] pointer-events-none transition-all duration-500 ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="flex p-1 bg-zinc-950/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
                        <button
                            onClick={(e) => { e.stopPropagation(); setFilter('all'); }}
                            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${filter === 'all' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setFilter('studio'); }}
                            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${filter === 'studio' ? 'bg-blue-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Estudios
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setFilter('artist'); }}
                            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${filter === 'artist' ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Artistas
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(false);
                            window.history.pushState({ path: '/' }, '', '/');
                            setTimeout(() => mapRef.current?.resize(), 100);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 backdrop-blur-xl rounded-xl border border-red-500/20 transition-all shadow-2xl group"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest">Exit Map</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>

            <Map
                ref={mapRef}
                initialViewState={viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                attributionControl={false}
                projection="globe"
                reuseMaps
                dragPan={isExpanded}
                scrollZoom={isExpanded}
                doubleClickZoom={isExpanded}
                boxZoom={isExpanded}
                keyboard={isExpanded}
            >
                {/* User Location Marker */}
                {location && (
                    <Marker longitude={location.lng} latitude={location.lat} anchor="center">
                        <div className="relative flex items-center justify-center w-6 h-6">
                            <div className="absolute w-full h-full bg-blue-500 rounded-full opacity-30 animate-ping"></div>
                            <div className="relative w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></div>
                        </div>
                    </Marker>
                )}

                {/* Items Markers - ONLY SHOW WHEN EXPANDED OR CLOSE? Maybe show always but only clickable when expanded? 
                    User said "al cambiar... aparecen las opciones". Markers act as content.
                    Let's show markers always as they look cool on the globe.
                */}
                {filteredItems.map(item => (
                    <Marker
                        key={item.id}
                        longitude={item.lng}
                        latitude={item.lat}
                        anchor="bottom"
                        onClick={e => {
                            e.originalEvent.stopPropagation();
                            if (isExpanded) {
                                setSelectedItem(item);
                            } else {
                                handleExpand(); // Click marker to expand if not expanded
                            }
                        }}
                    >
                        <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200 cursor-pointer ${item.type === 'studio' ? 'bg-blue-600' : 'bg-indigo-600'} ${!isExpanded ? 'scale-75 opacity-80' : ''}`}>
                            {item.type === 'studio' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            )}
                        </div>
                    </Marker>
                ))}

                {/* Popup for Selected Item */}
                {selectedItem && isExpanded && (
                    <Popup
                        longitude={selectedItem.lng}
                        latitude={selectedItem.lat}
                        anchor="bottom"
                        offset={30}
                        onClose={() => setSelectedItem(null)}
                        closeButton={false}
                        className="custom-popup"
                        maxWidth="300px"
                    >
                        <div className="flex flex-col p-0 overflow-hidden font-sans rounded-xl bg-zinc-950 border border-white/10 shadow-2xl">
                            {selectedItem.avatar_url ? (
                                <img src={selectedItem.avatar_url} className="w-full h-32 object-cover" />
                            ) : (
                                <div className="w-full h-12 bg-zinc-800"></div>
                            )}
                            <div className="p-4 bg-zinc-950">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${selectedItem.type === 'studio' ? 'bg-blue-500/20 text-blue-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                        {selectedItem.type === 'studio' ? 'Studio' : 'Artist'}
                                    </span>
                                    {selectedItem.is_premium && (
                                        <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-wider border border-yellow-500/30 px-1 py-0.5 rounded bg-yellow-500/10">★ Premium</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-white mb-3 tracking-tight">{selectedItem.title}</h3>
                                <a
                                    href={selectedItem.type === 'studio' ? `/studios/${selectedItem.slug}` : `/artists/${selectedItem.username}`}
                                    className="inline-block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white transition-all transform active:scale-95 shadow-lg shadow-blue-900/20"
                                >
                                    Ver Perfil
                                </a>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>

            {/* Custom CSS for Popup to override MapLibre/Mapbox defaults if needed */}


            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-[2000] pointer-events-none">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-sm text-white font-black uppercase tracking-[0.2em]">Escaneando</span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Iniciando Sistemas de Navegación</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

