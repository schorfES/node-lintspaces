/**
 * A sample comment not exceeding 80 characters.
 */
(function() {
	var email = 'foo@bar.baz';

	var regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.(?:[A-Z]{2,4})$/;
	console.log(email.test(regex));
});