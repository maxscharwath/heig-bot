import { BitFieldResolvable, CommandInteraction, IntentsString, PartialTypes } from 'discord.js'

type CommandOption = {
  description:string,
  intents: BitFieldResolvable<IntentsString, number>
  partials: PartialTypes[]
}

/**
 * Abstract class for commands
 */
export default abstract class Command{
  private options: CommandOption
  protected constructor (options:Partial<CommandOption>) {
    this.options = {
      description: "",
      intents: [],
      partials: [],
      ...options
    }
  }

  get intents(){
    return this.options.intents;
  }

  get partials(){
    return this.options.partials;
  }

  get description () {
    return this.options.description
  }

  /**
   * Handle the command interaction
   * @param interaction - The interaction object
   */
  abstract handle(interaction:CommandInteraction):void|Promise<void>;
}
