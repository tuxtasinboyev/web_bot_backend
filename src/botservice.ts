// bot.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf, Markup } from 'telegraf';
import { Context } from 'telegraf';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf<Context>;

  // Kanal usernamelarini @ bilan yozing (URL emas)
  private channels = [
    '@tuxtasinboyev',
  ];

  constructor() {
    this.bot = new Telegraf(process.env.BOT_TOKEN as string);
  }

  async onModuleInit() {
    // Tip-safe: URL va callback tugma turlarining union turi
    type UrlBtn = ReturnType<typeof Markup.button.url>;
    type CbBtn = ReturnType<typeof Markup.button.callback>;
    type Btn = UrlBtn | CbBtn;

    // Btn[][] tipi ham URL, ham callback tugmalarni qabul qiladi
    const channelButtons: Btn[][] = this.channels.map((channel) => {
      const username = channel.replace('@', '');
      return [
        Markup.button.url(`📢 ${username}`, `https://t.me/${username}`),
      ];
    });

    // Oxiriga callback tugmasini qo'shamiz (xonada Btn turiga mos)
    channelButtons.push([Markup.button.callback('✅ Obuna bo‘ldim', 'check_subs')]);

    // Xabar yuborish
    this.bot.start(async (ctx) => {
      await ctx.reply(
        '👋 Salom! Botdan foydalanishdan oldin quyidagi kanallarga obuna bo‘ling:',
        Markup.inlineKeyboard(channelButtons),
      );
    });

    // Callback — obuna tekshirish
    this.bot.action('check_subs', async (ctx) => {
      const userId = ctx.from.id;
      let allJoined = true;

      for (const channel of this.channels) {
        try {
          const member = await this.bot.telegram.getChatMember(channel, userId);

          if (
            member.status !== 'member' &&
            member.status !== 'administrator' &&
            member.status !== 'creator'
          ) {
            allJoined = false;
            break;
          }
        } catch (e) {
          allJoined = false;
          break;
        }
      }

      if (allJoined) {
        await ctx.editMessageText(
          '🎉 Rahmat! Endi botdan foydalanishingiz mumkin.',
          Markup.inlineKeyboard([
            [Markup.button.webApp('📋 Ro‘yxatdan o‘tish', 'https://salomnn.netlify.app/login')],
          ]),
        );
      } else {
        await ctx.answerCbQuery('❌ Hali hamma kanallarga obuna bo‘lmadingiz!');
      }
    });

    await this.bot.launch();
    console.log('🚀 Bot ishga tushdi');
  }
}
