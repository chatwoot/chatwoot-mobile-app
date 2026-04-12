declare module 'diff' {
  export interface Change {
    count?: number;
    added?: boolean;
    removed?: boolean;
    value: string;
  }

  export function diffChars(oldStr: string, newStr: string): Change[];
}
