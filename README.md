# 🚀 AKX AI – Multi-Agent AI Platform

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-Latest-purple?logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![Firebase](https://img.shields.io/badge/Firebase-Authentication-orange?logo=firebase)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-blue?logo=razorpay)

> A powerful multi-agent AI platform that combines intelligent conversations, code generation, web search, document understanding, image creation, presentation generation, and vision capabilities into a single seamless experience.

---

# ✨ Features

## 🤖 Intelligent Multi-Agent System

AKX AI automatically routes user requests to the most suitable AI agent, ensuring accurate and specialized responses.

### 🗨️ Chat Agent

* Natural conversations
* Context-aware responses
* Human-like interactions

### 💻 Coding Agent

* Generates production-ready code
* Debugging assistance
* Code optimization
* Multi-language support

### 🌐 Search Agent

* Real-time web search
* Latest information retrieval
* Research assistance

### 📄 PDF RAG Agent

* Upload PDF documents
* Semantic search using vector embeddings
* Context-aware document Q&A
* Retrieval-Augmented Generation (RAG)

### 📊 PPT Generation Agent

* Creates professional presentations
* Auto-generated slide structure
* Download-ready PowerPoint files

### 🎨 Image Generation Agent

* Text-to-image generation
* Creative visual content creation
* AI-powered artwork generation

### 👁️ Vision Agent

* Image understanding
* Object detection and analysis
* Visual question answering

---

# 🏗️ System Architecture

```text
                    ┌─────────────────┐
                    │   React + Vite  │
                    │    Frontend     │
                    └────────┬────────┘
                             │
                             ▼
                 ┌─────────────────────┐
                 │     API Gateway     │
                 │      Port 8000      │
                 └────────┬────────────┘
                          │
      ┌───────────┬───────┼───────┬───────────┐
      ▼           ▼       ▼       ▼           ▼

┌──────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│   Auth   │ │  Chat   │ │ Agent   │ │ Billing │
│ Service  │ │ Service │ │ Service │ │ Service │
│  8001    │ │  8002   │ │  8003   │ │  8004   │
└──────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

# ⚙️ Architecture Overview

## 🎨 Frontend (React + Vite)

A premium modern user interface built using:

* ⚛️ React
* ⚡ Vite
* 🗂 Redux Toolkit
* 🎯 Responsive Design
* 🌙 Dark Mode Experience

### Redux State Management

* 🔐 Authentication Slice
* 💬 Conversations Slice
* 📨 Messages Slice

---

## 🚪 API Gateway (Port 8000)

Acts as the single entry point for all client requests.

### Responsibilities

* 🔄 Request Routing
* 🔒 Authentication Validation
* 🍪 Secure Cookie Handling
* 📡 Service Communication

---

## 🔐 Auth Service (Port 8001)

Complete authentication ecosystem.

### Features

* Email & Password Login
* User Registration
* OTP Verification
* Google Login
* Apple Login
* Facebook Login
* Firebase Token Validation
* JWT Authentication

---

## 💬 Chat Service (Port 8002)

Handles conversation management.

### Features

* Conversation Storage
* Message History
* CRUD Operations
* Chat Persistence
* User Chat Management

---

## 🧠 Agent Service (Port 8003)

The intelligence layer of the platform.

### Responsibilities

* Multi-Agent Routing
* Prompt Classification
* Tool Execution
* Workflow Orchestration
* AI Response Generation

---

## 💳 Billing Service (Port 8004)

Subscription and payment management.

### Features

* Razorpay Integration
* Plan Management
* Credit System
* Subscription Tracking
* Payment Processing

---

# 🛠️ Technology Stack

## Frontend

* ⚛️ React
* ⚡ Vite
* 🎯 Redux Toolkit
* 🎨 Tailwind CSS

## Backend

* 🟢 Node.js
* 🚀 Express.js
* 🔐 JWT Authentication
* 🍪 HTTP-Only Cookies

## Database

* 🍃 MongoDB
* 🔄 Auto Reconnection Logic
* 🛡 Retry Mechanisms

## AI & ML

* 🤖 Multi-Agent Architecture
* 🔍 RAG Pipelines
* 🧠 Vector Embeddings
* 👁 Vision Models
* 🎨 Image Generation Models

## Payments

* 💳 Razorpay

## Authentication

* 🔥 Firebase Authentication
* OTP Verification
* Social Login Providers

---

# 🔒 Security Features

* 🔐 HTTP-Only Cookies
* 🛡 Secure Authentication
* 🔑 JWT-Based Authorization
* 🌍 Environment Variable Protection
* 📦 dotenvx Configuration
* 🚫 Unauthorized Access Prevention

---

# 🚀 One Command Startup

The project includes a custom startup orchestrator:

```bash
npm run dev
```

### What It Does

✅ Cleans conflicting ports

✅ Frees Port 3000 automatically

✅ Starts Frontend

✅ Starts API Gateway

✅ Starts Auth Service

✅ Starts Chat Service

✅ Starts Agent Service

✅ Starts Billing Service

✅ Runs everything concurrently

---

# 📂 Microservices

| Service            | Port | Description              |
| ------------------ | ---- | ------------------------ |
| 🚪 API Gateway     | 8000 | Central Entry Point      |
| 🔐 Auth Service    | 8001 | Authentication & OTP     |
| 💬 Chat Service    | 8002 | Conversation Management  |
| 🧠 Agent Service   | 8003 | AI Agent Orchestration   |
| 💳 Billing Service | 8004 | Payments & Subscriptions |

---

# 🌟 Why AKX AI?

* 🤖 Advanced Multi-Agent Intelligence
* ⚡ Fast Microservice Architecture
* 🔒 Enterprise-Grade Security
* 🌐 Real-Time Search Capability
* 📄 Intelligent PDF Understanding
* 🎨 AI Image Generation
* 📊 Automated Presentation Creation
* 👁 Powerful Vision Analysis
* 💳 Integrated Billing System
* 🚀 Scalable & Production Ready

---

## 🎯 AKX AI — One Platform, Multiple AI Experts.
