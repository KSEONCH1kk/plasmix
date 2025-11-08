import React from 'react';

export default function NotFound() {
  return (
    <>
      <style>{`
        @keyframes glitch-anim {
          0% {
            clip-path: inset(40% 0 61% 0);
            transform: translate(-2px, -2px);
          }
          20% {
            clip-path: inset(92% 0 1% 0);
            transform: translate(2px, 2px);
          }
          40% {
            clip-path: inset(43% 0 1% 0);
            transform: translate(-2px, 2px);
          }
          60% {
            clip-path: inset(25% 0 58% 0);
            transform: translate(2px, -2px);
          }
          80% {
            clip-path: inset(54% 0 7% 0);
            transform: translate(-2px, 2px);
          }
          100% {
            clip-path: inset(58% 0 43% 0);
            transform: translate(2px, -2px);
          }
        }

        .glitch-text {
          position: relative;
        }

        .glitch-layer {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0.8;
          pointer-events: none;
        }

        .glitch-red {
          color: #ff0000;
          animation: glitch-anim 0.3s infinite linear alternate-reverse;
        }

        .glitch-blue {
          color: #00ffff;
          animation: glitch-anim 0.4s infinite linear alternate;
        }

        .glitch-green {
          color: #00ff00;
          animation: glitch-anim 0.5s infinite linear alternate-reverse;
          animation-delay: 0.2s;
        }
      `}</style>

      <div className="flex flex-col min-h-screen items-center justify-center" style={{ backgroundColor: "#f5f4f1" }}>
        <div className="text-center">
          <div className="relative inline-block">
            <h1 className="text-9xl sm:text-[12rem] md:text-[16rem] font-bold text-black relative z-10 glitch-text">
              404
            </h1>
            <h1 className="text-9xl sm:text-[12rem] md:text-[16rem] font-bold absolute top-0 left-0 glitch-layer glitch-red">
              404
            </h1>
            <h1 className="text-9xl sm:text-[12rem] md:text-[16rem] font-bold absolute top-0 left-0 glitch-layer glitch-blue">
              404
            </h1>
            <h1 className="text-9xl sm:text-[12rem] md:text-[16rem] font-bold absolute top-0 left-0 glitch-layer glitch-green">
              404
            </h1>
          </div>
          
        
        </div>
      </div>
    </>
  );
}