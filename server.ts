import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "db.json");

// Initial DB structure
const initialDb = {
  groups: [],
  subjects: [],
  tasks: [],
  submissions: [],
  professors: [],
  tests: [],
  testResults: [],
  syllabuses: [],
  lectures: []
};

// Helper to load DB
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error loading DB:", e);
  }
  return initialDb;
}

// Helper to save DB
function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error saving DB:", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  let db = loadDb();

  // API Routes
  app.get("/api/db", (req, res) => {
    res.json(db);
  });

  app.post("/api/save", (req, res) => {
    const { key, data } = req.body;
    if (db.hasOwnProperty(key)) {
      (db as any)[key] = data;
      saveDb(db);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid key" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
