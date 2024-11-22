export interface ValidatorSettings {
  encoding?: string;
  newline?: boolean;
  newlineMaximum?: boolean | number;
  indentation?: false | 'spaces' | 'tabs';
  spaces?: number;
  indentationGuess?: boolean;
  trailingspaces?: boolean;
  trailingspacesToIgnores?: boolean;
  trailingspacesSkipBlanks?: boolean;
  ignores?: string | string[];
  editorconfig?: boolean;
  rcconfig?: boolean | string;
  allowsBOM?: boolean;
  endOfLine?: false | 'lf' | 'crlf' | 'cr';
}

export interface ValidationMessage {
  code: string;
  type: string;
  message: string;
}

export interface ValidationPayload {
  [key: string]: unknown;
}

export interface InvalidFiles {
  [key: string]: {
    [key: number]: ValidationError[];
  };
}

export interface EditorConfigMapping {
  name: string;
  types: string[];
  regexp: RegExp | false;
  transform?: (value: any) => any;
}

export interface EditorConfigMappings {
  [key: string]: EditorConfigMapping;
}

export interface IgnorePatterns {
  [key: string]: RegExp;
}

export interface Messages {
  [key: string]: ValidationMessage;
}

// Import this at the end to avoid circular dependencies
import type { ValidationError } from '../ValidationError';
