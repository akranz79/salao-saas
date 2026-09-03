import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

function id() {
  return text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
}

function timestamps() {
  return {
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  };
}

// ---- Tenant ----
export const salons = sqliteTable("salons", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  openTime: text("open_time").notNull().default("09:00"),
  closeTime: text("close_time").notNull().default("19:00"),
  ...timestamps(),
});

// ---- Users (staff/owners who log in) ----
export const users = sqliteTable("users", {
  id: id(),
  salonId: text("salon_id")
    .notNull()
    .references(() => salons.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["owner", "staff"] })
    .notNull()
    .default("staff"),
  ...timestamps(),
});

// ---- Professionals (people who perform services; may or may not have a login) ----
export const professionals = sqliteTable("professionals", {
  id: id(),
  salonId: text("salon_id")
    .notNull()
    .references(() => salons.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  specialty: text("specialty"),
  commissionPct: real("commission_pct").notNull().default(40),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps(),
});

// ---- Services offered ----
export const services = sqliteTable("services", {
  id: id(),
  salonId: text("salon_id")
    .notNull()
    .references(() => salons.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  durationMin: integer("duration_min").notNull().default(30),
  price: real("price").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps(),
});

// ---- Clients ----
export const clients = sqliteTable("clients", {
  id: id(),
  salonId: text("salon_id")
    .notNull()
    .references(() => salons.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  birthday: text("birthday"), // YYYY-MM-DD
  notes: text("notes"),
  ...timestamps(),
});

// ---- Appointments ----
export const appointments = sqliteTable("appointments", {
  id: id(),
  salonId: text("salon_id")
    .notNull()
    .references(() => salons.id, { onDelete: "cascade" }),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  professionalId: text("professional_id")
    .notNull()
    .references(() => professionals.id, { onDelete: "cascade" }),
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  startAt: text("start_at").notNull(), // ISO datetime
  endAt: text("end_at").notNull(),
  price: real("price").notNull().default(0),
  status: text("status", {
    enum: ["scheduled", "completed", "cancelled", "no_show"],
  })
    .notNull()
    .default("scheduled"),
  notes: text("notes"),
  ...timestamps(),
});

// ---- Products / Inventory ----
export const products = sqliteTable("products", {
  id: id(),
  salonId: text("salon_id")
    .notNull()
    .references(() => salons.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sku: text("sku"),
  unit: text("unit").notNull().default("un"),
  costPrice: real("cost_price").notNull().default(0),
  salePrice: real("sale_price").notNull().default(0),
  stockQty: real("stock_qty").notNull().default(0),
  minStockQty: real("min_stock_qty").notNull().default(0),
  ...timestamps(),
});

export const stockMovements = sqliteTable("stock_movements", {
  id: id(),
  salonId: text("salon_id")
    .notNull()
    .references(() => salons.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["in", "out"] }).notNull(),
  quantity: real("quantity").notNull(),
  reason: text("reason"),
  ...timestamps(),
});

// ---- Financial transactions ----
export const transactions = sqliteTable("transactions", {
  id: id(),
  salonId: text("salon_id")
    .notNull()
    .references(() => salons.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  date: text("date").notNull(), // YYYY-MM-DD
  appointmentId: text("appointment_id").references(() => appointments.id, {
    onDelete: "set null",
  }),
  professionalId: text("professional_id").references(
    () => professionals.id,
    { onDelete: "set null" }
  ),
  ...timestamps(),
});
