# Lintspaces

A node module for checking spaces in files.

### Tasks

If you're looking for a
[gruntjs](http://gruntjs.com/) or
[gulpjs](http://gulpjs.com/)
task to validate your files, take a look at these ones:

* [grunt-lintspaces](https://github.com/schorfES/grunt-lintspaces)
* [gulp-lintspaces](https://github.com/ck86/gulp-lintspaces) by [ck86](https://github.com/ck86)


### CLI

There is also a [lintspaces CLI](https://github.com/evanshortiss/lintspaces-cli)
available written by [evanshortiss](https://github.com/evanshortiss).

## Installation

This package is available on [npm](https://www.npmjs.org/package/lintspaces)
as: `lintspaces`

``` sh
	npm install lintspaces
```

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
are the specific linenumbers of the file containing an array with error messages.

The following lines shows the structure of the validation result in JSON
notation:

```json

	{
		"/path/to/file.ext": {
			"3": [
				"Unexpected spaces found.",
				"Unexpected trailing spaces found."
			],
			"12": [
				"Expected a newline at the end of the file."
			]
		},
		"/path/to/other/file.ext": {
			"5": [
				"Unexpected additional newlines at the end of the file."
			]
		}
	}
```

## Options

### newline at end of file option

Tests for newlines at the end of all files. Default value is `false`.

```javascript
	newline: true
```

### maximum newlines option

Test for the maximum amount of newlines between code blocks. Default value is
`false`. To enable this validation a number larger than `0` is expected.

```javascript
	newlineMaximum: 2
```

### trailingspaces option

Tests for useless whitespaces (trailing whitespaces) at each line ending of all
files. Default value is `false`.

```javascript
	trailingspaces: true
```

If you want to exclude lines which only contain whitespace from this check, set 
`trailingspaces: 'ignore empty'`.

### indentation options

Tests for correct indentation using tabs or spaces. Default value is `false`.
To enable indentation check use the value `'tabs'` or `'spaces'`.

```javascript
	indentation: 'tabs'
```

If the indentation option is set to `'spaces'`, there is also the possibility
to set the amount of spaces per indentation using the `spaces` option. Default value is `4`.

```javascript
	indentation: 'spaces',
	spaces: 2
```

### ignores option

Use the `ignores` option when special lines such as comments should be ignored.
Provide an array of regular expressions to the `ignores` property.

```javascript
	ignores: [
		/\/\*[\s\S]*?\*\//g,
		/foo bar/g
	]
```

There are some _**build in**_ ignores for comments which you can apply by using
these strings:

* 'js-comments'
* 'c-comments'
* 'java-comments'
* 'as-comments'
* 'xml-comments'
* 'html-comments'
* 'python-comments'
* 'ruby-comments'
* 'applescript-comments'

_(build in strings and userdefined regular expressions are mixable in the
`ignores` array)_

```javascript
	ignores: [
		'js-comments',
		/foo bar/g
	]
```

**Feel free to contribute some new regular expressions as build in!**

### .editorconfig option

It's possible to overwrite the default and given options by setting up a path
to an external editorconfig file by unsing the `editorconfig`option. For a basic
configuration of a _.editorconfig_ file check out the
[EditorConfig Documentation](http://editorconfig.org/).

```javascript
	editorconfig: '.editorconfig'
```

The following .editorconfig values are supported:

* `insert_final_newline` will check if a newline is set
* `indent_style` will check the indentation
* `indent_size` will check the amount of spaces
* `trim_trailing_whitespace` will check for useless whitespaces

## Functions

An instance of the _Lintspaces validator_ has the following methods

### ```validate(path)```

This function runs the check for a given file based on the validator settings.

* **Parameter ```path```** is the path to the file as ```String```.
* **Throws** an error when given ```path``` is not a valid path.
* **Throws** an error when given ```path``` is not a file.
* **Returns** ```undefined```.

### ```getProcessedFiles()```

This returns the amount of processed through the validator.

* **Returns** the amount as ```Number```.

### ```getInvalidFiles()```

This returns all invalid lines and messages from processed files.

* **Returns** each key in the returned ```Object``` represents a path of a
processed invalid file. Each value is an other object containing the validation
result. For more informations about the returned format see [Usage](#usage).

### ```getInvalidLines(path)```

This returns all invalid lines and messages from the file of the given
```path```. This is just a shorter version of ```getInvalidFiles()[path]```.

* **Parameter ```path```** is the file path
* **Returns** each key in the returned ```Object``` represents a line from the
file of the given path, each value an exeption message of the current line. For
more informations about the returned format see [Usage](#usage).

## Contribution

Feel free to contribute. Please run all the tests and validation tasks befor
you offer a pull request.

### Tests & validation

Run ```grunt validate test``` to run the tests and validation tasks.

### Readme

The readme chapters are located in the _docs_ directory as Markdown. All
Markdown files will be concatenated through a grunt task ```'docs'```. Call
```grunt docs``` or run it fully by call ```grunt``` to validate, test and
update the _README.md_.

**Note:** Do not edit the _README.md_ directly, it will be overwritten!

### Contributors

* [ck86](https://github.com/ck86)
* [ben-eb](https://github.com/ben-eb) via [grunt-lintspaces](https://github.com/schorfES/grunt-lintspaces/)
* [yurks](https://github.com/yurks) via [grunt-lintspaces](https://github.com/schorfES/grunt-lintspaces/)
* [evanshortiss](https://github.com/evanshortiss) via [lintspaces-cli](https://github.com/evanshortiss/lintspaces-cli)

## License

[LICENSE (MIT)](https://github.com/schorfES/node-lintspaces/blob/master/LICENSE)
