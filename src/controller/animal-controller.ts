import { getPool } from "../db/db.ts";
import type { Animal } from "../types.ts";

export class AnimalController {
  static async getAllAnimals() {
    const result = await getPool().query(`SELECT * FROM "Animal"`);
    return result.rows;
  }
  static async getAnimalByID(id: string) {
    try {
      const result = await getPool().query(
        `
              SELECT * FROM "Animal" WHERE "id" = $1;
            `,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Fehler beim Abrufen des Tieres:", error);
      throw error;
    }
  }
  static async insertAnimal(animal: Animal) {
    const { breed, name, birthday, gender, health, vet_id, enclosure_id } =
      animal;

    try {
      const vetResult = await getPool().query(
        `
            SELECT COUNT(*) FROM "Animal" WHERE "vet_id" = $1;
          `,
        [vet_id]
      );

      const count = parseInt(vetResult.rows[0].count);

      if (count >= 25) {
        throw new Error(
          "Der ausgewählte Tierarzt betreut bereits 25 Tiere und kann kein weiteres Tier übernehmen."
        );
      }

      const result = await getPool().query(
        `
            INSERT INTO "Animal" ("breed", "name", "birthday", "gender", "health", "vet_id", "enclosure_id")
            VALUES ($1, $2, $3, $4, $5, $6, $7);
          `,
        [breed, name, birthday, gender, health, vet_id, enclosure_id]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Fehler beim Erstellen des Tieres:", error);
      throw error;
    }
  }
  static async updateAnimal(animal: Animal, id: string) {
    const result = await getPool().query(
      `UPDATE "Animal" SET breed=$1, name=$2,birthday=$3,gender=$4,health=$5,vet_id=$6,enclosure_id=$7 WHERE id = $8 `,
      [
        animal.breed,
        animal.name,
        animal.birthday,
        animal.gender,
        animal.health,
        animal.vet_id,
        animal.enclosure_id,
        id,
      ]
    );
    return result.rows[0];
  }

  static async deleteAnimal(id: string) {
    try {
      const result = await getPool().query(
        `DELETE FROM "Animal" WHERE id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error(
        `Irgendwas ist beim Löschen schief gelaufen = Animal: ${id}`,
        error
      );
    }
  }
}
