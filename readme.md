# Modbus to MQTT Broadcaster

I create this program to make my life easier LOL. It is common for me needing to send data back and forth between edge device connected with modbus, and a display monitor located in control room. Feel free to fork and edit if you need it~


## Configuration File
```json
{
    "mqtt_host": "YOUR_MQTT_HOST",
    "mqtt_port": YOUR_MQTT_PORT,
    "mqtt_user": "YOUR_MQTT_USERNAME",
    "mqtt_password": "YOUR_MQTT_PASSWORD",
    
    "port": "SERIAL_PORT",
    "baud": SERIAL_BAUD,
    "retry": SERIAL_RETRY_COUNT,
    "timeout": SERIAL_TIMEOUT,
    "device": {
        "ANY_DEVICE_NAME": {
            "id": MODBUS_ID,
            "hardware": "HARDWARE_NAME"
        }
    }
}
```


## Hardware Definition File
Place the hardwqare definition json file on hardware folder with name `HARDWARE_NAME.json`. Configuration file's device hardware name will search on those folder for corresponding hardware based on the file name.  
```json
{
    "name": "HARDWARE_NAME",
    "description": "HARDWARE_DESCRIPTION",
    "commands": {
        "COMMAND_NAME_1": {
            "fc": 3,
            "address": 0,
            "length": 1
        },
        "COMMAND_NAME_2": {
            "fc": 6,
            "address": 107,
            "length": 1
        }
    }
}
```