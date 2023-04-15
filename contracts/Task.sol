// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Task {
    enum TaskType {TRAIN, VALIDATE}

    struct TaskDetails {
        TaskType taskType;
        string modelUrl;
        string dataUrl;
        uint256 requiredPower;
        address assignedWorker;
        bool completed;
    }

    mapping(uint256 => TaskDetails) public tasks;
    uint256 private nextTaskId;

    function createTask(
        TaskType taskType,
        string memory modelUrl,
        string memory dataUrl,
        uint256 requiredPower
    ) public returns (uint256) {
        uint256 taskId = nextTaskId++;
        tasks[taskId] = TaskDetails({
            taskType: taskType,
            modelUrl: modelUrl,
            dataUrl: dataUrl,
            requiredPower: requiredPower,
            assignedWorker: address(0),
            completed: false
        });
        return taskId;
    }

    function assignTask(uint256 taskId, address worker) public {
        TaskDetails storage task = tasks[taskId];
        require(task.assignedWorker == address(0), "Task already assigned.");
        task.assignedWorker = worker;
    }

    function completeTask(uint256 taskId) public {
        TaskDetails storage task = tasks[taskId];
        require(task.assignedWorker != address(0), "Task not assigned.");
        require(!task.completed, "Task already completed.");
        task.completed = true;
    }
}
