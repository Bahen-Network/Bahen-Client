// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Payment.sol";
import "./TaskPool.sol";
import "./Order.sol";
import "./SharedStructs.sol";
import "./WorkerPool.sol";

contract Marketplace {
    Payment private paymentContract;
    TaskPool private taskPoolContract;
    WorkerPool private workerPoolContract;
    address private admin;
    address private marketplace;
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

    constructor(address payable paymentAddress, address taskPoolAddress, address workerPoolAddress) {
        paymentContract = Payment(paymentAddress);
        taskPoolContract = TaskPool(taskPoolAddress);
        workerPoolContract = WorkerPool(workerPoolAddress);
        admin = msg.sender;
        nextOrderId = 0;
    }

    function addWorker(address worker, uint256 _computingPower) public onlyAdmin {
        workerPoolContract.addWorker(worker, _computingPower);
    }

    function removeWorker(address worker) public onlyAdmin {
        workerPoolContract.removeWorker(worker);
    }

    function createOrderPreview(
        string memory modelUrl,
        string memory trainDataUrl,
        string memory validateDataUrl,
        uint256 requiredPower
    ) public returns (uint256) {
        uint256 orderId = nextOrderId++;
        uint256 taskId = taskPoolContract.createTask(
            SharedStructs.TaskType.Training,
            orderId,
            modelUrl,
            trainDataUrl,
            validateDataUrl,
            requiredPower
        );
        Order newOrder = new Order(taskId, msg.sender);
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

        require(
            order.orderStatus() != SharedStructs.OrderStatus.Confirmed,
            "Order already confirmed."
        );
        // require(workers.length > 0, "No workers available.");

        require(msg.value >= paymentAmount, "Not enough funds provided.");

        // Send the funds to the Marketplace contract
        Payment(paymentContract).deposit{value: msg.value}(msg.sender);

        order.confirm(paymentAmount);
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

    function setMarketplaceAddress(address marketplaceAddress) external {
        require(
            msg.sender == admin,
            "Only admin can set the marketplace address."
        );
        marketplace = marketplaceAddress;
    }
}
