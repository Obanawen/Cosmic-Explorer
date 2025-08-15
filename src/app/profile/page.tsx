'use client';
import { useStageProgress } from '@/lib/stageProgress';
import { scoreToGrade, getGradeColor, getGradeDescription, getScoreMessage, getGradeEncouragement, getMilestoneMessage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, TrendingUp, Award, BookOpen, Zap, Crown, Rocket, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  const { stageScores, getUnlockedStages } = useStageProgress();
  const unlockedStages = getUnlockedStages();
  
  // Calculate statistics
  const totalStages = 100;
  const completedStages = Object.values(stageScores).filter(score => score >= 60).length;
  const totalScore = Object.values(stageScores).reduce((sum, score) => sum + score, 0);
  const averageScore = completedStages > 0 ? Math.round(totalScore / completedStages) : 0;
  const overallGrade = scoreToGrade(averageScore);
  
  // Grade distribution
  const gradeDistribution = {
    'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0
  };
  
  Object.values(stageScores).forEach(score => {
    const grade = scoreToGrade(score);
    if (grade in gradeDistribution) {
      gradeDistribution[grade as keyof typeof gradeDistribution]++;
    }
  });

  // Top scores
  const topScores = Object.entries(stageScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([stageId, score]) => ({ stageId: parseInt(stageId), score, grade: scoreToGrade(score) }));

  // Achievements and milestones
  const achievements = [];
  if (completedStages >= 10) achievements.push({ icon: Star, text: "10 Stages Master", color: "text-yellow-600" });
  if (completedStages >= 25) achievements.push({ icon: Target, text: "Quarter Champion", color: "text-blue-600" });
  if (completedStages >= 50) achievements.push({ icon: Trophy, text: "Halfway Hero", color: "text-green-600" });
  if (completedStages >= 75) achievements.push({ icon: Rocket, text: "Almost There", color: "text-purple-600" });
  if (completedStages >= 100) achievements.push({ icon: Crown, text: "Century Master", color: "text-red-600" });
  
  // Grade achievements
  if (gradeDistribution['A+'] > 0) achievements.push({ icon: Sparkles, text: "A+ Achiever", color: "text-purple-600" });
  if (gradeDistribution['A'] >= 5) achievements.push({ icon: Award, text: "A Grade Expert", color: "text-green-600" });
  if (averageScore >= 90) achievements.push({ icon: Crown, text: "High Performer", color: "text-yellow-600" });

  // Motivational message based on overall performance
  const getOverallMessage = () => {
    if (completedStages === 0) return "🚀 Welcome to your cosmic journey! Start with Stage 1 and begin your adventure!";
    if (completedStages < 10) return "🌱 You're just getting started! Keep exploring and learning!";
    if (completedStages < 25) return "⭐ Great progress! You're building momentum in your cosmic journey!";
    if (completedStages < 50) return "🌟 Fantastic work! You're becoming a seasoned space explorer!";
    if (completedStages < 75) return "🚀 Incredible progress! You're more than halfway through your journey!";
    if (completedStages < 100) return "🏆 Almost there! You're in the final stretch of your cosmic adventure!";
    return "🎊 UNSTOPPABLE! You've conquered all stages and are a true cosmic master!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-lg text-gray-600">Track your cosmic journey and achievements</p>
        </div>

        {/* Motivational Message */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Rocket className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-blue-800">Your Cosmic Journey</h3>
            </div>
            <p className="text-blue-700 text-lg">{getOverallMessage()}</p>
          </CardContent>
        </Card>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl">{completedStages}</CardTitle>
              <CardDescription>Stages Completed</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <CardTitle className="text-2xl">{unlockedStages.length}</CardTitle>
              <CardDescription>Stages Unlocked</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">{averageScore}</CardTitle>
              <CardDescription>Average Score</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <Award className="h-8 w-8 text-purple-500" />
              </div>
              <CardTitle className="text-2xl">{overallGrade}</CardTitle>
              <CardDescription>Overall Grade</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Overall Progress
            </CardTitle>
            <CardDescription>Your journey through the cosmic stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Stages Unlocked</span>
                <span className="text-sm text-gray-600">{unlockedStages.length}/{totalStages}</span>
              </div>
              <Progress value={(unlockedStages.length / totalStages) * 100} className="h-3" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Stages Completed</span>
                <span className="text-sm text-gray-600">{completedStages}/{unlockedStages.length}</span>
              </div>
              <Progress 
                value={unlockedStages.length > 0 ? (completedStages / unlockedStages.length) * 100 : 0} 
                className="h-3" 
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Grade Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Grade Distribution
              </CardTitle>
              <CardDescription>How your scores translate to grades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(gradeDistribution).map(([grade, count]) => (
                  <div key={grade} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={`px-3 py-1 font-bold ${getGradeColor(grade)}`}
                      >
                        {grade}
                      </Badge>
                      <span className="text-sm text-gray-600">{getGradeDescription(grade)}</span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
              
              {/* Grade Encouragement */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  {getGradeEncouragement(overallGrade)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Top Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Top Scores
              </CardTitle>
              <CardDescription>Your best performances across stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topScores.length > 0 ? (
                  topScores.map(({ stageId, score, grade }, index) => (
                    <div key={stageId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <div className="font-medium">Stage {stageId}</div>
                          <div className="text-sm text-gray-600">{score}/100 points</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={`px-3 py-1 font-bold ${getGradeColor(grade)}`}
                        >
                          {grade}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {getScoreMessage(score)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No scores yet. Start your cosmic journey!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Achievements & Milestones
              </CardTitle>
              <CardDescription>Celebrate your cosmic accomplishments!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                    <achievement.icon className={`h-6 w-6 ${achievement.color}`} />
                    <span className="font-medium text-gray-800">{achievement.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grading Scale Explanation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Grading Scale</CardTitle>
            <CardDescription>Understanding how your scores translate to grades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-1">A+</div>
                <div className="text-sm text-purple-700">95-100</div>
                <div className="text-xs text-purple-600 mt-1">Exceptional</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">A</div>
                <div className="text-sm text-green-700">90-94</div>
                <div className="text-xs text-green-600 mt-1">Excellent</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">B</div>
                <div className="text-sm text-blue-700">80-89</div>
                <div className="text-xs text-blue-600 mt-1">Good</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600 mb-1">C</div>
                <div className="text-sm text-yellow-700">70-79</div>
                <div className="text-xs text-yellow-600 mt-1">Satisfactory</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600 mb-1">D</div>
                <div className="text-sm text-orange-700">60-69</div>
                <div className="text-xs text-orange-600 mt-1">Needs Improvement</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-500 mb-1">E</div>
                <div className="text-sm text-red-700">50-59</div>
                <div className="text-xs text-red-600 mt-1">Poor</div>
              </div>
              <div className="text-center p-4 bg-red-100 rounded-lg border border-red-300">
                <div className="text-2xl font-bold text-red-700 mb-1">F</div>
                <div className="text-sm text-red-800">0-49</div>
                <div className="text-xs text-red-700 mt-1">Failing</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 