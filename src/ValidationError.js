class ValidationError {

	constructor(data, payload) {
		switch (true) {
			case !data:
				throw new Error('Missing data.');
			case !data.line:
				throw new Error('Missing linenumber in data.');
			case !data.code:
				throw new Error('Missing errorcode in data.');
			case !data.type:
				throw new Error('Missing errortype in data.');
			case !data.message:
				throw new Error('Missing errormessage in data.');
			default:
				this.line = data.line;
				this.code = data.code;
				this.type = data.type;
				this.message = data.message;
				break;
		}

		if (payload) {
			if (typeof payload !== 'object' || Array.isArray(payload)) {
				throw new Error('The payload must be an object.');
			}

			this.payload = Object.assign({}, payload);
		}
	}

}

module.exports = ValidationError;
