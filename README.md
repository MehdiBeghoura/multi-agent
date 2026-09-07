# Self-Correcting Multi-Agent System

A full-stack multi-agent application that generates, reviews, and iteratively improves responses using **LangGraph**, **Groq**, **FastAPI**, and **React + TypeScript**.

The system follows a simple self-correction workflow:

```text
                ┌─────────────┐
                │    Writer   │
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │   Reviewer  │
                └──────┬──────┘
                       │
              ┌────────┴────────┐
              │                 │
           APPROVE            REVISE
              │                 │
              ▼                 ▼
          ┌───────┐      ┌─────────────┐
          │  END  │      │   Reviser   │
          └───────┘      └──────┬──────┘
                                │
                                └──────► Reviewer
```

## Features

* Multi-agent workflow with **Writer, Reviewer, and Reviser** agents
* Cyclic self-correction using **LangGraph**
* Conditional routing based on reviewer decisions
* Maximum revision limit to prevent infinite loops
* Structured reviewer output using **Pydantic**
* Hosted LLM inference using **Groq**
* Streaming graph updates from the backend
* FastAPI backend with request validation and CORS
* React + TypeScript frontend
* Tailwind CSS interface
* Live display of agent workflow events

## Tech Stack

### Backend

* Python
* FastAPI
* LangGraph
* LangChain
* Pydantic
* Groq

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

## Architecture

```text
┌──────────────────────┐
│   React + TypeScript │
│      + Tailwind      │
└──────────┬───────────┘
           │
           │ HTTP / Streaming
           ▼
┌──────────────────────┐
│       FastAPI        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      LangGraph       │
│                      │
│  Writer              │
│     ↓                │
│  Reviewer            │
│     ↓                │
│  Reviser ↔ Reviewer  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│        Groq          │
└──────────────────────┘
```

## Project Structure

```text
Self-Correcting-Multiagent/
│
├── backend/
│   ├── app.py
│   ├── graph.py
│   ├── llm.py
│   ├── nodes.py
│   ├── state.py
│   ├── test.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── AgentEventCard.tsx
│   │   ├── api.ts
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
│
├── .env
├── .gitignore
├── LICENSE
└── README.md
```

> Environment-specific files (e.g. `venv/`, `node_modules/`, `.env`) are excluded from version control via `.gitignore`.

## How It Works

### 1. User submits a topic

The React frontend sends:

```http
POST /api/run
```

with:

```json
{
  "topic": "What is RAG?"
}
```

### 2. FastAPI validates the request

The backend validates the topic using a Pydantic request model.

### 3. Writer generates a draft

The Writer receives the topic and creates an initial answer.

### 4. Reviewer evaluates the draft

The Reviewer checks the answer against the defined requirements and returns structured output:

```json
{
  "decision": "APPROVE",
  "feedback": ""
}
```

or:

```json
{
  "decision": "REVISE",
  "feedback": "The explanation needs a clearer concrete example."
}
```

### 5. Conditional routing

LangGraph checks the review decision.

If the reviewer returns:

```text
APPROVE
```

the workflow ends.

If the reviewer returns:

```text
REVISE
```

the workflow sends the draft to the Reviser.

### 6. Revision loop

The Reviser receives:

* the current draft
* reviewer feedback

and produces an improved draft.

The new draft is then sent back to the Reviewer.

The cycle continues until:

* the reviewer approves the answer, or
* the maximum revision count is reached.

## Streaming

The backend uses LangGraph's streaming updates to expose node-level execution events.

The frontend consumes those events progressively so the workflow can be displayed as it runs.

Example:

```text
Writer
↓
Reviewer → REVISE
↓
Reviser
↓
Reviewer → APPROVE
```

This allows the UI to expose the agent workflow instead of only displaying the final answer.

## Running the Project

### Backend

From the project root:

```bash
uvicorn backend.app:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

### Frontend

From the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
```

Never commit the `.env` file.

## Learning Goals

This project was built to practice:

* LangGraph state and workflow design
* Multi-agent orchestration
* Conditional graph routing
* Cyclic workflows
* Structured LLM output
* FastAPI API design
* HTTP streaming
* React and TypeScript integration
* Frontend/backend separation
* Local-to-hosted LLM integration

## Status

**Current status: Functional baseline**

The end-to-end application is operational:

```text
React
  ↓
FastAPI
  ↓
LangGraph
  ↓
Groq
  ↓
Writer / Reviewer / Reviser
  ↓
Streaming events
  ↓
React UI
```

The project is intended to serve as a foundation for adding more production-oriented AI engineering capabilities in future iterations.

## License

This project is licensed under the [MIT License](LICENSE).