# Real Time Chat

A minimal real-time chat application built to learn WebSockets. Create a room, share the code, and chat with up to 10 people — no account required.

**Live:** https://real-time-chat-liard.vercel.app/

---

## Features

- **Create or join a room** — click "Create New Room" to get a shareable 6-character room code, or paste an existing code to join
- **Up to 10 users per room** — the server enforces the limit and notifies late joiners
- **Optional username** — leave the name field blank and you'll be assigned a random guest name (e.g. `Guest_4821`)
- **Live user count** — the header shows how many people are currently in the room
- **System messages** — the chat logs when someone joins or leaves
- **Auto-scroll** — the message feed scrolls to the latest message automatically
- **Send on Enter** — no need to reach for the mouse
- **Temporary rooms** — rooms exist only in memory; once everyone leaves, the room is gone
- **Dark / light mode** — toggle in the top-right corner

---

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui (Card, Button, Input, Alert)
- Lucide React (icons)

**Backend**
- Bun runtime
- `ws` — WebSocket server running on port 8080

---

## How It Works

The backend maintains an in-memory list of connected users, each tagged with their socket, room ID, and display name. When a message comes in, the server reads its `type` field and acts accordingly:

| Type | What happens |
|---|---|
| `join` | Validates room capacity, registers the user, broadcasts updated user count and a system message to the room |
| `chat` | Broadcasts the message to everyone else in the same room |
| `close` | Removes the user, broadcasts updated user count and a departure message |

The frontend connects via the native browser `WebSocket` API as soon as you enter a room, and tears down the connection cleanly when you click Leave or close the tab.

---

## What I Learned

This was a learning project — the primary goal was to get hands-on with WebSockets, and it delivered on that. A few other things I picked up along the way:

- **Tailwind transitions and transforms** — the stacked alert notification animation (slide-up + scale + opacity) uses `translateY`, `scale`, and `transition-all` together, which I hadn't combined like that before
- **Managing WebSocket lifecycle in React** — using `useRef` to hold the socket instance so event handlers don't go stale, and cleaning up in the `useEffect` return

---

## Running Locally

**Backend**

```bash
cd chat_backend
bun install
bun index.ts
```

The WebSocket server starts on `ws://localhost:8080`.

**Frontend**

```bash
cd chat_frontend
bun install
bun run dev
```

Create a `.env` file in `chat_frontend/` if you need to point at a different backend:

```
VITE_WS_URL=ws://localhost:8080
```

---

## Project Status & What's Next

This is my second deployed project, built in about 3 hours. The next one I'm planning is a collaborative drawing board — essentially an Excalidraw clone — where multiple users can draw on the same canvas in real time using WebSockets. That one will be significantly more complex and I'm genuinely excited to start it.

Before diving into that, I'm going to level up on **Next.js**, **PostgreSQL**, **Drizzle**, and **Prisma** — so keep an eye out, the Excalidraw project will be live soon.
