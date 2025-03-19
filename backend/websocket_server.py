import asyncio
import websockets
import json
from kafka import KafkaConsumer

KAFKA_TOPIC = "realtime_coin"
KAFKA_BROKER = "localhost:9092"

# Initialize Kafka Consumer
consumer = KafkaConsumer(
    KAFKA_TOPIC,
    bootstrap_servers=KAFKA_BROKER,
    value_deserializer=lambda x: json.loads(x.decode("utf-8")),
    auto_offset_reset="latest"
)

async def consume_messages():
    loop = asyncio.get_running_loop()
    for message in consumer:
        await asyncio.sleep(0.1)  
        yield message.value  # Return Json from Kafka

async def send_data(websocket, path='/'):
    """Send data to WebSocket Client."""
    try:
        async for message in consume_messages():
            await websocket.send(json.dumps(message)) 
    except websockets.exceptions.ConnectionClosed:
        print("❌ Client WebSocket disconnected")

async def main():
    server = await websockets.serve(send_data, "0.0.0.0", 8765)
    print("✅ WebSocket Server run at ws://localhost:8765")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
