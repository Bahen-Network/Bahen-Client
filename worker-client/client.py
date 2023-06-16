import json
from web3 import Web3
import time
from src.getPower import get_power
from src.utils import perform_training_task  # Here we import the get_power function from the power.py file
import requests

# Load Config file
with open('src/config.json', 'r') as f:
    config = json.load(f)

# Connect to Ethereum node
provider = config['provider']
web3 = Web3(Web3.HTTPProvider(provider))

# Set default accountget
account_address = config['account_address']
private_key = config['private_key']
web3.eth.defaultAccount = account_address

# Load contract
contract_address = web3.to_checksum_address(config['contract_address'])
with open('ABI/Marketplace.json', 'r') as f:
    abi = json.load(f)
marketplace_contract = web3.eth.contract(address=contract_address, abi=abi)

# read config from config.json
gas = config['gas']
gasPrice = config['gasPrice']
gasPrice_wei = web3.to_wei(str(gasPrice), 'gwei')
# If you are operating on the Ropesten test network, your chain ID should be 3. 
# If you are operating on the main network, the chain ID should be 1. 
# If you operate on the local Ganache network, the chain ID may be 1337 (or other value determined by the Ganache configuration).
chainId = config['chainId']


# computing_power = config['computing_power']
computing_power = int(get_power())
def register_worker():
    print("Registering worker with computing power: ", computing_power)
    nonce = web3.eth.get_transaction_count(account_address)
    txn = marketplace_contract.functions.addWorker(account_address, computing_power).build_transaction({
        'chainId': chainId,
        'gas': gas,
        'gasPrice': gasPrice_wei,
        'nonce': nonce,
    })
    signed_txn = web3.eth.account.sign_transaction(txn, private_key=private_key)
    web3.eth.send_raw_transaction(signed_txn.rawTransaction)

def remove_worker():
    print("Removing worker...")
    nonce = web3.eth.get_transaction_count(account_address)
    txn = marketplace_contract.functions.removeWorker(account_address).build_transaction({
        'chainId': chainId,
        'gas': gas,
        'gasPrice': gasPrice_wei,
        'nonce': nonce,
    })
    signed_txn = web3.eth.account.sign_transaction(txn, private_key=private_key)
    web3.eth.send_raw_transaction(signed_txn.rawTransaction)

def complete_task(taskId):
    print("Completing task...")
    nonce = web3.eth.getTransactionCount(account_address)
    txn = marketplace_contract.functions.completeTask(taskId).build_transaction({
        'chainId': chainId,
        'gas': gas,
        'gasPrice': gasPrice_wei,
        'nonce': nonce,
    })
    signed_txn = web3.eth.account.sign_transaction(txn, private_key=private_key)
    web3.eth.send_raw_transaction(signed_txn.rawTransaction)

# struct Worker {
#    uint256 id;
#    uint256 computingPower;
#    bool isBusy;
#    bool isActive;
#    uint256 currentTaskId;
#}
def start_polling():
    print("Start polling...")
    while True:
        worker_info = marketplace_contract.functions.getWorkerInfo(account_address).call()
        if worker_info[4] != 0:  # Access the fifth item in the tuple
            task = marketplace_contract.functions.getTask(worker_info[4]).call()
            perform_training_task(task)
            complete_task(worker_info[4])
        else:
            print("No task now!")
        time.sleep(10)  # Poll every 10 seconds

def complete_task(taskId):
    print("Completing task...")
    
    # Call Azure function to validate task
    function_app_url = "https://proof-of-train.azurewebsites.net/api/HttpTrigger1?"
    headers = {"x-functions-key": '0Mc51OFbjT1J8PFJeoiuG55iM1Xg_PR6GPPXhlU8iVSCAzFuAAgrIw=='}
    try:
        response = requests.post(function_app_url, headers=headers)
        if response.text == 'True':
            print("Task completed")
    except Exception as e:
        print(f"An unexpected error occurred: {e} for task validation")

    nonce = web3.eth.get_transaction_count(account_address)
    txn = marketplace_contract.functions.CompleteTask(account_address, taskId).build_transaction({
        'chainId': chainId,
        'gas': gas,
        'gasPrice': gasPrice_wei,
        'nonce': nonce,
    })
    signed_txn = web3.eth.account.sign_transaction(txn, private_key=private_key)
    web3.eth.send_raw_transaction(signed_txn.rawTransaction)

if __name__ == "__main__":
    print("Commands: register, remove, start, getPower, quit")
    while True:
        command = input("Enter command: ")
        if command.lower() == "register":
            register_worker()
        elif command.lower() == "remove":
            remove_worker()
        elif command.lower() == "start":
            start_polling()
        elif command.lower() == "getpower":
            print(get_power())
        elif command.lower() == "quit":
            print("Exiting program.")
            break
        else:
            print("Invalid command. Please enter a valid command!")

