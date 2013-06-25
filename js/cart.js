(function () {
    function updateCart() {
        hubsoft.getCartProducts(function (data) {
            var i, len, html, item;
            data.subtotal = 0;
            if (data.items != null && data.items.length > 0) {
                for (i = 0, len = data.items.length; i < len; i++) {
                    item = data.items[i];
                    data.subtotal += (item.unitPrice * item.quantity);
                }
                html = new EJS({ element: 'cartTemplate' }).render(data);
                $('#cartList').html(html);
            }
            if (!data.items || data.items == null || hubsoft.cart.items.length === 0) {
                $('#cartList').html(new EJS({ element: 'cartTemplate' }).render({ subtotal: 0, items: [] }));
                $('#cart').fadeOut('fast', function () {
                    $('#no-items').fadeIn('fast');
                });
            }
        });
    }

    hubsoft.ready(function () {
        updateCart();
        hubsoft.validateCart(function (data) {
            if (data.success) {
                if (data.message) {
                    alert(data.message);
                }
            }
        });
    });

    $('body').on('click', '#cart button.btn-close', function (ev) {
        var $tr = $(this).closest('tr'), sku = $tr.data('sku');
        hubsoft.cart.remove(sku);
        $tr.fadeOut('fast', function () {
            $tr.remove();
            updateCart();
        });
    }).on('keypress', '#cart input.qty', function (ev) {
        if (ev.which !== 0 && ev.which !== 8 && (ev.which < 48 || ev.which > 57)) {
            return false;
        }
    }).on('keyup', '#cart input.qty', function (ev) {
        var val, sku = $(this).closest('tr').data('sku');
        if (ev.which >= 48 && ev.which <= 57) {
            val = parseInt($(this).val());
            if (val === 0) {
                hubsoft.cart.remove(sku);
            } else {
                hubsoft.cart.snapshot();
                hubsoft.cart.set(sku, val);
                hubsoft.validateCart(function (data) {
                    if (data.success) {
                        if (data.message) {
                            alert(data.message);
                        }
                    } else {
                        if (data.errors) {
                            hubsoft.cart.undo();
                            updateCart();
                            alert(data.errors[0].message);
                        }
                    }
                });
            }
            updateCart();
        }
    }).on('blur', '#cart input.qty', function (ev) {
        updateCart();
    });
})();