const mqtt = require('mqtt')
const { MQTTNotConnectedError } = require('./exception')



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

            // subscribe to all topics listed
            this.listenedTopics.forEach(topic => {
                this.client.subscribe(topic)
            })
        })

    }


    listen(topic) { this.listenedTopics.push(topic) }


    close() { this.client.end() }


    publish(topic, message, next) {

        if (this.client.connected) {
            this.client.publish(topic, message, next)
        }
        else { throw MQTTNotConnectedError }

    }


}