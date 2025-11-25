import { Server, ServerEvent, Player } from "socket-be";
import http from "http";

const server = new Server({ port: 8000 });

let playersData = {};

server.on(ServerEvent.Open, () => {
  console.log("Server started");
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
      lastUpdate: Date.now(),
      isMuted,
    };
  }
});

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

httpServer.listen(3000, () => {
  console.log("HTTP server listening on port 3000");
});