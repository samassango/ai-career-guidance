'use server';

import { GoogleGenAI } from "@google/genai";
import { getAPIKey } from "./access";



export const analysePdfDocument = async (pdfBase64: string) => {
    const api_key = await getAPIKey();

    const ai = new GoogleGenAI({ apiKey: api_key });
    const model = 'gemini-2.5-flash';
    const pdfResp = await fetch(pdfBase64)
        .then((response) => response.arrayBuffer());

    const content = [
        {
            text: `Extract modules or subjects from this PDF and return as structured JSON. Rename module name to property key "module_name" and marks to "percentage" (as a number without the % sign). IMPORTANT: Do NOT include any "Overall Average" or aggregate/summary rows — only individual subjects. Use this JSON structure: {modules:[{ module_name, percentage }]}`
        },
        {
            inlineData: {
                mimeType: 'application/pdf',
                data: Buffer.from(pdfResp).toString("base64")
            }
        }
    ];
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: content,
        });

        return response.text?.replaceAll('```json', '').replaceAll('```', '');

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
}

export const getRecommendations = async (data: {
    subject: any[];
    personality: any[];
    skills: any[];
    interests: any[];
    consentToProcess?: boolean;
}) => {
    try {
        let subjects: Record<string, number> = {};

        // Filter out "Overall Average" and similar aggregate rows
        const filtered = data.subject.filter((obj: any) => {
            const name = (obj.name || obj.module_name || "").toLowerCase().trim();

            return (
                name &&
                !name.includes("overall average") &&
                !name.includes("total") &&
                !name.includes("aggregate")
            );
        });

        filtered.forEach((obj: any) => {
            const subjectName = obj.name || obj.module_name;

            // Clean percentage: remove extra % signs, parse as number
            const pct =
                typeof obj.percentage === "string"
                    ? obj.percentage.replace(/%/g, "").trim()
                    : obj.percentage;

            const percentage = Number(pct);

            if (subjectName && !Number.isNaN(percentage)) {
                subjects[subjectName] = percentage;
            }
        });

        const res = await fetch("https://acgs-ai-engine.vercel.app/api/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                academicResults: subjects,
                skills: data.skills,
                interests: data.interests,
                personalityTraits: data.personality,
                consentToProcess: data.consentToProcess ?? true,
            }),
        });

        if (!res.ok) {
            throw new Error(`API request failed with status ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error calling API:", error);

        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }

        throw new Error("An unknown error occurred while communicating with the API.");
    }
};