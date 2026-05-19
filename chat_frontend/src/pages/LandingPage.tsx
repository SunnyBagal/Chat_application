import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, MessageCircle, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/src/hooks/useTheme";

type AlertItem = { id: number; message: string; visible: boolean };

function generateRoomCode() {
  return Math.random().toString(16).slice(2, 8).toUpperCase();
}

type Props = {
  onEnterRoom: (roomCode: string, userName: string) => void;
};

export function LandingPage({ onEnterRoom }: Props) {
  const { dark, toggleTheme } = useTheme();
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const addAlert = (message: string) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, visible: false }]);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, visible: true } : a));
      });
    });
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 3000);
  };

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    setCreatedCode(code);
    addAlert("Room created successfully");
    onEnterRoom(code, name.trim() || `Guest_${Math.floor(Math.random() * 9000) + 1000}`);
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) { addAlert("Please enter a room code"); return; }
    onEnterRoom(roomCode.trim().toUpperCase(), name.trim() || `Guest_${Math.floor(Math.random() * 9000) + 1000}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Button variant="outline" size="icon" className="fixed top-4 right-4 rounded-md" onClick={toggleTheme}>
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </Button>
      <Card className="w-[600px] border">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <p className="text-2xl font-bold">Real Time Chat</p>
          </div>
          <p className="text-gray-400 text-sm">temporary room that expires after all users exit</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pb-5 px-5">
          <Button className="w-full h-12 rounded-md" onClick={handleCreateRoom}>Create New Room</Button>
          <Input
            className="rounded-sm h-10"
            placeholder="Enter your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              className="rounded-sm h-10"
              placeholder="Enter Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
            <Button className="rounded-sm px-6 h-10" onClick={handleJoinRoom}>Join Room</Button>
          </div>

          {createdCode && (
            <div className="bg-secondary rounded-md px-5 py-4 flex flex-col items-center gap-1">
              <p className="text-sm text-muted-foreground">Share this code with your friend</p>
              <p className="text-3xl font-bold tracking-widest">{createdCode}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="fixed bottom-6 right-6 w-80">
        <div className="relative h-14">
          {alerts.map((alert, index) => {
            const depth = Math.min(alerts.length - 1 - index, 3);
            return (
              <Alert
                key={alert.id}
                className="absolute inset-x-0 bottom-0 rounded-lg transition-all duration-300 ease-out border-2 h-12"
                style={{
                  transform: alert.visible
                    ? `translateY(${-depth * 7}px) scale(${1 - depth * 0.04})`
                    : `translateY(110%)`,
                  zIndex: index + 1,
                  opacity: alert.visible ? 1 - depth * 0.2 : 0,
                }}
              >
                <div className="flex items-center gap-2 h-full">
                  <AlertCircle size={16} />
                  <span>{alert.message}</span>
                </div>
              </Alert>
            );
          })}
        </div>
      </div>
    </div>
  );
}
