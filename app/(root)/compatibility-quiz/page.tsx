"use client";

import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "@/app/hoc/AuthGuard";
import Modal from "@/components/Modal";
import { fetchQuizAnswers, fetchQuizOptions, fetchQuizQuestions, saveQuizAnswer } from "@/utils/api";

const CompatibilityQuiz = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchQuizQuestions();
        const questionsByCategory = response?.data?.questions_by_category;
        const allQuestions = questionsByCategory ? Object.values(questionsByCategory).flat() : [];
        setQuestions(allQuestions);
      } catch (err) {
        console.error("Error fetching quiz questions:", err);
        setError("We couldn't load your compatibility quiz right now. Please try again.");
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    void loadQuestions();
  }, []);

  useEffect(() => {
    const loadUserAnswers = async () => {
      try {
        const response = await fetchQuizAnswers();
        const answersByCategory = response?.data?.answers_by_category;

        if (answersByCategory) {
          const answers = Object.values(answersByCategory)
            .flat()
            .reduce<Record<string, string>>((acc, answer: any) => {
              if (answer?.question_id) acc[answer.question_id] = answer.option_id;
              return acc;
            }, {});

          setUserAnswers(answers);
        }
      } catch (err) {
        console.error("Error fetching user answers:", err);
      }
    };

    void loadUserAnswers();
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      if (questions.length === 0) {
        setOptions([]);
        return;
      }

      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) {
        setOptions([]);
        return;
      }

      try {
        const response = await fetchQuizOptions(currentQuestion.id);
        const optionsByQuestion = response?.data?.options_by_question;
        const currentOptions = optionsByQuestion?.[currentQuestion.id] ?? [];

        setOptions(currentOptions);
        setSelectedOption(userAnswers[currentQuestion.id] ?? null);
      } catch (err) {
        console.error("Error fetching options:", err);
        setOptions([]);
        setSelectedOption(null);
      }
    };

    void loadOptions();
  }, [currentQuestionIndex, questions, userAnswers]);

  const currentQuestion = questions[currentQuestionIndex];
  const progressValue = useMemo(() => {
    if (!questions.length) return 0;
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  }, [currentQuestionIndex, questions.length]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNextQuestion = async () => {
    if (!selectedOption) {
      setError("Please choose one option before moving on.");
      return;
    }

    if (!currentQuestion) {
      setError("This question is unavailable right now. Please refresh and try again.");
      return;
    }

    const answerData = {
      question: currentQuestion.id,
      chosen_option: selectedOption,
    };

    try {
      await saveQuizAnswer(answerData);
      setUserAnswers((previous) => ({
        ...previous,
        [currentQuestion.id]: selectedOption,
      }));
      setError(null);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((previous) => previous + 1);
        setSelectedOption(null);
        return;
      }

      setShowCompletionModal(true);
      setTimeout(() => {
        const next = searchParams.get("next");
        router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/ai-roommate-finder");
      }, 2500);
    } catch (err) {
      console.error("Error saving answer:", err);
      setError("Your answer couldn't be saved. Please try again.");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setSelectedOption(userAnswers[questions[currentQuestionIndex - 1]?.id] ?? null);
      setCurrentQuestionIndex((previous) => previous - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f8ff] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="animate-pulse space-y-5">
            <div className="h-4 w-32 rounded-full bg-slate-200" />
            <div className="h-8 w-2/3 rounded-xl bg-slate-200" />
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-4/5 rounded bg-slate-100" />
            <div className="h-28 rounded-2xl bg-slate-100" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-14 rounded-2xl bg-slate-100" />
              <div className="h-14 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f8ff] px-4 py-10 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-[28px] border border-rose-100 bg-white p-8 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#2879ef]">Compatibility quiz</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mt-3 text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#f4f8ff] px-4 py-10 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <p className="text-slate-600">No questions are available right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8ff] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 overflow-hidden rounded-[28px] border border-[#dfeeff] bg-gradient-to-r from-[#f7fbff] via-[#edf5ff] to-[#edf6ff] p-5 shadow-[0_12px_30px_rgba(18,80,178,0.08)] sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-[#cfe4ff] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1f6fdd]">
                <BrainCircuit className="mr-2 h-3.5 w-3.5" /> Compatibility quiz
              </p>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Tell us how you live
              </h1>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#dfeeff] bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm">
              <Sparkles className="h-4 w-4 text-[#2879ef]" />
              Personalized roomie matching
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
            Answer a few lifestyle questions so NestBuddy can match you with roommates who fit your rhythm, preferences, and habits.
          </p>
        </header>

        <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#2879ef]">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <p className="mt-1 text-sm text-slate-500">{currentQuestion.category || "Lifestyle"}</p>
            </div>

            <div className="w-full max-w-xs">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{Math.round(progressValue)}% complete</span>
                <span>{currentQuestionIndex + 1}/{questions.length}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#5aa0ff] to-[#2879ef] transition-all duration-300"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4 sm:p-6">
            <h2 className="text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
              {currentQuestion.question}
            </h2>

            <div className="mt-6 grid gap-3">
              {options.map((option: any) => {
                const isSelected = selectedOption === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleOptionSelect(option.id)}
                    className={`group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-[#2879ef] bg-[#eef5ff] shadow-[0_8px_20px_rgba(40,121,239,0.12)]"
                        : "border-slate-200 bg-white hover:border-[#bfdbff] hover:bg-[#f8fbff]"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                        isSelected
                          ? "border-[#2879ef] bg-[#2879ef]"
                          : "border-slate-300 bg-white group-hover:border-[#8fb9ff]"
                      }`}
                    >
                      {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                    <span className="text-sm font-medium text-slate-700 sm:text-base">{option.option}</span>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              type="button"
              onClick={handleNextQuestion}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2879ef] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1f6fdd]"
            >
              {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next question"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showCompletionModal && (
        <Modal
          onClose={() => setShowCompletionModal(false)}
          isOpen={showCompletionModal}
          title="Your quiz is complete"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">You’re all set!</h2>
            <p className="mt-2 text-sm text-slate-600">
              Your answers have been saved and NestBuddy will use them to improve your matches.
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Redirecting to your home page…
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default function ProtectedCompatibilityQuiz() {
  return (
    <AuthGuard>
      <CompatibilityQuiz />
    </AuthGuard>
  );
}
