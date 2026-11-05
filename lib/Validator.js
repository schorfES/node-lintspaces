const fs = require('fs');

class Validator {
  constructor() {
    this.supportedEncodings = ['utf8', 'utf-16le', 'latin1', 'ascii', 'base64', 'hex'];
  }

  _loadFile(filePath, charset) {
    let encoding = 'utf8';
    if (charset && this.supportedEncodings.includes(charset.toLowerCase())) {
      encoding = charset.toLowerCase();
    }
    return fs.readFileSync(filePath, { encoding });
  }
}

module.exports = Validator;