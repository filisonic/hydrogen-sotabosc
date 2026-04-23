#!/usr/bin/env tsx
/**
 * Test Real Research Agent with live website
 */

import { ResearcherAgent } from './ResearcherAgent';
import { loadDotEnvFromRoot } from '../lib/project-env';

async function testRealResearch() {
  await loadDotEnvFromRoot();
  
  const testUrl = 'https://nomadcoffee.es';
  console.log(`🔍 Research Agent: Analyzing real website...`);
  console.log(`📋 Target: ${testUrl}\n`);
  
  try {
    const researcher = ResearcherAgent.getInstance();
    
    const result = await researcher.executeResearch({
      url: testUrl,
      depth: 'comprehensive',
      includeCompetitorAnalysis: true,
      extractSocialMedia: true,
    });
    
    console.log('📊 Research Results:');
    console.log('='.repeat(50));
    
    console.log(`\n📝 Basic Info:`);
    console.log(`   Title: ${result.basicInfo.title}`);
    console.log(`   Description: ${result.basicInfo.description.slice(0, 100)}...`);
    
    console.log(`\n🏢 Business Intelligence:`);
    console.log(`   Category: ${result.businessIntel.category}`);
    console.log(`   Target Audience: ${result.businessIntel.target_audience}`);
    console.log(`   USPs: ${result.businessIntel.unique_selling_points.join(', ')}`);
    console.log(`   Pricing Signals: ${result.businessIntel.pricing_signals.join(', ')}`);
    
    console.log(`\n📱 Social Presence:`);
    result.socialPresence.platforms.forEach(platform => {
      console.log(`   ${platform.platform}: ${platform.url}`);
    });
    console.log(`   Engagement Quality: ${result.socialPresence.engagement_quality}`);
    
    console.log(`\n📈 Quality Metrics:`);
    console.log(`   Quality Score: ${result.quality_score}/100`);
    console.log(`   Confidence: ${result.confidence_level}%`);
    console.log(`   Sotabosc Alignment: ${result.alignment.verdict} (${result.alignment.score}/100)`);
    
    console.log(`\n🎯 Categories Detected: ${result.alignment.suggestedCategories.join(', ')}`);
    console.log(`🌱 Primary Domain: ${result.alignment.suggestedPrimaryDomain}`);
    
    if (result.alignment.cautionFlags.length > 0) {
      console.log(`\n⚠️  Caution Flags: ${result.alignment.cautionFlags.join(', ')}`);
    }
    
    console.log(`\n🏆 Final Verdict:`);
    if (result.quality_score >= 80 && result.confidence_level >= 85) {
      console.log('   ✅ RECOMMENDED for Sotabosc directory');
    } else if (result.quality_score >= 60) {
      console.log('   🔍 NEEDS REVIEW - Manual verification recommended');
    } else {
      console.log('   ❌ NOT SUITABLE for Sotabosc brand');
    }
    
    console.log(`\n💡 Key Insights:`);
    if (result.businessIntel.unique_selling_points.length > 0) {
      console.log(`   • Strong differentiators identified`);
    }
    if (result.socialPresence.platforms.length > 1) {
      console.log(`   • Active social media presence`);
    }
    if (result.businessIntel.pricing_signals.length > 0) {
      console.log(`   • Clear pricing strategy`);
    }
    
  } catch (error) {
    console.error('❌ Research failed:', error);
  }
}

testRealResearch();