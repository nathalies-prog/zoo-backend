import { getPool } from "../db/db.js";
export class SalesStandController {
    static async getAllSalesStands() {
        const result = await getPool().query(`SELECT * FROM "SalesStand"`);
        return result.rows;
    }
    static async getSalesStandByID(id) {
        try {
            const result = await getPool().query(`SELECT * FROM "SalesStand" WHERE id = $1`, [id]);
            return result.rows[0];
        }
        catch (error) {
            console.error(`Fehler beim Abrufen des Verkaufsstandes mit ID ${id}:`, error);
            throw error;
        }
    }
    static async recordSale(salesStandId, revenue) {
        try {
            const salesStand = await getPool().query(`SELECT * FROM "SalesStand" WHERE id = $1`, [salesStandId]);
            const salesPersonId = salesStand.rows[0]?.sales_person;
            //Ist überhaupt ne Person zugewiesen ??
            if (!salesPersonId) {
                throw new Error("Es muss ein Verkäufer zugewiesen werden, um Verkäufe zu erzielen.");
            }
            // Ist die Person eine SalesPerson??
            const staff = await getPool().query(`SELECT * FROM "Staff" WHERE id = $1`, [salesPersonId]);
            const staffRole = staff.rows[0]?.role;
            if (staffRole !== "Salesperson") {
                throw new Error("Der zugewiesene Mitarbeiter ist kein Verkäufer.");
            }
            await getPool().query(`UPDATE "SalesStand" SET revenue_per_day = revenue_per_day + $1 WHERE id = $2`, [revenue, salesStandId]);
            const zoo = await getPool().query(`SELECT * FROM "Zoo"`);
            const zooAccount = zoo.rows[0]?.account;
            if (zooAccount !== undefined) {
                const updatedAccount = zooAccount + revenue;
                await getPool().query(`UPDATE "Zoo" SET account = $1`, [
                    updatedAccount,
                ]);
            }
            return { message: "Verkauf erfolgreich registriert." };
        }
        catch (error) {
            console.error("Fehler beim Registrieren des Verkaufs:", error);
            throw error;
        }
    }
}
