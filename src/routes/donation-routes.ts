import { Hono } from "hono";
import { DonationController } from "../controller/donation-controller.js";

export const donationRouter = new Hono();

donationRouter.post("/insertDonation", async (c) => {
    const { person_name, amount, date, pdf_url } = await c.req.json();
    const donationData = {
      person_name,
      amount,
      date,
      pdf_url: pdf_url || null, 
    };
  
    try {
      await DonationController.insertDonation(donationData);
      return c.json({ message: "Spende wurde erfolgreich hinzugefügt" }, 201);
    } catch (error) {
      return c.json({ error: "Fehler beim Speichern der Spende" }, 500);
    }
  });