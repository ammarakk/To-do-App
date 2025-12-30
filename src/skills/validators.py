"""
Validation Skills - Pure Functions
Constitutional Requirement: Reusable, deterministic, no side effects
"""

def validate_title(title: str) -> tuple[bool, str]:
    """
    Validate that a task title is non-empty and not whitespace-only.

    Args:
        title: The task title to validate

    Returns:
        tuple: (is_valid: bool, error_message: str or empty string)

    Skill Properties:
        - Pure function (no side effects)
        - Deterministic (same input → same output)
        - Reusable across all task operations
    """
    if not title or not title.strip():
        return False, "Task title cannot be empty"
    return True, ""


def validate_id(task_id: any, existing_ids: set) -> tuple[bool, str]:
    """
    Validate that a task ID is valid format and exists in storage.

    Args:
        task_id: The task ID to validate
        existing_ids: Set of valid task IDs currently in storage

    Returns:
        tuple: (is_valid: bool, error_message: str or empty string)

    Skill Properties:
        - Pure function (no side effects)
        - Deterministic
        - Reusable for all ID-based operations
    """
    # Check if ID is an integer
    if not isinstance(task_id, int):
        try:
            task_id = int(task_id)
        except (ValueError, TypeError):
            return False, "Please enter a valid task ID (number)"

    # Check if ID exists
    if task_id not in existing_ids:
        return False, f"Task with ID {task_id} not found"

    return True, ""


def normalize_input(user_input: str) -> str:
    """
    Normalize user input by trimming whitespace.

    Args:
        user_input: Raw user input string

    Returns:
        str: Normalized input (trimmed whitespace)

    Skill Properties:
        - Pure function
        - Deterministic
        - Reusable for all input handling
    """
    if user_input is None:
        return ""
    return user_input.strip()
