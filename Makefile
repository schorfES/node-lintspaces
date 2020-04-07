.PHONY: audit tests validate


audit:
	./node_modules/.bin/snyk test


tests:
	./node_modules/.bin/jest lib/ watch --verbose --coverage
	./node_modules/.bin/codecov


validate:
	./node_modules/.bin/eslint . --ext .js
