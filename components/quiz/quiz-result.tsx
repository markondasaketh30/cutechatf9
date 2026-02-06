"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, XCircle, FileText, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Quiz, QuizQuestion } from "@/lib/ai/schemas/quiz";

interface QuizResultProps {
  quizId?: string;
  title?: string;
  questionCount?: number;
  quiz?: Quiz;
}

export function QuizResult({ quizId, title, questionCount, quiz: providedQuiz }: QuizResultProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(providedQuiz || null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // If no quiz data yet, show a preview card
  if (!quiz && !showQuiz) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{title || "Quiz Generated"}</CardTitle>
              <CardDescription>
                {questionCount ? `${questionCount} questions` : "Ready to test your knowledge"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => setShowQuiz(true)} className="w-full">
            <span>Start Quiz</span>
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If we need to fetch the quiz data
  if (showQuiz && !quiz) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading quiz...</p>
        </CardContent>
      </Card>
    );
  }

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  const handleSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;
    setShowResult(true);
    if (selectedAnswer === currentQuestion.correctAnswerId) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
  };

  // Show completion screen
  if (isComplete) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          <CardDescription className="text-lg">
            You scored {score} out of {quiz.questions.length} ({percentage}%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={percentage} className="h-3" />
          <div className="text-center text-muted-foreground">
            {percentage >= 80 ? (
              <p>Excellent work!</p>
            ) : percentage >= 60 ? (
              <p>Good job!</p>
            ) : percentage >= 40 ? (
              <p>Keep practicing!</p>
            ) : (
              <p>Review and try again!</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={handleRestart} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Take Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!currentQuestion) return null;

  // Show quiz question
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{quiz.title}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {quiz.questions.length}
          </span>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium">{currentQuestion.question}</p>
        <div className="grid gap-2">
          {currentQuestion.options.map((option) => {
            const isCorrect = option.id === currentQuestion.correctAnswerId;
            const isSelected = option.id === selectedAnswer;

            return (
              <Button
                key={option.id}
                variant={isSelected && !showResult ? "default" : "outline"}
                className={cn(
                  "h-auto justify-start whitespace-normal py-3 px-4 text-left",
                  showResult && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                  showResult && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950"
                )}
                onClick={() => handleSelect(option.id)}
                disabled={showResult}
              >
                <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-medium">
                  {option.id}
                </span>
                <span className="flex-1">{option.text}</span>
                {showResult && isCorrect && (
                  <CheckCircle2 className="ml-2 h-5 w-5 shrink-0 text-green-500" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle className="ml-2 h-5 w-5 shrink-0 text-red-500" />
                )}
              </Button>
            );
          })}
        </div>
        {showResult && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <span className="font-medium">Explanation: </span>
            {currentQuestion.explanation}
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end gap-2">
        {!showResult ? (
          <Button onClick={handleSubmit} disabled={!selectedAnswer}>
            Submit
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentIndex < quiz.questions.length - 1 ? "Next" : "Finish"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
