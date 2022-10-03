import Command from './Command'
import { CommandInteraction } from 'discord.js'
import * as quotes from '../assets/rentsch.json';

/**
 * The command for Rentsch's quotes
 */
export default class RentschCommand extends Command {
  constructor () {
    super({
      description: 'Best René Rentsch quotes',
      intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'],
      partials: ['CHANNEL', 'USER', 'MESSAGE']
    })
  }

  async handle (interaction: CommandInteraction): Promise<void> {
    const sample = arr => arr[Math.floor(Math.random() * arr.length)];
    const quote = sample(quotes);
    await interaction.reply(`«${quote}», René Rentsch`);
  }
}
