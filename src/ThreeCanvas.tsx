import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Experience from "./Scene/Experience";

const ThreeCanvas = () => {
  console.log("engine render");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<number>(0);

  const experience = useRef<Experience | null>(null);
  const [_, rerender] = useState({});

  useLayoutEffect(() => {
    setup();
    loopRef.current = requestAnimationFrame(animate);
  }, []);

  const setup = () => {
    if (!canvasRef.current) {
      return;
    }
    experience.current = new Experience(canvasRef.current);
    rerender({});
  };

  const animate = (timestamp: number) => {
    if (!experience.current) {
      return;
    }
    experience.current.update(timestamp);
    loopRef.current = requestAnimationFrame(animate);
  };

  return (
    <>
      <div style={{ position: "absolute", top: "3vh", right: "3vw" }}>
        {experience.current?.isFirstPerson && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <p>Use W-A-S-D to fly, Use the pointer to Look</p>
            <button
              onClick={() => {
                experience.current?.setFirstPersonControls(false);
                rerender({});
              }}
            >
              Switch to Orbit Controls{" "}
            </button>
          </div>
        )}
        {!experience.current?.isFirstPerson && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <p>Use the pointer to Orbit</p>
            <button
              onClick={() => {
                experience.current?.setFirstPersonControls(true);
                rerender({});
              }}
            >
              Switch to First Person Controls{" "}
            </button>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
};
export default ThreeCanvas;
