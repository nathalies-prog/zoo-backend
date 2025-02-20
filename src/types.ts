import type { NumberModule } from "@faker-js/faker"

enum ROLES {
    'Veterinarian',
    'Zookeeper',
    'Salesperson',
    'Employee',
};

enum HEALTH {
    'healthy',
    'sick',
    'dead'
}

export type Animal = {
    id? : number,
    breed : string,
    name : string,
    birthday: Date,
    gender: boolean,
    health: HEALTH,
    vet_id: number,
    enclosure_id: number
}

export type Enclosure = {
    id? : number,
    name : string,
    costs: number
}

export type Staff = {
    id? : number,
    name : string,
    salary : number,
    role : ROLES
}
export type Donation = {
    id? : number,
    person_name : string,
    amount : number,
    date : Date,
    pdf_url : string
}

export type SalesStand = {
    id? : number,
    name : string,
    sales_category : string,
    revenue_per_day : number,
    sales_person : number
}

export type TurnOver = {
    id? : number,
    date : Date,
    stand_id : number,
    donation_id : number
}
export type Zoo = {
    id? : number,
    account : number,
    entry_price : number
}