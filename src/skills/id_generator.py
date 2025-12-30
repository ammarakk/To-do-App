"""
ID Generation Skill - Pure Function
Constitutional Requirement: Reusable, deterministic, no side effects
"""

def generate_next_id(current_max_id: int) -> int:
    """
    Generate the next sequential task ID.

    Args:
        current_max_id: The current maximum ID in use (0 if no tasks exist)

    Returns:
        int: The next available ID (current_max_id + 1)

    Skill Properties:
        - Pure function (no side effects)
        - Deterministic (same input → same output)
        - Reusable for task creation

    Examples:
        >>> generate_next_id(0)
        1
        >>> generate_next_id(5)
        6
    """
    return current_max_id + 1
