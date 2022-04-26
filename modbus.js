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

        // create modbus bus
        this.bus = new ModbusRTU();

    }


    open() {

        this.bus.connectRTUBuffered(this.config.port, { baudRate: this.config.baud });

    }


    send({
        modbus_id,
        modbus_fc,
        modbus_address,
        modbus_value
    }) {

        switch (modbus_fc) {
            case 1:
                return () => {
                    this.bus.setID(modbus_id);
                    return this.bus.readCoils(modbus_address, modbus_value)
                }
            case 2:
                return () => {
                    this.bus.setID(modbus_id);
                    return this.bus.readDiscreteInputs(modbus_address, modbus_value)
                }
            case 3:
                return () => {
                    this.bus.setID(modbus_id);
                    return this.bus.readHoldingRegisters(modbus_address, modbus_value)
                }
            case 4:
                return () => {
                    this.bus.setID(modbus_id);
                    return this.bus.readInputRegisters(modbus_address, modbus_value)
                }
            case 5:
                return (val) => {
                    this.bus.setID(modbus_id);
                    return this.bus.writeCoil(modbus_address, val)
                }
            case 6:
                return (val) => {
                    this.bus.setID(modbus_id);
                    return this.bus.writeRegister(modbus_address, val)
                }
            case 15:
                return (val) => {
                    this.bus.setID(modbus_id);
                    return this.bus.writeCoils(modbus_address, val)
                }
            case 16:
                return (val) => {
                    this.bus.setID(modbus_id);
                    return this.bus.writeRegisters(modbus_address, val)
                }
            case 14:
            case 43:
                return () => {
                    this.bus.setID(modbus_id);
                    this.bus.readDeviceIdentification(modbus_address, modbus_value)
                }
            default:
                throw exception.NotImplementedError;
        }

    }


}



class Modbus{


    constructor({
        hwPath = "./hardware"
    }={}) {

        // load modbus handler
        this.modbusHandler = new ModbusHandler();
        console.log(this.modbusHandler);

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


    open() { this.modbusHandler.open() }


    whois(device) {

        let hw = this.modbusHandler.config.device[device];
        let hwid = hw.hardware;
        return {
            id: hw.id,
            hardware: hwid,
            name: this.hwlib[hwid].name,
            description: this.hwlib[hwid].description,
            commands: this.hwlib[hwid].commands
        }
        
    }


    build() {

        let deviceList = this.modbusHandler.config.device;

        console.debug(deviceList);
        console.debug(Object.keys(deviceList));

        this.device = {}
 
        Object.keys(deviceList).forEach((device) => {
            let hwid = deviceList[device].hardware;
            Object.keys(this.hwlib[hwid].commands).forEach((command) => {
                if (this.device[device] == undefined) this.device[device] = {}
                console.debug(this.hwlib[hwid]);
                this._assignHardware(deviceList, hwid, device, command);
            })
        });

    }


    _assignHardware(deviceList, hwid, device, command) {

        let args = {
            modbus_id: deviceList[device].id,
            modbus_fc: this.hwlib[hwid].commands[command].fc,
            modbus_address: this.hwlib[hwid].commands[command].address,
            modbus_value: this.hwlib[hwid].commands[command].length ? this.hwlib[hwid].commands[command].length : 1
        }

        this.device[device][command] = this.modbusHandler.send(args);

    }


}



// let modbus = new Modbus()
// modbus.build()
// console.log(modbus.device);



module.exports = Modbus