import json
import os
from azure.storage.blob import BlobServiceClient
import subprocess

def perform_training_task(task):
    # Download files and data from azure blob
    print("Downloading data and script...")
    container = task[4].split('/')[-1]
    connection_string = ''
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)
    container_client = blob_service_client.get_container_client(container)

    for blob in container_client.list_blobs():
        if blob.size == 0:
            print(f"Skipping directory {blob.name}")
            continue

        os.makedirs(os.path.dirname(blob.name), exist_ok=True)
        with open(blob.name, "wb") as local_file:
            blob_client = container_client.get_blob_client(blob.name)
            download_stream = blob_client.download_blob()
            local_file.write(download_stream.readall())
    
    # Run the training script
    print("Performing training task...")
    os.chdir('./script')
    subprocess.call(["python", "train.py", "--container", container])