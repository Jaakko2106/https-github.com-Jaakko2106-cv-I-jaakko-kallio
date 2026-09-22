import React, { useEffect, useRef } from 'react';

interface Star {
    x: number;
    y: number;
    radius: number;
    alpha: number;
    twinkleSpeed: number;
}

interface Building {
    xRatio: number; // 0 to 1 horizontal position
    widthRatio: number; // width relative to screen width
    heightRatio: number; // height relative to screen height
    roofType: 'flat' | 'spire' | 'pitched' | 'dome' | 'step';
    windows: { x: number; y: number; width: number; height: number; lit: boolean }[];
    antenna?: { xRatio: number; height: number };
}

const UrbanSkylineCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const scrollProgressRef = useRef<number>(0);
    const targetScrollProgressRef = useRef<number>(0);
    const animationFrameIdRef = useRef<number | null>(null);

    // Persistent procedural buildings and stars
    const buildingsRef = useRef<Building[]>([]);
    const bgBuildingsRef = useRef<Building[]>([]);
    const starsRef = useRef<Star[]>([]);

    // Generate procedural cityscape once on mount
    useEffect(() => {
        // Generate distant background buildings
        const bgBuildings: Building[] = [];
        let curX = -0.05;
        while (curX < 1.1) {
            const widthRatio = 0.04 + Math.random() * 0.08;
            const heightRatio = 0.25 + Math.random() * 0.25;
            bgBuildings.push({
                xRatio: curX,
                widthRatio,
                heightRatio,
                roofType: Math.random() > 0.6 ? 'spire' : 'flat',
                windows: []
            });
            curX += widthRatio * 0.7;
        }
        bgBuildingsRef.current = bgBuildings;

        // Generate detailed foreground skyline buildings
        const fgBuildings: Building[] = [];
        curX = -0.02;
        const roofTypes: Building['roofType'][] = ['flat', 'spire', 'pitched', 'dome', 'step'];

        while (curX < 1.05) {
            const widthRatio = 0.05 + Math.random() * 0.09;
            const heightRatio = 0.2 + Math.random() * 0.35;
            const roofType = roofTypes[Math.floor(Math.random() * roofTypes.length)];
            
            // Generate window grids
            const windows: Building['windows'] = [];
            const cols = Math.floor(3 + Math.random() * 4);
            const rows = Math.floor(6 + Math.random() * 12);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    windows.push({
                        x: (c + 0.5) / cols,
                        y: (r + 0.5) / rows,
                        width: 0.5 / cols,
                        height: 0.5 / rows,
                        lit: Math.random() > 0.35 // 65% chance window can light up at night
                    });
                }
            }

            fgBuildings.push({
                xRatio: curX,
                widthRatio,
                heightRatio,
                roofType,
                windows,
                antenna: Math.random() > 0.5 ? { xRatio: 0.3 + Math.random() * 0.4, height: 20 + Math.random() * 40 } : undefined
            });

            curX += widthRatio * 0.82;
        }
        buildingsRef.current = fgBuildings;

        // Generate starfield
        const stars: Star[] = [];
        for (let i = 0; i < 120; i++) {
            stars.push({
                x: Math.random(),
                y: Math.random() * 0.6, // Stars in top 60% of sky
                radius: 0.6 + Math.random() * 1.6,
                alpha: 0.2 + Math.random() * 0.8,
                twinkleSpeed: 0.005 + Math.random() * 0.015
            });
        }
        starsRef.current = stars;
    }, []);

    // Scroll listener with RAF smoothing
    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (totalScroll > 0) {
                targetScrollProgressRef.current = Math.min(1, Math.max(0, window.scrollY / totalScroll));
            } else {
                targetScrollProgressRef.current = 0;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial measure

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Canvas render loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;

        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            width = canvas.parentElement?.clientWidth || window.innerWidth;
            height = canvas.parentElement?.clientHeight || window.innerHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.scale(dpr, dpr);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        // Helper: Interpolate RGB colors
        const interpolateColor = (color1: number[], color2: number[], factor: number): string => {
            const r = Math.round(color1[0] + factor * (color2[0] - color1[0]));
            const g = Math.round(color1[1] + factor * (color2[1] - color1[1]));
            const b = Math.round(color1[2] + factor * (color2[2] - color1[2]));
            return `rgb(${r}, ${g}, ${b})`;
        };

        // Render loop
        const render = () => {
            // Smooth lerp for scroll position
            scrollProgressRef.current += (targetScrollProgressRef.current - scrollProgressRef.current) * 0.08;
            const p = scrollProgressRef.current; // 0 (day) to 1 (night)

            ctx.clearRect(0, 0, width, height);

            // 1. SKY GRADIENT (Day -> Sunset -> Dusk -> Night)
            let skyTopRGB: number[];
            let skyBottomRGB: number[];

            if (p < 0.3) {
                // Daytime -> Golden Hour Sunset
                const factor = p / 0.3;
                skyTopRGB = [
                    135 + factor * (255 - 135), // 135 -> 255
                    206 + factor * (120 - 206), // 206 -> 120
                    235 + factor * (80 - 235)   // 235 -> 80
                ];
                skyBottomRGB = [
                    240 + factor * (255 - 240), // 240 -> 255
                    248 + factor * (180 - 248), // 248 -> 180
                    255 + factor * (120 - 255)  // 255 -> 120
                ];
            } else if (p < 0.7) {
                // Sunset -> Dusk
                const factor = (p - 0.3) / 0.4;
                skyTopRGB = [
                    255 - factor * (255 - 26),
                    120 - factor * (120 - 20),
                    80 + factor * (60 - 80)
                ];
                skyBottomRGB = [
                    255 - factor * (255 - 60),
                    180 - factor * (180 - 40),
                    120 - factor * (120 - 90)
                ];
            } else {
                // Dusk -> Deep Midnight
                const factor = (p - 0.7) / 0.3;
                skyTopRGB = [
                    26 - factor * (26 - 8),
                    20 - factor * (20 - 10),
                    60 - factor * (60 - 28)
                ];
                skyBottomRGB = [
                    60 - factor * (60 - 15),
                    40 - factor * (40 - 20),
                    90 - factor * (90 - 45)
                ];
            }

            const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
            skyGrad.addColorStop(0, `rgb(${Math.round(skyTopRGB[0])}, ${Math.round(skyTopRGB[1])}, ${Math.round(skyTopRGB[2])})`);
            skyGrad.addColorStop(1, `rgb(${Math.round(skyBottomRGB[0])}, ${Math.round(skyBottomRGB[1])}, ${Math.round(skyBottomRGB[2])})`);
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, width, height);

            // 2. CELESTIAL BODY (Sun -> Moon transition)
            const sunY = height * 0.25 + p * height * 0.6; // Sun sets
            const sunX = width * 0.75 - p * width * 0.2;
            const sunOpacity = Math.max(0, 1 - p * 2.2);

            if (sunOpacity > 0) {
                ctx.save();
                ctx.globalAlpha = sunOpacity;
                const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 60);
                sunGlow.addColorStop(0, 'rgba(255, 245, 200, 0.9)');
                sunGlow.addColorStop(0.5, 'rgba(255, 200, 100, 0.4)');
                sunGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
                ctx.fillStyle = sunGlow;
                ctx.beginPath();
                ctx.arc(sunX, sunY, 60, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Moon appearance at night (p > 0.4)
            const moonAlpha = Math.max(0, (p - 0.4) / 0.6);
            if (moonAlpha > 0) {
                const moonX = width * 0.8;
                const moonY = height * 0.2 - (1 - moonAlpha) * 30;

                ctx.save();
                ctx.globalAlpha = moonAlpha;
                
                // Moon Glow
                const moonGlow = ctx.createRadialGradient(moonX, moonY, 12, moonX, moonY, 45);
                moonGlow.addColorStop(0, 'rgba(240, 245, 255, 0.6)');
                moonGlow.addColorStop(1, 'rgba(200, 220, 255, 0)');
                ctx.fillStyle = moonGlow;
                ctx.beginPath();
                ctx.arc(moonX, moonY, 45, 0, Math.PI * 2);
                ctx.fill();

                // Moon Disc
                ctx.fillStyle = '#F0F4FF';
                ctx.beginPath();
                ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
                ctx.fill();

                // Moon Crescent Shadow
                ctx.fillStyle = skyGrad;
                ctx.beginPath();
                ctx.arc(moonX + 6, moonY - 4, 15, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }

            // 3. STARS (Fade in as p > 0.35)
            const starAlphaMult = Math.max(0, (p - 0.35) / 0.65);
            if (starAlphaMult > 0) {
                ctx.save();
                starsRef.current.forEach(star => {
                    // Subtle twinkle
                    star.alpha += star.twinkleSpeed;
                    if (star.alpha > 1 || star.alpha < 0.2) {
                        star.twinkleSpeed = -star.twinkleSpeed;
                    }
                    ctx.globalAlpha = Math.min(1, star.alpha * starAlphaMult);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.beginPath();
                    ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.restore();
            }

            // 4. BACKGROUND SILHOUETTE BUILDINGS (Distant layer)
            const bgBuildingColor = interpolateColor([160, 185, 210], [15, 20, 35], p);
            ctx.fillStyle = bgBuildingColor;
            ctx.strokeStyle = interpolateColor([120, 145, 170], [30, 40, 60], p);
            ctx.lineWidth = 1;

            bgBuildingsRef.current.forEach(b => {
                const bx = b.xRatio * width;
                const bw = b.widthRatio * width;
                const bh = b.heightRatio * height;
                const by = height - bh;

                ctx.fillRect(bx, by, bw, bh);
                ctx.strokeRect(bx, by, bw, bh);

                if (b.roofType === 'spire') {
                    ctx.beginPath();
                    ctx.moveTo(bx, by);
                    ctx.lineTo(bx + bw / 2, by - bh * 0.25);
                    ctx.lineTo(bx + bw, by);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            });

            // 5. FOREGROUND SILHOUETTE SKETCH BUILDINGS
            // Sketch style: Charcoal / Ink strokes with dynamic color contrast
            const fgBuildingColor = interpolateColor([30, 35, 45], [5, 8, 15], p);
            const inkStrokeColor = interpolateColor([15, 18, 25], [100, 115, 140], p);

            buildingsRef.current.forEach(b => {
                const bx = b.xRatio * width;
                const bw = b.widthRatio * width;
                const bh = b.heightRatio * height;
                const by = height - bh;

                // Main building body fill
                ctx.fillStyle = fgBuildingColor;
                ctx.fillRect(bx, by, bw, bh);

                // Architectural Ink Sketch outlines
                ctx.strokeStyle = inkStrokeColor;
                ctx.lineWidth = 1.5;

                ctx.beginPath();
                // Outline
                ctx.rect(bx, by, bw, bh);

                // Roof details according to type
                if (b.roofType === 'spire') {
                    ctx.moveTo(bx, by);
                    ctx.lineTo(bx + bw / 2, by - bh * 0.3);
                    ctx.lineTo(bx + bw, by);
                } else if (b.roofType === 'pitched') {
                    ctx.moveTo(bx, by);
                    ctx.lineTo(bx + bw / 2, by - bh * 0.15);
                    ctx.lineTo(bx + bw, by);
                } else if (b.roofType === 'dome') {
                    ctx.moveTo(bx, by);
                    ctx.bezierCurveTo(bx, by - bh * 0.2, bx + bw, by - bh * 0.2, bx + bw, by);
                } else if (b.roofType === 'step') {
                    const inset = bw * 0.18;
                    const stepH = bh * 0.12;
                    ctx.rect(bx + inset, by - stepH, bw - inset * 2, stepH);
                }

                // Architectural sketch lines (facade texture / vertical ridges)
                const lineCount = 3;
                for (let i = 1; i <= lineCount; i++) {
                    const lx = bx + (bw * i) / (lineCount + 1);
                    ctx.moveTo(lx, by + 10);
                    ctx.lineTo(lx, height - 10);
                }

                ctx.stroke();

                // Antenna if present
                if (b.antenna) {
                    const ax = bx + b.antenna.xRatio * bw;
                    ctx.beginPath();
                    ctx.moveTo(ax, by);
                    ctx.lineTo(ax, by - b.antenna.height);
                    ctx.stroke();

                    // Tiny blinking beacon light on top of tall antennas at night
                    if (p > 0.5) {
                        const beaconAlpha = (Math.sin(Date.now() * 0.005 + bx) + 1) / 2;
                        ctx.save();
                        ctx.fillStyle = `rgba(255, 50, 50, ${beaconAlpha * Math.min(1, (p - 0.5) * 2)})`;
                        ctx.beginPath();
                        ctx.arc(ax, by - b.antenna.height, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                }

                // 6. WINDOW LIGHTS (Illuminated as night falls p > 0.35)
                const windowNightFactor = Math.max(0, (p - 0.35) / 0.65);
                if (windowNightFactor > 0 && b.windows.length > 0) {
                    b.windows.forEach(w => {
                        if (w.lit) {
                            const wx = bx + w.x * bw;
                            const wy = by + w.y * bh;
                            const ww = w.width * bw;
                            const wh = w.height * bh;

                            // Gentle window flicker
                            const flicker = 0.85 + 0.15 * Math.sin(Date.now() * 0.003 + wx * wy);
                            const wAlpha = windowNightFactor * flicker;

                            ctx.save();
                            ctx.fillStyle = `rgba(255, 220, 110, ${wAlpha * 0.85})`;
                            ctx.fillRect(wx, wy, ww, wh);

                            // Subtle window glow effect
                            if (wAlpha > 0.5) {
                                ctx.shadowColor = 'rgba(255, 200, 80, 0.6)';
                                ctx.shadowBlur = 6;
                                ctx.fillRect(wx, wy, ww, wh);
                            }
                            ctx.restore();
                        }
                    });
                }
            });

            animationFrameIdRef.current = requestAnimationFrame(render);
        };

        animationFrameIdRef.current = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none print:hidden" aria-hidden="true">
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
};

export default UrbanSkylineCanvas;
