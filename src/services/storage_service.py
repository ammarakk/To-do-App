"""
Storage Service - Data Tier Subagent
Constitutional Requirement: In-memory only, no persistence, stateless operations
"""

from typing import Optional, Dict
from models.task import Task


class StorageService:
    """
    In-memory storage service for tasks.

    Constitutional Compliance:
        - In-memory dictionary storage only
        - No file I/O
        - No database connections
        - No persistence
        - Session-scoped data

    Subagent Role:
        - StateMutationSubagent: Manages task storage state
        - Stateless per-operation
        - Pure CRUD operations on in-memory dict
    """

    def __init__(self):
        """
        Initialize storage with empty dictionary and ID counter.
        """
        self._tasks: Dict[int, Task] = {}
        self._next_id: int = 1

    def store_task(self, task: Task) -> None:
        """
        Store a task in memory.

        Args:
            task: Task object to store

        Constitutional Compliance:
            - In-memory dictionary storage
            - No persistence
        """
        self._tasks[task.id] = task

    def get_task(self, task_id: int) -> Optional[Task]:
        """
        Retrieve a single task by ID.

        Args:
            task_id: The task ID to retrieve

        Returns:
            Task object if found, None otherwise
        """
        return self._tasks.get(task_id)

    def get_all_tasks(self) -> list[Task]:
        """
        Retrieve all tasks.

        Returns:
            List of all Task objects (may be empty)
        """
        return list(self._tasks.values())

    def update_task(self, task_id: int, task: Task) -> bool:
        """
        Update an existing task in storage.

        Args:
            task_id: The ID of the task to update
            task: Updated Task object

        Returns:
            bool: True if updated, False if task not found
        """
        if task_id in self._tasks:
            self._tasks[task_id] = task
            return True
        return False

    def delete_task(self, task_id: int) -> bool:
        """
        Remove a task from storage.

        Args:
            task_id: The ID of the task to delete

        Returns:
            bool: True if deleted, False if task not found
        """
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False

    def get_next_id(self) -> int:
        """
        Get the next available task ID.

        Returns:
            int: Next ID to use for new task
        """
        current_id = self._next_id
        self._next_id += 1
        return current_id

    def get_existing_ids(self) -> set[int]:
        """
        Get set of all existing task IDs.

        Returns:
            set: Set of task IDs currently in storage
        """
        return set(self._tasks.keys())
