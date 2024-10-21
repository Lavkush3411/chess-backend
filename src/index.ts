import { WebSocketServer } from "ws";
import { GameManager } from "./class/GameManager";
const wss = new WebSocketServer({ port: 8080 }, () => {
  console.log("Wss server started on port 8080");
});

const gameManager = new GameManager();

wss.on("connection", (socket) => {
  gameManager.addUser(socket);
  socket.on("message", (data) => {
    console.log(data.toString());
  });
  socket.on("close", () => gameManager.removeUser(socket));
});
