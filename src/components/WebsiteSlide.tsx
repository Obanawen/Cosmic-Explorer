import React from 'react';
import { Button } from './ui/button';

export default function WebsiteSlide() {
  return (
    <section className="bg-gradient-to-br from-indigo-100 to-blue-50 rounded-xl shadow-lg p-8 mb-8 max-w-3xl mx-auto mt-8">
      <h1 className="text-4xl font-bold mb-2 text-center text-indigo-700">Cosmic Explorer</h1>
      <p className="text-lg text-center text-gray-700 mb-6">
        Embark on a cosmic journey! Compete, explore, and track your progress through the wonders of space.
      </p>
      <ul className="list-disc list-inside text-gray-800 mb-6 space-y-1">
        <li><b>Space Stages:</b> Progress through 100+ unique, space-themed stages, each with its own challenges and discoveries.</li>
        <li><b>Competition:</b> Join competitions and test your skills against other explorers.</li>
        <li><b>Leaderboard:</b> Track your ranking and see how you compare with others.</li>
        <li><b>Profile:</b> View and manage your achievements and progress.</li>
        <li><b>Pricing:</b> Explore available plans and features for every explorer.</li>
      </ul>
      <div className="flex justify-center">
        <Button asChild>
          <a href="/stages">Start Exploring</a>
        </Button>
      </div>
    </section>
  );
} 