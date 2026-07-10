"use client";

import { useEffect, useRef } from "react";

interface Particle {
  graphic: import("pixi.js").Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function PixiTrails() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;

    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let disposed = false;
    let disposeScene: (() => void) | undefined;

    async function createScene() {
      const { Application, Container, Graphics } = await import("pixi.js");

      if (disposed || !host) {
        return;
      }

      const app = new Application();
      const limitedDevice =
        window.innerWidth < 720 ||
        navigator.hardwareConcurrency <= 4 ||
        ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;

      await app.init({
        resizeTo: host,
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio, limitedDevice ? 1 : 1.35),
        preference: "webgl",
        powerPreference: "high-performance",
      });

      if (disposed) {
        app.destroy(true, { children: true });
        return;
      }

      app.canvas.setAttribute("aria-hidden", "true");
      app.canvas.style.width = "100%";
      app.canvas.style.height = "100%";
      host.appendChild(app.canvas);

      const scene = new Container();
      const connections = new Graphics();
      const particleLayer = new Container();
      const particles: Particle[] = [];
      const count = limitedDevice ? 14 : 24;
      const colors = [0x25b7a1, 0x7bd8c5, 0xf0b86e];

      scene.addChild(connections, particleLayer);
      app.stage.addChild(scene);

      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);

      for (let index = 0; index < count; index += 1) {
        const radius = index % 6 === 0 ? 3.2 : index % 3 === 0 ? 2.2 : 1.4;
        const graphic = new Graphics()
          .circle(0, 0, radius)
          .fill({ color: colors[index % colors.length], alpha: index % 4 === 0 ? 0.62 : 0.36 });
        const particle: Particle = {
          graphic,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (limitedDevice ? 0.11 : 0.18),
          vy: (Math.random() - 0.5) * (limitedDevice ? 0.09 : 0.14),
        };

        graphic.position.set(particle.x, particle.y);
        particles.push(particle);
        particleLayer.addChild(graphic);
      }

      app.ticker.maxFPS = limitedDevice ? 28 : 40;

      const tick = (ticker: import("pixi.js").Ticker) => {
        const frameScale = Math.min(ticker.deltaMS / 16.67, 2);
        const currentWidth = app.renderer.width / app.renderer.resolution;
        const currentHeight = app.renderer.height / app.renderer.resolution;

        for (const particle of particles) {
          particle.x += particle.vx * frameScale;
          particle.y += particle.vy * frameScale;

          if (particle.x < -8) particle.x = currentWidth + 8;
          if (particle.x > currentWidth + 8) particle.x = -8;
          if (particle.y < -8) particle.y = currentHeight + 8;
          if (particle.y > currentHeight + 8) particle.y = -8;

          particle.graphic.position.set(particle.x, particle.y);
        }

        connections.clear();
        const connectionDistance = limitedDevice ? 135 : 175;

        for (let first = 0; first < particles.length; first += 1) {
          for (let second = first + 1; second < particles.length; second += 1) {
            const a = particles[first];
            const b = particles[second];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distanceSquared = dx * dx + dy * dy;

            if (distanceSquared < connectionDistance * connectionDistance) {
              const alpha = (1 - Math.sqrt(distanceSquared) / connectionDistance) * 0.12;
              connections
                .moveTo(a.x, a.y)
                .lineTo(b.x, b.y)
                .stroke({ width: 0.75, color: 0x2eb8a3, alpha });
            }
          }
        }
      };

      let isInView = false;
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        isInView = entry.isIntersecting;

        if (isInView && !document.hidden) {
          app.ticker.start();
        } else {
          app.ticker.stop();
        }
      });

      const onVisibilityChange = () => {
        if (document.hidden || !isInView) app.ticker.stop();
        else app.ticker.start();
      };

      app.ticker.add(tick);
      visibilityObserver.observe(host);
      document.addEventListener("visibilitychange", onVisibilityChange);

      disposeScene = () => {
        visibilityObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibilityChange);
        app.ticker.remove(tick);
        app.destroy(true, { children: true });
      };
    }

    // The CSS art remains as a graceful fallback if WebGL is unavailable.
    void createScene().catch(() => undefined);

    return () => {
      disposed = true;
      disposeScene?.();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-80 [mask-image:linear-gradient(to_bottom,black_0%,black_76%,transparent_100%)]"
      aria-hidden="true"
    />
  );
}
