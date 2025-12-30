"""
Formatting Skills - Pure Functions
Constitutional Requirement: Reusable, deterministic, no side effects
"""

def format_task(task) -> str:
    """
    Format a single task for console display.

    Args:
        task: Task object with id, title, description, completed attributes

    Returns:
        str: Formatted task string for console output

    Skill Properties:
        - Pure function (no side effects)
        - Deterministic
        - Reusable for all task display operations
    """
    status = "Complete" if task.completed else "Incomplete"
    desc_display = task.description if task.description else ""

    formatted = f"""[ID: {task.id}] {task.title}
Description: {desc_display}
Status: {status}"""

    return formatted


def format_task_list(tasks: list) -> str:
    """
    Format multiple tasks with summary for console display.

    Args:
        tasks: List of Task objects

    Returns:
        str: Formatted task list with summary

    Skill Properties:
        - Pure function (no side effects)
        - Deterministic
        - Reusable for view operations
    """
    if not tasks:
        return """===========================================
           YOUR TASKS
===========================================

No tasks found. Add a task to get started!"""

    # Sort by ID
    sorted_tasks = sorted(tasks, key=lambda t: t.id)

    # Format individual tasks
    task_strings = [format_task(task) for task in sorted_tasks]
    tasks_display = "\n\n".join(task_strings)

    # Calculate summary
    total = len(tasks)
    completed = sum(1 for t in tasks if t.completed)
    incomplete = total - completed

    formatted = f"""===========================================
           YOUR TASKS
===========================================

{tasks_display}

-------------------------------------------
Total: {total} tasks ({completed} complete, {incomplete} incomplete)"""

    return formatted
