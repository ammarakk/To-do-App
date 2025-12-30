"""
Task Service - Application Tier Subagents
Constitutional Requirement: Business logic layer, uses Skills, coordinates with Storage
"""

from typing import Tuple, Optional
from models.task import Task
from services.storage_service import StorageService
from skills.validators import validate_title, validate_id
from skills.id_generator import generate_next_id


class TaskService:
    """
    Task service providing CRUD operations.

    Constitutional Compliance:
        - Uses Skills for validation and ID generation
        - Coordinates with StorageService (Data Tier)
        - Implements business logic (Application Tier)
        - Stateless operations

    Subagent Roles:
        - TaskCreationSubagent: create_task()
        - TaskViewSubagent: get_all_tasks(), get_task()
        - TaskUpdateSubagent: update_task()
        - TaskCompletionSubagent: mark_complete()
        - TaskDeletionSubagent: delete_task()
    """

    def __init__(self, storage_service: StorageService):
        """
        Initialize task service with storage dependency.

        Args:
            storage_service: StorageService instance for data persistence
        """
        self.storage = storage_service

    def create_task(self, title: str, description: str = "") -> Tuple[bool, str, Optional[Task]]:
        """
        Create a new task (TaskCreationSubagent).

        Args:
            title: Task title (required)
            description: Task description (optional)

        Returns:
            Tuple: (success: bool, message: str, task: Task or None)

        Skills Used:
            - validate_title: Validate title is non-empty
            - generate_next_id: Generate unique ID

        Constitutional Compliance:
            - Uses validation skill before creation
            - Uses ID generation skill
            - Delegates storage to Data Tier
        """
        # Validate title using validation skill
        is_valid, error_msg = validate_title(title)
        if not is_valid:
            return False, error_msg, None

        # Generate next ID using ID generation skill
        current_max = self.storage._next_id - 1
        new_id = generate_next_id(current_max)

        # Create task
        task = Task(id=new_id, title=title.strip(), description=description.strip(), completed=False)

        # Store task (delegates to Data Tier)
        self.storage.store_task(task)

        return True, "Task created successfully", task

    def get_all_tasks(self) -> Tuple[bool, str, list[Task]]:
        """
        Get all tasks (TaskViewSubagent).

        Returns:
            Tuple: (success: bool, message: str, tasks: list of Task)

        Constitutional Compliance:
            - Delegates to Storage Service (Data Tier)
            - Handles empty list case
        """
        tasks = self.storage.get_all_tasks()

        if not tasks:
            return True, "No tasks found", []

        return True, f"Retrieved {len(tasks)} tasks", tasks

    def get_task(self, task_id: int) -> Tuple[bool, str, Optional[Task]]:
        """
        Get a single task by ID.

        Args:
            task_id: The task ID to retrieve

        Returns:
            Tuple: (success: bool, message: str, task: Task or None)

        Skills Used:
            - validate_id: Check if ID exists

        Constitutional Compliance:
            - Uses validation skill
            - Delegates retrieval to Data Tier
        """
        # Validate ID exists
        existing_ids = self.storage.get_existing_ids()
        is_valid, error_msg = validate_id(task_id, existing_ids)
        if not is_valid:
            return False, error_msg, None

        task = self.storage.get_task(task_id)
        return True, "Task retrieved", task

    def update_task(self, task_id: int, new_title: Optional[str] = None,
                   new_description: Optional[str] = None) -> Tuple[bool, str, Optional[Task]]:
        """
        Update an existing task (TaskUpdateSubagent).

        Args:
            task_id: The ID of the task to update
            new_title: New title (None to keep current)
            new_description: New description (None to keep current)

        Returns:
            Tuple: (success: bool, message: str, task: Task or None)

        Skills Used:
            - validate_id: Check if task exists
            - validate_title: Validate new title if provided

        Constitutional Compliance:
            - Uses validation skills
            - Preserves immutable ID
            - Delegates storage to Data Tier
        """
        # Validate task exists
        existing_ids = self.storage.get_existing_ids()
        is_valid, error_msg = validate_id(task_id, existing_ids)
        if not is_valid:
            return False, error_msg, None

        # Get current task
        task = self.storage.get_task(task_id)

        # Update title if provided
        if new_title is not None:
            is_valid, error_msg = validate_title(new_title)
            if not is_valid:
                return False, error_msg, None
            task.title = new_title.strip()

        # Update description if provided
        if new_description is not None:
            task.description = new_description.strip()

        # Store updated task
        self.storage.update_task(task_id, task)

        return True, "Task updated successfully", task

    def mark_complete(self, task_id: int) -> Tuple[bool, str, Optional[Task]]:
        """
        Mark a task as complete (TaskCompletionSubagent).

        Args:
            task_id: The ID of the task to mark complete

        Returns:
            Tuple: (success: bool, message: str, task: Task or None)

        Skills Used:
            - validate_id: Check if task exists

        Constitutional Compliance:
            - Uses validation skill
            - One-way operation (cannot unmark in Phase I)
        """
        # Validate task exists
        existing_ids = self.storage.get_existing_ids()
        is_valid, error_msg = validate_id(task_id, existing_ids)
        if not is_valid:
            return False, error_msg, None

        # Get task
        task = self.storage.get_task(task_id)

        # Check if already complete
        if task.completed:
            return True, "Task is already marked as complete", task

        # Mark complete
        task.completed = True
        self.storage.update_task(task_id, task)

        return True, "Task marked complete", task

    def delete_task(self, task_id: int) -> Tuple[bool, str]:
        """
        Delete a task (TaskDeletionSubagent).

        Args:
            task_id: The ID of the task to delete

        Returns:
            Tuple: (success: bool, message: str)

        Skills Used:
            - validate_id: Check if task exists

        Constitutional Compliance:
            - Uses validation skill
            - Delegates deletion to Data Tier
            - ID not reused (per spec)
        """
        # Validate task exists
        existing_ids = self.storage.get_existing_ids()
        is_valid, error_msg = validate_id(task_id, existing_ids)
        if not is_valid:
            return False, error_msg

        # Delete task
        success = self.storage.delete_task(task_id)

        if success:
            return True, f"Task ID {task_id} deleted successfully"
        else:
            return False, f"Failed to delete task ID {task_id}"
