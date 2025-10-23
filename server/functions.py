"""
Function calling tools for hotel front desk workflows.
These functions are called by the LLM when processing voice conversations.

Each function returns enriched data that includes both form data and pre-populated UI state
to minimize frontend logic and ensure consistent behavior.
"""

import json
from datetime import date, datetime
from typing import Dict, Any, Optional, List
from loguru import logger


# Function definitions for LLM
FUNCTION_DEFINITIONS = [
    {
        "name": "update_checkin_form",
        "description": "Update check-in form with guest information extracted from conversation",
        "parameters": {
            "type": "object",
            "properties": {
                "guest_name": {
                    "type": "string",
                    "description": "Full name of the guest"
                },
                "reservation_number": {
                    "type": "string", 
                    "description": "Reservation number or guest name for lookup"
                },
                "id_type": {
                    "type": "string",
                    "description": "Type of identification (driver_license, passport, etc.)",
                    "enum": ["driver_license", "passport", "state_id", "other"]
                },
                "room_number": {
                    "type": "string",
                    "description": "Assigned room number"
                }
            },
            "required": ["guest_name"]
        }
    },
    {
        "name": "search_availability",
        "description": "Search for available rooms based on guest requirements",
        "parameters": {
            "type": "object",
            "properties": {
                "check_in_date": {
                    "type": "string",
                    "description": "Check-in date in YYYY-MM-DD format"
                },
                "check_out_date": {
                    "type": "string",
                    "description": "Check-out date in YYYY-MM-DD format"
                },
                "room_type": {
                    "type": "string",
                    "description": "Preferred room type",
                    "enum": ["standard", "deluxe", "suite", "any"]
                },
                "preferences": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Additional preferences like ocean_view, balcony, etc."
                }
            },
            "required": ["check_in_date", "check_out_date"]
        }
    },
    {
        "name": "modify_reservation",
        "description": "Modify an existing reservation",
        "parameters": {
            "type": "object",
            "properties": {
                "reservation_id": {
                    "type": "string",
                    "description": "Reservation ID or guest name for lookup"
                },
                "new_check_in_date": {
                    "type": "string",
                    "description": "New check-in date in YYYY-MM-DD format"
                },
                "new_check_out_date": {
                    "type": "string",
                    "description": "New check-out date in YYYY-MM-DD format"
                },
                "new_room_type": {
                    "type": "string",
                    "description": "New room type preference",
                    "enum": ["standard", "deluxe", "suite"]
                },
                "additional_services": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Additional services requested"
                }
            },
            "required": ["reservation_id"]
        }
    },
    {
        "name": "create_special_request",
        "description": "Create a special request for a guest",
        "parameters": {
            "type": "object",
            "properties": {
                "room_number": {
                    "type": "string",
                    "description": "Room number for the request"
                },
                "request_type": {
                    "type": "string",
                    "description": "Type of special request",
                    "enum": ["late_checkout", "extra_towels", "room_service", "maintenance", "other"]
                },
                "details": {
                    "type": "string",
                    "description": "Detailed description of the request"
                }
            },
            "required": ["request_type", "details"]
        }
    }
]


