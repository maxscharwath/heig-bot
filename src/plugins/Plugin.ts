import { Client } from 'discord.js'

/**
 * Abstract class for plugins.
 */
export default abstract class Plugin{
  protected client: Client
  public connect(client:Client){
    this.client = client;
    this.run();
  }

  /**
   * Run the plugin. Executed when client is ready.
   * @protected
   */
  protected abstract run():void;
}
