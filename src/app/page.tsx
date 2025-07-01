'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileImage, CheckCircle, XCircle, Loader2, BookOpen, Award, Download } from 'lucide-react';

interface GradingCategory {
  category: string;
  score: number;
  maxScore: number;
  feedback: string;
  issues?: string[];
  suggestions?: string[];
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CKY 5A Grader</h1>
          <p className="text-gray-600 text-lg">Support PDF, DOC, TXT, MD, and image files</p>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
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
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
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
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
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
                      <div key={index} className="border rounded-lg p-4 bg-white">
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Feedback */}
              {result.analysis.overallFeedback && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Overall Feedback</h4>
                  <p className="text-blue-800">{result.analysis.overallFeedback}</p>
                </div>
              )}

              {/* Strengths and Areas for Improvement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.analysis.strengths && result.analysis.strengths.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Strengths</h4>
                    <ul className="text-sm text-green-800 list-disc list-inside space-y-1">
                      {result.analysis.strengths.map((strength, i) => (
                        <li key={i}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.analysis.areasForImprovement && result.analysis.areasForImprovement.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">Areas for Improvement</h4>
                    <ul className="text-sm text-orange-800 list-disc list-inside space-y-1">
                      {result.analysis.areasForImprovement.map((area, i) => (
                        <li key={i}>{area}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

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
