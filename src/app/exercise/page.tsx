"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileImage, CheckCircle, XCircle, Loader2, BookOpen, Award, Download } from 'lucide-react';

interface GradingCategory {
  category: string;
  score: number;
  maxScore: number;
  feedback: string;
  issues?: string[];
  suggestions?: string[];
  corrections?: string[];
}

interface AnalysisResult {
  textExtracted?: string;
  totalScore?: number;
  maxScore?: number;
  categories?: GradingCategory[];
  overallFeedback?: string;
  grade?: string;
  strengths?: string[];
  areasForImprovement?: string[];
  rawResponse?: string;
  error?: string;
  grammarCorrections?: string[];
  spellingCorrections?: string[];
  punctuationCorrections?: string[];
}

interface ApiResponse {
  success: boolean;
  analysis: AnalysisResult;
  filename: string;
  fileSize: number;
  mimeType: string;
  provider?: string;
  model?: string;
  analysisType?: string;
  optimization?: {
    originalSize: string;
    wasOptimized: boolean;
    note: string;
  };
  error?: string;
  details?: string;
}

export default function ExercisePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp'
    ];
    
    const validExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    return validTypes.includes(file.type) || hasValidExtension;
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    } else {
      setError('Please select a valid file (PDF, DOC, TXT, MD, or image file)');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDropZoneClick = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const uploadAndAnalyze = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-marks', {
        method: 'POST',
        body: formData,
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze file');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CKY 5A Grader</h1>
          <p className="text-gray-600 text-lg">Support PDF, DOC, TXT, MD, and image files</p>
          
          {/* Enhanced Description */}
          <div className="mt-4 max-w-2xl mx-auto">
            <p className="text-sm text-gray-500 mb-2">
              Advanced AI-powered assessment with comprehensive grammar, spelling, and punctuation analysis
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                🔤 Spelling (15 marks)
              </span>
              <span className="flex items-center gap-1">
                📚 Grammar (25 marks)
              </span>
              <span className="flex items-center gap-1">
                ✏️ Punctuation (15 marks)
              </span>
            </div>
          </div>
        </div>

        {/* Exercise Header */}
        <div className="text-center py-4">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Exercise</h2>
          <p className="text-lg text-gray-600 mb-6">Welcome to the Exercise page! Here you will find interactive activities and challenges to test your cosmic knowledge. Stay tuned for updates.</p>
        </div>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Document or Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleDropZoneClick}
            >
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Drop your file here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOC, TXT, MD files, and images (single image only)
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  💡 Large images (&gt;1MB) are automatically optimized for faster processing
                </p>
              </div>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp,.bmp"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="mt-4"
                type="button"
              >
                Browse Files
              </Button>
            </div>

            {/* Selected File Info */}
            {file && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileImage className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  onClick={uploadAndAnalyze}
                  disabled={uploading}
                  className="min-w-[120px]"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Analyze File
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2">
                <div className="w-full">
                  <Progress value={50} />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Analyzing content with AI grading system...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Writing Assessment Guide */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              💡 Writing Assessment Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Spelling Tips */}
              <div className="text-center">
                <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">🔤</span>
                </div>
                <h4 className="font-semibold text-red-800 mb-2">Spelling (15 marks)</h4>
                <ul className="text-xs text-red-700 text-left space-y-1">
                  <li>• Check common misspellings</li>
                  <li>• Verify word endings</li>
                  <li>• Use spell-check tools</li>
                  <li>• Review homophones</li>
                </ul>
              </div>

              {/* Grammar Tips */}
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
                <h4 className="font-semibold text-yellow-800 mb-2">Grammar (25 marks)</h4>
                <ul className="text-xs text-yellow-700 text-left space-y-1">
                  <li>• Subject-verb agreement</li>
                  <li>• Tense consistency</li>
                  <li>• Sentence structure</li>
                  <li>• Parts of speech</li>
                </ul>
              </div>

              {/* Punctuation Tips */}
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">✏️</span>
                </div>
                <h4 className="font-semibold text-blue-800 mb-2">Punctuation (15 marks)</h4>
                <ul className="text-xs text-blue-700 text-left space-y-1">
                  <li>• Commas and periods</li>
                  <li>• Apostrophes</li>
                  <li>• Capitalization</li>
                  <li>• Quotation marks</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Exercise Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚀 Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Interactive exercises and challenges are being developed to help you practice and improve your writing skills. 
              Check back soon for exciting new content!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 