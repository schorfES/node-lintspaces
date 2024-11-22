import { ValidationMessage, ValidationPayload } from './types';

export class ValidationError {
  public line: number;
  public code: string;
  public type: string;
  public message: string;
  public payload?: ValidationPayload;

  constructor(data: ValidationMessage & { line: number }, payload?: ValidationPayload) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Missing data.');
    }
    if (!data.line) {
      throw new Error('Missing linenumber in data.');
    }
    if (!data.code) {
      throw new Error('Missing errorcode in data.');
    }
    if (!data.type) {
      throw new Error('Missing errortype in data.');
    }
    if (!data.message) {
      throw new Error('Missing errormessage in data.');
    }

    this.line = data.line;
    this.code = data.code;
    this.type = data.type;
    this.message = data.message;

    if (payload) {
      if (typeof payload !== 'object' || Array.isArray(payload)) {
        throw new Error('The payload must be an object.');
      }

      this.payload = Object.assign({}, payload);
    }
  }
}
