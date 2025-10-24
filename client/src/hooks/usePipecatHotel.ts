import { useState, useCallback } from 'react';
import { usePipecatClient, useRTVIClientEvent } from '@pipecat-ai/client-react';
import { RTVIEvent } from '@pipecat-ai/client-js';
import { useHotelStore } from '../store/hotelStore';
import { ConnectionState } from '../types/hotel';

export const usePipecatHotel = () => {
  const client = usePipecatClient();
  const { updateAI } = useHotelStore();
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    transcript: '',
  });

  // Debug events to monitor for function calls
  const debugEvents = [
    RTVIEvent.ServerMessage,
    RTVIEvent.LLMFunctionCall,
    RTVIEvent.BotTranscript,
    RTVIEvent.BotLlmText,
    RTVIEvent.BotLlmStarted,
    RTVIEvent.BotLlmStopped,
  ];

  debugEvents.forEach(eventType => {
    useRTVIClientEvent(
      eventType,
      useCallback(
        (data: any) => {
          console.log(`🔍 RTVI Event [${eventType}]:`, data);
          if (eventType === RTVIEvent.LLMFunctionCall) {
            console.log('🎯 Found llm-function-call in event:', eventType, data);

            console.log('📦 Function call payload:', data);
          
            let result: Record<string, unknown> = { success: false, message: 'Unknown function' };
          
            try {
              switch (data.function_name) {
                case 'update_checkin_form': {
                  console.log('🏨 Updating check-in form:', data.args);
                  updateAI('checkin', data.args);
                  result = { success: true, message: 'Check-in form updated' };
                  console.log('✅ Check-in form updated');
                  break;
                }
                
                case 'search_availability': {
                  console.log('🔍 Searching availability:', data.args);
                  updateAI('availability', data.args);
                  result = { success: true, message: 'Availability search updated' };
                  console.log('✅ Availability search updated');
                  break;
                }
              
                case 'modify_reservation': {
                  console.log('✏️ Modifying reservation:', data.args);
                  updateAI('modification', data.args);
                  result = { success: true, message: 'Reservation modification updated' };
                  console.log('✅ Reservation modification updated');
                  break;
                }
              
                case 'create_special_request': {
                  console.log('⭐ Creating special request:', data.args);
                  updateAI('special_request', data.args);
                  result = { success: true, message: 'Special request created' };
                  console.log('✅ Special request created');
                  break;
                }
              
                default:
                  result = { success: false, message: `Unknown function: ${data.function_name}` };
                  console.log('❌ Unknown function call:', data.function_name);
                  break;
              }
            }
            finally {
              console.log('🔍 Function call result:', result);
            }
          }
        },
        [updateAI]
      )
    );
  });

  // Handle transcription updates
  useRTVIClientEvent(
    RTVIEvent.UserTranscript,
    useCallback((data: any) => {
      if (data.text) {
        setConnectionState(prev => ({
          ...prev,
          transcript: data.text,
        }));
      }
    }, [])
  );

  useRTVIClientEvent(
    RTVIEvent.BotTranscript,
    useCallback((data: any) => {
      if (data.text) {
        setConnectionState(prev => ({
          ...prev,
          transcript: data.text,
        }));
      }
    }, [])
  );

  // Handle connection state changes
  useRTVIClientEvent(
    RTVIEvent.Connected,
    useCallback(() => {
      setConnectionState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: undefined,
      }));
    }, [])
  );

  useRTVIClientEvent(
    RTVIEvent.Disconnected,
    useCallback(() => {
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
      }));
    }, [])
  );

  // Handle errors
  useRTVIClientEvent(
    RTVIEvent.Error,
    useCallback((error: any) => {
      console.error('Pipecat error:', error);
      setConnectionState(prev => ({
        ...prev,
        error: error.message || 'Connection error',
        isConnecting: false,
      }));
    }, [])
  );

  const connect = async () => {
    if (!client) return;
    
    setConnectionState(prev => ({ ...prev, isConnecting: true, error: undefined }));
    
    try {
      await client.connect();
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to connect to server',
      }));
    }
  };

  const disconnect = async () => {
    if (!client) return;
    
    try {
      await client.disconnect();
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  return {
    connectionState,
    connect,
    disconnect,
  };
};

