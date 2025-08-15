import React from 'react';
import { Button } from './ui/button';
import { Star, Rocket, Trophy, Target } from 'lucide-react';

export default function WebsiteSlide() {
  return (
    <section className="bg-gradient-to-br from-indigo-100 to-blue-50 rounded-xl shadow-lg p-8 mb-8 max-w-3xl mx-auto mt-8">
      <h1 className="text-4xl font-bold mb-2 text-center text-indigo-700">Cosmic Explorer</h1>
      <p className="text-lg text-center text-gray-700 mb-6">
        Embark on a cosmic journey! Compete, explore, and track your progress through the wonders of space.
      </p>
      
      {/* Motivational Message */}
      <div className="text-center mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Rocket className="h-5 w-5 text-purple-600" />
          <span className="text-lg font-semibold text-purple-800">Ready for Adventure?</span>
        </div>
        <p className="text-purple-700">
          Every great explorer started with a single step. Your cosmic journey begins here! 🌟
        </p>
      </div>
      
      <ul className="list-disc list-inside text-gray-800 mb-6 space-y-1">
        <li><b>Space Stages:</b> Progress through 100+ unique, space-themed stages, each with its own challenges and discoveries.</li>
        <li><b>Competition:</b> Join competitions and test your skills against other explorers.</li>
        <li><b>Leaderboard:</b> Track your ranking and see how you compare with others.</li>
        <li><b>Profile:</b> View and manage your achievements and progress.</li>
        <li><b>Pricing:</b> Explore available plans and features for every explorer.</li>
      </ul>
      
      {/* Achievement Preview */}
      <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <span className="font-semibold text-yellow-800">Unlock Achievements</span>
        </div>
        <div className="flex justify-center gap-4 text-sm text-yellow-700">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            10 Stages Master
          </span>
          <span className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Quarter Champion
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            Century Master
          </span>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button asChild>
          <a href="/stages">Start Exploring</a>
        </Button>
      </div>
    </section>
  );
} 