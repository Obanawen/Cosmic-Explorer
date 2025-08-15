'use client';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStageProgress } from '@/lib/stageProgress';
import { useEffect, useRef } from 'react';
import { Trophy, Lock, ArrowRight } from 'lucide-react';

export default function StageResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const stageId = Number(params.stageId);
  const score = Number(searchParams.get('score') || '0');
  const { updateStageScore, isStageUnlocked } = useStageProgress();
  const hasUpdatedScore = useRef(false);

  // Save the score when the page loads, but only once
  useEffect(() => {
    if (!hasUpdatedScore.current && score > 0) {
      updateStageScore(stageId, score);
      hasUpdatedScore.current = true;
    }
  }, [stageId, score, updateStageScore]);

  const nextStageUnlocked = isStageUnlocked(stageId + 1);
  const hasPassed = score >= 60;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white bg-opacity-80 rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Stage {stageId} Result</h1>
        
        <div className={`text-6xl font-extrabold mb-4 ${
          hasPassed ? 'text-green-600' : 'text-red-600'
        }`}>
          {score}/100
        </div>
        
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

        <div className="space-y-3">
          <Button 
            className="w-full" 
            onClick={() => router.push(`/stages/${stageId}`)}
          >
            Retry Stage
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