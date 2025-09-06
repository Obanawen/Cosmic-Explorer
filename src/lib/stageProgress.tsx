'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface StageProgress {
  [stageId: number]: number; // stageId -> score
}

interface StageProgressContextType {
  stageScores: StageProgress;
  updateStageScore: (stageId: number, score: number) => void;
  isStageUnlocked: (stageId: number) => boolean;
  getUnlockedStages: () => number[];
  xpBalance: number;
  addXp: (amount: number) => void;
  spendXp: (amount: number) => boolean;
}

const StageProgressContext = createContext<StageProgressContextType | undefined>(undefined);

export function StageProgressProvider({ children }: { children: ReactNode }) {
  const [stageScores, setStageScores] = useState<StageProgress>({});
  const [xpBalance, setXpBalance] = useState<number>(0);

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
    const savedXp = localStorage.getItem('xpBalance');
    if (savedXp) {
      const n = parseInt(savedXp, 10);
      if (!Number.isNaN(n)) setXpBalance(n);
    }
  }, []);

  // Save scores to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('stageScores', JSON.stringify(stageScores));
  }, [stageScores]);

  useEffect(() => {
    localStorage.setItem('xpBalance', String(xpBalance));
  }, [xpBalance]);

  const updateStageScore = useCallback((stageId: number, score: number) => {
    setStageScores(prev => ({
      ...prev,
      [stageId]: Math.max(prev[stageId] || 0, score) // Keep highest score
    }));
  }, []);

  const isStageUnlocked = useCallback((stageId: number): boolean => {
    if (stageId === 1) return true; // First stage is always unlocked
    
    // Check if previous stage has at least 60 points
    const previousStageScore = stageScores[stageId - 1] || 0;
    return previousStageScore >= 60;
  }, [stageScores]);

  const getUnlockedStages = useCallback((): number[] => {
    const unlocked: number[] = [];
    for (let i = 1; i <= 100; i++) {
      if (isStageUnlocked(i)) {
        unlocked.push(i);
      }
    }
    return unlocked;
  }, [isStageUnlocked]);

  const addXp = useCallback((amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    setXpBalance(prev => prev + Math.floor(amount));
  }, []);

  const spendXp = useCallback((amount: number): boolean => {
    if (!Number.isFinite(amount) || amount <= 0) return false;
    let success = false;
    setXpBalance(prev => {
      if (prev >= amount) {
        success = true;
        return prev - Math.floor(amount);
      }
      return prev;
    });
    return success;
  }, []);

  return (
    <StageProgressContext.Provider value={{
      stageScores,
      updateStageScore,
      isStageUnlocked,
      getUnlockedStages,
      xpBalance,
      addXp,
      spendXp
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
