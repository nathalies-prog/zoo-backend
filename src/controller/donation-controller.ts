import { getPool } from "../db/db.js";
import type { Donation } from "../types.ts";

export class DonationController {
  static async insertDonation(donation: Donation) {
    try {
      const res = await getPool().query(
        `INSERT INTO "Donation" ("person_name","amount","date","pdf_url") VALUES($1,$2,$3)`,
        [donation.person_name, donation.amount, donation.date, donation.pdf_url]
      );
      return res.rows[0];
    } catch (error) {
      console.error("Fehler beim Speichern der Spende.", error);
    }
  }
}
