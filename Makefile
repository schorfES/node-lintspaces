.PHONY: audit tests validate


audit:
	./node_modules/.bin/snyk test


tests:
	./node_modules/.bin/grunt test


validate:
	./node_modules/.bin/eslint . --ext .js
