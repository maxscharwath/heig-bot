import { BitFieldResolvable, CommandInteraction, IntentsString, PartialTypes } from 'discord.js'

type BaseCommandArgument<T, TYPE = 'STRING'|'BOOLEAN'|'NUMBER'|'INTEGER'> = {
  type: TYPE
  name: string,
  description: string,
  required: boolean,
  choices?: [name: string, value: T][],
}
type CommandArgument = BaseCommandArgument<string, 'STRING'> | BaseCommandArgument<number, 'NUMBER'> | BaseCommandArgument<number, 'INTEGER'> | Omit<BaseCommandArgument<boolean, 'BOOLEAN'>, 'choices'>

type CommandOption = {
  description:string,
  intents: BitFieldResolvable<IntentsString, number>
  partials: PartialTypes[]
  arguments: CommandArgument[]
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
      arguments: [],
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

  get arguments () {
    return this.options.arguments
  }

  /**
   * Handle the command interaction
   * @param interaction - The interaction object
   */
  abstract handle(interaction:CommandInteraction):void|Promise<void>;
}
