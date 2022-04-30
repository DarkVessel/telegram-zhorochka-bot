/**
 * Информация о не загруженных ивентах.
 */
 interface UnloadedEvent {
    filename: string,
    error: Error
  }
  
  export = UnloadedEvent;
  