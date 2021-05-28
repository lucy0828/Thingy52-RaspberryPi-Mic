# Thingy52-RaspberryPi-Mic
This project is based on [Nordic Thingy:52 Node.js library](https://github.com/NordicPlayground/Nordic-Thingy52-Nodejs/blob/master/README.md) example.

> See [RASPBERRYPI.md](https://github.com/NordicPlayground/Nordic-Thingy52-Nodejs/blob/master/RASPBERRYPI.md) for how to set it up on a Raspberry Pi running Raspbian.

## Prerequisites
1. Download [Node.js](https://nodejs.org/en/download/) ARMv7.
2. Extract files
3. Copy files into local directory: `cd node-v10.15.3-linux-arm71/` `sudo cp -R * /usr/local/`
4. Check Node.js and npm version: `node -v` `npm -v`
5. [noble-device](https://github.com/sandeepmistry/noble-device) (A [Node.js](https://nodejs.org/en/) lib to abstract BLE (Bluetooth Low Energy) peripherals, using [noble](https://github.com/sandeepmistry/noble)).
6. Bluetooth 4.0 USB dongle supported by [noble](https://github.com/sandeepmistry/noble) and [node-bluetooth-hci-socket](https://github.com/sandeepmistry/node-bluetooth-hci-socket#prerequisites).

## Installation
1. Install noble-device: `npm install noble-device`
2. Install package: `npm install thingy52`
3. Install node version manager: `sudo npm install -g n`
4. Downgrade node to v 8.9.0 by: `sudo n 8.9.0`
5. Install bluetooth socket: `sudo npm install bluetooth-hci-socket --unsafe-perm`
6. Find examples `cd node_modules/thingy52/examples`

## Examples
A few examples like reading environment sensor data, reading button presses, color sensor calibration, connecting Thingy:52 to Firebase and more can be found under the examples folder.
1. Find examples `cd node_modules/thingy52/examples`
2. RCheck if the example you want to run has other required npm packages by opening the example. As we can see below the radio.js script requires icecast, lame and util.
```javascript
var Thingy = require('../index');
var icecast = require("icecast");
var lame = require("lame");
var util = require('util');
```
3. Install required npm packages: `npm install <package name>`
4. Run example: `sudo node <example_name>.js`
5. Microphone.js option '-a' specifies Thingy:52 ID to connect: `sudo node microphone.js -a xxxxxxxxxxxx

## Microphone 
1. Clone repository and change repository name to `microphone`
2. Install required npm packages: 
3. Create folder `audio` to save recorded pcm files: `~/node_modules/thingy52/microphone/audio/`
```
npm install fs
npm install date-and-time
```
3. Run microphone.js: `sudo node microphone.js`
4. When Thingy52 is connected to Raspberry Pi, press button to record
5. Recorded file is saved as pcm file format
6. Convert raw pcm to WAV file using ffmpeg
> [Installing ffmpeg on Raspbian](https://blog.naver.com/chandong83/220851288433)

> ffmpeg usage
```
ffmpeg -f s16le -ar 16000 -ac 1 -i <input file> <output file>
```
* -f ‘force’ format = PCM signed 16-bit little endian
* -ar ‘audio rate’ sampling rate = 16K (voice audio)
* -ac ‘audio channels’ = mono (1)
* -i ‘input’ file name 
