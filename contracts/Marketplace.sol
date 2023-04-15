// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Payment.sol";
import "./Task.sol";
import "./Order.sol";

contract Marketplace {
    Payment private paymentContract;
    Task private taskContract;
    address[] private workers;
    address private admin;

    mapping(uint256 => Order) public orders;
    uint256 private nextOrderId;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this operation.");
        _;
    }

    constructor(address paymentAddress, address taskAddress) {
        paymentContract = Payment(paymentAddress);
        taskContract = Task(taskAddress);
        admin = msg.sender;
    }

    function addWorker(address worker) public onlyAdmin {
        workers.push(worker);
    }

    function removeWorker(address worker) public onlyAdmin {
        for (uint256 i = 0; i < workers.length; i++) {
            if (workers[i] == worker) {
                workers[i] = workers[workers.length - 1];
                workers.pop();
                break;
            }
        }
    }

    function createOrderPreview(
    string memory modelUrl,
    string memory trainDataUrl,
    string memory validateDataUrl,
    uint256 requiredPower
    ) public returns (uint256) {
        uint256 trainTaskId = taskContract.createTask(Task.TaskType.TRAIN, modelUrl, trainDataUrl, requiredPower);
        uint256 validateTaskId = taskContract.createTask(Task.TaskType.VALIDATE, modelUrl, validateDataUrl, requiredPower);
        
        Order newOrder = new Order(trainTaskId, validateTaskId, msg.sender);
        uint256 orderId = nextOrderId++;
        orders[orderId] = newOrder;
        return orderId;
    }


    function confirmOrder(uint256 orderId, uint256 paymentAmount) public {
        Order order = orders[orderId];
        require(msg.sender == order.client(), "Only the client can perform this operation.");
        require(!order.isConfirmed(), "Order already confirmed.");
        require(workers.length > 0, "No workers available.");

        paymentContract.transfer(address(this), paymentAmount);
        order.confirm(paymentAmount);

        // Randomly assign a worker
        address randomWorker = selectRandomWorker();
        taskContract.assignTask(order.taskId(), randomWorker);
    }

    function selectRandomWorker() private view returns (address) {
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % workers.length;
        return workers[randomIndex];
    }
}
