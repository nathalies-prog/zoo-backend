import { Hono } from "hono";
import { DonationController } from "../controller/donation-controller.ts";

const donationRouter = new Hono();

donationRouter.post("/insertDonation", async (c) => {
    const { person_name, amount, date, pdf_url } = await c.req.json();
  
    // Überprüfen, ob pdf_url null ist
    const donationData = {
      person_name,
      amount,
      date,
      pdf_url: pdf_url || null, // Falls pdf_url nicht angegeben wird, setzen wir es auf null
    };
  
    try {
      // An dieser Stelle kannst du die Logik zum Speichern der Daten implementieren
      await DonationController.insertDonation(donationData);
      return c.json({ message: "Donation inserted successfully" }, 201);
    } catch (error) {
      return c.json({ error: "Failed to insert donation" }, 500);
    }
  });