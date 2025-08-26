'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WritingPrompt {
  title: string;
  category: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const writingPrompts: WritingPrompt[] = [
  // Creative Writing
  {
    title: "The Last Library on Earth",
    category: "Creative Writing",
    description: "Write a story about the final library in a post-apocalyptic world and the librarian who protects its last remaining books.",
    difficulty: "Medium"
  },
  {
    title: "A Letter from Your Future Self",
    category: "Creative Writing",
    description: "Compose a letter written by your future self, offering advice and reflections on life.",
    difficulty: "Easy"
  },
  {
    title: "The Door That Shouldn't Exist",
    category: "Creative Writing",
    description: "Describe discovering a door in your house that leads somewhere impossible.",
    difficulty: "Hard"
  },
  
  // Academic Writing
  {
    title: "The Impact of Social Media on Modern Communication",
    category: "Academic",
    description: "Analyze how social media platforms have changed the way we communicate and interact.",
    difficulty: "Medium"
  },
  {
    title: "Climate Change Solutions: A Global Perspective",
    category: "Academic",
    description: "Research and present innovative solutions to climate change from different countries.",
    difficulty: "Hard"
  },
  {
    title: "The Psychology of Color in Marketing",
    category: "Academic",
    description: "Explore how different colors influence consumer behavior and purchasing decisions.",
    difficulty: "Medium"
  },
  
  // Personal Reflection
  {
    title: "A Moment That Changed Everything",
    category: "Personal",
    description: "Reflect on a single moment or decision that significantly altered the course of your life.",
    difficulty: "Easy"
  },
  {
    title: "What I've Learned from Failure",
    category: "Personal",
    description: "Write about a time you failed and the valuable lessons you gained from that experience.",
    difficulty: "Medium"
  },
  {
    title: "My Personal Philosophy",
    category: "Personal",
    description: "Articulate your core beliefs and values that guide your decisions and actions.",
    difficulty: "Hard"
  },
  
  // Business & Professional
  {
    title: "The Future of Remote Work",
    category: "Business",
    description: "Analyze the long-term implications of remote work on business culture and productivity.",
    difficulty: "Medium"
  },
  {
    title: "Building a Sustainable Business Model",
    category: "Business",
    description: "Design a business model that prioritizes environmental and social responsibility.",
    difficulty: "Hard"
  },
  {
    title: "Leadership Lessons from Unexpected Sources",
    category: "Business",
    description: "Identify and analyze leadership principles from non-traditional sources like nature, art, or history.",
    difficulty: "Medium"
  },
  
  // Science & Technology
  {
    title: "Artificial Intelligence in Healthcare",
    category: "Technology",
    description: "Explore the potential benefits and risks of AI integration in medical diagnosis and treatment.",
    difficulty: "Hard"
  },
  {
    title: "The Ethics of Genetic Engineering",
    category: "Science",
    description: "Debate the moral implications of human genetic modification and enhancement.",
    difficulty: "Hard"
  },
  {
    title: "How Technology Shapes Human Relationships",
    category: "Technology",
    description: "Examine how digital communication tools affect our ability to form and maintain relationships.",
    difficulty: "Medium"
  },
  
  // Historical Analysis
  {
    title: "The Most Influential Invention of the 20th Century",
    category: "History",
    description: "Argue for which technological advancement had the greatest impact on modern society.",
    difficulty: "Medium"
  },
  {
    title: "Lessons from Ancient Civilizations",
    category: "History",
    description: "What can modern societies learn from the rise and fall of ancient civilizations?",
    difficulty: "Hard"
  },
  {
    title: "A Day in the Life of a Historical Figure",
    category: "History",
    description: "Write a detailed account of an ordinary day in the life of a famous historical person.",
    difficulty: "Easy"
  }
];

const difficultyColors = {
  Easy: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Hard: "bg-red-100 text-red-800"
};

const categoryColors = {
  "Creative Writing": "bg-blue-100 text-blue-800",
  "Academic": "bg-purple-100 text-purple-800",
  "Personal": "bg-pink-100 text-pink-800",
  "Business": "bg-indigo-100 text-indigo-800",
  "Technology": "bg-cyan-100 text-cyan-800",
  "Science": "bg-emerald-100 text-emerald-800",
  "History": "bg-orange-100 text-orange-800"
};

export default function WritingPrompts() {
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(null);
  const [usedPrompts, setUsedPrompts] = useState<Set<number>>(new Set());

  const generateRandomPrompt = () => {
    const availablePrompts = writingPrompts.filter((_, index) => !usedPrompts.has(index));
    
    if (availablePrompts.length === 0) {
      // Reset used prompts if all have been used
      setUsedPrompts(new Set());
      const randomIndex = Math.floor(Math.random() * writingPrompts.length);
      setCurrentPrompt(writingPrompts[randomIndex]);
      setUsedPrompts(new Set([randomIndex]));
    } else {
      const randomPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
      const promptIndex = writingPrompts.indexOf(randomPrompt);
      setCurrentPrompt(randomPrompt);
      setUsedPrompts(prev => new Set([...prev, promptIndex]));
    }
  };

  const generatePromptByCategory = (category: string) => {
    const categoryPrompts = writingPrompts.filter(prompt => prompt.category === category);
    const randomPrompt = categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
    setCurrentPrompt(randomPrompt);
  };

  const generatePromptByDifficulty = (difficulty: WritingPrompt['difficulty']) => {
    const difficultyPrompts = writingPrompts.filter(prompt => prompt.difficulty === difficulty);
    const randomPrompt = difficultyPrompts[Math.floor(Math.random() * difficultyPrompts.length)];
    setCurrentPrompt(randomPrompt);
  };

  useEffect(() => {
    // Generate initial prompt on component mount
    generateRandomPrompt();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Writing Prompts Generator</h1>
        <p className="text-gray-600">Get inspired with random writing topics and creative challenges</p>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={generateRandomPrompt} variant="default">
          🎲 Random Prompt
        </Button>
        
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(writingPrompts.map(p => p.category))).map(category => (
            <Button
              key={category}
              onClick={() => generatePromptByCategory(category)}
              variant="outline"
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {(['Easy', 'Medium', 'Hard'] as const).map(difficulty => (
            <Button
              key={difficulty}
              onClick={() => generatePromptByDifficulty(difficulty)}
              variant="outline"
              size="sm"
            >
              {difficulty}
            </Button>
          ))}
        </div>
      </div>

      {/* Current Prompt Display */}
      {currentPrompt && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={categoryColors[currentPrompt.category as keyof typeof categoryColors]}>
                {currentPrompt.category}
              </Badge>
              <Badge className={difficultyColors[currentPrompt.difficulty]}>
                {currentPrompt.difficulty}
              </Badge>
            </div>
            <CardTitle className="text-2xl text-center">{currentPrompt.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-lg leading-relaxed text-center">
              {currentPrompt.description}
            </p>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Writing Tips:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Take 5 minutes to brainstorm ideas before writing</li>
                <li>• Set a timer for focused writing sessions</li>
                <li>• Don't worry about perfection - just start writing</li>
                <li>• Consider different perspectives and viewpoints</li>
                <li>• Use sensory details to make your writing vivid</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="text-center text-sm text-gray-500">
        <p>Used prompts: {usedPrompts.size} / {writingPrompts.length}</p>
        {usedPrompts.size === writingPrompts.length && (
          <p className="text-green-600 font-medium">🎉 All prompts have been used! Click "Random Prompt" to start over.</p>
        )}
      </div>
    </div>
  );
}
