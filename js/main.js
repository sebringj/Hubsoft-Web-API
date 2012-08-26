emeraldcode.cart.updateUI(function () {
    var cartCount = emeraldcode.cart.itemCount();
    if (cartCount > 0) {
        $('#cartStatus').find('.count').text(cartCount);
        $('#cartStatusLi').show();
    } else {
        $('#cartStatusLi').hide();
    }
});
emeraldcode.cart.triggerUpdateUI();

emeraldcode.handleLoginState = function () {
    $('.loggedin,.loggedout').hide();
    console.log(emeraldcode.isLoggedIn());
    if (emeraldcode.isLoggedIn()) {
        if (sessionStorage['username']) {
            $('.loggedin').find('a .username').text(sessionStorage['username']).end().show();
        }
        $('.loggedin.signoutlink').show();
    } else {
        $('.loggedout').show();
    }
};
emeraldcode.handleLoginState();

jQuery(function () {
    $('.signoutlink a').click(function (ev) {
        ev.preventDefault();
        delete sessionStorage['username'];
        emeraldcode.logout(function (data) {
            window.location = './products.htm';
        });
    });
});