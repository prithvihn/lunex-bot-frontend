import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { loginUser } from '../services/chatAPI'
import lunexLogo from '../assets/lunex-logo.svg'

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [shakeField, setShakeField] = useState('')
  const canvasRef = useRef(null)

  const navigate = useNavigate()

  // Star particle background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: Math.random() * 1.2 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.3 + 0.05,
      phase: Math.random() * Math.PI * 2,
    }))

    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      stars.forEach((s) => {
        const flicker = 0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(148, 180, 255, ${s.opacity * flicker})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!form.password) {
      newErrors.password = 'Password is required'
    }
    return newErrors
  }

  const triggerShake = (field) => {
    setShakeField(field)
    setTimeout(() => setShakeField(''), 500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      triggerShake(Object.keys(newErrors)[0])
      return
    }

    setIsLoading(true)

    try {
      const data = await loginUser(form.email, form.password)

      // Store tokens
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      localStorage.setItem('token_type', data.token_type)
      localStorage.setItem('user_email', form.email)

      console.log('Login successful')
      if (typeof onLogin === 'function') {
        onLogin()
      }

      navigate('/')
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ server: error.message || 'Backend server is not responding.' })
      triggerShake('password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="gradient-bg flex items-center justify-center px-4 py-8"
      style={{ minHeight: 'calc(100vh - 52px)', position: 'relative' }}
    >
      {/* Star particle canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        className="glass-card animate-fade-in-up login-card-premium"
        style={{ width: '100%', maxWidth: '26rem', padding: '2.5rem 2rem', position: 'relative', zIndex: 1 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3.75rem',
              height: '3.75rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.2))',
              marginBottom: '1rem',
              boxShadow: '0 0 24px rgba(56, 189, 248, 0.15)',
            }}
          >
            <img src={lunexLogo} alt="Lunex" width={32} height={32} />
          </div>
          <h2
            style={{
              color: 'white',
              fontSize: '1.6rem',
              fontWeight: 700,
              marginBottom: '0.4rem',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Welcome to{' '}
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
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
            Access your AI workspace
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.server && (
            <p
              className="error-msg"
              style={{
                textAlign: 'center',
                marginBottom: '1rem',
                background: 'rgba(255,0,0,0.1)',
                padding: '5px',
                borderRadius: '4px',
              }}
            >
              {errors.server}
            </p>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <div className={`input-wrapper ${shakeField === 'email' ? 'animate-shake' : ''}`}>
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? 'error' : ''}`}
              />
            </div>
            {errors.email && <p className="error-msg">{errors.email}</p>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div className={`input-wrapper ${shakeField === 'password' ? 'animate-shake' : ''}`}>
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className={`input-field ${errors.password ? 'error' : ''}`}
                style={{ paddingRight: '2.75rem' }}
              />
              <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="error-msg">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="btn-primary btn-login-premium"
            disabled={isLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              padding: '0.85rem',
            }}
          >
            {isLoading ? (
              <span className="loader-spinner" />
            ) : (
              <>
                <LogIn size={18} />
                Enter Lunex
              </>
            )}
          </button>
        </form>

        <div className="divider">or continue with</div>

        <p
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem',
            marginTop: '1.5rem',
          }}
        >
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login