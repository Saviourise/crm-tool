import { create } from 'zustand'

/** Transient store for onboarding token during wizard. Not persisted. */
export interface OnboardingState {
  onboardingToken: string | null
  setOnboardingToken: (token: string | null) => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  onboardingToken: null,
  setOnboardingToken: (token) => set({ onboardingToken: token }),
}))
