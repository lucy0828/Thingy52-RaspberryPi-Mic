var Thingy = require('../index');
var fs = require('fs');
const date = require('date-and-time');

var enabled;
var batterylog = 'batterylog.txt';
fs.open(batterylog, 'a+', function(err,fd){
	if (err) throw err;
	console.log('Battery log file open complete');
});
var environmentlog = 'environmentlog.txt';
fs.open(environmentlog, 'a+', function(err,fd){
	if (err) throw err;
	console.log('Environment log file open complete');
});

console.log('This is Thingy:52 Battery Test');
console.log('Thingy:52 battery level service!');
console.log('Reading Thingy environment sensors!');

function onBatteryLevelChange(level) {
	var now = date.format(new Date(), 'YYYY/MM/DD HH:mm:ss');
	fs.appendFile('batterylog.txt', now + ' Battery level: ' + level + '%\n', function (err) {
		if (err) throw err;
	});
   console.log(now + ' Battery level: ' + level + '%');
}

function onTemperatureData(temperature) {
	fs.appendFile('environmentlog.txt', date.format(new Date(), 'YYYY/MM/DD HH:mm:ss') + ' Temperature: ' + temperature + '\n', function (err) {
		if (err) throw err;
	});
}

function onPressureData(pressure) {
	fs.appendFile('environmentlog.txt', '                    ' + 'Pressure: ' + pressure + '\n', function (err) {
		if (err) throw err;
	});
}

function onHumidityData(humidity) {
	fs.appendFile('environmentlog.txt', '                    ' + 'Humidity: ' + humidity + '\n', function (err) {
		if (err) throw err;
	});
}

function onGasData(gas) {
	fs.appendFile('environmentlog.txt', '                    ' + 
									  'eCO2: ' + gas.eco2 + ' TVOC: ' + gas.tvoc + '\n', function (err) {
		if (err) throw err;
	});
}

function onColorData(color) {
	fs.appendFile('environmentlog.txt', '                    ' + 
									  'Color sensor: r ' + color.red +
                             ' g ' + color.green +
                             ' b ' + color.blue +
                             ' c ' + color.clear + '\n', function (err) {
		if (err) throw err;
	});
}

function onButtonChange(state) {
    if (state == 'Pressed') {
        if (enabled) {
            enabled = false;
            this.temperature_disable(function(error) {
                console.log('Temperature sensor stopped! ' + ((error) ? error : ''));
            });
            this.pressure_disable(function(error) {
                console.log('Pressure sensor stopped! ' + ((error) ? error : ''));
            });
            this.humidity_disable(function(error) {
                console.log('Humidity sensor stopped! ' + ((error) ? error : ''));
            });
            this.color_disable(function(error) {
                console.log('Color sensor stopped! ' + ((error) ? error : ''));
            });
            this.gas_disable(function(error) {
                console.log('Gas sensor stopped! ' + ((error) ? error : ''));
            });
        }
        else {
            enabled = true;
            this.temperature_enable(function(error) {
                console.log('Temperature sensor started! ' + ((error) ? error : ''));
            });
            this.pressure_enable(function(error) {
                console.log('Pressure sensor started! ' + ((error) ? error : ''));
            });
            this.humidity_enable(function(error) {
                console.log('Humidity sensor started! ' + ((error) ? error : ''));
            });
            this.color_enable(function(error) {
                console.log('Color sensor started! ' + ((error) ? error : ''));
            });
            this.gas_enable(function(error) {
                console.log('Gas sensor started! ' + ((error) ? error : ''));
            });
        }
    }
}

function onDiscover(thingy) {
  console.log('Discovered: ' + thingy);

  thingy.on('disconnect', function() {
    console.log('Disconnected!');
  });

  thingy.connectAndSetUp(function(error) {
    console.log('Connected! ' + error ? error : '');

    thingy.on('temperatureNotif', onTemperatureData);
    thingy.on('pressureNotif', onPressureData);
    thingy.on('humidityNotif', onHumidityData);
    thingy.on('gasNotif', onGasData);
    thingy.on('colorNotif', onColorData);
    thingy.on('buttonNotif', onButtonChange);
    thingy.on('batteryLevelChange', onBatteryLevelChange);
    
    thingy.notifyBatteryLevel(function(error) {
      console.log('Battery Level Notifications enabled! ' + ((error) ? error : ''));
    });
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
    thingy.color_interval_set(1000, function(error) {
        if (error) {
            console.log('Color sensor configure! ' + error);
        }
    });
    thingy.gas_mode_set(1, function(error) {
        if (error) {
            console.log('Gas sensor configure! ' + error);
        }
    });

    enabled = true;

    thingy.temperature_enable(function(error) {
        console.log('Temperature sensor started! ' + ((error) ? error : ''));
    });
    thingy.pressure_enable(function(error) {
        console.log('Pressure sensor started! ' + ((error) ? error : ''));
    });
    thingy.humidity_enable(function(error) {
        console.log('Humidity sensor started! ' + ((error) ? error : ''));
    });
    thingy.color_enable(function(error) {
        console.log('Color sensor started! ' + ((error) ? error : ''));
    });
    thingy.gas_enable(function(error) {
        console.log('Gas sensor started! ' + ((error) ? error : ''));
    });
    thingy.button_enable(function(error) {
        console.log('Button started! ' + ((error) ? error : ''));
    });
  });
}

Thingy.discover(onDiscover);