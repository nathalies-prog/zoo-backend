import { Hono } from "hono";
import { StaffController } from "../controller/staff-controller.js";
import type { Staff } from "../types.ts";


export const staffRouter = new Hono();

staffRouter.get('/', async (c) => {
     try {
        const staffies = await StaffController.getAllStaffs();
        return c.json({staffies},200);
      } catch (error) {
        return c.status(500);
      }
});
staffRouter.get('/:id', async (c) => {
     const { id } = c.req.param();
      try {
        const staffi = await StaffController.getStaffByID(id);
        return c.json({staffi},200);
      } catch (error) {
        return c.json({
          error: `Etwas ist schief gelaufen beim Aufrufen des Mitarbeiters mit ID: ${id}.`,
        });
      }
})
staffRouter.post('/insertStaff', async (c) => {
    const {name, salary, role} = await c.req.json()
      try{
            const salary_num = parseInt(salary);
            if(isNaN(salary_num)){
                throw new Error('Salary ist keine gültige Zahl.');
            }
            const newStaffi : Staff = {
                name,
                salary: salary_num,
                role,
            };
            const result = await StaffController.insertStaff(newStaffi);
            return c.json({
                message: `Mitarbeiter wurde erfolgreich erstellt`,
                data: result,
            },201);
        }
        catch(error){
            return c.json({
                message: "Fehler beim Erstellen eines Mitarbeiters.",
                error: error,
              });
        }
})
staffRouter.post('/assign-staff-to-enclosure', async (c) => {
  const {enclosure_id, staff_id} = await c.req.json();
  try{
    const result = await StaffController.assignStaffToEnclosure(staff_id,enclosure_id);
    return c.json({message: `Mitarbeiter ${staff_id} wurde erfolgreich Gehege ${enclosure_id} zugewiesen.`},200)
  }
  catch(error){
    return c.json({message:'Irgendwas ist bei der Zuweisung schief gelaufen',error: error},500);
  }
})