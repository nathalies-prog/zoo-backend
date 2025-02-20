import { faker, fakerDE } from '@faker-js/faker';
import { getClient } from '../src/db/db.ts';
import type { QueryConfig } from 'pg';
import { PGDATABASE_STRING, PGHOST_STRING, PGPASSWORD_STRING, PGUSER_STRING } from '../src/constants.ts';

const NUMBER_STAFF = 100;
const NUMBER_ANIMALS = 20;
const NUMBER_SALESTANDS = 5;
const NUMBER_ENCLOSURES = 10;
const MAX_TRYS = 3000;
const SALES_CATEGORIES = [
  'Snacks',
  'Souvenirs',
  'Tickets',
  'Merchandise',
];

const ROLES = [
  'Veterinarian',
  'Zookeeper',
  'Salesperson',
  'Employee',
];
async function generateStaffAndSeed(db: any, n: number) {
  let staff: any[] = [];
  for (let i = 0; i < n; i++) {
    const firstName = fakerDE.person.firstName();
    const lastName = fakerDE.person.lastName();
    const role = ROLES[Math.floor(Math.random() * ROLES.length)];
    staff.push({
      name: firstName,
      salary: fakerDE.finance.amount(),
      role: role,
    });
  }

  const staffValues = staff.flatMap((s) => [s.name, s.salary, s.role]);
  const staffPlaceholders = staff
    .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
    .join(',');
  const staffQuery: QueryConfig = {
    text: `INSERT INTO "Staff" (name, salary, role) VALUES ${staffPlaceholders}`,
    values: staffValues,
  };

  await db.query(staffQuery);
  console.info('🔑 Staff data seeded!');
  return staff;  // Return the generated staff for later use
}
async function generateEnclosuresAndSeed(db: any, number: number) {
  // Zuerst alle Tierpfleger aus der Datenbank holen (mit der Rolle 'Tierpfleger')
  const staffQuery: QueryConfig = {
    text: `SELECT * FROM "Staff" WHERE role = 'Zookeeper'`,  // Stelle sicher, dass die Rolle stimmt
  };
  const staffResult = await db.query(staffQuery);
  const staff = staffResult.rows;

  if (staff.length === 0) {
    console.error("No staff found with role 'Tierpfleger'.");
    return [];
  }

  const enclosures: any[] = [];
  const enclosureStaffAssignments: any[] = []; // Hier speichern wir die Zuordnungen für ENCLOSURE_STAFF
  let staffEnclosureCount: Map<number, number> = new Map(); // Zählt, wie viele Gehege jeder Tierpfleger betreut

  // Sicherstellen, dass jedes Gehege mindestens einen Tierpfleger zugewiesen bekommt
  for (let i = 0; i < number; i++) {
    const name = fakerDE.animal.type() + 'Haus';
    const costs = fakerDE.finance.amount({
      min: 1000,
      max: 5000,
      dec: 2,
    });

    let staff_id: number = -1;
    let tries = 0;

    // Zuweisung eines Tierpflegers, der weniger als 3 Gehege betreut
    while (tries < MAX_TRYS) {
      // Wähle zufällig einen Tierpfleger aus, der weniger als 3 Gehege betreut
      staff_id = staff[Math.floor(Math.random() * staff.length)].id;

      if ((staffEnclosureCount.get(staff_id) || 0) < 3) {
        staffEnclosureCount.set(staff_id, (staffEnclosureCount.get(staff_id) || 0) + 1);
        break;
      }

      tries++;
    }

    if (tries === MAX_TRYS) {
      console.error(`Couldn't assign staff for enclosure ${name} after ${MAX_TRYS} tries.`);
    }

    // Gehege hinzufügen
    enclosures.push({
      name,
      costs,
    });

    // Zuordnung von Gehege zu Personal für ENCLOSURE_STAFF
    enclosureStaffAssignments.push({
      staff_id,
    });
  }

  // Hier fügen wir jetzt das Gehege in die Datenbank ein
  const enclosureValues = enclosures.flatMap((e) => [e.name, e.costs]);
  const enclosurePlaceholders = enclosures
    .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
    .join(',');
  const enclosureQuery: QueryConfig = {
    text: `INSERT INTO "Enclosure" (name, costs) VALUES ${enclosurePlaceholders} RETURNING id`,
    values: enclosureValues,
  };

  // Die IDs der neuen Gehege erhalten
  const res = await db.query(enclosureQuery);
  console.log('⛺️ Enclosures seeded!');
  const enclosureIds = res.rows.map((row: any) => row.id);

  // Jetzt müssen wir die Zuordnungen zu "Enclosure_Staff" einfügen
  const enclosureStaffValues = enclosureStaffAssignments.flatMap((assignment, i) => [
    enclosureIds[i],  // Die ID des Geheges aus der Antwort
    assignment.staff_id,
  ]);
  const enclosureStaffPlaceholders = enclosureStaffAssignments
    .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
    .join(',');
  const enclosureStaffQuery: QueryConfig = {
    text: `INSERT INTO "Enclosure_Staff" (enclosure_id, staff_id) VALUES ${enclosureStaffPlaceholders}`,
    values: enclosureStaffValues,
  };

  await db.query(enclosureStaffQuery);
  console.info('🧑‍⚕️ Enclosure staff assignments seeded!');

  return { enclosures, enclosureStaffAssignments };
}
async function generateAnimalsAndSeed(db: any, n: number) {
  // Hole Tierärzte aus der Datenbank (rolle = 'Veterinarian')
  const veterinarianQuery: QueryConfig = {
    text: `SELECT * FROM "Staff" WHERE role = $1`,
    values: ['Veterinarian'],
  };

  const veterinariansResult = await db.query(veterinarianQuery);
  const veterinarians = veterinariansResult.rows;

  if (veterinarians.length === 0) {
    console.error("No veterinarians found in the staff.");
    return [];
  }

  const animals: any[] = [];
  let vetCounts: Map<number, number> = new Map();

  // Hole die Gehege-IDs aus der Enclosure-Tabelle
  const enclosureQuery = `SELECT id FROM "Enclosure"`;
  const enclosureResult = await db.query(enclosureQuery);
  const enclosureIds = enclosureResult.rows.map((row: any) => row.id);


  for (let i = 0; i < n; i++) {
    const breed = fakerDE.animal.type();
    const name = fakerDE.animal.petName();
    const gender = Math.random() > 0.5;
    let vet_id: number;

    // Zuweisung des Tierarztes
    while (true) {
      const vet = veterinarians[Math.floor(Math.random() * veterinarians.length)];
      vet_id = vet.id;

      // Überprüfen, ob der Tierarzt weniger als 25 Tiere betreut
      if ((vetCounts.get(vet_id) || 0) < 25) {
        vetCounts.set(vet_id, (vetCounts.get(vet_id) || 0) + 1);
        break;
      }
    }

    // Wähle ein zufälliges Gehege aus den existierenden Gehegen
    const enclosure_id = enclosureIds[Math.floor(Math.random() * enclosureIds.length)];

    // Tierdaten hinzufügen
    animals.push({
      breed,
      name,
      birthday: fakerDE.date.past({ years: 5 }).toISOString().split('T')[0],
      gender,
      health: ['healthy', 'sick'][Math.floor(Math.random() * 2)],
      vet_id,
      enclosure_id,
    });
  }

  // Tiere in die Datenbank einfügen
  const animalValues = animals.flatMap((a) => [
    a.breed,
    a.name,
    a.birthday,
    a.gender,
    a.health,
    a.vet_id,
    a.enclosure_id,
  ]);
  const animalPlaceholders = animals
    .map((_, i) => `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`)
    .join(',');
  const animalQuery: QueryConfig = {
    text: `INSERT INTO "Animal" (breed, name, birthday, gender, health, vet_id, enclosure_id) VALUES ${animalPlaceholders}`,
    values: animalValues,
  };

  await db.query(animalQuery);
  console.info('🐾 Animals data seeded!');

  return animals;
}


