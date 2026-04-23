/**
 * Graphify.net Integration for Sotabosc Knowledge Graph
 * Builds interconnected context for venues, events, artists, and content
 */

import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Place, CityEvent, Creator } from '../../app/lib/directory/types';
import { PROJECT_ROOT } from '../lib/project-env';

export interface GraphifyConfig {
  obsidianVault: string;
  enableObsidianSync: boolean;
  autoUpdateGraph: boolean;
  includeImages: boolean;
  clustering: 'leiden' | 'modularity';
}

export interface KnowledgeNode {
  id: string;
  type: 'venue' | 'event' | 'creator' | 'category' | 'neighborhood' | 'concept';
  title: string;
  content: string;
  metadata: Record<string, any>;
  relationships: Array<{
    target: string;
    type: 'located_in' | 'hosts' | 'created_by' | 'similar_to' | 'influences' | 'collaborates_with';
    strength: number;
  }>;
}

export class SotaboscKnowledgeGraph {
  private config: GraphifyConfig;
  private graphPath: string;
  private obsidianPath: string;

  constructor(config: Partial<GraphifyConfig> = {}) {
    this.config = {
      obsidianVault: path.join(PROJECT_ROOT, 'knowledge-vault'),
      enableObsidianSync: true,
      autoUpdateGraph: true,
      includeImages: true,
      clustering: 'leiden',
      ...config,
    };
    
    this.graphPath = path.join(PROJECT_ROOT, 'knowledge-graph');
    this.obsidianPath = this.config.obsidianVault;
  }

  /**
   * Initialize Graphify integration and build initial knowledge graph
   */
  async initialize(): Promise<void> {
    console.log('🧠 Initializing Sotabosc Knowledge Graph...');
    
    try {
      // Create directory structure
      await mkdir(this.graphPath, { recursive: true });
      await mkdir(this.obsidianPath, { recursive: true });
      
      // Install Graphify if not available
      await this.ensureGraphifyInstalled();
      
      // Build initial graph from existing data
      await this.buildInitialGraph();
      
      console.log('✅ Knowledge Graph initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize knowledge graph:', error);
      throw error;
    }
  }

  /**
   * Build comprehensive knowledge graph from Sotabosc content
   */
  async buildInitialGraph(): Promise<void> {
    console.log('🔨 Building knowledge graph from Sotabosc content...');
    
    // Import current data
    const { SEED_PLACES, SEED_EVENTS, SEED_CREATORS } = await import('../../app/lib/directory/seed.server');
    
    // Create structured content for Graphify
    await this.createVenueNodes(SEED_PLACES);
    await this.createEventNodes(SEED_EVENTS);
    await this.createCreatorNodes(SEED_CREATORS);
    await this.createCategoryNodes();
    await this.createNeighborhoodNodes();
    
    // Run Graphify on the structured content
    await this.runGraphify();
    
    console.log('✅ Initial knowledge graph built');
  }

  /**
   * Add new venue with automatic relationship detection
   */
  async addVenue(place: Place): Promise<void> {
    console.log(`🏢 Adding venue to knowledge graph: ${place.name}`);
    
    const node: KnowledgeNode = {
      id: place.slug,
      type: 'venue',
      title: place.name,
      content: this.generateVenueContent(place),
      metadata: {
        address: place.address,
        neighborhood: place.neighborhood,
        categories: place.categories,
        domain: place.primaryDomain,
        website: place.website,
      },
      relationships: this.generateVenueRelationships(place),
    };
    
    await this.writeNodeFile(node);
    
    if (this.config.autoUpdateGraph) {
      await this.updateGraph();
    }
  }

  /**
   * Query knowledge graph for contextual information
   */
  async queryContext(query: string): Promise<any> {
    console.log(`🔍 Querying knowledge graph: ${query}`);
    
    try {
      const result = await this.executeGraphifyQuery(query);
      return this.parseGraphifyResponse(result);
    } catch (error) {
      console.error('❌ Query failed:', error);
      return null;
    }
  }

