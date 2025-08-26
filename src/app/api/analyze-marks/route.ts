import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as mammoth from 'mammoth';

// Create OpenAI client lazily to avoid build-time errors
function getOpenAIClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3020",
      "X-Title": "AI Mark Checker",
    },
  });
}

async function optimizeImageForOCR(buffer: Buffer, originalSize: number): Promise<{ buffer: Buffer, format: string, compressionRatio: number }> {
  try {
    const sharp = (await import('sharp')).default;
    
    console.log(`Original image size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
    
    // Get image metadata
    const image = sharp(buffer);
    const metadata = await image.metadata();
    console.log(`Original dimensions: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);
    
    // Determine optimal processing based on image characteristics
    let processedImage = image;
    
    // Resize if image is too large (optimal for OCR is usually 1500-2000px width)
    const maxWidth = 2000;
    
    if (metadata.width && metadata.width > maxWidth) {
      console.log(`Resizing image from ${metadata.width}px to ${maxWidth}px width`);
      processedImage = processedImage.resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }
    
    // Enhance for better OCR
    processedImage = processedImage
      // Increase sharpness for better text recognition
      .sharpen({ sigma: 1, m1: 1, m2: 2 })
      // Enhance contrast for better text/background separation
      .modulate({ 
        brightness: 1.1,  // Slightly brighter
        saturation: 0.8,  // Reduce saturation to focus on text
        hue: 0 
      })
      // Normalize to improve contrast
      .normalize();
    
    // Choose optimal format based on content and size requirements
    let outputBuffer: Buffer;
    let outputFormat: string;
    
    // For text-heavy images, PNG usually works better
    // For photos with text, high-quality JPEG is more efficient
    const isLikelyTextDocument = metadata.channels === 1 || 
                                 (metadata.density && metadata.density > 150) ||
                                 originalSize < 1024 * 1024; // Less than 1MB likely a screenshot/document
    
    if (isLikelyTextDocument) {
      // Use PNG for text documents/screenshots - better for text quality
      outputBuffer = await processedImage
        .png({ 
          quality: 90, 
          compressionLevel: 9,
          palette: true // Use palette for smaller file size when possible
        })
        .toBuffer();
      outputFormat = 'image/png';
    } else {
      // Use high-quality JPEG for photos with text - better compression
      outputBuffer = await processedImage
        .jpeg({ 
          quality: 85,
          progressive: true,
          mozjpeg: true // Better compression
        })
        .toBuffer();
      outputFormat = 'image/jpeg';
    }
    
    const newSize = outputBuffer.length;
    const compressionRatio = originalSize / newSize;
    
    console.log(`Optimized image size: ${(newSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Compression ratio: ${compressionRatio.toFixed(2)}x smaller`);
    console.log(`Output format: ${outputFormat}`);
    
    // If optimization didn't help much and file is still large, try more aggressive compression
    if (newSize > 2 * 1024 * 1024) { // Still larger than 2MB
      console.log('Applying more aggressive compression...');
      
      if (outputFormat === 'image/png') {
        outputBuffer = await sharp(outputBuffer)
          .jpeg({ quality: 75, progressive: true, mozjpeg: true })
          .toBuffer();
        outputFormat = 'image/jpeg';
      } else {
        outputBuffer = await sharp(outputBuffer)
          .jpeg({ quality: 70, progressive: true, mozjpeg: true })
          .toBuffer();
      }
      
      const finalSize = outputBuffer.length;
      console.log(`Final optimized size: ${(finalSize / 1024 / 1024).toFixed(2)}MB`);
    }
    
    return {
      buffer: outputBuffer,
      format: outputFormat,
      compressionRatio: compressionRatio
    };
    
  } catch (error) {
    console.error('Error optimizing image:', error);
    // If optimization fails, return original
    return {
      buffer: buffer,
      format: 'image/jpeg', // Default fallback
      compressionRatio: 1
    };
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    // Handle PDF files (both text-based and image-based)
    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(buffer, fileName);
    }

    // Handle DOC/DOCX files
    if (mimeType === 'application/msword' || 
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    // Handle plain text and markdown files
    if (mimeType === 'text/plain' || mimeType === 'text/markdown' || 
        fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return buffer.toString('utf-8');
    }

    // For other file types, return empty string
    return '';
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from ${file.name}`);
  }
}

// Basic local heuristic analyzer used when no OpenRouter API key is configured
function localAnalyzeText(text: string) {
  const cleaned = text.trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Heuristic spelling issues: simple common mistakes list
  const commonMistakes: Record<string, string> = {
    recieve: 'receive',
    occured: 'occurred',
    seperate: 'separate',
    definitly: 'definitely',
    goverment: 'government',
    beleive: 'believe',
    enviroment: 'environment',
  };
  const spellingIssues: string[] = [];
  const spellingCorrections: string[] = [];
  for (const [wrong, right] of Object.entries(commonMistakes)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    if (regex.test(cleaned)) {
      spellingIssues.push(`'${wrong}' should be '${right}'`);
      spellingCorrections.push(`${wrong} → ${right}`);
    }
  }
  const spellingErrorsCount = spellingIssues.length;
  const spellingScore = Math.max(0, 15 - Math.min(6, spellingErrorsCount) * 2);

  // Heuristic grammar: penalize long sentences and multiple consecutive spaces
  const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 25).length;
  const multiSpaces = /\s{2,}/.test(cleaned) ? 1 : 0;
  const grammarIssues = [
    ...(longSentences ? [`${longSentences} overly long sentence(s)`] : []),
    ...(multiSpaces ? ['Multiple spaces detected'] : []),
  ];
  const grammarCorrections: string[] = [];
  if (longSentences) grammarCorrections.push('Split long sentences into shorter ones for clarity');
  if (multiSpaces) grammarCorrections.push('Reduce multiple spaces to single spaces');
  const grammarPenalty = longSentences * 3 + multiSpaces * 2;
  const grammarScore = Math.max(0, 25 - Math.min(20, grammarPenalty));

  // Heuristic punctuation: check missing terminal punctuation and comma overuse
  const endsWithPunct = /[.!?]$/.test(cleaned);
  const manyCommas = (cleaned.match(/,/g) || []).length > Math.max(3, sentences.length);
  const punctuationIssues: string[] = [];
  const punctuationCorrections: string[] = [];
  if (!endsWithPunct && cleaned.length > 0) {
    punctuationIssues.push('Text does not end with terminal punctuation');
    punctuationCorrections.push('Add a period at the end of the last sentence');
  }
  if (manyCommas) {
    punctuationIssues.push('Possible comma overuse');
    punctuationCorrections.push('Review comma usage; consider periods or semicolons');
  }
  const punctuationPenalty = (endsWithPunct ? 0 : 3) + (manyCommas ? 2 : 0);
  const punctuationScore = Math.max(0, 15 - punctuationPenalty);

  // Length scoring
  const lengthScore = wordCount < 50 ? 3 : wordCount <= 300 ? 10 : 6;

  // Vocabulary/wording heuristic: average word length and unique ratio
  const avgWordLen = words.reduce((a, w) => a + w.length, 0) / (words.length || 1);
  const uniqueRatio = new Set(words.map(w => w.toLowerCase())).size / (words.length || 1);
  let vocabScore = 15;
  if (avgWordLen < 3.8) vocabScore -= 3;
  if (uniqueRatio < 0.35) vocabScore -= 3;
  vocabScore = Math.max(5, Math.min(15, Math.round(vocabScore)));

  // Content quality heuristic: sentence count and crude coherence proxy
  const qualityBase = Math.min(10, Math.max(4, Math.round(sentences.length)));
  const qualityBonus = avgWordLen > 4.5 ? 2 : 0;
  const contentQuality = Math.max(8, Math.min(20, qualityBase + qualityBonus));

  const categories = [
    {
      category: 'Spelling',
      score: spellingScore,
      maxScore: 15,
      feedback: spellingErrorsCount === 0 ? 'No common spelling errors detected' : 'Some common spelling mistakes found',
      issues: spellingIssues,
      suggestions: ['Proofread for common patterns', 'Use a spell-check tool'],
      corrections: spellingCorrections,
    },
    {
      category: 'Grammar',
      score: grammarScore,
      maxScore: 25,
      feedback: grammarIssues.length === 0 ? 'No obvious grammar issues detected' : 'Some sentence-level issues detected',
      issues: grammarIssues,
      suggestions: ['Keep sentences concise', 'Maintain consistent spacing'],
      corrections: grammarCorrections,
    },
    {
      category: 'Punctuation',
      score: punctuationScore,
      maxScore: 15,
      feedback: punctuationIssues.length === 0 ? 'Punctuation looks generally fine' : 'Minor punctuation concerns detected',
      issues: punctuationIssues,
      suggestions: ['End sentences with proper punctuation', 'Avoid comma overuse'],
      corrections: punctuationCorrections,
    },
    {
      category: 'Content Length',
      score: lengthScore,
      maxScore: 10,
      feedback: wordCount < 50 ? 'Too short' : wordCount <= 300 ? 'Appropriate length' : 'Slightly long',
      issues: [],
      suggestions: [],
      corrections: [],
    },
    {
      category: 'Wording and Vocabulary',
      score: vocabScore,
      maxScore: 15,
      feedback: 'Assessed based on average word length and variety',
      issues: [],
      suggestions: ['Vary word choice', 'Favor precise terms'],
      corrections: [],
    },
    {
      category: 'Content Quality',
      score: contentQuality,
      maxScore: 20,
      feedback: 'Estimated from sentence structure and length',
      issues: [],
      suggestions: ['Ensure clear flow between sentences'],
      corrections: [],
    },
  ];

  const totalScore = categories.reduce((a, c) => a + (c.score || 0), 0);

  return {
    textExtracted: cleaned.substring(0, 500) + (cleaned.length > 500 ? '...' : ''),
    totalScore,
    maxScore: 100,
    categories,
    overallFeedback: 'Local analysis used (no API key). Heuristic evaluation provided for practice.',
    grade: totalScore >= 85 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 60 ? 'C' : totalScore >= 50 ? 'D' : 'E',
    strengths: ['Automatic quick feedback without external API'],
    areasForImprovement: ['Enable OpenRouter API for higher-fidelity analysis'],
    grammarCorrections,
    spellingCorrections,
    punctuationCorrections,
  };
}

async function extractTextFromPDF(buffer: Buffer, fileName: string): Promise<string> {
  try {
    // First, try to extract text directly from PDF (for text-based PDFs)
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    
    // Check if we got meaningful text (more than just whitespace and minimal content)
    const textContent = data.text.trim();
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    
    console.log(`PDF text extraction - Word count: ${wordCount}, Text length: ${textContent.length}`);
    console.log(`PDF text preview: ${textContent.substring(0, 200)}...`);
    
    // If we got substantial text, return it
    if (wordCount > 5 && textContent.length > 20) {
      return textContent;
    }
    
    // If minimal text, this might be an image-based PDF
    console.log('PDF appears to be image-based or contains minimal text');
    return await extractTextFromImagePDF(buffer, fileName);
    
  } catch (error) {
    console.error('Error in PDF text extraction:', error);
    // If text extraction fails, try image-based extraction
    try {
      return await extractTextFromImagePDF(buffer, fileName);
    } catch (ocrError) {
      console.error('Error in PDF OCR extraction:', ocrError);
      throw new Error(`This PDF file could not be processed. It may be: 1) An image-based (scanned) PDF requiring OCR, 2) Password protected, or 3) Corrupted. Please try converting to a text-based PDF or use an image format instead.`);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function extractTextFromImagePDF(_buffer: Buffer, _fileName: string): Promise<string> {
  try {
    console.log('Attempting image-based PDF processing (advanced OCR not available in this environment)');
    // For now, return a message indicating this is an image-based PDF
    // In a production environment, you would use a service like pdf2pic + ImageMagick
    // or a cloud service like AWS Textract, Google Vision API, etc.
    throw new Error('Image-based PDF processing requires additional setup. Please convert to text-based PDF or extract text manually.');
  } catch (error) {
    console.error('Error in image-based PDF processing:', error);
    throw new Error(`This appears to be an image-based (scanned) PDF. Please convert to text-based PDF or use an image format instead.`);
  }
}

// async function extractTextFromImage(base64Image: string, mimeType: string): Promise<string> {
//   try {
//     const response = await openai.chat.completions.create({
//       model: "openai/gpt-4o-mini",
//       messages: [
//         {
//           role: "user",
//           content: [
//             {
//               type: "text",
//               text: "Please extract all visible text from this image. Return only the text content, preserving the original formatting and structure as much as possible. Do not add any commentary or analysis."
//             },
//             {
//               type: "image_url",
//               image_url: {
//                 url: `data:${mimeType};base64,${base64Image}`
//               }
//             }
//           ]
//         }
//       ],
//       max_tokens: 2000,
//       temperature: 0.1,
//     });

//     return response.choices[0]?.message?.content || '';
//   } catch (error) {
//     console.error('Error extracting text from image:', error);
//     return '';
//   }
// }

function isImageFile(file: File): boolean {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
  const fileName = file.name.toLowerCase();
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  
  return imageTypes.includes(file.type) || imageExtensions.some(ext => fileName.endsWith(ext));
}

async function analyzeTextContent(text: string): Promise<string> {
  if (!text.trim()) {
    throw new Error('No text content found to analyze');
  }

  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Please analyze the following text content and provide a detailed evaluation with scoring based on the following comprehensive marking scheme:

**COMPREHENSIVE MARKING SCHEME (Total: 100 marks)**

1. **Spelling (15 marks)** - Check for spelling errors and accuracy
   - Perfect spelling: 15 marks
   - 1-2 minor errors: 12-14 marks
   - 3-5 errors: 8-11 marks
   - 6+ errors: 0-7 marks
   - Provide specific corrections for each error

2. **Grammar (25 marks)** - Evaluate grammatical correctness and sentence structure
   - Subject-verb agreement: 5 marks
   - Tense consistency: 5 marks
   - Sentence structure: 5 marks
   - Parts of speech: 5 marks
   - Other grammatical rules: 5 marks
   - Provide specific examples of errors and corrections

3. **Punctuation (15 marks)** - Assess punctuation usage and accuracy
   - Periods, commas, semicolons: 5 marks
   - Apostrophes and quotation marks: 5 marks
   - Capitalization: 5 marks
   - Provide specific examples of incorrect usage and corrections

4. **Content Length (10 marks)** - Assess if content length is appropriate
   - Too short: 0-3 marks
   - Appropriate length: 7-10 marks
   - Too long: 4-6 marks

5. **Wording and Vocabulary (15 marks)** - Evaluate word choice and clarity
   - Word choice appropriateness: 5 marks
   - Vocabulary level: 5 marks
   - Clarity of expression: 5 marks

6. **Content Quality (20 marks)** - Assess logical flow and engagement
   - Logical flow: 10 marks
   - Content coherence: 10 marks

**Instructions:**
- Evaluate each category based on the text content provided
- Provide specific examples and corrections for grammar, spelling, and punctuation errors
- Give a score out of the maximum marks for each category
- Provide constructive feedback and suggestions for improvement
- Include specific corrections for identified errors

**Text to analyze:**
${text}

**Response Format (JSON):**
{
  "textExtracted": "${text.substring(0, 500)}...",
  "totalScore": 85,
  "maxScore": 100,
  "categories": [
    {
      "category": "Spelling",
      "score": 12,
      "maxScore": 15,
      "feedback": "Good spelling overall with 2 minor errors",
      "issues": ["'recieve' should be 'receive'", "'occured' should be 'occurred'"],
      "suggestions": ["Double-check common spelling patterns", "Use spell-check tools"],
      "corrections": ["recieve → receive", "occured → occurred"]
    },
    {
      "category": "Grammar",
      "score": 20,
      "maxScore": 25,
      "feedback": "Generally good grammar with some tense inconsistencies",
      "issues": ["Mixed past and present tense in paragraph 2", "Missing subject in sentence 3"],
      "suggestions": ["Maintain consistent tense throughout", "Ensure every sentence has a clear subject"],
      "corrections": ["'I went' should be 'I go' for consistency", "Add 'The student' at beginning of sentence"]
    },
    {
      "category": "Punctuation",
      "score": 13,
      "maxScore": 15,
      "feedback": "Good punctuation with minor comma issues",
      "issues": ["Missing comma after introductory phrase", "Incorrect semicolon usage"],
      "suggestions": ["Review comma rules for introductory elements", "Use semicolons to connect related independent clauses"],
      "corrections": ["Add comma after 'However'", "Replace semicolon with comma in compound sentence"]
    }
  ],
  "overallFeedback": "Good effort with room for improvement in grammar consistency and punctuation",
  "grade": "B+",
  "strengths": ["Clear content structure", "Good vocabulary usage"],
  "areasForImprovement": ["Grammar consistency", "Punctuation accuracy"],
  "grammarCorrections": ["List of specific grammar corrections"],
  "spellingCorrections": ["List of specific spelling corrections"],
  "punctuationCorrections": ["List of specific punctuation corrections"]
}`
      }
    ],
    max_tokens: 2500,
    temperature: 0.1,
  });

  return response.choices[0]?.message?.content || '';
}

