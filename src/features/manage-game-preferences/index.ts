export {
  defaultGamePreferences,
  getGamePreferencesSnapshot,
  getSoundChoiceSnapshot,
  readGamePreferences,
  saveSoundChoice,
  subscribeToGamePreferences,
  updateGamePreferences,
} from "./model/game-preferences-store";
export type {
  GamePreferences,
  SoundChoice,
} from "./model/game-preferences-store";
export { useGamePreferences } from "./model/use-game-preferences";
