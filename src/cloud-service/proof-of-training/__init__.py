import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import io
import os
import requests

import json
import azure.functions as func
from azure.cosmos import CosmosClient
from web3 import Web3

def main(req: func.HttpRequest) -> func.HttpResponse:

    ## Init the cosmos db client and bucket
    db_url = ''
    db_key = ''
    db_client = CosmosClient(db_url, credential=db_key)

    ## Get the task id
    bucket_name = req.params.get('bucket')
    task_id = int(req.params.get('task_id'))

    database = db_client.get_database_client(bucket_name)
    gpu_container = database.get_container_client('gpu_metrics')
    loss_container = database.get_container_client('loss_metrics')
    ckpt_container = database.get_container_client('ckpt_metrics')

    ## Get the data from the containers
    try:
        gpu_metrics = list(gpu_container.read_all_items())
        gpu_metrics = pd.DataFrame(gpu_metrics)
        gpu_metrics = gpu_metrics[['id', 'device_id', 'memory_used', 'memory_total', 'gpu_utilization', 'timestamp']]

        loss_metrics = list(loss_container.read_all_items())
        loss_metrics = pd.DataFrame(loss_metrics)
        loss_metrics = loss_metrics[['id', 'epoch', 'batch_idx', 'loss', 'timestamp', 'total_epochs', 'total_iters']]

        ckpt_metrics = list(ckpt_container.read_all_items())
        ckpt_metrics = pd.DataFrame(ckpt_metrics)
        ckpt_metrics = ckpt_metrics[['id', 'model_path', 'timestamp']]    
    except:
        print('No data in the containers')
    
    ## Generate the visulizations and upload to greenfield
    generate_visulizations(loss_metrics, gpu_metrics, bucket_name)

    ## Return the result
    training_result = validate_training(gpu_metrics, loss_metrics, ckpt_metrics)
    
    ## Complete the task by sending transaction to the blockchain
    if training_result == True:
        complete_task(task_id)
    return func.HttpResponse(f"{training_result}", status_code=200)


def validate_training(gpu_metrics, loss_metrics, ckpt_metrics):
    ## Check if the data is valid
    VALID_TRAINING = True

    ## If no data for any of the containers, then the training is not valid
    if len(gpu_metrics) == 0 or len(loss_metrics) == 0 or len(ckpt_metrics) == 0:
        VALID_TRAINING = False

    ## If the difference between the highest GPU memory usage and the lowest GPU memory usage is less than 10%, then the training is not valid
    gpu_memory_usage = gpu_metrics.memory_used.values
    gpu_total_memory = gpu_metrics.memory_total.values[0]
    if np.percentile(gpu_memory_usage, 20) < 0.05*gpu_total_memory:
        VALID_TRAINING = False

    ## If the difference between the highest GPU utilization and the lowest GPU utilization is less than 10%, then the training is not valid
    gpu_util_usage = gpu_metrics.gpu_utilization.values
    if (np.max(gpu_util_usage) - np.min(gpu_util_usage)) / (np.min(gpu_util_usage)+0.1) < 0.1:
        VALID_TRAINING = False

    ## Check the total number of running epochs == total_epochs
    total_epochs = loss_metrics.total_epochs.values[0]
    if len(np.unique(loss_metrics.epoch.values)) != total_epochs:
        VALID_TRAINING = False

    ## Check the total number of generated model ckpts == total_epochs
    if len(ckpt_metrics) != total_epochs:
        VALID_TRAINING = False

    ## For each epoch, check the number of logs == number of batches, otherwise the training is not valid
    total_iters = loss_metrics.total_iters.values[0]
    for epoch in range(total_epochs):
        if len(loss_metrics[loss_metrics['epoch'] == epoch]) != total_iters:
            VALID_TRAINING = False
            break
    
    ## GPU Utilization check: over 30% of the training time, the GPU utilization should be more than the average GPU utilization
    gpu_util_usage = gpu_metrics.gpu_utilization.values
    average_gpu_util = np.mean(gpu_util_usage)
    if len(gpu_util_usage[gpu_util_usage > average_gpu_util]) < 0.3*len(gpu_util_usage):
        VALID_TRAINING = False

    return VALID_TRAINING

