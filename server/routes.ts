import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWrapperSchema, insertPromptSchema, insertIntegrationSchema, insertConversationSchema } from "@shared/schema";
import { z } from "zod";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize Google Generative AI (Gemini)
const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key-for-development");

export async function registerRoutes(app: Express): Promise<Server> {
  // API route prefix
  const apiPrefix = "/api";

  // Health check endpoint
  app.get(`${apiPrefix}/health`, (_req, res) => {
    res.json({ status: "ok" });
  });

  // Wrappers endpoints
  app.get(`${apiPrefix}/wrappers`, async (_req, res) => {
    try {
      // Using a fixed user ID for demo purposes
      const userId = 1;
      const wrappers = await storage.getWrappersByUserId(userId);
      res.json(wrappers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wrappers" });
    }
  });

  app.get(`${apiPrefix}/wrappers/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid wrapper ID" });
      }
      
      const wrapper = await storage.getWrapper(id);
      if (!wrapper) {
        return res.status(404).json({ error: "Wrapper not found" });
      }
      
      res.json(wrapper);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wrapper" });
    }
  });

  app.post(`${apiPrefix}/wrappers`, async (req, res) => {
    try {
      // Using a fixed user ID for demo purposes
      req.body.userId = 1;
      
      const validatedData = insertWrapperSchema.parse(req.body);
      const wrapper = await storage.createWrapper(validatedData);
      res.status(201).json(wrapper);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create wrapper" });
    }
  });

  app.put(`${apiPrefix}/wrappers/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid wrapper ID" });
      }
      
      const validatedData = insertWrapperSchema.partial().parse(req.body);
      const updatedWrapper = await storage.updateWrapper(id, validatedData);
      
      if (!updatedWrapper) {
        return res.status(404).json({ error: "Wrapper not found" });
      }
      
      res.json(updatedWrapper);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update wrapper" });
    }
  });

  app.delete(`${apiPrefix}/wrappers/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid wrapper ID" });
      }
      
      const success = await storage.deleteWrapper(id);
      if (!success) {
        return res.status(404).json({ error: "Wrapper not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete wrapper" });
    }
  });

  // Prompts endpoints
  app.get(`${apiPrefix}/wrappers/:wrapperId/prompts`, async (req, res) => {
    try {
      const wrapperId = parseInt(req.params.wrapperId);
      if (isNaN(wrapperId)) {
        return res.status(400).json({ error: "Invalid wrapper ID" });
      }
      
      const prompts = await storage.getPromptsByWrapperId(wrapperId);
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prompts" });
    }
  });

  app.post(`${apiPrefix}/wrappers/:wrapperId/prompts`, async (req, res) => {
    try {
      const wrapperId = parseInt(req.params.wrapperId);
      if (isNaN(wrapperId)) {
        return res.status(400).json({ error: "Invalid wrapper ID" });
      }
      
      // Check if wrapper exists
      const wrapper = await storage.getWrapper(wrapperId);
      if (!wrapper) {
        return res.status(404).json({ error: "Wrapper not found" });
      }
      
      req.body.wrapperId = wrapperId;
      const validatedData = insertPromptSchema.parse(req.body);
      const prompt = await storage.createPrompt(validatedData);
      
      res.status(201).json(prompt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create prompt" });
    }
  });

  // Integrations endpoints
  app.get(`${apiPrefix}/wrappers/:wrapperId/integrations`, async (req, res) => {
    try {
      const wrapperId = parseInt(req.params.wrapperId);
      if (isNaN(wrapperId)) {
        return res.status(400).json({ error: "Invalid wrapper ID" });
      }
      
      const integrations = await storage.getIntegrationsByWrapperId(wrapperId);
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  app.post(`${apiPrefix}/wrappers/:wrapperId/integrations`, async (req, res) => {
    try {
      const wrapperId = parseInt(req.params.wrapperId);
      if (isNaN(wrapperId)) {
        return res.status(400).json({ error: "Invalid wrapper ID" });
      }
      
      // Check if wrapper exists
      const wrapper = await storage.getWrapper(wrapperId);
      if (!wrapper) {
        return res.status(404).json({ error: "Wrapper not found" });
      }
      
      req.body.wrapperId = wrapperId;
      const validatedData = insertIntegrationSchema.parse(req.body);
      const integration = await storage.createIntegration(validatedData);
      
      res.status(201).json(integration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create integration" });
    }
  });

  // Conversations endpoints
  app.get(`${apiPrefix}/wrappers/:wrapperId/conversations`, async (req, res) => {
    try {
      const wrapperId = parseInt(req.params.wrapperId);
      if (isNaN(wrapperId)) {
        return res.status(400).json({ error: "Invalid wrapper ID" });
      }
      
      const conversations = await storage.getConversationsByWrapperId(wrapperId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post(`${apiPrefix}/wrappers/:wrapperId/conversations`, async (req, res) => {
    try {
      const wrapperId = parseInt(req.params.wrapperId);
      if (isNaN(wrapperId)) {
        return res.status(400).json({ error: "Invalid wrapper ID" });
      }
      
      // Check if wrapper exists
      const wrapper = await storage.getWrapper(wrapperId);
      if (!wrapper) {
        return res.status(404).json({ error: "Wrapper not found" });
      }
      
      req.body.wrapperId = wrapperId;
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Chat completion endpoint
  app.post(`${apiPrefix}/chat`, async (req, res) => {
    try {
      const { wrapperId, message, conversationId } = req.body;
      
      if (!wrapperId || !message) {
        return res.status(400).json({ error: "Wrapper ID and message are required" });
      }
      
      // Get the wrapper configuration
      const wrapper = await storage.getWrapper(parseInt(wrapperId));
      if (!wrapper) {
        return res.status(404).json({ error: "Wrapper not found" });
      }
      
      // Get or create conversation history
      let conversation;
      let messages = [];
      
      if (conversationId) {
        conversation = await storage.getConversation(parseInt(conversationId));
        if (conversation) {
          messages = conversation.messages as any[];
        }
      }
      
      // Add system prompt as first message if available
      if (wrapper.systemPrompt && messages.length === 0) {
        messages.push({
          role: "system",
          content: wrapper.systemPrompt
        });
      }
      
      // Add the new user message
      messages.push({
        role: "user",
        content: message
      });
      
      try {
        // Get the appropriate model based on wrapper selection
        // Gemini models: gemini-pro, gemini-pro-vision
        const modelName = wrapper.baseModel === "Gemini Pro" ? "gemini-pro" : 
                         (wrapper.baseModel === "Gemini Pro Vision" ? "gemini-pro-vision" : "gemini-pro");
        const model = geminiAI.getGenerativeModel({ model: modelName });
        
        // Convert messages to Gemini format
        // Gemini doesn't support system messages directly, so we'll combine it with user message if needed
        const geminiMessages = messages.map(msg => {
          if (msg.role === "system") {
            return { role: "user", parts: [{ text: `(System instruction: ${msg.content})` }] };
          } else if (msg.role === "user") {
            return { role: "user", parts: [{ text: msg.content }] };
          } else {
            return { role: "model", parts: [{ text: msg.content }] };
          }
        });
        
        // Create a chat session
        const chat = model.startChat({
          generationConfig: {
            temperature: wrapper.temperature ? wrapper.temperature / 100 : 0.7,
            topP: wrapper.topP ? wrapper.topP / 100 : 0.9,
            maxOutputTokens: wrapper.maxTokens || 2048,
          },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ],
          history: geminiMessages.slice(0, -1), // Exclude the last message which we'll send separately
        });
        
        // Send the last message to get a response
        const lastMessage = geminiMessages[geminiMessages.length - 1];
        const result = await chat.sendMessage(lastMessage.parts[0].text);
        const responseText = result.response.text();
        
        // Add the response to the conversation history
        messages.push({
          role: "assistant",
          content: responseText
        });
        
        // Update or create conversation
        if (conversation) {
          await storage.updateConversation(conversation.id, { messages });
        } else {
          conversation = await storage.createConversation({
            wrapperId: parseInt(wrapperId),
            messages
          });
        }
        
        // Create a usage estimate (Gemini doesn't provide token counts like OpenAI)
        const estimatedUsage = {
          prompt_tokens: Math.floor(message.length / 4),
          completion_tokens: Math.floor(responseText.length / 4),
          total_tokens: Math.floor((message.length + responseText.length) / 4)
        };
        
        // Return the response with conversation details
        res.json({
          message: responseText,
          conversationId: conversation.id,
          usage: estimatedUsage,
          model: modelName
        });
      } catch (error) {
        console.error("Gemini API error:", error);
        res.status(500).json({ error: "Error communicating with AI model" });
      }
    } catch (error) {
      console.error("Chat completion error:", error);
      res.status(500).json({ error: "Failed to process chat request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
