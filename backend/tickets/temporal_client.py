from temporalio.client import Client
import os

async def get_temporal_client() -> Client:
    address = os.environ.get("TEMPORAL_ADDRESS", "localhost:7233")
    return await Client.connect(address)