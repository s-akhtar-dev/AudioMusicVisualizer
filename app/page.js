"use client"; // Mark this file as a client component

import React, { useEffect, useRef } from "react";

const App = () => {
  const canvasRef = useRef(null);
  const audioContext = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const analyzerNode = useRef(audioContext.current.createAnalyser());

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioContext.current.createMediaStreamSource(stream);
        source.connect(analyzerNode.current);

        analyzerNode.current.fftSize = 2048;
        visualize();
      })
      .catch((err) => console.error("Error accessing audio devices:", err));
  }, []);

  const visualize = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyzerNode.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);

      analyzerNode.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#0f2027");
      gradient.addColorStop(0.5, "#203a43");
      gradient.addColorStop(1, "#2c5364");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * 1.5;

        // Dynamic colors based on bar height
        const red = (barHeight + 25) * 2;
        const green = 250 - barHeight;
        const blue = 150 + barHeight;

        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        // Add glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgb(${red}, ${green}, ${blue})`;

        x += barWidth + 2;
      }
    };

    draw();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1 style={{ color: "white", textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" }}>
        Dynamic Music Visualizer
      </h1>
      <canvas
        ref={canvasRef}
        width={1000}
        height={500}
        style={{
          border: "2px solid #fff",
          borderRadius: "15px",
          marginTop: "20px",
        }}
      ></canvas>
    </div>
  );
};

export default App;
