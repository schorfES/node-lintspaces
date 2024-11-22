import { ValidatorSettings } from '../types';

export const DEFAULTS: ValidatorSettings = {
  encoding: 'utf8',
  newline: false,
  newlineMaximum: false,
  indentation: false,
  spaces: 4,
  indentationGuess: false,
  trailingspaces: false,
  trailingspacesToIgnores: false,
  trailingspacesSkipBlanks: false,
  ignores: [],
  editorconfig: false,
  rcconfig: false,
  allowsBOM: false,
  endOfLine: false,
};
