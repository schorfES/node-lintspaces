import * as fs from 'fs';
import rc from 'rc';
import extend from 'deep-extend';
import * as editorconfig from 'editorconfig';

import { DEFAULTS } from './constants/defaults';
import { MESSAGES } from './constants/messages';
import { PATTERNS } from './constants/ignorePatterns';
import { MAPPINGS } from './constants/editorconfigMappings';
import { ValidationError } from './ValidationError';
import { ValidatorSettings, ValidationMessage, ValidationPayload, InvalidFiles } from './types';

// Constants
const APPNAME = 'lintspaces';

// Regular Expressions
const EOF = '\\r?\\n';
const REGEXP_EOL = new RegExp(EOF);

const REGEXP_INDENTATION_TABS = /^\t*(?!\s).*$/; // leading tabs without leading spaces
const REGEXP_INDENTATION_TABS_WITH_BOM = /^\t*(?! |\t).*$/; // leading tabs without leading spaces (allows BOM)
const REGEXP_INDENTATION_SPACES = /^ *(?!\s).*$/; // leading spaces without leading tabs
const REGEXP_INDENTATION_SPACES_WITH_BOM = /^ *(?!\t).*$/; // leading spaces without leading tabs (allows BOM)

const REGEXP_LEADING_SPACES = /^( *).*$/; // leading spaces

export class Validator {
  private _options: ValidatorSettings;
  private _processedFiles: string[];
  private _invalid: InvalidFiles;
  private _path: string | null;
  private _settings: ValidatorSettings | null;
  private _data: string | undefined;
  private _lines: string[] | null;
  private _ignoredLines: { [key: number]: boolean } | null;

  constructor(options: ValidatorSettings = {}) {
    this._options = extend({}, DEFAULTS, options) as ValidatorSettings;
    this._processedFiles = [];
    this._invalid = {};
    this._path = null;
    this._settings = null;
    this._data = undefined;
    this._lines = null;
    this._ignoredLines = null;
  }

  /**
   * Check if a file is valid based on validation settings
   */
  public validate(path: string): void {
    let stat: fs.Stats;

    try {
      stat = fs.statSync(path);
    } catch(e) {
      this._fail(
        MESSAGES.PATH_INVALID.message
          .replace('{a}', path)
      );
      return;
    }

    if (stat.isFile()) {
      this._cleanUp();

      // Load file, settings & ignores:
      this._path = path;
      this._loadSettings();
      this._loadFile();
      this._loadIgnores();

      // Validate total file:
      this._validateNewlineMaximum();
      this._validateNewlinesEOF();
      this._validateEndOfLine();

      // Validate single lines:
      this._lines?.forEach((line, index) => {
        this._validateIndentation(line, index);
        this._validateTrailingspaces(line, index);
      });

      // Validation is done:
      this._done();
    } else {
      this._fail(
        MESSAGES.PATH_ISNT_FILE.message
          .replace('{a}', path)
      );
    }
  }

  /**
   * Get count of processed files
   */
  public getProcessedFiles(): number {
    return this._processedFiles.length;
  }

  /**
   * Get all invalid lines and messages from processed files
   */
  public getInvalidFiles(): InvalidFiles {
    return this._invalid;
  }

  /**
   * Get invalid lines by path
   */
  public getInvalidLines(path: string): { [key: number]: ValidationError[] } {
    return this._invalid[path] || {};
  }

  /**
   * Get static constants
   */
  public static get PATTERNS() {
    return PATTERNS;
  }

  public static get DEFAULTS() {
    return DEFAULTS;
  }

  public static get MESSAGES() {
    return MESSAGES;
  }

  public static get APPNAME() {
    return APPNAME;
  }

  /**
   * Reset references
   */
  private _cleanUp(): void {
    this._path = null;
    this._settings = null;
    this._data = undefined;
    this._lines = null;
    this._ignoredLines = null;
  }

  /**
   * After validation
   */
  private _done(): void {
    if (this._path && !this._processedFiles.includes(this._path)) {
      this._processedFiles.push(this._path);
    }
    this._cleanUp();
  }

  /**
   * Load settings
   */
  private _loadSettings(): void {
    // Initially the users options are the current settings:
    this._settings = extend({}, this._options) as ValidatorSettings;
    this._loadSettingsRCconfig();
    this._loadSettingsEditorconfig();
  }

