// pages/api/socket.js
import { Server } from "socket.io";

let io;

export default function handler(req, res) {
  if (!io) {
    io = new Server(res.socket.server);
    res.socket.server.io = io;

    // Handle a connection
    io.on("connection", (socket) => {
      console.log("Client connected");

      // Listen for score updates
      socket.on("update-score", (data) => {
        // Broadcast the updated score to all clients
        io.emit("score-updated", data);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }
  res.end();
}