def complete_task(task_id):
    ## Connect to the blockchain
    url = 'https://opbnb-testnet-rpc.bnbchain.org'
    web3 = Web3(Web3.HTTPProvider(url))

    contract_address = '0xB1d7E94D9eFCDcB593d6f76C21E21822975f058b'
    account_address = '0x08a1D7CA0AAE5da4597a7f1c46cB9dd099443AbA'
    private_key = ''
    chain_id = 5611
    gas = 6721970
    gasPrice = 1
    gasPrice_wei = web3.to_wei(str(gasPrice), 'gwei')

    with open(os.path.join('HttpTrigger1', 'Marketplace.json')) as f:
        abi = json.load(f)
    
    ## Send a transaction to the blockchain
    marketplace_contract = web3.eth.contract(address=contract_address, abi=abi['abi'])
    nonce = web3.eth.get_transaction_count(account_address)
    txn = marketplace_contract.functions.CompleteTask(account_address, task_id).build_transaction({
        'chainId': chain_id,
        'gas': gas,
        'gasPrice': gasPrice_wei,
        'nonce': nonce,
    })
    signed_txn = web3.eth.account.sign_transaction(txn, private_key=private_key)
    web3.eth.send_raw_transaction(signed_txn.rawTransaction)

def generate_visulizations(loss_metrics, gpu_metrics, bucket_name):
    ## Generate training loss metrics visulizations and upload it to greenfield
    try:
        loss_metric_arr = loss_metrics.loss.values
    except:
        loss_metric_arr = []
    plt.figure(dpi=100)
    plt.plot(loss_metric_arr)
    plt.title('Training loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.grid(True)
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100)  # Save the figure to the buffer at 300 DPI
    buf.seek(0)
    file_name = 'training_loss.png'
    upload_file_to_stroage(bucket_name, file_name, buf)
    buf.close()

    ## Generate training gpu metrics visulizations and upload them to greenfield
    try:
        timestamp = gpu_metrics.timestamp.values
        timestamp = timestamp - timestamp[0]
        gpu_memory_arr = gpu_metrics.memory_used.values
        gpu_memory_arr = gpu_memory_arr*100 / (gpu_metrics.memory_total.values[0])
    except:
        timestamp = []
        gpu_memory_arr = []
    plt.figure(dpi=100)
    plt.plot(timestamp, gpu_memory_arr)
    plt.title('GPU memory')
    plt.xlabel('Time (seconds)')
    plt.ylabel('GPU Memory Usage (%)')
    plt.grid(True)
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100)  # Save the figure to the buffer at 300 DPI
    buf.seek(0)
    file_name = 'gpu_memory.png'
    upload_file_to_stroage(bucket_name, file_name, buf)
    buf.close()

    ## Generate training gpu metrics visulizations and upload them to greenfield
    try:
        gpu_util_arr = gpu_metrics.gpu_utilization.values
    except:
        gpu_util_arr = []
    plt.figure(dpi=100)
    plt.plot(timestamp, gpu_util_arr)
    plt.title('GPU utilization')
    plt.xlabel('Time (seconds)')
    plt.ylabel('GPU Utilization Usage (%)')
    plt.grid(True)
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100)  # Save the figure to the buffer at 300 DPI
    buf.seek(0)
    file_name = 'gpu_utilization.png'
    upload_file_to_stroage(bucket_name, file_name, buf)
    buf.close()

def upload_file_to_stroage(bucket_name, file_name, file_content):
    file_service_url = 'http://bahenfileservice.azurewebsites.net/api/v1/objects'

    # send the response with to upload the file
    files = {'folder': file_content, 'bucketName':('', bucket_name), 'objectName':('', file_name)}
    response = requests.post(file_service_url, files=files)
    return response
    
