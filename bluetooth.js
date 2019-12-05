let chosenBluetoothService = null;
var bluetoothDevice;

function onStart() {
    let options = {filters: [
        {namePrefix: 'Thinrad'},
        {services: ['0000cbbb-0000-1000-8000-00805f9b34fb']}
    ]};

    bluetoothDevice = null;
    console.log("查找激光测距仪....")
    navigator.bluetooth.requestDevice(options)
    .then(device => { 
        bluetoothDevice = device;
        bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
        return connect();
    })
    .catch(error => {
        console.log("连接失败 " + error)
    });
}

function connect() {
    console.log("尝试连接激光测距仪....")
    return bluetoothDevice.gatt.connect()
    .then(server => {
        console.log('> 激光测距仪连接成功!');
        return server.getPrimaryService('0000cbbb-0000-1000-8000-00805f9b34fb')
    })
    .then(service => { 
        chosenBluetoothService = service;
        return Promise.resolve();
    })
    .catch(error => {
        console.log("连接失败 " + error)
    });
}

function read() {
    chosenBluetoothService.getCharacteristics('0000cbb1-0000-1000-8000-00805f9b34fb').then(readDistanceMeter);
}

function onDisconnectButtonClick() {
    if (!bluetoothDevice) {
      return;
    }
    console.log("正在断开激光测距仪....")
    if (bluetoothDevice.gatt.connected) {
      bluetoothDevice.gatt.disconnect();
    } else {
        console.log('> 激光测距仪已经断开!');
    }
}

function onDisconnected(event) {
    let device = event.target;
    console.log('设备 ' + device.name + ' 已经断开连接.');
}


const decoder = new TextDecoder('utf8');

function readDistanceMeter(characteristic) {
    if (characteristic === null) {
        console.log("传感器数据错误,请重试");
        return Promise.resolve();
    }

    return characteristic[0].readValue()
    .then(dataView => {
        console.log(decoder.decode(dataView))
    })
    .catch(error => { console.log(error); });
}
