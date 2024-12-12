"use client"; // Mark this file as a client component

import React, { useEffect, useRef } from 'react';
//import '../styles/globals.css'; // Ensure you have some basic styles

const App = () => {
  const canvasRef = useRef(null);
  const audioContext = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const analyzerNode = useRef(audioContext.current.createAnalyser());

  useEffect(() => {
    // Request access to the microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const source = audioContext.current.createMediaStreamSource(stream);
        source.connect(analyzerNode.current);
        
        // Do NOT connect to destination to avoid playback
        // analyzerNode.current.connect(audioContext.current.destination); // This line is removed
        
        analyzerNode.current.fftSize = 2048; // Set FFT size for frequency analysis

        visualize();
      })
      .catch(err => console.error('Error accessing audio devices:', err));
  }, []);

  const visualize = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyzerNode.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyzerNode.current.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        ctx.fillStyle = `rgb(${barHeight + 100},50,50)`;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };

    draw();
  };

  return (
    <div className="app">
      <h1>Music Visualizer</h1>
      <canvas ref={canvasRef} width={800} height={400}></canvas>
    </div>
  );
};

export default App;
