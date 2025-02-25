

-- Erstelle die ENUM-Typen
CREATE type health AS ENUM (
  'healthy',
  'sick',
  'dead'
);

CREATE type role AS ENUM (
  'Veterinarian',
  'Zookeeper',
  'Salesperson',
  'Employee'
);

-- Erstelle die Staff-Tabelle
CREATE TABLE "Staff" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar,
  "salary" numeric,
  "role" role
);

-- Erstelle die Enclosure-Tabelle
CREATE TABLE "Enclosure" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar,
  "costs" numeric
);

-- Erstelle die SalesStand-Tabelle
CREATE TABLE "SalesStand" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar,
  "sales_category" varchar,
  "revenue_per_day" numeric,
  "sales_person_id" int,
  FOREIGN KEY ("sales_person_id") REFERENCES "Staff" ("id")
);

-- Erstelle die Donations-Tabelle
CREATE TABLE "Donations" (
  "id" SERIAL PRIMARY KEY,
  "person_name" varchar,
  "amount" numeric,
  "date" Date,
  "pdf_url" varchar
);

-- Erstelle die Zoo-Tabelle
CREATE TABLE "Zoo" (
  "id" SERIAL PRIMARY KEY,
  "account" numeric,
  "entry_price" numeric
);

-- Erstelle die Animal-Tabelle
CREATE TABLE "Animal" (
  "id" SERIAL PRIMARY KEY,
  "breed" varchar,
  "name" varchar,
  "birthday" Date,
  "gender" boolean,
  "health" health,
  "vet_id" int NOT NULL,
  "enclosure_id" int NOT NULL,
  FOREIGN KEY ("vet_id") REFERENCES "Staff" ("id"),
  FOREIGN KEY ("enclosure_id") REFERENCES "Enclosure" ("id")
);

-- Erstelle die Enclosure_Staff-Tabelle
CREATE TABLE "Enclosure_Staff" (
  "id" SERIAL PRIMARY KEY,
  "enclosure_id" int NOT NULL,
  "staff_id" int,
  FOREIGN KEY ("enclosure_id") REFERENCES "Enclosure" ("id"),
  FOREIGN KEY ("staff_id") REFERENCES "Staff" ("id")
);

-- Erstelle die TurnOver-Tabelle
CREATE TABLE "TurnOver" (
  "id" SERIAL PRIMARY KEY,
  "date" Date,
  "stand_id" int,
  "donation_id" int,
  FOREIGN KEY ("stand_id") REFERENCES "SalesStand" ("id"),
  FOREIGN KEY ("donation_id") REFERENCES "Donations" ("id")
);