async def execute_function_call(function_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a function call and return the result."""
    try:
        logger.info(f"Executing function {function_name} with args: {arguments}")
        
        if function_name == "update_checkin_form":
            return await handle_checkin_form(arguments)
        elif function_name == "search_availability":
            return await handle_availability_search(arguments)
        elif function_name == "modify_reservation":
            return await handle_reservation_modification(arguments)
        elif function_name == "create_special_request":
            return await handle_special_request(arguments)
        else:
            return {"error": f"Unknown function: {function_name}"}
            
    except Exception as e:
        logger.error(f"Error executing function {function_name}: {e}")
        return {"error": str(e)}


async def handle_checkin_form(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle check-in form updates with enriched data.

    Returns both form data and pre-populated UI state to the frontend.
    The frontend's updateAI function will use this to populate both
    checkinData and checkinUI in the Zustand store.

    Args:
        guest_name: Guest's full name for search
        reservation_number: Optional reservation ID for direct lookup
        id_type: Type of ID provided (driver_license, passport, etc.)
        room_number: Assigned room number

    Returns:
        Enriched data including:
        - Form data fields
        - UI state (searchQuery, filteredReservations, selectedReservation)
        - Metadata (guest_found, reservation_found)
    """
    guest_name = args.get("guest_name", "")
    reservation_number = args.get("reservation_number", "")
    id_type = args.get("id_type", "")
    room_number = args.get("room_number", "")

    # NOTE: Frontend has mock data for reservations
    # This backend will return search parameters, and frontend will do the actual filtering
    # For a production system, you would do DB lookups here

    return {
        "workflow": "checkin",
        "data": {
            # Form data fields (maps to checkinData in store)
            "guest_name": guest_name,
            "reservation_number": reservation_number,
            "id_type": id_type,
            "room_number": room_number,

            # UI state fields (maps to checkinUI in store)
            # Frontend will use these to populate the UI immediately
            "searchQuery": guest_name,  # Pre-populate search box
        },
        "status": "completed",
        "timestamp": datetime.now().isoformat()
    }


async def handle_availability_search(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle room availability search with enriched data.

    Returns search parameters and filter state for the frontend to apply
    against its mock room data.

    Args:
        check_in_date: Check-in date in YYYY-MM-DD format
        check_out_date: Check-out date in YYYY-MM-DD format
        room_type: Preferred room type (standard/deluxe/suite/any)
        preferences: Additional preferences array

    Returns:
        Enriched data including:
        - Search parameters
        - Filter state for UI
        - Validation metadata
    """
    check_in_date = args.get("check_in_date", "")
    check_out_date = args.get("check_out_date", "")
    room_type = args.get("room_type", "any")
    preferences = args.get("preferences", [])

    try:
        # Validate dates if provided
        if check_in_date:
            check_in = datetime.strptime(check_in_date, "%Y-%m-%d").date()
        if check_out_date:
            check_out = datetime.strptime(check_out_date, "%Y-%m-%d").date()

        # NOTE: Frontend has mock room data
        # We return filter parameters, frontend applies them to mock data

        return {
            "workflow": "availability",
            "data": {
                # Form data fields (maps to availabilityData in store)
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "room_type": room_type,
                "preferences": preferences,

                # UI state fields (maps to availabilityUI.filters in store)
                # Pre-populate the filter form
                "filters": {
                    "check_in_date": check_in_date,
                    "check_out_date": check_out_date,
                    "room_type": room_type,
                    "status": "available",  # Default to available rooms
                    "min_price": "",
                    "max_price": "",
                },
            },
            "status": "completed",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in availability search: {e}")
        return {
            "workflow": "availability",
            "data": {
                "error": str(e),
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
            },
            "status": "error",
            "timestamp": datetime.now().isoformat()
        }


async def handle_reservation_modification(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle reservation modifications with enriched data.

    Returns modification parameters and search state for the frontend to
    lookup the reservation in mock data and prepare edit state.

    Args:
        reservation_id: Reservation ID or guest name for lookup
        new_check_in_date: New check-in date (optional)
        new_check_out_date: New check-out date (optional)
        new_room_type: New room type preference (optional)
        additional_services: Array of additional services (optional)

    Returns:
        Enriched data including:
        - Modification parameters
        - UI state for search and edit mode
        - Modification tracking flags
    """
    reservation_id = args.get("reservation_id", "")
    new_check_in_date = args.get("new_check_in_date", "")
    new_check_out_date = args.get("new_check_out_date", "")
    new_room_type = args.get("new_room_type", "")
    additional_services = args.get("additional_services", [])

    # NOTE: Frontend has mock reservation data
    # We return search parameters, frontend will lookup and populate

    return {
        "workflow": "modification",
        "data": {
            # Form data fields (maps to modificationData in store)
            "reservation_id": reservation_id,
            "new_check_in_date": new_check_in_date,
            "new_check_out_date": new_check_out_date,
            "new_room_type": new_room_type,
            "additional_services": additional_services,

            # Modification tracking
            "modifications": {
                "dates_changed": bool(new_check_in_date or new_check_out_date),
                "room_type_changed": bool(new_room_type),
                "services_added": len(additional_services) > 0
            },

            # UI state fields (maps to modificationUI in store)
            "searchQuery": reservation_id,  # Pre-populate search
            "editMode": bool(new_check_in_date or new_check_out_date or new_room_type),  # Auto-enter edit mode if changes provided

            # Pre-populate edited data (frontend will merge with found reservation)
            "editedData": {
                k: v for k, v in {
                    "check_in_date": new_check_in_date,
                    "check_out_date": new_check_out_date,
                    "room_type": new_room_type,
                }.items() if v
            },
        },
        "status": "completed",
        "timestamp": datetime.now().isoformat()
    }


async def handle_special_request(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle special request creation with enriched data.

    Returns request details and UI state for immediate form population.

    Args:
        room_number: Room number for the request (optional)
        request_type: Type of request (late_checkout, extra_towels, etc.)
        details: Detailed description of the request

    Returns:
        Enriched data including:
        - Request parameters
        - UI state for form population
        - Request tracking metadata
    """
    room_number = args.get("room_number", "")
    request_type = args.get("request_type", "")
    details = args.get("details", "")

    # Generate a request ID for tracking
    # In production, this would come from database
    request_id = f"req-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    return {
        "workflow": "special_request",
        "data": {
            # Form data fields (maps to specialRequestData in store)
            "room_number": room_number,
            "request_type": request_type,
            "details": details,
            "request_id": request_id,
            "request_created": True,  # Optimistic - assume success

            # UI state fields (maps to specialRequestUI in store)
            # Pre-populate the form fields
            "request_type": request_type,
            "room_number": room_number,
            "details": details,
        },
        "status": "completed",
        "timestamp": datetime.now().isoformat()
    }

