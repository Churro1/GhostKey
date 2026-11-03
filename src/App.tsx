import { useEffect, useState, useRef } from "react";
import { listen } from "@tauri-apps/api/event";

type Bindings = {
  up: string;
  left: string;
  down: string;
  right: string;
  mod1: string;
  mod2: string;
  action: string;
  pause: string; // New pause hotkey
};

const DEFAULT_BINDINGS: Bindings = {
  up: "W",
  left: "A",
  down: "S",
  right: "D",
  mod1: "LControl",
  mod2: "LShift",
  action: "Space",
  pause: "F9",
};

// Formats long hardware key names into clean overlay labels
function formatLabel(code: string) {
  const map: Record<string, string> = {
    LControl: "CTRL",
    RControl: "CTRL",
    LShift: "SHIFT",
    RShift: "SHIFT",
    Space: "SPACE",
    LAlt: "ALT",
    RAlt: "ALT",
    LMeta: "CMD",
    RMeta: "CMD",
    Up: "▲",
    Down: "▼",
    Left: "◀",
    Right: "▶",
    Return: "ENTER",
    Escape: "ESC",
  };
  return map[code] || code.toUpperCase();
}

export default function App() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [targetSlot, setTargetSlot] = useState<keyof Bindings | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Load bindings; spread DEFAULT_BINDINGS to ensure 'pause' exists on old saves
  const [bindings, setBindings] = useState<Bindings>(() => {
    const saved = localStorage.getItem("ghostkey-bindings");
    return saved ? { ...DEFAULT_BINDINGS, ...JSON.parse(saved) } : DEFAULT_BINDINGS;
  });

  // Keep mutable refs for the listener closure so it always has the freshest state
  const isPausedRef = useRef(isPaused);
  const pauseKeyRef = useRef(bindings.pause);
  const isEditingRef = useRef(isEditing);
  const prevKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { pauseKeyRef.current = bindings.pause; }, [bindings.pause]);
  useEffect(() => { isEditingRef.current = isEditing; }, [isEditing]);

  // Save bindings whenever they change
  useEffect(() => {
    localStorage.setItem("ghostkey-bindings", JSON.stringify(bindings));
  }, [bindings]);

  // Main listener for hardware polling
  useEffect(() => {
    const unlistenPromise = listen<string[]>("ghostkey-state", (event) => {
      const currentKeys = new Set(event.payload);

      // Hotkey Edge Detection (only toggle when the key is initially pressed down)
      if (!isEditingRef.current) {
        const pauseKey = pauseKeyRef.current;
        if (currentKeys.has(pauseKey) && !prevKeysRef.current.has(pauseKey)) {
          isPausedRef.current = !isPausedRef.current;
          setIsPaused(isPausedRef.current);
        }
      }

      prevKeysRef.current = currentKeys;

      // If paused, clear all visual active keys so nothing lights up
      if (isPausedRef.current && !isEditingRef.current) {
        setActiveKeys(new Set());
      } else {
        setActiveKeys(currentKeys);
      }
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  // Intercept the first keypress when waiting for a new bind
  useEffect(() => {
    if (targetSlot && activeKeys.size > 0) {
      const pressed = Array.from(activeKeys).find((k) => k !== "LMB" && k !== "RMB");
      if (pressed) {
        setBindings((prev) => ({ ...prev, [targetSlot]: pressed }));
        setTargetSlot(null);
      }
    }
  }, [activeKeys, targetSlot]);

  const isPressed = (code: string) => activeKeys.has(code);

  const handleKeyClick = (slot: keyof Bindings) => {
    if (isEditing) setTargetSlot(slot);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center p-4">
      {/* Draggable HUD Card */}
      <div
        data-tauri-drag-region
        className="w-auto min-w-[340px] p-5 rounded-3xl bg-neutral-900/80 backdrop-blur-md border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing transition-colors duration-300"
      >
        <div
          data-tauri-drag-region
          className="flex justify-between items-center text-[10px] font-bold tracking-widest text-neutral-400 mb-4 px-1"
        >
          <span data-tauri-drag-region className={isPaused && !isEditing ? "text-red-400" : ""}>
            {isEditing ? (targetSlot ? "PRESS NEW KEY..." : "SELECT KEY TO REBIND") : isPaused ? "PAUSED" : "GHOSTKEY"}
          </span>

          <div className="flex gap-2">
            {/* Pause / Bind Toggle */}
            <button
              onClick={() => {
                if (isEditing) setTargetSlot("pause");
                else setIsPaused(!isPaused);
              }}
              className={`pointer-events-auto px-2 py-1 rounded transition-colors border ${
                isEditing && targetSlot === "pause"
                  ? "bg-yellow-500 text-yellow-900 border-yellow-400 animate-pulse"
                  : isEditing
                  ? "bg-white/10 text-white border-white/30 border-dashed hover:bg-white/20"
                  : isPaused
                  ? "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30"
                  : "bg-white/5 text-neutral-500 border-transparent hover:text-white"
              }`}
            >
              {isEditing
                ? targetSlot === "pause" ? "?" : `PAUSE: ${formatLabel(bindings.pause)}`
                : isPaused ? "RESUME" : `PAUSE (${formatLabel(bindings.pause)})`}
            </button>

            {/* Edit Button */}
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setTargetSlot(null);
              }}
              className={`pointer-events-auto px-2 py-1 rounded transition-colors ${
                isEditing ? "bg-blue-500 text-white" : "bg-white/5 text-neutral-500 hover:text-white"
              }`}
            >
              {isEditing ? "DONE" : "EDIT"}
            </button>
          </div>
        </div>

        {/* Keys & Mouse Layout */}
        <div
          className={`flex gap-6 items-end justify-center transition-all duration-300 ${
            isEditing ? "pointer-events-auto" : "pointer-events-none"
          } ${isPaused && !isEditing ? "opacity-30 grayscale" : "opacity-100"}`}
        >
          {/* Keyboard Block */}
          <div className="flex flex-col items-center gap-1.5">
            <KeyCap
              label={formatLabel(bindings.up)}
              pressed={isPressed(bindings.up)}
              isEditing={isEditing}
              isTarget={targetSlot === "up"}
              onClick={() => handleKeyClick("up")}
            />

            <div className="flex gap-1.5">
              <KeyCap
                label={formatLabel(bindings.left)}
                pressed={isPressed(bindings.left)}
                isEditing={isEditing}
                isTarget={targetSlot === "left"}
                onClick={() => handleKeyClick("left")}
              />
              <KeyCap
                label={formatLabel(bindings.down)}
                pressed={isPressed(bindings.down)}
                isEditing={isEditing}
                isTarget={targetSlot === "down"}
                onClick={() => handleKeyClick("down")}
              />
              <KeyCap
                label={formatLabel(bindings.right)}
                pressed={isPressed(bindings.right)}
                isEditing={isEditing}
                isTarget={targetSlot === "right"}
                onClick={() => handleKeyClick("right")}
              />
            </div>

            {/* Bottom Modifier & Space Row */}
            <div className="flex gap-1.5">
              <KeyCap
                label={formatLabel(bindings.mod1)}
                pressed={isPressed(bindings.mod1)}
                isEditing={isEditing}
                isTarget={targetSlot === "mod1"}
                onClick={() => handleKeyClick("mod1")}
                widthClass="w-12"
                textClass="text-[9px]"
              />
              <KeyCap
                label={formatLabel(bindings.mod2)}
                pressed={isPressed(bindings.mod2)}
                isEditing={isEditing}
                isTarget={targetSlot === "mod2"}
                onClick={() => handleKeyClick("mod2")}
                widthClass="w-14"
                textClass="text-[10px]"
              />
              <KeyCap
                label={formatLabel(bindings.action)}
                pressed={isPressed(bindings.action)}
                isEditing={isEditing}
                isTarget={targetSlot === "action"}
                onClick={() => handleKeyClick("action")}
                widthClass="w-24"
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
  isEditing = false,
  isTarget = false,
  onClick,
}: {
  label: string;
  pressed: boolean;
  widthClass?: string;
  textClass?: string;
  isEditing?: boolean;
  isTarget?: boolean;
  onClick?: () => void;
}) {
  let baseStyle = "bg-white/5 text-neutral-300 border border-white/10";

  if (isTarget) {
    baseStyle = "bg-yellow-500 text-yellow-900 border border-yellow-400 animate-pulse";
  } else if (isEditing) {
    baseStyle = "bg-white/10 text-white border border-white/30 border-dashed hover:bg-white/20 cursor-pointer";
  } else if (pressed) {
    baseStyle = "bg-blue-500 text-white translate-y-0.5 shadow-[0_0_12px_rgba(59,130,246,0.5)] border border-blue-400";
  }

  return (
    <div
      onClick={onClick}
      className={`h-10 rounded-lg flex items-center justify-center font-bold transition-all duration-75 ${widthClass} ${textClass} ${baseStyle}`}
    >
      {isTarget ? "?" : label}
    </div>
  );
}


// Custom Mouse Indicator Component
function MouseIndicator({ lmb, rmb }: { lmb: boolean; rmb: boolean }) {
  return (
    <div className="w-16 h-28 rounded-full border border-white/10 bg-white/5 p-1 flex flex-col gap-1 shadow-inner">
      <div className="flex gap-1 h-[45%]">
        <div
          className={`flex-1 rounded-tl-full rounded-tr-sm rounded-b-sm transition-all duration-75 border border-white/5 ${
            lmb ? "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)] translate-y-0.5 border-blue-400" : "bg-white/10"
          }`}
        />
        <div
          className={`flex-1 rounded-tr-full rounded-tl-sm rounded-b-sm transition-all duration-75 border border-white/5 ${
            rmb ? "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)] translate-y-0.5 border-blue-400" : "bg-white/10"
          }`}
        />
      </div>
      <div className="flex-1 rounded-b-full rounded-t-sm bg-white/5 flex items-start justify-center pt-2">
        <div className="w-1.5 h-4 rounded-full bg-white/10 shadow-inner" />
      </div>
    </div>
  );
}