import { z } from "zod";

export const quizOptionSchema = z.object({
  id: z.string().describe("Unique identifier for the option (e.g., 'a', 'b', 'c', 'd')"),
  text: z.string().describe("The option text"),
});

export const quizQuestionSchema = z.object({
  id: z.string().describe("Unique identifier for the question"),
  question: z.string().describe("The quiz question"),
  options: z
    .array(quizOptionSchema)
    .length(4)
    .describe("Four multiple choice options"),
  correctAnswerId: z
    .string()
    .describe("The ID of the correct option"),
  explanation: z
    .string()
    .describe("Brief explanation of why the answer is correct"),
});

export const quizSchema = z.object({
  title: z.string().describe("Title of the quiz based on PDF content"),
  description: z
    .string()
    .describe("Brief description of what the quiz covers"),
  questions: z
    .array(quizQuestionSchema)
    .min(3)
    .max(10)
    .describe("Quiz questions generated from the PDF content"),
});

export type Quiz = z.infer<typeof quizSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type QuizOption = z.infer<typeof quizOptionSchema>;