async function generateSalesStandsAndSeed(db: any, n: number) {
  let stands: any[] = [];
    // Hole die Gehege-IDs aus der Enclosure-Tabelle
    const staffQuery = `SELECT id FROM "Staff" WHERE role = 'Salesperson'`;
    const res = await db.query(staffQuery);
    const sales = res.rows.map((row: any) => row.id);
  for (let i = 0; i < n; i++) {
    stands.push({
      name: fakerDE.company.name(),
      sales_category: SALES_CATEGORIES[Math.floor(Math.random() * SALES_CATEGORIES.length)],
      revenue_per_day: fakerDE.finance.amount(),
      sales_person_id: sales[Math.floor(Math.random() * sales.length)] ,
    });
  }

  const salesStandValues = stands.flatMap((s) => [s.name, s.sales_category, s.revenue_per_day, s.sales_person_id]);
  const salesStandPlaceholders = stands
    .map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`)
    .join(',');
  const salesStandQuery: QueryConfig = {
    text: `INSERT INTO "SalesStand" (name, sales_category, revenue_per_day, sales_person_id) VALUES ${salesStandPlaceholders}`,
    values: salesStandValues,
  };

  await db.query(salesStandQuery);
  console.info('🛍️ Sales stands data seeded!');

  return stands;
}async function seed() {
  try {
    const db = getClient();
    await db.connect();
    console.info('🔌 Connected to the Database.');

    // Generate and seed staff
    const staff = await generateStaffAndSeed(db, NUMBER_STAFF);

    // Generate and seed enclosures
    await generateEnclosuresAndSeed(db, NUMBER_ENCLOSURES);


    // Generate and seed animals
    const animals = await generateAnimalsAndSeed(db, NUMBER_ANIMALS);

    // Generate and seed sales stands
    const salesStands = await generateSalesStandsAndSeed(db, NUMBER_SALESTANDS);

    console.info('✅ Seeding successful!');
  } catch (error) {
    console.error('🚨 Seeding failed. error:', error);
  }
}

seed();
