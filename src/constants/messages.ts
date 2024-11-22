import { Messages } from '../types';
import { TYPES } from './types';

export const MESSAGES: Messages = {
  // Reports
  INDENTATION_TABS: {
    code: 'INDENTATION_TABS',
    type: TYPES.WARNING,
    message: 'Unexpected spaces found.',
  },
  INDENTATION_SPACES: {
    code: 'INDENTATION_SPACES',
    type: TYPES.WARNING,
    message: 'Unexpected tabs found.',
  },
  INDENTATION_SPACES_AMOUNT: {
    code: 'INDENTATION_SPACES_AMOUNT',
    type: TYPES.WARNING,
    message: 'Expected an indentation at {a} instead of at {b}.',
  },
  INDENTATION_GUESS: {
    type: TYPES.HINT,
    code: 'NEWLINE_GUESS',
    message: 'The indentation in this line seems to be incorrect. ' +
      'The expected indention is {a}, but {b} was found.',
  },
  TRAILINGSPACES: {
    code: 'TRAILINGSPACES',
    type: TYPES.WARNING,
    message: 'Unexpected trailing spaces found.',
  },
  NEWLINE: {
    code: 'NEWLINE',
    type: TYPES.WARNING,
    message: 'Expected a newline at the end of the file.',
  },
  NEWLINE_AMOUNT: {
    code: 'NEWLINE_AMOUNT',
    type: TYPES.WARNING,
    message: 'Unexpected additional newlines at the end of the file.',
  },
  NEWLINE_MAXIMUM: {
    code: 'NEWLINE_MAXIMUM',
    type: TYPES.WARNING,
    message: 'Maximum amount of newlines exceeded. Found {a} newlines, ' +
      'expected maximum is {b}.',
  },
  NEWLINE_MAXIMUM_INVALIDVALUE: {
    type: TYPES.WARNING,
    code: 'NEWLINE_MAXIMUM_INVALIDVALUE',
    message: 'The value "{a}" for the maximum of newlines is invalid.',
  },
  END_OF_LINE: {
    code: 'END_OF_LINE',
    type: TYPES.WARNING,
    message: 'Incorrect end of line character(s) found.',
  },

  // Exceptions
  EDITORCONFIG_NOTFOUND: {
    code: 'EDITORCONFIG_NOTFOUND',
    type: TYPES.WARNING,
    message: 'The editorconfig file "{a}" wasn\'t found.',
  },
  RCCONFIG_NOTFOUND: {
    code: 'RCCONFIG_NOTFOUND',
    type: TYPES.WARNING,
    message: 'The rcconfig file "{a}" wasn\'t found.',
  },
  PATH_INVALID: {
    code: 'PATH_INVALID',
    type: TYPES.WARNING,
    message: '"{a}" does not exists.',
  },
  PATH_ISNT_FILE: {
    code: 'PATH_ISNT_FILE',
    type: TYPES.WARNING,
    message: '"{a}" is not a file.',
  },
};
