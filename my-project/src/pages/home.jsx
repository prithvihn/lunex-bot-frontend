import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { ArrowUpRight, Plus } from 'lucide-react'
import VoiceInput from '../components/VoiceInput'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  createConversation,
  saveUserMessage,
  saveAssistantMessage,
  sendMessageToAI,
  getMessages,
  renameConversation,
} from '../services/chatAPI'

const SYSTEM_PROMPT =
  'You are a helpful assistant. You may use markdown formatting such as **bold**, *italic*, `code`, code blocks, lists, and headings to make your responses clear and well-structured.'

const Home = ({
  currentConversationId,
  setCurrentConversationId,
  onConversationCreated,
  isAuthenticated,
}) => {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState([])
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const messagesEndRef = useRef(null)
  const voiceButtonRef = useRef(null)

  const hasMessages = messages.length > 0

  // Load messages when active conversation changes
  useEffect(() => {
    if (!currentConversationId || !isAuthenticated) {
      setMessages([])
      return
    }
    let cancelled = false
    const load = async () => {
      setMessagesLoading(true)
      try {
        const msgs = await getMessages(currentConversationId)
        if (!cancelled) setMessages(msgs)
      } catch (err) {
        console.error('Failed to load messages:', err)
        if (!cancelled) setMessages([])
      } finally {
        if (!cancelled) setMessagesLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [currentConversationId, isAuthenticated])

  // Clear messages when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setMessages([])
    }
  }, [isAuthenticated])

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages.length, isLoading])

  const buildConversationText = (allMsgs) => {
    return allMsgs
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n')
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    setInput('')
    setError('')
    setIsLoading(true)

    // Optimistic UI — show user message immediately
    const tempUserMsg = {
      id: `temp-${Date.now()}-u`,
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMsg])

    try {
      // 1. Create conversation if none exists
      let convId = currentConversationId
      if (!convId && isAuthenticated) {
        const conv = await createConversation('New Chat')
        convId = conv.id
        setCurrentConversationId(convId)
        onConversationCreated?.(conv)
      }

      // 2. Save user message to DB
      let savedUserMsg = tempUserMsg
      if (convId && isAuthenticated) {
        savedUserMsg = await saveUserMessage(convId, trimmed)
        // Replace temp message with saved one
        setMessages((prev) =>
          prev.map((m) => (m.id === tempUserMsg.id ? savedUserMsg : m)),
        )
      }

      // 3. Get AI response
      const allMsgs = [...messages, savedUserMsg]
      const conversationText = buildConversationText(allMsgs)
      const aiData = await sendMessageToAI(conversationText, SYSTEM_PROMPT)
      const aiContent = aiData.response || ''

      // 4. Save assistant message to DB
      let assistantMsg = {
        id: `temp-${Date.now()}-a`,
        role: 'assistant',
        content: aiContent,
        created_at: new Date().toISOString(),
      }

      if (convId && isAuthenticated) {
        assistantMsg = await saveAssistantMessage(convId, aiContent)
      }

      setMessages((prev) => [...prev, assistantMsg])

      // 5. Auto-rename conversation to first user message
      if (convId && isAuthenticated && messages.length === 0) {
        const title = trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed
        try {
          await renameConversation(convId, title)
          onConversationCreated?.({ id: convId, title })
        } catch {
          // Non-critical — silently ignore rename failures
        }
      }
    } catch (err) {
      console.error('Chat error:', err)
      setError(
        'Sorry, something went wrong while contacting the assistant. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  // Voice input handler
  const handleVoiceTranscript = useCallback((transcript, isFinal = true) => {
    if (isFinal) {
      setInput((prev) => {
        const newMessage = prev + (prev ? ' ' : '') + transcript
        return newMessage
      })
      setInterimTranscript('')
    } else {
      setInterimTranscript(transcript)
    }
  }, [])

  // Ctrl+M keyboard shortcut for voice input
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault()
        voiceButtonRef.current?.click()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  return (
    <div className="gradient-bg relative min-h-screen w-full overflow-hidden flex flex-col" style={{ position: 'relative' }}>
      {/* Recording indicator */}
      {isVoiceActive && (
        <div className="recording-indicator">
          <div className="recording-dot" />
          <span>Recording...</span>
        </div>
      )}

      {/* Planet horizon (background layer) */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[80%]
                   w-[150vw] h-[150vw] rounded-full bg-[#020617]
                   border-t border-t-white/40 shadow-[0_-40px_100px_rgba(59,130,246,0.5)] z-0"
        aria-hidden="true"
      />

      {/* Chat content */}
      <div
        className="relative z-10 flex-1 flex flex-col"
        style={{ paddingTop: '4.5rem', paddingBottom: '1rem' }}
      >
        <div className="chat-wrapper" style={{ flex: 1 }}>
          {/* Messages loading spinner */}
          {messagesLoading && (
            <div className="flex justify-center items-center py-12 animate-fade-in">
              <span className="loader-spinner" style={{ width: '2rem', height: '2rem' }} />
            </div>
          )}

          {/* Conversation area (only when there are messages) */}
          {!messagesLoading && hasMessages && (
            <div className="chat-messages-container animate-fade-in">
              {messages.map((message) => {
                const isUser = message.role === 'user'
                return (
                  <div
                    key={message.id}
                    className="w-full flex"
                    style={{
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.9rem',
                        backgroundColor: isUser
                          ? 'rgba(37,99,235,0.95)'
                          : 'rgba(15,23,42,0.95)',
                        color: '#e5e7eb',
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                        whiteSpace: isUser ? 'pre-wrap' : 'normal',
                        boxShadow: isUser
                          ? '0 10px 25px rgba(37,99,235,0.5)'
                          : '0 10px 30px rgba(15,23,42,0.9)',
                      }}
                      className={!isUser ? 'markdown-content' : ''}
                    >
                      {isUser ? (
                        message.content
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="w-full flex" style={{ justifyContent: 'flex-start', marginBottom: '1rem' }}>
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '0.85rem 1.25rem',
                      borderRadius: '0.9rem',
                      backgroundColor: 'rgba(15,23,42,0.95)',
                      boxShadow: '0 10px 30px rgba(15,23,42,0.9)',
                    }}
                  >
                    <div className="typing-indicator">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Centered hero + input block */}
          <div
            className={`transition-all duration-500 ${hasMessages ? 'chat-input-bar' : 'home-container'}`}
          >
            {!hasMessages && !messagesLoading && (
              <div className="mb-6" style={{ textAlign: 'center' }}>
                <h1 className="home-title animate-fade-in-up">
                  What can I help with?
                </h1>
                <p
                  className="home-privacy text-xs mt-2 max-w-md mx-auto animate-fade-in"
                  style={{ animationDelay: '0.2s', textAlign: 'center' }}
                >
                  Ask anything and I will respond in a clear, professional tone.
                </p>
              </div>
            )}

            <div className="home-search-shell max-w-2xl animate-fade-in-up" style={{ width: '100%', maxWidth: '672px', margin: '0 auto' }}>
              <div
                className={`home-search-bar ${isFocused ? 'home-search-bar--focused' : ''
                  }`}
              >
                <button
                  type="button"
                  className="home-icon-button"
                  aria-label="New message"
                >
                  <Plus size={18} aria-hidden="true" />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Lunex"
                  className="home-search-input"
                  disabled={isLoading}
                />

                <span ref={voiceButtonRef} style={{ display: 'inline-flex' }}>
                  <VoiceInput
                    onTranscript={handleVoiceTranscript}
                    onListeningChange={setIsVoiceActive}
                  />
                </span>

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="home-icon-button home-icon-button--send"
                  title="Send"
                >
                  {isLoading ? (
                    <span className="loader-spinner" />
                  ) : (
                    <ArrowUpRight size={18} aria-hidden="true" />
                  )}
                </button>
              </div>

              {interimTranscript && (
                <div className="interim-transcript">
                  <span className="loader-spinner" style={{ width: '0.85rem', height: '0.85rem' }} />
                  Listening: <em>{interimTranscript}</em>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div
              className="mt-4 text-sm"
              style={{
                color: '#fca5a5',
                backgroundColor: 'rgba(127,29,29,0.35)',
                border: '1px solid rgba(248,113,113,0.4)',
                borderRadius: '0.75rem',
                padding: '0.6rem 0.9rem',
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Terms text pinned to bottom center */}
      {!hasMessages && !messagesLoading && (
        <p
          className="home-privacy text-xs text-center max-w-md animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            animationDelay: '0.45s',
            zIndex: 20,
          }}
        >
          By messaging Lunex, you agree to our{' '}
          <button type="button" className="home-privacy-link">
            Terms
          </button>{' '}
          and have read our{' '}
          <button type="button" className="home-privacy-link">
            Privacy Policy
          </button>
          .
        </p>
      )}
    </div>
  )
}

export default Home
