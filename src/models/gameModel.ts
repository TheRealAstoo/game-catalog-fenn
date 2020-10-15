import { Collection, ObjectId } from "mongodb";

export type GameInput = {
  code?: number;
  cover: {
    thumbnail?: string;
    url: string;
  };
  first_release_date?: number;
  genres?: { name: string; slug: string }[];
  name: string;
  platforms?: {
    name: string;
    slug: string;
    platform_logo: {
      height: number;
      url: string;
      width: number;
    };
  }[];
  rating?: number;
  rating_count?: number;
  screenshots?: {
    url: string;
  }[];
  slug: string;
  summary: string;
  total_rating?: number;
  total_rating_count?: number;
  url: string;
};

export type Game = GameInput & {
  _id: ObjectId;
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

  findByPlatformSlug(platformSlug: string): Promise<Game[]> {
    return this.collection.find({ "platforms.slug": platformSlug }).toArray();
  }

  async insertOne(payload: GameInput): Promise<Game> {
    const dbResponse = await this.collection.insertOne(payload);
    const { ops } = dbResponse;
    return ops[0];
  }

  async updateOne(id: ObjectId, payload: Game): Promise<Game> {
    const dbResponse = await this.collection.replaceOne({ _id: id }, payload);
    const { ops } = dbResponse;
    return ops[0];
  }

  async remove(id: ObjectId): Promise<void> {
    await this.collection.deleteOne({ _id: id });
  }

  validate(payload: Record<string, unknown>): string[] {
    const errors: string[] = [];

    const mandatoryKeys = ["cover_url", "name", "platform_slugs", "slug", "summary"];

    mandatoryKeys.forEach((key) => {
      if (!payload[key]) {
        errors.push(`Field '${key}' must be present.`);
      }
    });

    return errors;
  }
}
