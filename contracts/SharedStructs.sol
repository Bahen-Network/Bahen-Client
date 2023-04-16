// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library SharedStructs {
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

    enum TaskType { Training, Validation }
    enum TaskStatus { Created, Assigned, Completed }
}