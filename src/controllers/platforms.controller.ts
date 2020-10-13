import { Request, Response } from "express";
import PlatformModel from "../models/platformModel";

const clientWantsJson = (request: Request): boolean => request.get("accept") === "application/json";

export function index(platformModel: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platforms = await platformModel.findAll();
    if (clientWantsJson(request)) {
      response.json(platforms);
    } else {
      response.render("platforms/index", { platforms });
    }
  };
}

export function show(platformModel: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platform = await platformModel.findBySlug(request.params.slug);
    if (platform) {
      if (clientWantsJson(request)) {
        response.json(platform);
      } else {
        response.render("platforms/show", { platform });
      }
    } else {
      response.status(404);
      if (clientWantsJson(request)) {
        response.json({ error: "This platform does not exist." });
      } else {
        response.status(404).render("pages/not-found");
      }
    }
  };
}
