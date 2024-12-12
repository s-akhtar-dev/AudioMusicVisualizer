"use client"; // Mark this file as a client component

import React, { useEffect, useRef } from "react";

const App = () => {
  const canvasRef = useRef(null);
  const audioContext = useRef(null);
  const analyzerNode = useRef(null);

  useEffect(() => {
    let animationId; // To cancel animation if needed
    if (typeof window !== "undefined") {
      // Initialize Audio Context and Analyzer Node
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      analyzerNode.current = audioContext.current.createAnalyser();

      // Request access to the microphone
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const source = audioContext.current.createMediaStreamSource(stream);
          source.connect(analyzerNode.current);

          analyzerNode.current.fftSize = 1024; // Set FFT size for frequency analysis
          visualize(); // Start visualizing the audio
        })
        .catch((err) => console.error("Error accessing audio devices:", err));
    }

    // Clean up on unmount
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (audioContext.current) audioContext.current.close();
    };
  }, []);

  const visualize = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyzerNode.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return; // Ensure canvas exists

      requestAnimationFrame(draw);
      analyzerNode.current.getByteFrequencyData(dataArray); // Get frequency data

      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

      // Center coordinates and circle radius
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 150;

      // Circle bouncing based on volume
      const volume = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
      const dynamicRadius = radius + volume / 20;

      // Draw background gradient
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

      // Draw bars in a circle
      const barCount = bufferLength / 2; // Reduce bar count for better visualization
      const barWidth = 2;

      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2; // Calculate angle for each bar
        const barHeight = dataArray[i] * 1.5; // Scale the height of the bars

        // Calculate start and end points for bars
        const xStart = centerX + Math.cos(angle) * dynamicRadius;
        const yStart = centerY + Math.sin(angle) * dynamicRadius;
        const xEnd = centerX + Math.cos(angle) * (dynamicRadius + barHeight);
        const yEnd = centerY + Math.sin(angle) * (dynamicRadius + barHeight);

        // Dynamic colors for different parts
        const red = Math.sin(angle * 2) * 128 + 127;
        const green = Math.cos(angle * 3) * 128 + 127;
        const blue = Math.sin(angle * 5) * 128 + 127;

        ctx.strokeStyle = `rgb(${Math.floor(red)}, ${Math.floor(green)}, ${Math.floor(blue)})`;
        ctx.lineWidth = barWidth;

        // Draw the bar
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }

      // Draw the dynamic circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    draw(); // Start the drawing loop
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
        color: "white",
      }}
    >
      <h1 style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" }}>Audio Music Visualizer</h1>
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        style={{
          border: "2px solid #fff",
          borderRadius: "50%",
          marginTop: "20px",
          boxShadow: "0px 0px 20px rgba(255,255,255,0.5)",
        }}
      ></canvas>
    </div>
  );
};

export default App;
