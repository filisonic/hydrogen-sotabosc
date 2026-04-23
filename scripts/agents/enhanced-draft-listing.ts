#!/usr/bin/env tsx
/**
 * Enhanced Draft Listing Script with Multi-Agent System
 * Powered by ResearcherAgent, ContentAgent, and QualityAgent
 * 
 * Usage:
 *   npx tsx scripts/agents/enhanced-draft-listing.ts --url=https://example.com
 *   npx tsx scripts/agents/enhanced-draft-listing.ts --file=urls.txt --agents=all
 *   
 * New Flags:
 *   --agents=research|content|quality|all   Which agents to use
 *   --competitive                          Include competitive analysis  
 *   --multilingual=es,en                   Generate content in multiple languages
 *   --confidence-threshold=80              Minimum confidence for auto-approve
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { AgentOrchestrator } from './AgentOrchestrator';
import { ResearcherAgent } from './ResearcherAgent';
import { loadDotEnvFromRoot, PROJECT_ROOT } from '../lib/project-env';

const ENHANCED_REPORT_DIR = path.join(PROJECT_ROOT, 'reports', 'enhanced-listings');

interface EnhancedArgs {
  urls: string[];
  file?: string;
  agents: 'research' | 'content' | 'quality' | 'all';
  competitive: boolean;
  multilingual: string[];
  confidenceThreshold: number;
  dryRun: boolean;
  stdout: boolean;
}

function parseArgs(argv: string[]): EnhancedArgs {
  const urls: string[] = [];
  let file: string | undefined;
  let agents: 'research' | 'content' | 'quality' | 'all' = 'all';
  let competitive = false;
  const multilingual: string[] = [];
  let confidenceThreshold = 80;
  let dryRun = false;
  let stdout = false;

  for (const arg of argv) {
    if (arg.startsWith('--url=')) {
      urls.push(arg.slice(6).trim());
    } else if (arg.startsWith('--file=')) {
      file = arg.slice(7).trim();
    } else if (arg.startsWith('--agents=')) {
      const agentValue = arg.slice(9).toLowerCase();
      if (['research', 'content', 'quality', 'all'].includes(agentValue)) {
        agents = agentValue as any;
      }
    } else if (arg === '--competitive') {
      competitive = true;
    } else if (arg.startsWith('--multilingual=')) {
      multilingual.push(...arg.slice(15).split(',').map(l => l.trim()));
    } else if (arg.startsWith('--confidence-threshold=')) {
      confidenceThreshold = parseInt(arg.slice(23)) || 80;
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--stdout') {
      stdout = true;
    }
  }

  return { urls, file, agents, competitive, multilingual, confidenceThreshold, dryRun, stdout };
}

async function readUrlsFromFile(filePath: string): Promise<string[]> {
  const text = await readFile(path.resolve(PROJECT_ROOT, filePath), 'utf8');
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !line.startsWith('#'));
}

async function enhancedResearch(url: string, options: EnhancedArgs) {
  const researcher = ResearcherAgent.getInstance();
  
  console.log(`\n🔍 Enhanced research for: ${url}`);
  
  const researchResult = await researcher.executeResearch({
    url,
    depth: 'comprehensive',
    includeCompetitorAnalysis: options.competitive,
    extractSocialMedia: true,
  });

  // Generate enhanced content based on research
  const enhancedListing = {
    url,
    timestamp: new Date().toISOString(),
    
    // Core listing data
    basicInfo: researchResult.basicInfo,
    
    // Intelligence-enhanced fields
    enhancedSummary: generateEnhancedSummary(researchResult),
    categories: inferCategoriesFromResearch(researchResult),
    tags: generateSmartTags(researchResult),
    
    // SEO enhancements
    seoMetadata: generateSEOMetadata(researchResult),
    structuredData: generateStructuredData(researchResult),
    
    // Business intelligence
    businessProfile: {
      targetAudience: researchResult.businessIntel.target_audience,
      uniqueSellingPoints: researchResult.businessIntel.unique_selling_points,
      pricingSignals: researchResult.businessIntel.pricing_signals,
      socialPresence: researchResult.socialPresence,
    },
    
    // Quality metrics
    qualityScore: researchResult.quality_score,
    confidence: researchResult.confidence_level,
    alignment: researchResult.alignment,
    
    // Competitive insights (if requested)
    ...(options.competitive && researchResult.competitiveAnalysis && {
      competitiveAnalysis: researchResult.competitiveAnalysis
    }),
    
    // Agent recommendations
    recommendations: generateRecommendations(researchResult, options),
  };

  return enhancedListing;
}

function generateEnhancedSummary(research: any): string {
  const { basicInfo, businessIntel, socialPresence } = research;
  
  let summary = basicInfo.description;
  
  // Enhance with unique selling points
  if (businessIntel.unique_selling_points.length > 0) {
    const mainUSP = businessIntel.unique_selling_points[0];
    summary = `${mainUSP}. ${summary}`;
  }
  
  // Add audience context
  if (businessIntel.target_audience !== 'general') {
    summary += ` Popular with ${businessIntel.target_audience}.`;
  }
  
  // Add social proof
  if (socialPresence.engagement_quality === 'high') {
    summary += ' Active community engagement.';
  }
  
  return summary.slice(0, 280);
}

function inferCategoriesFromResearch(research: any): string[] {
  const categories = [research.businessIntel.category];
  
  // Add secondary categories based on content analysis
  const content = research.basicInfo.content.toLowerCase();
  
  if (content.includes('workshop') || content.includes('class')) {
    categories.push('workshop');
  }
  if (content.includes('event') || content.includes('conference')) {
    categories.push('conference');
  }
  if (content.includes('food') || content.includes('kitchen')) {
    categories.push('restaurant');
  }
  
  return [...new Set(categories)];
}

function generateSmartTags(research: any): string[] {
  const tags: string[] = [];
  const content = research.basicInfo.content.toLowerCase();
  
  // Location-based tags
  if (content.includes('gràcia')) tags.push('gràcia');
  if (content.includes('born')) tags.push('born');
  if (content.includes('raval')) tags.push('raval');
  if (content.includes('eixample')) tags.push('eixample');
  
  // Experience tags
  if (content.includes('terrace') || content.includes('rooftop')) tags.push('outdoor');
  if (content.includes('live music')) tags.push('live-music');
  if (content.includes('art') || content.includes('gallery')) tags.push('art');
  if (content.includes('organic') || content.includes('sustainable')) tags.push('sustainable');
  
  // Social proof tags
  if (research.socialPresence.platforms.length > 2) tags.push('social-active');
  if (research.businessIntel.pricing_signals.some((p: string) => p.includes('free'))) {
    tags.push('free-entry');
  }
  
  return tags.slice(0, 8);
}

function generateSEOMetadata(research: any) {
  return {
    title: `${research.basicInfo.title} — Barcelona | Sotabosc City`,
    description: research.basicInfo.description.slice(0, 160),
    keywords: [
      research.businessIntel.category,
      research.businessIntel.target_audience,
      'barcelona',
      'sotabosc',
      ...research.businessIntel.unique_selling_points.slice(0, 3)
    ],
  };
}

function generateStructuredData(research: any) {
  return {
    '@type': 'LocalBusiness',
    name: research.basicInfo.title,
    description: research.basicInfo.description,
    url: research.basicInfo.metadata.url,
    // Additional structured data would be generated here
  };
}

function generateRecommendations(research: any, options: EnhancedArgs): string[] {
  const recs: string[] = [];
  
  if (research.quality_score < options.confidenceThreshold) {
    recs.push(`Quality score ${research.quality_score} below threshold ${options.confidenceThreshold} - manual review recommended`);
  }
  
  if (research.alignment.cautionFlags.length > 0) {
    recs.push(`Caution flags: ${research.alignment.cautionFlags.join(', ')}`);
  }
  
  if (research.businessIntel.pricing_signals.length === 0) {
    recs.push('No pricing information found - consider manual research');
  }
  
  if (research.socialPresence.platforms.length === 0) {
    recs.push('No social media presence detected - verify independently');
  }
  
  if (research.confidence_level >= 90 && research.quality_score >= 85) {
    recs.push('HIGH CONFIDENCE - Suitable for auto-approval');
  }
  
  return recs;
}

async function main() {
  console.log('🚀 Starting Enhanced Draft Listing Script...');
  
  await loadDotEnvFromRoot();
  
  const args = parseArgs(process.argv.slice(2));
  console.log('📝 Parsed args:', args);
  
  if (args.urls.length === 0 && !args.file) {
    console.error('❌ No URLs provided. Use --url= or --file=');
    process.exit(1);
  }
  
  // Collect all URLs
  let urls = [...args.urls];
  if (args.file) {
    const fileUrls = await readUrlsFromFile(args.file);
    urls.push(...fileUrls);
  }
  
  urls = [...new Set(urls)]; // Remove duplicates
  
  console.log(`🚀 Enhanced Draft Listing with Multi-Agent System`);
  console.log(`📊 Processing ${urls.length} URL(s) with agents: ${args.agents}`);
  console.log(`🎯 Confidence threshold: ${args.confidenceThreshold}%`);
  
  // Initialize orchestrator (optional for this simple case)
  const orchestrator = new AgentOrchestrator();
  
  if (!args.stdout) {
    await mkdir(ENHANCED_REPORT_DIR, { recursive: true });
  }
  
  const results = [];
  
  for (const url of urls) {
    try {
      const result = await enhancedResearch(url, args);
      results.push(result);
      
      const summary = `${result.qualityScore}/100 quality, ${result.confidence}% confidence`;
      console.log(`✅ ${result.basicInfo.title} - ${summary}`);
      
      if (!args.dryRun) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const slug = result.basicInfo.title.toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 50);
        
        if (args.stdout) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const filename = `${slug}-enhanced-${timestamp}.json`;
          const filepath = path.join(ENHANCED_REPORT_DIR, filename);
          await writeFile(filepath, JSON.stringify(result, null, 2) + '\n', 'utf8');
          console.log(`📁 Saved: ${filename}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Failed to process ${url}:`, error);
    }
  }
  
  // Summary
  const highQuality = results.filter(r => r.qualityScore >= args.confidenceThreshold);
  const autoApprovable = results.filter(r => 
    r.confidence >= 90 && r.qualityScore >= 85
  );
  
  console.log(`\n📈 Summary:`);
  console.log(`   Total processed: ${results.length}`);
  console.log(`   High quality (≥${args.confidenceThreshold}): ${highQuality.length}`);
  console.log(`   Auto-approvable: ${autoApprovable.length}`);
  
  orchestrator.shutdown();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}