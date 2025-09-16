'use client';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Target, Rocket, Zap, Crown, Lock } from 'lucide-react';
import { getLocalDateKey, msUntilNextLocalMidnight, formatDurationShort } from '@/lib/utils';

export default function CompetitionPage() {
  const [todayKey, setTodayKey] = useState<string>('');
  const [canPlayToday, setCanPlayToday] = useState<boolean>(true);
  const [msUntilReset, setMsUntilReset] = useState<number>(msUntilNextLocalMidnight());

  const storageKey = useMemo(() => 'competition:lastPlayedDate', []);

  useEffect(() => {
    const key = getLocalDateKey();
    setTodayKey(key);
    const lastPlayed = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    setCanPlayToday(!lastPlayed || lastPlayed !== key);

    const interval = setInterval(() => {
      const remaining = msUntilNextLocalMidnight();
      setMsUntilReset(remaining);
      if (remaining === 0) {
        // New day: allow play again
        const newKey = getLocalDateKey();
        setTodayKey(newKey);
        setCanPlayToday(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [storageKey]);

  const onStartToday = () => {
    try {
      localStorage.setItem(storageKey, todayKey);
      setCanPlayToday(false);
      // TODO: Replace with actual competition flow route when available
      // For now, we can navigate users to stages as a placeholder
      window.location.href = '/stages';
    } catch (_) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Daily Gate */}
        <Card className="mb-6 border-indigo-200 bg-white/80">
          <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2">
              {canPlayToday ? (
                <Rocket className="h-6 w-6 text-indigo-600" />
              ) : (
                <Lock className="h-6 w-6 text-gray-500" />
              )}
              <h2 className="text-xl font-semibold">Daily Competition</h2>
            </div>
            {canPlayToday ? (
              <>
                <p className="text-gray-700">You can play once today. Good luck!</p>
                <Button onClick={onStartToday} className="mt-1">Start Today's Competition</Button>
              </>
            ) : (
              <>
                <p className="text-gray-600">You've already played today.</p>
                <div className="text-sm text-gray-500">Opens again in: {formatDurationShort(msUntilReset)}</div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Cosmic Competition</h1>
          <p className="text-lg text-gray-600">Challenge yourself and compete with other space explorers!</p>
        </div>

        {/* Motivational Message */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Rocket className="h-8 w-8 text-purple-600" />
              <h3 className="text-2xl font-semibold text-purple-800">Ready to Compete?</h3>
            </div>
            <p className="text-purple-700 text-lg">
              🚀 Every challenge is an opportunity to grow! Push your limits and discover what you're truly capable of!
            </p>
          </CardContent>
        </Card>

        {/* Competition Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Daily Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                New challenges every day to keep you engaged and improving your skills.
              </p>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  💪 Today's Challenge: Complete 3 stages with A+ grades!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-500" />
                Weekly Tournaments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Compete in weekly tournaments and climb the leaderboard rankings.
              </p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  🏆 This Week: Speed Challenge - Complete stages in record time!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Achievement System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Unlock special achievements and badges for your accomplishments.
              </p>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  🎯 New Achievement: "Speed Demon" - Complete 10 stages in under 5 minutes!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                Power Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                See how you rank against other competitors in real-time.
              </p>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800 font-medium">
                  ⚡ Current Rank: Rising Star - Keep pushing to reach the top!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Encouragement Section */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Crown className="h-8 w-8 text-green-600" />
              <h3 className="text-2xl font-semibold text-green-800">Words of Encouragement</h3>
            </div>
            <div className="space-y-3 text-green-700">
              <p className="text-lg">
                🌟 "The only limit to your success is your imagination and determination!"
              </p>
              <p className="text-lg">
                🚀 "Every expert was once a beginner. Keep practicing and you'll get there!"
              </p>
              <p className="text-lg">
                💪 "Challenges make you stronger. Embrace them and grow beyond your limits!"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <div className="mb-4">
            <p className="text-lg text-gray-600 mb-2">
              Ready to start competing and improving your skills?
            </p>
            <p className="text-sm text-gray-500">
              Join the cosmic competition and discover your true potential!
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <a href="/stages">Start Practicing</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/leaderboard">View Leaderboard</a>
            </Button>
          </div>
        </div>

        {/* Coming Soon Message */}
        <Card className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Rocket className="h-6 w-6 text-orange-600" />
              <h3 className="text-xl font-semibold text-orange-800">More Features Coming Soon!</h3>
            </div>
            <p className="text-orange-700">
              🎮 Team competitions, 🏆 Seasonal championships, and 🎁 Special rewards are in development!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 