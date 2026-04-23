/**
 * Research Agent - Advanced web research and content discovery
 * Enhances draft-listing-from-urls.ts with intelligent analysis
 */

import { fetchPageText } from '../lib/fetch-page-text';
import { scoreAlignment, type AlignmentResult } from '../lib/sotabosc-alignment';

export interface ResearchTask {
  url: string;
  depth?: 'basic' | 'comprehensive' | 'competitive';
  includeCompetitorAnalysis?: boolean;
  extractSocialMedia?: boolean;
}

export interface ResearchResult {
  basicInfo: {
    title: string;
    description: string;
    content: string;
    metadata: Record<string, any>;
  };
  alignment: AlignmentResult;
  businessIntel: {
    category: string;
    target_audience: string;
    pricing_signals: string[];
    unique_selling_points: string[];
  };
  socialPresence: {
    platforms: Array<{ platform: string; url: string; followers?: number }>;
    engagement_quality: 'high' | 'medium' | 'low' | 'unknown';
  };
  competitiveAnalysis?: {
    similar_venues: string[];
    differentiators: string[];
    market_position: string;
  };
  quality_score: number;
  confidence_level: number;
}

export class ResearcherAgent {
  private static instance: ResearcherAgent;

  static getInstance(): ResearcherAgent {
    if (!ResearcherAgent.instance) {
      ResearcherAgent.instance = new ResearcherAgent();
    }
    return ResearcherAgent.instance;
  }

