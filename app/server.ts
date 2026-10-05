// server.ts (project root)
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const production = process.argv.includes("--production") || process.env.NODE_ENV === "production";
if (production) process.env.NODE_ENV = "production";

const dev = !production;
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer);

  // Share io with API routes (they run in this same process)
  (globalThis as any).io = io;

  io.on("connection", (socket) => {
    console.log("client connected", socket.id);
    socket.on("disconnect", () => console.log("client left", socket.id));
  });

  httpServer.listen(port, () => console.log(`http://localhost:${port}`));
});