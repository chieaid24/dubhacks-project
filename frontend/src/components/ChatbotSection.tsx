"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LectureData } from "@/types/lecture";

interface ChatbotSectionProps {
  lectureData: LectureData | null;
}

interface Message {
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function ChatbotSection({ lectureData }: ChatbotSectionProps) {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];

        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript;
          console.log('Final transcript:', transcript);

          // Add user message to chat
          const userMessage: Message = {
            type: 'user',
            text: transcript,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, userMessage]);

          // Send to backend (dummy for now)
          sendToBackend(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        // Ignore "no-speech" and "aborted" errors as they're expected during normal operation
        if (event.error === 'no-speech' || event.error === 'aborted') {
          console.log('Speech recognition:', event.error);
          return;
        }

        // Log other errors and stop listening
        console.error('Speech recognition error:', event.error);

        // Only stop listening for critical errors
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert('Microphone access was denied. Please enable microphone permissions.');
          setIsListening(false);
        } else if (event.error === 'network') {
          console.error('Network error - check your internet connection');
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart if we're still supposed to be listening
          recognitionRef.current.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  // Dummy backend function
  const sendToBackend = async (transcript: string) => {
    try {
      console.log('Sending to backend:', transcript);

      // TODO: Replace with actual API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          lectureData: lectureData
        })
      });

      // For now, simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          type: 'ai',
          text: `I heard you say: "${transcript}". (This is a dummy response - backend will be connected later)`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 500);

    } catch (error) {
      console.error('Error sending to backend:', error);
    }
  };

  // Toggle microphone
  const toggleListening = () => {
    if (!lectureData) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  // Handle text input send
  const handleSendMessage = () => {
    if (!inputValue.trim() || !lectureData) return;

    const userMessage: Message = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    sendToBackend(inputValue);
    setInputValue("");
  };

  return (
    <div className="h-80 bg-bg-dark ">
      <div className="relative h-full flex flex-col py-4 px-6">
        <div className="pb-2">
          <h3 className="font-bold text-2xl text-text-white">[Chat with AI Lecturer]</h3>
        </div>

        <div className="flex-1 p-4 pb-15 overflow-y-auto">
          {lectureData ? (
            <div className="space-y-3">
              <div className="bg-bg-dark-secondary p-3 rounded-lg">
                <p className="text-sm text-text-light-gray">Hello! I'm your AI lecturer. Ask me anything about your presentation!</p>
              </div>

              {/* Chat messages */}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${message.type === 'user'
                      ? 'bg-bg-dark-secondary ml-8'
                      : 'bg-bg-dark-tertiary mr-8'
                    }`}
                >
                  <p className="text-sm text-text-white">{message.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-text-dark-muted">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-bg-dark-secondary rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm">Upload slides to start chatting</p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pt-1 pb-4 px-4">
          <div className="flex items-center justify-center gap-2">
            {/* Microphone Button with Framer Motion */}
            <motion.button
              onClick={toggleListening}
              disabled={!lectureData}
              className={`p-2 rounded-full flex-shrink-0 shadow-2xl ${isListening
                  ? 'bg-error text-white'
                  : 'bg-primary text-white'
                } disabled:bg-bg-dark-secondary disabled:cursor-not-allowed`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
              whileHover={{ scale: lectureData ? 1.05 : 1 }}
              whileTap={{ scale: lectureData ? 0.95 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {isListening ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </motion.button>

            {/* Expandable Input Container with Framer Motion */}
            <motion.div
              className="relative"
              initial={false}
              animate={{
                width: isInputFocused ? '50rem' : '25rem'
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8
              }}
            >
              <motion.input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder={lectureData ? "Ask about your presentation..." : "Upload slides first"}
                disabled={!lectureData}
                className="w-full px-4 py-2 rounded-full border border-border-dark-light bg-bg-dark-secondary text-text-white placeholder:text-text-dark-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-bg-dark-secondary disabled:text-text-dark-muted shadow-2xl"
                animate={{
                  borderRadius: isInputFocused ? '9999px' : '9999px',
                  paddingRight: isInputFocused ? '5rem' : '1rem'
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30
                }}
              />

              {/* Send Button with AnimatePresence */}
              <AnimatePresence>
                {isInputFocused && (
                  <motion.button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    disabled={!lectureData}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 bg-transparent hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                    initial={{ opacity: 0, scale: 0.7, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.7, x: 10 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 25
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 152 152" fill="none">
                      <g clipPath="url(#clip0_21_26)">
                        <circle cx="78" cy="75" r="42" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M0.166672 76C0.166672 34.1184 34.1184 0.166687 76 0.166687C117.881 0.166687 151.833 34.1184 151.833 76C151.833 117.881 117.881 151.833 76 151.833C34.1184 151.833 0.166672 117.881 0.166672 76ZM68.4167 106.333C68.4167 110.522 71.8117 113.917 76 113.917C80.1883 113.917 83.5833 110.522 83.5833 106.333V63.9744L93.3878 73.7789C96.3491 76.7401 101.151 76.7401 104.112 73.7789C107.073 70.8176 107.073 66.0158 104.112 63.0545L82.0219 40.9645C81.9082 40.8502 81.7914 40.7399 81.6723 40.6334C80.2831 39.069 78.2568 38.0834 76 38.0834C73.7432 38.0834 71.7169 39.069 70.3277 40.6334C70.2086 40.7398 70.0918 40.8502 69.9781 40.9645L47.8877 63.0545C44.9263 66.0158 44.9263 70.8176 47.8877 73.7789C50.8493 76.7401 55.6507 76.7401 58.6123 73.7789L68.4167 63.9744V106.333Z" fill="#704FB2" />
                      </g>
                      <defs>
                        <clipPath id="clip0_21_26">
                          <rect width="152" height="152" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
