import { Hono } from "hono";
import { SalesStandController } from "../controller/sales-controller.ts";


export const salesRouter = new Hono();

salesRouter.get('/', async (c) => {
    try{
        const salesStands = await SalesStandController.getAllSalesStands();
        return c.json({salesStands},200);
    }
    catch(error){
        return c.json({error},500);
    }
});
salesRouter.get('/:id', async (c) => {
    const {id} =  c.req.param();
    try{
        const salesStand = await SalesStandController.getSalesStandByID(id);
        return c.json({salesStand},200);
    }
    catch(error){
        return c.json({error},500);
    }
})
salesRouter.post('/record-sale', async (c) => {
    try {
        const { salesStandId, revenue } = await c.req.json();
        
        if (!salesStandId || revenue === undefined) {
            return c.json({ error: "Fehler bei der Eingabe" }, 400);
        }

        const result = await SalesStandController.recordSale(salesStandId, revenue);
        return c.json(result, 200);
    } catch (error) {
        console.error("Fehler beim Verkauf:", error);
        return c.json({ error: "Fehler beim registrieren des Verkaufs!" }, 500);
    }
});