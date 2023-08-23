import json
import os
import requests
import subprocess

def perform_training_task(task):
    # Download files and data from greenfield
    print("Downloading data and script...")
    bucket_name = task[4].split('/')[-1]
    print(bucket_name)
    data = download_files_by_request(bucket_name)
    with open('./train.py', 'wb') as f:
        f.write(data)

    # Run the training script
    print("Performing training task...")
    subprocess.call(["python", "train.py", "--bucket", bucket_name])

def download_files_by_request(bucket_name):
    file_service_url = 'http://bahenfileservice.azurewebsites.net/api/v1/objects'
    params = {'bucketName': bucket_name, 'objectName': 'train.py'}
    response = requests.get(file_service_url, params=params)
    response.raise_for_status()

    data = response.content
    return data

