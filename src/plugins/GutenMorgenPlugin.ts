import Plugin from './Plugin'
import { AudioManager } from 'discordaudio'
import { VoiceChannel } from 'discord.js'

/**
 * The Guten Morgen plugin.
 * Play Guten Morgen on the server. When someone writes "Guten Morgen" in a channel, the bot will play the Guten Morgen song.
 */
export default class GutenMorgenPlugin extends Plugin{
    protected run(): void {
        const manager = new AudioManager();
        this.client.on('message', async (message) => {
            try {
                if (message.content === 'Guten Morgen') {
                    const user = message.member
                    const channel = user.voice.channel as VoiceChannel;
                    manager.destroy()
                    await manager.play(channel, "src/assets/GutenMorgen.mp3", {
                        audiotype: 'arbitrary',
                        quality: 'high',
                        volume: 5
                    }).finally(() => {
                    })
                } else if (message.content === 'Guten Abend') {
                    manager.destroy();
                }
            } catch (error) {
                console.log(error)
            }
        })
    }
}
