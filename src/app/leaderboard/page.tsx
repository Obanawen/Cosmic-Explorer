'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  grade: string;
  submissions: number;
  averageScore: number;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: "Sarah Chen", score: 9850, grade: "A+", submissions: 42, averageScore: 94.2 },
  { rank: 2, name: "Alex Rodriguez", score: 9720, grade: "A+", submissions: 38, averageScore: 93.1 },
  { rank: 3, name: "Emma Thompson", score: 9650, grade: "A", submissions: 35, averageScore: 92.8 },
  { rank: 4, name: "Michael Chang", score: 9580, grade: "A", submissions: 41, averageScore: 91.5 },
  { rank: 5, name: "Jessica Park", score: 9520, grade: "A", submissions: 33, averageScore: 91.2 },
  { rank: 6, name: "David Kim", score: 9450, grade: "A", submissions: 39, averageScore: 90.8 },
  { rank: 7, name: "Sophie Williams", score: 9380, grade: "A-", submissions: 36, averageScore: 90.3 },
  { rank: 8, name: "James Johnson", score: 9320, grade: "A-", submissions: 44, averageScore: 89.9 },
  { rank: 9, name: "Maria Garcia", score: 9250, grade: "A-", submissions: 31, averageScore: 89.5 },
  { rank: 10, name: "Ryan Brown", score: 9180, grade: "A-", submissions: 37, averageScore: 89.1 },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Trophy className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <Award className="h-5 w-5 text-blue-500" />;
  }
};

const getGradeBadgeColor = (grade: string) => {
  if (grade.startsWith('A+')) return 'bg-green-100 text-green-800';
  if (grade.startsWith('A')) return 'bg-blue-100 text-blue-800';
  if (grade.startsWith('B')) return 'bg-yellow-100 text-yellow-800';
  if (grade.startsWith('C')) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
    case 2:
      return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
    case 3:
      return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
    default:
      return 'bg-white border-gray-200';
  }
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-gray-600 text-lg">Top performers in AI text grading challenges</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">15,892</div>
              <div className="text-sm text-gray-600">Submissions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">87.3%</div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Top 10 Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
              {leaderboardData.map((entry) => (
                <div
                  key={entry.rank}
                  className={`p-4 mx-4 rounded-lg border transition-all hover:shadow-md ${getRankStyle(entry.rank)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                        <span className="font-bold text-lg text-gray-700">
                          #{entry.rank}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{entry.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>{entry.submissions} submissions</span>
                          <span>•</span>
                          <span>{entry.averageScore}% avg</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getGradeBadgeColor(entry.grade)}>
                        {entry.grade}
                      </Badge>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-900">
                          {entry.score.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">points</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to Join the Competition?</h3>
            <p className="text-blue-100 mb-4">
              Upload your text images and climb the leaderboard!
            </p>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Grading
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 