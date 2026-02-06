import { tool, type UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { quizSchema } from "@/lib/ai/schemas/quiz";
import { getLanguageModel } from "@/lib/ai/providers";
import { streamObject } from "ai";

type GenerateQuizProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const generateQuiz = ({ session, dataStream }: GenerateQuizProps) =>
  tool({
    description:
      "Generate a multiple-choice quiz from a PDF document. Use this tool when the user uploads a PDF and asks for a quiz, test, or questions about the PDF content.",
    inputSchema: z.object({
      pdfUrl: z.string().describe("The URL of the uploaded PDF file"),
      questionCount: z
        .number()
        .min(3)
        .max(10)
        .default(5)
        .describe("Number of questions to generate (3-10)"),
      title: z.string().optional().describe("Optional title for the quiz"),
    }),
    execute: async ({ pdfUrl, questionCount, title }) => {
      const id = generateUUID();

      // Signal that we're generating a quiz
      dataStream.write({
        type: "data-quiz-start",
        data: { id, pdfUrl },
        transient: true,
      });

      try {
        // Fetch PDF and convert to base64
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch PDF");
        }
        const arrayBuffer = await response.arrayBuffer();
        const pdfBase64 = Buffer.from(arrayBuffer).toString("base64");

        // Generate quiz using AI
        const result = await streamObject({
          model: getLanguageModel("anthropic/claude-haiku-4.5"),
          schema: quizSchema,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "file",
                  data: pdfBase64,
                  mimeType: "application/pdf",
                },
                {
                  type: "text",
                  text: `Analyze this PDF document and generate a quiz with exactly ${questionCount} multiple choice questions.

Requirements:
- Each question should test understanding of key concepts from the document
- Questions should range from basic comprehension to deeper analysis
- Each question must have exactly 4 options (a, b, c, d)
- Only one option should be correct
- Provide a brief explanation for why the correct answer is right
- Make the quiz title reflect the main topic of the PDF${title ? ` (suggested title: "${title}")` : ""}
- Include a short description of what the quiz covers

Generate the quiz now.`,
                },
              ],
            },
          ],
        });

        // Get the final quiz object
        const quiz = await result.object;

        // Write the quiz data to the stream
        dataStream.write({
          type: "data-quiz",
          data: { id, quiz },
        });

        dataStream.write({
          type: "data-quiz-finish",
          data: { id },
          transient: true,
        });

        return {
          id,
          title: quiz.title,
          questionCount: quiz.questions.length,
          quiz, // Include full quiz data for display
          content: `Quiz "${quiz.title}" has been generated with ${quiz.questions.length} questions. The user can now take the quiz.`,
        };
      } catch (error) {
        dataStream.write({
          type: "data-quiz-error",
          data: { id, error: error instanceof Error ? error.message : "Failed to generate quiz" },
          transient: true,
        });

        return {
          id,
          error: "Failed to generate quiz from the PDF. Please try again.",
        };
      }
    },
  });
