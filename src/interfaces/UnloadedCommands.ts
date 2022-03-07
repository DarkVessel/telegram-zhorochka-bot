/**
 * Информация о не загруженных командах.
 */
interface UnloadedCommands {
  path: string,
  error: Error
}

export = UnloadedCommands;
