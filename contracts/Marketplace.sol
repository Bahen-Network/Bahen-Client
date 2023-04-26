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
    mapping(address => uint256[]) public userOrders;
    uint256 private nextOrderId;

    event TaskCompleted(uint256 indexed taskId, address indexed worker);

    // TODO: delete message to save gas
    event OrderCreated(string message, uint256 orderId);
    event ConfirmOrder(uint256 orderId, uint256 paymentAmount);
    event Log(string message);
    event Logad(address adr, address adr2);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this operation.");
        _;
    }

    constructor(address payable paymentAddress, address taskAddress) {
        paymentContract = Payment(paymentAddress);
        taskContract = Task(taskAddress);
        admin = msg.sender;
        nextOrderId = 0;
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
        string memory folderUrl,
        uint256 requiredPower
    ) public returns (uint256) {
        uint256 taskId = taskContract.createTask(
            SharedStructs.TaskType.Training,
            folderUrl,
            requiredPower
        );
        Order newOrder = new Order(taskId, msg.sender);
        uint256 orderId = nextOrderId++;
        orders[orderId] = newOrder;

        // update [userAdress, order] map
        userOrders[msg.sender].push(orderId);

        emit OrderCreated("Cread order success!", orderId);
        return orderId;
    }

    function confirmOrder(
        uint256 orderId,
        uint256 paymentAmount
    ) public payable {
        Order order = orders[orderId];
        require(
            msg.sender == order.client(),
            "Only the client can perform this operation."
        );
        // require(workers.length > 0, "No workers available.");

        require(msg.value >= paymentAmount, "Not enough funds provided.");

        // Send the funds to the Marketplace contract
        Payment(paymentContract).deposit{value: msg.value}(msg.sender);

        order.confirm(paymentAmount);

        // Add tasks to the TaskPool
        /*
        taskPool.push(
            TaskInPool(order.taskId(), orderId, SharedStructs.TaskType.Training)
        );
        */
    }

    // get order by user adress
    function getUserOrders(
        address user
    ) public view returns (uint256[] memory) {
        return userOrders[user];
    }

    function getOrderInfo(
        uint256 orderId
    )
        public
        view
        returns (
            uint256 _taskId,
            uint256 _validateTaskId,
            address _client,
            uint256 _paymentAmount,
            SharedStructs.OrderStatus _orderStatus
        )
    {
        Order order = orders[orderId];
        _taskId = order.taskId();
        _validateTaskId = order.validateTaskId();
        _client = order.client();
        _paymentAmount = order.paymentAmount();
        _orderStatus = order.orderStatus();
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
