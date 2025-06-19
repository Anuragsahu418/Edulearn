import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"), // admin only
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  filename: text("filename").notNull(),
  filePath: text("file_path").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  subject: text("subject").notNull(),
  marks: decimal("marks", { precision: 5, scale: 2 }).notNull(),
  maxMarks: decimal("max_marks", { precision: 5, scale: 2 }).notNull(),
  testDate: timestamp("test_date").notNull(),
  enteredBy: integer("entered_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const materialsRelations = relations(materials, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [materials.uploadedBy],
    references: [users.id],
  }),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  student: one(students, {
    fields: [scores.studentId],
    references: [students.id],
  }),
  enteredBy: one(users, {
    fields: [scores.enteredBy],
    references: [users.id],
  }),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  scores: many(scores),
}));

export const usersRelations = relations(users, ({ many }) => ({
  uploadedMaterials: many(materials),
  enteredScores: many(scores),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  uploadedBy: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertScoreSchema = createInsertSchema(scores).omit({
  id: true,
  enteredBy: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type Score = typeof scores.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
