// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library SharedStructs {
    struct TaskInfo {
        uint256 id;
        uint256 orderId;
        TaskType taskType;
        TaskStatus status;
        string folderUrl;
        // wei
        uint256 requiredPower;
        address creator;
        uint256 workerId;
        uint256 orderLevel;
    }

    enum TaskType {
        Training,
        Validation
    }
    enum TaskStatus {
        Created,
        Assigned,
        Completed
    }

    enum OrderStatus {
        Created,        
        Confirmed,      
        Completed,      
        Failed         
    }
}
