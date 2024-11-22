import * as path from 'path';
import * as fs from 'fs';

import { DEFAULTS } from './constants/defaults';
import { MESSAGES } from './constants/messages';
import { PATTERNS } from './constants/ignorePatterns';
import { Validator } from './Validator';

const __fromFixtures = (...args: string[]): string => path.join.apply(null, [__dirname, '__fixtures__'].concat(args));

describe('The validator', () => {
  // Static
  // -------------------------------------------------------------------------
  describe('static', () => {
    it('should export appname', () => {
      expect(Validator.APPNAME).toBe('lintspaces');
    });

    it('should export defaults', () => {
      expect(Validator.DEFAULTS).toEqual(DEFAULTS);
    });

    it('should export messages', () => {
      expect(Validator.MESSAGES).toEqual(MESSAGES);
    });

    it('should export ignore patterns', () => {
      expect(Validator.PATTERNS).toEqual(PATTERNS);
    });
  });

  // Core
  // -------------------------------------------------------------------------
  describe('core', () => {
    it('should throw if file does not exist', () => {
      const validator = new Validator({ trailingspaces: true });
      const cases = [path.join('this', 'file', 'does', 'not', 'exists.js')];

      cases.forEach((file) => {
        const message = MESSAGES.PATH_INVALID.message.replace('{a}', file);
        const error = new Error(message);
        expect(() => validator.validate(file)).toThrow(error);
      });
    });

    it('should throw if file is not a file', () => {
      const validator = new Validator({ trailingspaces: true });
      const cases = [
        '.',
        __dirname,
        __fromFixtures(),
      ];

      cases.forEach((file) => {
        const message = MESSAGES.PATH_ISNT_FILE.message.replace('{a}', file);
        const error = new Error(message);
        expect(() => validator.validate(file)).toThrow(error);
      });
    });

    describe('rcconfig', () => {
      it('should override settings', () => {
        // fake loading:
        const validator = new Validator({
          trailingspaces: false,
          newlineMaximum: false,
          indentation: 'tabs',
          spaces: 4,
          newline: true,
          ignores: ['js-comments'],
          rcconfig: __fromFixtures('.lintspacesrc'),
        });

        // Access private properties for testing
        (validator as any)._path = __filename;
        (validator as any)._loadSettings();

        expect((validator as any)._settings.trailingspaces).toBeFalsy();
        expect((validator as any)._settings.newline).toBeFalsy();
        expect((validator as any)._settings.indentation).toBe('spaces');
        expect((validator as any)._settings.spaces).toBe(4);

        // Unchanged:
        expect((validator as any)._settings.newlineMaximum).toBe(false);
        expect((validator as any)._settings.ignores).toEqual(['js-comments']);
      });

      it('should load by appname', () => {
        const config = path.join(__dirname, '..', `.${Validator.APPNAME}rc`);

        // create config file:
        fs.writeFileSync(config, JSON.stringify({
          indentation: 'spaces',
          trailingspaces: true,
        }));

        try {
          const validator = new Validator({
            rcconfig: true,
          });

          // Access private properties for testing
          (validator as any)._path = __filename;
          (validator as any)._loadSettings();

          expect((validator as any)._settings.indentation).toBe('spaces');
          expect((validator as any)._settings.trailingspaces).toBeTruthy();
        } finally {
          // cleanup:
          fs.unlinkSync(config);
        }
      });

      it('should load by path', () => {
        const config = path.join(__dirname, '..', '.customrc');

        // create config file:
        fs.writeFileSync(config, JSON.stringify({
          indentation: 'spaces',
          trailingspaces: true,
        }));

        try {
          const validator = new Validator({
            rcconfig: config,
          });

          // Access private properties for testing
          (validator as any)._path = __filename;
          (validator as any)._loadSettings();

          expect((validator as any)._settings.indentation).toBe('spaces');
          expect((validator as any)._settings.trailingspaces).toBeTruthy();
        } finally {
          // cleanup:
          fs.unlinkSync(config);
        }
      });

      it('should throw if config does not exist', () => {
        const config = path.join(__dirname, '..', '.customrc');
        const validator = new Validator({
          rcconfig: config,
        });

        // Access private properties for testing
        (validator as any)._path = __filename;

        const message = MESSAGES.RCCONFIG_NOTFOUND.message.replace('{a}', config);
        const error = new Error(message);
        expect(() => (validator as any)._loadSettings()).toThrow(error);
      });
    });

    describe('editorconfig', () => {
      it('should override settings', () => {
        const validator = new Validator({
          trailingspaces: false,
          newlineMaximum: false,
          indentation: 'tabs',
          spaces: 4,
          newline: true,
          ignores: ['js-comments'],
          editorconfig: true,
        });

        // Access private properties for testing
        (validator as any)._path = __fromFixtures('indentation_tabs.txt');
        (validator as any)._loadSettings();

        expect((validator as any)._settings.trailingspaces).toBeTruthy();
        expect((validator as any)._settings.newline).toBeTruthy();
        expect((validator as any)._settings.indentation).toBe('spaces');
        expect((validator as any)._settings.spaces).toBe(2);

        // Unchanged:
        expect((validator as any)._settings.newlineMaximum).toBe(false);
        expect((validator as any)._settings.ignores).toEqual(['js-comments']);
      });

      it('should load by path', () => {
        const config = path.join(__dirname, '..', '.editorconfig');

        // create config file:
        fs.writeFileSync(config, `root = true

[*]
indent_style = space
indent_size = 4
trim_trailing_whitespace = true
insert_final_newline = true`);

        try {
          const validator = new Validator({
            editorconfig: true,
          });

          // Access private properties for testing
          (validator as any)._path = __filename;
          (validator as any)._loadSettings();

          expect((validator as any)._settings.indentation).toBe('spaces');
          expect((validator as any)._settings.spaces).toBe(4);
          expect((validator as any)._settings.trailingspaces).toBeTruthy();
          expect((validator as any)._settings.newline).toBeTruthy();
        } finally {
          // cleanup:
          fs.unlinkSync(config);
        }
      });
    });
  });
});
