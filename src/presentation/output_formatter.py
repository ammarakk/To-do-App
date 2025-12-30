"""
Output Formatter - Presentation Tier Subagent
Constitutional Requirement: Console output only, uses Skills for formatting
"""

from skills.formatters import format_task, format_task_list


def display_task_list(tasks: list) -> None:
    """
    Display list of tasks to console.

    Args:
        tasks: List of Task objects

    Subagent Role:
        - OutputRenderingSubagent: Display task list

    Skills Used:
        - format_task_list: Format tasks for display

    Constitutional Compliance:
        - Console output only (print)
        - Uses formatting skill
    """
    formatted_list = format_task_list(tasks)
    print(formatted_list)


def display_task_details(task) -> None:
    """
    Display a single task's details to console.

    Args:
        task: Task object to display

    Subagent Role:
        - OutputRenderingSubagent: Display single task

    Skills Used:
        - format_task: Format single task

    Constitutional Compliance:
        - Console output only
        - Uses formatting skill
    """
    print()
    formatted_task = format_task(task)
    print(formatted_task)


def display_success(message: str, task=None) -> None:
    """
    Display success message to console.

    Args:
        message: Success message to display
        task: Optional task to display details

    Subagent Role:
        - OutputRenderingSubagent: Success feedback

    Constitutional Compliance:
        - Console output only
        - Clear success indication
    """
    print(f"\n✓ {message}")
    if task:
        display_task_details(task)


def display_error(message: str) -> None:
    """
    Display error message to console.

    Args:
        message: Error message to display

    Subagent Role:
        - OutputRenderingSubagent: Error feedback

    Constitutional Compliance:
        - Console output only
        - Clear error indication
    """
    print(f"\n✗ Error: {message}")


def display_info(message: str) -> None:
    """
    Display informational message to console.

    Args:
        message: Info message to display

    Subagent Role:
        - OutputRenderingSubagent: Info feedback

    Constitutional Compliance:
        - Console output only
    """
    print(f"\nℹ {message}")
