// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Payment.sol";
import "./Task.sol";
import "./Order.sol";
import "./SharedStructs.sol";

contract Marketplace {
    struct TaskInPool {
        uint256 taskId;
        uint256 orderId;
        SharedStructs.TaskType taskType;
    }

    Payment private paymentContract;
    Task private taskContract;
    address[] private workers;
    address private admin;
    address private marketplace;
    TaskInPool[] private taskPool;
    mapping(address => uint256) public workerLoad;
    mapping(uint256 => Order) public orders;
    uint256 private nextOrderId;

    event TaskCompleted(uint256 indexed taskId, address indexed worker);
    event Log(string message, uint256 Id);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this operation.");
        _;
    }

    constructor(address payable paymentAddress, address taskAddress) {
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
        uint256 taskId = taskContract.createTask(
            SharedStructs.TaskType.Training,
            modelUrl,
            trainDataUrl,
            validateDataUrl,
            requiredPower
        );
        Order newOrder = new Order(taskId, msg.sender);
        uint256 orderId = nextOrderId++;
        orders[orderId] = newOrder;
        emit Log("Cread order success!", orderId);
        return orderId;
    }

    function confirmOrder(uint256 orderId, uint256 paymentAmount) public {
        Order order = orders[orderId];
        require(
            msg.sender == order.client(),
            "Only the client can perform this operation."
        );
        require(!order.isConfirmed(), "Order already confirmed.");
        require(workers.length > 0, "No workers available.");

        emit Log("Start transfer!", orderId);
        paymentContract.transfer(address(this), paymentAmount);
        order.confirm(paymentAmount);
        emit Log("Transfer successful!", orderId);

        // Add tasks to the TaskPool
        /*
        taskPool.push(
            TaskInPool(order.taskId(), orderId, SharedStructs.TaskType.Training)
        );
        */
    }

    function assignTaskFromPool() public {
        require(taskPool.length > 0, "No tasks in the pool.");

        // Get the next task from the pool
        TaskInPool memory task = taskPool[0];

        // Find a worker with enough available capacity
        address worker = findAvailableWorker();
        require(worker != address(0), "No available worker found.");

        // Assign the task to the worker
        taskContract.assignTask(task.taskId, worker);
        workerLoad[worker]++;

        // Remove the task from the pool
        taskPool[0] = taskPool[taskPool.length - 1];
        taskPool.pop();
    }

    function findAvailableWorker() private view returns (address) {
        uint256 minLoad = type(uint256).max;
        address availableWorker = address(0);

        for (uint256 i = 0; i < workers.length; i++) {
            if (workerLoad[workers[i]] < minLoad) {
                minLoad = workerLoad[workers[i]];
                availableWorker = workers[i];
            }
        }

        return availableWorker;
    }

    function setMarketplaceAddress(address marketplaceAddress) external {
        require(
            msg.sender == admin,
            "Only admin can set the marketplace address."
        );
        marketplace = marketplaceAddress;
    }

    function onTaskCompleted(uint256 taskId, address worker) external {
        require(
            msg.sender == address(taskContract),
            "Only the Task contract can notify the Marketplace of a completed task."
        );
        taskContract.completeTask(taskId);
        // Update worker's load
        workerLoad[worker]--;
        SharedStructs.TaskInfo memory task = taskContract.getTask(taskId);
        if (task.taskType == SharedStructs.TaskType.Training) {
            task.taskType = SharedStructs.TaskType.Validation;
            task.status = SharedStructs.TaskStatus.Created;
        }
        // Try to assign a new task from the pool
        if (taskPool.length > 0) {
            assignTaskFromPool();
        }
    }

    function selectRandomWorker() private view returns (address) {
        uint256 randomIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.difficulty))
        ) % workers.length;
        return workers[randomIndex];
    }
}
