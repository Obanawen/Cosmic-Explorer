import React from 'react';
import { Button } from './ui/button';
import { Star, Rocket, Trophy, Target, Sparkles, Globe, Users, Zap } from 'lucide-react';

export default function WebsiteSlide() {
  return (
    <section className="p-4 sm:p-6 lg:p-8 mb-8 max-w-4xl mx-auto mt-8">
      {/* Main Hero Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Cosmic Explorer
          </h1>
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
        </div>
        <p className="text-base sm:text-lg lg:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed px-2">
          Embark on a cosmic journey! Compete, explore, and track your progress through the wonders of space.
        </p>
      </div>
      
      {/* Call-to-Action Section */}
      <div className="text-center mb-6 sm:mb-8 p-4 sm:p-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
          <span className="text-lg sm:text-xl font-bold text-purple-300">Ready for Adventure?</span>
          <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 transform rotate-45" />
        </div>
        <p className="text-purple-200 text-base sm:text-lg">
          Every great explorer started with a single step. Your cosmic journey begins here! 🌟
        </p>
      </div>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold text-cyan-300 mb-2 sm:mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
            Core Features
          </h3>
          <ul className="space-y-2 sm:space-y-3 text-slate-200">
            <li className="flex items-start gap-2 sm:gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-cyan-300">Space Stages:</span>
                <span className="text-slate-300"> Progress through 100+ unique, space-themed stages</span>
              </div>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-cyan-300">Competition:</span>
                <span className="text-slate-300"> Join competitions and test your skills</span>
              </div>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-cyan-300">Leaderboard:</span>
                <span className="text-slate-300"> Track your ranking and compare with others</span>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold text-cyan-300 mb-2 sm:mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
            User Experience
          </h3>
          <ul className="space-y-2 sm:space-y-3 text-slate-200">
            <li className="flex items-start gap-2 sm:gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-cyan-300">Profile:</span>
                <span className="text-slate-300"> View and manage your achievements</span>
              </div>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-cyan-300">Pricing:</span>
                <span className="text-slate-300"> Explore plans for every explorer</span>
              </div>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-cyan-300">Progress Tracking:</span>
                <span className="text-slate-300"> Monitor your cosmic journey</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Achievement Preview */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6">
        <div className="text-center mb-3 sm:mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
            <span className="text-lg sm:text-xl font-bold text-amber-300">Unlock Achievements</span>
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
          </div>
          <p className="text-amber-200 text-xs sm:text-sm">Complete challenges to earn badges and recognition</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
          <div className="p-2 sm:p-3">
            <Star className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mx-auto mb-2" />
            <div className="font-semibold text-amber-300 text-sm sm:text-base">10 Stages Master</div>
            <div className="text-xs text-amber-200">Complete 10 stages</div>
          </div>
          <div className="p-2 sm:p-3">
            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mx-auto mb-2" />
            <div className="font-semibold text-amber-300 text-sm sm:text-base">Quarter Champion</div>
            <div className="text-xs text-amber-200">Top 25% in competitions</div>
          </div>
          <div className="p-2 sm:p-3">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mx-auto mb-2" />
            <div className="font-semibold text-amber-300 text-sm sm:text-base">Century Master</div>
            <div className="text-xs text-amber-200">Complete 100 stages</div>
          </div>
        </div>
      </div>
      
      {/* Call-to-Action Button */}
      <div className="text-center">
        <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105">
          <a href="/stages">
            <Rocket className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Start Exploring
          </a>
        </Button>
      </div>
    </section>
  );
} 