  /**
   * Load file data
   */
  private _loadFile(): void {
    if (!this._path || !this._settings) return;
    this._data = fs.readFileSync(this._path, this._settings.encoding as BufferEncoding);
    this._lines = this._data.split(REGEXP_EOL);
  }

  /**
   * Throw an exception
   */
  private _fail(message: string): void {
    throw new Error(message);
  }

  /**
   * Add an invalid line
   */
  private _report(data: ValidationMessage & { line?: number }, linenumber: number, payload?: ValidationPayload): void {
    if (!this._path) return;

    let line: ValidationError[];
    let file: { [key: number]: ValidationError[] };
    let validationError: ValidationError;

    // Build dataset, aware to not overwrite the given data:
    data = extend({}, data) as ValidationMessage & { line?: number };
    data.line = linenumber;

    // Lookup for current file:
    if (!this._invalid[this._path]) {
      this._invalid[this._path] = {};
    }
    file = this._invalid[this._path];

    // Lookup for given line:
    if (!file[linenumber]) {
      file[linenumber] = [];
    }
    line = file[linenumber];

    // Build error:
    validationError = new ValidationError(data as ValidationMessage & { line: number }, payload);

    // Store error:
    line.push(validationError);
  }

  /**
   * Load RC configuration
   */
  private _loadSettingsRCconfig(): void {
    if (this._settings?.rcconfig) {
      let config;
      if (typeof this._settings.rcconfig === 'string') {
        try {
          const configPath = this._settings.rcconfig;
          const configContent = fs.readFileSync(configPath, 'utf8');
          config = JSON.parse(configContent);
        } catch (e) {
          this._fail(
            MESSAGES.RCCONFIG_NOTFOUND.message
              .replace('{a}', String(this._settings.rcconfig))
          );
        }
      } else {
        config = rc(APPNAME);
      }

      if (config) {
        this._settings = extend({}, this._settings, config) as ValidatorSettings;
      }
    }
  }

  /**
   * Load editorconfig settings
   */
  private _loadSettingsEditorconfig(): void {
    if (!this._path || !this._settings?.editorconfig) return;

    const config = editorconfig.parseSync(this._path);

    if (config) {
      Object.keys(config).forEach((key) => {
        const mapping = MAPPINGS[key as keyof typeof MAPPINGS];
        const value = config[key];

        if (mapping && this._settings) {
          const valid = mapping.types.some((type) => {
            const typeValid = typeof value === type;
            const regexpValid = mapping.regexp ? mapping.regexp.test(value) : true;

            return typeValid && regexpValid;
          });

          if (valid) {
            const transformedValue = mapping.transform ? mapping.transform(value) : value;
            (this._settings as any)[mapping.name] = transformedValue;
          }
        }
      });
    } else {
      this._fail(
        MESSAGES.EDITORCONFIG_NOTFOUND.message
          .replace('{a}', this._path)
      );
    }
  }

  /**
   * Load ignores
   */
  private _loadIgnores(): void {
    this._ignoredLines = {};

    if (this._settings?.ignores) {
      const ignores = typeof this._settings.ignores === 'string' ? [this._settings.ignores] : this._settings.ignores;

      if (Array.isArray(ignores) && this._data) {
        ignores.forEach((pattern) => {
          if (pattern && PATTERNS[pattern as keyof typeof PATTERNS]) {
            this._data!.split('\n').forEach((line, index) => {
              if (PATTERNS[pattern as keyof typeof PATTERNS].test(line)) {
                if (this._ignoredLines) {
                  this._ignoredLines[index + 1] = true;
                }
              }
            });
          }
        });
      }
    }
  }

  /**
   * Check if current line should be ignored
   */
  private _isIgnored(linenumber: number): boolean {
    return Boolean(this._ignoredLines?.[linenumber]);
  }

  /**
   * Validate maximum newlines
   */
  private _validateNewlineMaximum(): void {
    if (this._settings?.newlineMaximum) {
      const maximum = typeof this._settings.newlineMaximum === 'boolean'
        ? 1
        : this._settings.newlineMaximum;

      if (typeof maximum !== 'number') {
        this._fail(
          MESSAGES.NEWLINE_MAXIMUM_INVALIDVALUE.message
            .replace('{a}', String(maximum))
        );
      }

      let newlines = 0;
      let lastline = 0;

      this._lines?.forEach((line, index) => {
        if (line.length === 0) {
          newlines++;
          if (newlines > maximum) {
            this._report(MESSAGES.NEWLINE_MAXIMUM, lastline + 1, {
              maximum,
              newlines,
            });
          }
        } else {
          newlines = 0;
          lastline = index;
        }
      });
    }
  }

