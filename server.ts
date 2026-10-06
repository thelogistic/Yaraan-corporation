import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini SDK with custom user agent for tracking
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "db.json");

app.use(express.json({ limit: "10mb" }));

// Helper to load or initialize db.json
async function getDBState() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(raw);
    } catch (e) {
      console.error("Error reading db.json, fallback to initialization:", e);
    }
  }

  // Fallback / Initial seed
  const {
    initialEmployees,
    initialJobOpenings,
    initialApplicants,
    initialLeaveBalances,
    initialLeaves,
    initialAttendance,
    initialPayroll,
    initialPerformanceGoals,
    initialTrainingCourses,
    initialAssets,
    initialExpenses,
    initialLoans,
    initialHelpTickets,
    initialTemplates,
    initialGeneratedDocs,
    initialAuditLogs,
  } = await import("./src/seedData.js");

  const initialState = {
    employees: initialEmployees,
    jobOpenings: initialJobOpenings,
    applicants: initialApplicants,
    leaveBalances: initialLeaveBalances,
    leaves: initialLeaves,
    attendance: initialAttendance,
    payroll: initialPayroll,
    performanceGoals: initialPerformanceGoals,
    trainingCourses: initialTrainingCourses,
    assets: initialAssets,
    expenses: initialExpenses,
    loans: initialLoans,
    helpTickets: initialHelpTickets,
    templates: initialTemplates,
    generatedDocs: initialGeneratedDocs,
    auditLogs: initialAuditLogs,
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(initialState, null, 2), "utf-8");
  return initialState;
}

// REST API routes first
app.get("/api/state", async (req, res) => {
  try {
    const db = await getDBState();
    res.json(db);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/state", async (req, res) => {
  try {
    const newState = req.body;
    fs.writeFileSync(DB_PATH, JSON.stringify(newState, null, 2), "utf-8");
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Gemini Resume Parser route
app.post("/api/gemini/parse-resume", async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: "resumeText is required" });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      // Graceful fallback if no actual key is configured
      return res.json({
        skills: ["TypeScript", "React", "Node.js", "Docker", "Database Tuning"],
        experience: "3+ years of professional full-stack development, including microservices implementation and user portal redesign.",
        recommendation: "Highly recommended candidate. Shows strong alignment with high-performance software environments.",
        warning: "Running in mock mode due to missing GEMINI_API_KEY. Configure in Secrets panel.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an expert HR resume screening parser. Please analyze the following resume text and extract key structural insights.
      
Resume text:
"""
${resumeText}
"""`,
      config: {
        systemInstruction: "Extract structural resume data. Return JSON with 'skills' as a string array, 'experience' as a concise 1-sentence string summarizing professional duration/stack, and 'recommendation' as a 1-sentence candidate screening recommendation.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Extracted skills (languages, frameworks, HR tools).",
            },
            experience: {
              type: Type.STRING,
              description: "Summary of years and quality of experience.",
            },
            recommendation: {
              type: Type.STRING,
              description: "Recommendation score and alignment suitability.",
            },
          },
          required: ["skills", "experience", "recommendation"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Resume Parser Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Gemini Document Generator route
app.post("/api/gemini/generate-letter", async (req, res) => {
  try {
    const { templateText, variables } = req.body;
    if (!templateText) {
      return res.status(400).json({ error: "templateText is required" });
    }

    let mergedText = templateText;
    if (variables) {
      Object.keys(variables).forEach((key) => {
        const value = variables[key] || `[${key}]`;
        mergedText = mergedText.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
      });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      // Graceful fallback
      return res.json({
        content: mergedText + "\n\n---\n[Notice: Polished with HR template guidelines. GEMINI_API_KEY not configured for full AI draft. Page layout pre-composed.]",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are a senior professional corporate HR executive. Please draft and elevate the formal language of the following HR letter. 
Ensure it preserves all core replaced values like names, designations, branches, dates, and numbers, but make the prose extremely polished, formal, legally compliant, and executive-level. 
Keep paragraphs balanced, add formal greeting and closing if missing, and return ONLY the final drafted letter text without markdown wrappers or code block decorations.

Base draft to elevate:
"""
${mergedText}
"""`,
    });

    res.json({ content: response.text?.trim() });
  } catch (error: any) {
    console.error("Gemini Letter Generator Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite Middleware for Dev, Static serving for Prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
