import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config } from "dotenv";
import {animalRouter}  from './routes/animal-routes.ts'
import pg from "pg";
import { enclosureRouter } from "./routes/enclosure-routes.ts";
import { staffRouter } from "./routes/staff-routes.ts";
import { salesRouter } from "./routes/sales-routes.ts";
import {cors}  from 'hono/cors'
const { Pool } = pg; 
config();
const pool = new Pool({ ssl: { rejectUnauthorized: false } });
const app = new Hono();
app.use('*',cors());
app.route('/animals',animalRouter);
app.route('/enclosures',enclosureRouter);
app.route('/staffs',staffRouter);
app.route('/sales',salesRouter);
serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
