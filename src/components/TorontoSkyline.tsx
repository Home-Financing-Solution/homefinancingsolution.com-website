import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

interface WindowLight {
  x: number;
  y: number;
  w: number;
  h: number;
  phase: number;
  speed: number;
  baseAlpha: number;
}

export default function TorontoSkyline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const onResize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      initScene();
    };
    window.addEventListener("resize", onResize);

    // --- Stars ---
    let stars: Star[] = [];
    // --- Window lights per building group ---
    let windows: WindowLight[] = [];

    function initScene() {
      stars = Array.from({ length: 120 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H * 0.55,
        r: Math.random() * 1.5 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
      }));

      windows = [];
      // We'll add windows after defining building layout below
      // (populated in drawScene after buildings defined)
    }

    initScene();

    // Scale helper: treat design as 1400 wide × 700 tall
    const DW = 1400;
    const DH = 700;
    const sx = () => W / DW;
    const sy = () => H / DH;

    // --- Building definitions (design coords) ---
    // Each: { x, y, w, h, color } where y is top of building, h goes down to ground
    const GROUND_Y = 610; // design coord ground line

    const buildings = [
      // Far background (lighter, more transparent)
      { x: 0,    y: 370, w: 90,  h: 240, c: "#0a1f3a" },
      { x: 80,   y: 390, w: 70,  h: 220, c: "#0a1f3a" },
      { x: 130,  y: 350, w: 100, h: 260, c: "#0c2240" },
      { x: 210,  y: 400, w: 80,  h: 210, c: "#0a1f3a" },
      { x: 280,  y: 380, w: 60,  h: 230, c: "#0c2240" },
      { x: 320,  y: 410, w: 90,  h: 200, c: "#0a1f3a" },

      // Rogers Centre dome area (right of CN Tower)
      { x: 390, y: 490, w: 180, h: 120, c: "#0d2545" },

      // Mid buildings left
      { x: 480,  y: 320, w: 70,  h: 290, c: "#0f2a50" },
      { x: 540,  y: 290, w: 80,  h: 320, c: "#112d55" },
      { x: 610,  y: 340, w: 65,  h: 270, c: "#0f2a50" },

      // First Canadian Place / Scotia area
      { x: 670,  y: 200, w: 75,  h: 410, c: "#122e58" },
      { x: 735,  y: 250, w: 65,  h: 360, c: "#0f2a50" },
      { x: 790,  y: 310, w: 55,  h: 300, c: "#112d55" },

      // Right cluster
      { x: 830,  y: 360, w: 80,  h: 250, c: "#0f2a50" },
      { x: 900,  y: 300, w: 70,  h: 310, c: "#122e58" },
      { x: 960,  y: 370, w: 90,  h: 240, c: "#0d2545" },
      { x: 1040, y: 330, w: 75,  h: 280, c: "#0f2a50" },
      { x: 1100, y: 390, w: 85,  h: 220, c: "#0a1f3a" },
      { x: 1170, y: 360, w: 65,  h: 250, c: "#0c2240" },
      { x: 1220, y: 410, w: 90,  h: 200, c: "#0a1f3a" },
      { x: 1290, y: 380, w: 80,  h: 230, c: "#0d2545" },
      { x: 1360, y: 350, w: 80,  h: 260, c: "#0a1f3a" },
    ];

    // Generate window lights for each building
    function generateWindows() {
      windows = [];
      buildings.forEach((b) => {
        const cols = Math.floor(b.w / 14);
        const rows = Math.floor(b.h / 16);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (Math.random() < 0.55) {
              windows.push({
                x: b.x + 4 + c * 14,
                y: b.y + 6 + r * 16,
                w: 7,
                h: 9,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.008 + 0.001,
                baseAlpha: Math.random() * 0.5 + 0.35,
              });
            }
          }
        }
      });
    }
    generateWindows();

    // CN Tower (design coords)
    const CNT = {
      baseX: 295,
      groundY: GROUND_Y,
      shaftW: 18,
      shaftH: 280,
      podX: 268,
      podY: 300,
      podW: 54,
      podH: 28,
      antennaTop: 150,
    };

    let t = 0;

    function drawFrame() {
      t += 0.016;
      const scx = sx();
      const scy = sy();

      ctx.clearRect(0, 0, W, H);

      // --- Sky gradient ---
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.75);
      skyGrad.addColorStop(0, "#010a18");
      skyGrad.addColorStop(0.4, "#020e22");
      skyGrad.addColorStop(0.75, "#061830");
      skyGrad.addColorStop(1, "#0a2040");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // --- Aurora glow low on horizon ---
      const aurora = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.75);
      aurora.addColorStop(0, "rgba(0,80,180,0.00)");
      aurora.addColorStop(0.5, "rgba(0,60,140,0.12)");
      aurora.addColorStop(1, "rgba(0,40,100,0.25)");
      ctx.fillStyle = aurora;
      ctx.fillRect(0, H * 0.55, W, H * 0.45);

      // --- Stars ---
      stars.forEach((s) => {
        const alpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(s.phase + t * s.speed * 60));
        ctx.beginPath();
        ctx.arc(s.x * (W / W), s.y * (H / H), s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${alpha.toFixed(2)})`;
        ctx.fill();
      });

      // --- Moon ---
      const moonX = W * 0.82;
      const moonY = H * 0.15;
      const moonR = Math.min(W, H) * 0.03;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR * 4);
      moonGlow.addColorStop(0, "rgba(180,210,255,0.12)");
      moonGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = moonGlow;
      ctx.fillRect(moonX - moonR * 4, moonY - moonR * 4, moonR * 8, moonR * 8);
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      const moonFill = ctx.createRadialGradient(moonX - moonR * 0.3, moonY - moonR * 0.3, moonR * 0.1, moonX, moonY, moonR);
      moonFill.addColorStop(0, "#e8f0ff");
      moonFill.addColorStop(1, "#b0c8f0");
      ctx.fillStyle = moonFill;
      ctx.fill();

      // --- Background buildings ---
      buildings.forEach((b) => {
        ctx.fillStyle = b.c;
        ctx.fillRect(
          b.x * scx,
          b.y * scy,
          b.w * scx,
          (GROUND_Y - b.y) * scy
        );
      });

      // --- CN Tower ---
      const tx = CNT.baseX * scx;
      const ty_ground = CNT.groundY * scy;
      const shaftW = CNT.shaftW * scx;
      const shaftH = CNT.shaftH * scy;
      const antennaTop = CNT.antennaTop * scy;

      // Main shaft (tapered)
      ctx.beginPath();
      ctx.moveTo(tx - shaftW / 2, ty_ground);
      ctx.lineTo(tx - shaftW / 4, ty_ground - shaftH);
      ctx.lineTo(tx + shaftW / 4, ty_ground - shaftH);
      ctx.lineTo(tx + shaftW / 2, ty_ground);
      ctx.closePath();
      const shaftGrad = ctx.createLinearGradient(tx - shaftW / 2, 0, tx + shaftW / 2, 0);
      shaftGrad.addColorStop(0, "#0d2545");
      shaftGrad.addColorStop(0.4, "#1a4070");
      shaftGrad.addColorStop(0.6, "#1e4878");
      shaftGrad.addColorStop(1, "#0d2545");
      ctx.fillStyle = shaftGrad;
      ctx.fill();

      // Pod
      const podY = CNT.podY * scy;
      const podH = CNT.podH * scy;
      const podX = CNT.podX * scx;
      const podW = CNT.podW * scx;
      ctx.beginPath();
      ctx.roundRect(podX, podY, podW, podH, 3);
      const podGrad = ctx.createLinearGradient(podX, podY, podX, podY + podH);
      podGrad.addColorStop(0, "#1e4878");
      podGrad.addColorStop(1, "#0d2545");
      ctx.fillStyle = podGrad;
      ctx.fill();
      // Pod windows (lit ring)
      for (let i = 0; i < 8; i++) {
        const wx = podX + (podW / 9) * (i + 0.5);
        const wy = podY + podH * 0.35;
        const alpha = 0.6 + 0.4 * Math.sin(t * 0.8 + i * 0.5);
        ctx.beginPath();
        ctx.arc(wx, wy, 2 * Math.min(scx, scy), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150,210,255,${alpha.toFixed(2)})`;
        ctx.fill();
      }

      // Antenna
      const antTop = antennaTop * scy;
      const shaftTopY = ty_ground - shaftH;
      ctx.beginPath();
      ctx.moveTo(tx, shaftTopY);
      ctx.lineTo(tx, antTop);
      ctx.strokeStyle = "#1a4878";
      ctx.lineWidth = 2 * Math.min(scx, scy);
      ctx.stroke();

      // Beacon blink at top of antenna
      const beaconAlpha = 0.5 + 0.5 * Math.sin(t * 2.5);
      const beaconR = 4 * Math.min(scx, scy);
      const beaconGlow = ctx.createRadialGradient(tx, antTop, 0, tx, antTop, beaconR * 5);
      beaconGlow.addColorStop(0, `rgba(255,80,80,${(beaconAlpha * 0.5).toFixed(2)})`);
      beaconGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = beaconGlow;
      ctx.fillRect(tx - beaconR * 5, antTop - beaconR * 5, beaconR * 10, beaconR * 10);
      ctx.beginPath();
      ctx.arc(tx, antTop, beaconR * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,100,80,${beaconAlpha.toFixed(2)})`;
      ctx.fill();

      // --- Window lights ---
      windows.forEach((w) => {
        const alpha = w.baseAlpha * (0.7 + 0.3 * Math.sin(w.phase + t * w.speed * 60));
        // Warm amber or cool blue windows
        const hue = w.phase < Math.PI ? "255,200,120" : "140,200,255";
        ctx.fillStyle = `rgba(${hue},${alpha.toFixed(2)})`;
        ctx.fillRect(w.x * scx, w.y * scy, w.w * scx, w.h * scy);
      });

      // --- Water / ground reflection ---
      const waterY = GROUND_Y * scy;
      const waterGrad = ctx.createLinearGradient(0, waterY, 0, H);
      waterGrad.addColorStop(0, "#040f20");
      waterGrad.addColorStop(0.3, "#061428");
      waterGrad.addColorStop(1, "#020a18");
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, waterY, W, H - waterY);

      // Reflection shimmer — wavy horizontal lines
      for (let i = 0; i < 6; i++) {
        const ry = waterY + (H - waterY) * (0.05 + i * 0.12);
        const shimmerAlpha = (0.03 + 0.02 * Math.sin(t * 1.2 + i)).toFixed(2);
        ctx.beginPath();
        ctx.moveTo(0, ry);
        for (let x = 0; x <= W; x += 20) {
          const wave = Math.sin(x * 0.04 + t * 1.5 + i) * 2;
          ctx.lineTo(x, ry + wave);
        }
        ctx.strokeStyle = `rgba(100,170,255,${shimmerAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // City light reflections in water
      const reflectionGrad = ctx.createLinearGradient(0, waterY, 0, waterY + (H - waterY) * 0.4);
      reflectionGrad.addColorStop(0, "rgba(0,60,140,0.18)");
      reflectionGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = reflectionGrad;
      ctx.fillRect(0, waterY, W, (H - waterY) * 0.4);

      animRef.current = requestAnimationFrame(drawFrame);
    }

    animRef.current = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
