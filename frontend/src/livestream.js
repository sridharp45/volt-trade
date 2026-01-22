import React, { useState } from 'react';
import mqtt from 'mqtt';
import './livestream.css';

const LiveStream = () => {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [url, setUrl] = useState("ws://localhost:8084/mqtt"); // State to store the URL input

    const handleStartStream = () => {
        if (!url) {
            console.error('Please enter a presigned URL');
            return;
        }

        try {
            // Connect to MQTT client using the entered URL
            const client = mqtt.connect(url);

            client.on('connect', () => {
                setIsConnected(true);
                console.log('Connected to MQTT broker');

                // Subscribe to a topic
                client.subscribe('telemetry/678d650879c9bdd346220301/', (err) => {
                    if (!err) {
                        console.log('Subscribed to topic');
                    } else {
                        console.error('Subscription error:', err);
                    }
                });
            });

            client.on('message', (topic, message) => {
                // Update messages in state
                setMessages(prevMessages => [
                    ...prevMessages,
                    `Message: ${message.toString()}`,
                ]);
            });

            client.on('error', (err) => {
                console.error('MQTT error:', err);
            });
        } catch (error) {
            console.error('Error connecting to MQTT broker:', error);
        }
    };

    return (
        <div className="live-stream-container">
            <div className="message-box">
                <h2>MQTT Live Stream</h2>
                <div className="messages">
                    {messages.map((msg, index) => (
                        <div key={index}>{msg}</div>
                    ))}
                </div>
            </div>
            <div className="url-input-container">
                <input
                    type="text"
                    placeholder="Enter presigned URL"
                    className='url-input'
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />

            <button
                className="live-stream-button"
                onClick={handleStartStream}
                disabled={isConnected}
            >
                {isConnected ? 'Stream Active' : 'Start Live Stream'}
            </button>

            </div>
            
        </div>
    );
};

export default LiveStream;