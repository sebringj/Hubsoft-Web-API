﻿(function () {

    function drawProduct() {
        var hash = window.location.hash.substr(1);
        hubsoft.getProduct({
            productURL: hash
        }, function (data) {
            document.title = data.product.productName;
            $('#product-breadcrumb').text(data.product.productName);
            $('h1').text(data.product.productName);
            var html = new EJS({ element: 'productTemplate' }).render(data);
            $('#product').html(html);
            $('.product-image').zoom({ icon: true, url: $('.product-image img').data('big') });
        });
    }

    if (sessionStorage['products-breadcrumb']) {
        if (sessionStorage['products-breadcrumb'].indexOf(',') === -1) {
            $('#products-breadcrumb').attr('href', './products.htm#' + sessionStorage['products-breadcrumb'])
                .text(sessionStorage['products-breadcrumb']);
        }
    }

    hubsoft.cart.triggerUpdateUI();
    hubsoft.ready(function () {
        drawProduct();
    });

    // events
    $('body').on('click', '.color', function (ev) {
        ev.preventDefault();
        window.location = '#' + $(this).data('producturl');
        setTimeout(function () {
            drawProduct();
        }, 0);
    });
    $('body').on('click', '.add-to-cart', function () {

        var sku = $('.product-size select').val();
        var qty = $('.quantity-box select').val();

        if (sku == "select size") {
            alert('select a size');
            return;
        }
        hubsoft.cart.snapshot();
        hubsoft.cart.addQuantity(sku, parseInt(qty));

        hubsoft.validateCart(function (data) {
            if (!data.success) {
                ec.cart.undo();
                drawProduct();
                if (data.errors && data.errors.length) {
                    alert(data.errors[0].message);
                }
                return;
            }
            window.location = './cart.htm';
        });
    });
})();