  async executeResearch(task: ResearchTask): Promise<ResearchResult> {
    const startTime = Date.now();
    console.log(`🔍 Research Agent: Analyzing ${task.url}`);

    try {
      // Phase 1: Basic content extraction
      const basicInfo = await this.extractBasicInfo(task.url);
      
      // Phase 2: Sotabosc alignment analysis
      const alignment = scoreAlignment(basicInfo.content);
      
      // Phase 3: Business intelligence extraction
      const businessIntel = await this.extractBusinessIntelligence(basicInfo.content, basicInfo.metadata);
      
      // Phase 4: Social media presence analysis
      const socialPresence = await this.analyzeSocialPresence(basicInfo.content, basicInfo.metadata);
      
      // Phase 5: Competitive analysis (if requested)
      const competitiveAnalysis = task.includeCompetitorAnalysis 
        ? await this.performCompetitiveAnalysis(basicInfo.content, businessIntel.category)
        : undefined;

      // Quality scoring
      const quality_score = this.calculateQualityScore(alignment, businessIntel, socialPresence);
      const confidence_level = this.calculateConfidenceLevel(basicInfo, alignment);

      const duration = Date.now() - startTime;
      console.log(`✅ Research completed in ${duration}ms - Quality: ${quality_score}/100`);

      return {
        basicInfo,
        alignment,
        businessIntel,
        socialPresence,
        competitiveAnalysis,
        quality_score,
        confidence_level,
      };

    } catch (error) {
      console.error(`❌ Research Agent error for ${task.url}:`, error);
      throw new Error(`Research failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async extractBasicInfo(url: string) {
    const fetched = await fetchPageText(url, { 
      apiKey: process.env.FIRECRAWL_API_KEY,
      noFirecrawl: !process.env.FIRECRAWL_API_KEY 
    });

    if (fetched.error) {
      throw new Error(`Failed to fetch ${url}: ${fetched.error}`);
    }

    return {
      title: fetched.title || 'Untitled',
      description: this.extractDescription(fetched.text),
      content: fetched.text,
      metadata: fetched.metadata || {},
    };
  }

  private extractDescription(content: string): string {
    // Extract a meaningful description from content
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const relevantSentences = sentences
      .filter(s => this.isDescriptiveSentence(s))
      .slice(0, 3)
      .join('. ');
    
    return relevantSentences.slice(0, 280).trim();
  }

  private isDescriptiveSentence(sentence: string): boolean {
    const descriptiveWords = ['offers', 'provides', 'specializes', 'features', 'located', 'known for', 'experience'];
    const lowValue = ['cookie', 'privacy', 'terms', 'copyright', 'subscribe', 'newsletter'];
    
    const hasDescriptive = descriptiveWords.some(word => sentence.toLowerCase().includes(word));
    const hasLowValue = lowValue.some(word => sentence.toLowerCase().includes(word));
    
    return hasDescriptive && !hasLowValue && sentence.length > 30;
  }

  private async extractBusinessIntelligence(content: string, metadata: any) {
    const text = content.toLowerCase();
    
    return {
      category: this.inferCategory(text),
      target_audience: this.inferTargetAudience(text),
      pricing_signals: this.extractPricingSignals(text),
      unique_selling_points: this.extractUSPs(text),
    };
  }

  private inferCategory(text: string): string {
    const categoryKeywords = {
      'art-gallery': ['gallery', 'exhibition', 'artist', 'contemporary art', 'paintings', 'sculpture'],
      'restaurant': ['restaurant', 'cuisine', 'dining', 'chef', 'menu', 'reservations'],
      'coworking': ['coworking', 'workspace', 'office', 'desk rental', 'meeting room'],
      'music-venue': ['concert', 'live music', 'venue', 'performance', 'band', 'gig'],
      'specialty-coffee': ['coffee', 'espresso', 'roastery', 'beans', 'barista', 'café'],
      'workshop': ['workshop', 'class', 'learn', 'course', 'training', 'skill'],
      'retreat': ['retreat', 'meditation', 'wellness', 'yoga', 'spiritual', 'mindfulness'],
    };

    let bestMatch = 'other';
    let maxScore = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const score = keywords.reduce((sum, keyword) => 
        sum + (text.split(keyword).length - 1), 0
      );
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = category;
      }
    }

    return bestMatch;
  }

  private inferTargetAudience(text: string): string {
    const audienceSignals = {
      'professionals': ['business', 'professional', 'network', 'corporate', 'executive'],
      'creatives': ['artist', 'creative', 'design', 'innovative', 'inspiration'],
      'students': ['student', 'learn', 'course', 'education', 'university'],
      'tourists': ['tourist', 'visitor', 'discover', 'explore', 'authentic'],
      'locals': ['neighborhood', 'local', 'community', 'resident', 'regular'],
      'families': ['family', 'children', 'kid', 'parent', 'all ages'],
    };

    let bestMatch = 'general';
    let maxScore = 0;

    for (const [audience, keywords] of Object.entries(audienceSignals)) {
      const score = keywords.reduce((sum, keyword) => 
        sum + (text.split(keyword).length - 1), 0
      );
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = audience;
      }
    }

    return bestMatch;
  }

  private extractPricingSignals(text: string): string[] {
    const pricingRegex = /(?:€|EUR|\$|USD)?\s*\d+(?:[.,]\d+)?(?:\s*(?:€|EUR|\$|USD))?/g;
    const priceMatches = text.match(pricingRegex) || [];
    
    const pricingTerms = [
      'free', 'complimentary', 'no charge', 'gratis',
      'premium', 'luxury', 'high-end', 'exclusive',
      'affordable', 'budget-friendly', 'reasonable',
      'membership', 'subscription', 'entry fee'
    ];

    const foundTerms = pricingTerms.filter(term => text.includes(term));
    const uniquePrices = [...new Set(priceMatches)].slice(0, 5);
    
    return [...foundTerms, ...uniquePrices];
  }

  private extractUSPs(text: string): string[] {
    const uspPatterns = [
      /(?:only|first|unique|exclusive|specialized)[\w\s]{10,50}(?:in|for|with)/gi,
      /(?:award[- ]winning|michelin|certified|accredited)[\w\s]{0,30}/gi,
      /(?:since|established|founded)\s*\d{4}/gi,
      /(?:\d+\+?\s*years?|decades?)\s*of\s*experience/gi,
    ];

    const usps: string[] = [];
    for (const pattern of uspPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        usps.push(...matches.map(m => m.trim()).slice(0, 2));
      }
    }

    return usps.slice(0, 5);
  }

  private async analyzeSocialPresence(content: string, metadata: any) {
    const socialPlatforms = [
      { platform: 'instagram', patterns: [/instagram\.com\/[\w.]+/gi, /@[\w.]+/gi] },
      { platform: 'facebook', patterns: [/facebook\.com\/[\w.]+/gi] },
      { platform: 'twitter', patterns: [/twitter\.com\/[\w.]+/gi, /x\.com\/[\w.]+/gi] },
      { platform: 'tiktok', patterns: [/tiktok\.com\/@[\w.]+/gi] },
    ];

    const foundPlatforms: Array<{ platform: string; url: string }> = [];

    for (const social of socialPlatforms) {
      for (const pattern of social.patterns) {
        const matches = content.match(pattern);
        if (matches) {
          foundPlatforms.push({
            platform: social.platform,
            url: matches[0],
          });
          break; // One match per platform
        }
      }
    }

    const engagement_quality = this.inferEngagementQuality(content, foundPlatforms.length);

    return {
      platforms: foundPlatforms,
      engagement_quality,
    };
  }

  private inferEngagementQuality(content: string, socialCount: number): 'high' | 'medium' | 'low' | 'unknown' {
    const engagementSignals = ['follow us', 'share', 'tag us', 'community', 'followers'];
    const signalCount = engagementSignals.filter(signal => 
      content.toLowerCase().includes(signal)
    ).length;

    if (socialCount >= 3 && signalCount >= 2) return 'high';
    if (socialCount >= 2 || signalCount >= 2) return 'medium';
    if (socialCount >= 1) return 'low';
    return 'unknown';
  }

  private async performCompetitiveAnalysis(content: string, category: string) {
    // Simplified competitive analysis
    // In a full implementation, this would query similar venues
    return {
      similar_venues: [`Similar ${category} venues in Barcelona`],
      differentiators: ['Location', 'Unique offering', 'Customer experience'],
      market_position: 'To be analyzed',
    };
  }

  private calculateQualityScore(
    alignment: AlignmentResult, 
    businessIntel: any, 
    socialPresence: any
  ): number {
    let score = alignment.score; // Base score from alignment

    // Boost for rich business intelligence
    if (businessIntel.unique_selling_points.length > 2) score += 10;
    if (businessIntel.pricing_signals.length > 1) score += 5;

    // Boost for social presence
    if (socialPresence.platforms.length > 0) score += 5;
    if (socialPresence.engagement_quality === 'high') score += 10;
    else if (socialPresence.engagement_quality === 'medium') score += 5;

    return Math.min(100, Math.max(0, score));
  }

  private calculateConfidenceLevel(basicInfo: any, alignment: AlignmentResult): number {
    let confidence = 70; // Base confidence

    if (basicInfo.title && basicInfo.title.length > 5) confidence += 10;
    if (basicInfo.description.length > 50) confidence += 10;
    if (alignment.cautionFlags.length === 0) confidence += 10;

    return Math.min(100, confidence);
  }
}

export default ResearcherAgent;