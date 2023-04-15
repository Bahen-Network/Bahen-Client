// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Task {
    // 定义结构体
    struct TaskInfo {
        uint taskId;
        address client;
        address worker;
        string trainFileUrl;
        string validationFileUrl;
        string resultFileUrl;
        uint cost;
        bool isPaid;
        bool isAssigned;
        bool isCompleted;
    }

    // 状态变量
    uint public taskCount;
    mapping(uint => TaskInfo) public taskInfos;

    // 创建任务信息
    function createTaskInfo(address client, uint cost) public returns (uint) {
        taskCount++;
        TaskInfo storage newTask = taskInfos[taskCount];
        newTask.taskId = taskCount;
        newTask.client = client;
        newTask.cost = cost;
        newTask.isPaid = true;
        newTask.isAssigned = false;
        newTask.isCompleted = false;
        return taskCount;
    }

    // 分配 worker
    function assignWorker(uint taskId, address worker) public {
        TaskInfo storage task = taskInfos[taskId];
        require(!task.isAssigned, "Task is already assigned");
        task.worker = worker;
        task.isAssigned = true;
    }

    // 完成任务
    function completeTask(uint taskId, string memory resultFileUrl) public {
        TaskInfo storage task = taskInfos[taskId];
        require(!task.isCompleted, "Task is already completed");
        task.resultFileUrl = resultFileUrl;
        task.isCompleted = true;
    }

    // 获取支付信息
    function getPaymentInfo(uint taskId) public view returns (address, address, uint) {
        TaskInfo storage task = taskInfos[taskId];
        return (task.client, task.worker, task.cost);
    }
}