import { useState, useCallback, useRef } from 'react';
import { useHotelStore } from '../store/hotelStore';
import { ConnectionState } from '../types/hotel';
import { generateMockAIUpdate } from '../data/mockData';

// Mock hook for local development without backend
export const useMockHotel = () => {
  const { updateAI } = useHotelStore();
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    transcript: '',
  });

  // Mock transcripts for different workflows
  const mockTranscripts = {
    checkin: [
      "Hi, I have a reservation under John Smith",
      "Yes, it's John Smith, J-O-H-N S-M-I-T-H",
      "My reservation number is res-1",
      "Here's my passport",
    ],
    availability: [
      "Do you have any rooms available from March 15th to March 18th?",
      "I'm looking for a deluxe room",
      "I'd prefer one with a balcony and jacuzzi if possible",
    ],
    modification: [
      "I need to extend my reservation",
      "I want to stay until March 20th instead of March 18th",
      "Can I also upgrade to a deluxe room?",
      "And add breakfast to my reservation",
    ],
    special_request: [
      "I'm in room 102",
      "Can I get a late checkout?",
      "I need to checkout at 2 PM instead of 11 AM",
    ],
  };

  const transcriptIndexRef = useRef(0);
  const transcriptIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentWorkflowRef = useRef<keyof typeof mockTranscripts>('checkin');

  const simulateTranscription = useCallback(() => {
    const transcripts = mockTranscripts[currentWorkflowRef.current];

    if (transcriptIndexRef.current < transcripts.length) {
      const text = transcripts[transcriptIndexRef.current];
      setConnectionState(prev => ({
        ...prev,
        transcript: prev.transcript + (prev.transcript ? '\n' : '') + text,
      }));
      transcriptIndexRef.current++;

      // On last transcript, update AI state
      if (transcriptIndexRef.current === transcripts.length) {
        setTimeout(() => {
          const mockUpdate = generateMockAIUpdate(currentWorkflowRef.current);
          if (mockUpdate) {
            updateAI(mockUpdate.workflow, mockUpdate.data);
          }
        }, 500);
      }
    } else {
      if (transcriptIntervalRef.current) {
        clearInterval(transcriptIntervalRef.current);
        transcriptIntervalRef.current = null;
      }
    }
  }, [updateAI]);

  const connect = useCallback(async () => {
    setConnectionState(prev => ({ ...prev, isConnecting: true, error: undefined }));

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setConnectionState({
      isConnected: true,
      isConnecting: false,
      transcript: '',
    });

    // Start simulating transcription after 1 second
    setTimeout(() => {
      transcriptIndexRef.current = 0;
      transcriptIntervalRef.current = setInterval(simulateTranscription, 2000);
    }, 1000);
  }, [simulateTranscription]);

  const disconnect = useCallback(async () => {
    if (transcriptIntervalRef.current) {
      clearInterval(transcriptIntervalRef.current);
      transcriptIntervalRef.current = null;
    }

    setConnectionState({
      isConnected: false,
      isConnecting: false,
      transcript: '',
    });

    transcriptIndexRef.current = 0;
  }, []);

  // Manual trigger for testing different workflows
  const simulateWorkflow = useCallback((workflow: keyof typeof mockTranscripts) => {
    if (!connectionState.isConnected) return;

    currentWorkflowRef.current = workflow;
    transcriptIndexRef.current = 0;

    setConnectionState(prev => ({
      ...prev,
      transcript: '',
    }));

    if (transcriptIntervalRef.current) {
      clearInterval(transcriptIntervalRef.current);
    }

    transcriptIntervalRef.current = setInterval(simulateTranscription, 2000);
  }, [connectionState.isConnected, simulateTranscription]);

  return {
    connectionState,
    connect,
    disconnect,
    simulateWorkflow, // Extra method for testing
  };
};
