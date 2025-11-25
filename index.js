import { Server, ServerEvent } from "socket-be";
import express from "express";

const wsServer = new Server({ port: 8000 });

let playersData = {};

// Servidor HTTP para fetch
const app = express();
const HTTP_PORT = 3000;

app.get("/players", (req, res) => {
  res.json(playersData);
});

app.listen(HTTP_PORT, () => {
  console.log(`HTTP server running on port ${HTTP_PORT}`);
});

wsServer.on(ServerEvent.Open, () => {
  console.log("WebSocket server started");
});

wsServer.on(ServerEvent.PlayerTransform, async (ev) => {
  const world = ev.world;
  const players = await world.getPlayers();

  for (const player of players) {
    const location = await player.getLocation();
    const ping = await player.getPing();
    const name = player.name;

    let isMuted = await world.runCommand(`tag ${name} list`);
    isMuted = isMuted.statusMessage.includes("vc:muted");

    playersData[name] = {
      name,
      location,
      ping,
      lastUpdate: Date.now(),
      isMuted,
    };
  }
});
