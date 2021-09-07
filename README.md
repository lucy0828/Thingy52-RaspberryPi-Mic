# Thingy52-RaspberryPi-Mic
This project is based on [Nordic Thingy:52 Node.js library](https://github.com/NordicPlayground/Nordic-Thingy52-Nodejs/blob/master/README.md) example. It focus on connecting and collecting microphone data through BLE between Thingy:52 and Raspberry Pi or Linux OS. 

> See [RASPBERRYPI.md](https://github.com/NordicPlayground/Nordic-Thingy52-Nodejs/blob/master/RASPBERRYPI.md) for how to set it up on a Raspberry Pi running Raspbian.

## Installation for Raspbian 
1. Download [Node.js](https://nodejs.org/en/download/) ARMv7.
2. Check Node.js and npm version: `node -v` `npm -v`
3. Install noble-device: `npm install noble-device`
4. Install package: `npm install thingy52`
5. Install node version manager: `sudo npm install -g n`
6. Downgrade node to v 8.9.0 by: `sudo n 8.9.0`
7. Install bluetooth socket: `sudo npm install bluetooth-hci-socket --unsafe-perm`
8. Find examples `cd node_modules/thingy52/examples`

## Installation for Linux OS
1. Download [Node.js](https://nodejs.org/en/download/) Linux Binaries (x64).
2. Follow the same steps as instructed in 'Installation for Raspbian'.

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

## microphone.js
`microphone.js` connects Thingy:52 with Raspberry Pi or BLE supported Linux device and streams microphone data in raw PCM files.

1. Clone repository and change repository name to `microphone`
2. Install required npm packages: 
3. Create folder `audio` to save recorded pcm files: `~/node_modules/thingy52/microphone/audio/`
```
npm install fs
npm install date-and-time
```
3. Run microphone.js: `sudo node microphone.js`
4. When Thingy52 is connected to Raspberry Pi, press button to record
5. Recorded file is saved as PCM file format
6. To autostart microphone.js when Raspberry Pi is powered on,
> edit /etc/xdg/lxsession/LXDE-pi/autostart to
```
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash
@/home/pi/node_modules/thingy52/microphone/exe.sh
```
> force HDMI output in /boot/config.txt 
```
# uncomment if hdmi display is not detected and composite is being output
hdmi_force_hotplug=1
``` 
7. Convert raw pcm to WAV file using ffmpeg
> [Installing ffmpeg on Raspbian](https://blog.naver.com/chandong83/220851288433)

> ffmpeg usage
```
ffmpeg -f s16le -ar 16000 -ac 1 -i <input file> <output file>
```
* -f ‘force’ format = PCM signed 16-bit little endian
* -ar ‘audio rate’ sampling rate = 16K (voice audio)
* -ac ‘audio channels’ = mono (1)
* -i ‘input’ file name 
8. To convert multiple pcm files in `audio` folder, run `./convert_pcm_to_wav` inside the folder 

## microphone_wav.js
`microphone_wav.js` connects Thingy:52 with Raspberry Pi or BLE supported Linux device and streams microphone data.
Unlike `microphone.js`, this automatically wraps PCM data into WAV format and saves streaming microphone data in `test.wav` file.
When microphone is disabled and enabled once again using button, data is overwritten on `test.wav` file. 

To run `microphone_wav.js`: 
1. Install `npm install wav`
2. Install `npm install date-and-time`
3. Run `sudo node microphone_wav.js`

## mic_env.js
`mic_env.js` connects Thingy:52 with Raspberry Pi or BLE supported Linux device and collects both microphone and environment data.
When Thingy:52 connects to your BLE device, it enables temperature, humidity, gas and color sensors and log environment data with current date and time to envlog_test.txt.
When button is pressed for the first time, all environment sensors are disabled. 
When button is pressed once again and the LED turns to blue, both environment sensors and microphone are enabled and Thingy:52 sends the data.
Microphone data is saved in WAV file in `audio` directory as `test.wav` and environment data is logged in envlog_test.txt.

To run `mic_env.js`:
1. Install `npm install wav`
2. Install `npm install date-and-time`
3. Run `sudo node mic_env.js`
