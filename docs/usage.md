## Usage

To run the lintspaces validator on one or multiple files take a look at the
following example:

```javascript

	var Validator = require('lintspaces');

	var validator = new Validator({/* options */});
	validator.validate('/path/to/file.ext');
	validator.validate('/path/to/other/file.ext');

	var results = validator.getInvalidFiles();
```

The response of ```getInvalidFiles()``` contains an object. Each key of this
object is a filepath which contains validation errors.

Under each filepath there is an other object with at least one key. Those key(s)
are the specific linenumbers of the file containing an array with errors.

The following lines shows the structure of the validation result in JSON
notation:

```json
{
  "statVersion": "0.3.1",
  "process": {
    "name": "node-lintspaces",
    "version": "0.4.0",
    "description": "Library for checking spaces in files",
    "maintainer": "Norman Rusch",
    "website": "https://github.com/schorfES/node-lintspaces",
    "repeatability": "Associative"
  },
  "findings": [
		{
      "rule": "INDENTATION_TABS",
      "description": "Unexpected spaces found",
      "categories": [
        "Style"
      ],
      "location": {
        "path": "/path/to/file.ext",
        "beginLine": 3,
        "endLine": 3,
      }
    },
		{
      "rule": "TRAILINGSPACES",
      "description": "Unexpected trailing spaces found",
      "categories": [
        "Style"
      ],
      "location": {
        "path": "/path/to/file.ext",
        "beginLine": 3,
        "endLine": 3,
      }
    },
		{
      "rule": "NEWLINE",
      "description": "Expected a newline at the end of the file",
      "categories": [
        "Style"
      ],
      "location": {
        "path": "/path/to/file.ext",
        "beginLine": 12,
        "endLine": 12,
      }
    }
  ]
}
```
