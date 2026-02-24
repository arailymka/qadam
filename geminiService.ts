
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Language, SubmissionResult, StudentSubmission, IndividualAuditResult } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private readonly MAX_CHARS = 30000;

  constructor() {
    // Use GEMINI_API_KEY as primary, fallback to API_KEY
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  private truncate(text: string): string {
    if (text.length <= this.MAX_CHARS) return text;
    return text.substring(0, this.MAX_CHARS) + "... [Content truncated]";
  }

  async gradeAssignment(
    assignmentDescription: string,
    fileData: string, 
    fileName: string,
    lang: Language,
    maxPoints: number = 100
  ): Promise<SubmissionResult> {
    const parts = fileData.split(',');
    const mimeType = fileData.split(';')[0].split(':')[1] || 'application/octet-stream';
    const base64Data = parts.length > 1 ? parts[1] : fileData;

    const prompt = `
      You are an expert Informatics Professor at KazNPU. 
      Analyze and grade this student's submission.
      
      Assignment Criteria: ${this.truncate(assignmentDescription)}
      Max Points: ${maxPoints}
      File Name: ${fileName}

      Strict Evaluation:
      1. Check topic relevance. If it's completely off-topic, grade is 0.
      2. Check every point of the criteria.
      3. Output language: ${lang === Language.KK ? 'Kazakh' : lang === Language.RU ? 'Russian' : 'English'}.
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: prompt },
        { inlineData: { data: base64Data, mimeType } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grade: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            criteriaAdherence: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["grade", "feedback", "criteriaAdherence", "strengths", "weaknesses", "suggestions"]
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("JSON parse error in gradeAssignment", e);
      return {
        grade: 0,
        feedback: "Error parsing AI response",
        strengths: [],
        weaknesses: [],
        suggestions: [],
        criteriaAdherence: "Unknown"
      };
    }
  }

  async checkPlagiarism(
    fileData: string, 
    otherSubmissions: { email: string, data: string }[] = []
  ): Promise<{ score: number, similarEmail?: string }> {
    const parts = fileData.split(',');
    const mimeType = fileData.split(';')[0].split(':')[1] || 'application/octet-stream';
    const base64Data = parts.length > 1 ? parts[1] : fileData;

    const context = otherSubmissions.slice(0, 5).map(s => ({
      email: s.email,
      content: this.truncate(atob(s.data.split(',')[1] || ""))
    }));

    const prompt = `
      Act as a Plagiarism Detection System for Academic Integrity.
      Analyze the attached student work for stylistic originality and common patterns.
      
      Comparison Context (other students' work):
      ${JSON.stringify(context)}

      Task:
      1. Calculate a percentage of ORIGINALITY (100 = unique, 0 = copy).
      2. If the work is very similar to one of the students in the context (originality < 70%), identify that student's email.
      
      Respond only with a JSON object: { "originalityScore": number, "similarEmail": string | null }
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: prompt },
        { inlineData: { data: base64Data, mimeType } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalityScore: { type: Type.NUMBER },
            similarEmail: { type: Type.STRING, nullable: true }
          },
          required: ["originalityScore"]
        }
      }
    });

    try {
      const data = JSON.parse(response.text || '{"originalityScore": 100}');
      return {
        score: data.originalityScore,
        similarEmail: data.similarEmail || undefined
      };
    } catch (e) {
      return { score: 100 };
    }
  }

  async performIndividualAudit(
    studentName: string,
    taskTitle: string,
    criteria: string,
    fileData: string,
    lang: Language
  ): Promise<IndividualAuditResult> {
    const parts = fileData.split(',');
    const mimeType = fileData.split(';')[0].split(':')[1] || 'application/octet-stream';
    const base64Data = parts.length > 1 ? parts[1] : fileData;

    const prompt = `
      Act as a strict Academic Inspector at KazNPU Informatics Department. 
      Perform a PERSONAL detailed audit for student "${studentName}" on the task "${taskTitle}".
      
      Mandatory Professor's Criteria: ${this.truncate(criteria)}
      
      Analyze strictly and personally:
      1. Reference the student by name (${studentName}) in the critique.
      2. Identify specific points from the criteria that were MISSED or MET.
      3. Provide an overall adherence percentage.

      Output strictly in ${lang === Language.KK ? 'Kazakh' : lang === Language.RU ? 'Russian' : 'English'}.
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: prompt },
        { inlineData: { data: base64Data, mimeType } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adherenceScore: { type: Type.NUMBER },
            topicMatch: { type: Type.BOOLEAN },
            missingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            metPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            detailedCritique: { type: Type.STRING }
          },
          required: ["adherenceScore", "topicMatch", "missingPoints", "metPoints", "detailedCritique"]
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("JSON parse error in performIndividualAudit", e);
      return {
        adherenceScore: 0,
        topicMatch: false,
        missingPoints: ["Error parsing AI response"],
        metPoints: [],
        detailedCritique: "The AI was unable to generate a valid audit report."
      };
    }
  }

  async generateGroupSummary(
    assignmentTitle: string,
    criteria: string,
    submissions: StudentSubmission[],
    lang: Language
  ) {
    const data = submissions.slice(0, 50).map(s => ({
      name: s.studentName,
      grade: s.aiResult?.grade,
      adherence: s.aiResult?.criteriaAdherence
    }));

    const prompt = `
      Summarize group performance for: "${assignmentTitle}" based on criteria: ${this.truncate(criteria)}.
      Do NOT include any student names in rankings. Focus on general trends, common mistakes, and feedback.
      Student Data: ${JSON.stringify(data)}
      Output language: ${lang === Language.KK ? 'Kazakh' : lang === Language.RU ? 'Russian' : 'English'}.
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            commonErrors: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.STRING }
          },
          required: ["summary", "commonErrors", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  }

  async generateSyllabus(courseName: string, lang: Language) {
    const langName = lang === Language.KK ? 'Kazakh' : lang === Language.RU ? 'Russian' : 'English';
    const prompt = `Create a 15-week syllabus for "${courseName}" at KazNPU in ${langName}.`;
    
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            courseName: { type: Type.STRING },
            description: { type: Type.STRING },
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["week", "title", "description"]
              }
            }
          },
          required: ["id", "courseName", "description", "topics"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  }

  async generateLecture(topic: string, lang: Language): Promise<string> {
    const langName = lang === Language.KK ? 'Kazakh' : lang === Language.RU ? 'Russian' : 'English';
    const prompt = `Write a detailed academic lecture for Informatics university students on the topic: "${topic}" in ${langName}. Formatting: Markdown.`;
    
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "";
  }

  async generateTest(topic: string, count: number, variants: number, lang: Language) {
    const langName = lang === Language.KK ? 'Kazakh' : lang === Language.RU ? 'Russian' : 'English';
    const prompt = `Generate ${count} MCQs for ${topic} with ${variants} options in ${langName}.`;
    
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.NUMBER }
            },
            required: ["question", "options", "correctAnswer"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  }

  async editImage(base64Image: string, prompt: string): Promise<string | null> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/png' } },
          { text: prompt }
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  }
}
