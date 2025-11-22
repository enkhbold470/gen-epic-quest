"use server";

import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const transformTodoSchema = z.object({
  text: z.string().min(1, "Todo text is required").max(500, "Todo text is too long"),
});

export async function transformTodoWithAI(
  input: unknown
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const validated = transformTodoSchema.parse(input);

    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key is not configured",
      };
    }
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a dramatic storyteller who transforms mundane todo items into epic, heroic quests with over-the-top storytelling flair. Make each todo sound like an epic adventure, a legendary quest, or a dramatic mission. Use dramatic language, metaphors, and heroic descriptions. Keep it fun and entertaining but still recognizable as the original task. Respond with ONLY the transformed text, nothing else. Keep it short in 5 words and concise.",
          },
          {
            role: "user",
            content: `Transform this todo item into a dramatic, heroic quest: "${validated.text}"`,
          },
        ],
        max_tokens: 50,
        temperature: 0.9,
      });
      
    const dramaticText = completion.choices[0]?.message?.content?.trim();

    if (!dramaticText) {
      return {
        success: false,
        error: "Failed to generate dramatic transformation",
      };
    }

    return {
      success: true,
      data: dramaticText,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.message || "Validation failed",
      };
    }

    console.error("AI transformation error:", error);
    return {
      success: false,
      error: "Failed to transform todo. Please try again.",
    };
  }
}

const splitTaskSchema = z.object({
  text: z.string().min(1, "Task text is required").max(500, "Task text is too long"),
});

export async function splitTaskIntoSubtasks(
  input: unknown
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    const validated = splitTaskSchema.parse(input);

    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key is not configured",
      };
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that breaks down tasks into smaller, actionable subtasks. Given a task (which might be dramatic or simple), break it down into 3-5 smaller, specific subtasks. Return a JSON object with a 'subtasks' key containing an array of strings. Example: {\"subtasks\": [\"Subtask 1\", \"Subtask 2\", \"Subtask 3\"]}",
        },
        {
          role: "user",
          content: `Break down this task into smaller subtasks: "${validated.text}"`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content?.trim();

    if (!responseText) {
      return {
        success: false,
        error: "Failed to generate subtasks",
      };
    }

    try {
      // Try to parse as JSON object first
      const parsed = JSON.parse(responseText);
      let subtasks: string[] = [];

      // Handle different response formats
      if (Array.isArray(parsed)) {
        subtasks = parsed;
      } else if (parsed.subtasks && Array.isArray(parsed.subtasks)) {
        subtasks = parsed.subtasks;
      } else if (parsed.tasks && Array.isArray(parsed.tasks)) {
        subtasks = parsed.tasks;
      } else {
        // Try to extract array from any key
        const values = Object.values(parsed);
        if (values.length > 0 && Array.isArray(values[0])) {
          subtasks = values[0] as string[];
        }
      }

      // Fallback: try to parse as direct array
      if (subtasks.length === 0) {
        const directArray = JSON.parse(responseText);
        if (Array.isArray(directArray)) {
          subtasks = directArray;
        }
      }

      if (subtasks.length === 0) {
        return {
          success: false,
          error: "Failed to parse subtasks",
        };
      }

      return {
        success: true,
        data: subtasks.filter((task) => typeof task === "string" && task.trim().length > 0),
      };
    } catch {
      // Fallback: try to extract subtasks from text
      const lines = responseText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("```"));

      if (lines.length > 0) {
        return {
          success: true,
          data: lines.slice(0, 5), // Limit to 5 subtasks
        };
      }

      return {
        success: false,
        error: "Failed to parse subtasks from response",
      };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.message || "Validation failed",
      };
    }

    console.error("AI subtask splitting error:", error);
    return {
      success: false,
      error: "Failed to split task. Please try again.",
    };
  }
}
