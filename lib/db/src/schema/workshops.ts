import { createInsertSchema } from "drizzle-zod";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const workshopStatusEnum = pgEnum("workshop_status", [
  "draft",
  "published",
  "cancelled",
  "completed",
]);

export const workshopsTable = pgTable("workshops", {
  id: uuid("id").primaryKey().defaultRandom(),
  instructorClerkUserId: text("instructor_clerk_user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: workshopStatusEnum("status").notNull().default("draft"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  capacity: integer("capacity"),
  priceCents: integer("price_cents"),
  currency: varchar("currency", { length: 3 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertWorkshopSchema = createInsertSchema(workshopsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkshop = typeof workshopsTable.$inferInsert;
export type Workshop = typeof workshopsTable.$inferSelect;
