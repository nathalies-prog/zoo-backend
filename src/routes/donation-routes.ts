import { Hono } from "hono";
import { DonationController } from "../controller/donation-controller.js";

export const donationRouter = new Hono();

donationRouter.get("/", async (c) => {
  try{
    const donations = await DonationController.getAllDonations();
    return c.json({donations},200);
  }
  catch(error){
    return c.json({error:error},500);
  }
})
donationRouter.post("/insertDonation", async (c) => {
    const { person_name, amount, date, pdf_url } = await c.req.json();
    if( amount <= 0){
      return c.json({message:'Die Spende muss größer als 0€ sein.'},405)
    }
    const donationData = {
      person_name,
      amount,
      date,
      pdf_url: pdf_url || null, 
    };
  
    try {
      const res = await DonationController.insertDonation(donationData);
      if(!res){
        return c.json({message: "Irgendwas ist schief gelaufen.."},404);
      }
      return c.json({ message: "Spende wurde erfolgreich hinzugefügt" }, 201);
    } catch (error) {
      return c.json({ error: "Fehler beim Speichern der Spende" }, 500);
    }
  });