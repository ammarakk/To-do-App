"""
Main Application - Orchestrator
Constitutional Requirement: Agent-orchestrated execution, no direct code generation
"""

from services.storage_service import StorageService
from services.task_service import TaskService
from presentation.menu import display_menu, get_menu_choice
from presentation.input_handler import (
    prompt_for_new_task,
    prompt_for_task_id,
    prompt_for_task_updates,
    prompt_for_deletion_confirmation
)
from presentation.output_formatter import (
    display_task_list,
    display_success,
    display_error,
    display_info
)


def handle_add_task(task_service: TaskService) -> None:
    """
    Handle Add Task operation (User Story 1).

    Args:
        task_service: TaskService instance

    Subagents Coordinated:
        - InputParsingSubagent: prompt_for_new_task
        - TaskCreationSubagent: task_service.create_task
        - OutputRenderingSubagent: display_success/display_error

    Constitutional Compliance:
        - Coordinates subagents
        - No direct business logic
        - Orchestrator pattern
    """
    title, description = prompt_for_new_task()

    success, message, task = task_service.create_task(title, description)

    if success:
        display_success(message, task)
    else:
        display_error(message)


def handle_view_tasks(task_service: TaskService) -> None:
    """
    Handle View Tasks operation (User Story 1).

    Args:
        task_service: TaskService instance

    Subagents Coordinated:
        - TaskViewSubagent: task_service.get_all_tasks
        - OutputRenderingSubagent: display_task_list

    Constitutional Compliance:
        - Coordinates subagents
        - Presents data only
    """
    success, message, tasks = task_service.get_all_tasks()

    display_task_list(tasks)


def handle_update_task(task_service: TaskService) -> None:
    """
    Handle Update Task operation (User Story 2).

    Args:
        task_service: TaskService instance

    Subagents Coordinated:
        - InputParsingSubagent: prompt_for_task_id, prompt_for_task_updates
        - TaskUpdateSubagent: task_service.update_task
        - OutputRenderingSubagent: display_success/display_error

    Constitutional Compliance:
        - Coordinates subagents
        - Handles empty input (keep current value)
    """
    task_id_str = prompt_for_task_id()

    try:
        task_id = int(task_id_str)
    except ValueError:
        display_error("Please enter a valid task ID (number)")
        return

    new_title, new_description = prompt_for_task_updates()

    # Handle empty inputs (keep current)
    title_to_update = new_title if new_title else None
    desc_to_update = new_description if new_description else None

    success, message, task = task_service.update_task(
        task_id,
        new_title=title_to_update,
        new_description=desc_to_update
    )

    if success:
        display_success(message, task)
    else:
        display_error(message)


def handle_delete_task(task_service: TaskService) -> None:
    """
    Handle Delete Task operation (User Story 3).

    Args:
        task_service: TaskService instance

    Subagents Coordinated:
        - InputParsingSubagent: prompt_for_task_id, prompt_for_deletion_confirmation
        - TaskDeletionSubagent: task_service.delete_task
        - OutputRenderingSubagent: display_success/display_error

    Constitutional Compliance:
        - Coordinates subagents
        - Requires confirmation
    """
    task_id_str = prompt_for_task_id()

    try:
        task_id = int(task_id_str)
    except ValueError:
        display_error("Please enter a valid task ID (number)")
        return

    # Get task for confirmation display
    success, message, task = task_service.get_task(task_id)
    if not success:
        display_error(message)
        return

    # Confirm deletion
    if not prompt_for_deletion_confirmation(task):
        print("\nDeletion cancelled.")
        return

    # Delete task
    success, message = task_service.delete_task(task_id)

    if success:
        display_success(message)
    else:
        display_error(message)


def handle_mark_complete(task_service: TaskService) -> None:
    """
    Handle Mark Complete operation (User Story 2).

    Args:
        task_service: TaskService instance

    Subagents Coordinated:
        - InputParsingSubagent: prompt_for_task_id
        - TaskCompletionSubagent: task_service.mark_complete
        - OutputRenderingSubagent: display_success/display_error/display_info

    Constitutional Compliance:
        - Coordinates subagents
        - Handles already-complete case
    """
    task_id_str = prompt_for_task_id()

    try:
        task_id = int(task_id_str)
    except ValueError:
        display_error("Please enter a valid task ID (number)")
        return

    success, message, task = task_service.mark_complete(task_id)

    if success:
        if "already" in message.lower():
            display_info(message)
        else:
            display_success(message, task)
    else:
        display_error(message)


def main():
    """
    Main application loop - Orchestrator Agent.

    Constitutional Compliance:
        - Orchestrator pattern
        - Initializes all subagents (via services)
        - Controls execution flow
        - Enforces Phase I constraints
        - Handles graceful exit

    Checkpoint:
        - phase-1:assembly:menu
        - phase-1:assembly:lifecycle
        - phase-1:assembly:errors
    """
    # Initialize services (Data Tier + Application Tier)
    storage_service = StorageService()
    task_service = TaskService(storage_service)

    # Welcome message
    print("\n" + "="*50)
    print("  WELCOME TO TODO APPLICATION - PHASE I")
    print("  Agent-Orchestrated, Spec-Driven Implementation")
    print("="*50)

    # Main menu loop (Orchestrator control flow)
    try:
        while True:
            # Get current task count for menu
            _, _, tasks = task_service.get_all_tasks()
            task_count = len(tasks)

            # Display menu (Presentation Tier)
            display_menu(task_count)

            # Get user choice (Input Parsing Subagent)
            choice = get_menu_choice()

            # Route to appropriate subagent coordination
            if choice == '1':
                handle_add_task(task_service)
            elif choice == '2':
                handle_view_tasks(task_service)
            elif choice == '3':
                handle_update_task(task_service)
            elif choice == '4':
                handle_delete_task(task_service)
            elif choice == '5':
                handle_mark_complete(task_service)
            elif choice == '6':
                # Exit (clean shutdown)
                print("\nThank you for using TODO Application!")
                print("Goodbye!\n")
                break
            else:
                # Invalid menu choice
                display_error("Invalid option. Please select 1-6")

    except KeyboardInterrupt:
        # Graceful Ctrl+C handling
        print("\n\nApplication interrupted. Goodbye!\n")


if __name__ == "__main__":
    main()
