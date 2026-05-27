import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface SplashScreenProps {
  isVisible: boolean;
  onComplete: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  isVisible,
  onComplete,
  duration = 2000, // 1 minute
}) => {
  const splashRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);
  const progressTextRef = useRef<SVGTextElement>(null);
  const [particles, setParticles] = useState<JSX.Element[]>([]);

  // Create particles for explosion effect
  const createParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 30; i++) {
      const size = Math.random() * 6 + 2;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 0.5;
      const duration = Math.random() * 1.5 + 0.5;
      const color = `hsl(${Math.random() * 60 + 200}, 100%, 60%)`;

      newParticles.push(
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            top: `${top}%`,
            backgroundColor: color,
            opacity: 0,
            transform: `scale(0)`,
            animation: `explode ${duration}s ${delay}s forwards`,
          }}
        />
      );
    }
    setParticles(newParticles);
  };

  useEffect(() => {
    if (!isVisible || !splashRef.current) return;

    // GSAP Timeline for Splash Animation
    const tl = gsap.timeline();

    // Fade in the splash screen
    tl.fromTo(
      splashRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.inOut" }
    );

    // Animate the logo (scale + subtle bounce)
    tl.fromTo(
      logoRef.current,
      { scale: 0.7, opacity: 0, y: 20 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "back.out(1.7)",
      },
      "-=0.5"
    );

    // Trigger particle explosion after logo animation
    tl.call(createParticles, [], "-=0.3");

    // Animate the progress bar (0% to 100% over 60 seconds)
    tl.to(
      progressRef.current,
      {
        strokeDashoffset: 0,
        duration: duration / 1000,
        ease: "none",
        onComplete: () => {
          gsap.to(splashRef.current, {
            opacity: 0,
            duration: 0.8,
            onComplete: onComplete,
          });
        },
      },
      "-=0.5"
    );

    // Update progress text in real-time
    const progressInterval = setInterval(() => {
      const elapsed = tl.time() * 1000;
      const currentProgress = Math.min(100, (elapsed / duration) * 100);
      if (progressTextRef.current) {
        progressTextRef.current.textContent = `${Math.round(currentProgress)}%`;
      }
    }, 100);

    return () => {
      tl.kill();
      clearInterval(progressInterval);
    };
  }, [isVisible, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={splashRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white overflow-hidden"
    >
      {/* Logo with Subtle Shadow */}
      <div ref={logoRef} className="relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-800">
          Bulk <span className="text-blue-500">Portal</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">Loading your experience...</p>
      </div>

      {/* Particle Explosion Effect */}
      <div className="absolute inset-0">{particles}</div>

      {/* Circular Progress Bar */}
      <div className="absolute bottom-32 w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-gray-200 stroke-current"
            strokeWidth="4"
            cx="50"
            cy="50"
            r="40"
            fill="none"
          />
          <circle
            ref={progressRef}
            className="text-blue-500 stroke-current"
            strokeWidth="4"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeDasharray="251.2"
            strokeDashoffset="251.2"
            transform="rotate(-90 50 50)"
          />
          <text
            ref={progressTextRef}
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-gray-700 text-lg font-medium"
          >
            0%
          </text>
        </svg>
      </div>

      {/* CSS for Animations */}
      <style>{`
        @keyframes explode {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0) translateY(-50px);
          }
        }
      `}</style>
    </div>
  );
};

export { SplashScreen };
