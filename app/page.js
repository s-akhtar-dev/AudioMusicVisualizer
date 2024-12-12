"use client";

import React, { useEffect, useRef } from "react";

const App = () => {
  const canvasRef = useRef(null);
  const audioContext = useRef(null);
  const analyzerNode = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      // Skip audio setup on the server
      return;
    }

    let animationId; // To cancel animation if needed

    const initializeAudio = async () => {
      try {
        // Initialize Audio Context and Analyzer Node
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        analyzerNode.current = audioContext.current.createAnalyser();

        // Request access to the microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.current.createMediaStreamSource(stream);
        source.connect(analyzerNode.current);

        analyzerNode.current.fftSize = 1024; // Set FFT size for frequency analysis
        visualize(); // Start visualizing the audio
      } catch (err) {
        console.error("Error accessing audio devices:", err);
      }
    };

    initializeAudio();

    // Clean up on unmount
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (audioContext.current) audioContext.current.close();
    };
  }, []);

  const visualize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure canvas exists

    const ctx = canvas.getContext("2d");
    const bufferLength = analyzerNode.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);

      analyzerNode.current.getByteFrequencyData(dataArray); // Get frequency data
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

      // Visualization logic here (same as before)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 150;

      const volume = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
      const dynamicRadius = radius + volume / 20;

      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        dynamicRadius / 2,
        centerX,
        centerY,
        dynamicRadius * 2
      );
      gradient.addColorStop(0, "#1e3c72");
      gradient.addColorStop(0.5, "#2a5298");
      gradient.addColorStop(1, "#1c1c1c");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barCount = bufferLength / 2;
      const barWidth = 2;

      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2;
        const barHeight = dataArray[i] * 1.5;

        const xStart = centerX + Math.cos(angle) * dynamicRadius;
        const yStart = centerY + Math.sin(angle) * dynamicRadius;
        const xEnd = centerX + Math.cos(angle) * (dynamicRadius + barHeight);
        const yEnd = centerY + Math.sin(angle) * (dynamicRadius + barHeight);

        const red = Math.sin(angle * 2) * 128 + 127;
        const green = Math.cos(angle * 3) * 128 + 127;
        const blue = Math.sin(angle * 5) * 128 + 127;

        ctx.strokeStyle = `rgb(${Math.floor(red)}, ${Math.floor(green)}, ${Math.floor(blue)})`;
        ctx.lineWidth = barWidth;

        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    draw();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg,rgb(56, 56, 56),rgb(0, 0, 0))",
      }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: "1px solid white" }}
      ></canvas>
    </div>
  );
};

export default App;
