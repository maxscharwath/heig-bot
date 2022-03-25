import Command from './Command'

import axios from 'axios'
import { Configuration, ConfigurationParameters, OpenAIApi } from 'openai'
import { CommandInteraction, MessageEmbed } from 'discord.js'

interface MenuResponse {
  day: string | Date;
  menus: Menu[];
}

interface Menu {
  starter: string;
  mainCourse: string[];
  dessert: string;
  containsPork: boolean;
}

/**
 * Command to get the menu of the day
 */
export default class MenuCommand extends Command {
  private readonly openai: OpenAIApi
  private readonly useOpenAi: boolean;

  constructor (options: {openai:ConfigurationParameters,useOpenAi?:boolean}) {
    super({
      description: 'Get the menu for the day',
      intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'],
      partials: ['CHANNEL', 'USER', 'MESSAGE']
    })
    this.useOpenAi = options.useOpenAi??true;
    this.openai = new OpenAIApi(new Configuration(options.openai))
  }

  private async openAiMenuGrade(menu:Menu){
    const { data } = await this.openai.createCompletion("text-davinci-001", {
      prompt: `Que pense tu de ce menu "En entrée ${menu.starter} avec comme plat ${menu.mainCourse.join(' ')} avec comme dessert ${menu.dessert}" et pourquoi?`,
      max_tokens: 1000,
      temperature: 0.3,
    });
    return data.choices[0].text;
  }

  private async openAiChoseMenu(menus:Menu[]){
    const { data } = await this.openai.createCompletion("text-davinci-001", {
      prompt: `Choisis un menu parmis les suivants: ${menus.map((menu, i) => `Menu ${i+1} "En entrée ${menu.starter} avec comme plat ${menu.mainCourse.join(' ')} avec comme dessert ${menu.dessert}"`).join(', ')} et pourquoi celui là?`,
      max_tokens: 1000,
      temperature: 0.3,
    });
    return data.choices[0].text;
  }


  public async handle (command: CommandInteraction): Promise<void> {
    await command.reply(`Menu en cours de chargement...`)
    const response = await axios.get<MenuResponse>('https://apix.blacktree.io/top-chef/today');
    const menu = response.data;
    menu.day = new Date(menu.day);
    menu.menus = menu.menus.filter(m => m.starter && m.mainCourse.every(main=>main) && m.dessert);
    const embeds: MessageEmbed[] = [];
    for (let i = 0; i < menu.menus.length; i++) {
      const m = menu.menus[i];
      const embed = new MessageEmbed()
        .setTitle(`Menu ${i + 1}`)
        .setColor('#0099ff')
        .addField('Entrée', m.starter)
        .addField('Plat', m.mainCourse.join('\n'))
        .addField('Dessert', m.dessert)
      if(this.useOpenAi){
      embed.addField("L'avis de GPT-3", await this.openAiMenuGrade(m).catch(()=>"Je n'ai pas réussi à te donner un avis"))
      }
      embeds.push(embed);
    }
    await command.editReply({ embeds });
  }
}
