'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileImage, CheckCircle, XCircle, Loader2, BookOpen, Award, Download } from 'lucide-react';
import WebsiteSlide from '@/components/WebsiteSlide';

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

export default function Home() {
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

  const downloadReportAsPDF = async () => {
    if (!result) return;

    try {
      // Dynamically import jsPDF
      const { default: jsPDF } = await import('jspdf');

      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      // Add title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CKY 5A Grading Report', margin, margin);

      // Add file info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      let yPosition = margin + 15;
      
      pdf.text(`File: ${result.filename}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Size: ${formatFileSize(result.fileSize)}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Type: ${result.mimeType}`, margin, yPosition);
      yPosition += 15;

      // Add overall score
      if (result.analysis.totalScore !== undefined) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Overall Score: ${result.analysis.totalScore}/${result.analysis.maxScore}`, margin, yPosition);
        yPosition += 10;
        
        if (result.analysis.grade) {
          pdf.text(`Grade: ${result.analysis.grade}`, margin, yPosition);
          yPosition += 15;
        }
      }

      // Add categories
      if (result.analysis.categories) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Category Breakdown:', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        for (const category of result.analysis.categories) {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFont('helvetica', 'bold');
          pdf.text(`${category.category}: ${category.score}/${category.maxScore}`, margin, yPosition);
          yPosition += 5;
          
          pdf.setFont('helvetica', 'normal');
          const feedbackLines = pdf.splitTextToSize(category.feedback, pageWidth - 2 * margin);
          pdf.text(feedbackLines, margin, yPosition);
          yPosition += feedbackLines.length * 4 + 5;

          // Add specific corrections for grammar, spelling, and punctuation
          if (category.corrections && category.corrections.length > 0) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Corrections:', margin, yPosition);
            yPosition += 5;
            
            pdf.setFont('helvetica', 'normal');
            for (const correction of category.corrections) {
              if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = margin;
              }
              pdf.text(`• ${correction}`, margin + 5, yPosition);
              yPosition += 4;
            }
            yPosition += 5;
          }
        }
      }

      // Add specific corrections section
      if (result.analysis.grammarCorrections || result.analysis.spellingCorrections || result.analysis.punctuationCorrections) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Writing Corrections & Improvements:', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        // Spelling corrections
        if (result.analysis.spellingCorrections && result.analysis.spellingCorrections.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Spelling Corrections:', margin, yPosition);
          yPosition += 5;
          
          pdf.setFont('helvetica', 'normal');
          for (const correction of result.analysis.spellingCorrections) {
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(`• ${correction}`, margin + 5, yPosition);
            yPosition += 4;
          }
          yPosition += 5;
        }

        // Grammar corrections
        if (result.analysis.grammarCorrections && result.analysis.grammarCorrections.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Grammar Corrections:', margin, yPosition);
          yPosition += 5;
          
          pdf.setFont('helvetica', 'normal');
          for (const correction of result.analysis.grammarCorrections) {
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(`• ${correction}`, margin + 5, yPosition);
            yPosition += 4;
          }
          yPosition += 5;
        }

        // Punctuation corrections
        if (result.analysis.punctuationCorrections && result.analysis.punctuationCorrections.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Punctuation Corrections:', margin, yPosition);
          yPosition += 5;
          
          pdf.setFont('helvetica', 'normal');
          for (const correction of result.analysis.punctuationCorrections) {
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(`• ${correction}`, margin + 5, yPosition);
            yPosition += 4;
          }
          yPosition += 5;
        }
      }

      // Add overall feedback
      if (result.analysis.overallFeedback) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Overall Feedback:', margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const feedbackLines = pdf.splitTextToSize(result.analysis.overallFeedback, pageWidth - 2 * margin);
        pdf.text(feedbackLines, margin, yPosition);
      }

      // Save the PDF
      pdf.save(`grading-report-${result.filename}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBadgeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen p-4">
      <WebsiteSlide />
      <div className="max-w-4xl mx-auto space-y-6">




        {/* Writing Prompts Promotion */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              ✨ Need Writing Inspiration?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-purple-700">
                Get creative with our collection of writing prompts and topics
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/stages">
                  <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                    🎲 Generate Random Prompts
                  </Button>
                </Link>
                <Link href="/stages">
                  <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                    📝 Browse All Categories
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div className="text-center">
                  <span className="text-purple-600 font-medium">Creative Writing</span>
                  <p className="text-purple-500">Stories & imagination</p>
                </div>
                <div className="text-center">
                  <span className="text-purple-600 font-medium">Academic</span>
                  <p className="text-purple-500">Research & analysis</p>
                </div>
                <div className="text-center">
                  <span className="text-purple-600 font-medium">Personal</span>
                  <p className="text-purple-500">Reflection & growth</p>
                </div>
                <div className="text-center">
                  <span className="text-purple-600 font-medium">Business</span>
                  <p className="text-purple-500">Professional topics</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Card */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Grading Results
                </div>
                <Button
                  onClick={downloadReportAsPDF}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF Report
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Info */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Filename</p>
                  <p className="text-sm text-gray-900">{result.filename}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">File Size</p>
                  <p className="text-sm text-gray-900">{formatFileSize(result.fileSize)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-sm text-gray-900">{result.mimeType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Analysis</p>
                  <p className="text-sm text-gray-900">{result.analysisType || 'Content Grading'}</p>
                </div>
              </div>

              {/* Optimization Info */}
              {result.optimization && result.optimization.wasOptimized && (
                <div className="p-4 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-green-800">Image Automatically Optimized</p>
                  </div>
                  <p className="text-sm text-green-700 mb-1">
                    Original size: {result.optimization.originalSize} → Optimized for better OCR performance
                  </p>
                  <p className="text-xs text-green-600">{result.optimization.note}</p>
                </div>
              )}

              {/* Large file warning */}
              {file && file.size > 5 * 1024 * 1024 && (
                <div className="p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm font-medium text-blue-800">Large File Detected</p>
                  </div>
                  <p className="text-sm text-blue-700">
                    Files over 5MB will be automatically optimized for faster processing and better text recognition.
                  </p>
                </div>
              )}

              {/* Overall Score */}
              {result.analysis.totalScore !== undefined && (
                <div className="text-center p-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-lg">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-gray-900">
                        {result.analysis.totalScore}/{result.analysis.maxScore}
                      </p>
                      <p className="text-sm text-gray-500">Total Score</p>
                    </div>
                    {result.analysis.grade && (
                      <Badge className={`text-lg px-4 py-2 ${getGradeBadgeColor(result.analysis.grade)}`}>
                        Grade: {result.analysis.grade}
                      </Badge>
                    )}
                  </div>
                  <div className="w-full h-3">
                    <Progress 
                      value={(result.analysis.totalScore / (result.analysis.maxScore || 100)) * 100} 
                    />
                  </div>
                </div>
              )}

              {/* Category Breakdown */}
              {result.analysis.categories && result.analysis.categories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                  <div className="space-y-4">
                    {result.analysis.categories.map((category, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white/90 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{category.category}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getScoreColor(category.score, category.maxScore)}`}>
                              {category.score}/{category.maxScore}
                            </span>
                            <div className="w-20 h-2">
                              <Progress 
                                value={(category.score / category.maxScore) * 100} 
                              />
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">{category.feedback}</p>
                        
                        {/* Grammar, Spelling, and Punctuation Specific Feedback */}
                        {(category.category === 'Grammar' || category.category === 'Spelling' || category.category === 'Punctuation') && (
                                                      <div className="mb-3 p-3 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-lg">
                            <h5 className="text-sm font-medium text-blue-800 mb-2">
                              📝 {category.category} Analysis
                            </h5>
                            
                            {/* Issues Found */}
                            {category.issues && category.issues.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-red-600 mb-1">Issues Found:</p>
                                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                                  {category.issues.map((issue, i) => (
                                    <li key={i}>{issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Specific Corrections */}
                            {category.corrections && category.corrections.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-green-600 mb-1">Corrections:</p>
                                <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
                                  {category.corrections.map((correction, i) => (
                                    <li key={i} className="font-mono">{correction}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Suggestions */}
                            {category.suggestions && category.suggestions.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">Improvement Suggestions:</p>
                                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                                  {category.suggestions.map((suggestion, i) => (
                                    <li key={i}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Other Categories */}
                        {category.category !== 'Grammar' && category.category !== 'Spelling' && category.category !== 'Punctuation' && (
                          <>
                            {category.issues && category.issues.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-red-600 mb-1">Issues Found:</p>
                                <ul className="text-sm text-red-700 list-disc list-inside">
                                  {category.issues.map((issue, i) => (
                                    <li key={i}>{issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {category.suggestions && category.suggestions.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">Suggestions:</p>
                                <ul className="text-sm text-blue-700 list-disc list-inside">
                                  {category.suggestions.map((suggestion, i) => (
                                    <li key={i}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Feedback */}
              {result.analysis.overallFeedback && (
                <div className="p-4 bg-blue-50/80 backdrop-blur-sm rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Overall Feedback</h4>
                  <p className="text-blue-800">{result.analysis.overallFeedback}</p>
                </div>
              )}

              {/* Strengths and Areas for Improvement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.analysis.strengths && result.analysis.strengths.length > 0 && (
                  <div className="p-4 bg-green-50/80 backdrop-blur-sm rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Strengths</h4>
                    <ul className="text-sm text-green-800 list-disc list-inside space-y-1">
                      {result.analysis.strengths.map((strength, i) => (
                        <li key={i}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.analysis.areasForImprovement && result.analysis.areasForImprovement.length > 0 && (
                  <div className="p-4 bg-orange-50/80 backdrop-blur-sm rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">Areas for Improvement</h4>
                    <ul className="text-sm text-orange-800 list-disc list-inside space-y-1">
                      {result.analysis.areasForImprovement.map((area, i) => (
                        <li key={i}>{area}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Grammar, Spelling, and Punctuation Corrections */}
              {(result.analysis.grammarCorrections || result.analysis.spellingCorrections || result.analysis.punctuationCorrections) && (
                <Card className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 backdrop-blur-sm border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      📝 Writing Corrections & Improvements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Spelling Corrections */}
                    {result.analysis.spellingCorrections && result.analysis.spellingCorrections.length > 0 && (
                      <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg">
                        <h5 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                          🔤 Spelling Corrections ({result.analysis.spellingCorrections.length} found)
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {result.analysis.spellingCorrections.map((correction, i) => (
                            <div key={i} className="text-sm font-mono bg-white px-2 py-1 rounded border">
                              {correction}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grammar Corrections */}
                    {result.analysis.grammarCorrections && result.analysis.grammarCorrections.length > 0 && (
                      <div className="p-3 bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-lg">
                        <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                          📚 Grammar Corrections ({result.analysis.grammarCorrections.length} found)
                        </h5>
                        <div className="space-y-2">
                          {result.analysis.grammarCorrections.map((correction, i) => (
                            <div key={i} className="text-sm bg-white px-3 py-2 rounded border">
                              {correction}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Punctuation Corrections */}
                    {result.analysis.punctuationCorrections && result.analysis.punctuationCorrections.length > 0 && (
                      <div className="p-3 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                          ✏️ Punctuation Corrections ({result.analysis.punctuationCorrections.length} found)
                        </h5>
                        <div className="space-y-2">
                          {result.analysis.punctuationCorrections.map((correction, i) => (
                            <div key={i} className="text-sm bg-white px-3 py-2 rounded border">
                              {correction}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Writing Tips */}
                    <div className="p-3 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                          💡 Writing Improvement Tips
                        </h5>
                        <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
                          <li>Always proofread your work before submitting</li>
                          <li>Use spell-check tools to catch spelling errors</li>
                          <li>Read your writing aloud to check for grammar issues</li>
                          <li>Pay attention to punctuation rules, especially commas and apostrophes</li>
                          <li>Maintain consistent tense throughout your writing</li>
                        </ul>
                      </div>
                  </CardContent>
                </Card>
              )}

              {/* Extracted Text */}
              {result.analysis.textExtracted && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700">
                    View Extracted Text
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-sm">
                    <pre className="whitespace-pre-wrap font-mono">{result.analysis.textExtracted}</pre>
                  </div>
                </details>
              )}

              {/* Raw Response (for debugging) */}
              {result.analysis.rawResponse && result.analysis.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700">
                    View Raw AI Response (Debug)
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {result.analysis.rawResponse}
                  </pre>
                </details>
              )}

              {/* No results message */}
              {(!result.analysis.categories || result.analysis.categories.length === 0) && 
               !result.analysis.totalScore && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No content could be analyzed in this file</p>
                  <p className="text-sm">Make sure the file contains readable text or content</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-4 text-sm text-gray-500">
          <p>Powered by CKY 5A • Built with love</p>
        </div>
      </div>
    </div>
  );
}
