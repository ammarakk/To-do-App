"""
Menu Presentation - Presentation Tier Subagent
Constitutional Requirement: Console I/O only, no business logic
"""


def display_menu(task_count: int = 0) -> None:
    """
    Display the main menu with current task count.

    Args:
        task_count: Number of tasks currently in the system

    Subagent Role:
        - OutputRenderingSubagent: Menu display

    Constitutional Compliance:
        - Console output only (print)
        - No business logic
        - Presentation tier responsibility
    """
    print("\n===========================================")
    print("        TODO APPLICATION - PHASE I")
    print("===========================================")
    print(f"\nCurrent Tasks: {task_count}")
    print("\n1. Add Task")
    print("2. View Tasks")
    print("3. Update Task")
    print("4. Delete Task")
    print("5. Mark Task Complete")
    print("6. Exit")
    print()


def get_menu_choice() -> str:
    """
    Get and validate menu choice from user.

    Returns:
        str: User's menu choice (1-6)

    Subagent Role:
        - InputParsingSubagent: Get menu selection

    Constitutional Compliance:
        - Console input only (input())
        - Returns raw input for validation by caller
    """
    choice = input("Select an option (1-6): ").strip()
    return choice
