import { users, materials, students, scores, systemSettings, type User, type InsertUser, type Material, type InsertMaterial, type Student, type InsertStudent, type Score, type InsertScore, type SystemSetting, type InsertSystemSetting } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Material methods
  getMaterials(): Promise<Material[]>;
  getMaterialsBySubject(subject: string): Promise<Material[]>;
  getMaterial(id: number): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial & { uploadedBy: number }): Promise<Material>;
  deleteMaterial(id: number): Promise<void>;
  
  // Student methods
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByName(name: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  
  // Score methods
  getScores(): Promise<(Score & { studentName: string })[]>;
  getScoresByStudent(studentId: number): Promise<Score[]>;
  getScoresBySubject(subject: string): Promise<(Score & { studentName: string })[]>;
  createScore(score: InsertScore & { enteredBy: number }): Promise<Score>;
  
  // System settings
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  setSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getMaterials(): Promise<Material[]> {
    return await db.select().from(materials).orderBy(desc(materials.createdAt));
  }

  async getMaterialsBySubject(subject: string): Promise<Material[]> {
    return await db.select().from(materials).where(eq(materials.subject, subject)).orderBy(desc(materials.createdAt));
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material || undefined;
  }

  async createMaterial(material: InsertMaterial & { uploadedBy: number }): Promise<Material> {
    const [newMaterial] = await db
      .insert(materials)
      .values(material)
      .returning();
    return newMaterial;
  }

  async deleteMaterial(id: number): Promise<void> {
    await db.delete(materials).where(eq(materials.id, id));
  }

  async getStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(students.name);
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudentByName(name: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.name, name));
    return student || undefined;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db
      .insert(students)
      .values(student)
      .returning();
    return newStudent;
  }

  async getScores(): Promise<(Score & { studentName: string })[]> {
    const result = await db
      .select({
        id: scores.id,
        studentId: scores.studentId,
        subject: scores.subject,
        marks: scores.marks,
        maxMarks: scores.maxMarks,
        testDate: scores.testDate,
        enteredBy: scores.enteredBy,
        createdAt: scores.createdAt,
        studentName: students.name,
      })
      .from(scores)
      .leftJoin(students, eq(scores.studentId, students.id))
      .orderBy(desc(scores.testDate));
    
    return result as (Score & { studentName: string })[];
  }

  async getScoresByStudent(studentId: number): Promise<Score[]> {
    return await db.select().from(scores).where(eq(scores.studentId, studentId)).orderBy(desc(scores.testDate));
  }

  async getScoresBySubject(subject: string): Promise<(Score & { studentName: string })[]> {
    const result = await db
      .select({
        id: scores.id,
        studentId: scores.studentId,
        subject: scores.subject,
        marks: scores.marks,
        maxMarks: scores.maxMarks,
        testDate: scores.testDate,
        enteredBy: scores.enteredBy,
        createdAt: scores.createdAt,
        studentName: students.name,
      })
      .from(scores)
      .leftJoin(students, eq(scores.studentId, students.id))
      .where(eq(scores.subject, subject))
      .orderBy(desc(scores.testDate));
    
    return result as (Score & { studentName: string })[];
  }

  async createScore(score: InsertScore & { enteredBy: number }): Promise<Score> {
    const [newScore] = await db
      .insert(scores)
      .values(score)
      .returning();
    return newScore;
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting || undefined;
  }

  async setSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const [existingSetting] = await db.select().from(systemSettings).where(eq(systemSettings.key, setting.key));
    
    if (existingSetting) {
      const [updatedSetting] = await db
        .update(systemSettings)
        .set({ value: setting.value, updatedAt: new Date() })
        .where(eq(systemSettings.key, setting.key))
        .returning();
      return updatedSetting;
    } else {
      const [newSetting] = await db
        .insert(systemSettings)
        .values(setting)
        .returning();
      return newSetting;
    }
  }
}

export const storage = new DatabaseStorage();
