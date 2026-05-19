import './App.css'
import { useState } from 'react'
import { LandingPage } from './pages/LandingPage'
import { ChatRoom } from './pages/ChatRoom'

type Page =
  | { name: "landing" }
  | { name: "chatroom"; roomCode: string; userName: string }

function App() {
  const [page, setPage] = useState<Page>({ name: "landing" });

  const goToRoom = (roomCode: string, userName: string) => {
    setPage({ name: "chatroom", roomCode, userName });
  };

  if (page.name === "chatroom") {
    return (
      <ChatRoom
        roomCode={page.roomCode}
        userName={page.userName}
        onLeave={() => setPage({ name: "landing" })}
      />
    );
  }

  return <LandingPage onEnterRoom={goToRoom} />;
}

export default App
