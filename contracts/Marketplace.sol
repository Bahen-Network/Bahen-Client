// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Payment.sol";
import "./Task.sol";

contract Marketplace {
    // 引用其他合约
    Payment private paymentContract;
    Task private taskContract;

    constructor(address paymentAddress, address taskAddress) {
        paymentContract = Payment(paymentAddress);
        taskContract = Task(taskAddress);
    }

    // 事件
    event TaskCreated(uint taskId, address client);
    event TaskAssigned(uint taskId, address worker);
    event TaskCompleted(uint taskId);

    // 创建任务
    function createTask(
        string memory trainFileUrl,
        string memory validationFileUrl,
        uint cost
    ) public payable {
        require(msg.value >= cost, "Insufficient payment");

        // 向 Payment 合约发送付款
        paymentContract.receivePayment{value: msg.value}(msg.sender, cost);

        // 创建任务信息
        uint taskId = taskContract.createTaskInfo(msg.sender, cost);

        // 触发任务创建事件
        emit TaskCreated(taskId, msg.sender);
    }

    // 分配 worker
    function assignWorker(uint taskId, address worker) public {
        taskContract.assignWorker(taskId, worker);

        // 触发任务分配事件
        emit TaskAssigned(taskId, worker);
    }

    // 完成任务
    function completeTask(uint taskId, string memory resultFileUrl) public {
        taskContract.completeTask(taskId, resultFileUrl);

        // 从 Payment 合约中将款项支付给 worker
        (address client, address worker, uint cost) = taskContract.getPaymentInfo(taskId);
        paymentContract.sendPayment(worker, cost);

        // 触发任务完成事件
        emit TaskCompleted(taskId);
    }
}
