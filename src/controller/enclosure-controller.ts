import { getFilePathWithoutDefaultDocument } from "hono/utils/filepath";
import { getPool } from "../db/db.ts";
import type { Enclosure } from "../types.ts";

export class EnclosureController {
  static async getAllEnclosures() {
    const res = await getPool().query(`SELECT * FROM "Enclosure" `);
    return res.rows;
  }

  static async getEnclosureByID(id: string) {
    try {
      const result = await getPool().query(
        `
                  SELECT * FROM "Enclosure" WHERE "id" = $1;
                `,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error(`Fehler beim Abrufen des Geheges mit ID ${id}:`, error);
      return error;
    }
  }
  static async insertEnclosure(enclosure : Enclosure){
    try{
    
    const result = await getPool().query(`INSERT INTO "Enclosure" ("name","costs") VALUES($1,$2)`,[enclosure.name,enclosure.costs] );
    return result.rows[0];
    }
    catch(error){
        console.error("Fehler beim Erstellen eins Geheges.",error);
    }
  }
  static async updateEnclosure(enclosure: Enclosure, id: string) {
    try {
      const result = await getPool().query(
        `UPDATE "Enclosure" SET name=$1,costs=$2 WHERE id = $3 `,
        [enclosure.name, enclosure.costs, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error(
        `Etwas ist schief gelaufen beim Updaten des Geheges.`,
        error
      );
    }
  }
  static async deleteEnclosure(id: string) {
    const existingAnimals = await getPool().query(`SELECT * FROM "Animal" WHERE enclosure_id = $1`,[id]);
    if(existingAnimals){
        return (console.error('Gehege kann nicht gelöscht werden, da sich darin Tiere befinden.'),405);
    }
    try {
      const encolusre_staff_result = await getPool().query(
        `DELETE FROM "Enclosure_Staff" WHERE id=$1`,
        [id]
      );
      const result = await getPool().query(
        `DELETE FROM "Enclosure" WHERE id=$1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error(
        `Irgendwas ist beim Löschen schief gelaufen = Enclosure: ${id}`,
        error
      );
    }
  }
}
