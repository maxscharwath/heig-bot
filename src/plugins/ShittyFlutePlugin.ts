import Plugin from './Plugin'
import * as musics from '../assets/flute.json'
import { AudioManager } from 'discordaudio'
import { Guild, VoiceChannel } from 'discord.js'

/**
 * ShittyFlutePlugin
 */
export default class ShittyFlutePlugin extends Plugin{

  manager: AudioManager = new AudioManager();

  constructor () {
    super()
    console.log(`[ShittyFlute] loaded ${musics.length} musics`)
  }


  private flute(guild:Guild){
    const channel = guild.channels.cache.filter(c => c.type === 'GUILD_VOICE' && c.members.size > 0).random() as VoiceChannel;
    if (!channel) return;
    this.manager.destroy()
    const music = musics[Math.floor(Math.random() * musics.length)];
    this.manager.play(channel, music, {
      audiotype: 'arbitrary',
      quality: 'high',
      volume: 5
    }).finally(() => {})
  }

    protected run(): void {
        const manager = new AudioManager();
        setInterval(() => {
          this.client.guilds.cache.forEach(guild => {
            if(Math.random() > 0.95) return;
            this.flute(guild);
          });
        }, 1000 * 60 * 15);
        this.client.on('message', async message => {
          if (message.content === '!flute') {
            this.flute(message.guild);
          }
          if (message.content.toLowerCase() === '!stop') {
            manager.destroy()
          }
        });

    }
}
