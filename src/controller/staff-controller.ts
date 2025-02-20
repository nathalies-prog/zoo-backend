import { getPool } from "../db/db.ts";
import type { Staff } from "../types.ts";


export class StaffController {
    static async getAllStaffs(){
        const result = await getPool().query(`SELECT * FROM "Staff"`);
        return result.rows;
    }
    static async getStaffByID(id : string){
        const result =  await getPool().query(`SELECT * FROM "Staff" WHERE id=$1`,[id]);
        return result.rows[0];
    }
    static async insertStaff(staff : Staff){
        try{
            const res = await getPool().query(`INSERT INTO "Staff" ("name","salary","role") VALUES($1,$2,$3)`,[staff.name,staff.salary,staff.role]);
            return res.rows[0];
        }
        catch(error){
            console.error("Fehler beim Erstellen eins Mitarbeiters.",error);
        }
    }
    static async assignStaffToEnclosure(staffId: string, enclosureId: string) {
        try {
            const staff = await getPool().query(`SELECT * FROM "Staff" WHERE id = $1`, [staffId]);
            const staffRole = staff.rows[0].role;

            if (staffRole !== 'Zookeeper') {
                throw new Error('Nur Tierpfleger können einem Gehege zugewiesen werden.');
            }

            const assignedEnclosures = await getPool().query(`SELECT * FROM "Enclosure_Staff" WHERE staff_id = $1`, [staffId]);
            if (assignedEnclosures.rows.length >= 3) {
                throw new Error('Ein Tierpfleger kann maximal 3 Gehege verwalten.');
            }

            await getPool().query(`INSERT INTO "Enclosure_Staff" ("staff_id", "enclosure_id") VALUES($1, $2)`, [staffId, enclosureId]);

        } catch (error) {
            console.error("Fehler beim Zuweisen des Mitarbeiters:", error);
        }
    }
}
