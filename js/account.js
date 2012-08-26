emeraldcode.client = 'klim';

emeraldcode.trackingDisplay = function (shippingMethodCode, trackingNumber) {
    // use if fedex is your shipping method
    /*if (shippingMethodCode.toLowerCase().indexOf('usps') === -1) {
        return '<a target="_blank" href="http://www.fedex.com/Tracking?cntry_code=us&language=english&tracknumbers=' + trackingNumber + '&action=track">' + trackingNumber + '</a>'
    }*/
    return trackingNumber;
};

(function () {

    function handleLogin() {
        $('.loggedout').hide();
        $('#signInForm').modal('hide');
        $('.password').val('');

        emeraldcode.getUserInfo(function(data) {
            if (!data.success) {
                emeraldcode.logout(function(){
                    handleLogout();
                });
                return;
            }
            sessionStorage['username'] = data.userInfo.firstName;
            emeraldcode.handleLoginState();
            $('#accountContent').html((new EJS({ element: 'accountTemplate' }).render(data)));

        });
    }

    function handleLogout() {
        $('.loggedout').show();
        $('.loggedin').hide();
    }

    $('body').on('click.ec','#accountTabs a',function (ev) {
        ev.preventDefault();
        $(this).tab('show');
    });

    $('#signInForm').modal().modal('hide');

    emeraldcode.ready(function () {
        if (emeraldcode.isLoggedIn()) {
            handleLogin();
        } else {
            handleLogout();
            $('#signInForm').modal('show');
        }
    });

    $('#signInForm').submit(function(ev){
        ev.preventDefault();
        emeraldcode.ready(function(){
            emeraldcode.login({
                email: $.trim($('.email').val()), 
                password : $('.password').val()
            }, function(data) {
                $('#signInForm').find('.alert').hide();
                emeraldcode.handleLoginState();
                if (data.success) {
                     handleLogin();
                } else {
                    $('#signInForm').find('.alert').show();
                }
            });
        });
    });

    $('#signInForm').on('focus click','input', function(){
        $('#signInForm').find('.alert').hide();
    });
    $('#resetPasswordForm').on('focus click','input', function(){
        $('#resetPasswordForm').find('.alert').hide();
    });

    $('body')
    // handle promotion click
    .on('click.ec', '#promotions a', function(ev){
        ev.preventDefault();
        emeraldcode.cart.clearCookie();
        emeraldcode.setPromotion({promotion: $(this).data('promotion')});
        window.location = './products.htm';
    })
    // handle toggle order detail
    .on('click.ec', 'tr.quick-info', function(ev) {
        ev.preventDefault();
        $(this).next().slideToggle('fast');
    })
    // allow close of alerts
    .on('click.ec', 'form .close', function() {
        $(this).parent().hide();
    })
    // reset password link
    .on('click.ec', 'a.reset-password', function(ev) {
        ev.preventDefault();
        $('#signInForm').modal('hide');
        $('#resetPasswordForm').modal();
    })
    // handle resetPassword form
    .on('submit.ec', '#resetPasswordForm', function(ev) {
        var $form = $(this),
            email = $.trim($form.find('.email').val());
        ev.preventDefault();
        emeraldcode.resetPassword({
            email : email
        }, function(data) {
            $form.find('.alert').hide();
            if (data.success) {
                $form.find('.email,.btn-primary').hide();
                $form.find('.alert-success').show();
            } else {
                $form.find('.alert-error').show();
            }
        });
    })
    // handle change password form
    .on('submit.ec', '#changePasswordForm', function(ev) {
        var $form = $(this),
            oldPassword = $.trim($form.find('input[name=oldPassword]').val()),
            newPassword = $.trim($form.find('input[name=newPassword]').val());

        ev.preventDefault();

        $form.find('.alert').hide();

        if (oldPassword === '' || newPassword === '') {
            $form.find('.alert-error').find('.message').text('Fill out the required fields.').end().show();
            return;
        }

        if (oldPassword === newPassword) {
           $form.find('.alert-error').find('.message').text('Old and new passwords must be different.').end().show();
            return;
        }

        if (newPassword.length < 5) {
            $form.find('.alert-error').find('.message').text('New password is too short.').end().show();
            return;
        }

        emeraldcode.changePassword({
            oldPassword : oldPassword,
            newPassword : newPassword
        }, function(data) {
            var message;
            if (data.success) {
                $form.find('.alert-success').find('.message').text('Password has been changed').end().show();
                $form.find('input').val('');
                $form.find('button')[0].focus();
            } else {
                if (data.message.indexOf(':') > -1) {
                    message = data.message.split(':')[1];
                } else {
                    message = data.message;
                }
                $form.find('.alert-error').find('.message').text(message).end().show();
            }
        });
    });

})();