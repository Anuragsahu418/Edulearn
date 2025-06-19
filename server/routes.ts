import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertMaterialSchema, insertStudentSchema, insertScoreSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Initialize default student secret key if not set
  const defaultSecretKey = process.env.STUDENT_SECRET_KEY || "artlearn2024";
  const existingSecret = await storage.getSystemSetting("student_secret_key");
  if (!existingSecret) {
    await storage.setSystemSetting({
      key: "student_secret_key",
      value: defaultSecretKey
    });
  }

  // Student access validation
  app.post("/api/student/validate", async (req, res) => {
    try {
      const { secretKey } = req.body;
      const storedSecret = await storage.getSystemSetting("student_secret_key");
      
      if (!storedSecret || secretKey !== storedSecret.value) {
        return res.status(401).json({ message: "Invalid secret key" });
      }
      
      res.json({ valid: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Materials routes
  app.get("/api/materials", async (req, res) => {
    try {
      const { subject } = req.query;
      let materials;
      
      if (subject && typeof subject === "string") {
        materials = await storage.getMaterialsBySubject(subject);
      } else {
        materials = await storage.getMaterials();
      }
      
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  app.get("/api/materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const material = await storage.getMaterial(id);
      
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      res.json(material);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch material" });
    }
  });

  app.post("/api/materials", upload.single('file'), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const materialData = insertMaterialSchema.parse({
        title: req.body.title,
        subject: req.body.subject,
        description: req.body.description,
        filename: req.file.filename,
        filePath: req.file.path,
      });

      const material = await storage.createMaterial({
        ...materialData,
        uploadedBy: req.user!.id,
      });

      res.status(201).json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to upload material" });
    }
  });

  app.delete("/api/materials/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const id = parseInt(req.params.id);
      const material = await storage.getMaterial(id);
      
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }

      // Delete file from filesystem
      if (fs.existsSync(material.filePath)) {
        fs.unlinkSync(material.filePath);
      }

      await storage.deleteMaterial(id);
      res.json({ message: "Material deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete material" });
    }
  });

  // Serve uploaded files
  app.get("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    
    res.sendFile(filePath);
  });

  // Students routes
  app.get("/api/students", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  // Scores routes
  app.get("/api/scores", async (req, res) => {
    try {
      const { subject, studentId } = req.query;
      let scores;
      
      if (studentId && typeof studentId === "string") {
        scores = await storage.getScoresByStudent(parseInt(studentId));
      } else if (subject && typeof subject === "string") {
        scores = await storage.getScoresBySubject(subject);
      } else {
        scores = await storage.getScores();
      }
      
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });

  app.post("/api/scores", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const scoreData = insertScoreSchema.parse(req.body);
      const score = await storage.createScore({
        ...scoreData,
        enteredBy: req.user!.id,
      });

      res.status(201).json(score);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create score" });
    }
  });

  // System settings routes
  app.get("/api/settings/:key", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const setting = await storage.getSystemSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }

      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { value } = req.body;
      const setting = await storage.setSystemSetting({
        key: req.params.key,
        value: value,
      });

      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
