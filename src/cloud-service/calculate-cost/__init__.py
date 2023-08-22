import os
import logging
import azure.functions as func
import os
import sys
import tempfile
import importlib
import json
import shutil
import requests

import torch
from torch.profiler import profile, record_function, ProfilerActivity
    
def download_modules(bucket_name):
    temp_dir = tempfile.mkdtemp()
    sys.path.append(temp_dir)

    # Send a request to download files
    logging.info('Downloading data...')
    file_service_url = 'http://bahenfileservice.azurewebsites.net/api/v1/objects'
    params = {'bucketName': bucket_name, 'objectName': 'train.py'}
    response = requests.get(file_service_url, params=params)
    response.raise_for_status()
    data = response.content
    download_path = os.path.join(temp_dir, 'train.py')
    with open(download_path, 'wb') as f:
        f.write(data)
    sys.path = sys.path[:-1]
    return temp_dir

def get_flops(temp_dir):
    # Import the modules and variables
    sys.path.append(f'{temp_dir}')
    logging.info('sys.path: %s', sys.path)
    train = importlib.import_module('train')
    importlib.reload(train)

    model = train.model
    dataloader = train.train_dataloader
    epoches = train.epochs
    
    # Calculate the FLOPs by one forward-pass
    num_batches = len(dataloader)
    inputs, _ = next(iter(dataloader))

    with profile(activities=[ProfilerActivity.CPU], profile_memory=True, with_flops=True) as prof:
        with record_function("model_inference"):
            model(inputs)

    events = prof.events()
    forward_flops = sum([int(evt.flops) for evt in events]) 
    total_flops = forward_flops * num_batches * 3 * epoches

    RTX3090_FLOPs = 71 * 10**10
    sys.path = sys.path[:-1]
    return {'result_unit': round(total_flops / RTX3090_FLOPs)}
    
def main(req: func.HttpRequest) -> func.HttpResponse:
    
    logging.info('Python HTTP trigger function processed a request.')

    container_name = req.params.get('container')

    if not container_name:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            container_name = req_body.get('container')
            
    if container_name:
        # Download data and scripts
        temp_dir = download_modules(container_name)

        # Calculate the FLOPs
        result_unit = get_flops(temp_dir)

        # Delete the downloaded data
        shutil.rmtree(temp_dir)
        
        # Return the result
        return func.HttpResponse(json.dumps(result_unit), status_code=200, mimetype="application/json")
        
    else:
        return func.HttpResponse(
             "Please send the container name in the query string",
             status_code=400
        )
