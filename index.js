import { Server, ServerEvent } from "socket-be";
import http from "http";

// Puerto asignado por Render, o 3000 en local
const port = process.env.PORT || 3000;

let playersData = {};

// Servidor HTTP
const httpServer = http.createServer((req, res) => {
  if (req.url === "/server") {
    const playersArray = Object.values(playersData);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(playersArray));
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

// Socket-BE usando el mismo servidor HTTP
const server = new Server({ server: httpServer });

// Eventos del WebSocket
server.on(ServerEvent.Open, () => {
  console.log("WebSocket server started");
});

server.on(ServerEvent.PlayerTransform, async (ev) => {
  const world = ev.world;
  const players = await world.getPlayers();

  for (const player of players) {
    const location = await player.getLocation();
    const ping = await player.getPing();
    const name = player.name;
    const isMuted = player.hasTag("vc:muted");

    playersData[name] = {
      name,
      location,
      ping,
      isMuted,
      lastUpdate: Date.now(),
    };
  }
});

// Iniciar servidor
httpServer.listen(port, () => {
  console.log(`HTTP + WS server running on port ${port}`);
});
