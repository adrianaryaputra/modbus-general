const ModbusRTU = require("modbus-serial");
const fs = require('fs');
const exception = require("./exception")

var DEBUG = false;
if(!DEBUG){console.debug = ()=>{}}



class ModbusHandler{


    constructor({
        configPath = "./configuration.json"
    }={}) {

        // read configuration json
        this.config = JSON.parse(
            fs.readFileSync(configPath)
        );
        console.debug(this.config)

    }


    open() {

        this.connection = new ModbusRTU();
        this.connection.connectRTUBuffered(this.config.port, { baudRate: this.config.baud });

    }


    send({
        modbus_id,
        modbus_fc,
        modbus_args,
    }) {

        this.connection.setID(modbus_id);
        switch (modbus_fc) {
            case 1:
                return this.connection.readCoils(...modbus_args)
            case 2:
                return this.connection.readDiscreteInputs(...modbus_args)
            case 3:
                return this.connection.readHoldingRegisters(...modbus_args)
            case 4:
                return this.connection.readInputRegisters(...modbus_args)
            case 5:
                return this.connection.writeCoil(...modbus_args)
            case 6:
                return this.connection.writeRegister(...modbus_args)
            case 15:
                return this.connection.writeCoils(...modbus_args)
            case 16:
                return this.connection.writeRegisters(...modbus_args)
            case 14:
            case 43:
                return this.connection.readDeviceIdentification(...modbus_args)
            default:
                throw exception.NotImplementedError;
        }

    }


}



class Hardware{


    constructor({
        hwPath = "./hardware"
    }={}) {

        // read hardware json
        let files = fs.readdirSync(hwPath);
        let validfiles = files.filter(filename => { return /^.+\.json$/.test(filename) });
        validfiles.forEach((validfile) => {
            let data = fs.readFileSync(hwPath + "/" + validfile);
            if (this.hwlib == undefined) this.hwlib = new Object;
            this.hwlib[validfile.replace(".json","")] = JSON.parse(data);
        });
        console.debug(this.hwlib);

    }


    build(deviceList) {

        console.log(deviceList);
        console.log(Object.keys(deviceList));

        let fnobj = {}

        // build hardware commands
        Object.keys(deviceList).forEach((device) => {
            let hwid = deviceList[device].hardware;
            
            fnobj[device] = {
                modbus_id: deviceList[device].id,
                modbus_fc: this.hwlib[hwid].commands
            }
        });


        console.log(fnobj);
        // create send command
        

    }


}



let m = new ModbusHandler()
let h = new Hardware()
h.build(m.config.device)

console.log(m.config.device)
Object.keys(m.config.device).forEach(i => console.log(m.config.device[i]))


module.exports = ModbusHandler