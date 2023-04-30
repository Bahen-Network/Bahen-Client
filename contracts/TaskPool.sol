// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SharedStructs.sol";

contract TaskPool {
    uint256 private nextTaskId = 1;
    mapping(uint256 => SharedStructs.TaskInfo) public tasks;
    uint256[] private taskIds;
    event TaskCreated(uint256 indexed taskId, address indexed creator);
    event TaskAssigned(uint256 indexed taskId, uint256 indexed workerId);
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
            0
        );
        taskIds.push(taskId);
        emit TaskCreated(taskId, msg.sender);
        return taskId;
    }

    function getTask(
        uint256 taskId
    ) public view returns (SharedStructs.TaskInfo memory) {
        return tasks[taskId];
    }

    function getPendingTask() public view returns(SharedStructs.TaskInfo memory)
    {
        require(HasTask(), "No tasks in the pool.");
        tasks[taskIds[0]]; 
    }

    function HasTask() private view returns(bool)
    {
        return taskIds.length > 0;
    }

    function assignTask(uint256 taskId, uint256 workerId) public {
        require(HasTask(), "No tasks in the pool.");
        SharedStructs.TaskInfo storage task = tasks[taskId];
        require(
            task.status == SharedStructs.TaskStatus.Created,
            "Task is not in Created status."
        );
        task.status = SharedStructs.TaskStatus.Assigned;
        task.workerId = workerId;
        emit TaskAssigned(taskId, workerId);
    }

    function completeTask(uint256 taskId) public {
        SharedStructs.TaskInfo storage task = tasks[taskId];
        require(
            task.status == SharedStructs.TaskStatus.Assigned,
            "Task is not in Assigned status."
        );
        task.status = SharedStructs.TaskStatus.Completed;
        removeTaskAfterComplete(taskId);
        emit TaskCompleted(taskId);
    }

    function removeTaskAfterComplete(uint256 taskId) private
    {
        uint256 index = findTaskIndex(taskId);
        if(index < taskIds.length)
        {
            taskIds[index] = taskIds[taskIds.length - 1];
            taskIds.pop();
        }
    }

    function findTaskIndex(uint256 taskId) internal view returns(uint256 taskIndex)
    {
        for(uint256 i = 0; i < taskIds.length; i++)
        {
            if(taskIds[i] == taskId)
            {
                return i;
            }
        }

        return taskIds.length;
    }
}
