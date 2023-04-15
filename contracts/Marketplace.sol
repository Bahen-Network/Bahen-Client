// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Payment.sol";
import "./Task.sol";

contract Marketplace {
    Payment private paymentContract;
    Task private taskContract;
    address[] private workers;
    address private admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this operation.");
        _;
    }

    constructor(address paymentAddress, address taskAddress) {
        paymentContract = Payment(paymentAddress);
        taskContract = Task(taskAddress);
        admin = msg.sender;
    }

    function registerWorker(address worker) public onlyAdmin {
        workers.push(worker);
    }

    function createOrderPreview(
        Task.TaskType taskType,
        string memory modelUrl,
        string memory dataUrl,
        uint256 requiredPower
    ) public returns (uint256) {
        uint256 taskId = taskContract.createTask(taskType, modelUrl, dataUrl, requiredPower);
        return taskId;
    }

    function confirmOrder(uint256 taskId, uint256 paymentAmount) public {
        paymentContract.transfer(address(this), paymentAmount);

        // Randomly assign a worker
        address randomWorker = selectRandomWorker();
        taskContract.assignTask(taskId, randomWorker);
    }

    function selectRandomWorker() private view returns (address) {
        require(workers.length > 0, "No workers available.");
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % workers.length;
    return workers[randomIndex];
    }
}