const mqtt = require('mqtt')



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

    }


    open() {
            
        // create mqtt client
        this.client = this.mqtt.connect(
            `mqtt://${this.config.host}:${this.config.port}`, 
            {
                clientId: this.config.clientId,
                username: this.config.username,
                password: this.config.password
            }
        );

    }


}