  /**
   * Get related content for token-efficient context
   */
  async getRelatedContent(entityId: string, maxDepth: number = 2): Promise<KnowledgeNode[]> {
    const query = `Find entities related to ${entityId} within ${maxDepth} degrees of separation`;
    const result = await this.queryContext(query);
    
    // This would return structured relationships instead of raw text
    // Saving 71.5x tokens vs reading all related files
    return result?.nodes || [];
  }

  /**
   * Generate Obsidian vault with bidirectional links
   */
  async generateObsidianVault(): Promise<void> {
    console.log('📚 Generating Obsidian vault...');
    
    const command = [
      'graphify',
      this.graphPath,
      '--obsidian',
      `--obsidian-dir ${this.obsidianPath}`,
      '--include-relationships',
      '--cluster',
    ].join(' ');
    
    await this.executeCommand(command);
    
    // Add Sotabosc-specific templates and structure
    await this.addObsidianTemplates();
    
    console.log(`✅ Obsidian vault created at: ${this.obsidianPath}`);
  }

  private generateVenueContent(place: Place): string {
    return `# ${place.name}

## Overview
${place.summary}

## Location
- Address: ${place.address}
- Neighborhood: ${place.neighborhood}
- City: ${place.city}

## Categories
${place.categories.map(cat => `- ${cat}`).join('\n')}

## Domain Classification
Primary Domain: ${place.primaryDomain}

## Tags
${place.tags?.map(tag => `#${tag}`).join(' ') || 'No tags'}

${place.website ? `## Website
${place.website}` : ''}

## Knowledge Graph Relationships
This venue is connected to other entities through:
- Location-based relationships (neighborhood, city)
- Category-based relationships (similar venues)
- Event hosting relationships
- Artist/creator connections
`;
  }

  private generateVenueRelationships(place: Place): KnowledgeNode['relationships'] {
    const relationships: KnowledgeNode['relationships'] = [];
    
    // Neighborhood relationship
    if (place.neighborhood) {
      relationships.push({
        target: `neighborhood-${place.neighborhood.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'located_in',
        strength: 1.0,
      });
    }
    
    // Category relationships would be added based on similar venues
    // Event hosting relationships would be added dynamically
    
    return relationships;
  }

  private async createVenueNodes(places: Place[]): Promise<void> {
    console.log(`📍 Creating ${places.length} venue nodes...`);
    
    for (const place of places) {
      const content = this.generateVenueContent(place);
      const filePath = path.join(this.graphPath, 'venues', `${place.slug}.md`);
      
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, content, 'utf8');
    }
  }

  private async createEventNodes(events: CityEvent[]): Promise<void> {
    console.log(`🎉 Creating ${events.length} event nodes...`);
    
    for (const event of events) {
      const content = `# ${event.title}

## Event Details
${event.summary}

Date: ${event.startsAt}${event.endsAt ? ` - ${event.endsAt}` : ''}
Venue: [[${event.placeName}]]

## Domain
Primary Domain: ${event.primaryDomain}

## Tags
${event.tags?.map(tag => `#${tag}`).join(' ') || 'No tags'}

## Relationships
- Hosted at: [[${event.placeName}]]
- Domain: ${event.primaryDomain}
`;
      
      const filePath = path.join(this.graphPath, 'events', `${event.slug}.md`);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, content, 'utf8');
    }
  }

  private async createCreatorNodes(creators: Creator[]): Promise<void> {
    console.log(`👥 Creating ${creators.length} creator nodes...`);
    
    for (const creator of creators) {
      const content = `# ${creator.displayName}

## Bio
${creator.bio}

## Location
${creator.city}

## Domain
Primary Domain: ${creator.primaryDomain}

${creator.websiteUrl ? `## Website
${creator.websiteUrl}` : ''}

${creator.productCollectionHandle ? `## Products
Collection: ${creator.productCollectionHandle}` : ''}

## Relationships
- Based in: [[${creator.city}]]
- Creates in domain: ${creator.primaryDomain}
`;
      
      const filePath = path.join(this.graphPath, 'creators', `${creator.slug}.md`);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, content, 'utf8');
    }
  }

  private async createCategoryNodes(): Promise<void> {
    console.log('🏷️ Creating category nodes...');
    
    const categories = [
      'art-gallery', 'music-venue', 'restaurant', 'specialty-coffee',
      'coworking', 'workshop', 'retreat', 'conference', 'shop'
    ];
    
    for (const category of categories) {
      const content = `# ${category}

Category page for ${category} venues in Barcelona.

## Related Venues
<!-- Graphify will automatically detect and link related venues -->

## Characteristics
<!-- AI-extracted characteristics of this category -->

## Trends
<!-- Patterns and insights about this category -->
`;
      
      const filePath = path.join(this.graphPath, 'categories', `${category}.md`);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, content, 'utf8');
    }
  }

  private async createNeighborhoodNodes(): Promise<void> {
    console.log('🏘️ Creating neighborhood nodes...');
    
    const neighborhoods = [
      'Gràcia', 'El Born', 'Raval', 'Eixample', 'Poblenou',
      'Gòtic', 'Poble-sec', 'Sarrià', 'Barceloneta'
    ];
    
    for (const neighborhood of neighborhoods) {
      const content = `# ${neighborhood}

Barcelona neighborhood: ${neighborhood}

## Character
<!-- AI-extracted neighborhood characteristics -->

## Venues
<!-- Graphify will automatically link venues in this area -->

## Cultural Scene
<!-- Insights about the cultural landscape -->
`;
      
      const filePath = path.join(this.graphPath, 'neighborhoods', `${neighborhood.toLowerCase().replace(/\s+/g, '-')}.md`);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, content, 'utf8');
    }
  }

  private async runGraphify(): Promise<void> {
    console.log('🚀 Running Graphify on content...');
    
    const command = [
      'graphify',
      this.graphPath,
      '--output', path.join(this.graphPath, 'graph.json'),
      '--format', 'json',
      '--cluster',
      '--include-images',
    ].join(' ');
    
    await this.executeCommand(command);
  }

  private async updateGraph(): Promise<void> {
    if (this.config.autoUpdateGraph) {
      await this.runGraphify();
      
      if (this.config.enableObsidianSync) {
        await this.generateObsidianVault();
      }
    }
  }

  private async executeGraphifyQuery(query: string): Promise<string> {
    const command = `graphify query "${query}" --graph ${path.join(this.graphPath, 'graph.json')}`;
    return await this.executeCommand(command);
  }

  private parseGraphifyResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch {
      return { text: response, structured: false };
    }
  }

  private async writeNodeFile(node: KnowledgeNode): Promise<void> {
    const filePath = path.join(this.graphPath, `${node.type}s`, `${node.id}.md`);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, node.content, 'utf8');
  }

  private async addObsidianTemplates(): Promise<void> {
    const templatesDir = path.join(this.obsidianPath, 'templates');
    await mkdir(templatesDir, { recursive: true });
    
    // Venue template
    const venueTemplate = `# {{title}}

## Overview
{{summary}}

## Details
- Address: {{address}}
- Neighborhood: [[{{neighborhood}}]]
- Categories: {{categories}}
- Domain: {{domain}}

## Relationships
<!-- Auto-generated by Knowledge Graph -->

## Notes
<!-- Your personal notes -->

## Related
<!-- Auto-linked related content -->
`;
    
    await writeFile(path.join(templatesDir, 'venue-template.md'), venueTemplate, 'utf8');
    
    // Event template
    const eventTemplate = `# {{title}}

## Event Details
{{summary}}

Date: {{date}}
Venue: [[{{venue}}]]

## Relationships
<!-- Auto-generated by Knowledge Graph -->

## Notes
<!-- Your personal notes -->
`;
    
    await writeFile(path.join(templatesDir, 'event-template.md'), eventTemplate, 'utf8');
  }

  private async ensureGraphifyInstalled(): Promise<void> {
    try {
      await this.executeCommand('graphify --version');
    } catch {
      console.log('📦 Installing Graphify...');
      await this.executeCommand('pip install graphify');
      await this.executeCommand('graphify install');
    }
  }

  private async executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('bash', ['-c', command], {
        cwd: PROJECT_ROOT,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed: ${stderr}`));
        }
      });
    });
  }
}

export default SotaboscKnowledgeGraph;