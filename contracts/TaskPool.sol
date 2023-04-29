// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SharedStructs.sol";

contract TaskPool {
    uint256 private nextTaskId = 1;
    uint256 private taskNumbers = 0;
    mapping(uint256 => SharedStructs.TaskInfo) public tasks;

    event TaskCreated(uint256 indexed taskId, address indexed creator);
    event TaskAssigned(uint256 indexed taskId, address indexed worker);
    event TaskCompleted(uint256 indexed taskId);

    function createTask(
        SharedStructs.TaskType taskType,
        uint256 orderId,
        string memory modelUrl,
        string memory trainDataUrl,
        string memory validateDataUrl,
        uint256 requiredPower
    ) public returns (uint256) {
        uint256 taskId = nextTaskId++;
        tasks[taskId] = SharedStructs.TaskInfo(
            taskId,
            orderId,
            taskType,
            SharedStructs.TaskStatus.Created,
            modelUrl,
            trainDataUrl,
            validateDataUrl,
            requiredPower,
            msg.sender,
            address(0)
        );
        taskNumbers++;
        emit TaskCreated(taskId, msg.sender);
        return taskId;
    }

    function getTask(
        uint256 taskId
    ) public view returns (SharedStructs.TaskInfo memory) {
        return tasks[taskId];
    }

    function HasTask() private view returns(bool)
    {
        return taskNumbers >= 0;
    }

    function assignTask(uint256 taskId, address worker) public {
        require(HasTask(), "No tasks in the pool.");
        SharedStructs.TaskInfo storage task = tasks[taskId];
        require(
            task.status == SharedStructs.TaskStatus.Created,
            "Task is not in Created status."
        );
        task.status = SharedStructs.TaskStatus.Assigned;
        task.worker = worker;
        emit TaskAssigned(taskId, worker);
    }

    function assignWorker(uint256 taskId, address worker) external {
        // Only allow the Marketplace contract to call this function
        SharedStructs.TaskInfo storage task = tasks[taskId];
        require(
            task.status == SharedStructs.TaskStatus.Created ||
                task.status == SharedStructs.TaskStatus.Completed,
            "Task must be in Created or TrainingCompleted status."
        );
        task.status = SharedStructs.TaskStatus.Created;
        task.worker = worker;
        emit TaskAssigned(taskId, worker);
    }

    function completeTask(uint256 taskId) public {
        SharedStructs.TaskInfo storage task = tasks[taskId];
        require(
            task.status == SharedStructs.TaskStatus.Assigned,
            "Task is not in Assigned status."
        );
        require(
            task.worker == msg.sender,
            "Only assigned worker can complete the task."
        );
        task.status = SharedStructs.TaskStatus.Completed;
        taskNumbers--;
        emit TaskCompleted(taskId);
    }
}
