# Artsie - Arty Selfies with Arbitrary Style Transfer

This is a small webapp that lets the user take a selfie and apply
styling from different paintings to the photo. It uses a machine learning to do "style transfer" from one 
image to another (see paper linked below).

At the heart of it is a neural network in Tensorflow.js, with weights trainined 
on about 80 000 paintings.

![artsie process](/documentation_assets/artsie-process.png)

- Website: [Bitvergnügen/Artsie](https://bitvergnügen.de/artsie)
- The paper which this is based on: [Exploring the structure of a real-time, arbitrary neural artistic stylization network](https://arxiv.org/abs/1705.06830)
- The convenience library for Javascript, which does the heavy lifting: [@magenta/image](https://tensorflow.github.io/magenta-js/image/)
- Library or machine learning algorithms in the Javascritp: [Tensorflow.js](https://www.tensorflow.org/js)

## Installation

	npm install

## Building App

All dependencies are installed locally, so you need to prefix run gulp via npx

	npx gulp
	
## Develop

Start a local server with hot reload.

	npx gulp watch_local

## Known Issues

- No pictures produced on *iOS devices*
    - It seems iOS handles the `canvas` tag differently somehow. The end result is black frames instead of images.
    
 

