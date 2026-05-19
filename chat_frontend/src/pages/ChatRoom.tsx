import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/src/hooks/useTheme";

type Message = { id: number; text: string; senderName: string; isOwn: boolean; isSystem: boolean };

type Props = {
  roomCode: string;
  userName: string;
  onLeave: () => void;
};

export function ChatRoom({ roomCode, userName, onLeave }: Props) {
  const { dark, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userCount, setUserCount] = useState(1);
  const [connError, setConnError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL ?? "ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      setConnError("");
      ws.send(JSON.stringify({ type: "join", payload: { roomId: roomCode, name: userName } }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "chat") {
        setMessages((prev) => [...prev, {
          id: Date.now(),
          text: data.payload.message,
          senderName: data.payload.name,
          isOwn: false,
          isSystem: false,
        }]);
      }

      if (data.type === "system") {
        setMessages((prev) => [...prev, {
          id: Date.now(),
          text: data.payload.message,
          senderName: "",
          isOwn: false,
          isSystem: true,
        }]);
      }

      if (data.type === "userCount") {
        setUserCount(data.payload.count);
      }

      if (data.type === "error") {
        setConnError(data.payload.message);
      }
    };

    ws.onerror = () => setConnError("Could not connect to server. Is the backend running?");

    return () => ws.close();
  }, [roomCode, userName]);

  const handleLeave = () => {
    wsRef.current?.close();
    onLeave();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ type: "chat", payload: { message: newMessage.trim() } }));
    setMessages((prev) => [...prev, {
      id: Date.now(),
      text: newMessage.trim(),
      senderName: userName,
      isOwn: true,
      isSystem: false,
    }]);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3 py-8">
      <Button variant="outline" size="icon" className="fixed top-4 right-4 rounded-md" onClick={toggleTheme}>
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </Button>

      {connError && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-destructive text-white px-4 py-2 rounded-md text-sm">
          {connError}
        </div>
      )}

      <Card className="w-[700px] border-2">
        <CardHeader className="pt-5 px-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <p className="text-2xl font-bold">Real Time Chat</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-md" onClick={handleLeave}>Leave</Button>
          </div>
          <p className="text-gray-400 text-sm">temporary room that expires after both users exit</p>
        </CardHeader>

        <CardContent className="px-5 pb-5 flex flex-col gap-3">
          <div className="flex justify-between items-center bg-secondary rounded-md px-4 py-3 text-sm">
            <span>Room Code: <span className="font-bold">{roomCode}</span></span>
            <span>Users: <span className="font-bold">{userCount}/10</span></span>
          </div>

          <div className="h-[500px] bg-black rounded-md overflow-y-auto flex flex-col gap-2 p-3">
            {messages.map((msg) => (
              msg.isSystem ? (
                <div key={msg.id} className="flex justify-center">
                  <span className="text-xs text-muted-foreground">{msg.text}</span>
                </div>
              ) : (
                <div key={msg.id} className={`flex flex-col gap-0.5 ${msg.isOwn ? "items-end" : "items-start"}`}>
                  {!msg.isOwn && (
                    <span className="text-xs text-muted-foreground px-1">{msg.senderName}</span>
                  )}
                  <div className={`px-3 py-2 rounded-xl text-sm max-w-[60%] ${
                    msg.isOwn ? "bg-white text-black" : "bg-secondary text-foreground"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              )
            ))}
            <div ref={bottomRef} />
          </div>
        </CardContent>
      </Card>

      <div className="w-[700px] flex gap-2 bg-card border rounded-xl px-4 py-3">
        <Input
          className="border-0 shadow-none focus-visible:ring-0 bg-transparent px-0 p-2 h-10"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button className="rounded-lg px-6 h-10" onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}
