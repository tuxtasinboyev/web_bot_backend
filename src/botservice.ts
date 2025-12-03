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

  constructor() {
    this.bot = new Telegraf(process.env.BOT_TOKEN as string);
  }

  async onModuleInit() {
    const channels = process.env.CHANNELS?.split(",") || [];

    (async () => {
      this.bot.start(async (ctx) => {
        const userId = ctx.from?.id;
        if (!userId) return;

        const now = Date.now();
        const limit = this.userLimits.get(userId) || { count: 0, firstRequestTime: now };

        if (limit.blockedUntil && now < limit.blockedUntil) {
          const remaining = Math.ceil((limit.blockedUntil - now) / (1000 * 60 * 60));
          return ctx.reply(`Siz vaqtincha bloklandingiz. Qayta urinib ko‘rishingiz mumkin: ${remaining} soatdan keyin`);
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
          return ctx.reply("Siz juda tez sorov yubordingiz. 2 kunga bloklandingiz.");
        }

        this.userLimits.set(userId, limit);

        // Kanalga obuna bo'lishni tekshirish
        let allSubscribed = true;
        for (const channel of channels) {
          const chatId = channel.startsWith("@") ? channel : `@${channel}`;
          const member = await this.bot.telegram.getChatMember(chatId, userId);
          if (member.status === "left" || member.status === "kicked") {
            allSubscribed = false;
            break;
          }
        }

        if (!allSubscribed) {
          // Foydalanuvchi obuna bo‘lmagan bo‘lsa, xabarni saqlash va qaytarish
          return ctx.reply(
            `Iltimos, barcha kanallarga obuna bo'ling: \n${channels.join("\n")}`
          );
        }

        // Agar foydalanuvchi barcha kanallarga obuna bo‘lgan bo‘lsa, avvalgi xabarni o‘chirish
        try {
          await ctx.deleteMessage(); // shu start xabarini o'chiradi
        } catch (err) {
          console.log("Xabarni o'chirish mumkin emas:", err);
        }

        // Tugmalarni yaratish
        const buttons = channels.map((channel) => {
          const url = channel.startsWith("@") ? `https://t.me/${channel.slice(1)}` : channel;
          return Markup.button.url(`Kanal: ${channel}`, url);
        });

        await ctx.reply(
          "Salom! Ijara BOR botga xush kelibsiz 👋",
          Markup.inlineKeyboard([
            Markup.button.webApp(
              "📋 Ro‘yxatdan o‘tish",
              "https://salomnnl.netlify.app/login"
            ),
            ...buttons,
          ])
        );
      });

      await this.bot.launch();
      console.log("🚀 Bot ishga tushdi");
    })();
  }
}
