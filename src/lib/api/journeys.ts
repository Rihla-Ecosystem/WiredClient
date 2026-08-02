import { coreClient } from "./client";

export interface JourneyStep {
  id: string;
  stepNumber: number;
  title: string;
  content: string;
  xpReward: number;
}

export interface Journey {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  xpReward: number;
  isActive: boolean;
  steps: JourneyStep[];
  completedSteps: number;
  totalSteps: number;
  isCompleted: boolean;
  startedAt: string | null;
  completedAt: string | null;
  nextStep: number | null;
}

export interface CompleteStepResult {
  journey: string;
  step: number;
  completed: number;
  total: number;
  journeyCompleted: boolean;
  xpAwarded: number;
  badgesAwarded: string[];
}

export const journeysApi = {
  list: () => coreClient.get<Journey[]>("/journeys"),

  get: (slug: string) => coreClient.get<Journey>(`/journeys/${slug}`),

  start: (slug: string) => coreClient.post<Journey>(`/journeys/${slug}/start`),

  completeStep: (slug: string, stepNumber: number) =>
    coreClient.post<CompleteStepResult>(`/journeys/${slug}/steps/complete`, {
      step_number: stepNumber,
    }),
};
