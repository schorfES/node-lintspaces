module.exports = process.env.LINTSPACES_COV ? require('./lib-cov/validator') : require('./lib/validator');
