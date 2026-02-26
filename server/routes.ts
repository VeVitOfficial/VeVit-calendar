import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const existingEvents = await storage.getEvents();
  if (existingEvents.length === 0) {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    await storage.createEvent({
      title: "Design Review pro VeVit",
      description: "Projdeme nové návrhy UI/UX.",
      date: new Date(`${todayStr}T10:00:00Z`),
      endDate: new Date(`${todayStr}T11:30:00Z`),
      isAllDay: false,
      color: "primary"
    });
    
    await storage.createEvent({
      title: "Team Building",
      description: "Odpolední akce s týmem!",
      date: new Date(`${todayStr}T14:00:00Z`),
      endDate: new Date(`${todayStr}T18:00:00Z`),
      isAllDay: false,
      color: "accent"
    });

    now.setDate(now.getDate() + 2);
    const futureStr = now.toISOString().split('T')[0];
    
    await storage.createEvent({
      title: "Celodenní Workshop",
      description: "Školení na nové technologie.",
      date: new Date(`${futureStr}T00:00:00Z`),
      isAllDay: true,
      color: "secondary"
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  seedDatabase().catch(console.error);

  app.get(api.events.list.path, async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch(err) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post(api.events.create.path, async (req, res) => {
    try {
      const body = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };
      
      const input = api.events.create.input.parse(body);
      const event = await storage.createEvent(input);
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.patch(api.events.update.path, async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.date) body.date = new Date(body.date);
      if (body.endDate) body.endDate = new Date(body.endDate);

      const input = api.events.update.input.parse(body);
      const event = await storage.updateEvent(Number(req.params.id), input);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete(api.events.delete.path, async (req, res) => {
    try {
      await storage.deleteEvent(Number(req.params.id));
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  return httpServer;
}
