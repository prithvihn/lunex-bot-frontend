import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
console.log('🔗 API connecting to:', BASE_URL)

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
})

// JWT auth interceptor — attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    const tokenType = localStorage.getItem('token_type') || 'Bearer'
    if (token) {
        config.headers.Authorization = `${tokenType} ${token}`
    }
    return config
})

// ─── Authentication ──────────────────────────────────────

export async function loginUser(email, password) {
    const { data } = await api.post('/login', { email, password })
    return data
}

export async function signupUser(email, password) {
    const { data } = await api.post('/signup', { email, password })
    return data
}

export async function registerUser(email, password) {
    const { data } = await api.post('/register', { email, password })
    return data
}

// ─── Conversations ───────────────────────────────────────

export async function createConversation(title = 'New Chat') {
    const { data } = await api.post('/api/conversations/create', { title })
    return data // { id, user_id, title, created_at, updated_at }
}

export async function getConversations() {
    const { data } = await api.get('/api/conversations/list')
    return data // [{ id, title, created_at, last_message_preview }]
}

export async function deleteConversation(conversationId) {
    await api.delete(`/api/conversations/${conversationId}`)
}

export async function renameConversation(conversationId, title) {
    const { data } = await api.patch(`/api/conversations/${conversationId}/rename`, { title })
    return data
}

// ─── Messages ────────────────────────────────────────────

export async function getMessages(conversationId) {
    const { data } = await api.get(`/api/conversations/${conversationId}/messages`)
    return data // [{ id, conversation_id, role, content, created_at }]
}

export async function saveUserMessage(conversationId, content) {
    const { data } = await api.post('/api/messages/create', {
        conversation_id: conversationId,
        content,
    })
    return data // { id, conversation_id, role, content, created_at }
}

export async function saveAssistantMessage(conversationId, content) {
    const { data } = await api.post('/api/messages/save-assistant', {
        conversation_id: conversationId,
        content,
    })
    return data
}

// ─── AI ──────────────────────────────────────────────────

export async function sendMessageToAI(message, systemPrompt) {
    const { data } = await api.post('/ask', { message, system_prompt: systemPrompt })
    return data // { response }
}

export default api
