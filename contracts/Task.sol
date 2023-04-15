// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Task {
    enum TaskType { Training, Validation }
    enum TaskStatus { Created, Assigned, Completed }

    struct TaskInfo {
        uint256 id;
        TaskType taskType;
        TaskStatus status;
        string modelUrl;
        string dataUrl;
        uint256 requiredPower;
        address creator;
        address worker;
    }

    uint256 private nextTaskId = 1;
    mapping(uint256 => TaskInfo) public tasks;

    event TaskCreated(uint256 indexed taskId, address indexed creator);
    event TaskAssigned(uint256 indexed taskId, address indexed worker);
    event TaskCompleted(uint256 indexed taskId);

    function createTask(
        TaskType taskType,
        string memory modelUrl,
        string memory dataUrl,
        uint256 requiredPower
    ) public returns (uint256) {
        uint256 taskId = nextTaskId++;
        tasks[taskId] = TaskInfo(taskId, taskType, TaskStatus.Created, modelUrl, dataUrl, requiredPower, msg.sender, address(0));
        emit TaskCreated(taskId, msg.sender);
        return taskId;
    }

    function assignTask(uint256 taskId, address worker) public {
        TaskInfo storage task = tasks[taskId];
        require(task.status == TaskStatus.Created, "Task is not in Created status.");
        task.status = TaskStatus.Assigned;
        task.worker = worker;
        emit TaskAssigned(taskId, worker);
    }

    function completeTask(uint256 taskId) public {
        TaskInfo storage task = tasks[taskId];
        require(task.status == TaskStatus.Assigned, "Task is not in Assigned status.");
        require(task.worker == msg.sender, "Only assigned worker can complete the task.");
        task.status = TaskStatus.Completed;
        emit TaskCompleted(taskId);
    }
}
