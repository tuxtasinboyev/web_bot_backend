// bot.service.ts
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Telegraf, Markup } from "telegraf";

interface UserRateLimit {
  count: number;
  firstRequestTime: number;
  blockedUntil?: number;
}

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;
  private userLimits: Map<number, UserRateLimit> = new Map();
  private waitingMessages: Map<number, number> = new Map();

  constructor() {
    this.bot = new Telegraf(process.env.BOT_TOKEN as string);
  }

  async onModuleInit() {
    const channels = process.env.CHANNELS?.split(",") || [];

    (async () => {
      // /start komandasi
      this.bot.start(async (ctx) => {
        const userId = ctx.from?.id;
        const userName = ctx.from?.first_name || "Foydalanuvchi";
        if (!userId) return;

        // Rate limit tekshirish
        const now = Date.now();
        const limit = this.userLimits.get(userId) || { count: 0, firstRequestTime: now };

        if (limit.blockedUntil && now < limit.blockedUntil) {
          const remaining = Math.ceil((limit.blockedUntil - now) / (1000 * 60 * 60));
          return ctx.reply(
            `⛔️ Siz vaqtincha bloklandingiz.\n⏰ Qayta urinish: ${remaining} soatdan keyin`
          );
        }

        if (now - limit.firstRequestTime > 60 * 1000) {
          limit.count = 1;
          limit.firstRequestTime = now;
        } else {
          limit.count += 1;
        }

        if (limit.count > 10) {
          limit.blockedUntil = now + 2 * 24 * 60 * 60 * 1000;
          this.userLimits.set(userId, limit);
          return ctx.reply("⚠️ Siz juda tez sorov yubordingiz.\n🔒 2 kunga bloklandingiz.");
        }

        this.userLimits.set(userId, limit);

        // Professional xush kelibsiz xabari
        const welcomeMessage = `⚠️ Botdan foydalanish uchun qoidalarni o'qib chiqing va quyidagi kanallarga obuna bo'ling:`;

        // Kanal tugmalarini yaratish (har biri alohida qatorda)
        const channelButtons = channels.map((channel) => {
          const url = channel.startsWith("@")
            ? `https://t.me/${channel.slice(1)}`
            : channel;
          return [Markup.button.url(`❌ ${channel}`, url)];
        });

        // "Obuna bo'ldim" tugmasi
        const checkButton = [Markup.button.callback("✅ Tekshirish", "CHECK_SUBS")];

        // Barcha tugmalarni birlashtirish
        const allButtons = [...channelButtons, checkButton];

        // Xabarni yuborish va ID sini saqlash
        const sentMessage = await ctx.reply(
          welcomeMessage,
          Markup.inlineKeyboard(allButtons)
        );
        this.waitingMessages.set(userId, sentMessage.message_id);
      });

      // Callback tugma bosilganda
      this.bot.action("CHECK_SUBS", async (ctx) => {
        const userId = ctx.from?.id;
        if (!userId) return;

        let allSubscribed = true;
        const notSubscribedChannels: string[] = [];

        for (const channel of channels) {
          const chatId = channel.startsWith("@") ? channel : `@${channel}`;
          try {
            const member = await this.bot.telegram.getChatMember(chatId, userId);
            if (member.status === "left" || member.status === "kicked") {
              allSubscribed = false;
              notSubscribedChannels.push(channel);
            }
          } catch (err) {
            console.log(`Kanal tekshirish xatolik: ${channel}`, err);
            allSubscribed = false;
            notSubscribedChannels.push(channel);
          }
        }

        if (!allSubscribed) {
          // Obuna bo'lmagan kanallar uchun yangi xabar
          const notSubMessage = `⚠️ Botdan foydalanish uchun qoidalarni o'qib chiqing va quyidagi kanallarga obuna bo'ling:`;

          // Faqat obuna bo'lmagan kanallar tugmalari
          const notSubButtons = notSubscribedChannels.map((channel) => {
            const url = channel.startsWith("@")
              ? `https://t.me/${channel.slice(1)}`
              : channel;
            return [Markup.button.url(`❌ ${channel}`, url)];
          });

          // "Tekshirish" tugmasi
          const recheckButton = [Markup.button.callback("✅ Tekshirish", "CHECK_SUBS")];

          // Barcha tugmalarni birlashtirish
          const allNotSubButtons = [...notSubButtons, recheckButton];

          // Avvalgi xabarni o'chirish
          const messageId = this.waitingMessages.get(userId);
          if (messageId) {
            try {
              await ctx.deleteMessage(messageId);
            } catch (err) {
              console.log("Xabarni o'chirish mumkin emas:", err);
            }
          }

          // Yangi xabar yuborish
          const newMessage = await ctx.reply(
            notSubMessage,
            Markup.inlineKeyboard(allNotSubButtons)
          );
          this.waitingMessages.set(userId, newMessage.message_id);

          return ctx.answerCbQuery("❌ Hali barcha kanallarga obuna bo'lmadingiz!");
        }

        // Avvalgi xabarni o'chirish
        const messageId = this.waitingMessages.get(userId);
        if (messageId) {
          try {
            await ctx.deleteMessage(messageId);
          } catch (err) {
            console.log("Xabarni o'chirish mumkin emas:", err);
          }
          this.waitingMessages.delete(userId);
        }

        // Muvaffaqiyatli xabar
        await ctx.reply(
          "✅ Barcha kanallarga obuna bo'ldingiz!\n\n📋 Endi ro'yxatdan o'tishingiz mumkin:",
          Markup.inlineKeyboard([
            [Markup.button.webApp("📋 Ro'yxatdan o'tish", "https://salomnnl.netlify.app/login")]
          ])
        );

        ctx.answerCbQuery("✅ Muvaffaqiyatli!");
      });

      await this.bot.launch();
      console.log("🚀 Bot ishga tushdi");
    })();
  }
}