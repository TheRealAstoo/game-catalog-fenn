import { Collection } from "mongodb";

export type Game = {
  [key: string]: unknown;
};

export default class PlatformModel {
  private collection: Collection;
  constructor(collection: Collection) {
    this.collection = collection;
  }

  findAll(): Promise<Game[]> {
    return this.collection.find({}).toArray();
  }

  findById(id: string): Promise<Game | null> {
    return this.collection.findOne({
      _id: id,
    });
  }

  findBySlug(slug: string): Promise<Game | null> {
    return this.collection.findOne({
      slug: slug,
    });
  }
}
