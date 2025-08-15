"use client";

import React from "react";
import { User, Settings, Star, Award, Flame, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex flex-col items-center py-12 px-2">
      {/* Profile Card */}
      <Card className="w-full max-w-md mb-8 shadow-xl">
        <CardHeader className="flex flex-col items-center gap-2 border-b pb-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-green-200 flex items-center justify-center mb-2">
            <User className="w-16 h-16 text-green-600" />
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
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition">
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
    </div>
  );
} 