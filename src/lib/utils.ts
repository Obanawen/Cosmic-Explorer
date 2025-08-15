import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a numerical score (0-100) to a letter grade
 */
export function scoreToGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  if (score >= 50) return 'E';
  return 'F';
}

/**
 * Get the color class for a grade
 */
export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A+':
      return 'text-purple-600 bg-purple-100 border-purple-300';
    case 'A':
      return 'text-green-600 bg-green-100 border-green-300';
    case 'B':
      return 'text-blue-600 bg-blue-100 border-blue-300';
    case 'C':
      return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    case 'D':
      return 'text-orange-600 bg-orange-100 border-orange-300';
    case 'E':
      return 'text-red-500 bg-red-100 border-red-300';
    case 'F':
      return 'text-red-700 bg-red-100 border-red-300';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-300';
  }
}

/**
 * Get the description for a grade
 */
export function getGradeDescription(grade: string): string {
  switch (grade) {
    case 'A+':
      return 'Exceptional - Perfect performance!';
    case 'A':
      return 'Excellent - Outstanding achievement';
    case 'B':
      return 'Good - Above average performance';
    case 'C':
      return 'Satisfactory - Meets expectations';
    case 'D':
      return 'Needs Improvement - Below expectations';
    case 'E':
      return 'Poor - Significant improvement needed';
    case 'F':
      return 'Failing - Requires immediate attention';
    default:
      return 'No grade available';
  }
}

/**
 * Get motivational message based on score
 */
export function getScoreMessage(score: number): string {
  if (score >= 95) return "🎉 Phenomenal! You're a cosmic master!";
  if (score >= 90) return "🌟 Outstanding! You're reaching for the stars!";
  if (score >= 80) return "🚀 Excellent work! You're soaring through space!";
  if (score >= 70) return "⭐ Great job! You're making steady progress!";
  if (score >= 60) return "✅ Good effort! You're on the right track!";
  if (score >= 50) return "💪 Keep going! You're almost there!";
  return "🌱 Don't give up! Every attempt brings you closer to success!";
}

/**
 * Get stage completion message based on score
 */
export function getStageCompletionMessage(score: number, stageId: number): string {
  if (score >= 95) {
    return `🎊 Congratulations! Stage ${stageId} mastered with flying colors! You're unstoppable!`;
  }
  if (score >= 90) {
    return `🎉 Amazing! Stage ${stageId} completed with excellence! You're a star!`;
  }
  if (score >= 80) {
    return `🌟 Fantastic! Stage ${stageId} conquered! You're making incredible progress!`;
  }
  if (score >= 70) {
    return `⭐ Well done! Stage ${stageId} completed successfully! Keep up the great work!`;
  }
  if (score >= 60) {
    return `✅ Congratulations! Stage ${stageId} passed! You're moving forward!`;
  }
  if (score >= 50) {
    return `💪 Good effort on Stage ${stageId}! You're so close - try again!`;
  }
  return `🌱 Stage ${stageId} needs more practice. Don't worry, you'll get it next time!`;
}

/**
 * Get encouragement message for retry attempts
 */
export function getRetryMessage(attempts: number): string {
  if (attempts === 1) return "💪 First attempt! You're just getting started!";
  if (attempts === 2) return "🔄 Second try! You're learning and improving!";
  if (attempts === 3) return "🎯 Third time's the charm! You're getting closer!";
  if (attempts === 4) return "🔥 Fourth attempt! Your determination is inspiring!";
  if (attempts === 5) return "⚡ Fifth try! You're showing incredible persistence!";
  return "🚀 Keep going! Every attempt makes you stronger!";
}

/**
 * Get milestone message for stage numbers
 */
export function getMilestoneMessage(stageId: number): string {
  if (stageId === 10) return "🎊 Milestone reached! You've completed 10 stages!";
  if (stageId === 25) return "🌟 Quarter way there! 25 stages completed!";
  if (stageId === 50) return "🎉 Halfway point! 50 stages conquered!";
  if (stageId === 75) return "🚀 Almost there! 75 stages completed!";
  if (stageId === 100) return "🏆 CENTURY CLUB! All 100 stages completed!";
  return "";
}

/**
 * Get grade-specific encouragement
 */
export function getGradeEncouragement(grade: string): string {
  switch (grade) {
    case 'A+':
      return "🏆 You're absolutely exceptional! A perfect performance!";
    case 'A':
      return "🌟 Outstanding achievement! You're a star performer!";
    case 'B':
      return "⭐ Great work! You're above average and improving!";
    case 'C':
      return "✅ Good job! You're meeting expectations!";
    case 'D':
      return "💪 You're close! A little more effort will get you there!";
    case 'E':
      return "🌱 Keep practicing! You're building the foundation for success!";
    case 'F':
      return "💪 Don't give up! Every great explorer started somewhere!";
    default:
      return "🚀 Keep exploring and learning!";
  }
}
