"""
Task Data Model
Constitutional Requirement: Simple data structure, no business logic
"""

class Task:
    """
    Represents a single todo item.

    Attributes:
        id (int): Unique identifier, auto-assigned, immutable
        title (str): Task description (required, non-empty)
        description (str): Optional additional details
        completed (bool): Completion status (default False)

    Constitutional Compliance:
        - Pure data model (no business logic)
        - In-memory only (no persistence methods)
        - Follows Phase I constraints
    """

    def __init__(self, id: int, title: str, description: str = "", completed: bool = False):
        """
        Initialize a Task instance.

        Args:
            id: Unique task identifier
            title: Task title (required)
            description: Optional task description (default: "")
            completed: Completion status (default: False)
        """
        self._id = id  # Immutable via property
        self.title = title
        self.description = description
        self.completed = completed

    @property
    def id(self) -> int:
        """
        Get task ID (immutable).

        Returns:
            int: The task ID
        """
        return self._id

    def __repr__(self) -> str:
        """
        String representation for debugging.

        Returns:
            str: Task representation
        """
        status = "✓" if self.completed else "○"
        return f"Task({self.id}, {status} {self.title})"

    def __str__(self) -> str:
        """
        User-friendly string representation.

        Returns:
            str: Task string
        """
        return f"[{self.id}] {self.title}"
