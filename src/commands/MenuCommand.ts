import Command from './Command'

import axios from 'axios'
import { Configuration, ConfigurationParameters, OpenAIApi } from 'openai'
import { CommandInteraction, MessageEmbed } from 'discord.js'

interface MenuResponse {
  day: string | Date;
  menus: Menu[];
}

interface MenuWeekResponse {
  _id: string;
  week: number;
  year: number;
  monday: string;
  friday: string;
  days: MenuResponse[];
  lastSave: string;
  lastPublish: string;
  lastNotify: string;
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
  private readonly menuApiKey: string

  constructor (options: {menuApiKey:string,openai:ConfigurationParameters,useOpenAi?:boolean}) {
    super({
      description: 'Get the menu for the day',
      arguments: [
        {
          type: 'INTEGER',
          name: 'day',
          description: 'The day to get the menu for',
          required: false,
          choices: [
            ['monday',0],
            ['tuesday',1],
            ['wednesday',2],
            ['thursday',3],
            ['friday',4],
          ]
        }
      ],
      intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'],
      partials: ['CHANNEL', 'USER', 'MESSAGE']
    })
    this.useOpenAi = options.useOpenAi??true;
    this.openai = new OpenAIApi(new Configuration(options.openai))
    this.menuApiKey = options.menuApiKey
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

  private async menuEmbed (menu: MenuResponse): Promise<MessageEmbed[]> {
    menu.day = new Date(menu.day);
    menu.menus = menu.menus.filter(m => m.starter && m.mainCourse.every(main => main) && m.dessert);
    const embeds: MessageEmbed[] = [];
    for (let i = 0; i < menu.menus.length; i++) {
      const m = menu.menus[i];
      const embed = new MessageEmbed()
        .setTitle(`Menu ${i + 1}`)
        .setColor('#0099ff')
        .addField('Entrée', m.starter)
        .addField('Plat', m.mainCourse.join('\n'))
        .addField('Dessert', m.dessert)
      if (this.useOpenAi) {
        embed.addField("L'avis de GPT-3", await this.openAiMenuGrade(m).catch(() => "Je n'ai pas réussi à te donner un avis"))
      }
      embeds.push(embed);
    }
    return embeds;
  }

  private async getTodayMenu(): Promise<MessageEmbed[]> {
    const response = await axios.get<MenuResponse>('https://apix.blacktree.io/top-chef/today');
    const menu = response.data;
    if(!menu) return [];
    return this.menuEmbed(menu);
  }

  private async getWeekMenus(): Promise<MessageEmbed[][]> {
    const response = await axios.get<MenuWeekResponse>('https://top-chef-intra-api.blacktree.io/weeks/current',{
      headers: {
        'x-api-key': this.menuApiKey
      }
    });
    const menus = response.data;
    if(!menus)return [];
    const embeds: MessageEmbed[][] = [];
    for (const day of menus.days) {
      embeds.push(await this.menuEmbed(day));
    }
    return embeds;
  }


  public async handle (command: CommandInteraction): Promise<void> {
    const day = command.options.getInteger('day')
    await command.reply(`Menu en cours de chargement...`)
    console.log(day)
    if(day!==null){
      const embeds = await this.getWeekMenus();
      console.log(embeds)
      if(embeds[day]){
        await command.editReply({embeds: embeds[day]})
      }else{
        await command.editReply("Aucun menu n'est disponible pour ce jour")
      }
    }else{
      const embeds = await this.getTodayMenu();
      if(embeds.length > 1) {
        await command.editReply({ embeds });
      }else{
        await command.editReply("Aucun menu n'est disponible pour aujourd'hui")
      }
    }
  }
}
