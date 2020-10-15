import { Db } from "mongodb";
import * as core from "express-serve-static-core";
import express from "express";
import * as gamesController from "./controllers/games.controller";
import * as nunjucks from "nunjucks";
import * as platformsController from "./controllers/platforms.controller";
import GameModel, { Game } from "./models/gameModel";
import PlatformModel, { Platform } from "./models/platformModel";
import bodyParser from "body-parser";

const clientWantsJson = (request: express.Request): boolean => request.get("accept") === "application/json";

const jsonParser = bodyParser.json();

export function makeApp(db: Db): core.Express {
  const app = express();

  nunjucks.configure("views", {
    autoescape: true,
    express: app,
  });

  app.use("/assets", express.static("public"));
  app.set("view engine", "njk");

  const platformModel = new PlatformModel(db.collection<Platform>("platforms"));
  const gameModel = new GameModel(db.collection<Game>("games"));

  app.get("/", (_request, response) => response.render("pages/home"));

  app.get("/platforms", platformsController.index(platformModel));
  app.get("/platforms/:slug", platformsController.show(platformModel));
  app.post("/platforms", jsonParser, platformsController.create(platformModel));
  app.put("/platforms/:slug", jsonParser, platformsController.update(platformModel));
  app.delete("/platforms/:slug", jsonParser, platformsController.destroy(platformModel));

  app.get("/platforms/:slug/games", gamesController.list(gameModel));
  app.get("/games", gamesController.index(gameModel));
  app.get("/games/:slug", gamesController.show(gameModel));
  app.post("/games", jsonParser, gamesController.create(gameModel, platformModel));
  app.put("/games/:slug", jsonParser, gamesController.update(gameModel));
  app.delete("/games/:slug", jsonParser, gamesController.destroy(gameModel));

  app.get("/*", (request, response) => {
    if (clientWantsJson(request)) {
      response.status(404).json({ error: "Not Found" });
    } else {
      response.status(404).render("pages/not-found");
    }
  });

  return app;
}
