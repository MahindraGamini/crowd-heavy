// server.ts (project root)
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const production = process.argv.includes("--production") || process.env.NODE_ENV === "production";

const dev = !production;
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer
  ,{cors: {
    origin: "*",
  }}
  );

  // Share io with API routes (they run in this same process)
  globalThis.io = io;

  io.on("connection", (socket) => {
    console.log("client connected", socket.id);
    socket.on("disconnect", () => console.log("client left", socket.id));
  });

  const emitDailyRefresh = () => {
    io.emit("notes:refresh");
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 50);
    setTimeout(emitDailyRefresh, next.getTime() - Date.now());
  };
  emitDailyRefresh();

  httpServer.listen(port, () => console.log(`http://localhost:${port}`));
});
