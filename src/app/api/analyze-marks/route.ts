import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as mammoth from 'mammoth';
import fs from 'fs';

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

// Dictionary cache for local spellcheck
let englishWordsSet: Set<string> | null = null;
async function ensureEnglishDictionary(): Promise<Set<string> | null> {
  if (englishWordsSet) return englishWordsSet;
  try {
    const wordListPath = (await import('word-list')).default as unknown as string;
    const content = fs.readFileSync(wordListPath, 'utf-8');
    const words = content.split('\n').filter(Boolean);
    englishWordsSet = new Set(words);
    return englishWordsSet;
  } catch (e) {
    console.warn('English dictionary not available; proceeding without it');
    englishWordsSet = null;
    return null;
  }
}

// Damerau-Levenshtein distance for suggestions (lightweight)
function editDistance(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  const dp: number[][] = Array.from({ length: al + 1 }, () => Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) dp[i][0] = i;
  for (let j = 0; j <= bl; j++) dp[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + cost);
      }
    }
  }
  return dp[al][bl];
}

function suggestFromDictionary(word: string, dict: Set<string>): string | null {
  const prefix = word.slice(0, 2);
  const candidates: string[] = [];
  let count = 0;
  for (const w of dict) {
    if (w.startsWith(prefix)) {
      candidates.push(w);
      count++;
      if (count >= 400) break;
    }
  }
  if (candidates.length === 0) return null;
  let best: string | null = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = editDistance(word, c);
    if (d < bestDist) {
      bestDist = d;
      best = c;
      if (d === 1) break;
    }
  }
  return bestDist <= 3 ? best : null;
}

