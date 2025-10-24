"""
Hotel Front Desk AI Assistant Bot
Based on Pipecat's RTVI framework with local Whisper STT and gpt-oss LLM.
No TTS - listens only and populates forms via function calling.
"""

import os
import sys
import json
from datetime import datetime
from dotenv import load_dotenv
from loguru import logger

from pipecat.adapters.schemas.function_schema import FunctionSchema
from pipecat.adapters.schemas.tools_schema import ToolsSchema
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.audio.turn.smart_turn.base_smart_turn import SmartTurnParams
from pipecat.audio.turn.smart_turn.fal_smart_turn import FalSmartTurnAnalyzer
from pipecat.frames.frames import (
    TranscriptionFrame,
    StartInterruptionFrame,
    LLMTextFrame,
)
from pipecat.processors.frameworks.rtvi import RTVIServerMessageFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
from pipecat.processors.frameworks.rtvi import RTVIConfig, RTVIObserver, RTVIProcessor
from pipecat.services.whisper.stt import WhisperSTTServiceMLX, MLXModel
from pipecat.services.ollama.llm import OLLamaLLMService
from pipecat.services.llm_service import FunctionCallParams
from pipecat.transports.base_transport import TransportParams
from pipecat.runner.types import RunnerArguments
from pipecat.runner.utils import create_transport

# Optional imports for different transports and features
try:
    from pipecat.transports.daily.transport import DailyParams
except Exception:
    DailyParams = None

try:
    from pipecat.transports.fastapi_websocket.transport import FastAPIWebsocketParams
except Exception:
    FastAPIWebsocketParams = None

from functions import (
    FUNCTION_DEFINITIONS,
    handle_checkin_form,
    handle_availability_search,
    handle_reservation_modification,
    handle_special_request,
)

load_dotenv()

logger.remove()
logger.add(sys.stderr, level="DEBUG")

SYSTEM_INSTRUCTION = """# HOTEL FRONT DESK AI ASSISTANT

You are an AI assistant for a hotel front desk. Your job is to listen to conversations between receptionists and guests, extract relevant information, and populate appropriate forms.

## YOUR ROLE
- Listen to conversations and identify guest requests
- Extract structured data (names, dates, room numbers, etc.)
- Call appropriate functions to populate forms
- Do NOT engage in conversation - you only extract data

## WORKFLOWS YOU SUPPORT
1. **Check-in**: Guest name, reservation number, ID type, room assignment
2. **Availability Search**: Check-in/out dates, room type preferences
3. **Reservation Modification**: Changes to existing reservations
4. **Special Requests**: Late checkout, extra towels, room service, etc.

## INSTRUCTIONS
- Extract information from conversations with high accuracy
- If uncertain about any field, leave it empty rather than guessing
- Focus on structured data extraction, not conversational responses
- Respond ONLY with function calls - no conversational text

## EXAMPLES

**Check-in:**
Guest: "Hi, I have a reservation under John Smith"
→ Call update_checkin_form(guest_name="John Smith")

**Availability with absolute dates:**
Guest: "Do you have rooms available from March 15th to March 18th?"
→ Call search_availability(check_in_date="2024-03-15", check_out_date="2024-03-18")

**Availability with relative dates:**
Guest: "I need a standard room for tomorrow night"
→ Call search_availability(check_in_date="tomorrow", room_type="standard")
Note: check_out will auto-default to check_in + 1 day

Guest: "Do you have availability next Friday to next Sunday?"
→ Call search_availability(check_in_date="next Friday", check_out_date="next Sunday")

Guest: "Looking for a room starting in 3 days"
→ Call search_availability(check_in_date="in 3 days")

**Modification with relative dates:**
Guest: "I'd like to extend my stay by two more nights"
→ Call modify_reservation(reservation_id="current", new_check_out_date="+2")

Guest: "Can I change my check-in to next Monday?"
→ Call modify_reservation(reservation_id="current", new_check_in_date="next Monday")

**Special requests:**
Guest: "Can I get a late checkout at 2 PM?"
→ Call create_special_request(request_type="late_checkout", details="2 PM checkout requested")

## IMPORTANT FOR DATES
- Extract the guest's EXACT wording for dates (e.g., "tomorrow", "next Friday", "+2")
- Do NOT calculate or convert dates - the backend will handle that
- If only one date is mentioned, that's fine - the other will be auto-filled
- Support both absolute (2024-03-15) and relative (tomorrow, +1, next Friday) formats

Remember: Extract data accurately, call functions promptly."""


