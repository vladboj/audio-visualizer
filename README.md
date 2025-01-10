## About
A frontend app created as part of my Multimedia course to explore the Web Audio and Canvas APIs with a fun theme of audio visualizing.

## Usage
- Access this [link](https://vladboj.github.io/audio-visualizer/).
- You can either visualize your live microphone input, or upload an audio file.
- There are two modes of visualization: Waveform and Frequency.
- Have fun! :P

## How it works
An `analyser` node from the Web Audio API is used to perform a Fast Fourier Transform (FFT) on the input data.
The output is obtained using the `AnalyserNode: getByteTimeDomainData` method for Waveform visualization, and `AnalyserNode: getByteFrequencyData` for Frequency visualization.
Then the output is rendered on the screen using the Canvas API.

## Technologies
- HTML
- JavaScript
- Bootstrap
