import React, { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";

interface InputPayload {
  event_type: "keydown" | "keyup" | "mousedown" | "mouseup";
  code: string;
}

export default function App() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unlistenPromise = listen<InputPayload>("ghostkey-input", (event) => {
      const { event_type, code } = event.payload;

      setActiveKeys((prev) => {
        const next = new Set(prev);
        if (event_type === "keydown" || event_type === "mousedown") {
          next.add(code);
        } else if (event_type === "keyup" || event_type === "mouseup") {
          next.delete(code);
        }
        return next;
      });
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
        className="w-80 p-4 rounded-2xl bg-neutral-900/80 backdrop-blur-md border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing"
      >
        {/* Drag Header */}
        <div
          data-tauri-drag-region
          className="flex justify-between items-center text-[10px] font-bold tracking-widest text-neutral-400 mb-3"
        >
          <span data-tauri-drag-region>GHOSTKEY</span>
          <span data-tauri-drag-region className="text-neutral-500 font-normal">drag here</span>
        </div>

        {/* Keys & Mouse Layout */}
        <div className="flex gap-4 items-center justify-center pointer-events-none">
          {/* WASD Block */}
          <div className="flex flex-col items-center gap-1.5">
            <KeyCap label="W" pressed={isPressed("KeyW")} />
            <div className="flex gap-1.5">
              <KeyCap label="A" pressed={isPressed("KeyA")} />
              <KeyCap label="S" pressed={isPressed("KeyS")} />
              <KeyCap label="D" pressed={isPressed("KeyD")} />
            </div>
            <KeyCap label="SPACE" pressed={isPressed("Space")} wide />
          </div>

          {/* Mouse Block */}
          <div className="flex flex-col gap-1.5 justify-center">
            <div className="flex gap-1.5">
              <KeyCap label="LMB" pressed={isPressed("ButtonLeft")} />
              <KeyCap label="RMB" pressed={isPressed("ButtonRight")} />
            </div>
            <KeyCap label="SHIFT" pressed={isPressed("ShiftLeft")} wide />
          </div>
        </div>
      </div>
    </div>
  );
}

function KeyCap({
  label,
  pressed,
  wide = false,
}: {
  label: string;
  pressed: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={`h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-75 ${
        wide ? "w-24" : "w-10"
      } ${
        pressed
          ? "bg-blue-500 text-white translate-y-0.5 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
          : "bg-white/5 text-neutral-300 border border-white/10"
      }`}
    >
      {label}
    </div>
  );
}