async function analyzeImageContent(file: File): Promise<string> {
  const originalBuffer = Buffer.from(await file.arrayBuffer());
  const originalSize = originalBuffer.length;

  console.log(`Processing image: ${file.name}, original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB, type: ${file.type}`);

  // Optimize image for better OCR and smaller API calls
  const optimized = await optimizeImageForOCR(originalBuffer, originalSize);
  const base64Image = optimized.buffer.toString('base64');
  const mimeType = optimized.format;

  console.log(`Using optimized image: ${(optimized.buffer.length / 1024 / 1024).toFixed(2)}MB (${optimized.compressionRatio.toFixed(1)}x smaller)`);

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze the text content in this image and provide a detailed evaluation.

First, carefully examine the image and extract ALL visible text. Then evaluate the text using this comprehensive marking scheme:

**COMPREHENSIVE MARKING SCHEME (Total: 100 marks)**

1. **Spelling (15 marks)** - Check for spelling errors and accuracy
   - Perfect spelling: 15 marks
   - 1-2 minor errors: 12-14 marks
   - 3-5 errors: 8-11 marks
   - 6+ errors: 0-7 marks
   - Provide specific corrections for each error

2. **Grammar (25 marks)** - Evaluate grammatical correctness and sentence structure
   - Subject-verb agreement: 5 marks
   - Tense consistency: 5 marks
   - Sentence structure: 5 marks
   - Parts of speech: 5 marks
   - Other grammatical rules: 5 marks
   - Provide specific examples of errors and corrections

3. **Punctuation (15 marks)** - Assess punctuation usage and accuracy
   - Periods, commas, semicolons: 5 marks
   - Apostrophes and quotation marks: 5 marks
   - Capitalization: 5 marks
   - Provide specific examples of incorrect usage and corrections

4. **Content Length (10 marks)** - Assess if content length is appropriate
   - Too short: 0-3 marks
   - Appropriate length: 7-10 marks
   - Too long: 4-6 marks

5. **Wording and Vocabulary (15 marks)** - Evaluate word choice and clarity
   - Word choice appropriateness: 5 marks
   - Vocabulary level: 5 marks
   - Clarity of expression: 5 marks

6. **Content Quality (20 marks)** - Assess logical flow and engagement
   - Logical flow: 10 marks
   - Content coherence: 10 marks

**CRITICAL: If no readable text is found in the image, respond with:**
{
  "textExtracted": "No readable text found in this image",
  "totalScore": 0,
  "maxScore": 100,
  "categories": [],
  "overallFeedback": "No text content was detected in the uploaded image. Please ensure the image contains readable text and try again.",
  "grade": "N/A",
  "strengths": [],
  "areasForImprovement": ["Upload an image with visible text content"]
}

**If text IS found, respond with valid JSON in this exact format:**
{
  "textExtracted": "The complete text content found in the image",
  "totalScore": 85,
  "maxScore": 100,
  "categories": [
    {
      "category": "Spelling",
      "score": 12,
      "maxScore": 15,
      "feedback": "Good spelling overall with 2 minor errors",
      "issues": ["'recieve' should be 'receive'", "'occured' should be 'occurred'"],
      "suggestions": ["Double-check common spelling patterns", "Use spell-check tools"],
      "corrections": ["recieve → receive", "occured → occurred"]
    },
    {
      "category": "Grammar",
      "score": 20,
      "maxScore": 25,
      "feedback": "Generally good grammar with some tense inconsistencies",
      "issues": ["Mixed past and present tense in paragraph 2", "Missing subject in sentence 3"],
      "suggestions": ["Maintain consistent tense throughout", "Ensure every sentence has a clear subject"],
      "corrections": ["'I went' should be 'I go' for consistency", "Add 'The student' at beginning of sentence"]
    },
    {
      "category": "Punctuation",
      "score": 13,
      "maxScore": 15,
      "feedback": "Good punctuation with minor comma issues",
      "issues": ["Missing comma after introductory phrase", "Incorrect semicolon usage"],
      "suggestions": ["Review comma rules for introductory elements", "Use semicolons to connect related independent clauses"],
      "corrections": ["Add comma after 'However'", "Replace semicolon with comma in compound sentence"]
    }
  ],
  "overallFeedback": "Good effort with room for improvement in grammar consistency and punctuation",
  "grade": "B+",
  "strengths": ["Clear content structure", "Good vocabulary usage"],
  "areasForImprovement": ["Grammar consistency", "Punctuation accuracy"],
  "grammarCorrections": ["List of specific grammar corrections"],
  "spellingCorrections": ["List of specific spelling corrections"],
  "punctuationCorrections": ["List of specific punctuation corrections"]
}

Remember: Return ONLY valid JSON, no markdown formatting or additional text.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 2500,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    console.log(`Image analysis response length: ${content?.length || 0}`);
    console.log(`Image analysis response preview: ${content?.substring(0, 200)}...`);
    
    return content || '';
  } catch (error) {
    console.error('Error in image analysis:', error);
    throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const hasKey = Boolean(process.env.OPENROUTER_API_KEY);

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    let aiResponse: string;
    let analysisType: string;
    let optimizationInfo: { originalSize: string; wasOptimized: boolean; note: string } | null = null;

    // Handle different file types
    if (isImageFile(file)) {
      // Process image files with Vision API
      console.log('Processing as image file');
      
      if (!hasKey) {
        return NextResponse.json({
          error: 'Image analysis requires OpenRouter API key. For now, upload a text document or enable OPENROUTER_API_KEY.',
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }, { status: 500 });
      }

      // Check if image is large and show optimization info
      if (file.size > 1024 * 1024) { // Larger than 1MB
        console.log('Large image detected, optimization will be applied automatically');
      }
      
      aiResponse = await analyzeImageContent(file);
      analysisType = 'Image Text Content Grading (with auto-optimization)';
      
      // Add optimization info for large images
      if (file.size > 1024 * 1024) {
        optimizationInfo = {
          originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          wasOptimized: true,
          note: 'Image was automatically optimized for better OCR performance and faster processing'
        };
      }
    } else {
      // Process document files by extracting text first
      console.log('Processing as document file');
      const extractedText = await extractTextFromFile(file);
      console.log(`Extracted text length: ${extractedText.length}, preview: ${extractedText.substring(0, 100)}...`);
      
      if (!extractedText.trim()) {
        return NextResponse.json({
          success: false,
          error: 'No readable text content found in the file',
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }, { status: 400 });
      }
      
      if (!hasKey) {
        // Use local heuristic analysis
        const analysisResult = localAnalyzeText(extractedText);
        const response = {
          success: true,
          analysis: analysisResult,
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type,
          provider: 'local',
          model: 'heuristic',
          analysisType: 'Document Content Grading (local heuristic)'
        };
        return NextResponse.json(response);
      }

      aiResponse = await analyzeTextContent(extractedText);
      analysisType = 'Document Content Grading';
    }

    console.log(`AI Response length: ${aiResponse?.length || 0}`);

    // Try to parse JSON response, fallback to text if not valid JSON
    let analysisResult;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanResponse = aiResponse || '{}';
      if (cleanResponse.includes('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```/g, '');
      }
      if (cleanResponse.includes('```')) {
        cleanResponse = cleanResponse.replace(/```/g, '');
      }
      
      analysisResult = JSON.parse(cleanResponse);
      console.log('Successfully parsed JSON response');
    } catch (e) {
      console.error('JSON parsing failed:', e);
      console.log('Raw response:', aiResponse);
      
      // If JSON parsing fails, create a structured response from the text
      analysisResult = {
        textExtracted: "Could not extract content properly",
        totalScore: 0,
        maxScore: 100,
        categories: [],
        rawResponse: aiResponse,
        error: "Could not parse AI response as JSON - this might be due to no readable content in the file"
      };
    }

    const response = {
      success: true,
      analysis: analysisResult,
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type,
      provider: "OpenRouter",
      model: "openai/gpt-4o-mini",
      analysisType: analysisType,
      ...(optimizationInfo && { optimization: optimizationInfo })
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error analyzing file:', error);
    
    // Handle specific OpenRouter errors
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { 
            error: 'Invalid OpenRouter API key. Please check your OPENROUTER_API_KEY in .env.local',
            details: error.message
          }, 
          { status: 401 }
        );
      }
      
      if (error.message.includes('insufficient credits')) {
        return NextResponse.json(
          { 
            error: 'Insufficient credits in your OpenRouter account',
            details: error.message
          }, 
          { status: 402 }
        );
      }

      if (error.message.includes('Failed to extract text')) {
        return NextResponse.json(
          { 
            error: 'Could not process the uploaded file. Please ensure it contains readable text.',
            details: error.message
          }, 
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze file content',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 