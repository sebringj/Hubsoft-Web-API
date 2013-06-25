// config
hubsoft.clientid = 'klim';
hubsoft.thumbNailImageIndex = 6;
hubsoft.detailImageIndex = 0;
hubsoft.global = { googleAnalytics : '' };
hubsoft.page = { messsages: {} };

hubsoft.cart.updateUI(function () {
    var cartCount = emeraldcode.cart.itemCount();
    if (cartCount > 0) {
        $('#cartStatus').find('.count').text(cartCount);
        $('#cartStatusLi').show();
    } else {
        $('#cartStatusLi').hide();
    }
});
hubsoft.cart.triggerUpdateUI();

hubsoft.handleLoginState = function () {
    $('.loggedin,.loggedout').hide();
    if (hubsoft.isLoggedIn()) {
        if (sessionStorage['username']) {
            $('.loggedin').find('a .username').text(sessionStorage['username']).end().show();
        }
        $('.loggedin.signoutlink').show();
    } else {
        $('.loggedout').show();
    }
};
hubsoft.handleLoginState();

jQuery(function () {
    $('.signoutlink a').click(function (ev) {
        ev.preventDefault();
        delete sessionStorage['username'];
        emeraldcode.logout(function (data) {
            window.location = './products.htm';
        });
    });
});