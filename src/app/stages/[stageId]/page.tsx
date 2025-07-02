'use client';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, BookOpen, FileImage, Loader2, Award, XCircle, CheckCircle, Download } from 'lucide-react';
import { useState, useCallback } from 'react';

const stageNames = [
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

function getStageName(id: number) {
  return stageNames[(id - 1) % stageNames.length];
}

export default function StageUploadPage() {
  const params = useParams();
  const router = useRouter();
  const stageId = Number(params.stageId);
  const stageName = getStageName(stageId);

  // --- Upload logic copied from landing page ---
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
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
      const data = await response.json();
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

  // New: State for direct text input
  const [typedContent, setTypedContent] = useState('');
  const [typedSubmitted, setTypedSubmitted] = useState(false);

  const handleTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wordCount = typedContent.trim().split(/\s+/).filter(Boolean).length;
    let score = Math.min(100, Math.floor(wordCount / 3));
    router.push(`/stages/${stageId}/result?score=${score}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stage {stageId}: {stageName}</h1>
          <p className="text-gray-600 text-lg">Upload your document or image for this stage, or type your content below.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Document or Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-white'
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
            {file && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileImage className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
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
        {/* Direct Typing Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Type Your Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTypedSubmit} className="space-y-4">
              <textarea
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-vertical"
                placeholder="Type your answer or content for this stage..."
                value={typedContent}
                onChange={e => { setTypedContent(e.target.value); setTypedSubmitted(false); }}
                required
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Word count: {typedContent.trim().split(/\s+/).filter(Boolean).length}</span>
                <span>Score: {Math.min(100, Math.floor(typedContent.trim().split(/\s+/).filter(Boolean).length / 3))}</span>
              </div>
              <Button type="submit" className="w-full">Submit Typed Content</Button>
              {typedSubmitted && (
                <div className="text-green-600 text-center font-medium mt-2">Your content has been submitted!</div>
              )}
            </form>
          </CardContent>
        </Card>
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Grading Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm font-medium text-gray-500">Filename</p>
                <p className="text-sm text-gray-900">{result.filename}</p>
                <p className="text-sm font-medium text-gray-500 mt-2">File Size</p>
                <p className="text-sm text-gray-900">{formatFileSize(result.fileSize)}</p>
                <p className="text-sm font-medium text-gray-500 mt-2">Type</p>
                <p className="text-sm text-gray-900">{result.mimeType}</p>
              </div>
              {result.analysis && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Overall Feedback</h4>
                  <p className="text-blue-800">{result.analysis.overallFeedback || 'No feedback available.'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 