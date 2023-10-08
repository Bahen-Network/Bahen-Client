## Prerequisites

---

- Client
    - npm
- Worker
    - Python 3
    - PyTorch with CUDA (GPU enabled)
    - GPUtil (module for getting the GPU status from NVIDA GPUs)
    - web3 (interacting with blockchain)

## Configuration

---

- opBNB Testnet config
    - Rpc: https://opbnb-testnet-rpc.bnbchain.org
    - Chain ID: 5611
    - Blockchain Explorer: http://opbnbscan.com
- Worker config

```powershell
{
    "provider": "https://opbnb-testnet-rpc.bnbchain.org",
    "contract_address": "0x3aAFa0B715F358c5f4a359e1351e986b385795bf",
    "account_address": "",
    "private_key": "",
    "chainId": 5611,
    "gas": 6721970,
    "gasPrice": 1
}
```

## Usage

---

S**tep 1**

```powershell
git clone https://github.com/Bahen-Network/Bahen-Client.git
cd Bahen-Client
```

S**tep 2: Client**

1. Start the front-end for clients
    
    ```powershell
    cd ./src/client
    npm install ## (if failed, please use `npm install --force`)
    npm start
    
    ```
    
2. Open marketplace service on the browser, address: http://localhost:3000/
3. Switch network to opBNB in the wallet then connect to wallet
4. Click `Train` to create a training task. Things you need to do:
    1. Upload training files and data
    2. Choose version of PyTorch and Service class
    3. Request cost estimation and pay for it
5. You can check your orders by clicking `My Order`
6. Download result after training task finished by clicking `Download Model` under `My Order`

**Step 3: Worker**

**Note that worker can only run with GPU.*

1. Start worker service
    
    ```
    cd ./src/worker
    ## modify `account_address` and `private_key` in src/config.json
    pip install -r requirements.txt
    python worker.py
    
    ```
    
2. Enter `register` to register your worker in the Marketplace service
3. Enter `start` to start polling tasks. When worker is assigned a task, do training and provide proof-of-train, if succeed, you will get the rewards.
