module.exports = process.env.LINTSPACES_COV ? require('./lib-cov/Validator') : require('./lib/Validator');
