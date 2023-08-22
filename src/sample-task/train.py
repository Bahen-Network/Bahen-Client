import os
import uuid
import threading
import time
from tqdm import tqdm 
import requests

import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms

from azure.cosmos import CosmosClient, exceptions, PartitionKey

# Set up Azure Logging
db_url = 'https://bahen.documents.azure.com:443/'
db_key = 'gpbaKRTIW4525ah1WaVZXM2ut5xoc6z9a60YwuEaqVp7P2rAflUmmRgsbnxHCVqvEwhfX8VdwjcgACDbmKqoKg=='
connection_string = "DefaultEndpointsProtocol=https;AccountName=kejie1;AccountKey=wKggITwQijuI4m+7nNyH9XC1JuYsaY8O3ftrhdgDNXVLKYtgV0mvgdPhN3fw/0slGFUTuGVdnKw9+AStVkOoEw==;EndpointSuffix=core.windows.net"

# Set up CIFAR10 dataset
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])

trainset = torchvision.datasets.CIFAR100(root='/tmp/', train=True, download=True, transform=transform)
train_dataloader = torch.utils.data.DataLoader(trainset, batch_size=256, shuffle=True, num_workers=2)

testset = torchvision.datasets.CIFAR100(root='/tmp/', train=False, download=True, transform=transform)
test_loader = torch.utils.data.DataLoader(testset, batch_size=256, shuffle=False, num_workers=2)

# Set up model, loss function, and optimizer
model = torchvision.models.resnet18(pretrained=True)
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, 100)  # CIFAR100 has 100 classes
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.0008)
epochs = 1

# The logging class to log the training behavior
class LoggingCallback:
    def __init__(self, db_url, db_key, bucket_name):
        import pynvml
        ## Init the cosmos db client
        self.client = CosmosClient(db_url, credential=db_key)
        self.create_db_resources(bucket_name)

        ## Init the greenfield storage client
        self.file_service_url = 'http://bahenfileservice.azurewebsites.net/api/v1/objects'
        self.bucket_name = bucket_name

        ## Initialize DCGM or GPU metrics collection tool here
        self.total_collect_metrics_flag = True
        pynvml.nvmlInit()
        self.device_count = pynvml.nvmlDeviceGetCount()
        self.metric_collection_thread = threading.Thread(target=self.collect_metrics)
        self.metric_collection_thread.daemon = True
        self.collect_metrics_flag = False

    def upload_model_to_stroage(self, file_path):
        # Open the file and prepare it for upload
        with open(file_path, 'rb') as f:
            files = {'folder': f, 'bucketName':('', self.bucket_name), 'objectName':('', file_path.split('/')[-1])}
            response = requests.post(self.file_service_url, files=files)
        print(response)
        return response

    def create_db_resources(self, db_name):
        ## Create the database if it doesn't exist
        try:
            self.database = self.client.create_database(db_name, offer_throughput=1000)
        except exceptions.CosmosResourceExistsError:
            self.database = self.client.get_database_client(db_name)

        ## Create the GPU container if it doesn't exist
        try:
            self.gpu_container = self.database.create_container(id='gpu_metrics', partition_key=PartitionKey(path="/id"))
        except exceptions.CosmosResourceExistsError:
            self.gpu_container = self.database.get_container_client('gpu_metrics')
        except exceptions.CosmosHttpResponseError:
            raise

        ## Create the loss container if it doesn't exist
        try:
            self.loss_container = self.database.create_container(id='loss_metrics', partition_key=PartitionKey(path="/id"))
        except exceptions.CosmosResourceExistsError:
            self.loss_container = self.database.get_container_client('loss_metrics')
        except exceptions.CosmosHttpResponseError:
            raise

        ## Create the checkpoint container if it doesn't exist
        try:
            self.ckpt_container = self.database.create_container(id='ckpt_metrics', partition_key=PartitionKey(path="/id"))
        except exceptions.CosmosResourceExistsError:
            self.ckpt_container = self.database.get_container_client('ckpt_metrics')
        except exceptions.CosmosHttpResponseError:
            raise

    def collect_metrics(self):
        import pynvml
        while self.collect_metrics_flag:
            for i in range(self.device_count):
                handle = pynvml.nvmlDeviceGetHandleByIndex(i)
                info = pynvml.nvmlDeviceGetMemoryInfo(handle)
                utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)

                metrics = {
                    "id": str(uuid.uuid4()),
                    "device_id": i,
                    "memory_used": info.used,
                    "memory_total": info.total,
                    "gpu_utilization": utilization.gpu,
                    "timestamp": time.time()
                }

                # Log the GPU metrics to gpu_container in cosmos db
                self.gpu_container.upsert_item(metrics)
                
            time.sleep(4)

    def start_logging(self):
        ## Start collecting GPU metrics
        self.collect_metrics_flag = True
        if self.total_collect_metrics_flag:
            if not self.metric_collection_thread.is_alive():
                self.metric_collection_thread.start()

    def stop_logging(self):
        ## Stop collecting GPU metrics
        self.collect_metrics_flag = False

    def log_loss(self, loss, epoch, batch_idx, total_epochs, total_iters):
        ## Construct the log message
        log_message = {
            "id": str(uuid.uuid4()),
            "epoch": epoch,
            "batch_idx": batch_idx,
            "loss": loss,
            "timestamp": time.time(),
            'total_epochs': total_epochs,
            'total_iters': total_iters,
        }
        ## Log loss to loss_container in cosmos db
        self.loss_container.upsert_item(log_message)

    def save_and_upload_model(self, model, model_path):
        ## Log the model checkpoint info to ckpt_container in cosmos db
        model_save_path = f'trained_result_model/{model_path}'
        log_message = {
            "id": str(uuid.uuid4()),
            "model_path": model_save_path,
            "timestamp": time.time()
        }
        self.ckpt_container.upsert_item(log_message)

        ## Save the model checkpoint
        os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
        torch.save(model.state_dict(), model_save_path)

        ## Upload the model checkpoint to Greenfield
        self.upload_model_to_stroage(model_save_path)

# Train the model
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--bucket', type=str, default='client', help='The Bucket of Greenfield')
    args = parser.parse_args()

    bucket_name = args.bucket
    callback = LoggingCallback(db_url, db_key, bucket_name)
    # Start collecting metrics
    callback.start_logging()

    # Train the model
    for epoch in range(epochs):
        running_loss = 0.0
        progress_bar = tqdm(enumerate(train_dataloader), total=len(train_dataloader))
        for i, data in progress_bar:
            inputs, labels = data[0].to(device), data[1].to(device)

            optimizer.zero_grad()

            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            # print statistics
            progress_bar.set_description(f'At epoch = {epoch} Iter = {i}, the loss = {loss.item():.5f}, ')
            # Log the loss to Azure
            callback.log_loss(loss.item(), epoch, i, epochs, len(train_dataloader))

        # Save and upload the model checkpoint after each epoch
        model_checkpoint_name = f"model_epoch_{epoch}.pt"
        callback.save_and_upload_model(model, model_checkpoint_name)

    # Stop collecting metrics
    callback.stop_logging()
