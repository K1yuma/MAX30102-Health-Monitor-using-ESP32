import mqtt from 'mqtt';

const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

let sensorData = {};

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe('healthMonitor/heartRate');
  client.subscribe('healthMonitor/spO2');
  client.subscribe('healthMonitor/status');
});

client.on('message', (topic, message) => {
  const value = message.toString();
  console.log(`Received message from topic ${topic}: ${value}`);

  if (topic === 'healthMonitor/heartRate') {
    sensorData.heartRate = Number(value);
  } else if (topic === 'healthMonitor/spO2') {
    sensorData.spO2 = Number(value);
  } else if (topic === 'healthMonitor/status') {
    sensorData.status = value;
  }
});

export default client;