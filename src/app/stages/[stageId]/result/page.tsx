'use client';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStageProgress } from '@/lib/stageProgress';
import { scoreToGrade, getGradeColor, getStageCompletionMessage, getGradeEncouragement, getMilestoneMessage } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { Trophy, Lock, ArrowRight, Star, Target, Zap } from 'lucide-react';

export default function StageResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const stageId = Number(params.stageId);
  const score = Number(searchParams.get('score') || '0');
  const { updateStageScore, isStageUnlocked } = useStageProgress();
  const hasUpdatedScore = useRef(false);
  const [attempts, setAttempts] = useState(1);

  // Save the score when the page loads, but only once
  useEffect(() => {
    if (!hasUpdatedScore.current && score > 0) {
      updateStageScore(stageId, score);
      hasUpdatedScore.current = true;
      
      // Get attempts from localStorage
      const stageAttempts = localStorage.getItem(`stage_${stageId}_attempts`) || '0';
      const currentAttempts = parseInt(stageAttempts) + 1;
      setAttempts(currentAttempts);
      localStorage.setItem(`stage_${stageId}_attempts`, currentAttempts.toString());
    }
  }, [stageId, score, updateStageScore]);

  const nextStageUnlocked = isStageUnlocked(stageId + 1);
  const hasPassed = score >= 60;
  const grade = scoreToGrade(score);
  const completionMessage = getStageCompletionMessage(score, stageId);
  const gradeEncouragement = getGradeEncouragement(grade);
  const milestoneMessage = getMilestoneMessage(stageId);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white bg-opacity-80 rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Stage {stageId} Result</h1>
        
        {/* Score Display */}
        <div className={`text-6xl font-extrabold mb-4 ${
          hasPassed ? 'text-green-600' : 'text-red-600'
        }`}>
          {score}/100
        </div>
        
        {/* Grade Display */}
        <div className="mb-4">
          <Badge 
            variant="outline" 
            className={`text-lg px-4 py-2 font-bold ${getGradeColor(grade)}`}
          >
            Grade: {grade}
          </Badge>
        </div>

        {/* Motivational Messages */}
        <div className="mb-6 space-y-3">
          {/* Main Completion Message */}
          <div className={`p-3 rounded-lg ${
            hasPassed ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
          }`}>
            <p className={`text-sm font-medium ${
              hasPassed ? 'text-green-800' : 'text-blue-800'
            }`}>
              {completionMessage}
            </p>
          </div>

          {/* Grade Encouragement */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm font-medium text-purple-800">
              {gradeEncouragement}
            </p>
          </div>

          {/* Milestone Message */}
          {milestoneMessage && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-yellow-800">
                <Star className="h-4 w-4" />
                <p className="text-sm font-medium">{milestoneMessage}</p>
              </div>
            </div>
          )}

          {/* Attempt Counter */}
          <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600">
              Attempt #{attempts} on this stage
            </p>
          </div>
        </div>
        
        {/* Stage Status */}
        <div className="mb-6">
          {hasPassed ? (
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <Trophy className="h-6 w-6" />
              <span className="font-semibold">Stage Passed!</span>
            </div>
          ) : (
            <div className="text-red-600 mb-2">
              <span className="font-semibold">Need 60+ points to pass</span>
            </div>
          )}
          
          {hasPassed && !nextStageUnlocked && (
            <div className="text-sm text-gray-600 mb-2">
              Keep working on this stage to unlock the next one!
            </div>
          )}
          
          {hasPassed && nextStageUnlocked && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                <ArrowRight className="h-5 w-5" />
                <span className="font-semibold">🎉 New Stage Unlocked! 🎉</span>
              </div>
              <p className="text-sm text-blue-700 text-center">
                Congratulations! You've unlocked Stage {stageId + 1}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full" 
            onClick={() => router.push(`/stages/${stageId}`)}
          >
            {hasPassed ? 'Retry for Better Score' : 'Try Again'}
          </Button>
          
          {nextStageUnlocked && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => router.push(`/stages/${stageId + 1}`)}
            >
              Next Stage
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => router.push('/stages')}
          >
            All Stages
          </Button>
        </div>
      </div>
    </div>
  );
} 