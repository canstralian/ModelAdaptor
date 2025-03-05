import {
  users, type User, type InsertUser,
  wrappers, type Wrapper, type InsertWrapper,
  prompts, type Prompt, type InsertPrompt,
  integrations, type Integration, type InsertIntegration,
  conversations, type Conversation, type InsertConversation
} from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Wrapper methods
  createWrapper(wrapper: InsertWrapper): Promise<Wrapper>;
  getWrapper(id: number): Promise<Wrapper | undefined>;
  getWrappersByUserId(userId: number): Promise<Wrapper[]>;
  updateWrapper(id: number, wrapper: Partial<InsertWrapper>): Promise<Wrapper | undefined>;
  deleteWrapper(id: number): Promise<boolean>;

  // Prompt methods
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  getPrompt(id: number): Promise<Prompt | undefined>;
  getPromptsByWrapperId(wrapperId: number): Promise<Prompt[]>;
  updatePrompt(id: number, prompt: Partial<InsertPrompt>): Promise<Prompt | undefined>;
  deletePrompt(id: number): Promise<boolean>;

  // Integration methods
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  getIntegration(id: number): Promise<Integration | undefined>;
  getIntegrationsByWrapperId(wrapperId: number): Promise<Integration[]>;
  updateIntegration(id: number, integration: Partial<InsertIntegration>): Promise<Integration | undefined>;
  deleteIntegration(id: number): Promise<boolean>;

  // Conversation methods
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByWrapperId(wrapperId: number): Promise<Conversation[]>;
  updateConversation(id: number, conversation: Partial<InsertConversation>): Promise<Conversation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wrappers: Map<number, Wrapper>;
  private prompts: Map<number, Prompt>;
  private integrations: Map<number, Integration>;
  private conversations: Map<number, Conversation>;
  
  private currentUserId: number;
  private currentWrapperId: number;
  private currentPromptId: number;
  private currentIntegrationId: number;
  private currentConversationId: number;

  constructor() {
    this.users = new Map();
    this.wrappers = new Map();
    this.prompts = new Map();
    this.integrations = new Map();
    this.conversations = new Map();
    
    this.currentUserId = 1;
    this.currentWrapperId = 1;
    this.currentPromptId = 1;
    this.currentIntegrationId = 1;
    this.currentConversationId = 1;

    // Add some demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create a demo user
    const demoUser: InsertUser = {
      username: "demo_user",
      password: "password123" // In a real app, this would be hashed
    };
    const user = this.createUser(demoUser);

    // Create a demo wrapper
    const demoWrapper: InsertWrapper = {
      name: "Customer Support Assistant",
      description: "AI assistant that helps customer support agents respond to inquiries with accurate information from the knowledge base.",
      baseModel: "Gemini Pro",
      systemPrompt: "You are a customer support assistant for a software company. You should be helpful, friendly, and knowledgeable. When you don't know the answer, refer to the knowledge base or suggest escalating to a human agent.",
      temperature: 70,
      maxTokens: 2048,
      topP: 90,
      enableMemory: true,
      knowledgeBaseIntegration: true,
      webSearchAccess: false,
      userId: user.id
    };
    this.createWrapper(demoWrapper);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Wrapper methods
  async createWrapper(insertWrapper: InsertWrapper): Promise<Wrapper> {
    const id = this.currentWrapperId++;
    const createdAt = new Date();
    const wrapper: Wrapper = { ...insertWrapper, id, createdAt };
    this.wrappers.set(id, wrapper);
    return wrapper;
  }

  async getWrapper(id: number): Promise<Wrapper | undefined> {
    return this.wrappers.get(id);
  }

  async getWrappersByUserId(userId: number): Promise<Wrapper[]> {
    return Array.from(this.wrappers.values()).filter(
      (wrapper) => wrapper.userId === userId
    );
  }

  async updateWrapper(id: number, updatedData: Partial<InsertWrapper>): Promise<Wrapper | undefined> {
    const wrapper = this.wrappers.get(id);
    if (!wrapper) return undefined;
    
    const updatedWrapper: Wrapper = { ...wrapper, ...updatedData };
    this.wrappers.set(id, updatedWrapper);
    return updatedWrapper;
  }

  async deleteWrapper(id: number): Promise<boolean> {
    return this.wrappers.delete(id);
  }

  // Prompt methods
  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = this.currentPromptId++;
    const createdAt = new Date();
    const prompt: Prompt = { ...insertPrompt, id, createdAt };
    this.prompts.set(id, prompt);
    return prompt;
  }

  async getPrompt(id: number): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async getPromptsByWrapperId(wrapperId: number): Promise<Prompt[]> {
    return Array.from(this.prompts.values()).filter(
      (prompt) => prompt.wrapperId === wrapperId
    );
  }

  async updatePrompt(id: number, updatedData: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const prompt = this.prompts.get(id);
    if (!prompt) return undefined;
    
    const updatedPrompt: Prompt = { ...prompt, ...updatedData };
    this.prompts.set(id, updatedPrompt);
    return updatedPrompt;
  }

  async deletePrompt(id: number): Promise<boolean> {
    return this.prompts.delete(id);
  }

  // Integration methods
  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const id = this.currentIntegrationId++;
    const createdAt = new Date();
    const integration: Integration = { ...insertIntegration, id, createdAt };
    this.integrations.set(id, integration);
    return integration;
  }

  async getIntegration(id: number): Promise<Integration | undefined> {
    return this.integrations.get(id);
  }

  async getIntegrationsByWrapperId(wrapperId: number): Promise<Integration[]> {
    return Array.from(this.integrations.values()).filter(
      (integration) => integration.wrapperId === wrapperId
    );
  }

  async updateIntegration(id: number, updatedData: Partial<InsertIntegration>): Promise<Integration | undefined> {
    const integration = this.integrations.get(id);
    if (!integration) return undefined;
    
    const updatedIntegration: Integration = { ...integration, ...updatedData };
    this.integrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  async deleteIntegration(id: number): Promise<boolean> {
    return this.integrations.delete(id);
  }

  // Conversation methods
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const createdAt = new Date();
    const conversation: Conversation = { ...insertConversation, id, createdAt };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByWrapperId(wrapperId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.wrapperId === wrapperId
    );
  }

  async updateConversation(id: number, updatedData: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation: Conversation = { ...conversation, ...updatedData };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }
}

export const storage = new MemStorage();
