$('.loggedin,.loggedout').hide();
function initCart(data) {
    var blockForm = false,
    countryHTML = $('#country-template').html(),
    usaStateHTML = $('#usa-states-template').html(),
    canadaStateHTML = $('#canada-states-template').html(),
    $shippingForm = $('#cart-page .shipping-step form'),
    $paymentForm = $('#cart-page .payment-step form'),
    $reviewForm = $('#cart-page .review-step form'),
    cart = emeraldcode.cart,
    cartItems = data.items,
    handleInputError = function () {
        $(this).addClass('error');
    },
    handleInputSuccess = function () {
        $(this).removeClass('error');
    },
    handleInputFocus = function () {
        $(this).removeClass('error');
    },
    getSubTotal = function () {
        var i = 0, len = cartItems.length, total = 0;
        for (; i < len; i++) {
            total += (cartItems[i].unitPrice * cart.getVal(cartItems[i].sku));
        }
        return total;
    },
    setCompactMode = function ($step) {
        $step.find('form').slideUp('slow', function () {
            $step.find('.report').hide().end().find('.compact').slideDown('fast').end();
            $(window).trigger('resize');
        });
    },
    setReportMode = function ($step) {
        $step.find('form').slideUp('slow', function () {
            $step.find('.compact').hide().end().find('.report').slideDown('fast').end();
            $(window).trigger('resize');
        });
    },
    setFormEditMode = function ($step) {
        $step.find('form').find('.header').hide();
        $step.find('.report,.compact').slideUp('slow', function () {
            $step.find('form').slideDown('fast', function () {
                $step.find('form').find('.header').fadeIn('fast');
                $step.find('button').prop('disabled', false);
                $(window).trigger('resize');
            });
        });
        $('#cart-page .left .review-text').hide();
    },
    drawCartContents = function () {
        var i = 0, len = cartItems.length, item, $tempDiv = $('<div />');
        window._gaq = []; // (www) google analytics for shopping cart
        for (; i < len; i++) {
            item = cartItems[i];
            $tempDiv.append(
                $('<div />').append(
                    $('<img />').attr('src', item.images[emeraldcode.thumbNailImageIndex])
                ).append(
                    $('<span />')
                        .append($('<span>').text(item.productName))
                        .append($('<br>'))
                        .append($('<strong>').text(item.sizeName))
                        .append($('<span>').text(' x' + cart.getVal(item.sku)))
                )
            );
            if (arguments.length > 0) {
                _gaq.push([
                    "_addItem",
                        arguments[0],
                        item.sku,
                        item.productName + " - " + item.colorName + " (" + item.productNumber + ")",
                        'no category',
                        item.unitPrice.toFixed(2) + '',
                        cart.getVal(item.sku) + ''
                    ]);
            }
        }
        $('#cart-page .right .cart .contents').html($tempDiv.html());
        $('#cart-page .right .cart .cart-count').text(cart.itemCount());
    }, 
    subTotal = 0;

    if (cart.items.length === 0) {
        $('#cart-page > div').hide();
        $('#cart-page .cart-empty-message').show();
        window.location = './cart.htm';
        return;
    } else {
        subTotal = getSubTotal();
    }

    $('#cart-page .right .sub-total .value').text('$' + subTotal.toFixed(2));
    drawCartContents();

    $shippingForm.dumbValidation({
        inputFocus: handleInputFocus,
        inputError: handleInputError,
        inputSuccess: handleInputSuccess,
        success: function (ev) {
            ev.preventDefault();
            if (blockForm) { return; }
            blockForm = true;
            $shippingForm.find('button').prop('disabled', true);
            $shippingForm.find('.error-message').hide();
            $shippingForm.find('.loading').stop(true, true).fadeIn('fast');
            $shippingForm.closest('.step').data('complete', true);
            $('.right .shipping, .right .tax, .right .total').hide();
            emeraldcode.authShipping(emeraldcode.getFormJSON($('#cart-page .shipping-step form')), function (d) {
                var stateValue = '';
                drawCartContents(d.orderNumber);
                blockForm = false;
                $shippingForm.find('.loading').stop(true, true).fadeOut('fast');
                if (d.success) {
                    $('.shipping-step .report .name').text( // name
                        $shippingForm.find('input[name="firstName"]').val() + ' ' +
                        $shippingForm.find('input[name="lastName"]').val()
                    );
                    $('.shipping-step .report .address').text(
                        d.shippingInfo.street
                    );
                    $shippingForm.find('input[name="address"]').val(d.shippingInfo.street);
                    $shippingForm.find('input[name="address2"]').val('');
                    $('.shipping-step .report .shipping-method').text(
                        $shippingForm.find('select[name="shippingMethod"] option:selected').text()
                    );
                    if ($.trim(d.shippingInfo.state) !== '') {
                        stateValue = d.shippingInfo.state + ', ';
                    }
                    $('.shipping-step .report .city-state-postal').text(
                        $shippingForm.find('input[name="city"]').val() + ', ' +
                        stateValue + d.shippingInfo.countryCode + ' ' + d.shippingInfo.postalCode
                    );
                    $shippingForm.find('input[name="postalCode"]').val(d.shippingInfo.postalCode);
                    $('.shipping-step .report .comments').text(
                        $shippingForm.find('textarea[name="comments"]').val()
                    );
                    $('.shipping-step .report .phone').text(
                        $shippingForm.find('input[name="phone"]').val()
                    );
                    $('.shipping-step .report .email').text(
                        $shippingForm.find('input[name="email"]').val()
                    );
                    $paymentForm.find('input[name="orderNumber"]').val(d.orderNumber);
                    setReportMode($shippingForm.closest('.step'));
                    setFormEditMode($paymentForm.closest('.step'));
                    if ($paymentForm.find('input[name="cardNumber"]').val() !== '') {
                        $paymentForm.find('input[name="cardNumber"]').trigger('blur');
                    }
                    $('.right .shipping .value').text('$' + d.shippingAmount.toFixed(2));
                    $('.right .tax .value').text('$' + d.taxAmount.toFixed(2));
                    $('.right .total .value span').text('$' + (
                        subTotal + d.shippingAmount + d.taxAmount
                    ).toFixed(2));
                    $('.right .shipping, .right .tax, .right .total').show();
                    _gaq.unshift(["_setAccount", emeraldcode.global.googleAnalytics]);
                    _gaq.unshift(["_trackPageview"]);
                    _gaq.unshift([
                        "_addTrans",
                        d.orderNumber + '',
                        "Checkout",
                        (subTotal + d.shippingAmount + d.taxAmount).toFixed(2) + '',
                        d.taxAmount.toFixed(2) + '',
                        d.shippingAmount.toFixed(2) + '',
                        d.shippingInfo.city,
                        d.shippingInfo.stateCode,
                        d.shippingInfo.countryCode
                    ]);
                    _gaq.push(["_trackTrans"]);
                } else {
                    $shippingForm.find('.error-message').text(d.message).stop(true, true).slideDown('fast');
                }
            });
        },
        error: function (ev) {
            ev.preventDefault();
            $shippingForm.find('.error-message').text('please fill out the form completely').stop(true, true).slideDown('fast');
            $shippingForm.closest('.step').data('complete', true);
        }
    }).bind('keypress change', function () {
        $shippingForm.find('.error-message').stop(true, true).slideUp('fast');
    });

    $paymentForm.dumbValidation({
        inputFocus: handleInputFocus,
        inputError: handleInputError,
        inputSuccess: handleInputSuccess,
        success: function (ev) {
            var state = '', cardNumber = $paymentForm.find('input[name="cardNumber"]').val(),
            cardNumberLabel = $('#cart-page .card-selected').data('cardName')
            + ' ************' + cardNumber.substr(cardNumber.length - 4, 4),
            month = $paymentForm.find('select[name="month"]').val();

            if (month.length === 1) { month = '0' + month; }
            ev.preventDefault();
            $('.payment-step .report .name').text( // name
                $paymentForm.find('input[name="firstName"]').val() + ' ' +
                $paymentForm.find('input[name="lastName"]').val()
            );
            $('.payment-step .report .address').text(
                $paymentForm.find('input[name="address"]').val() + ' ' +
                $paymentForm.find('input[name="address2"]').val()
            );
            if ($paymentForm.find('select[name="state"]').length > 0) {
                state = $paymentForm.find('select[name="state"]').val() + ', ';
            }
            $('.payment-step .report .city-state-postal').text(
                $paymentForm.find('input[name="city"]').val() + ', ' +
                state + $paymentForm.find('select[name="country"]').val() + ' ' +
                $paymentForm.find('input[name="postalCode"]').val()
            );
            $('.payment-step .report .phone').text($paymentForm.find('input[name="phone"]').val());
            $('.payment-step .report .email').text($paymentForm.find('input[name="email"]').val());
            $('.payment-step .report .card-number').text(cardNumberLabel);
            $('.payment-step .report .month').text(month);
            $('.payment-step .report .year').text($paymentForm.find('select[name="year"]').val());
            $paymentForm.closest('.step').data('complete', true);
            setReportMode($paymentForm.closest('.step'));
            setFormEditMode($reviewForm.closest('.step'));
            $('#cart-page .left .review-text').show();
            $('.back-to-top').trigger('click');
        },
        error: function (ev) {
            ev.preventDefault();
            $paymentForm.find('.error-message').text('please fill out the form completely').stop(true, true).slideDown('fast');
            $paymentForm.closest('.step').data('complete', true);
        }
    }).on('keypress change', function () {
        $paymentForm.find('.error-message').stop(true, true).slideUp('fast');
    });

    $('.review-step form').submit(function (ev) {
        var formJSON;

        ev.preventDefault();
        $('.review-step .loading').stop(true, true).fadeIn('fast');
        $('.review-step .disclaimer').stop(true, true).slideDown('fast');
        $('.review-step .error-message').stop(true, true).slideUp('fast');
        if (blockForm) { return; }
        blockForm = true;
        $('.review-step form').find('button').prop('disabled', true);

        formJSON = emeraldcode.getFormJSON($paymentForm);
        formJSON.shippingAddress = $shippingForm.find('input[name="address"]').val() + ' ' +
            $shippingForm.find('input[name="address2"]').val();
        formJSON.shippingCity = $shippingForm.find('input[name="city"]').val();
        formJSON.shippingState = $shippingForm.find('select[name="state"]').val();
        formJSON.shippingPostalCode = $shippingForm.find('input[name="postalCode"]').val();
        formJSON.shippingCountry = $shippingForm.find('select[name="country"]').val();
        formJSON.additionalInfo = $shippingForm.find('input[name="additionalInfo"]').val();

        emeraldcode.transact(formJSON, function (d) {
            var dt = new Date(), dateTime = dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString(),
            itemTemplate = $('#cart-item-template').html(), $tempItem = null, i = 0, item = null,
            unitPrice = 0, total = 0, $tempItems = $('<div />'), friendlyMessage = '';
            $('#cart-page .review-step .loading').stop(true, true).hide();
            if (d.success) {
                $('#cart-page .right').hide();
                $('#cart-page .receipt .order-number').text($paymentForm.find('input[name="orderNumber"]').val());
                $('#cart-page .receipt .date-time').text(dateTime);
                $('#cart-page .receipt .shipping .contents').html(
                    $('#cart-page .shipping-step .report-padding').html()
                );
                $('#cart-page .receipt .payment .contents').html(
                    $('#cart-page .payment-step .report-padding').html()
                );
                // draw shopping cart contents
                $('#cart-page .receipt .cart-count').text($('#cart-page .right .cart-count').text());
                for (i = 0; i < cartItems.length; i++) {
                    item = cartItems[i];
                    $tempItem = $('<div>').html(itemTemplate);
                    $tempItem.find('.thumb').attr('src', item.images[emeraldcode.thumbNailImageIndex]);
                    $tempItem.find('.name').text(item.productName);
                    $tempItem.find('.size').text(item.sizeName);
                    $tempItem.find('.color').text(item.colorName);
                    $tempItem.find('.qty').text(cart.getVal(item.sku) + ' @ $' + item.unitPrice.toFixed(2) + ' each');
                    $tempItem.find('.total').text('$' + (item.unitPrice * cart.getVal(item.sku)).toFixed(2));
                    $tempItems.append($tempItem.html());
                }
                $('#cart-page .receipt .cart .contents').html($tempItems.html());
                // copy summary
                $('#cart-page .receipt .summary .sub-total .value').text(
                    $('#cart-page .right .sub-total').text()
                );
                $('#cart-page .receipt .summary .shipping .value').text(
                    $('#cart-page .right .shipping').text()
                );
                $('#cart-page .receipt .summary .tax .value').text(
                    $('#cart-page .right .tax').text()
                );
                $('#cart-page .receipt .summary .total .value').text(
                    $('#cart-page .right .total').text()
                );
                $('#cart-page .step').slideUp('slow', function () {
                    $('#cart-page .review-text').hide();
                    $('#cart-page .order-checkout').hide();
                    $('#cart-page .right > div:not(.need-help)').slideUp('fast');
                    $('#cart-page .receipt').slideDown('slow');
                });
                $('.left').css({'border':'none',width:'auto'});
                $('h1').hide();
                $.getScript('https://ssl.google-analytics.com/ga.js'); // now log google analytics
                $('body').append( // used to track page
                    $('<iframe />').css({ display: 'none' }).attr('src', '/log-receipt')
                );
                cart.clearCookie();

                if (window.sessionStorage) { // cleanup session state
                    delete sessionStorage['payment-state'];
                    delete sessionStorage['shipping-state'];
                    delete sessionStorage['shipping-method'];
                }
            } else {
                $('.review-step .disclaimer').stop(true, true).slideUp('fast');
                friendlyMessage = d.message;
                if (friendlyMessage.toLowerCase().indexOf('decline') > -1) {
                    friendlyMessage = 'We\'re sorry, your card was not accepted.  Please edit, then resubmit.  Thank you.';
                }
                $('.review-step .error-message').stop(true, true).text(friendlyMessage).slideDown('fast');
                blockForm = false;
                $('.review-step form').find('button').prop('disabled', false);
            }
        });
    });

    $('#cart-page .edit').click(function (ev) {
        ev.preventDefault();
        $('#cart-page .step').each(function () {
            var $this = $(this);
            if ($this.data('complete')) {
                setReportMode($this);
            } else {
                setCompactMode($this);
            }
        });
        setFormEditMode($(this).closest('.step'));
        $('.disclaimer').show();
        $('.review-step .error-message').hide();
    });

    $('#cart-page input[name="copyShipping"]').click(function () {
        if ($(this).prop('checked')) {
            $paymentForm.find('input[name="firstName"]').val(
                $shippingForm.find('input[name="firstName"]').val()
            );
            $paymentForm.find('input[name="lastName"]').val(
                $shippingForm.find('input[name="lastName"]').val()
            );
            $paymentForm.find('input[name="email"]').val(
                $shippingForm.find('input[name="email"]').val()
            );
            $paymentForm.find('input[name="phone"]').val(
                $shippingForm.find('input[name="phone"]').val()
            );
            $paymentForm.find('select[name="country"]').val(
                $shippingForm.find('select[name="country"]').val()
            ).trigger('change');
            window.setTimeout(function () {
                $paymentForm.find('input[name="address"]').val(
                    $shippingForm.find('input[name="address"]').val()
                );
                $paymentForm.find('input[name="address2"]').val(
                    $shippingForm.find('input[name="address2"]').val()
                );
                $paymentForm.find('input[name="city"]').val(
                    $shippingForm.find('input[name="city"]').val()
                );
                $paymentForm.find('select[name="state"]').val(
                    $shippingForm.find('select[name="state"]').val()
                );
                $paymentForm.find('input[name="postalCode"]').val(
                    $shippingForm.find('input[name="postalCode"]').val()
                );
            }, 250);
        }
    });

    $('#cart-page .country-label').each(function () {
        $(this).append(countryHTML).find('select').attr('required', 'required');
    });
    $('#cart-page .shipping-step').find(' > div, > form').hide().end().find('form').show();
    $('#cart-page .payment-step input[name="cardNumber"]').keypress(function () {
        $('.payment-step form').find('.card').removeClass('card-selected').css({ opacity: 0.5 });
    });
    $('#cart-page form').dumbFormState();

    (function ($) { // handle country selection
        var $form = $('#cart-page form'),
        $shippingOptions = $('select[name="shippingMethod"]');
        $shippingOptions.data('options', $shippingOptions.html());
        $('.shipping-step').find('select[name="country"]').change(function () {
            var $this = $(this), $form = $this.closest('form'), displayFor = 'I';
            if ($form.find('select[name="state"]').length > 0) {
                $form.find('select[name="state"]').remove();
            }
            if ($this.val() === '') {
                $form.find('.visibility-if-country-selected').slideUp('fast');
                return;
            }
            $shippingOptions.html($shippingOptions.data('options'));
            $form.find('.non-usa, .usa, .canada').hide();
            $form.find('.visibility-if-country-selected').slideDown('fast');

            if ($this.val() === 'US') {
                displayFor = 'D';
                $form.find('.state-placeholder').html($('#usa-states-template').html()).find('select').attr('required', 'required');
                $form.find('.usa').slideDown('fast');
            } else if ($(this).val() === 'CA') {
                $form.find('.state-placeholder').html($('#canada-states-template').html()).attr('required', 'required');
                $form.find('.non-usa,.canada').slideDown('fast');
            } else {
                $form.find('.non-usa').slideDown('fast');
            }
            $shippingOptions.find('option').each(function () {
                if ($(this).data('displayFor') && ($(this).data('displayFor') !== 'B' && $(this).data('displayFor') !== displayFor)) {
                    $(this).remove();
                }
            });
        });
        $('.payment-step').find('select[name="country"]').change(function () {
            var $this = $(this), $form = $this.closest('form');
            if ($form.find('select[name="state"]').length > 0) {
                $form.find('select[name="state"]').remove();
            }
            if ($this.val() === '') {
                $form.find('.visibility-if-country-selected').slideUp('fast');
                return;
            }
            $form.find('.non-usa, .usa, .canada').hide();
            $form.find('.visibility-if-country-selected').slideDown('fast');

            if ($this.val() === 'US') {
                $form.find('.state-placeholder').html($('#usa-states-template').html()).find('select').attr('required', 'required');
                $form.find('.usa').slideDown('fast');
            } else if ($(this).val() === 'CA') {
                $form.find('.state-placeholder').html($('#canada-states-template').html()).attr('required', 'required');
                $form.find('.non-usa,.canada').slideDown('fast');
            } else {
                $form.find('.non-usa').slideDown('fast');
            }
        });
        $form.find('select[name="country"]').each(function () {
            if ($(this).val() !== '') {
                $(this).trigger('change');
            }
        });
        $('#cart-page select[name="month"],#cart-page select[name="year"]').css({ width: 150 });
    })(jQuery);

    (function ($) {
        $('.numbers-only').bind('keypress', function (ev) {
            if (ev.which !== 13 && ev.which !== 0 && ev.which !== 8 && (ev.which < 48 || ev.which > 57)) {
                ev.preventDefault();
            }
        });
        $('.print-it').click(function () {
            window.print();
        });
    })(jQuery);
    $('#cart-page .right').dumbFixed();
    // maintain selection of state and shipping
    $('.shipping-step').on('change', 'select[name=state]', function () {
        if (!window.sessionStorage) { return; }
        window.sessionStorage['shipping-state'] = $(this).val();
    });
    $('.shipping-step').on('change', 'select[name=shippingMethod]', function () {
        if (!window.sessionStorage) { return; }
        window.sessionStorage['shipping-method'] = $(this).val();
    });
    $('.payment-step').on('change', 'select[name=state]', function () {
        if (!window.sessionStorage) { return; }
        window.sessionStorage['payment-state'] = $(this).val();
    });
    $('.shipping-step').on('change', 'select[name=country]', function () {
        if (!window.sessionStorage) { return; }
        window.setTimeout(function () {
            if (window.sessionStorage['shipping-state']) {
                $('.shipping-step select[name=state]').val(window.sessionStorage['shipping-state']);
            }
            if (window.sessionStorage['shipping-method']) {
                $('.shipping-step select[name=shippingMethod]').val(window.sessionStorage['shipping-method']);
            }
        }, 250);
    });
    $('.payment-step').on('change', 'select[name=country]', function () {
        if (!window.sessionStorage) { return; }
        if (!window.sessionStorage['payment-state']) { return; }
        window.setTimeout(function () {
            $('.payment-step select[name=state]').val(window.sessionStorage['payment-state']);
        }, 250);
    });
    $(function () {
        if ($('.shipping-step select[name="country"]').val() === '') {
            $('.shipping-step select[name="country"]').val('US');
        }
        if ($('.payment-step select[name="country"]').val() === '') {
            $('.payment-step select[name="country"]').val('US');
        }
        $('.shipping-step select[name=country]').trigger('change');
        $('.payment-step select[name=country]').trigger('change');
    });
}

emeraldcode.client = 'klim';
emeraldcode.ready(function () {
    emeraldcode.getShippingOptions(function (data) {
        var $select = $('<select>'), so = data.shippingOptions, i = 0, len = so.length;
        $select.append($('<option>').val('').text('SELECT'));
        for (; i < len; i++) {
            $select.append(
                $('<option>')
                    .attr('data-display-for', so[i].displayFor)
                    .val(so[i].shippingCode)
                    .text(so[i].shippingDescription));
        }
        $('#shippingMethod').html('').append($select.children());
        i = (new Date()).getFullYear();
        len = i + 10;
        $select = $('<select>').append($('<option>').val('').text('SELECT'));
        for (; i < len; i++) {
            $select.append(
                $('<option>')
                    .val(i + '')
                    .text(i + ''));
        }
        $('#year').html('').append($select.children());
        emeraldcode.getCartProducts(initCart);
    });
});