// bot.service.ts
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Telegraf, Markup } from "telegraf";

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(process.env.BOT_TOKEN as string);
  }

  onModuleInit() {
    this.bot.start((ctx) =>
      ctx.reply(
        "Salom! Ijara BOR botga xush kelibsiz 👋",
        Markup.inlineKeyboard([
          Markup.button.webApp(
            "📋 Ro‘yxatdan o‘tish",
            "https://salomnnl.netlify.app/login"
          ),
        ])
      )
    );

    this.bot.launch();
    console.log("🚀 Bot ishga tushdi");
  }
}
