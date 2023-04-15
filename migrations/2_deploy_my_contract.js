const Marketplace = artifacts.require("Marketplace");
const Payment = artifacts.require("Payment");
const Task = artifacts.require("Task");

module.exports = async function (deployer) {
  // 部署Payment合约
  await deployer.deploy(Payment);
  const paymentInstance = await Payment.deployed();

  // 部署Task合约
  await deployer.deploy(Task);
  const taskInstance = await Task.deployed();

  // 获取Payment和Task合约的地址
  const paymentAddress = paymentInstance.address;
  const taskAddress = taskInstance.address;

  // 使用Payment和Task合约的地址部署Marketplace合约
  await deployer.deploy(Marketplace, paymentAddress, taskAddress);
};
