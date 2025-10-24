"""
Date parsing utilities for handling relative date expressions.

Converts natural language date expressions (e.g., "tomorrow", "next Friday", "+2")
into YYYY-MM-DD formatted strings for the frontend.
"""

import re
from datetime import datetime, timedelta
from typing import Optional, Tuple
from loguru import logger


def parse_relative_date(relative_str: str) -> str:
    """
    Parse a relative date string into YYYY-MM-DD format.

    Supports:
    - Numeric offsets: "+1", "+2", "-1" (days from today)
    - Text patterns: "tomorrow", "today", "tonight", "next [weekday]", "this [weekday]"
    - Relative expressions: "in X days", "in X weeks"

    Args:
        relative_str: Relative date expression or YYYY-MM-DD date

    Returns:
        Date in YYYY-MM-DD format, or empty string if unparseable
    """
    if not relative_str:
        return ""

    relative_str = relative_str.strip().lower()
    today = datetime.now().date()

    # Already in YYYY-MM-DD format
    if re.match(r'^\d{4}-\d{2}-\d{2}$', relative_str):
        return relative_str

    # Numeric offset: +1, +2, -1, etc.
    if re.match(r'^[+-]\d+$', relative_str):
        try:
            days = int(relative_str)
            result_date = today + timedelta(days=days)
            return result_date.strftime("%Y-%m-%d")
        except ValueError:
            logger.warning(f"Invalid numeric offset: {relative_str}")
            return ""

    # "today" or "tonight"
    if relative_str in ["today", "tonight"]:
        return today.strftime("%Y-%m-%d")

    # "tomorrow"
    if relative_str == "tomorrow":
        return (today + timedelta(days=1)).strftime("%Y-%m-%d")

    # "yesterday"
    if relative_str == "yesterday":
        return (today - timedelta(days=1)).strftime("%Y-%m-%d")

    # "in X days" or "in X day"
    match = re.match(r'^in (\d+) days?$', relative_str)
    if match:
        days = int(match.group(1))
        result_date = today + timedelta(days=days)
        return result_date.strftime("%Y-%m-%d")

    # "in X weeks" or "in X week"
    match = re.match(r'^in (\d+) weeks?$', relative_str)
    if match:
        weeks = int(match.group(1))
        result_date = today + timedelta(weeks=weeks)
        return result_date.strftime("%Y-%m-%d")

    # "next [weekday]" or "this [weekday]"
    weekday_map = {
        "monday": 0, "mon": 0,
        "tuesday": 1, "tue": 1, "tues": 1,
        "wednesday": 2, "wed": 2,
        "thursday": 3, "thu": 3, "thur": 3, "thurs": 3,
        "friday": 4, "fri": 4,
        "saturday": 5, "sat": 5,
        "sunday": 6, "sun": 6,
    }

    for prefix in ["next ", "this "]:
        if relative_str.startswith(prefix):
            weekday_str = relative_str[len(prefix):].strip()
            if weekday_str in weekday_map:
                target_weekday = weekday_map[weekday_str]
                current_weekday = today.weekday()

                if prefix == "this ":
                    # "this [weekday]" - find the next occurrence this week or today
                    days_ahead = target_weekday - current_weekday
                    if days_ahead < 0:
                        days_ahead += 7
                else:
                    # "next [weekday]" - find the next occurrence (always in the future)
                    days_ahead = target_weekday - current_weekday
                    if days_ahead <= 0:
                        days_ahead += 7

                result_date = today + timedelta(days=days_ahead)
                return result_date.strftime("%Y-%m-%d")

    # "next week" - 7 days from today
    if relative_str == "next week":
        return (today + timedelta(weeks=1)).strftime("%Y-%m-%d")

    # "this week" - start of current week (Monday)
    if relative_str == "this week":
        days_since_monday = today.weekday()
        monday = today - timedelta(days=days_since_monday)
        return monday.strftime("%Y-%m-%d")

    # If we couldn't parse it, log and return empty
    logger.warning(f"Unable to parse relative date: {relative_str}")
    return ""


def resolve_date_pair(check_in: Optional[str], check_out: Optional[str]) -> Tuple[str, str]:
    """
    Resolve a pair of check-in/check-out dates with smart defaults.

    If only one date is provided, defaults the other to ±1 day:
    - Only check_in: check_out defaults to check_in + 1 day (1-night stay)
    - Only check_out: check_in defaults to check_out - 1 day
    - Both provided: parse both
    - Neither provided: defaults to today (check-in) and tomorrow (check-out)

    Args:
        check_in: Check-in date (relative or YYYY-MM-DD)
        check_out: Check-out date (relative or YYYY-MM-DD)

    Returns:
        Tuple of (check_in_date, check_out_date) in YYYY-MM-DD format
    """
    # Parse what we have
    parsed_check_in = parse_relative_date(check_in) if check_in else ""
    parsed_check_out = parse_relative_date(check_out) if check_out else ""

    # Both provided - return as-is
    if parsed_check_in and parsed_check_out:
        return (parsed_check_in, parsed_check_out)

    # Only check_in provided - default check_out to +1 day
    if parsed_check_in and not parsed_check_out:
        try:
            check_in_date = datetime.strptime(parsed_check_in, "%Y-%m-%d").date()
            check_out_date = check_in_date + timedelta(days=1)
            parsed_check_out = check_out_date.strftime("%Y-%m-%d")
            logger.info(f"Auto-filled check_out to {parsed_check_out} (check_in + 1 day)")
        except ValueError:
            logger.error(f"Failed to parse check_in date: {parsed_check_in}")
        return (parsed_check_in, parsed_check_out)

    # Only check_out provided - default check_in to -1 day
    if not parsed_check_in and parsed_check_out:
        try:
            check_out_date = datetime.strptime(parsed_check_out, "%Y-%m-%d").date()
            check_in_date = check_out_date - timedelta(days=1)
            parsed_check_in = check_in_date.strftime("%Y-%m-%d")
            logger.info(f"Auto-filled check_in to {parsed_check_in} (check_out - 1 day)")
        except ValueError:
            logger.error(f"Failed to parse check_out date: {parsed_check_out}")
        return (parsed_check_in, parsed_check_out)

    # Neither provided - default to today (check-in) and tomorrow (check-out)
    if not parsed_check_in and not parsed_check_out:
        today = datetime.now().date()
        parsed_check_in = today.strftime("%Y-%m-%d")
        parsed_check_out = (today + timedelta(days=1)).strftime("%Y-%m-%d")
        logger.info(f"No dates provided - defaulting to today check-in ({parsed_check_in}) and tomorrow check-out ({parsed_check_out})")
        return (parsed_check_in, parsed_check_out)

    # Shouldn't reach here, but return empty strings as fallback
    return ("", "")
