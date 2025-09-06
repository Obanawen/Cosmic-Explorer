'use client';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStageProgress } from '@/lib/stageProgress';
import { scoreToGrade, getGradeColor, getStageCompletionMessage, getGradeEncouragement, getMilestoneMessage, scoreToXp, xpToLevel } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

function CollapsibleText({ text, className }: { text: string; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [needsClamp, setNeedsClamp] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Measure if content exceeds collapsed height (~5 lines)
    const collapsedMax = 100; // px, roughly 5 lines for text-sm
    // Temporarily remove maxHeight to measure full height
    const prev = el.style.maxHeight;
    el.style.maxHeight = 'none';
    const full = el.scrollHeight;
    el.style.maxHeight = prev;
    setNeedsClamp(full > collapsedMax + 4);
  }, [text]);

  const collapsedMax = 100; // px

  return (
    <div className="space-y-1">
      <div
        ref={containerRef}
        className={`break-words break-all whitespace-pre-wrap ${className || ''}`}
        style={!expanded ? { maxHeight: `${collapsedMax}px`, overflow: 'hidden' } : undefined}
      >
        {text}
      </div>
      {needsClamp && (
        <button
          type="button"
          className="text-xs text-blue-600 hover:underline"
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}
import { Trophy, Lock, ArrowRight, Star, Target, Zap } from 'lucide-react';

export default function StageResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const stageId = Number(params.stageId);
  const score = Number(searchParams.get('score') || '0');
  const { updateStageScore, isStageUnlocked, addXp, xpBalance } = useStageProgress();
  const levelInfo = xpToLevel(xpBalance);
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
      // Award XP based on score
      try {
        const xp = scoreToXp(score);
        addXp(xp);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('last_awarded_xp', String(xp));
        }
      } catch {}
    }
  }, [stageId, score, updateStageScore]);

  const nextStageUnlocked = isStageUnlocked(stageId + 1);
  const hasPassed = score >= 60;
  const grade = scoreToGrade(score);
  const completionMessage = getStageCompletionMessage(score, stageId);
  const gradeEncouragement = getGradeEncouragement(grade);
  const milestoneMessage = getMilestoneMessage(stageId);
  const [analysis, setAnalysis] = useState<any | null>(null);

  // Load detailed analysis stored from the stage page
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = sessionStorage.getItem(`stage_${stageId}_analysis`);
        if (raw) {
          const parsed = JSON.parse(raw);
          setAnalysis(parsed.analysis || null);
        }
      }
    } catch {
      setAnalysis(null);
    }
  }, [stageId]);

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
        
        {/* XP Bar */}
        <div className="mb-4 text-left">
          <div className="flex items-center justify-between text-sm text-gray-700 mb-1">
            <span>Level {levelInfo.level}</span>
            <span>{levelInfo.current}/{levelInfo.required} XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-700" style={{ width: `${levelInfo.progressPct}%` }}></div>
          </div>
        </div>

        {/* Grade & XP Display */}
        <div className="mb-4">
          <Badge 
            variant="outline" 
            className={`text-lg px-4 py-2 font-bold ${getGradeColor(grade)}`}
          >
            Grade: {grade}
          </Badge>
          <div className="text-sm text-gray-700 mt-2">XP earned: {scoreToXp(score)} · Total XP: {xpBalance}</div>
        </div>

        {/* Grammar, Spelling, Punctuation Breakdown */}
        {analysis && (
          <div className="text-left space-y-4 mb-6">
            {/* Categories */}
            {Array.isArray(analysis.categories) && analysis.categories.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold mb-3">Category Breakdown</h3>
                <div className="space-y-3">
                  {analysis.categories.map((cat: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white rounded border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{cat.category}</span>
                        <Badge variant="secondary">{cat.score}/{cat.maxScore}</Badge>
                      </div>
                      {cat.feedback && (
                        <p className="text-sm text-gray-700 mb-2">{cat.feedback}</p>
                      )}
                      {Array.isArray(cat.issues) && cat.issues.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-red-700">Issues:</p>
                          <ul className="text-sm text-red-700 list-disc list-inside break-words break-all whitespace-pre-wrap">
                            {cat.issues.map((i: string, j: number) => (
                              <li key={j} className="break-words break-all whitespace-pre-wrap">
                                <CollapsibleText text={i} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(cat.corrections) && cat.corrections.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-green-700">Corrections:</p>
                          <ul className="text-sm text-green-700 list-disc list-inside break-words break-all whitespace-pre-wrap">
                            {cat.corrections.map((c: string, j: number) => (
                              <li key={j} className="font-mono break-words break-all whitespace-pre-wrap">
                                <CollapsibleText text={c} className="font-mono" />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(cat.suggestions) && cat.suggestions.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-blue-700">Suggestions:</p>
                          <ul className="text-sm text-blue-700 list-disc list-inside break-words break-all whitespace-pre-wrap">
                            {cat.suggestions.map((s: string, j: number) => (
                              <li key={j} className="break-words break-all whitespace-pre-wrap">
                                <CollapsibleText text={s} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specific Corrections Summary */}
            {(analysis.grammarCorrections || analysis.spellingCorrections || analysis.punctuationCorrections) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {analysis.spellingCorrections && analysis.spellingCorrections.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <h4 className="font-medium text-red-800 mb-1">Spelling Corrections</h4>
                    <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
                      {analysis.spellingCorrections.map((c: string, i: number) => (
                        <li key={i} className="font-mono">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.grammarCorrections && analysis.grammarCorrections.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h4 className="font-medium text-yellow-800 mb-1">Grammar Corrections</h4>
                    <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
                      {analysis.grammarCorrections.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.punctuationCorrections && analysis.punctuationCorrections.length > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-medium text-blue-800 mb-1">Punctuation Corrections</h4>
                    <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                      {analysis.punctuationCorrections.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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