// Basic local heuristic analyzer used when no OpenRouter API key is configured
async function localAnalyzeText(text: string, topic?: string) {
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
  // Dictionary-driven extra spelling checks
  const dict = await ensureEnglishDictionary();
  if (dict) {
    const alphaWordRegex = /^[a-zA-Z]+(?:'[a-zA-Z]+)?$/; // allow simple contractions
    const originalTokens = words.map(w => w.replace(/[^a-zA-Z'\-]/g, ''));
    const normalized = originalTokens.map(w => w.toLowerCase()).filter(Boolean);
    const contractions = new Set(["don't","can't","won't","shouldn't","couldn't","wouldn't","i'm","i've","we're","they're","it's","that's","there's","let's"]);
    const seen = new Set<string>();
    const capitalCounts: Record<string, number> = {};
    for (const tok of originalTokens) {
      if (!tok) continue;
      if (/\d/.test(tok)) continue; // skip tokens with digits
      if (/^[A-Z]{2,5}$/.test(tok)) continue; // skip short acronyms
      if (tok.includes("'")) {
        const low = tok.toLowerCase();
        if (contractions.has(low)) continue;
      }
      const low = tok.toLowerCase();
      // Track capitalized repetition as likely proper noun
      if (/^[A-Z][a-z]+$/.test(tok)) {
        capitalCounts[low] = (capitalCounts[low] || 0) + 1;
      }
    }
    for (let i = 0; i < originalTokens.length; i++) {
      const original = originalTokens[i];
      const w = normalized[i];
      if (!original || !w) continue;
      if (w.length <= 2) continue;
      if (!alphaWordRegex.test(original)) continue;
      if (seen.has(w)) continue;
      seen.add(w);
      // Proper noun heuristic: repeated capitalized word → skip
      if (capitalCounts[w] && capitalCounts[w] >= 2) continue;
      // Hyphenated words: accept if all parts are valid
      if (original.includes('-')) {
        const parts = original.split('-').map(p => p.toLowerCase()).filter(Boolean);
        if (parts.length > 1 && parts.every(p => dict.has(p))) continue;
      }
      if (!dict.has(w)) {
        spellingIssues.push(`Possibly misspelled: '${original}'`);
        const suggestion = suggestFromDictionary(w, dict);
        if (suggestion) spellingCorrections.push(`${original} → ${suggestion}`);
      }
      if (spellingIssues.length >= 30) break;
    }
  }
  const spellingErrorsCount = spellingIssues.length;
  // Harsher: 3 points off per detected common error (cap at 6 errors => 18 off)
  const cap = dict ? 8 : 6;
  const spellingScore = Math.max(0, 15 - Math.min(cap, spellingErrorsCount) * 3);

  // Heuristic grammar: expanded checks
  const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 25).length;
  const multiSpaces = /\s{2,}/.test(cleaned) ? 1 : 0;
  // Very naive verb detection to spot fragments (presence of common verb endings or auxiliaries)
  const auxiliaries = ['am','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','shall','should','can','could','may','might','must'];
  const hasVerbLike = (s: string) => /(\b\w+(ed|ing|s)\b)/i.test(s) || auxiliaries.some(a => new RegExp(`\\b${a}\\b`,`i`).test(s));
  const fragments = sentences.filter(s => s.trim().split(/\s+/).length >= 3 && !hasVerbLike(s)).length;
  // Extremely simple subject-verb agreement: third-person singular pronouns followed by bare verb (no s)
  const svPronouns = ['he','she','it'];
  const svAgreementMismatches = sentences.reduce((count, s) => {
    const tokens = s.toLowerCase().trim().split(/[^a-z']+/).filter(Boolean);
    for (let i = 0; i < tokens.length - 1; i++) {
      if (svPronouns.includes(tokens[i])) {
        const next = tokens[i + 1] || '';
        const isAux = auxiliaries.includes(next);
        const looksVerb = /[a-z]{3,}/.test(next);
        const endsWithS = /s$/.test(next);
        if (!isAux && looksVerb && !endsWithS) {
          count++;
        }
      }
    }
    return count;
  }, 0);
  // Tense consistency: presence of both many past-tense (ed) and present-tense markers
  const pastVerbMatches = cleaned.match(/\b\w+ed\b/gi) || [];
  const presentVerbMatches = cleaned.match(/\b(\w+(s|ing)|am|is|are|do|does)\b/gi) || [];
  const tenseMix = pastVerbMatches.length > 4 && presentVerbMatches.length > 4 ? 1 : 0;
  const grammarIssues = [
    ...(longSentences ? [`${longSentences} overly long sentence(s)`] : []),
    ...(fragments ? [`${fragments} possible sentence fragment(s)`] : []),
    ...(svAgreementMismatches ? [`${svAgreementMismatches} possible subject–verb agreement issue(s)`] : []),
    ...(tenseMix ? ['Mixed tenses detected'] : []),
    ...(multiSpaces ? ['Multiple spaces detected'] : []),
  ];
  const grammarCorrections: string[] = [];
  if (longSentences) grammarCorrections.push('Split long sentences into shorter ones for clarity');
  if (fragments) grammarCorrections.push('Ensure each sentence has a main verb');
  if (svAgreementMismatches) grammarCorrections.push('Match third-person singular subjects with -s verb forms');
  if (tenseMix) grammarCorrections.push('Maintain consistent tense within a paragraph');
  if (multiSpaces) grammarCorrections.push('Reduce multiple spaces to single spaces');
  const grammarPenalty = longSentences * 3 + fragments * 4 + svAgreementMismatches * 2 + tenseMix * 4 + multiSpaces * 1;
  let grammarScore = Math.max(0, 25 - Math.min(25, grammarPenalty));
  // Cap grammar score for very short texts to avoid inflated marks
  if (wordCount > 0 && wordCount < 10) {
    grammarScore = Math.min(grammarScore, 12);
  }

  // Heuristic punctuation: expanded checks for capitalization, apostrophes, quotes
  const endsWithPunct = /[.!?]$/.test(cleaned);
  const punctuationMarksCount = (cleaned.match(/[.!?]/g) || []).length;
  const manyCommas = (cleaned.match(/,/g) || []).length > Math.max(3, Math.ceil(sentences.length * 0.8));
  const manyExclaims = /!!+/.test(cleaned);
  const sentenceStartCapsMissing = sentences.filter(s => s.trim().length > 1 && /^[a-z]/.test(s.trim())).length;
  const apostropheIssuesMatches = cleaned.match(/\b(its\s+\w+|dont|cant|wont|shouldnt|couldnt|wouldnt|im|ive|lets)\b/gi) || [];
  const unbalancedQuotes = ((cleaned.match(/"/g) || []).length % 2 !== 0) || ((cleaned.match(/'/g) || []).length % 2 !== 0);
  const spaceBeforePunct = /(\s+[,.!?;:])/.test(cleaned);
  const punctuationIssues: string[] = [];
  const punctuationCorrections: string[] = [];
  if (wordCount > 0 && punctuationMarksCount === 0) {
    punctuationIssues.push('No sentence-ending punctuation found');
    punctuationCorrections.push('End sentences with a period, question mark, or exclamation mark');
  }
  if (!endsWithPunct && cleaned.length > 0) {
    punctuationIssues.push('Text does not end with terminal punctuation');
    punctuationCorrections.push('Add a period at the end of the last sentence');
  }
  if (manyCommas) {
    punctuationIssues.push('Possible comma overuse');
    punctuationCorrections.push('Review comma usage; consider periods or semicolons');
  }
  if (manyExclaims) {
    punctuationIssues.push('Excessive exclamation marks');
    punctuationCorrections.push('Limit exclamation marks to emphasize only key points');
  }
  if (sentenceStartCapsMissing) {
    punctuationIssues.push(`${sentenceStartCapsMissing} sentence(s) not capitalized`);
    punctuationCorrections.push('Capitalize the first letter of each sentence');
  }
  if (apostropheIssuesMatches.length) {
    punctuationIssues.push(`${apostropheIssuesMatches.length} possible apostrophe issue(s)`);
    punctuationCorrections.push("Use apostrophes in contractions (e.g., don't, can't) and 'it's' vs 'its' correctly");
  }
  if (unbalancedQuotes) {
    punctuationIssues.push('Unbalanced quotation marks');
    punctuationCorrections.push('Ensure quotation marks are properly paired');
  }
  if (spaceBeforePunct) {
    punctuationIssues.push('Space before punctuation mark');
    punctuationCorrections.push('Remove spaces before punctuation');
  }
  const punctuationPenalty = (endsWithPunct ? 0 : 4) + (manyCommas ? 3 : 0) + (manyExclaims ? 2 : 0) + (wordCount > 0 && punctuationMarksCount === 0 ? 8 : 0) + Math.min(3, sentenceStartCapsMissing) * 2 + Math.min(3, apostropheIssuesMatches.length) + (unbalancedQuotes ? 2 : 0) + (spaceBeforePunct ? 1 : 0);
  let punctuationScore = Math.max(0, 15 - Math.min(15, punctuationPenalty));
  // Cap punctuation score for very short texts to prevent default full marks
  if (wordCount > 0 && wordCount < 10) {
    punctuationScore = Math.min(punctuationScore, 6);
  }

  // Length scoring
  // Harsher length scoring for very short content
  const lengthScore = wordCount < 50 ? 2 : wordCount <= 120 ? 8 : wordCount <= 300 ? 10 : 6;

  // Vocabulary/wording heuristic: avoid word length or dictionary reliance
  // Focus on repetition, filler words, and use of transition phrases
  const normalizedTokens = words.map(w => w.toLowerCase().replace(/[^a-zA-Z']/g,'')).filter(Boolean);
  const tokenCounts: Record<string, number> = {};
  for (const t of normalizedTokens) tokenCounts[t] = (tokenCounts[t] || 0) + 1;
  const maxFreq = Math.max(0, ...Object.values(tokenCounts));
  const maxFreqRatio = (normalizedTokens.length ? maxFreq / normalizedTokens.length : 0);
  const fillers = new Set(['very','really','just','basically','literally','kind','sort','kinda','sorta','stuff','things','nice','good','bad','a','lot','lots']);
  const fillerCount = normalizedTokens.filter(w => fillers.has(w)).length;
  const fillerDensity = (normalizedTokens.length ? fillerCount / normalizedTokens.length : 0);
  const transitionsList = ['however','therefore','moreover','consequently','furthermore','in addition','on the other hand','for example','for instance','nevertheless','nonetheless','in contrast','similarly','additionally'];
  const normalizedText = ` ${normalizedTokens.join(' ')} `;
  const transitionsUsed = transitionsList.filter(p => normalizedText.includes(` ${p} `)).length;
  let vocabScore = 12; // baseline
  // Reward cohesive devices
  vocabScore += Math.min(3, transitionsUsed);
  // Penalize heavy repetition (cap 5)
  if (maxFreqRatio > 0.08) vocabScore -= 5;
  else if (maxFreqRatio > 0.05) vocabScore -= 3;
  else if (maxFreqRatio > 0.03) vocabScore -= 1;
  // Penalize filler density (cap 4)
  if (fillerDensity > 0.10) vocabScore -= 4;
  else if (fillerDensity > 0.06) vocabScore -= 2;
  else if (fillerDensity > 0.03) vocabScore -= 1;
  vocabScore = Math.max(5, Math.min(15, Math.round(vocabScore)));

  // Topic Relevance scoring (replaces Content Quality) – whole-text heuristic
  let topicScore = 20;
  let topicIssues: string[] = [];
  let topicSuggestions: string[] = ['Explicitly address the assigned topic'];
  let topicRelevanceFlag: boolean | undefined = undefined;
  if (topic && topic.trim().length > 0) {
    const topicTokensAll = topic.toLowerCase().split(/[^a-z']+/).filter(Boolean);
    const topicTokens = topicTokensAll.filter(t => t.length >= 3);
    const topicSet = new Set(topicTokens);
    // Build simple bigrams for topic
    const topicBigrams: string[] = [];
    for (let i = 0; i < topicTokensAll.length - 1; i++) {
      const a = topicTokensAll[i];
      const b = topicTokensAll[i + 1];
      if (a && b) topicBigrams.push(`${a} ${b}`);
    }

    const textLower = cleaned.toLowerCase();
    const textBigrams: string[] = [];
    for (let i = 0; i < normalizedTokens.length - 1; i++) {
      const a = normalizedTokens[i];
      const b = normalizedTokens[i + 1];
      if (a && b) textBigrams.push(`${a} ${b}`);
    }

    // Sentence-level coverage: count sentences with decent overlap to topic tokens/bigrams
    const sentenceTokens = sentences.map(s => s.toLowerCase().split(/[^a-z']+/).filter(Boolean));
    let coveredSentences = 0;
    for (const toks of sentenceTokens) {
      const toksSet = new Set(toks.filter(t => t.length >= 3));
      // token overlap
      let tokOverlap = 0;
      for (const t of topicSet) if (toksSet.has(t)) tokOverlap++;
      const tokRatio = toksSet.size ? tokOverlap / Math.max(4, Math.min(topicSet.size, toksSet.size)) : 0;
      // bigram overlap
      let bigramHit = 0;
      for (let i = 0; i < toks.length - 1; i++) {
        const bg = `${toks[i]} ${toks[i + 1]}`;
        if (topicBigrams.includes(bg)) { bigramHit++; break; }
      }
      if (tokRatio >= 0.2 || bigramHit > 0) coveredSentences++;
    }
    const coverageRatio = sentences.length ? coveredSentences / sentences.length : 0;

    // Global overlaps
    const textSet = new Set(normalizedTokens.filter(t => t.length >= 3));
    let overlap = 0;
    for (const t of topicSet) if (textSet.has(t)) overlap++;
    const union = topicSet.size + textSet.size - overlap;
    const jaccard = union > 0 ? overlap / union : 0;
    const bigramOverlap = topicBigrams.filter(bg => textLower.includes(bg)).length;

    // Phrase presence (title/phrase literal)
    const phraseHit = textLower.includes(topic.toLowerCase());

    // Off-topic determination uses holistic signals, not just keywords
    const offTopic = (coverageRatio < 0.15 && !phraseHit) && (jaccard < 0.02 && bigramOverlap === 0) && wordCount > 0;
    topicRelevanceFlag = !offTopic;

    if (offTopic) {
      topicScore = 0;
      topicIssues.push(`Off-topic relative to topic: "${topic}"`);
      topicSuggestions.push('Develop ideas directly connected to the topic across most sentences');
    } else {
      // Strength scoring blends coverage and overlaps
      const strength = (
        coverageRatio * 60 + // up to 60
        Math.min(20, jaccard * 100) + // up to 20
        Math.min(10, bigramOverlap * 3) + // up to ~10
        (phraseHit ? 5 : 0) + // small bonus
        Math.min(5, transitionsUsed) // cohesion bonus
      );
      if (strength >= 70) topicScore = 19 + Math.min(1, Math.floor((strength - 70) / 30));
      else if (strength >= 50) topicScore = 16 + Math.round((strength - 50) / 6); // 16-19
      else if (strength >= 30) topicScore = 12 + Math.round((strength - 30) / 4); // 12-16
      else if (strength >= 15) topicScore = 8 + Math.round((strength - 15) / 3); // 8-12
      else topicScore = 6 + Math.round(Math.max(0, strength) / 4); // 6-10
      topicScore = Math.max(6, Math.min(20, Math.round(topicScore)));
    }
  } else {
    topicScore = 20;
    topicIssues = [];
    topicSuggestions.push('Provide a topic to enable relevance scoring');
    topicRelevanceFlag = undefined;
  }

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
      feedback: 'Assessed based on repetition, filler density, and transitions',
      issues: [],
      suggestions: ['Vary word choice', 'Favor precise terms', 'Reduce filler words'],
      corrections: [],
    },
    {
      category: 'Topic Relevance',
      score: topicScore,
      maxScore: 20,
      feedback: topicRelevanceFlag === false ? 'Content appears off-topic' : 'Assessed against the provided topic',
      issues: topicIssues,
      suggestions: topicSuggestions,
      corrections: [],
    },
  ];

  let totalScore = categories.reduce((a, c) => a + (c.score || 0), 0);
  // Enforce fail if Topic Relevance < 10
  const topicCategory = categories.find(c => c.category === 'Topic Relevance');
  let passed = true;
  if (topicCategory && typeof topicCategory.score === 'number' && topicCategory.score < 10) {
    totalScore = 0;
    passed = false;
  }

  return {
    textExtracted: cleaned.substring(0, 500) + (cleaned.length > 500 ? '...' : ''),
    totalScore,
    maxScore: 100,
    categories,
    overallFeedback: passed ? 'Local analysis used (no API key). Heuristic evaluation provided for practice.' : 'Submission failed: Topic Relevance below minimum threshold.',
    grade: totalScore >= 85 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 60 ? 'C' : totalScore >= 50 ? 'D' : 'E',
    strengths: ['Automatic quick feedback without external API'],
    areasForImprovement: ['Enable OpenRouter API for higher-fidelity analysis'],
    topicRelevance: topicRelevanceFlag,
    passed,
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

async function analyzeTextContent(text: string, topic?: string): Promise<string> {
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

6. **Topic Relevance (20 marks)** - Assess how directly and consistently the writing addresses the assigned topic
   - On-topic throughout with key concepts: 18-20 marks
   - Mostly on-topic with minor drift: 14-17 marks
   - Partially on-topic: 10-13 marks
   - Weakly related: 6-9 marks
   - Off-topic: 0 marks

**Instructions:**
- Evaluate each category based on the text content provided
- Provide specific examples and corrections for grammar, spelling, and punctuation errors
- Give a score out of the maximum marks for each category
- Provide constructive feedback and suggestions for improvement
- Include specific corrections for identified errors

If a topic is provided, first assess TOPIC RELEVANCE HOLISTICALLY (not just keywords):
- Consider whether most sentences contribute to the topic, overall coherence to the topic, and alignment with the topic description.
- If off-topic, set "Topic Relevance" score to 0 and include an issue noting off-topic.

**Text to analyze:**
${text}

**Assigned topic (if any):**
${topic ?? 'None provided'}

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
  "punctuationCorrections": ["List of specific punctuation corrections"],
  "topicRelevance": true
}`
      }
    ],
    max_tokens: 2500,
    temperature: 0.1,
  });

  return response.choices[0]?.message?.content || '';
}

async function analyzeImageContent(file: File, topic?: string): Promise<string> {
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

6. **Topic Relevance (20 marks)** - Assess how directly and consistently the writing addresses the assigned topic
   - On-topic throughout with key concepts: 18-20 marks
   - Mostly on-topic with minor drift: 14-17 marks
   - Partially on-topic: 10-13 marks
   - Weakly related: 6-9 marks
   - Off-topic: 0 marks

If a topic is provided, first assess TOPIC RELEVANCE HOLISTICALLY (not just keywords):
- Consider whether most sentences contribute to the topic, overall coherence to the topic, and alignment with the topic description.
- If off-topic, set "Topic Relevance" score to 0 and include an issue noting off-topic.

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
  "punctuationCorrections": ["List of specific punctuation corrections"],
  "topicRelevance": true
}

Remember: Return ONLY valid JSON, no markdown formatting or additional text.

Assigned topic (if any): ${topic ?? 'None provided'}`
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
    const topicRaw = formData.get('topic');
    const topic = typeof topicRaw === 'string' ? topicRaw : undefined;
    
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
      
      aiResponse = await analyzeImageContent(file, topic);
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
        const analysisResult = await localAnalyzeText(extractedText, topic);
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

      aiResponse = await analyzeTextContent(extractedText, topic);
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

    let response = {
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

    // Enforce fail if Topic Relevance < 10 in AI response
    try {
      const topicCategory = Array.isArray(analysisResult?.categories)
        ? analysisResult.categories.find((c: any) => c?.category === 'Topic Relevance')
        : null;
      if (topicCategory && typeof topicCategory.score === 'number' && topicCategory.score < 10) {
        response = {
          ...response,
          analysis: {
            ...analysisResult,
            totalScore: 0,
            passed: false,
            overallFeedback: 'Submission failed: Topic Relevance below minimum threshold.'
          }
        };
      } else if (analysisResult && typeof analysisResult.totalScore === 'number') {
        response = {
          ...response,
          analysis: {
            ...analysisResult,
            passed: true
          }
        };
      }
    } catch {}

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