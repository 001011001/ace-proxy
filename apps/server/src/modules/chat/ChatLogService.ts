import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatLogService {
  private readonly logger = new Logger(ChatLogService.name);
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    userId?: string;
    sessionId: string;
    role: 'user' | 'assistant' | 'tool';
    content: string;
    intent?: string;
    metadata?: any;
  }) {
    try {
      return await this.prisma.chatLog.create({
        data: {
          ...params,
          metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        },
      });
    } catch (e: any) {
      this.logger.warn(`Failed to log chat: ${e.message}`);
    }
  }

  async exportTrainingData(since?: Date): Promise<string> {
    const logs = await this.prisma.chatLog.findMany({
      where: since ? { createdAt: { gte: since } } : {},
      orderBy: [{ sessionId: 'asc' }, { createdAt: 'asc' }],
    });

    const sessions = new Map<string, any[]>();
    for (const log of logs) {
      if (!sessions.has(log.sessionId)) sessions.set(log.sessionId, []);
      sessions.get(log.sessionId)!.push(log);
    }

    const lines: string[] = [];
    for (const [sid, msgs] of sessions) {
      const messages: any[] = [
        { role: 'system', content: 'You are AceProxy AI, an e-commerce shopping assistant...' }
      ];
      for (const m of msgs) {
        messages.push({ role: m.role, content: m.content });
      }
      lines.push(JSON.stringify({ messages }));
    }
    return lines.join('\n');
  }

  async getStats() {
    const [total, byIntent, recentSessions] = await Promise.all([
      this.prisma.chatLog.count(),
      this.prisma.chatLog.groupBy({ by: ['intent'], _count: true }),
      this.prisma.chatLog.findMany({
        distinct: ['sessionId'],
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { sessionId: true, createdAt: true, intent: true },
      }),
    ]);
    return { totalConversations: total, byIntent, recentSessions };
  }
}
