import { Collection, ObjectId } from "mongodb";

type PlatformInput = {
  code: number;
  connectivity: string;
  cpu: string;
  games: {
    cover: {
      thumbnail: string;
      url: string;
    };
    name: string;
    slug: string;
  }[];
  graphics: string;
  media: string;
  memory: string;
  name: string;
  online: string;
  os: string;
  output: string;
  platform_logo: {
    height: number;
    url: string;
    width: number;
  };
  platform_version_release_date: string;
  resolutions: string;
  slug: string;
  sound: string;
  storage: string;
  summary: string;
  url: string;
};

export type Platform = PlatformInput & {
  _id: ObjectId;
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

  async insertOne(payload: PlatformInput): Promise<Platform> {
    if (!payload.games) {
      payload.games = [];
    }
    const dbResponse = await this.collection.insertOne(payload);
    const { ops } = dbResponse;
    return ops[0];
  }

  validate(payload: Partial<PlatformInput & Record<string, unknown>>): string[] {
    const errors: string[] = [];

    const platformInput: Partial<PlatformInput> & Record<string, unknown> = {
      games: [],
    };

    const mandatoryKeys = [
      "code",
      "connectivity",
      "cpu",
      "graphics",
      "media",
      "memory",
      "name",
      "online",
      "os",
      "output",
      "platform_version_release_date",
      "resolutions",
      "slug",
      "sound",
      "storage",
      "summary",
      "url",
    ];

    mandatoryKeys.forEach((key) => {
      if (!payload[key]) {
        errors.push(`Field '${key}' must be present.`);
      } else {
        platformInput[key] = payload[key];
      }
    });

    if (
      (payload.platform_logo &&
        !payload.platform_logo.height &&
        !payload.platform_logo.width &&
        !payload.platform_logo.url) ||
      !payload.platform_logo
    ) {
      errors.push("Field 'platform_logo' must be present.");
    }

    return errors;
  }
}
