import Command from './Command'
import { CommandInteraction, Guild, VoiceChannel } from 'discord.js'
import { AudioManager } from 'discordaudio'

/**
 * The command for rickrolling someone.
 */
export default class RickrollCommand extends Command {
  private guildManagers = new Map<string, AudioManager>()
  constructor () {
    super({
      description: 'Rickrolls the user',
      intents:['GUILD_VOICE_STATES']
    })
  }

  private getGuildManager(guild:Guild):AudioManager{
    let manager = this.guildManagers.get(guild.id);
    if(!manager){
      manager = new AudioManager();
      this.guildManagers.set(guild.id, manager);
    }
    return manager;
  }

  async handle (interaction: CommandInteraction): Promise<void> {
    const channel = interaction.guild.channels.cache.find(c => c.type === 'GUILD_VOICE' && c.members.size > 0);
    //reply to the user
    if(!channel) {
      return await interaction.reply(`I can't find a voice channel with people in it.`);
    }
    await interaction.reply(`Rickrolling...`);
    await this.getGuildManager(interaction.guild).play(channel as VoiceChannel, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
      audiotype: 'arbitrary',
      quality: 'high',
      volume: 2
    }).catch(err => {
      console.error(err);
      interaction.editReply(`I couldn't play the song.`);
    });
  }
}
