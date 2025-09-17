Events
- `task.assigned`: payload { taskId, orderId }
- `task.assigned.bulk`: payload { orderId, count }

Client should join with auth containing `userId` to receive per-user events.