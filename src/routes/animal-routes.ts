import { Hono } from "hono";
import { AnimalController } from "../controller/animal-controller.js";
import type { Animal } from "../types.ts";
import { getPool } from "../db/db.js";
import { HTTPException } from "hono/http-exception";

export const animalRouter = new Hono();

animalRouter.get("/", async (c) => {
  try {
    const animals = await AnimalController.getAllAnimals();
    return c.json({animals},200);
  } catch (error) {
    return c.status(500);
  }
});
animalRouter.get("/:id", async (c) => {
  const { id } = c.req.param();
  try {
    const animal = await AnimalController.getAnimalByID(id);
    return c.json({animal},200);
  } catch (error) {
    return c.json({
      error: `Etwas ist schief gelaufen beim Aufrufen des Tieres mit ID: ${id}.`,
    });
  }
});

animalRouter.post("/insertAnimal", async (c) => {
  const { breed, name, birthday, gender, health, vet_id, enclosure_id } =
    await c.req.json();

  try {
    const vetIdNum = parseInt(vet_id);
    const enclosureIdNum = parseInt(enclosure_id);

    if (isNaN(vetIdNum) || isNaN(enclosureIdNum)) {
      throw new Error("Vet ID und Enclosure ID müssen gültige Zahlen sein.");
    }

    const birthdayDate = new Date(birthday);
    let _gender: boolean;
    gender === "false" ? (_gender = false) : (_gender = true);
    const animal: Animal = {
      breed,
      name,
      birthday: birthdayDate,
      gender: _gender,
      health,
      vet_id: vetIdNum,
      enclosure_id: enclosureIdNum,
    };

    const result = await AnimalController.insertAnimal(animal);

    return c.json(
      {
        message: "Tier erfolgreich erstellt!",
        data: result,
      },
      201
    );
  } catch (error) {
    console.error("Fehler beim Erstellen des Tieres:", error);
    return c.json({
      message: "Fehler beim Erstellen des Tieres.",
    });
  }
});
animalRouter.patch("/:id", async (c) => {
  const { id } = c.req.param();
  const { breed, name, birthday, gender, health, vet_id, enclosure_id } =
    await c.req.json();
  const existingAnimal = AnimalController.getAnimalByID(id);
  if (!existingAnimal)
    return c.json({ message: `Tier wurde nicht gefunden.` }, 404);
  const updateAnimal = {
    breed,
    name,
    birthday,
    gender,
    health,
    vet_id,
    enclosure_id,
  };
  try {
    const result = await AnimalController.updateAnimal(updateAnimal, id);
    return c.json({ message: "Tier erfolgreich aktualisiert.", result }, 200);
  } catch (error) {
    return c.json(
      { message: "Fehler beim Aktualisieren des Tieres.", error },
      500
    );
  }
});
animalRouter.delete("/:id", async (c) => {
  const { id } = c.req.param();
  try {
    const result = await AnimalController.deleteAnimal(id);
    return c.json({ message: `Tier ${id} wurde erfolgreich gelöscht` }, 200);
  } catch (error) {
    return c.json({ message: `Fehler beim Löschen des Tieres ${id}` }, 500);
  }
});
animalRouter.post('/:id/assign-enclosure', async (c) => {
  const animalId = Number(c.req.param("id"));
  if (isNaN(animalId)) {
    throw new HTTPException(400, {
      message: "Tier Id muss Type Integer sein",
    });
  }

  const animalQueryResult = await getPool().query(
    'SELECT * FROM "Animal" WHERE Id = $1',
    [animalId]
  );
  if (animalQueryResult.rowCount === 0) {
    throw new HTTPException(404, {
      message: `Tier mit Id: ${animalId} existiert nicht!`,
    });
  }

  const compoundId = Number(c.req.query("compoundId"));
  if (isNaN(compoundId)) {
    throw new HTTPException(400, {
      message:
        "Gehege_id ist kein Type Integer",
    });
  }
  const compoundQueryResult = await getPool().query(
    'SELECT * FROM "Enclosure" WHERE Id = $1',
    [compoundId]
  );
  if (compoundQueryResult.rowCount === 0) {
    throw new HTTPException(404, {
      message: `Gehege mit id ${compoundId} existiert nicht!`,
    });
  }
  const zookeeperInEnclosure = await getPool().query(`SELECT staff_id FROM "Enclosure_Staff" WHERE staff_id `);
  if(zookeeperInEnclosure.rows.length === 0){
    throw new HTTPException(404,{
      message: 'Gehege hat keinen Pfleger und kann dadurch nicht genutzt werden.'
    })
  }
  const updateResult = await getPool().query(
    'UPDATE "Animal" SET enclosure_id = $1 WHERE id = $2 RETURNING *',
    [compoundId, animalId]
  );

  return c.json(updateResult.rows);
});
