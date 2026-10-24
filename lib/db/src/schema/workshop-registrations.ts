import { createInsertSchema } from "drizzle-zod";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { attendeeProfilesTable } from "./attendee-profiles";
import { workshopsTable } from "./workshops";

export const workshopRegistrationStatusEnum = pgEnum(
  "workshop_registration_status",
  ["registered", "waitlisted", "cancelled"],
);

export const workshopRegistrationsTable = pgTable(
  "workshop_registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workshopId: uuid("workshop_id")
      .notNull()
      .references(() => workshopsTable.id, { onDelete: "restrict" }),
    attendeeClerkUserId: text("attendee_clerk_user_id")
      .notNull()
      .references(() => attendeeProfilesTable.clerkUserId, {
        onDelete: "restrict",
      }),
    status: workshopRegistrationStatusEnum("status")
      .notNull()
      .default("registered"),
    registeredAt: timestamp("registered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("workshop_registrations_workshop_attendee_unique").on(
      table.workshopId,
      table.attendeeClerkUserId,
    ),
  ],
);

export const insertWorkshopRegistrationSchema = createInsertSchema(
  workshopRegistrationsTable,
).omit({
  id: true,
  registeredAt: true,
  updatedAt: true,
});

export type InsertWorkshopRegistration =
  typeof workshopRegistrationsTable.$inferInsert;
export type WorkshopRegistration =
  typeof workshopRegistrationsTable.$inferSelect;
