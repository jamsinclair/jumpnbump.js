export type GameInputDevice =
    | {
          type: 'keyboard' | 'mouse';
          mappings: string[];
      }
    | {
          type: 'gamepad';
          id: string;
          mappings: string[];
      };
