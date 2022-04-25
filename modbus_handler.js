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
        modbus_address,
        modbus_value
    }) {

        this.connection.setID(modbus_id);
        switch (modbus_fc) {
            case 1:
                return this.connection.readCoils(modbus_address, modbus_value)
            case 2:
                return this.connection.readDiscreteInputs(modbus_address, modbus_value)
            case 3:
                return this.connection.readHoldingRegisters(modbus_address, modbus_value)
            case 4:
                return this.connection.readInputRegisters(modbus_address, modbus_value)
            case 5:
                return (val) => {return this.connection.writeCoil(modbus_address, val)}
            case 6:
                return (val) => {return this.connection.writeRegister(modbus_address, val)}
            case 15:
                return (val) => {return this.connection.writeCoils(modbus_address, val)}
            case 16:
                return (val) => {return this.connection.writeRegisters(modbus_address, val)}
            case 14:
            case 43:
                return this.connection.readDeviceIdentification(modbus_address, modbus_value)
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
            Object.keys(this.hwlib[hwid].commands).forEach((command) => {
                if (fnobj[device] == undefined) fnobj[device] = {}
                fnobj[device][command] = {
                    modbus_id: deviceList[device].id,
                    modbus_fc: this.hwlib[hwid][command].fc,
                    modbus_address: this.hwlib[hwid][command].address,
                    modbus_value: this.hwlib[hwid][command].length
                }
            })
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