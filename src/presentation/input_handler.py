"""
Input Handler - Presentation Tier Subagent
Constitutional Requirement: Console input only, uses Skills for validation
"""

from skills.validators import normalize_input


def prompt_for_new_task() -> tuple[str, str]:
    """
    Prompt user for new task details.

    Returns:
        tuple: (title: str, description: str)

    Subagent Role:
        - InputParsingSubagent: Gather task creation input

    Skills Used:
        - normalize_input: Trim whitespace from inputs

    Constitutional Compliance:
        - Console input only (input())
        - Uses normalization skill
    """
    print()
    title = input("Enter task title: ")
    title = normalize_input(title)

    description = input("Enter task description (optional, press Enter to skip): ")
    description = normalize_input(description)

    return title, description


def prompt_for_task_id() -> str:
    """
    Prompt user for a task ID.

    Returns:
        str: Task ID input (caller validates)

    Subagent Role:
        - InputParsingSubagent: Get task ID

    Constitutional Compliance:
        - Console input only
        - Returns raw input for validation
    """
    print()
    task_id = input("Enter task ID: ").strip()
    return task_id


def prompt_for_task_updates() -> tuple[str, str]:
    """
    Prompt user for task updates (title and/or description).

    Returns:
        tuple: (new_title: str, new_description: str)
        Empty string means "keep current value"

    Subagent Role:
        - InputParsingSubagent: Gather update input

    Skills Used:
        - normalize_input: Trim whitespace

    Constitutional Compliance:
        - Console input only
        - Uses normalization skill
    """
    print()
    print("Press Enter without input to keep current value")
    new_title = input("Enter new title: ")
    new_title = normalize_input(new_title)

    new_description = input("Enter new description: ")
    new_description = normalize_input(new_description)

    return new_title, new_description


def prompt_for_deletion_confirmation(task) -> bool:
    """
    Prompt user to confirm task deletion.

    Args:
        task: Task object to be deleted

    Returns:
        bool: True if confirmed, False otherwise

    Subagent Role:
        - InputParsingSubagent: Get deletion confirmation

    Constitutional Compliance:
        - Console I/O only
        - Clear confirmation prompt
    """
    print()
    print(f'Confirm deletion of task "{task.title}"? (y/n): ', end="")
    confirmation = input().strip().lower()

    return confirmation in ['y', 'yes']
