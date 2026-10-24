import { createInsertSchema } from "drizzle-zod";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { workshopRegistrationsTable } from "./workshop-registrations";

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "excused",
]);

export const workshopAttendanceTable = pgTable(
  "workshop_attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => workshopRegistrationsTable.id, { onDelete: "restrict" }),
    status: attendanceStatusEnum("status").notNull(),
    markedAt: timestamp("marked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    markedByClerkUserId: text("marked_by_clerk_user_id").notNull(),
  },
  (table) => [
    uniqueIndex("workshop_attendance_registration_unique").on(
      table.registrationId,
    ),
  ],
);

export const insertWorkshopAttendanceSchema = createInsertSchema(
  workshopAttendanceTable,
).omit({
  id: true,
  markedAt: true,
});

export type InsertWorkshopAttendance =
  typeof workshopAttendanceTable.$inferInsert;
export type WorkshopAttendance =
  typeof workshopAttendanceTable.$inferSelect;
