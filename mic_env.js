/*
  Copyright (c) 2010 - 2017, Nordic Semiconductor ASA
  All rights reserved.
  Redistribution and use in source and binary forms, with or without modification,
  are permitted provided that the following conditions are met:
  1. Redistributions of source code must retain the above copyright notice, this
     list of conditions and the following disclaimer.
  2. Redistributions in binary form, except as embedded into a Nordic
     Semiconductor ASA integrated circuit in a product or a software update for
     such product, must reproduce the above copyright notice, this list of
     conditions and the following disclaimer in the documentation and/or other
     materials provided with the distribution.
  3. Neither the name of Nordic Semiconductor ASA nor the names of its
     contributors may be used to endorse or promote products derived from this
     software without specific prior written permission.
  4. This software, with or without modification, must only be used with a
     Nordic Semiconductor ASA integrated circuit.
  5. Any software provided in binary form under this license must not be reverse
     engineered, decompiled, modified and/or disassembled.
  THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS
  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
  OF MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
  LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
  HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
  LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
  OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var Thingy = require('../index');
var fs = require('fs');
var FileWriter = require('wav').FileWriter;
const date = require('date-and-time');

var connected_thingy;
var thingy_id;

var button;
var count = 2;
var outF;
var led = {
    r : 0,
    g : 10,
    b : 10
}

/** Intel ADPCM step variation table */
var INDEX_TABLE = [-1, -1, -1, -1, 2, 4, 6, 8, -1, -1, -1, -1, 2, 4, 6, 8,];

/** ADPCM step size table */
var STEP_SIZE_TABLE = [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45, 50, 55, 60, 66, 73, 80, 88, 97, 107, 118, 130, 143, 157, 173, 190, 209,
        230, 253, 279, 307, 337, 371, 408, 449, 494, 544, 598, 658, 724, 796, 876, 963, 1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024, 3327, 3660, 4026, 4428, 4871, 5358,
        5894, 6484, 7132, 7845, 8630, 9493, 10442, 11487, 12635, 13899, 15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794, 32767];

function adpcm_decode(adpcm) {
    // Allocate output buffer
	pcm = new Buffer(adpcm.data.length*4);
    // The first 2 bytes of ADPCM frame are the predicted value
	var valuePredicted = adpcm.header.readInt16BE(0);
	// The 3rd byte is the index value
	var index = adpcm.header.readInt8(2);

	if (index < 0)
		index = 0;
	if (index > 88)
		index = 88;

	var diff; /* Current change to valuePredicted */
	var bufferStep = false;
	var inputBuffer = 0;
	var delta = 0;
	var sign = 0;
	var step = STEP_SIZE_TABLE[index];

	for (var _in = 0, _out = 0; _in < adpcm.data.length; _out += 2) {
		/* Step 1 - get the delta value */
		if (bufferStep) {
			delta = inputBuffer & 0x0F;
            _in++;
		}
        else {
			inputBuffer = adpcm.data.readInt8(_in);
			delta = (inputBuffer >> 4) & 0x0F;
		}
		bufferStep = !bufferStep;

		/* Step 2 - Find new index value (for later) */
		index += INDEX_TABLE[delta];
		if (index < 0) {
            index = 0;
        }
		if (index > 88) {
            index = 88;
        }

		/* Step 3 - Separate sign and magnitude */
		sign = delta & 8;
		delta = delta & 7;

		/* Step 4 - Compute difference and new predicted value */
		diff = (step >> 3);
		if ((delta & 4) > 0)
			diff += step;
		if ((delta & 2) > 0)
			diff += step >> 1;
		if ((delta & 1) > 0)
			diff += step >> 2;

		if (sign > 0)
			valuePredicted -= diff;
		else
			valuePredicted += diff;

		/* Step 5 - clamp output value */
		if (valuePredicted > 32767)
			valuePredicted = 32767;
		else if (valuePredicted < -32768)
			valuePredicted = -32768;

		/* Step 6 - Update step value */
		step = STEP_SIZE_TABLE[index];

		/* Step 7 - Output value */
		pcm.writeInt16LE(valuePredicted,  _out);
	}

	return pcm;
}

/** Environment Sensor **/
var envlog = '/home/pi/node_modules/thingy52/microphone/log/envlog.txt';
var env = {
    temp: 0,
    humd:0,
    co2: 0,
    voc: 0,
    red: 0,
    green: 0,
    blue: 0,
    clear: 0
}

fs.open(envlog, 'a+', function(err,fd){
    if (err) throw err;
    console.log('Environment log file open complete');
});

fs.appendFile(envlog, 'Timestamp,Temperature,Humidity,CO2,VOC,Red,Green,Blue,Clear\n', function (err) {
    if (err) throw err;
});

function onTemperatureData(temperature) {
    env.temp = temperature;
    console.log('Temperature sensor:' + temperature);
}

function onHumidityData(humidity) {
    env.humd = humidity;
    console.log('Humidity sensor:' + humidity);
}

function onGasData(gas) {
    env.co2 = gas.eco2;
    env.voc = gas.tvoc;
    console.log('Gas sensor: eCO2 ' + gas.eco2 + ' - TVOC ' + gas.tvoc );
}

