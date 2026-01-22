import time
import paho.mqtt.client as mqtt
import json
import random
import requests
import sys


# Parse command-line arguments
if len(sys.argv) > 1:
    connected = sys.argv[1].lower() == 'true'
    sender_id = sys.argv[2]
    receiver_id = sys.argv[3]
    sender_current_capacity = float(sys.argv[4])
    receiver_current_capacity = float(sys.argv[5])
    energy_amount = float(sys.argv[6])
    rate_of_transfer = float(sys.argv[7])
    total_capacity = float(sys.argv[8])
    trade_id = sys.argv[9]
    transaction_id = sys.argv[10]
    transferredEnergy = sys.argv[11]
    chargePerUnit = sys.argv[12]
else:
    # Fallback to default values if no arguments are passed
    connected = True
    sender_id = "1234"
    receiver_id = "4321"
    sender_current_capacity = 120
    receiver_current_capacity = 1
    energy_amount = 40
    rate_of_transfer = 0.1
    total_capacity = 120
    trade_id = "trade_001"
    transaction_id = "transaction_001"
    transferredEnergy = 1
    chargePerUnit = 10


# MQTT broker details
broker_address = "localhost"  # Replace with your MQTT broker address
broker_port = 1883  # Default MQTT port (change if needed)
topic = "telemetry/1/"
username = "admin"
password = "admin"

# Create an MQTT client instance
# client = mqtt.Client()
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

# Set username and password
client.username_pw_set(username, password)

# Flag to track connection status
mqtt_connected = False

# Callback function for connection success
def on_connect(client, userdata, flags, rc, properties=None):
    global mqtt_connected
    if rc == 0:
        mqtt_connected = True
        print("Connected to MQTT broker.")
    else:
        print(f"Failed to connect, return code {rc}")

# Set the on_connect callback
client.on_connect = on_connect

# Try connecting to the broker
try:
    client.connect(broker_address, broker_port)
    client.loop_start()  # Start the network loop
except Exception as e:
    print(f"Error connecting to MQTT broker: {e}")

# Function to publish a message with a random temperature value between 1270 and 1290
def publish_telemetry_data(
        connected,
        sender_id,
        receiver_id,
        sender_current_capacity,
        receiver_current_capacity,
        energy_amount,
        rate_of_transfer,
        total_capacity,
        trade_id,
        transaction_id,
        transferredEnergy,
        chargePerUnit
):
    print("Energy transfer started")
    sender_current_capacity = int(sender_current_capacity)  # Ensure sender_cur_capacity is an integer
    receiver_current_capacity = int(receiver_current_capacity)  # Ensure receiver_current_capacity is an integer
    tot_commited_energy = int(energy_amount)  # Ensure tot_commited_energy is an integer
    energy_amount = int(energy_amount)  # Ensure energy_amount is an integer
    dynamic_topic = f"telemetry/{trade_id}/"  # Dynamic topic with trade ID

    if connected:
        while energy_amount > 0:
            energy_transferred = energy_amount * rate_of_transfer
            energy_amount -= energy_transferred
            # Calculate telemetry data
            sender_energy = max(0, sender_current_capacity - energy_transferred)  # Remaining sender energy
            receiver_energy = min(total_capacity, receiver_current_capacity + energy_transferred)  # Receiver gets transferred energy
            voltage = 230  # Fixed voltage in volts
            current = rate_of_transfer / voltage  # Calculate current in amps
            power = rate_of_transfer * energy_amount * 5000 # Calculate power in watts
            sender_battery_temp = 30 + (energy_amount / 20)  # Simulated sender battery temp
            receiver_battery_temp = 30 + (energy_amount / 20) # Simulated receiver battery temp

            # Calculate charge percentages based on total capacity (fixed at 120)
            sender_charge_percentage = max(0, (sender_energy / total_capacity) * 100)
            receiver_charge_percentage = min(100, (receiver_energy / total_capacity) * 100)

            progress_percent = 100 - round((energy_amount / tot_commited_energy) * 100, 2)

            # Prepare combined telemetry message
            telemetry_message = json.dumps({
                "sender": {
                    "id": sender_id,
                    "energy": sender_energy,
                    "voltage": voltage,
                    "current": current,
                    "power": power,
                    "battery_temp": sender_battery_temp,
                    "charge_percentage": sender_charge_percentage,
                    "status": "sending"
                },
                "receiver": {
                    "id": receiver_id,
                    "energy": receiver_energy,
                    "voltage": voltage,
                    "current": current,
                    "power": power,
                    "battery_temp": receiver_battery_temp,
                    "charge_percentage": receiver_charge_percentage,
                    "status": "receiving"
                },
                "progress_percent": progress_percent,
                "status": "inProgress",
                "timestamp": time.time()
            })

            # Publish the combined message to the dynamic topic
            client.publish(dynamic_topic, telemetry_message)
            print(f"Published telemetry message to {dynamic_topic}: {telemetry_message}")

            # Simulate energy transfer by decrementing energy and updating capacities
            energy_amount -= rate_of_transfer
            sender_current_capacity = max(0, sender_current_capacity - rate_of_transfer)
            receiver_current_capacity = min(
                receiver_current_capacity + rate_of_transfer, total_capacity
            )

            # Wait for a fixed time to simulate real-time data
            time.sleep(1)

        print("Energy transfer completed.")
        trigger_transaction_completion(sender_id, receiver_id, dynamic_topic, trade_id, transaction_id, tot_commited_energy, chargePerUnit)
    else:
        print(f"Cannot publish message: Not connected to MQTT broker.")

def trigger_transaction_completion(sender_id, receiver_id, topic, trade_id, transaction_id, transferredEnergy, chargePerUnit):
    print("Triggering transaction completion..., sender_id:", sender_id, "receiver_id:", receiver_id, "topic:", topic, "transaction_id:", transaction_id, "trade_id:", trade_id, "transferredEnergy:", transferredEnergy, "chargePerUnit:", chargePerUnit)

    api_url = "http://localhost:8000/api/transactions/update"

    # Query parameters
    query_params = {
        "transactionId": transaction_id,
        "tradeId": trade_id
    }

    # Body payload
    payload = {
        "transferredEnergy": transferredEnergy,
        "transactionStatus": "Completed",
        "chargePerUnit": chargePerUnit 
    }

    try:
        response = requests.put(api_url, params=query_params, json=payload)
        if response.status_code == 200:
            print("API call successful. Response:")
            print(response.json())
        else:
            print(f"API call failed with status code: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error occurred while making API call: {str(e)}")

    print(f"Transaction complete between sender: {sender_id} and receiver: {receiver_id}")
    completion_message = json.dumps({
        "status": "completed",
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "timestamp": time.time()
    })
    client.publish(topic, completion_message)
    print(f"Published transaction completion message to {topic}: {completion_message}")


publish_telemetry_data(
    connected,
    sender_id,
    receiver_id,
    sender_current_capacity,
    receiver_current_capacity,
    energy_amount,
    rate_of_transfer,
    total_capacity,
    trade_id,
    transaction_id,
    transferredEnergy,
    chargePerUnit
)

# Disconnect from the broker if connected
if mqtt_connected:
    client.disconnect()
    client.loop_stop()