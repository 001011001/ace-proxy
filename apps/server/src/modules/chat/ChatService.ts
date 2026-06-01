import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  /**
   * AI Steward Bridge: 处理用户输入并翻译给卖家，或自动回复
   */
  async handleUserMessage(orderId: string, userId: string, content: string) {
    this.logger.log(`[Steward] Received message from user ${userId} for order ${orderId}: ${content}`);

    // 1. 自动议价/库存检测逻辑
    if (content.includes('diskon') || content.includes('murah')) {
      return this.autoReplyNegotiation(orderId);
    }

    // 2. 翻译为中文发送给 1688 卖家 (模拟 LLM 调用)
    const translated = await this.translateToChinese(content);
    this.logger.log(`[Steward] Translated to Chinese: ${translated}`);

    // 3. 记录到 order_chat 表
    await this.logMessage(orderId, 'USER', content, translated);

    return { 
      reply: "Terima kasih, tim pengadaan kami sedang menghubungi penjual. Kami akan mengabari Anda segera.",
      status: 'SENT_TO_SUPPLIER'
    };
  }

  private async autoReplyNegotiation(orderId: string) {
    // 逻辑：抓取 1688 阶梯价并返回给用户
    return {
      reply: "Halo! Jika Anda memesan 20 unit lagi, Anda bisa mendapatkan harga grosir Rp 45.000 per unit. Mau kami bantu tambahkan?",
      status: 'NEGOTIATION_AUTO_REPLY'
    };
  }

  private async translateToChinese(text: string): Promise<string> {
    // 模拟 LLM 翻译: Indo -> ZH
    return `[Translated] ${text}`;
  }

  private async logMessage(orderId: string, role: 'USER' | 'SUPPLIER' | 'STEWARD', original: string, translated: string) {
    // 模拟持久化到 Supabase
    this.logger.log(`[DB] Logged message for ${orderId}: ${original} (${translated})`);
  }

  /**
   * 处理 1688 卖家回复
   */
  async handleSupplierReply(orderId: string, supplierContent: string) {
    const translated = await this.translateToIndonesian(supplierContent);
    this.logger.log(`[Steward] Supplier replied: ${supplierContent} -> ${translated}`);

    // 记录并通知用户
    await this.logMessage(orderId, 'SUPPLIER', supplierContent, translated);
    return { translated };
  }

  private async translateToIndonesian(text: string): Promise<string> {
    // 模拟 LLM 翻译: ZH -> Indo
    return `[Terjemahan] ${text}`;
  }
}
