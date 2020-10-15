import express from "express";
import PlatformModel, { Platform } from "../models/platformModel";
import slugify from "slug";
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
        game.first_release_date = new Date((game.first_release_date as number) * 1000).getTime();
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

export function list(gameModel: GameModel) {
  return async (request: express.Request, response: express.Response): Promise<void> => {
    const games = await gameModel.findByPlatformSlug(request.params.slug);
    if (clientWantsJson(request)) {
      response.json(games);
    } else {
      response.render("games/index", { games });
    }
  };
}

export function create(gameModel: GameModel, platformModel: PlatformModel) {
  return async (request: express.Request, response: express.Response): Promise<void> => {
    const slug = slugify(request.body.name);
    const errors = gameModel.validate({ ...request.body, slug: slug });
    if (errors.length > 0) {
      response.status(400).json({ errors });
    } else {
      const { cover_url, platform_slugs, ...gameInput } = request.body;
      gameInput.cover = { url: cover_url };
      gameInput.slug = slug;
      gameInput.platforms = (
        await Promise.all<Platform>(platform_slugs.map((slug: string) => platformModel.findBySlug(slug)))
      )
        .filter((platform) => platform !== null)
        .map((platform) => {
          return {
            name: platform.name,
            slug: platform.slug,
            platform_logo: {
              height: platform.platform_logo.height,
              url: platform.platform_logo.url,
              width: platform.platform_logo.width,
            },
          };
        });
      const game = await gameModel.insertOne(gameInput);
      response.status(201).json(game);
    }
  };
}

export function update(gameModel: GameModel) {
  return async (request: express.Request, response: express.Response): Promise<void> => {
    const game = await gameModel.findBySlug(request.params.slug);
    if (game) {
      const errors = gameModel.validate({ ...request.body, slug: request.params.slug });
      if (errors.length > 0) {
        response.status(400).json({ errors });
      } else {
        const updatedGame = await gameModel.updateOne(game._id, { ...game, ...request.body, _id: game._id });
        response.status(201).json(updatedGame);
      }
    } else {
      response.status(404).end();
    }
  };
}

export function destroy(gameModel: GameModel) {
  return async (request: express.Request, response: express.Response): Promise<void> => {
    const game = await gameModel.findBySlug(request.params.slug);
    if (game) {
      gameModel.remove(game._id);
      response.status(204).end();
    } else {
      response.status(404).end();
    }
  };
}
