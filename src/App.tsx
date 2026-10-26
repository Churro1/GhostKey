import React, { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";

export default function App() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unlistenPromise = listen<string[]>("ghostkey-state", (event) => {
      setActiveKeys(new Set(event.payload));
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  const isPressed = (code: string) => activeKeys.has(code);

  return (
    <div className="w-screen h-screen flex items-center justify-center p-4">
      {/* Draggable HUD Card */}
      <div
        data-tauri-drag-region
        className="w-auto min-w-[340px] p-5 rounded-3xl bg-neutral-900/80 backdrop-blur-md border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing"
      >
        <div
          data-tauri-drag-region
          className="flex justify-between items-center text-[10px] font-bold tracking-widest text-neutral-400 mb-4 px-1"
        >
          <span data-tauri-drag-region>GHOSTKEY</span>
          <span data-tauri-drag-region className="text-neutral-500 font-normal">drag here</span>
        </div>

        {/* Keys & Mouse Layout */}
        <div className="flex gap-6 items-end justify-center pointer-events-none">
          
          {/* Keyboard Block */}
          <div className="flex flex-col items-center gap-1.5">
            <KeyCap label="W" pressed={isPressed("W")} />
            
            <div className="flex gap-1.5">
              <KeyCap label="A" pressed={isPressed("A")} />
              <KeyCap label="S" pressed={isPressed("S")} />
              <KeyCap label="D" pressed={isPressed("D")} />
            </div>
            
            {/* Bottom Modifier & Space Row */}
            <div className="flex gap-1.5">
              <KeyCap 
                label="CTRL" 
                pressed={isPressed("LControl") || isPressed("RControl")} 
                widthClass="w-12" 
                textClass="text-[9px]" 
              />
              <KeyCap 
                label="SHIFT" 
                pressed={isPressed("LShift") || isPressed("RShift")} 
                widthClass="w-12" 
                textClass="text-[10px]" 
              />
              <KeyCap 
                label="SPACE" 
                pressed={isPressed("Space")} 
                widthClass="w-12" 
              />
            </div>
          </div>

          {/* Mouse Block */}
          <MouseIndicator lmb={isPressed("LMB")} rmb={isPressed("RMB")} />
          
        </div>
      </div>
    </div>
  );
}

// Reusable KeyCap Component
function KeyCap({
  label,
  pressed,
  widthClass = "w-10",
  textClass = "text-xs",
}: {
  label: string;
  pressed: boolean;
  widthClass?: string;
  textClass?: string;
}) {
  return (
    <div
      className={`h-10 rounded-lg flex items-center justify-center font-bold transition-all duration-75 ${widthClass} ${textClass} ${
        pressed
          ? "bg-blue-500 text-white translate-y-0.5 shadow-[0_0_12px_rgba(59,130,246,0.5)] border border-blue-400"
          : "bg-white/5 text-neutral-300 border border-white/10"
      }`}
    >
      {label}
    </div>
  );
}

// Custom Mouse Indicator Component
function MouseIndicator({ lmb, rmb }: { lmb: boolean; rmb: boolean }) {
  return (
    <div className="w-16 h-28 rounded-full border border-white/10 bg-white/5 p-1 flex flex-col gap-1 shadow-inner">
      {/* Top half: Clickers */}
      <div className="flex gap-1 h-[45%]">
        {/* Left Mouse Button */}
        <div
          className={`flex-1 rounded-tl-full rounded-tr-sm rounded-b-sm transition-all duration-75 border border-white/5 ${
            lmb
              ? "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)] translate-y-0.5 border-blue-400"
              : "bg-white/10"
          }`}
        />
        {/* Right Mouse Button */}
        <div
          className={`flex-1 rounded-tr-full rounded-tl-sm rounded-b-sm transition-all duration-75 border border-white/5 ${
            rmb
              ? "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)] translate-y-0.5 border-blue-400"
              : "bg-white/10"
          }`}
        />
      </div>
      
      {/* Bottom half: Palm Rest & Scroll Wheel Groove */}
      <div className="flex-1 rounded-b-full rounded-t-sm bg-white/5 flex items-start justify-center pt-2">
        <div className="w-1.5 h-4 rounded-full bg-white/10 shadow-inner" />
      </div>
    </div>
  );
}