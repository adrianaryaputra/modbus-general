const MODBUS = require('./src/modbus.js');
const MQTT = require('./src/mqtt.js');

let Modbus = new MODBUS({
    configPath: "./src/configuration.json",
    hwPath: "./src/hardware"
});

let Mqtt = new MQTT({
    configPath: "./src/configuration.json"
});

Modbus.build({
    deviceConfigPath: "./src/configuration.json"
});
console.log(Modbus.device);

// Modbus.open();

Mqtt.listen(`${Mqtt.config.clientId}/MODBUS/#`);
Mqtt.open();



// get water level every 5 second
// setInterval(() => {

//     Modbus.device.RWT_Level.measureLevel()
//     .then((value) => {
//         Mqtt.publish(`${Mqtt.config.clientId}/RWT_Level`, JSON.stringify(value));
//     })
//     .catch((err) => {
//         Mqtt.publish(`${Mqtt.config.clientId}/RWT_Level/error`, JSON.stringify(err));
//     });

// }, 5000);



// send modbus command from mqtt
Mqtt.client.on('message', (topic, message) => {

    _mqHandleTopicMODBUS(topic, message);
    _mqHandleTopicGetConfig(topic, message);

});



function _mqHandleTopicGetConfig(topic, message) {

    if (topic.includes('getConfig')) {

        // let hwlib = Modbus.hwlib
        let config = Modbus.modbusHandler.config;

        Mqtt.publish(`${topic}`, JSON.stringify(config));
    }

}



function _mqHandleTopicMODBUS(topic, message) {

    if (topic.includes('MODBUS') && !topic.includes('error')) {

        // parse message JSON
        let args = JSON.parse(message);

        console.log("get MODBUS command", args);

        // send modbus command
        Modbus.modbusHandler.send({
            modbus_id: args.modbus_id,
            modbus_fc: args.modbus_fc,
            modbus_address: args.modbus_address,
            modbus_value: args.modbus_value
        })(args.modbus_value)
        .then((value) => {
            Mqtt.publish(`${topic}`, JSON.stringify(value));
        })
        .catch((err) => {
            Mqtt.publish(`${topic}/error`, JSON.stringify(err));
        });
    }

}