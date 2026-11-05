const assert = require('assert');
const Validator = require('../lib/Validator');
const fs = require('fs');

describe('Validator', () => {
  it('should handle unsupported charsets gracefully', () => {
    const validator = new Validator();
    const filePath = 'test/fixtures/test.txt';
    fs.writeFileSync(filePath, 'hello');
    
    try {
      const content = validator._loadFile(filePath, 'utf-8-bom');
      assert.strictEqual(content, 'hello');
    } finally {
      fs.unlinkSync(filePath);
    }
  });
});