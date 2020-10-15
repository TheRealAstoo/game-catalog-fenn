import express from "express";
import GameModel from "../models/gameModel";

const clientWantsJson = (request: express.Request): boolean => request.get("accept") === "application/json";

export function index(gameModel: GameModel) {
  return async (request: express.Request, response: express.Response): Promise<void> => {
    const games = await gameModel.findAll();
    if (clientWantsJson(request)) {
      response.json(games);
    } else {
      response.render("games/index", { games });
    }
  };
}

export function show(gameModel: GameModel) {
  return async (request: express.Request, response: express.Response): Promise<void> => {
    const game = await gameModel.findBySlug(request.params.slug);
    if (game) {
      if (clientWantsJson(request)) {
        response.json(game);
      } else {
        game.first_release_date = new Date((game.first_release_date as number) * 1000);
        response.render("games/show", { game });
      }
    } else {
      response.status(404);
      if (clientWantsJson(request)) {
        response.json({ error: "This game does not exist." });
      } else {
        response.status(404).render("pages/not-found");
      }
    }
  };
}
