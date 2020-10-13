import { Collection } from "mongodb";

export type Platform = {
  [key: string]: unknown;
};

export default class PlatformModel {
  private collection: Collection;
  constructor(collection: Collection) {
    this.collection = collection;
  }

  findAll(): Promise<Platform[]> {
    return this.collection.find({}).toArray();
  }

  findById(id: string): Promise<Platform | null> {
    return this.collection.findOne({
      _id: id,
    });
  }

  findBySlug(slug: string): Promise<Platform | null> {
    return this.collection.findOne({
      slug: slug,
    });
  }
}
