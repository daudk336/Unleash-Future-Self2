import { createInsertSchema } from "drizzle-zod";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const attendeeProfilesTable = pgTable("attendee_profiles", {
  clerkUserId: text("clerk_user_id").primaryKey(),
  preferredName: text("preferred_name"),
  timeZone: text("time_zone"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertAttendeeProfileSchema = createInsertSchema(
  attendeeProfilesTable,
).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertAttendeeProfile = typeof attendeeProfilesTable.$inferInsert;
export type AttendeeProfile = typeof attendeeProfilesTable.$inferSelect;
