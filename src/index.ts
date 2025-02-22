import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config } from "dotenv";
import {animalRouter}  from './routes/animal-routes.js'
import pg from "pg";
import { enclosureRouter } from "./routes/enclosure-routes.js";
import { staffRouter } from "./routes/staff-routes.js";
import { salesRouter } from "./routes/sales-routes.js";
import {cors}  from 'hono/cors'
import { donationRouter } from "./routes/donation-routes.js";
const { Pool } = pg; 
config();
const pool = new Pool({ ssl: { rejectUnauthorized: false } });
const app = new Hono();
app.use('*',cors());

app.get('/', (c) => {
  return c.text('Hello from Zoo BACKEND!🦎');
});
app.route('/animals',animalRouter);
app.route('/enclosures',enclosureRouter);
app.route('/staffs',staffRouter);
app.route('/sales',salesRouter);
app.route('/donations',donationRouter);
serve({ fetch: app.fetch, port: 8080 }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
