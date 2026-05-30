import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { jwtVerify } from "jose";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    try {
      const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
      const token =
        socket.handshake.auth?.token || parseCookieToken(socket.handshake.headers.cookie);

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const { payload } = await jwtVerify(token, secret);
      socket.data.userId = payload.userId;
      socket.data.role = payload.role;
      socket.data.name = payload.name;
      next();
    } catch {
      next(new Error("Invalid or expired session"));
    }
  });

  io.on("connection", (socket) => {
    if (dev) {
      console.log(`[Socket.io] Connected: ${socket.id} (user: ${socket.data.name})`);
    }

    socket.on("disconnect", (reason) => {
      if (dev) {
        console.log(`[Socket.io] Disconnected: ${socket.id} (${reason})`);
      }
    });
  });

  global.io = io;

  httpServer.listen(port, () => {
    console.log(
      `> Server ready at http://localhost:${port} [${dev ? "development" : "production"}]`
    );
  });
});

function parseCookieToken(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
