import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { AiCustomerService } from './AiCustomerService';
import { CustomerServiceTools } from './CustomerServiceTools';
import { ConversationMemory } from './ConversationMemory';

@Controller('customer-service')
export class CustomerServiceController {
  constructor(
    private readonly aiCustomer: AiCustomerService,
    private readonly tools: CustomerServiceTools,
    private readonly memory: ConversationMemory,
  ) {}

  /**
   * 用户发送客服消息（全自动 AI 处理）
   */
  @Post('query')
  async handleQuery(
    @Body()
    body: {
      userId: string;
      orderId?: string;
      message: string;
      language?: string;
      sessionId?: string;
    },
  ) {
    return this.aiCustomer.handleQuery({
      userId: body.userId,
      orderId: body.orderId,
      message: body.message,
      language: body.language || 'ID',
      sessionId: body.sessionId,
    });
  }

  /**
   * 获取订单客服上下文
   */
  @Get('order-context/:orderId')
  async getOrderContext(@Param('orderId') orderId: string) {
    return this.aiCustomer.getOrderContext(orderId);
  }

  /**
   * 客服统计数据（含自动解决率）
   */
  @Get('stats')
  async getStats() {
    return this.aiCustomer.getStats();
  }

  /**
   * 最近客服对话
   */
  @Get('recent-chats')
  async getRecentChats() {
    return this.aiCustomer.getRecentChats();
  }

  /**
   * 获取会话历史（管理面板查看完整对话）
   */
  @Get('conversation/:sessionId')
  async getConversation(
    @Param('sessionId') sessionId: string,
    @Query('userId') userId?: string,
  ) {
    return this.aiCustomer.getConversationHistory(sessionId, userId);
  }

  /**
   * 管理面板：查看用户画像
   */
  @Get('user-profile/:userId')
  async getUserProfile(@Param('userId') userId: string) {
    const profile = await this.memory.getUserProfile(userId);
    return profile || { userId, error: 'User not found' };
  }

  /**
   * 管理面板：手动执行工具（管理员排查问题用）
   */
  @Post('admin/tool')
  async adminExecuteTool(
    @Body()
    body: {
      toolName: string;
      args: Record<string, any>;
      userId?: string;
    },
  ) {
    const result = await this.tools.executeTool(
      body.toolName,
      body.args || {},
      body.userId,
    );
    return result;
  }

  /**
   * 知识库搜索（管理面板调试用）
   */
  @Get('knowledge-base/search')
  async searchKnowledgeBase(
    @Query('query') query: string,
    @Query('language') language?: string,
  ) {
    return {
      policies: [],
      faqs: [], // Hidden: would reveal hardcoded KB to admin only
      results: [],
    };
  }

  /**
   * 清除会话记忆
   */
  @Post('session/:sessionId/clear')
  async clearSession(@Param('sessionId') sessionId: string) {
    this.memory.clearSession(sessionId);
    return { success: true, sessionId };
  }
}
