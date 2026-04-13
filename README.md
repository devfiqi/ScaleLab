# ScaleLab — System Design Playground

ScaleLab is an interactive system design platform that transforms natural language prompts into structured system architectures, tradeoffs, and visual diagrams.

<img width="1100" height="1069" alt="Screenshot 2026-04-13 at 4 04 34 AM" src="https://github.com/user-attachments/assets/96f501ff-86ca-4c42-bd8f-d3d85bda0f0c" />

Live Demo: https://scale-lab-alpha.vercel.app/#prompt  
Repository: https://github.com/devfiqi/ScaleLab

---

## Features

### AI-Powered System Design
Generate structured designs from prompts such as:
- Design Netflix
- Design a rate limiter
- Design a distributed cache

Outputs include:
- requirements
- components
- tradeoffs
- bottlenecks
- failure modes
- scaling strategies

---

### Architecture Graph Visualization
- Dynamic system diagrams
- Typed components (gateway, service, cache, database, etc.)
- Semantic edges (read, write, async)
- Auto-layout using Dagre
- Clean, production-style visual design

---

### Backend (Go)
- Stateless API service
- Request validation and input constraints
- Rate limiting for abuse protection
- LLM abstraction layer (provider-agnostic)
- Structured JSON generation pipeline

---

### Full Stack Deployment
- Frontend: Vercel (Next.js)
- Backend: Render (Go API)
- LLM: OpenAI API

---

## Architecture

Frontend (Next.js)
↓
Go Backend API (Render)
↓
LLM Provider (OpenAI)
↓
Structured JSON Response
↓
Graph + UI Rendering

---

## Tech Stack

### Frontend
- Next.js
- React
- React Flow
- TypeScript
- Tailwind CSS

### Backend
- Go
- net/http
- JSON encoding/decoding

### Infrastructure
- Vercel (frontend hosting)
- Render (backend hosting)
- OpenAI API

---

## Project Structure

ScaleLab/
├── frontend/        # Next.js app
├── backend/         # Go API service
│   ├── cmd/server/
│   ├── internal/
│   └── go.mod

---

## Future Improvements

- User accounts and saved designs
- Persistent storage for design history
- More advanced system templates
- Improved graph interactivity (expand/collapse, zoom groups)
- Support for multiple LLM providers