async def run_bot(transport):
    """Main bot function that creates and runs the pipeline."""

    rtvi = RTVIProcessor(config=RTVIConfig(config=[]))

    # Initialize STT service (Whisper MLX)
    stt = WhisperSTTServiceMLX(model=MLXModel.LARGE_V3_TURBO_Q4)

    # Initialize LLM service (Ollama)
    llm = OLLamaLLMService(
        model=os.getenv("OLLAMA_MODEL", "llama3.2:latest")
    )

    # Register function callbacks
    async def update_checkin_form_callback(params: FunctionCallParams):
        logger.info(f"update_checkin_form called with args: {params.arguments}")

        # Process the arguments
        result = await handle_checkin_form(params.arguments)

        # Push RTVI message with PROCESSED data to frontend
        frame = RTVIServerMessageFrame(
            data={
                "type": "llm-function-call",
                "payload": {
                    "function_name": "update_checkin_form",
                    "args": result.get("data", {})  # Send processed data instead of raw args
                }
            }
        )
        await rtvi.push_frame(frame)
        logger.info(f"Function call frame sent: update_checkin_form")

        await params.result_callback(result)

    async def search_availability_callback(params: FunctionCallParams):
        logger.info(f"search_availability called with args: {params.arguments}")

        # Process the arguments (parse dates, apply defaults)
        result = await handle_availability_search(params.arguments)

        # Push RTVI message with PROCESSED data to frontend
        frame = RTVIServerMessageFrame(
            data={
                "type": "llm-function-call",
                "payload": {
                    "function_name": "search_availability",
                    "args": result.get("data", {})  # Send processed data instead of raw args
                }
            }
        )
        await rtvi.push_frame(frame)
        logger.info(f"Function call frame sent: search_availability with processed dates")

        await params.result_callback(result)

    async def modify_reservation_callback(params: FunctionCallParams):
        logger.info(f"modify_reservation called with args: {params.arguments}")

        # Process the arguments (parse relative dates)
        result = await handle_reservation_modification(params.arguments)

        # Push RTVI message with PROCESSED data to frontend
        frame = RTVIServerMessageFrame(
            data={
                "type": "llm-function-call",
                "payload": {
                    "function_name": "modify_reservation",
                    "args": result.get("data", {})  # Send processed data instead of raw args
                }
            }
        )
        await rtvi.push_frame(frame)
        logger.info(f"Function call frame sent: modify_reservation with processed dates")

        await params.result_callback(result)

    async def create_special_request_callback(params: FunctionCallParams):
        logger.info(f"create_special_request called with args: {params.arguments}")
        # Push RTVI message to notify frontend of function call
        frame = RTVIServerMessageFrame(
            data={
                "type": "llm-function-call",
                "payload": {
                    "function_name": "create_special_request",
                    "args": params.arguments
                }
            }
        )
        await rtvi.push_frame(frame)
        logger.info(f"Function call frame sent: create_special_request")
        
        result = await handle_special_request(params.arguments)
        await params.result_callback(result)

    llm.register_function("update_checkin_form", update_checkin_form_callback)
    llm.register_function("search_availability", search_availability_callback)
    llm.register_function("modify_reservation", modify_reservation_callback)
    llm.register_function("create_special_request", create_special_request_callback)

    # Convert function definitions to FunctionSchema format
    function_schemas = []
    for func_def in FUNCTION_DEFINITIONS:
        schema = FunctionSchema(
            name=func_def["name"],
            description=func_def["description"],
            properties=func_def["parameters"]["properties"],
            required=func_def["parameters"].get("required", [])
        )
        function_schemas.append(schema)

    tools = ToolsSchema(standard_tools=function_schemas)

    # System prompt
    messages = [
        {
            "role": "system",
            "content": SYSTEM_INSTRUCTION,
        }
    ]

    # Create context aggregator
    context = LLMContext(messages, tools)
    context_aggregator = LLMContextAggregatorPair(context)

    # Create pipeline (NO TTS - skip directly to context aggregator)
    pipeline = Pipeline(
        [
            transport.input(),
            stt,  # Whisper STT
            rtvi,
            context_aggregator.user(),
            llm,  # LLM with function calling
            # NO TTS HERE - skip directly to output
            transport.output(),
            context_aggregator.assistant(),
        ]
    )
    
    # Create task with RTVI observer
    task = PipelineTask(
        pipeline,
        params=PipelineParams(
            allow_interruptions=True,
            enable_metrics=True,
            enable_usage_metrics=True,
        ),
        observers=[RTVIObserver(rtvi)],
    )
    
    @rtvi.event_handler("on_client_ready")
    async def on_client_ready(rtvi):
        await rtvi.set_bot_ready()
        logger.info("Hotel AI Assistant ready - listening for conversations")
    
    @rtvi.event_handler("on_client_message")
    async def on_client_message(rtvi, message):
        """Handle custom messages from the client."""
        logger.info(f"Received client message: {message}")
        
        # Extract message type and data
        msg_type = message.type
        msg_data = message.data if hasattr(message, "data") else {}
        
        if msg_type == "custom-message":
            text = msg_data.get("text", "") if isinstance(msg_data, dict) else ""
            if text:
                logger.info(f"Processing custom message: {text}")
                # Send the text as a TranscriptionFrame
                await task.queue_frames(
                    [
                        TranscriptionFrame(
                            text=text,
                            user_id="text-input",
                            timestamp="",
                        ),
                    ]
                )
    
    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        """Handle new connection."""
        logger.info("Client connected to Hotel AI Assistant")
    
    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        """Handle disconnection."""
        logger.info("Client disconnected from Hotel AI Assistant")
        await task.cancel()
        logger.info("Hotel AI Assistant stopped")
    
    # Create runner and run the task
    runner = PipelineRunner(handle_sigint=False)
    await runner.run(task)


