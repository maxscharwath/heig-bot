import * as dotenv from 'dotenv'
import Bot from './Bot'
import MenuCommand from './commands/MenuCommand'
import RickrollCommand from './commands/RickrollCommand'
import GutenMorgenPlugin from './plugins/GutenMorgenPlugin'
import ShittyFlutePlugin from './plugins/ShittyFlutePlugin'
import RentschCommand from './commands/RentschCommand'
dotenv.config()


const bot = new Bot({
  token: process.env.DISCORD_TOKEN!,
  clientId: process.env.DISCORD_CLIENT_ID!,
})
  .addPlugin(new GutenMorgenPlugin())
  .addPlugin(new ShittyFlutePlugin())
  .addCommand('rickroll', new RickrollCommand())
  .addCommand('menu', new MenuCommand({
    menuApiKey:process.env.MENU_API_KEY!,
    openai: {
      organization: process.env.OPENAI_ORGANIZATION!,
      apiKey: process.env.OPENAI_API_KEY!,
    },
    useOpenAi: false
  }))
  .addCommand('rrh', new RentschCommand());

bot.start();
