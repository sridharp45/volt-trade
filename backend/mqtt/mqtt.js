const mqtt = require('mqtt');

const url = 'ws://localhost:8084/mqtt';
const topic = 'telemetry/1/';
const message = 'Hello World';

const options = {
    clean: true,
    clientId: '',
    username: 'admin',
    password: 'admin'
};

console.log('Connecting client...');

const client = mqtt.connect(url, options); // connect client

client.on('connect', function () {
    console.log('Client connected!');
    client.subscribe(topic, function (error) { // subscribe to a topic
        if (!error) {
            client.publish(topic, message); // publish a message
        }
    });
});

client.on('message', (topic, message) => { // handle received messages
    console.log(`Received message on topic ${topic}: ${message}`);
    client.end(); // end client session
});

client.on('error', (error) => { // handle errors
    console.log('Error: ', error?.message);
});

client.on('packetreceive', (packet) => { // handle received packet
    console.log('Packet receive...', packet);
});

client.on('packetsend', (packet) => { // handle sent packet
    console.log('Packet send...', packet);
});

client.on('reconnect', () => {
    console.log('Reconnecting...');
});

client.on('close', () => {
    console.log('Closing client...');
});