function onColorData(color) {
    env.red = color.red;
    env.green = color.green;
    env.blue = color.blue;
    env.clear = color.clear;
    console.log('Color sensor: r ' + color.red +
                             ' g ' + color.green +
                             ' b ' + color.blue +
                             ' c ' + color.clear );

    var now = date.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

    fs.appendFile(envlog, now + ','  + env.temp + ','  + env.humd + ',' + env.co2 + ',' + env.voc + ',' + env.red + ',' + env.green + ',' + env.blue + ',' + env.clear + '\n', function (err) {
	if (err) throw err;
    });
}

/** Battery Level */
var batterylog = '/home/pi/node_modules/thingy52/microphone/log/batterylog.txt';
fs.open(batterylog, 'w+', function(err,fd){
	if (err) throw err;
	console.log('Battery log file open complete');
});

function onBatteryLevelChange(level) {
	var now = date.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
	fs.appendFile('batterylog.txt', now + ' Battery level: ' + level + '%\n', function (err) {
		if (err) throw err;
	});
   console.log(now + ' Battery level: ' + level + '%');
}

/** Button-Time log **/
var buttonlog = '/home/pi/node_modules/thingy52/microphone/log/buttonlog.txt';

fs.open(buttonlog, 'a+', function(err,fd){
    if (err) throw err;
    console.log('Button log file open complete');
});

fs.appendFile(buttonlog, 'FileNumber,StartTime,EndTime\n', function (err) {
    if (err) throw err;
});

/** Microphone-Button-LED */
function onButtonChange(state) {
    button = state;
    if (state == 'Pressed') 
    {
	count = count + 1;
    }
    if (state == 'Released')
    {
	if (count%2 == 1) {

	    /** Define Audio File Name **/
	    var now = date.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
	    var name = date.format(new Date(), 'MMDDHHmmss');
	    fs.appendFile(buttonlog, name + ','  + now + ',', function (err) {
		if (err) throw err;
	    });
	    outF = new FileWriter('/home/pi/node_modules/thingy52/microphone/audio/' + name + '.wav', {
		sampleRate: 16000,
		channels: 1});

	    connected_thingy.mic_enable(function(error) {
		console.log('Microphone enabled! ' + ((error) ? error : ''));
	    });

	    connected_thingy.led_set(led);
	}
        else
        {
	    var now = date.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
	    fs.appendFile(buttonlog, now + '\n', function (err) {
		if (err) throw err;
	    });

	    connected_thingy.mic_disable(function(error) {
		console.log('Microphone disabled! ' + ((error) ? error : ''));
	    });

	    connected_thingy.led_off(led);
        }
    }
}


/** Decode and write pcm */
function onMicData(adpcm) {
    var pcm = adpcm_decode(adpcm, true);
    outF.write(pcm);
}

/** Thingy Discover and Connect */
function onDiscover(thingy) {
  console.log('Discovered: ' + thingy);

  thingy.on('disconnect', function() {
    console.log('Disconnected!');
  });

  thingy.connectAndSetUp(function(error) {
    connected_thingy = thingy;
    console.log('Connected! ' + ((error) ? error : ''));
    thingy.on('buttonNotif', onButtonChange);
    thingy.on('MicrophoneNotif', onMicData);
    thingy.on('batteryLevelChange', onBatteryLevelChange);
    thingy.on('temperatureNotif', onTemperatureData);
    thingy.on('humidityNotif', onHumidityData);
    thingy.on('gasNotif', onGasData);
    thingy.on('colorNotif', onColorData);

    thingy.temperature_interval_set(1000, function(error) {
        if (error) {
            console.log('Temperature sensor configure! ' + error);
        }
    });
    thingy.pressure_interval_set(1000, function(error) {
        if (error) {
            console.log('Pressure sensor configure! ' + error);
        }
    });
    thingy.humidity_interval_set(1000, function(error) {
        if (error) {
            console.log('Humidity sensor configure! ' + error);
        }
    });
    thingy.gas_mode_set(1, function(error) {
        if (error) {
            console.log('Gas sensor configure! ' + error);
        }
    });
    thingy.color_interval_set(1000, function(error) {
        if (error) {
            console.log('Color sensor configure! ' + error);
        }
    });

    thingy.temperature_enable(function(error) {
        console.log('Temperature sensor started! ' + ((error) ? error : ''));
    });
    thingy.humidity_enable(function(error) {
        console.log('Humidity sensor started! ' + ((error) ? error : ''));
    });
    thingy.gas_enable(function(error) {
        console.log('Gas sensor started! ' + ((error) ? error : ''));
    });
    thingy.color_enable(function(error) {
        console.log('Color sensor started! ' + ((error) ? error : ''));
    });
    thingy.notifyBatteryLevel(function(error) {
      console.log('Battery Level Notifications enabled! ' + ((error) ? error : ''));
    });
    thingy.button_enable(function(error) {
      console.log('Button enabled! ' + ((error) ? error : ''));
    });
  });
}

console.log('Microphone example, press the button on the Thingy:52 before speaking.');

//Option '-a': specify Thingy ID to connect
process.argv.forEach(function(val, index, array) {
    if (val == '-a') {
        if (process.argv[index + 1]) {
            thingy_id = process.argv[index + 1];
        }
    }
});


if (!thingy_id) {
    Thingy.discover(onDiscover);
}
else {
    Thingy.discoverById(thingy_id, onDiscover);
}

