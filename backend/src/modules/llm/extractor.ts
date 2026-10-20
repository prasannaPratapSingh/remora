import OpenAI from "openai";
import envConfig from "../../config/envConfig";
import type { MemoryType } from "@prisma/client";

export interface ExtractedCandidate {
    content: string;
    type: MemoryType;
    importance: number;
    confidence: number;
}

export type ConflictAction = "IDENTICAL" | "UPDATE" | "CONFLICT" | "UNRELATED";

export interface ConflictDecision {
    action: ConflictAction;
    reason: string;
}

export class MemoryExtractor {
    private client: OpenAI;
    private model: string;

    constructor() {
        this.client = new OpenAI({
            apiKey: envConfig.OPENAI_API_KEY || "dummy-key",
            baseURL: envConfig.OPENAI_BASE_URL || undefined,
        });
        this.model = envConfig.DEFAULT_LLM_MODEL || "gpt-4o-mini";
    }

    /**
     * Cheap filter to skip low-information conversational filler (PRD Section 13, 46)
     */
    public static shouldProcess(messages: Array<{ role: string; content: string }>): boolean {
        const trivialRegex = /^(hi|hello|hey|ok|okay|cool|thanks|thank you|yes|no|yep|sure|bye|goodbye|let's do it)[.!?\s]*$/i;
        const text = messages.map(m => m.content).join(" ").trim();
        if (text.length < 5) return false;
        if (trivialRegex.test(text)) return false;
        return true;
    }

    /**
     * Extract structured memories from raw user messages (PRD Section 12)
     */
    async extract(messages: Array<{ role: string; content: string }>): Promise<ExtractedCandidate[]> {
        if (!MemoryExtractor.shouldProcess(messages)) {
            return [];
        }

        // Offline / fallback parser when no active OpenAI key is set
        if (!envConfig.OPENAI_API_KEY || envConfig.OPENAI_API_KEY.startsWith("dummy")) {
            const userText = messages
                .filter(m => m.role === "user")
                .map(m => m.content)
                .join(". ");

            return [
                {
                    content: userText,
                    type: "FACT",
                    importance: 0.7,
                    confidence: 0.9
                }
            ];
        }

        const prompt = `You are a production AI Memory Extraction Engine.
Extract durable, long-term facts, preferences, goals, instructions, decisions, or project context from the conversation below.

Rules:
1. Do NOT extract conversational pleasantries or temporary chit-chat.
2. Only extract information about the user, their preferences, project constraints, or decisions.
3. Classify each memory with a valid MemoryType: FACT, PREFERENCE, GOAL, INSTRUCTION, DECISION, PROFILE, RELATIONSHIP, PROJECT_CONTEXT, BEHAVIOR, TEMPORARY, OTHER.
4. Assign importance (0.0 to 1.0) and confidence (0.0 to 1.0).
5. Output ONLY valid JSON in the following schema:
{
  "memories": [
    {
      "content": "string",
      "type": "FACT" | "PREFERENCE" | "GOAL" | "INSTRUCTION" | "DECISION" | "PROFILE" | "RELATIONSHIP" | "PROJECT_CONTEXT" | "BEHAVIOR" | "TEMPORARY" | "OTHER",
      "importance": number,
      "confidence": number
    }
  ]
}

Conversation:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}`;

        const response = await this.client.chat.completions.create({
            model: this.model,
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
        });

        const raw = response.choices[0]?.message?.content;
        if (!raw) return [];

        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.memories)) {
                return parsed.memories;
            }
            return [];
        } catch {
            return [];
        }
    }

    /**
     * Classify relationship between an existing memory and a new candidate (PRD Section 19)
     */
    async resolveConflict(existingMemoryContent: string, newCandidateContent: string): Promise<ConflictDecision> {
        if (!envConfig.OPENAI_API_KEY || envConfig.OPENAI_API_KEY.startsWith("dummy")) {
            if (existingMemoryContent.toLowerCase().trim() === newCandidateContent.toLowerCase().trim()) {
                return { action: "IDENTICAL", reason: "Exact string match." };
            }
            return { action: "UPDATE", reason: "New preference supersedes old." };
        }

        const prompt = `Compare the following EXISTING memory and NEW candidate memory for the same user.
Determine if the new candidate:
- IDENTICAL: Exactly or essentially the same information (deduplicate).
- UPDATE: An update, progression, or refinement of the existing memory.
- CONFLICT: Directly contradicts or replaces the old memory (the old memory should be superseded).
- UNRELATED: Completely different facts despite overlapping keywords.

Output ONLY valid JSON:
{
  "action": "IDENTICAL" | "UPDATE" | "CONFLICT" | "UNRELATED",
  "reason": "short explanation"
}

Existing: "${existingMemoryContent}"
New: "${newCandidateContent}"`;

        const response = await this.client.chat.completions.create({
            model: this.model,
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt }],
            temperature: 0.0,
        });

        const raw = response.choices[0]?.message?.content;
        if (!raw) return { action: "UPDATE", reason: "Default update." };

        try {
            return JSON.parse(raw) as ConflictDecision;
        } catch {
            return { action: "UPDATE", reason: "Parsing fallback." };
        }
    }
}

let extractorInstance: MemoryExtractor | null = null;

export function getMemoryExtractor(): MemoryExtractor {
    if (!extractorInstance) {
        extractorInstance = new MemoryExtractor();
    }
    return extractorInstance;
}
