import { Hono } from "hono";
import type { Animal, Enclosure } from "../types.ts";
import { EnclosureController } from "../controller/enclosure-controller.js";

export const enclosureRouter = new Hono();

enclosureRouter.get("/", async (c) => {
  try {
    const enclosures = await EnclosureController.getAllEnclosures();
    return c.json({ enclosures }, 200);
  } catch (error) {
    return c.json({error},500);
  }
});
enclosureRouter.get("/:id", async (c) => {
  const { id } = c.req.param();
  try {
    const enclosure = await EnclosureController.getEnclosureByID(id);
    return c.json({ enclosure }, 200);
  } catch (error) {
    return c.json({
      error: `Etwas ist schief gelaufen beim Aufrufen des Geheges mit ID: ${id}.`,
    });
  }
});
enclosureRouter.post('/insertEnclosure', async (c) => {
    const { name, costs } = await c.req.json();
    try{
        const cost_num = parseInt(costs);
        if(isNaN(cost_num)){
            throw new Error('Die Kosten sind keine gültige Zahl.');
        }
        const newEnclosure : Enclosure = {
            name,
            costs: cost_num
        };
        const result = await EnclosureController.insertEnclosure(newEnclosure);
        return c.json({
            message: `Gehege wurde erfolgreich erstellt`,
            data: result,
        },201);
    }
    catch(error){
        return c.json({
            message: "Fehler beim Erstellen des Geheges.",
            error: error,
          });
    }
});

enclosureRouter.patch("/:id", async (c) => {
  const { id } = c.req.param();
  const { name, costs } = await c.req.json();
  const existingEnclosure = EnclosureController.getEnclosureByID(id);
  if (!existingEnclosure)
    return c.json({ message: `Gehege wurde nicht gefunden.` }, 404);
  const updateEnclosure = {
    name,
    costs,
  };
  try {
    const result = await EnclosureController.updateEnclosure(
      updateEnclosure,
      id
    );
    return c.json(
      { message: "Gehege wurde erfolgreich aktualisiert.", result },
      200
    );
  } catch (error) {
    return c.json(
      { message: "Fehler beim Aktualisieren des Geheges.", error },
      500
    );
  }
});

enclosureRouter.delete("/:id", async (c) => {
  const { id } = c.req.param();
  try {
    const result = await EnclosureController.deleteEnclosure(id);
    if (result === 405) {
      return c.json({ message: `Fehler beim Löschen des Geheges ${id}` }, 500);
    }
    return c.json(
      { message: `Gehege mit ID: ${id} wurde erfolgreich gelöscht` },
      200
    );
  } catch (error) {
    return c.json({ message: `Fehler beim Löschen des Geheges ${id}` }, 500);
  }
});
