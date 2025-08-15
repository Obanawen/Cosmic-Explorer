'use client';

import React, { useState } from 'react';
import { useStageProgress } from '@/lib/stageProgress';
import { scoreToGrade, getGradeColor, getGradeDescription, getScoreMessage, getGradeEncouragement, getMilestoneMessage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, TrendingUp, Award, BookOpen, Zap, Crown, Rocket, Sparkles, Settings, X, Check } from 'lucide-react';

// Character skin options
const characterSkins = [
	{ id: 'boy', name: 'Boy', emoji: '👦', color: 'bg-blue-200' },
	{ id: 'girl', name: 'Girl', emoji: '👧', color: 'bg-pink-200' },
	{ id: 'witch', name: 'Witch', emoji: '🧙‍♀️', color: 'bg-purple-200' },
	{ id: 'santa', name: 'Santa', emoji: '🎅', color: 'bg-red-200' },
	{ id: 'robot', name: 'Robot', emoji: '🤖', color: 'bg-gray-200' },
	{ id: 'alien', name: 'Alien', emoji: '👽', color: 'bg-green-200' },
	{ id: 'ninja', name: 'Ninja', emoji: '🥷', color: 'bg-black bg-opacity-20' },
	{ id: 'wizard', name: 'Wizard', emoji: '🧙‍♂️', color: 'bg-indigo-200' },
	{ id: 'princess', name: 'Princess', emoji: '👸', color: 'bg-pink-100' },
	{ id: 'knight', name: 'Knight', emoji: '🤴', color: 'bg-yellow-200' },
	{ id: 'vampire', name: 'Vampire', emoji: '🧛‍♂️', color: 'bg-red-100' },
	{ id: 'mermaid', name: 'Mermaid', emoji: '🧜‍♀️', color: 'bg-teal-200' },
	{ id: 'dragon', name: 'Dragon', emoji: '🐉', color: 'bg-orange-200' },
	{ id: 'unicorn', name: 'Unicorn', emoji: '🦄', color: 'bg-purple-100' },
	{ id: 'ghost', name: 'Ghost', emoji: '👻', color: 'bg-gray-100' },
	{ id: 'superhero', name: 'Superhero', emoji: '🦸‍♂️', color: 'bg-blue-100' },
	{ id: 'astronaut', name: 'Astronaut', emoji: '👨‍🚀', color: 'bg-slate-200' },
	{ id: 'detective', name: 'Detective', emoji: '🕵️', color: 'bg-amber-200' },
	{ id: 'chef', name: 'Chef', emoji: '👨‍🍳', color: 'bg-orange-100' },
	{ id: 'doctor', name: 'Doctor', emoji: '👨‍⚕️', color: 'bg-white bg-opacity-80' },
	{ id: 'firefighter', name: 'Firefighter', emoji: '👨‍🚒', color: 'bg-red-300' },
	{ id: 'pilot', name: 'Pilot', emoji: '👨‍✈️', color: 'bg-sky-200' },
	{ id: 'scientist', name: 'Scientist', emoji: '👨‍🔬', color: 'bg-cyan-200' },
	{ id: 'artist', name: 'Artist', emoji: '👨‍🎨', color: 'bg-violet-200' },
	{ id: 'musician', name: 'Musician', emoji: '👨‍🎤', color: 'bg-fuchsia-200' },
	{ id: 'athlete', name: 'Athlete', emoji: '🏃‍♂️', color: 'bg-emerald-200' },
	{ id: 'surfer', name: 'Surfer', emoji: '🏄‍♂️', color: 'bg-blue-300' },
	{ id: 'skier', name: 'Skier', emoji: '⛷️', color: 'bg-blue-100' },
	{ id: 'clown', name: 'Clown', emoji: '🤡', color: 'bg-red-200' },
	{ id: 'zombie', name: 'Zombie', emoji: '🧟‍♂️', color: 'bg-green-100' },
	{ id: 'skeleton', name: 'Skeleton', emoji: '💀', color: 'bg-gray-200' },
	{ id: 'angel', name: 'Angel', emoji: '👼', color: 'bg-yellow-100' },
	{ id: 'devil', name: 'Devil', emoji: '😈', color: 'bg-red-400' },
	{ id: 'fairy', name: 'Fairy', emoji: '🧚‍♀️', color: 'bg-pink-200' },
	{ id: 'genie', name: 'Genie', emoji: '🧞‍♂️', color: 'bg-purple-300' },
	{ id: 'pharaoh', name: 'Pharaoh', emoji: '👑', color: 'bg-yellow-300' },
	{ id: 'samurai', name: 'Samurai', emoji: '🗡️', color: 'bg-gray-300' },
	{ id: 'cowboy', name: 'Cowboy', emoji: '🤠', color: 'bg-amber-300' },
	{ id: 'pirate', name: 'Pirate', emoji: '🏴‍☠️', color: 'bg-black bg-opacity-30' },
	{ id: 'viking', name: 'Viking', emoji: '⚔️', color: 'bg-amber-400' },
	{ id: 'gladiator', name: 'Gladiator', emoji: '🛡️', color: 'bg-bronze-200' },
	{ id: 'spy', name: 'Spy', emoji: '🕵️‍♀️', color: 'bg-slate-300' },
	{ id: 'magician', name: 'Magician', emoji: '🎩', color: 'bg-purple-400' },
	{ id: 'jester', name: 'Jester', emoji: '🎭', color: 'bg-yellow-400' },
	{ id: 'queen', name: 'Queen', emoji: '👑', color: 'bg-purple-200' },
	{ id: 'king', name: 'King', emoji: '👑', color: 'bg-yellow-300' },
	{ id: 'prince', name: 'Prince', emoji: '🤴', color: 'bg-blue-300' },
	{ id: 'warrior', name: 'Warrior', emoji: '⚔️', color: 'bg-red-400' },
	{ id: 'archer', name: 'Archer', emoji: '🏹', color: 'bg-green-300' },
	{ id: 'sorcerer', name: 'Sorcerer', emoji: '🔮', color: 'bg-indigo-400' },
	{ id: 'alchemist', name: 'Alchemist', emoji: '🧪', color: 'bg-green-400' },
	{ id: 'inventor', name: 'Inventor', emoji: '⚙️', color: 'bg-gray-400' },
	{ id: 'explorer', name: 'Explorer', emoji: '🗺️', color: 'bg-amber-200' },
	{ id: 'treasure_hunter', name: 'Treasure Hunter', emoji: '💎', color: 'bg-yellow-500' },
	{ id: 'time_traveler', name: 'Time Traveler', emoji: '⏰', color: 'bg-blue-400' },
	{ id: 'space_captain', name: 'Space Captain', emoji: '🚀', color: 'bg-slate-400' },
	{ id: 'cyborg', name: 'Cyborg', emoji: '🤖', color: 'bg-gray-500' },
	{ id: 'mutant', name: 'Mutant', emoji: '🧬', color: 'bg-green-500' },
	{ id: 'elemental', name: 'Elemental', emoji: '🔥', color: 'bg-orange-500' },
	{ id: 'crystal_golem', name: 'Crystal Golem', emoji: '💎', color: 'bg-cyan-500' },
	{ id: 'shadow_walker', name: 'Shadow Walker', emoji: '👤', color: 'bg-gray-600' },
	{ id: 'light_bringer', name: 'Light Bringer', emoji: '✨', color: 'bg-yellow-200' },
];

