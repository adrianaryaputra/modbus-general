const mqtt = require('mqtt')
const fs = require('fs');
const { MQTTNotConnectedError } = require('./exception')

var DEBUG = true;
if(!DEBUG){console.debug = ()=>{}}



class MQTT{


    constructor({
        configPath = "./configuration.json"
    }={}) {

        // save mqtt as this
        this.mqtt = mqtt;

        // read configuration json
        let allcfg = JSON.parse(
            fs.readFileSync(configPath)
        );
        this.config = allcfg.mqtt;
        console.debug(this.config)

        // create list of topic to listen
        this.listenedTopics = [];

    }


    open() {
            
        this.client = this.mqtt.connect(
            `mqtt://${this.config.host}:${this.config.port}`, 
            {
                clientId: this.config.clientId,
                username: this.config.username,
                password: this.config.password,
                connectTimeout: this.config.connectTimeout,
                reconnectPeriod: this.config.reconnectPeriod,
            }
        );

        this.client.on('connect', () => {
            console.debug('connected to mqtt broker')
            this.connected = true;

            // subscribe to all topics listed
            this.listenedTopics.forEach(topic => {
                this.client.subscribe(topic)
            });
        });

        this.client.on("disconnect", () => {
            console.debug('disconnected from mqtt broker')
            this.connected = false;
        });

        this.client.on('message', (topic, message) => {
            console.debug(`received message on topic ${topic}`);
            console.debug(message.toString());
        });

    }


    listen(topic) { this.listenedTopics.push(topic) }


    close() { this.client.end() }


    publish(topic, message, next) {

        console.log("publishing message on topic " + topic);
        if (this.connected) {
            this.client.publish(topic, message, next)
        }
        else { throw MQTTNotConnectedError }

    }


}



module.exports = MQTT;