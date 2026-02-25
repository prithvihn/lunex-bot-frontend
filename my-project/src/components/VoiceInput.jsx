import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Mic } from 'lucide-react'

const VoiceInput = ({ onTranscript, onListeningChange }) => {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef(null)

  // Stable callback ref so recognition.onresult always uses latest onTranscript
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      console.warn('Speech recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        onTranscriptRef.current(finalTranscript.trim(), true)
      } else if (interimTranscript) {
        onTranscriptRef.current(interimTranscript, false)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)

      if (event.error === 'not-allowed') {
        alert(
          'Microphone access denied. Please enable microphone permissions in your browser settings.',
        )
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Notify parent when listening state changes
  useEffect(() => {
    onListeningChange?.(isListening)
  }, [isListening, onListeningChange])

  const toggleListening = useCallback(() => {
    if (!isSupported) {
      alert(
        'Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.',
      )
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (error) {
        console.error('Error starting recognition:', error)
      }
    }
  }, [isSupported, isListening])

  if (!isSupported) {
    return null
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`voice-button ${isListening ? 'listening' : ''}`}
      title={isListening ? 'Stop recording (Ctrl+M)' : 'Start voice input (Ctrl+M)'}
    >
      {isListening ? (
        <div className="pulse-animation">
          <Mic size={18} />
        </div>
      ) : (
        <Mic size={18} />
      )}
    </button>
  )
}

export default VoiceInput
