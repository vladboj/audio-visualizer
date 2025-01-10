// DOM Elements
const micRadio = document.getElementById('btnradio-mic');
const fileRadio = document.getElementById('btnradio-file');
const visualizationTypeControl = document.getElementById('visualization-type-control');
const waveformRadio = document.getElementById('btnradio-wav');
const frequencyRadio = document.getElementById('btnradio-freq');
const fileInputContainer = document.getElementById('file-input-container');
const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const audioElement = document.getElementById('audio-element');

// Variables
let audioContextMic, audioContextFile;
let sourceMic, sourceFile;
let analyserMic, analyserFile;
let animationFrameId;
let isWaveform = true; // Default to waveform visualization

// Event Listeners
micRadio.addEventListener('change', async () => {
  cleanupAnimationFrame();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  visualizationTypeControl.classList.remove('d-none');
  fileInputContainer.classList.add('d-none');
  audioElement.classList.add('d-none');
  audioElement.pause();

  // Initialize audio input from microphone
  try {
    if (!audioContextMic) {
      audioContextMic = new AudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      sourceMic = audioContextMic.createMediaStreamSource(stream);
      analyserMic = audioContextMic.createAnalyser();
      analyserMic.fftSize = 2048;
      sourceMic.connect(analyserMic);
    }

    visualize(analyserMic);
  } catch (err) {
    alert('This app needs microphone permission!');
  }
});

fileRadio.addEventListener('change', async () => {
  cleanupAnimationFrame();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  visualizationTypeControl.classList.remove('d-none');
  fileInputContainer.classList.remove('d-none');
  audioElement.classList.remove('d-none');

  if (!audioContextFile) {
    audioContextFile = new AudioContext();
    sourceFile = audioContextFile.createMediaElementSource(audioElement);
    analyserFile = audioContextFile.createAnalyser();
    analyserFile.fftSize = 2048;
    sourceFile.connect(analyserFile);
    analyserFile.connect(audioContextFile.destination);
  }
});

// Handle visualization type toggle
waveformRadio.addEventListener('change', () => (isWaveform = true));
frequencyRadio.addEventListener('change', () => (isWaveform = false));

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    audioElement.src = url;
    audioElement.load();

    visualize(analyserFile);
  }
});

audioElement.addEventListener('play', () => {
  visualize(analyserFile);
});

// Helper Functions
function cleanupAnimationFrame() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function visualize(analyser) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function render() {
    animationFrameId = requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isWaveform) {
      analyser.getByteTimeDomainData(dataArray);
      drawWaveform(dataArray, bufferLength);
    } else {
      analyser.getByteFrequencyData(dataArray);
      drawFrequency(dataArray, bufferLength);
    }
  }

  animationFrameId = requestAnimationFrame(render);
}

function drawWaveform(dataArray, bufferLength) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#00ff00';
  ctx.beginPath();

  const sliceWidth = canvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = canvas.height - (v * canvas.height) / 2;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);

    x += sliceWidth;
  }

  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}

function drawFrequency(dataArray, bufferLength) {
  const barWidth = canvas.width / bufferLength;
  let barHeight;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];

    const red = 255; // Keep red high for bright orange
    const green = Math.max(0, 200 - barHeight); // Reduce green as barHeight increases
    const blue = 0; // Keep blue constant for orange shades

    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    const normalizedHeight = (barHeight / 255) * canvas.height;
    ctx.fillRect(x, canvas.height - normalizedHeight, barWidth, normalizedHeight);

    x += barWidth;
  }
}
