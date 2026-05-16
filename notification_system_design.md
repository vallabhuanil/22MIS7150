# Campus Notification Platform System Design

## Stage 1: REST API Design

### Endpoints

1.  **GET /notifications**
    - **Description**: Fetch all notifications for the authenticated student.
    - **Headers**: `Authorization: Bearer <token>`
    - **Response (JSON)**:
        ```json
        {
          "notifications": [
            { "ID": "1", "Type": "Placement", "Message": "...", "Timestamp": "2024-05-16T10:00:00Z", "isRead": false },
            { "ID": "2", "Type": "Result", "Message": "...", "Timestamp": "2024-05-16T09:00:00Z", "isRead": true }
          ]
        }
        ```

2.  **POST /notifications/read**
    - **Description**: Mark a notification as read.
    - **Request (JSON)**: `{ "notificationID": "1" }`
    - **Response**: `{ "status": "success" }`

3.  **GET /notifications/unread-count**
    - **Description**: Get count of unread notifications for badge display.
    - **Response**: `{ "count": 5 }`

### Real-Time Notification Mechanism
- **WebSocket (Socket.io)**: Establish a persistent connection between the student's app/browser and the server. When a new notification is saved to the DB, the server emits a `new_notification` event to the specific student's socket room (`student_room_<id>`).
- **Push Notifications (FCM/APNs)**: For mobile devices, use Firebase Cloud Messaging (FCM) to deliver notifications even when the app is in the background.

---

## Stage 2: Database Design

### DB Choice: SQL (PostgreSQL)
- **Rationale**: Notifications for campus events, results, and placements require high consistency and involve structured data with relationships (Student -> Notification). SQL handles complex queries and indexing (essential for Stage 3) better than most NoSQL options for this specific use case.

### Schema
```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    type VARCHAR(20) CHECK (type IN ('Placement', 'Result', 'Event')),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Scaling Problems & Solutions
- **Problem**: Table grows too large (millions of notifications).
- **Solution**: **Partitioning** the `notifications` table by `created_at` or `student_id`. Old notifications can be archived to cold storage.
- **Problem**: Write heavy during peak result/placement times.
- **Solution**: Use an **Asynchronous Message Queue** (RabbitMQ/Kafka) to buffer notification creation requests.

### Queries for Stage 1
- **Fetch Notifications**: `SELECT * FROM notifications WHERE student_id = $1 ORDER BY created_at DESC;`
- **Mark as Read**: `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND student_id = $2;`

---

## Stage 3: Query Optimization

### Analysis of Slow Query:
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```
- **Why is it slow?**: Without an index, the DB performs a **Full Table Scan**. It has to check every row for `studentID` and `isRead`, then sort the remaining rows by `createdAt`.
- **Fix**: Create a **Composite Index**.
  ```sql
  CREATE INDEX idx_student_unread ON notifications (studentID, isRead, createdAt DESC);
  ```
- **Index Every Column?**: No. Indexes speed up reads but slow down writes (INSERT/UPDATE) and consume storage. Only index columns used in `WHERE`, `JOIN`, or `ORDER BY` clauses.

### Query for Placement Notifications (Last 7 Days)
```sql
SELECT * FROM students s
JOIN notifications n ON s.id = n.student_id
WHERE n.type = 'Placement' 
  AND n.created_at >= NOW() - INTERVAL '7 days';
```

---

## Stage 4: Performance Solutions for 50,000 Students

- **Caching (Redis)**: Store the list of notifications (or at least the unread count) in Redis. On login/load, fetch from Redis. TTL should be set (e.g., 5 mins).
- **Read Replicas**: Use a master-slave DB setup. All reads go to replicas, distributing the load.
- **Tradeoffs**: 
    - Redis: Cache invalidation is hard. If a student marks a notification as read, you must update the cache immediately or accept slight stale data.
    - Replicas: Replication lag might cause a student to not see a newly created notification for a few milliseconds.

---

## Stage 5: Reliable Notification Pseudocode

### Problems with Original Code:
1. **Synchronous/Blocking**: If `send_email` is slow, the whole loop hangs.
2. **Atomic Failure**: If one step fails, the others still happen (or don't), leaving the system in an inconsistent state.
3. **No Retries**: Failed emails are lost.

### Revised Pseudocode (Message Queue Based):
```typescript
async function notify_all(student_ids, message) {
  for (const student_id of student_ids) {
    // 1. Save to DB first (Source of Truth)
    const notification = await db.save_to_db(student_id, message);
    
    // 2. Publish to a Message Queue (Reliability)
    await queue.publish('notification_task', {
      student_id,
      notification_id: notification.id,
      message
    });
  }
}

// Worker process handles the tasks
worker.on('notification_task', async (task) => {
  try {
    // parallel delivery
    await Promise.allSettled([
      send_email(task.student_id, task.message),
      push_to_app(task.student_id, task.message)
    ]);
  } catch (error) {
    // Log error and retry only failed tasks using Dead Letter Queues
    handle_failure(task);
  }
});
```

---

## Stage 6: Priority Inbox Implementation

*(Implemented in `notification_app_be/src/priority-inbox.ts`)*
