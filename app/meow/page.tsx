"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function MeowPage() {
  const [currentCat, setCurrentCat] = useState(0);
  const cats = ["/cat1.png", "/cat2.png", "/cat3.png"];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        setCurrentCat((prev) => (prev + 1) % cats.length);
      } else if (e.key === "ArrowLeft") {
        setCurrentCat((prev) => (prev - 1 + cats.length) % cats.length);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [cats.length]);

  const nextCat = () => {
    setCurrentCat((prev) => (prev + 1) % cats.length);
  };

  const prevCat = () => {
    setCurrentCat((prev) => (prev - 1 + cats.length) % cats.length);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-full">
        <Image
          src={cats[currentCat]}
          alt="Meow!"
          fill
          className="object-contain"
          priority
        />
      </div>
      <button
        onClick={prevCat}
        className="fixed left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white bg-opacity-20 hover:bg-opacity-40 backdrop-blur-md flex items-center justify-center text-white text-2xl transition-all shadow-lg hover:scale-110"
        aria-label="Предыдущий котик"
      >
        <i className="fas fa-chevron-left"></i>
      </button>

      <button
        onClick={nextCat}
        className="fixed right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white bg-opacity-20 hover:bg-opacity-40 backdrop-blur-md flex items-center justify-center text-white text-2xl transition-all shadow-lg hover:scale-110"
        aria-label="Следующий котик"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {cats.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentCat(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentCat
                ? "bg-white w-8"
                : "bg-white bg-opacity-40 hover:bg-opacity-70"
            }`}
            aria-label={`Котик ${index + 1}`}
          />
        ))}
      </div>
      <div className="fixed top-8 left-1/2 -translate-x-1/2 text-white text-6xl font-bold animate-pulse">
        <span className="drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
          MEOW 🐱
        </span>
      </div>

    </div>
  );
}

