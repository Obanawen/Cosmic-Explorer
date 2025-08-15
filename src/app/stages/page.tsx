'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, Trophy, Star, Target, Rocket, Crown } from 'lucide-react';
import { useStageProgress } from '@/lib/stageProgress';
import { scoreToGrade, getGradeColor, getScoreMessage, getMilestoneMessage } from '@/lib/utils';

const stages = Array.from({ length: 100 }, (_, i) => ({
  name: `Stage ${i + 1}: ${spaceStageName(i + 1)}`,
  description: spaceStageDescription(i + 1),
}));

function spaceStageName(n: number) {
  const names = [
    'Liftoff', 'Orbit Insertion', 'Lunar Approach', 'Asteroid Belt', 'Solar Flare',
    'Nebula Drift', 'Wormhole Entry', 'Alien Encounter', 'Black Hole Edge', 'Supernova',
    'Cosmic Dust', 'Meteor Shower', 'Satellite Relay', 'Deep Space', 'Galactic Core',
    'Comet Chase', 'Red Dwarf', 'Blue Giant', 'Pulsar Pulse', 'Quasar Quest',
    'Gravity Well', 'Dark Matter', 'Stellar Nursery', 'Exoplanet', 'Space Station',
    'Cryo Sleep', 'Terraforming', 'Astro Mining', 'Photon Storm', 'Plasma Field',
    'Event Horizon', 'Space Debris', 'Alien Ruins', 'Solar Wind', 'Gamma Burst',
    'Magnetar', 'Star Forge', 'Cosmic Strings', 'Void Crossing', 'Galactic Bridge',
    'Astro Lab', 'Space Dock', 'Moon Base', 'Ring World', 'Binary Star',
    'Space Elevator', 'Ion Drive', 'Warp Field', 'Singularity', 'Time Dilation',
    'Quantum Leap', 'Starlight', 'Aurora', 'Celestial Sphere', 'Astro Cartography',
    'Space Garden', 'Alien Jungle', 'Frozen Comet', 'Molten Planet', 'Crystal Cavern',
    'Echo Chamber', 'Gravity Lens', 'Solar Sail', 'Dark Zone', 'Nova Remnant',
    'Astro Colony', 'Spaceport', 'Alien Bazaar', 'Galactic Market', 'Star Nursery',
    'Cosmic Reef', 'Astro Outpost', 'Space Rift', 'Nebula Veil', 'Stellar Forge',
    'Astro Canyon', 'Meteor Crater', 'Alien Temple', 'Space Monolith', 'Quantum Core',
    'Astro Dome', 'Celestial Gate', 'Star Cluster', 'Astro Bridge', 'Cosmic Gate',
    'Astro Spire', 'Galactic Spiral', 'Astro Tower', 'Space Prism', 'Astro Ring',
    'Astro Vault', 'Astro Nexus', 'Astro Beacon', 'Astro Array', 'Astro Grid',
    'Astro Path', 'Astro Field', 'Astro Crest', 'Astro Peak', 'Astro Horizon'
  ];
  return names[(n - 1) % names.length];
}

function spaceStageDescription(n: number) {
  return `Embark on a cosmic journey through the wonders of space in Stage ${n}. Each stage brings new challenges and discoveries!`;
}

