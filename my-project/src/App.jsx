import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { LogIn, Menu, UserPlus, Search, Trash2, Edit2 } from 'lucide-react'
import lunexLogo from './assets/lunex-logo.svg'
import './App.css'
import Home from './pages/home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import {
  getConversations,
  createConversation,
  deleteConversation as deleteConversationAPI,
  renameConversation,
} from './services/chatAPI'
import RenameModal from './components/RenameModal'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('access_token'),
  )
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [chatToRename, setChatToRename] = useState(null)

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter((c) => c.title.toLowerCase().includes(q))
  }, [conversations, searchQuery])

  // Load conversations from API when authenticated
  const loadConversations = useCallback(async () => {
    if (!localStorage.getItem('access_token')) return
    setLoadingConversations(true)
    try {
      const data = await getConversations()
      setConversations(data)
    } catch (err) {
      console.error('Failed to load conversations:', err)
      setConversations([])
    } finally {
      setLoadingConversations(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations()
    } else {
      setConversations([])
      setCurrentConversationId(null)
    }
  }, [isAuthenticated, loadConversations])

  // Listen for auth changes across tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'access_token') {
        setIsAuthenticated(!!event.newValue)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Called by Home when a new conversation is created or renamed
  const handleConversationCreated = useCallback((conv) => {
    setConversations((prev) => {
      const exists = prev.find((c) => c.id === conv.id)
      if (exists) {
        // Update existing (e.g. rename)
        return prev.map((c) => (c.id === conv.id ? { ...c, ...conv } : c))
      }
      // Add new at the top
      return [{ ...conv, created_at: conv.created_at || new Date().toISOString() }, ...prev]
    })
  }, [])

  const handleNewChat = () => {
    setCurrentConversationId(null)
    setIsSidebarOpen(false)
  }

  const handleSelectConversation = (convId) => {
    setCurrentConversationId(convId)
    setIsSidebarOpen(false)
  }

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation()
    if (!window.confirm('Delete this conversation?')) return
    try {
      await deleteConversationAPI(convId)
      setConversations((prev) => prev.filter((c) => c.id !== convId))
      if (currentConversationId === convId) {
        setCurrentConversationId(null)
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err)
      alert('Failed to delete conversation. Please try again.')
    }
  }

  const handleRenameChat = (e, convId, title) => {
    e.stopPropagation()
    setChatToRename({ id: convId, title })
    setRenameModalOpen(true)
  }

  const handleRenameSubmit = async (newTitle) => {
    try {
      await renameConversation(chatToRename.id, newTitle)
      setConversations((prev) =>
        prev.map((c) =>
          c.id === chatToRename.id ? { ...c, title: newTitle } : c,
        ),
      )
    } catch (err) {
      console.error('Failed to rename conversation:', err)
      alert('Failed to rename conversation. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_type')
    localStorage.removeItem('user_email')
    setConversations([])
    setCurrentConversationId(null)
    setIsSidebarOpen(false)
    setIsAuthenticated(false)
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const currentUserEmail = localStorage.getItem('user_email') || ''

  return (
    <Router>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: '4rem',
          padding: '0 2rem',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left side — Hamburger + Logo + Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setIsSidebarOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '9999px',
              border: '1px solid #1f2937',
              backgroundColor: 'rgba(15,23,42,0.9)',
              color: '#e5e7eb',
              cursor: 'pointer',
            }}
          >
            <Menu size={18} />
          </button>

          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#ffffff',
              marginRight: '2rem',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.5rem',
              letterSpacing: '-0.02em',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <img src={lunexLogo} alt="Lunex logo" width={28} height={28} style={{ display: 'block' }} />
            <span>
              Lune
              <span
                style={{
                  background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                x
              </span>
            </span>
          </Link>

          {['Home', 'About', 'Contact'].map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              style={{
                color: '#cbd5e1',
                textDecoration: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 500,
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#cbd5e1'
              }}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Right side — Auth Buttons / Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {isAuthenticated ? (
            <Link
              to="/"
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#e2e8f0',
                textDecoration: 'none',
                padding: '0.625rem 1.5rem',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                border: '1px solid #475569',
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#64748b'
                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.6)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = '#475569'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <LogIn size={16} />
              Logout
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#e2e8f0',
                  textDecoration: 'none',
                  padding: '0.625rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  border: '1px solid #475569',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#64748b'
                  e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.6)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.borderColor = '#475569'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <LogIn size={16} />
                Login
              </Link>

              <Link
                to="/signup"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '0.625rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.backgroundColor = '#2563eb'
                  e.currentTarget.style.boxShadow =
                    '0 6px 20px rgba(59, 130, 246, 0.45)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.backgroundColor = '#3b82f6'
                  e.currentTarget.style.boxShadow =
                    '0 2px 8px rgba(59, 130, 246, 0.3)'
                }}
              >
                <UserPlus size={16} />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Sidebar & overlay */}
      {isSidebarOpen && (
        <>
          <div
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: '4rem',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15,23,42,0.65)',
              zIndex: 900,
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: '4rem',
              left: 0,
              bottom: 0,
              width: '17rem',
              backgroundColor: 'rgba(15,23,42,0.98)',
              borderRight: '1px solid #1f2937',
              boxShadow: '8px 0 25px rgba(0,0,0,0.6)',
              zIndex: 950,
              padding: '1rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={handleNewChat}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(148,163,184,0.5)',
                background:
                  'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,0.9))',
                color: '#f9fafb',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 8px 18px rgba(37,99,235,0.6)',
              }}
            >
              New Chat
            </button>

            {/* Sidebar search */}
            <div className="sidebar-search-wrapper">
              <Search size={14} className="sidebar-search-icon" />
              <input
                type="text"
                placeholder="Search chats…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sidebar-search-input"
              />
            </div>

            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#9ca3af',
                padding: '0.25rem 0.25rem',
              }}
            >
              Chat History
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: '0.25rem',
              }}
            >
              {isAuthenticated ? (
                <>
                  {/* Loading skeleton */}
                  {loadingConversations && conversations.length === 0 && (
                    <div className="sidebar-skeleton-list">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="sidebar-skeleton-item" />
                      ))}
                    </div>
                  )}

                  {filteredConversations.map((conv) => {
                    const isActive = conv.id === currentConversationId
                    return (
                      <div
                        key={conv.id}
                        className="sidebar-conv-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          marginBottom: '0.35rem',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectConversation(conv.id)}
                          style={{
                            flex: 1,
                            textAlign: 'left',
                            padding: '0.55rem 0.6rem',
                            borderRadius: '0.6rem',
                            border: '1px solid rgba(55,65,81,0.85)',
                            backgroundColor: isActive
                              ? 'rgba(30,64,175,0.8)'
                              : 'rgba(15,23,42,0.85)',
                            color: '#e5e7eb',
                            fontSize: '0.86rem',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={conv.title}
                        >
                          {conv.title}
                        </button>
                        <div className="sidebar-conv-actions">
                          <button
                            type="button"
                            onClick={(e) => handleRenameChat(e, conv.id, conv.title)}
                            className="sidebar-rename-btn"
                            title="Rename conversation"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteConversation(e, conv.id)}
                            className="sidebar-delete-btn"
                            title="Delete conversation"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {!loadingConversations && filteredConversations.length === 0 && (
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: '#6b7280',
                        padding: '0.35rem 0.25rem',
                      }}
                    >
                      {searchQuery.trim() ? 'No matching chats.' : 'No conversations yet.'}
                    </p>
                  )}
                </>
              ) : (
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    padding: '0.35rem 0.25rem',
                  }}
                >
                  Log in to see your chat history.
                </p>
              )}
            </div>

            <div
              style={{
                borderTop: '1px solid #1f2937',
                paddingTop: '0.6rem',
                fontSize: '0.8rem',
                color: '#9ca3af',
              }}
            >
              {currentUserEmail ? (
                <span>Logged in as {currentUserEmail}</span>
              ) : (
                <span>Not logged in</span>
              )}
            </div>
          </aside>
        </>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Home
              currentConversationId={currentConversationId}
              setCurrentConversationId={setCurrentConversationId}
              onConversationCreated={handleConversationCreated}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>

      <RenameModal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        currentTitle={chatToRename?.title || ''}
        onRename={handleRenameSubmit}
      />
    </Router>
  )
}

export default App
