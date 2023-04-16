// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Payment.sol";
import "./Task.sol";
import "./Order.sol";

contract Marketplace {

    struct TaskInPool {
    uint256 taskId;
    uint256 orderId;
    Task.TaskType taskType;
    }   

    Payment private paymentContract;
    Task private taskContract;
    address[] private workers;
    address private admin;
    TaskInPool[] private taskPool;
    mapping(address => uint256) public workerLoad;

    uint256[] public orderIds;

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

    function getOrderList() public view returns (uint256[] memory) {
        return orderIds;
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
        orderIds.push(orderId); // 将新订单ID添加到数组中
        return orderId;
    }

    function confirmOrder(uint256 orderId, uint256 paymentAmount) public {
    Order order = orders[orderId];
    require(msg.sender == order.client(), "Only the client can perform this operation.");
    require(!order.isConfirmed(), "Order already confirmed.");
    require(workers.length > 0, "No workers available.");

    paymentContract.transfer(address(this), paymentAmount);
    order.confirm(paymentAmount);


    // Add tasks to the TaskPool
    taskPool.push(TaskInPool(order.trainTaskId(), orderId, Task.TaskType.Training));
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
    require(msg.sender == admin, "Only admin can set the marketplace address.");
    marketplace = marketplaceAddress;
    }

    function completeTask(uint256 taskId) public {
        TaskInfo storage task = tasks[taskId];
        require(task.status == TaskStatus.Assigned, "Task is not in Assigned status.");
        require(task.worker == msg.sender, "Only assigned worker can complete the task.");
        task.status = TaskStatus.Completed;
        emit TaskCompleted(taskId, msg.sender);

        // Notify the Marketplace contract
        Marketplace(marketplace).onTaskCompleted(taskId, msg.sender);
    }

    function onTaskCompleted(uint256 taskId, address worker) external {
        require(msg.sender == address(taskContract), "Only the Task contract can notify the Marketplace of a completed task.");

        // Update worker's load
        workerLoad[worker]--;

        // Try to assign a new task from the pool
        if (taskPool.length > 0) {
            assignTaskFromPool();
        }
   }

    function selectRandomWorker() private view returns (address) {
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % workers.length;
        return workers[randomIndex];
    }
}