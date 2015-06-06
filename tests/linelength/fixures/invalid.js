/**
 * This is a long comment causing problems. It has more than 80 characters on the line.
 */
(function() {
	var email = 'foo@bar.baz';

	var regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)$/;
	console.log(email.test(regex));
});