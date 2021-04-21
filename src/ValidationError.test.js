const ValidationError = require('./ValidationError');
const MESSAGES = require('./constants/messages');

describe('The validation error', () => {

	describe('constructor', () => {

		it('should throw when not passing data', () => {
			expect(() => new ValidationError())
				.toThrow(new Error('Missing data.'));
		});

		it('should throw when not passing a line', () => {
			const data = {};
			expect(() => new ValidationError(data))
				.toThrow(new Error('Missing linenumber in data.'));
		});

		it('should throw when not passing a code', () => {
			const data = {
				line: 42,
			};
			expect(() => new ValidationError(data))
				.toThrow(new Error('Missing errorcode in data.'));
		});

		it('should throw when not passing a type', () => {
			const data = {
				line: 42,
				code: MESSAGES.INDENTATION_TABS.code,
			};
			expect(() => new ValidationError(data))
				.toThrow(new Error('Missing errortype in data.'));
		});

		it('should throw when not passing a message', () => {
			const data = {
				line: 42,
				code: MESSAGES.INDENTATION_TABS.code,
				type: MESSAGES.INDENTATION_TABS.type,
			};
			expect(() => new ValidationError(data))
				.toThrow(new Error('Missing errormessage in data.'));
		});

		it('should create an instance', () => {
			const data = {
				line: 42,
				code: MESSAGES.INDENTATION_TABS.code,
				type: MESSAGES.INDENTATION_TABS.type,
				message: MESSAGES.INDENTATION_TABS.message,
			};
			const error = new ValidationError(data);
			expect(error).toEqual(expect.objectContaining({
				line: 42,
				code: MESSAGES.INDENTATION_TABS.code,
				type: MESSAGES.INDENTATION_TABS.type,
				message: MESSAGES.INDENTATION_TABS.message,
			}));
		});

		it('should create an instance with payload', () => {
			const data = {
				line: 42,
				code: MESSAGES.INDENTATION_TABS.code,
				type: MESSAGES.INDENTATION_TABS.type,
				message: MESSAGES.INDENTATION_TABS.message,
			};
			const payload = {
				foo: true,
			};
			const error = new ValidationError(data, payload);
			expect(error).toEqual(expect.objectContaining({
				line: 42,
				code: MESSAGES.INDENTATION_TABS.code,
				type: MESSAGES.INDENTATION_TABS.type,
				message: MESSAGES.INDENTATION_TABS.message,
				payload: payload,
			}));
			expect(error.payload).not.toBe(payload);
			expect(error.payload).toEqual(payload);
		});

		it('should throw when not passing an object as payload', () => {
			const data = {
				line: 42,
				code: MESSAGES.INDENTATION_TABS.code,
				type: MESSAGES.INDENTATION_TABS.type,
				message: MESSAGES.INDENTATION_TABS.message,
			};
			const payload = 'This is a payload'
			expect(() => new ValidationError(data, payload))
				.toThrow(new Error('The payload must be an object.'));
		});

		it('should throw when passing an array as payload', () => {
			const data = {
				line: 42,
				code: MESSAGES.INDENTATION_TABS.code,
				type: MESSAGES.INDENTATION_TABS.type,
				message: MESSAGES.INDENTATION_TABS.message,
			};
			const payload = ['This is a payload'];
			expect(() => new ValidationError(data, payload))
				.toThrow(new Error('The payload must be an object.'));
		});

	});

});
