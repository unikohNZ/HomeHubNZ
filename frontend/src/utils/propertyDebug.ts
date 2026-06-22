const PREFIX = "[HomeHub Property]";

export function logPropertyDebug(message: string, data?: unknown): void {
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    if (data !== undefined) {
      console.log(PREFIX, message, data);
    } else {
      console.log(PREFIX, message);
    }
  }
}
