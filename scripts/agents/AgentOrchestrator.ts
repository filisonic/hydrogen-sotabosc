/**
 * Sotabosc Agent Orchestrator - Multi-agent system for content management
 * Inspired by Ruflo's agent coordination patterns
 */

import { EventEmitter } from 'node:events';
import type { Place, CityEvent } from '../../app/lib/directory/types';

// Agent Types
export type AgentType = 'researcher' | 'content' | 'media' | 'quality' | 'orchestrator';

export type AgentStatus = 'idle' | 'working' | 'completed' | 'error';

export interface AgentTask {
  id: string;
  type: 'url_research' | 'content_generation' | 'image_processing' | 'quality_check';
  input: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAgent?: AgentType;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface AgentCapabilities {
  canHandle: string[];
  maxConcurrentTasks: number;
  specializations: string[];
}

export interface Agent {
  id: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: AgentCapabilities;
  currentTasks: AgentTask[];
  completedTasks: number;
  errorCount: number;
}

export class AgentOrchestrator extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private taskQueue: AgentTask[] = [];
  private completedTasks: AgentTask[] = [];
  private readonly maxRetries = 3;

  constructor() {
    super();
    this.initializeAgents();
  }

  private initializeAgents() {
    // Research Agent - Enhanced URL analysis and content discovery
    this.registerAgent({
      id: 'researcher-001',
      type: 'researcher',
      status: 'idle',
      capabilities: {
        canHandle: ['url_research', 'market_analysis', 'competitor_analysis'],
        maxConcurrentTasks: 3,
        specializations: ['venue_research', 'event_discovery', 'trend_analysis'],
      },
      currentTasks: [],
      completedTasks: 0,
      errorCount: 0,
    });

    // Content Agent - SEO and multilingual content generation
    this.registerAgent({
      id: 'content-001',
      type: 'content',
      status: 'idle',
      capabilities: {
        canHandle: ['content_generation', 'seo_optimization', 'translation'],
        maxConcurrentTasks: 2,
        specializations: ['meta_generation', 'structured_data', 'localization'],
      },
      currentTasks: [],
      completedTasks: 0,
      errorCount: 0,
    });

    // Media Agent - Image processing and optimization
    this.registerAgent({
      id: 'media-001',
      type: 'media',
      status: 'idle',
      capabilities: {
        canHandle: ['image_processing', 'media_optimization', 'visual_analysis'],
        maxConcurrentTasks: 4,
        specializations: ['image_optimization', 'alt_text_generation', 'visual_validation'],
      },
      currentTasks: [],
      completedTasks: 0,
      errorCount: 0,
    });

    // Quality Agent - Validation and brand alignment
    this.registerAgent({
      id: 'quality-001',
      type: 'quality',
      status: 'idle',
      capabilities: {
        canHandle: ['quality_check', 'brand_alignment', 'content_validation'],
        maxConcurrentTasks: 5,
        specializations: ['sotabosc_alignment', 'fact_checking', 'consistency_validation'],
      },
      currentTasks: [],
      completedTasks: 0,
      errorCount: 0,
    });

    console.log(`🤖 Initialized ${this.agents.size} agents`);
  }

  registerAgent(agent: Agent) {
    this.agents.set(agent.id, agent);
    this.emit('agent_registered', agent);
  }

  // Task Creation and Management
  createTask(
    type: AgentTask['type'],
    input: any,
    priority: AgentTask['priority'] = 'medium'
  ): AgentTask {
    const task: AgentTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      input,
      priority,
      status: 'pending',
    };

    this.taskQueue.push(task);
    this.emit('task_created', task);
    
    // Auto-assign and process
    this.processTaskQueue();
    
