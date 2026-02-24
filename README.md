<div align="center">

<!-- LOGO / HEADER BANNER -->

```
 ██╗     ██╗   ██╗███╗   ██╗███████╗██╗  ██╗
 ██║     ██║   ██║████╗  ██║██╔════╝╚██╗██╔╝
 ██║     ██║   ██║██╔██╗ ██║█████╗   ╚███╔╝ 
 ██║     ██║   ██║██║╚██╗██║██╔══╝   ██╔██╗ 
 ███████╗╚██████╔╝██║ ╚████║███████╗██╔╝ ██╗
 ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
```

### 🌌 *Your AI Guide Through the Cosmos*

---
[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-eega--ai.vercel.app-FF3B3B?style=for-the-badge)](https://lunexbot.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Modern-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

</div>

---

## 🚀 What is Lunex?

> *"Lunex" — from "Luna" (Moon) + "X" (the unknown) — a gateway to infinite space-driven knowledge.*

**Lunex** is a sleek, space-themed AI chatbot frontend that connects humans to the cosmos through conversation. Whether you're curious about black holes, stellar formations, or just need guidance navigating the universe of knowledge — Lunex is your intelligent co-pilot.

This repository contains the **React-powered frontend** of the Lunex chatbot platform, designed to deliver an immersive, futuristic chat experience with a clean and minimal interface.

---

## 🌠 Feature Highlights

| Feature | Description |
|---|---|
| 💬 **AI Chat Interface** | Real-time conversational experience powered by backend AI |
| 📜 **Chat History** | Browse, search, and revisit past conversations |
| 🗑️ **Delete Conversations** | Manage your chat history with ease |
| 🔐 **Auth Flow** | Secure Login & Signup pages for personalized sessions |
| 📡 **API Integration** | Dedicated service layer (`chatAPI.js`) for clean backend communication |
| 📱 **Responsive Design** | Works seamlessly across devices |
| 🌑 **Space Aesthetic** | UI designed to feel like you're exploring the universe |

---

## 🛸 Application Flow

```
┌─────────────────────────────────────────────────────────┐
│                     LUNEX FRONTEND                       │
│                                                         │
│   ┌──────────┐    ┌──────────┐    ┌────────────────┐   │
│   │  Login / │───▶│  Home    │───▶│  Chat Window   │   │
│   │  Signup  │    │ Landing  │    │  (AI Replies)  │   │
│   └──────────┘    └──────────┘    └────────┬───────┘   │
│                                            │            │
│                                   ┌────────▼───────┐   │
│                                   │   chatAPI.js   │   │
│                                   │  (API Layer)   │   │
│                                   └────────┬───────┘   │
└────────────────────────────────────────────┼───────────┘
                                             │
                               ┌─────────────▼──────────┐
                               │     LUNEX BACKEND       │
                               │  (Separate Repository)  │
                               └────────────────────────┘
```

---

## 🪐 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 |
| **Build Tool** | Vite |
| **Routing** | React Router DOM |
| **HTTP Client** | Fetch API / Axios (via `chatAPI.js`) |
| **Styling** | CSS Modules + Custom CSS |
| **Linting** | ESLint |

---

## 🗂️ Project Structure

```
lunex-bot-frontend/
│
├── 📁 my-project/
│   ├── 📁 assets/                    # Screenshots & documentation images
│   │   ├── 🖼️ landing-page.png
│   │   ├── 🖼️ chat-history-search-new-chat.png
│   │   ├── 🖼️ input-output-reply.png
│   │   ├── 🖼️ delete-conversation.png
│   │   └── 🖼️ workflow-frontend-backend.png
│   │
│   ├── 📁 public/
│   │   └── 🖼️ vite.svg
│   │
│   └── 📁 src/
│       ├── 📁 assets/                # App logos & static resources
│       │   ├── lunex-logo.svg        # 🌙 The Lunex brand logo
│       │   └── react.svg
│       │
│       ├── 📁 pages/                 # All route-level page components
│       │   ├── 📄 home.jsx           # Main chat interface / landing
│       │   ├── 📄 Login.jsx          # User authentication - login
│       │   ├── 📄 Signup.jsx         # User authentication - registration
│       │   ├── 📄 About.jsx          # About Lunex page
│       │   └── 📄 Contact.jsx        # Contact / support page
│       │
│       ├── 📁 services/
│       │   └── 📄 chatAPI.js         # API calls to Lunex backend
│       │
│       ├── 🎨 App.css                # Global app styles
│       ├── 📄 App.jsx                # Root component with routing
│       ├── 🎨 index.css              # Base/reset styles
│       └── 📄 main.jsx               # React DOM entry point
│
├── 🌐 index.html
├── ⚙️ vite.config.js
├── ⚙️ package.json
└── 📝 README.md
```

---

## 🖥️ Screenshots

> A visual tour of the Lunex experience

**🪐 Landing Page**

![Landing Page](assets/landing-page.png)

**💬 Chat — Input, Output & Replies**

![Chat Interface](assets/input-output-reply.png)

**🔍 Chat History, Search & New Chat**

![Chat History](assets/chat-history-search-new-chat.png)

**🗑️ Delete Conversation**

![Delete Conversation](assets/delete-conversation.png)

**🔄 Frontend ↔ Backend Workflow**

![Workflow](assets/workflow-frontend-backend.png)

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** `v18+`
- **npm** `v9+` or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/prithvihn/lunex-bot-frontend.git

# 2. Navigate into the project folder
cd lunex-bot-frontend/my-project

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be running at **`http://localhost:5173`** 🚀

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 🔌 API Configuration

The frontend communicates with the **Lunex Backend** through `src/services/chatAPI.js`.

Update the base URL in that file to point to your backend server:

```js
// src/services/chatAPI.js
const BASE_URL = "http://localhost:8000"; // 🔁 Replace with your backend URL
```

> 🛰️ The backend repository is maintained separately. Stay tuned for the backend README.

---

## 🌌 Pages Overview

| Route | Component | Description |
|---|---|---|
| `/` | `home.jsx` | Main landing & chat interface |
| `/login` | `Login.jsx` | User login screen |
| `/signup` | `Signup.jsx` | New user registration |
| `/about` | `About.jsx` | About Lunex & its mission |
| `/contact` | `Contact.jsx` | Get in touch / support |

---

## 🔭 Future Improvements

- [ ] 🌗 **Dark / Light Mode Toggle** — Switch between themes
- [ ] 🌍 **Multi-language Support** — Interact with Lunex in any language
- [ ] 🎙️ **Voice Input** — Ask Lunex questions with your voice
- [ ] 🧠 **Memory Mode** — Lunex remembers your preferences across sessions
- [ ] 📊 **Chat Analytics** — Visualize your conversation patterns
- [ ] 🔔 **Notifications** — Get alerts for responses or updates
- [ ] 🛰️ **PWA Support** — Install Lunex as a Progressive Web App

---

## 🤝 Contributing

Contributions are welcome! If you'd like to help improve Lunex:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request



<div align="center">

### 🌙 *Built with curiosity, powered by AI, inspired by the cosmos.*

**[⭐ Star this repo](https://github.com/prithvihn/lunex-bot-frontend)** if Lunex lights up your world!

---

*Lunex Frontend — Part of the Lunex Chatbot Platform*

</div>
