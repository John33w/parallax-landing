import { useEffect, useRef } from 'react';
// @ts-ignore
import webGLFluidEnhanced from 'webgl-fluid';



export default function FluidCursor() {
  const fluidCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 1. Initialize WebGL Fluid
    if (fluidCanvasRef.current) {
      webGLFluidEnhanced(fluidCanvasRef.current, {
        IMMEDIATE: true,
        TRIGGER: 'hover',
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 1024,
        CAPTURE_RESOLUTION: 512,
        DENSITY_DISSIPATION: 3.5,
        VELOCITY_DISSIPATION: 2.5,
        PRESSURE: 0.2,
        PRESSURE_ITERATIONS: 10,
        CURL: 15,
        SPLAT_RADIUS: 0.3,
        SPLAT_FORCE: 1500,
        SHADING: true,
        COLORFUL: false,
        SPLAT_COLOR: { r: 0.0, g: 0.4, b: 1.0 },
        COLOR_UPDATE_SPEED: 10,
        PAUSED: false,
        BACK_COLOR: { r: 0, g: 0, b: 0 },
        TRANSPARENT: true,
        BLOOM: false
      });
    }

  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
      <canvas 
        id="fluid-canvas"
        ref={fluidCanvasRef} 
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.4 }} 
      />
    </div>
  );
}