    return task;
  }

  // Intelligent task assignment based on agent capabilities and current load
  private assignTask(task: AgentTask): Agent | null {
    const availableAgents = Array.from(this.agents.values()).filter(agent => {
      return agent.status !== 'error' &&
             agent.currentTasks.length < agent.capabilities.maxConcurrentTasks &&
             this.canAgentHandleTask(agent, task);
    });

    if (availableAgents.length === 0) return null;

    // Priority: specialization match > lowest current load > least errors
    availableAgents.sort((a, b) => {
      const aSpecMatch = a.capabilities.specializations.some(spec => 
        task.type.includes(spec.replace('_', ''))
      ) ? 1 : 0;
      const bSpecMatch = b.capabilities.specializations.some(spec => 
        task.type.includes(spec.replace('_', ''))
      ) ? 1 : 0;

      if (aSpecMatch !== bSpecMatch) return bSpecMatch - aSpecMatch;
      if (a.currentTasks.length !== b.currentTasks.length) {
        return a.currentTasks.length - b.currentTasks.length;
      }
      return a.errorCount - b.errorCount;
    });

    return availableAgents[0];
  }

  private canAgentHandleTask(agent: Agent, task: AgentTask): boolean {
    return agent.capabilities.canHandle.some(capability => 
      task.type.includes(capability.replace('_', ''))
    );
  }

  private async processTaskQueue() {
    const pendingTasks = this.taskQueue.filter(task => task.status === 'pending');
    
    for (const task of pendingTasks) {
      const assignedAgent = this.assignTask(task);
      if (!assignedAgent) continue;

      task.assignedAgent = assignedAgent.type;
      task.status = 'in_progress';
      task.startTime = new Date();
      
      assignedAgent.currentTasks.push(task);
      assignedAgent.status = 'working';

      this.emit('task_assigned', { task, agent: assignedAgent });
      
      // Execute task (this would call the specific agent implementation)
      this.executeTask(task, assignedAgent).catch(error => {
        this.handleTaskError(task, assignedAgent, error);
      });
    }
  }

  private async executeTask(task: AgentTask, agent: Agent): Promise<void> {
    try {
      const result = await this.callAgentMethod(agent, task);
      
      task.result = result;
      task.status = 'completed';
      task.endTime = new Date();
      
      // Update agent status
      agent.currentTasks = agent.currentTasks.filter(t => t.id !== task.id);
      agent.completedTasks++;
      agent.status = agent.currentTasks.length > 0 ? 'working' : 'idle';
      
      this.completedTasks.push(task);
      this.emit('task_completed', { task, agent, result });
      
    } catch (error) {
      throw error;
    }
  }

  private async callAgentMethod(agent: Agent, task: AgentTask): Promise<any> {
    // This would route to specific agent implementations
    switch (agent.type) {
      case 'researcher':
        return await this.executeResearcherTask(task);
      case 'content':
        return await this.executeContentTask(task);
      case 'media':
        return await this.executeMediaTask(task);
      case 'quality':
        return await this.executeQualityTask(task);
      default:
        throw new Error(`Unknown agent type: ${agent.type}`);
    }
  }

  // Agent-specific task execution (these would be implemented in separate files)
  private async executeResearcherTask(task: AgentTask): Promise<any> {
    // Enhanced URL research with competitive analysis
    return { message: 'Research task simulated', data: task.input };
  }

  private async executeContentTask(task: AgentTask): Promise<any> {
    // SEO-optimized content generation with localization
    return { message: 'Content task simulated', data: task.input };
  }

  private async executeMediaTask(task: AgentTask): Promise<any> {
    // Image processing with AI-generated alt text
    return { message: 'Media task simulated', data: task.input };
  }

  private async executeQualityTask(task: AgentTask): Promise<any> {
    // Quality validation and brand alignment checking
    return { message: 'Quality task simulated', data: task.input };
  }

  private handleTaskError(task: AgentTask, agent: Agent, error: any) {
    task.status = 'failed';
    task.error = error.message || String(error);
    task.endTime = new Date();
    
    agent.currentTasks = agent.currentTasks.filter(t => t.id !== task.id);
    agent.errorCount++;
    agent.status = agent.currentTasks.length > 0 ? 'working' : 'idle';
    
    this.emit('task_failed', { task, agent, error });
  }

  // Workflow orchestration for enhanced scripts
  async enhancedUrlDrafting(urls: string[]): Promise<any[]> {
    const results = [];
    
    for (const url of urls) {
      // Create coordinated tasks for each URL
      const researchTask = this.createTask('url_research', { url }, 'high');
      const contentTask = this.createTask('content_generation', { url, dependency: researchTask.id }, 'medium');
      const qualityTask = this.createTask('quality_check', { url, dependency: contentTask.id }, 'high');
      
      results.push({ url, tasks: [researchTask, contentTask, qualityTask] });
    }
    
    return results;
  }

  async enhancedImageProcessing(places: Place[]): Promise<any[]> {
    const results = [];
    
    for (const place of places) {
      if (!place.website) continue;
      
      const mediaTask = this.createTask('image_processing', { place }, 'medium');
      const qualityTask = this.createTask('quality_check', { place, type: 'image_validation' }, 'low');
      
      results.push({ place: place.slug, tasks: [mediaTask, qualityTask] });
    }
    
    return results;
  }

  // Status and monitoring
  getSystemStatus() {
    const agents = Array.from(this.agents.values());
    const pendingTasks = this.taskQueue.filter(t => t.status === 'pending').length;
    const activeTasks = this.taskQueue.filter(t => t.status === 'in_progress').length;
    
    return {
      agents: agents.map(a => ({
        id: a.id,
        type: a.type,
        status: a.status,
        currentLoad: a.currentTasks.length,
        maxLoad: a.capabilities.maxConcurrentTasks,
        completed: a.completedTasks,
        errors: a.errorCount,
      })),
      taskQueue: {
        pending: pendingTasks,
        active: activeTasks,
        completed: this.completedTasks.length,
        total: this.taskQueue.length,
      }
    };
  }

  shutdown() {
    this.removeAllListeners();
    this.agents.clear();
    this.taskQueue = [];
    console.log('🛑 Agent orchestrator shutdown');
  }
}