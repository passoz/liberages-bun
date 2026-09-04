import { eq } from "drizzle-orm";
import { db } from "../../../db/index";
import { spots } from "../../../db/schema";
import { generateId } from "../../shared/uuid";

export class SpotRepository {
  findAll() {
    return db.select().from(spots).all();
  }

  findById(id: string) {
    return db.select().from(spots).where(eq(spots.id, id)).get();
  }

  create(name: string, category: string, latitude: string, longitude: string, isPartner = 0) {
    const spot = {
      id: generateId(),
      name,
      category,
      latitude,
      longitude,
      isPartner,
      createdAt: Date.now(),
    };
    db.insert(spots).values(spot).run();
    return spot;
  }
}

export const spotRepository = new SpotRepository();
