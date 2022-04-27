import {
  Client,
  CommandInteraction, Guild,
} from 'discord.js'
import {
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandNumberOption,
  SlashCommandStringOption
} from '@discordjs/builders'
import {REST} from "@discordjs/rest";
import {Routes} from "discord-api-types/v9";
import Command from './commands/Command'
import Plugin from './plugins/Plugin'

/**
 * The bot class
 */
export default class Bot {
  private commands = new Map<string, Command>()
  private plugins = new Set<Plugin>();
  private client?: Client

  constructor (private config: {token: string,clientId: string}) {
  }

  /**
   * Adds a command to the bot
   * @param name - The name of the command
   * @param command - The command
   */
  public addCommand (name, command: Command): this {
    console.log(`Adding command ${name} with ${command.constructor.name} class`)
    this.commands.set(name, command)
    return this
  }

  /**
   * Adds a plugin to the bot
   * @param plugin - The plugin
   */
  public addPlugin(plugin:Plugin):this{
    console.log(`Adding plugin ${plugin.constructor.name}`)
    this.plugins.add(plugin);
    return this
  }

  private ready(){
    console.log('Bot is ready!')
    this.deployCommands(...this.client.guilds.cache.values());
    this.plugins.forEach(plugin=>plugin.connect(this.client));
  }

  /**
   * Starts the bot
   */
  public async start () {
    const commands = [...this.commands.values()];
    const intents = [...new Set(commands.flatMap(c=>c.intents))];
    const partials = [...new Set(commands.flatMap(c=>c.partials))];
    this.client?.destroy()
    this.client = new Client({
      intents,
      partials,
    })
    this.client.on('ready', () => {
      this.ready();
    })
    this.client.on('guildCreate', (guild: Guild) => {
      console.log(`Joined guild ${guild.name}`)
      this.deployCommands(guild);
    })
    this.client.on('messageCreate', message =>{
    })
    this.client.on('interactionCreate', async (interaction:CommandInteraction) => {
      try {
        switch (interaction.type) {
          case 'APPLICATION_COMMAND':
            await this.commands.get(interaction.commandName)?.handle(interaction)
            break
        }
      } catch (e) {
      }
    })

    await this.client.login(this.config.token)
  }

  /**
   * Deploys commands to a guild
   * @param guilds - The guild
   */
  public async deployCommands(...guilds:Guild[]): Promise<void> {
    const commands = [...this.commands.entries()].map(([commandName, command])=> {
      const builder = new SlashCommandBuilder()
        .setName(commandName)
        .setDescription(command.description);
      command.arguments.forEach(option => {
        switch (option.type) {
          case 'STRING':
            builder.addStringOption(new SlashCommandStringOption()
              .setName(option.name)
              .setRequired(option.required)
              .setDescription(option.description)
              .setChoices(option.choices??[])
            )
            break;
          case 'INTEGER':
            builder.addIntegerOption(new SlashCommandIntegerOption()
              .setName(option.name)
              .setRequired(option.required)
              .setDescription(option.description)
              .setChoices(option.choices??[])
            )
            break;
            case 'NUMBER':
            builder.addNumberOption(new SlashCommandNumberOption()
              .setName(option.name)
              .setRequired(option.required)
              .setDescription(option.description)
              .setChoices(option.choices??[])
            )
            break;
          case 'BOOLEAN':
            builder.addBooleanOption(new SlashCommandBooleanOption()
              .setName(option.name)
              .setRequired(option.required)
              .setDescription(option.description)
            )
            break;
        }
      })
      return builder.toJSON();
    });
    const rest = new REST({ version: '9' }).setToken(this.config.token);
    await Promise.allSettled(guilds.map(guild=>rest.put(Routes.applicationGuildCommands(this.config.clientId, guild.id), { body: commands })));
  }
}
