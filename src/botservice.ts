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

        // 🎨 SUPER CHIROYLI XUSH KELIBSIZ XABARI
        const welcomeMessage = `
╔═══════════════════════╗
     🌟 XUSH KELIBSIZ! 🌟
╚═══════════════════════╝

👋 Assalomu alaykum, <b>${userName}</b>!

🎯 Botimizdan foydalanish uchun:
   ├─ 📢 Quyidagi kanallarga obuna bo'ling
   └─ ✅ "Obuna bo'ldim" tugmasini bosing

━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim();

        // 🎨 KANAL TUGMALARINI YARATISH (2 tadan, gradient ranglarda)
        const channelButtons: any[] = [];
        const emojis = ["🔵", "🟣", "🟢", "🟡", "🔴", "🟠", "⚪️", "🟤"]; // Har xil ranglar

        for (let i = 0; i < channels.length; i += 2) {
          const row: any[] = [];

          // Birinchi kanal
          const channel1 = channels[i];
          const url1 = channel1.startsWith("@")
            ? `https://t.me/${channel1.slice(1)}`
            : channel1;
          const emoji1 = emojis[i % emojis.length];
          row.push(Markup.button.url(`${emoji1} ${channel1}`, url1));

          // Ikkinchi kanal (agar mavjud bo'lsa)
          if (i + 1 < channels.length) {
            const channel2 = channels[i + 1];
            const url2 = channel2.startsWith("@")
              ? `https://t.me/${channel2.slice(1)}`
              : channel2;
            const emoji2 = emojis[(i + 1) % emojis.length];
            row.push(Markup.button.url(`${emoji2} ${channel2}`, url2));
          }

          channelButtons.push(row);
        }

        // 🎨 AJRATUVCHI CHIZIQ
        const dividerButton: any[] = [
          Markup.button.callback("━━━━━━━━━━━━━━━━━━━━━", "DIVIDER")
        ];

        // 🎨 "OBUNA BO'LDIM" TUGMASI (to'liq kenglikda, gradient emoji bilan)
        const checkButton: any[] = [
          Markup.button.callback("✅ OBUNA BO'LDIM ✅", "CHECK_SUBS")
        ];

        // Barcha tugmalarni birlashtirish
        const allButtons = [...channelButtons, dividerButton, checkButton];

        // Xabarni yuborish va ID sini saqlash
        const sentMessage = await ctx.reply(
          welcomeMessage,
          {
            parse_mode: "HTML",
            ...Markup.inlineKeyboard(allButtons)
          }
        );
        this.waitingMessages.set(userId, sentMessage.message_id);
      });

      // Ajratuvchi tugma bosilganda (hech narsa qilmaslik)
      this.bot.action("DIVIDER", async (ctx) => {
        await ctx.answerCbQuery();
      });

      // Callback tugma bosilganda
      this.bot.action("CHECK_SUBS", async (ctx) => {
        const userId = ctx.from?.id;
        if (!userId) return;

        // Tekshirish jarayoni xabari
        await ctx.answerCbQuery("⏳ Obuna tekshirilmoqda...");

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
          const channelList = notSubscribedChannels
            .map((ch, idx) => `   ${idx + 1}. ❌ ${ch}`)
            .join('\n');

          const errorMessage = `
╔════════════════════════╗
     ⚠️ DIQQAT! ⚠️
╚════════════════════════╝

<b>Siz hali barcha kanallarga obuna bo'lmadingiz!</b>

📋 <b>Quyidagi kanallarga obuna bo'ling:</b>
${channelList}

━━━━━━━━━━━━━━━━━━━━━━━━

🔄 Obuna bo'lgandan keyin qaytadan 
   <b>"✅ OBUNA BO'LDIM"</b> tugmasini bosing.
          `.trim();

          return ctx.reply(errorMessage, {
            parse_mode: "HTML",
            reply_markup: { remove_keyboard: true }
          });
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

        // 🎉 MUVAFFAQIYATLI XABAR
        const successMessage = `
╔═══════════════════════╗
     🎉 TABRIKLAYMIZ! 🎉
╚═══════════════════════╝

✅ Siz barcha kanallarga muvaffaqiyatli 
   obuna bo'ldingiz!

🌟 Endi botimizdan to'liq foydalanishingiz 
   mumkin!

━━━━━━━━━━━━━━━━━━━━━━━━

👇 Quyidagi tugmani bosing:
        `.trim();

        await ctx.reply(
          successMessage,
          {
            parse_mode: "HTML",
            ...Markup.inlineKeyboard([
              [Markup.button.webApp("🚀 RO'YXATDAN O'TISH 🚀", "https://salomnnl.netlify.app/login")]
            ])
          }
        );
      });

      await this.bot.launch();
      console.log("🚀 Bot ishga tushdi");
    })();
  }
}