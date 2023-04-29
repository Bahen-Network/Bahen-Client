const Payment = artifacts.require("./Payment.sol");
const TaskPool = artifacts.require("./TaskPool.sol");
const Marketplace = artifacts.require("./Marketplace.sol");

module.exports = async function (deployer) {
  // 部署Payment合约
  await deployer.deploy(Payment);
  const paymentInstance = await Payment.deployed();

  // 部署Task合约
  await deployer.deploy(TaskPool);
  const taskPoolInstance = await TaskPool.deployed();

  // 使用已部署的Payment和Task合约的地址，部署Marketplace合约
  await deployer.deploy(Marketplace, paymentInstance.address, taskPoolInstance.address);
};
