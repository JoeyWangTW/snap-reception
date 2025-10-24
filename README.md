# Hotel Front Desk AI Assistant

A split-screen hotel reception system powered by voice AI that listens to conversations and automatically populates forms, making front desk operations faster and more efficient.

## Features

- **Split-Screen Interface**: Left panel for manual control, right panel for AI-populated forms
- **Voice AI Integration**: Continuous listening with local Whisper STT and gpt-oss LLM
- **Function Calling**: AI extracts structured data and calls appropriate functions
- **Field-Level Merge**: Smart merging preserves manual entries when pulling AI data
- **Real-Time Updates**: Live transcription and instant form population
- **4 Core Workflows**: Check-in, availability search, reservation modification, special requests

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Pipecat pipeline with local Whisper STT + gpt-oss LLM (no TTS)
- **Database**: Supabase for guests, reservations, rooms, requests
- **Communication**: WebSocket via Pipecat's RTVI protocol

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- Supabase account
- gpt-oss model running locally

### Setup

1. **Clone and setup environment**:

   ```bash
   cd snap-reception
   cp server/.env.example server/.env
   # Edit server/.env with your Supabase credentials
   ```

2. **Setup Supabase**:

   ```bash
   # Create Supabase project and run migrations
   supabase db push
   ```

3. **Start LLM server** (gpt-oss):

   ```bash
   # Download and run gpt-oss with llama-server
   MODEL=ggml-org/gpt-oss-20b-GGUF
   llama-server -hf $MODEL --verbose-prompt --chat-template-file gpt-oss-template.jinja --jinja --cache-reuse 128 -fa
   ```

4. **Start backend**:

   ```bash
   cd server
   python3.12 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python bot.py
   ```

5. **Start frontend**:

   ```bash
   cd client
   npm install
   npm run dev
   ```

6. **Open browser**: http://localhost:3000

## Usage

1. **Connect**: Click "Connect" to start voice AI
2. **Speak**: Have conversations with guests naturally
3. **Watch**: AI automatically populates forms on the right screen
4. **Pull**: Use Ctrl+P or "Pull from AI" button to transfer data
5. **Complete**: Finish workflows with pre-filled information

### Testing Commands

You can test the AI data population without voice input using the browser console:

```javascript
// Test check-in workflow
testPopulateData('checkin')

// Test availability search workflow
testPopulateData('availability')
```

## User Stories

### Check-In

Guest: "Hi, I have a reservation under John Smith"
→ AI populates check-in form with guest name and reservation details

### Availability Search

Guest: "Do you have rooms available from March 15th to March 18th?"
→ AI searches and displays available rooms

### Reservation Modification

Guest: "I'd like to extend my stay by two more nights"
→ AI finds reservation and prepares modification

### Special Requests

Guest: "Can I get a late checkout at 2 PM?"
→ AI creates special request form

## Technical Details

- **No TTS**: AI listens only, no voice responses
- **Continuous Processing**: Real-time transcription and function calling
- **Confidence Scoring**: Visual indicators for AI confidence levels
- **Field-Level Merge**: Manual entries preserved during pull operations
- **Local Processing**: Whisper STT and gpt-oss LLM run locally

## File Structure

```
snap-reception/
├── server/
│   ├── bot.py              # Main Pipecat pipeline
│   ├── database.py         # Supabase operations
│   ├── functions.py        # Function calling tools
│   └── requirements.txt
├── client/
│   ├── src/
│   │   ├── App.tsx         # Split-screen layout
│   │   ├── components/     # React components
│   │   ├── store/          # Zustand state management
│   │   ├── hooks/          # Custom hooks
│   │   └── types/          # TypeScript interfaces
│   └── package.json
└── supabase/
    └── migrations/         # Database schema
```

## Success Metrics

- ✅ Voice transcription appears within 1-2 seconds
- ✅ Function calls populate forms immediately
- ✅ Pull action completes in <100ms
- ✅ Field-level merge preserves manual entries
- ✅ AI confidence displayed for each field
- ✅ Sample data enables testing all workflows

## Troubleshooting

- **Connection issues**: Ensure LLM server is running on port 8080
- **Database errors**: Check Supabase credentials in .env
- **Voice not working**: Verify microphone permissions
- **Forms not updating**: Check browser console for RTVI errors

## License

MIT License - see LICENSE file for details.
