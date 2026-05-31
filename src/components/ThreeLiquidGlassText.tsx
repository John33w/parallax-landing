import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeLiquidGlassTextProps {
  text: string;
  fontSize?: number;
  interactive?: boolean;
}

export default function ThreeLiquidGlassText({ text, fontSize = 120, interactive = true }: ThreeLiquidGlassTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!fontsLoaded || !containerRef.current) return;
    const container = containerRef.current;

    // 1. CANVAS TEXT PRE-RENDER
    // We create a high-resolution 2D canvas to draw the text, then convert it to a THREE.CanvasTexture
    const canvas2d = document.createElement('canvas');
    const ctx = canvas2d.getContext('2d');
    if (!ctx) return;

    // Match canvas size to container for 1:1 pixel mapping (with retina scale)
    const rect = container.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    canvas2d.width = rect.width * pixelRatio;
    canvas2d.height = rect.height * pixelRatio;
    
    // Clear background (transparent)
    ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
    
    // Dynamically scale font size to ensure it fits within the canvas (preventing text cutoff)
    // Strictly using "Playfair Display" without fallback
    let currentFontSize = fontSize * pixelRatio;
    ctx.font = `normal ${currentFontSize}px "Playfair Display"`;
    let metrics = ctx.measureText(text);
    
    // 0.7 gives a 30% safety margin so the text and stroke absolutely never touch the edge
    while (metrics.width > canvas2d.width * 0.7 || currentFontSize > canvas2d.height * 0.7) {
      currentFontSize -= 2;
      if (currentFontSize < 10) break; // sanity check
      ctx.font = `normal ${currentFontSize}px "Playfair Display"`;
      metrics = ctx.measureText(text);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw fill in Green channel
    ctx.fillStyle = 'rgba(0, 255, 0, 1.0)';
    ctx.fillText(text, canvas2d.width / 2, canvas2d.height / 2);

    // Draw stroke in Red channel
    ctx.strokeStyle = 'rgba(255, 0, 0, 1.0)';
    ctx.lineWidth = 2 * pixelRatio;
    ctx.strokeText(text, canvas2d.width / 2, canvas2d.height / 2);

    const textTexture = new THREE.CanvasTexture(canvas2d);
    textTexture.minFilter = THREE.LinearFilter;
    textTexture.magFilter = THREE.LinearFilter;
    textTexture.generateMipmaps = false;

    // Setup Three.js Scene
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    // Fit renderer to container
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(pixelRatio);
    container.appendChild(renderer.domElement);

    // 2 & 3 & 4. CUSTOM SHADER MATERIAL
    // We use a full-screen quad to render the effect
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      uTime: { value: 0 },
      uTexture: { value: textTexture },
      uResolution: { value: new THREE.Vector2(rect.width, rect.height) },
      uMouse: { value: new THREE.Vector2(-10, -10) }, // Start off-screen
      uVelocity: { value: new THREE.Vector2(0, 0) },
      uRadius: { value: 0.6 }, // Larger radius
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform sampler2D uTexture;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec2 uVelocity;
      uniform float uRadius;

      varying vec2 vUv;

      // 2D Random
      float random (in vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      // 2D Noise based on Morgan McGuire @morgan3d
      float noise (in vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);

          // Four corners in 2D of a tile
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));

          // Smooth Interpolation
          vec2 u = f*f*(3.0-2.0*f);

          // Mix 4 coorners percentages
          return mix(a, b, u.x) +
                  (c - a)* u.y * (1.0 - u.x) +
                  (d - b) * u.x * u.y;
      }

      void main() {
        // Fix aspect ratio for perfect circular mouse hit detection
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 uv = vUv;
        vec2 st = vUv * aspect;
        vec2 mouseStr = uMouse * aspect;

        // Calculate distance to mouse
        float dist = distance(st, mouseStr);
        
        // Very soft edge radius detection to avoid harsh circles
        float interaction = 1.0 - smoothstep(0.0, uRadius, dist);
        // Add a secondary wider gradient for the glass shine
        float shineInteraction = 1.0 - smoothstep(0.0, uRadius * 1.5, dist);
        
        // Base UV mapping without fluid distortion
        vec2 distortedUv = uv;

        // Sample the base texture (Red = Stroke, Green = Fill)
        vec4 texData = texture2D(uTexture, distortedUv);
        
        // Reduce wireframe opacity to 40%
        float strokeAlpha = texData.r * 0.4;
        float fillAlpha = texData.g;
        
        // 4. 3D GLASS MATERIAL SHADER
        // To simulate normals (slope), we take partial derivatives of the interaction field
        float bumpLeft = 1.0 - smoothstep(0.0, uRadius, distance((st - vec2(0.02, 0.0)), mouseStr));
        float bumpRight = 1.0 - smoothstep(0.0, uRadius, distance((st + vec2(0.02, 0.0)), mouseStr));
        float bumpUp = 1.0 - smoothstep(0.0, uRadius, distance((st - vec2(0.0, 0.02)), mouseStr));
        float bumpDown = 1.0 - smoothstep(0.0, uRadius, distance((st + vec2(0.0, 0.02)), mouseStr));
        
        vec3 normal = normalize(vec3(bumpLeft - bumpRight, bumpDown - bumpUp, 0.5)); // Z is height

        // Basic lighting for 3D glass specular
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        
        // Specular highlight
        vec3 halfVector = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfVector), 0.0), 32.0); // Softened glass highlight
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

        // Calculate final text alpha: transition from solid fill to wireframe stroke!
        // When interaction is 0 -> use fillAlpha. When interaction is 1 -> use strokeAlpha.
        float textAlpha = mix(fillAlpha, strokeAlpha, interaction);
        
        // The text color is pure white
        vec3 finalColor = vec3(1.0);

        // Add specular shine and glow on the text elements
        if (shineInteraction > 0.0 && textAlpha > 0.0) {
           finalColor += vec3(1.0) * spec * shineInteraction; // Specular shine
           finalColor += vec3(0.8, 0.9, 1.0) * fresnel * shineInteraction * 0.5; // Fresnel glow
           textAlpha = min(1.0, textAlpha + spec * shineInteraction); // Boost alpha for shiny parts
        }

        // Output the color and the calculated alpha (transparent where background should show through)
        gl_FragColor = vec4(finalColor, textAlpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Interaction Mechanics (Mouse Tracking & Velocity Dampening)
    const mouse = new THREE.Vector2(-10, -10); // Start far away
    const targetMouse = new THREE.Vector2(-10, -10);
    const velocity = new THREE.Vector2(0, 0);
    let lastMousePos = new THREE.Vector2(-10, -10);
    const friction = 0.95;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      // Normalize to 0 -> 1 for UV mapping space
      targetMouse.x = (e.clientX - rect.left) / rect.width;
      targetMouse.y = 1.0 - ((e.clientY - rect.top) / rect.height); // Flip Y
    };

    const handleMouseLeave = () => {
      // Move mouse off screen smoothly when leaving
      targetMouse.set(-10, -10);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Resize Handler
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      uniforms.uResolution.value.set(rect.width, rect.height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const render = () => {
      const delta = clock.getDelta();
      uniforms.uTime.value += delta;

      // Smooth mouse interpolation
      mouse.lerp(targetMouse, 0.2);
      
      // Calculate velocity (difference between current interpolated mouse and last)
      const currentVelocity = new THREE.Vector2(mouse.x - lastMousePos.x, mouse.y - lastMousePos.y);
      
      // Add current impulse to ongoing velocity and apply friction
      velocity.add(currentVelocity).multiplyScalar(friction);
      
      // Update uniforms
      uniforms.uMouse.value.copy(mouse);
      uniforms.uVelocity.value.copy(velocity);
      
      // Store for next frame
      lastMousePos.copy(mouse);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      textTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [text, fontSize, interactive, fontsLoaded]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'absolute', 
        inset: 0,
        pointerEvents: interactive ? 'auto' : 'none'
      }} 
    />
  );
}
