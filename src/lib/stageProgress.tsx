'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StageProgress {
  [stageId: number]: number; // stageId -> score
}

interface StageProgressContextType {
  stageScores: StageProgress;
  updateStageScore: (stageId: number, score: number) => void;
  isStageUnlocked: (stageId: number) => boolean;
  getUnlockedStages: () => number[];
}

const StageProgressContext = createContext<StageProgressContextType | undefined>(undefined);

export function StageProgressProvider({ children }: { children: ReactNode }) {
  const [stageScores, setStageScores] = useState<StageProgress>({});

  // Load scores from localStorage on mount
  useEffect(() => {
    const savedScores = localStorage.getItem('stageScores');
    if (savedScores) {
      try {
        setStageScores(JSON.parse(savedScores));
      } catch (error) {
        console.error('Failed to parse saved stage scores:', error);
      }
    }
  }, []);

  // Save scores to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('stageScores', JSON.stringify(stageScores));
  }, [stageScores]);

  const updateStageScore = (stageId: number, score: number) => {
    setStageScores(prev => ({
      ...prev,
      [stageId]: Math.max(prev[stageId] || 0, score) // Keep highest score
    }));
  };

  const isStageUnlocked = (stageId: number): boolean => {
    if (stageId === 1) return true; // First stage is always unlocked
    
    // Check if previous stage has at least 60 points
    const previousStageScore = stageScores[stageId - 1] || 0;
    return previousStageScore >= 60;
  };

  const getUnlockedStages = (): number[] => {
    const unlocked: number[] = [];
    for (let i = 1; i <= 100; i++) {
      if (isStageUnlocked(i)) {
        unlocked.push(i);
      }
    }
    return unlocked;
  };

  return (
    <StageProgressContext.Provider value={{
      stageScores,
      updateStageScore,
      isStageUnlocked,
      getUnlockedStages
    }}>
      {children}
    </StageProgressContext.Provider>
  );
}

export function useStageProgress() {
  const context = useContext(StageProgressContext);
  if (context === undefined) {
    throw new Error('useStageProgress must be used within a StageProgressProvider');
  }
  return context;
}