async def bot(runner_args: RunnerArguments):
    """Main bot entry point compatible with standard bot starters."""

    transport_params = {}

    # Get the URL for the remote Smart Turn service
    remote_smart_turn_url = os.getenv("REMOTE_SMART_TURN_URL")

    # Add Daily transport if available
    if DailyParams:
        transport_params["daily"] = lambda: DailyParams(
            audio_in_enabled=True,
            audio_out_enabled=False,
            vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.2)),
            turn_analyzer=FalSmartTurnAnalyzer(
                url=remote_smart_turn_url,
                params=SmartTurnParams(
                    stop_secs=3.0,
                    pre_speech_ms=0.0,
                    max_duration_secs=8.0
                )
            ) if remote_smart_turn_url else None,
        )

    # Add Twilio/FastAPI WebSocket transport if available
    if FastAPIWebsocketParams:
        transport_params["twilio"] = lambda: FastAPIWebsocketParams(
            audio_in_enabled=True,
            audio_out_enabled=False,
            vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.2)),
            turn_analyzer=FalSmartTurnAnalyzer(
                url=remote_smart_turn_url,
                params=SmartTurnParams(
                    stop_secs=3.0,
                    pre_speech_ms=0.0,
                    max_duration_secs=8.0
                )
            ) if remote_smart_turn_url else None,
        )

    # Always add webrtc transport (base transport)
    webrtc_params = {
        "audio_in_enabled": True,
        "audio_out_enabled": False,
        "vad_analyzer": SileroVADAnalyzer(params=VADParams(stop_secs=0.2)),
    }

    # Add turn analyzer if remote URL is available
    if remote_smart_turn_url:
        webrtc_params["turn_analyzer"] = FalSmartTurnAnalyzer(
            url=remote_smart_turn_url,
            params=SmartTurnParams(
                stop_secs=3.0,
                pre_speech_ms=0.0,
                max_duration_secs=8.0
            )
        )

    transport_params["webrtc"] = lambda: TransportParams(**webrtc_params)

    transport = await create_transport(runner_args, transport_params)
    await run_bot(transport)


if __name__ == "__main__":
    from pipecat.runner.run import main
    
    main()