export default function ProfilePage() {
	const { stageScores, getUnlockedStages } = useStageProgress();
	const unlockedStages = getUnlockedStages();

	// Avatar state
	const [showSettings, setShowSettings] = useState(false);
	const [selectedSkin, setSelectedSkin] = useState('boy');
	const getCurrentSkin = () => characterSkins.find(skin => skin.id === selectedSkin);
	const handleSkinChange = (skinId: string) => setSelectedSkin(skinId);

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
	const achievements: Array<{ icon: any, text: string, color: string }> = [];
	if (completedStages >= 10) achievements.push({ icon: Star, text: '10 Stages Master', color: 'text-yellow-600' });
	if (completedStages >= 25) achievements.push({ icon: Target, text: 'Quarter Champion', color: 'text-blue-600' });
	if (completedStages >= 50) achievements.push({ icon: Trophy, text: 'Halfway Hero', color: 'text-green-600' });
	if (completedStages >= 75) achievements.push({ icon: Rocket, text: 'Almost There', color: 'text-purple-600' });
	if (completedStages >= 100) achievements.push({ icon: Crown, text: 'Century Master', color: 'text-red-600' });
	if (gradeDistribution['A+'] > 0) achievements.push({ icon: Sparkles, text: 'A+ Achiever', color: 'text-purple-600' });
	if (gradeDistribution['A'] >= 5) achievements.push({ icon: Award, text: 'A Grade Expert', color: 'text-green-600' });
	if (averageScore >= 90) achievements.push({ icon: Crown, text: 'High Performer', color: 'text-yellow-600' });

	// Motivational message based on overall performance
	const getOverallMessage = () => {
		if (completedStages === 0) return '🚀 Welcome to your cosmic journey! Start with Stage 1 and begin your adventure!';
		if (completedStages < 10) return "🌱 You're just getting started! Keep exploring and learning!";
		if (completedStages < 25) return "⭐ Great progress! You're building momentum in your cosmic journey!";
		if (completedStages < 50) return "🌟 Fantastic work! You're becoming a seasoned space explorer!";
		if (completedStages < 75) return "🚀 Incredible progress! You're more than halfway through your journey!";
		if (completedStages < 100) return "🏆 Almost there! You're in the final stretch of your cosmic adventure!";
		return '🎊 UNSTOPPABLE! You\'ve conquered all stages and are a true cosmic master!';
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

				{/* Avatar & Customization */}
				<Card className="mb-8">
					<CardHeader className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5" /> Avatar & Character
						</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center justify-between gap-4">
						<div className={`w-24 h-24 rounded-full ${getCurrentSkin()?.color} flex items-center justify-center text-6xl`}>
							{getCurrentSkin()?.emoji}
						</div>
						<div className="flex flex-col">
							<div className="text-sm text-gray-600">Current Skin</div>
							<div className="text-lg font-semibold">{getCurrentSkin()?.name}</div>
						</div>
						<button
							onClick={() => setShowSettings(true)}
							className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
						>
							Change
						</button>
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
							<Progress value={unlockedStages.length > 0 ? (completedStages / unlockedStages.length) * 100 : 0} className="h-3" />
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
											<Badge variant="outline" className={`px-3 py-1 font-bold ${getGradeColor(grade)}`}>
												{grade}
											</Badge>
											<span className="text-sm text-gray-600">{getGradeDescription(grade)}</span>
										</div>
										<span className="text-sm font-medium">{count}</span>
									</div>
								))}
							</div>
							<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
								<p className="text-sm text-blue-800 font-medium">{getGradeEncouragement(overallGrade)}</p>
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
												<Badge variant="outline" className={`px-3 py-1 font-bold ${getGradeColor(grade)}`}>
													{grade}
												</Badge>
												<div className="text-xs text-gray-500 mt-1">{getScoreMessage(score)}</div>
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

				{/* Settings Modal */}
				{showSettings && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<Card className="w-full max-w-md shadow-2xl">
							<CardHeader className="flex flex-row items-center justify-between border-b pb-4">
								<CardTitle className="flex items-center gap-2">
									<Settings className="w-5 h-5" /> Settings
								</CardTitle>
								<button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 rounded-full transition">
									<X className="w-5 h-5" />
								</button>
							</CardHeader>
							<CardContent className="pt-6">
								<div className="space-y-6">
									<div>
										<h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Character</h3>
										<div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
											{characterSkins.map((skin) => (
												<button
													key={skin.id}
													onClick={() => handleSkinChange(skin.id)}
													className={`p-2 rounded-lg border-2 transition-all ${selectedSkin === skin.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
												>
													<div className="flex flex-col items-center gap-1">
														<div className={`w-10 h-10 rounded-full ${skin.color} flex items-center justify-center text-lg`}>
															{skin.emoji}
														</div>
														<span className="text-xs font-medium text-gray-700 text-center leading-tight">{skin.name}</span>
														{selectedSkin === skin.id && (<Check className="w-3 h-3 text-blue-500" />)}
													</div>
												</button>
											))}
										</div>
									</div>
								</div>
							</CardContent>
							<CardFooter className="flex justify-end border-t pt-4">
								<button onClick={() => setShowSettings(false)} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold">Save Changes</button>
							</CardFooter>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
} 