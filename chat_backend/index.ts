import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const MAX_USERS_PER_ROOM = 10;

type User = {
  socket: WebSocket;
  room: string;
  name: string;
};

let allSockets: User[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (rawMessage) => {
    const parsed = JSON.parse(rawMessage.toString());

    if (parsed.type === "join") {
      const { roomId, name } = parsed.payload;
      const roomUsers = allSockets.filter((u) => u.room === roomId);

      if (roomUsers.length >= MAX_USERS_PER_ROOM) {
        socket.send(JSON.stringify({
          type: "error",
          payload: { message: "Room is full (max 10 users)" },
        }));
        return;
      }

      allSockets.push({ socket, room: roomId, name });

      socket.send(JSON.stringify({
        type: "joined",
        payload: { roomId, userCount: roomUsers.length + 1 },
      }));

      broadcastToRoom(roomId, {
        type: "userCount",
        payload: { count: roomUsers.length + 1 },
      });

      broadcastToRoom(roomId, {
        type: "system",
        payload: { message: `${name} joined the room` },
      }, socket);
    }

    if (parsed.type === "chat") {
      const currentUser = allSockets.find((u) => u.socket === socket);
      if (!currentUser) return;

      broadcastToRoom(currentUser.room, {
        type: "chat",
        payload: { message: parsed.payload.message, name: currentUser.name },
      }, socket);
    }
  });

  socket.on("close", () => {
    const user = allSockets.find((u) => u.socket === socket);
    if (!user) return;   

    allSockets = allSockets.filter((u) => u.socket !== socket);
    const remaining = allSockets.filter((u) => u.room === user.room);

    broadcastToRoom(user.room, {
      type: "userCount",
      payload: { count: remaining.length },
    });

    broadcastToRoom(user.room, {
      type: "system",
      payload: { message: `${user.name} left the room` },
    });
  });
});

function broadcastToRoom(room: string, message: object, exclude?: WebSocket) {
  allSockets
    .filter((u) => u.room === room && u.socket !== exclude)
    .forEach((u) => u.socket.send(JSON.stringify(message)));
}

console.log("WebSocket server running on ws://localhost:8080");
