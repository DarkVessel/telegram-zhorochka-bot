/**
 * Информация о не загруженных командах.
 */
interface UnloadedCommand {
  path: string,
  error: Error
}

export default UnloadedCommand;
