import Web3 from 'web3';
import Marketplace from '../api/Marketplace.json';
import detectEthereumProvider from '@metamask/detect-provider';
export const configureMoonbaseAlpha = async () => {
  const provider = await detectEthereumProvider({ mustBeMetaMask: true });
  if (provider) {
      try {
          await provider.request({ method: "eth_requestAccounts"});
          await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                  {
                      chainId: "0x507", // Moonbase Alpha's chainId is 1287, which is 0x507 in hex
                      chainName: "Moonbase Alpha",
                      nativeCurrency: {
                          name: 'DEV',
                          symbol: 'DEV',
                          decimals: 18
                      },
                  rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
                  blockExplorerUrls: ["https://moonbase.moonscan.io/"]
                  },
              ]
          })
      } catch(e) {
          console.error(e);
      }  
  } else {
      console.error("Please install MetaMask");
  }
}

let web3;
let contract;

const getWeb3 = async () => {
  if (!web3) {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        // User denied account access...
        console.error('User denied account access');
      }
    } else {
      const provider = new Web3.providers.HttpProvider('https://rpc.api.moonbase.moonbeam.network');
      web3 = new Web3('https://rpc.api.moonbase.moonbeam.network');
    }
  }
  return web3;
};

export const getUserAddress = async () => {
  const web3Instance = await getWeb3();
  const accounts = await web3Instance.eth.getAccounts();
  const userAddress = accounts[0];
  console.log(`User address: ${userAddress}`);
  return userAddress;
};


const getMarketplaceContractInstance = async () => {
  if (!contract) {
    const web3Instance = await getWeb3();
    const networkId = await web3Instance.eth.net.getId();
    const deployedNetwork = Marketplace.networks[networkId];
    contract = new web3Instance.eth.Contract(Marketplace.abi, deployedNetwork && deployedNetwork.address);
    console.log(networkId)
    console.log(contract)
  }
  return contract;
};

export const createOrderPreview = async (folderUrl, requiredPower, orderLevel) => {
  const contractInstance = await getMarketplaceContractInstance();
  const web3Instance = await getWeb3();
  const accounts = await web3Instance.eth.getAccounts();
  const address = await getUserAddress();
  console.log(`User address  CreateOrder: ${address}  folder: ${folderUrl}, requiredPower:${requiredPower}`);
  try {
    const result = await contractInstance.methods
      .createOrderPreview(folderUrl, requiredPower, orderLevel)
      .send({ from: accounts[0] });

    const orderId = result.events.OrderCreated.returnValues.orderId;
    console.log(`Order Preview Created: ${orderId}`);
    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

export const getUserOrders = async (userAddress) => {
  const address = await getUserAddress();
  console.log(`User address: ${address}`);
  try {
    const contractInstance = await getMarketplaceContractInstance();
    const userOrderIds = await contractInstance.methods.getUserOrders(userAddress).call();

    return userOrderIds;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

export const getWorkerList = async () => {
  const address = await getUserAddress();
  console.log(`User address: ${address}`);
  try {
    const contractInstance = await getMarketplaceContractInstance();
    const workers = await contractInstance.methods.getWorkerList().call();

    return workers;
  } catch (error) {
    console.error("Error fetching worker lists:", error);
    throw error;
  }
};

export const getWorkerInfo = async (workerAddress) => {
  const address = await getUserAddress();
  console.log(`User address: ${address}`);
  try {
    const contractInstance = await getMarketplaceContractInstance(); // 添加 await 关键字
    const workerInfo = await contractInstance.methods.getWorkerInfo(workerAddress).call();

    return {
      workerId: workerInfo.workerId,
      computingPower: workerInfo.computingPower,
      isBusy: workerInfo.isBusy? "true": "false",
      isActivate: workerInfo.isActivate? "true": "false",
    };
  } catch (error) {
    console.error("Error fetching workerInfo:", error);
    throw error;
  }
};


export const getOrderInfo = async (orderId) => {
  const address = await getUserAddress();
  console.log(`User address: ${address}`);
  try {
    const contractInstance = await getMarketplaceContractInstance();

    const orderInfo = await contractInstance.methods.getOrderInfo(orderId).call();

    console.log("get orderInfo:", orderInfo);

    let orderStatus;
    if (orderInfo._orderStatus == "0") {
      orderStatus = "Created";
    } else if (orderInfo._orderStatus == "1") {
      orderStatus = "Confirmed";
    } else if (orderInfo._orderStatus == "2") {
      orderStatus = "Completed";
    } else {
      orderStatus = "Failed";
    }
    return {
      trainTaskId: orderInfo._trainTaskId == 0 ? "Not Create" : orderInfo._trainTaskId,
      validateTaskId: orderInfo._validateTaskId == 0 ? "Not Create" : orderInfo._validateTaskId,
      client: orderInfo._client,
      paymentAmount: orderInfo._paymentAmount,
      requiredComputingPower: orderInfo._requiredComputingPower,
      orderStatus: orderStatus,
      orderLevel: orderInfo._orderLevel // 订单等级
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};



export const confirmOrder = async (orderId, paymentAmount) => {
  const contractInstance = await getMarketplaceContractInstance();
  const web3Instance = await getWeb3();
  const accounts = await web3Instance.eth.getAccounts();
  let result;
  try {
    result = await contractInstance.methods
      .confirmOrder(orderId, paymentAmount)
      .send({ from: accounts[0], value: paymentAmount });
  } catch (error) {
    console.error('Error executing transaction:', error);
  }
  return result;
};


