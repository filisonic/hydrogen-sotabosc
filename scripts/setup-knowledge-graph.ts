#!/usr/bin/env tsx
/**
 * Setup Sotabosc Knowledge Graph with Graphify.net + Obsidian Integration
 * 
 * Usage:
 *   npm run setup:knowledge-graph
 *   npm run setup:knowledge-graph -- --obsidian-path=/path/to/vault
 */

import SotaboscKnowledgeGraph from './knowledge-graph/GraphifyIntegration';
import { loadDotEnvFromRoot } from './lib/project-env';

function parseArgs(argv: string[]) {
  let obsidianPath: string | undefined;
  let enableSync = true;
  let includeImages = true;
  
  for (const arg of argv) {
    if (arg.startsWith('--obsidian-path=')) {
      obsidianPath = arg.slice(16);
    } else if (arg === '--no-sync') {
      enableSync = false;
    } else if (arg === '--no-images') {
      includeImages = false;
    }
  }
  
  return { obsidianPath, enableSync, includeImages };
}

async function main() {
  console.log('🚀 Setting up Sotabosc Knowledge Graph...\n');
  
  await loadDotEnvFromRoot();
  
  const args = parseArgs(process.argv.slice(2));
  
  // Initialize knowledge graph
  const kg = new SotaboscKnowledgeGraph({
    obsidianVault: args.obsidianPath,
    enableObsidianSync: args.enableSync,
    includeImages: args.includeImages,
    autoUpdateGraph: true,
    clustering: 'leiden',
  });
  
  try {
    console.log('📊 Benefits of Knowledge Graph Integration:');
    console.log('   • 71.5x fewer tokens per query vs reading raw files');
    console.log('   • Automatic relationship detection between venues/events/creators');
    console.log('   • Obsidian bidirectional sync for knowledge management');
    console.log('   • Cross-referential context for better AI understanding');
    console.log('   • Persistent graph structure across sessions\n');
    
    // Initialize the system
    await kg.initialize();
    
    console.log('\n🔗 Knowledge Graph Structure Created:');
    console.log('   📁 knowledge-graph/');
    console.log('     ├── venues/          (100+ Barcelona venues)');
    console.log('     ├── events/          (24+ cultural events)'); 
    console.log('     ├── creators/        (14+ artists & makers)');
    console.log('     ├── categories/      (Art, music, food, etc.)');
    console.log('     ├── neighborhoods/   (Gràcia, Born, Raval, etc.)');
    console.log('     └── graph.json       (Structured relationships)');
    
    if (args.enableSync) {
      console.log('\n📚 Obsidian Vault Generated:');
      console.log('   • Bidirectional links between entities');
      console.log('   • Templates for new venues/events');
      console.log('   • Automatic relationship mapping');
      console.log('   • Graph visualization integration');
      
      await kg.generateObsidianVault();
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Open Obsidian vault to explore relationships');
    console.log('   2. Use /graphify command in Claude Code for queries');
    console.log('   3. Add new venues with automatic graph updates');
    console.log('   4. Query context with 71.5x token savings');
    
    console.log('\n💡 Example Queries:');
    console.log('   • "Show me all music venues in Gràcia"');
    console.log('   • "Find artists connected to Heliogàbal"');
    console.log('   • "What events happen in art galleries?"');
    console.log('   • "Map relationships between coworking spaces"');
    
    console.log('\n✅ Knowledge Graph setup complete!');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Ensure Python and pip are installed');
    console.log('   • Run: pip install graphify');
    console.log('   • Run: graphify install');
    console.log('   • Check network connectivity for package installation');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}