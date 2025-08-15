"use client";

import React, { useState } from "react";
import { User, Settings, Star, Award, Flame, Shield, X, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState('boy');

  const handleSkinChange = (skinId: string) => {
    setSelectedSkin(skinId);
    // Here you would typically save this to your backend/database
    console.log('Selected skin:', skinId);
  };

  const getCurrentSkin = () => characterSkins.find(skin => skin.id === selectedSkin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex flex-col items-center py-12 px-2">
      {/* Profile Card */}
      <Card className="w-full max-w-md mb-8 shadow-xl">
        <CardHeader className="flex flex-col items-center gap-2 border-b pb-6">
          {/* Avatar with selected skin */}
          <div className={`w-24 h-24 rounded-full ${getCurrentSkin()?.color} flex items-center justify-center mb-2 text-6xl`}>
            {getCurrentSkin()?.emoji}
          </div>
          {/* Username & Level */}
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            @username
            <Badge className="bg-yellow-400 text-yellow-900 ml-2">Level 5</Badge>
          </CardTitle>
          <span className="text-gray-500 text-sm">Cosmic Explorer</span>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 mt-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between mb-1 text-xs text-gray-500">
              <span>XP</span>
              <span>1,250 / 2,000</span>
            </div>
            <Progress value={62} />
          </div>
          {/* Streak & Stats */}
          <div className="flex justify-between text-center mt-2">
            <div>
              <span className="text-lg font-semibold text-orange-500 flex items-center justify-center gap-1">🔥 7</span>
              <div className="text-xs text-gray-400">Day Streak</div>
            </div>
            <div>
              <span className="text-lg font-semibold text-blue-600 flex items-center justify-center gap-1">⭐ 1,250</span>
              <div className="text-xs text-gray-400">XP</div>
            </div>
            <div>
              <span className="text-lg font-semibold text-green-600 flex items-center justify-center gap-1">12</span>
              <div className="text-xs text-gray-400">Lessons</div>
            </div>
          </div>
          {/* More Info */}
          <div className="flex flex-col gap-1 mt-2 text-sm text-gray-500">
            <div><span className="font-semibold text-gray-700">Email:</span> user@email.com</div>
            <div><span className="font-semibold text-gray-700">Joined:</span> Jan 1, 2024</div>
            <div><span className="font-semibold text-gray-700">Skin:</span> {getCurrentSkin()?.name}</div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition"
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </CardFooter>
      </Card>

      {/* Achievements & Badges */}
      <div className="w-full max-w-md grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-yellow-400" /> Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 mt-2">
            <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1"><Flame className="w-3 h-3" /> 7 Day Streak</Badge>
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><Award className="w-3 h-3" /> 1,000 XP</Badge>
            <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1"><Shield className="w-3 h-3" /> 10 Lessons</Badge>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-yellow-500" /> Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 mt-2">
            <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><Star className="w-3 h-3" /> Gold Star</Badge>
            <Badge className="bg-pink-100 text-pink-800 flex items-center gap-1"><Award className="w-3 h-3" /> Top Learner</Badge>
            <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1"><Shield className="w-3 h-3" /> Consistency</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" /> Settings
              </CardTitle>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Character Skin Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Character</h3>
                  <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                    {characterSkins.map((skin) => (
                      <button
                        key={skin.id}
                        onClick={() => handleSkinChange(skin.id)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          selectedSkin === skin.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-10 h-10 rounded-full ${skin.color} flex items-center justify-center text-lg`}>
                            {skin.emoji}
                          </div>
                          <span className="text-xs font-medium text-gray-700 text-center leading-tight">{skin.name}</span>
                          {selectedSkin === skin.id && (
                            <Check className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
              >
                Save Changes
              </button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
} 