export default function StagesPage() {
  const { stageScores, isStageUnlocked, getUnlockedStages } = useStageProgress();
  const unlockedStages = getUnlockedStages();
  
  // Find the next stage that will unlock
  const nextStageToUnlock = unlockedStages.length < 100 ? unlockedStages.length + 1 : null;
  const nextStageProgress = nextStageToUnlock ? (stageScores[nextStageToUnlock - 1] || 0) : 0;
  const nextStageUnlockPercentage = nextStageToUnlock ? Math.min(100, (nextStageProgress / 60) * 100) : 0;

  // Get motivational message for progress
  const getProgressMessage = () => {
    if (unlockedStages.length === 0) return "🚀 Ready to begin your cosmic adventure? Start with Stage 1!";
    if (unlockedStages.length < 10) return "🌱 You're just getting started! Keep exploring!";
    if (unlockedStages.length < 25) return "⭐ Great progress! You're building momentum!";
    if (unlockedStages.length < 50) return "🌟 Fantastic work! You're becoming a seasoned explorer!";
    if (unlockedStages.length < 75) return "🚀 Incredible progress! You're more than halfway there!";
    if (unlockedStages.length < 100) return "🏆 Almost there! You're in the final stretch!";
    return "🎊 UNSTOPPABLE! You've unlocked all stages!";
  };

  // Get milestone message
  const milestoneMessage = getMilestoneMessage(unlockedStages.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Space Stages</h1>
        
        {/* Progress Summary */}
        <div className="mb-6 p-4 bg-white bg-opacity-80 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Your Progress</h2>
            <Badge variant="secondary" className="text-sm">
              {unlockedStages.length}/100 Stages Unlocked
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(unlockedStages.length / 100) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <span>Next stage unlocks at: 60+ points</span>
            <span>{Math.round((unlockedStages.length / 100) * 100)}% Complete</span>
          </div>
          
          {/* Motivational Message */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
            <p className="text-sm text-blue-800 font-medium text-center">
              {getProgressMessage()}
            </p>
          </div>

          {/* Milestone Message */}
          {milestoneMessage && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
              <div className="flex items-center justify-center gap-2 text-yellow-800">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">{milestoneMessage}</span>
              </div>
            </div>
          )}
          
          {/* Next Stage Progress */}
          {nextStageToUnlock && (
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress to Stage {nextStageToUnlock}: {nextStageProgress}/60 points
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round(nextStageUnlockPercentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${nextStageUnlockPercentage}%` }}
                ></div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-600">
                  {nextStageProgress < 30 ? "💪 Keep going! You're building momentum!" :
                   nextStageProgress < 50 ? "⭐ Great progress! You're getting closer!" :
                   "🎯 Almost there! Just a few more points!"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto p-2 bg-white bg-opacity-70 rounded-lg shadow">
          {stages.map((stage, idx) => {
            const stageId = idx + 1;
            const isUnlocked = isStageUnlocked(stageId);
            const score = stageScores[stageId] || 0;
            const hasPassed = score >= 60;
            const grade = scoreToGrade(score);

            return (
              <div key={idx} className="relative">
                {isUnlocked ? (
                  <Link href={`/stages/${stageId}`} className="contents">
                    <Button 
                      variant="outline" 
                      className={`flex flex-col items-start p-4 h-auto min-h-[100px] text-left whitespace-normal shadow hover:shadow-lg transition w-full ${
                        hasPassed ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {hasPassed ? (
                          <Trophy className="h-5 w-5 text-green-600" />
                        ) : (
                          <Unlock className="h-5 w-5 text-blue-600" />
                        )}
                        <span className="font-semibold text-lg">{stage.name}</span>
                      </div>
                      <span className="text-gray-700 text-sm mb-2">{stage.description}</span>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`font-medium ${hasPassed ? 'text-green-600' : 'text-gray-600'}`}>
                          Score: {score}/100
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-bold ${getGradeColor(grade)}`}
                        >
                          {grade}
                        </Badge>
                        {hasPassed && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            Passed
                          </Badge>
                        )}
                      </div>
                      
                      {/* Motivational message for the stage */}
                      {score > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          {getScoreMessage(score)}
                        </div>
                      )}
                    </Button>
                  </Link>
                ) : (
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      disabled
                      className="flex flex-col items-start p-4 h-auto min-h-[100px] text-left whitespace-normal w-full opacity-60 cursor-not-allowed bg-gray-100"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="h-5 w-5 text-gray-500" />
                        <span className="font-semibold text-lg text-gray-500">{stage.name}</span>
                      </div>
                      <span className="text-gray-500 text-sm mb-2">{stage.description}</span>
                      <div className="text-sm text-gray-500">
                        <span>Requires 60+ points on Stage {stageId - 1}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        🔒 Keep working on the previous stage to unlock this one!
                      </div>
                    </Button>
                    <div className="absolute inset-0 bg-gray-200 bg-opacity-20 rounded-lg"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 