  /**
   * Validate newlines at the end of file
   */
  private _validateNewlinesEOF(): void {
    if (!this._lines || !this._settings) return;

    const index = this._lines.length;
    const newline = this._settings.newline;
    const empty = this._lines[index - 1].length === 0;

    if (newline && !empty) {
      this._report(MESSAGES.NEWLINE, index);
    } else if (!newline && empty) {
      this._report(MESSAGES.NEWLINE_AMOUNT, index);
    }
  }

  /**
   * Validate end of line character
   */
  private _validateEndOfLine(): void {
    if (!this._settings?.endOfLine || !this._data) return;

    const eol = this._settings.endOfLine.toLowerCase();
    const lines = this._data.split('\n');

    lines.forEach((line, index) => {
      if (line.length > 0 && !this._isIgnored(index + 1)) {
        const ending = line.match(/\r?\n$/);
        let valid = false;

        if (ending) {
          switch (eol) {
            case 'lf':
              valid = ending[0] === '\n';
              break;
            case 'crlf':
              valid = ending[0] === '\r\n';
              break;
            case 'cr':
              valid = ending[0] === '\r';
              break;
          }

          if (!valid) {
            this._report(MESSAGES.END_OF_LINE, index + 1);
          }
        }
      }
    });
  }

  /**
   * Validate indentation
   */
  private _validateIndentation(line: string, index: number): void {
    if (!this._settings || this._isIgnored(index + 1) || this._settings.indentation === false) return;

    const indentation = this._settings.indentation;
    const spaces = this._settings.spaces || 4;
    const tabs = indentation === 'tabs';
    const tabsRegExp = this._settings.allowsBOM ? REGEXP_INDENTATION_TABS_WITH_BOM : REGEXP_INDENTATION_TABS;
    const spacesRegExp = this._settings.allowsBOM ? REGEXP_INDENTATION_SPACES_WITH_BOM : REGEXP_INDENTATION_SPACES;

    // Indentation is "tabs"
    if (tabs && !tabsRegExp.test(line)) {
      this._report(MESSAGES.INDENTATION_TABS, index + 1);
    }

    // Indentation is "spaces"
    if (!tabs && !spacesRegExp.test(line)) {
      this._report(MESSAGES.INDENTATION_SPACES, index + 1);
    }

    // Indentation is "spaces" and amount of spaces
    // at the beginning of the line is not a multiple of settings.spaces
    if (!tabs && line.length > 0) {
      const matches = line.match(REGEXP_LEADING_SPACES);
      const leadingSpaces = matches ? matches[1].length : 0;

      if (leadingSpaces % spaces !== 0) {
        this._report(MESSAGES.INDENTATION_SPACES_AMOUNT, index + 1, {
          expected: Math.round(leadingSpaces / spaces) * spaces,
          found: leadingSpaces,
        });
      }
    }

    // Check indentation guessing:
    if (this._settings.indentationGuess && line.length > 0) {
      const matches = line.match(REGEXP_LEADING_SPACES);
      const leadingSpaces = matches ? matches[1].length : 0;

      if (leadingSpaces > 0) {
        const remainder = leadingSpaces % spaces;

        if (remainder !== 0) {
          const expected = Math.round(leadingSpaces / spaces) * spaces;
          const found = leadingSpaces;

          this._report(MESSAGES.INDENTATION_GUESS, index + 1, {
            expected,
            found,
          });
        }
      }
    }
  }

  /**
   * Validate trailing spaces
   */
  private _validateTrailingspaces(line: string, index: number): void {
    if (!this._settings) return;

    const trailingspaces = this._settings.trailingspaces;
    const skipBlanks = this._settings.trailingspacesSkipBlanks;
    const toIgnores = this._settings.trailingspacesToIgnores;

    if (trailingspaces && line.length > 0) {
      const trimmed = line.trimEnd();

      if ((!skipBlanks || trimmed.length > 0) && line.length !== trimmed.length) {
        if (!toIgnores || !this._isIgnored(index + 1)) {
          this._report(MESSAGES.TRAILINGSPACES, index + 1);
        }
      }
    }
  }
}
