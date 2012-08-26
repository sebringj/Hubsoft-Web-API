(function (ec) { // closure allows "ec" shortcut for "emeraldcode"
    var defaultTags = 'helmet,jackets,pants';

    function renderProducts(data) {
        var html, colorsHash = {}, colors = [], i = 0, len = data.products.length;

        // group by productUID (product group)
        for (; i < len; i++) {
            if (!colorsHash[data.products[i].productUID]) {
                colorsHash[data.products[i].productUID] = [];
            }
            colorsHash[data.products[i].productUID].push(data.products[i]);
        }
        for (i in colorsHash) {
            colors.push(colorsHash[i]);
        }

        // get html from template and put on page
        html = new EJS({ element: 'productsTemplate' }).render({ colors: colors });
        $('#products').html(html);

        // select items that are in stock if possible so user does not perceive entire color group as out of stock
        $('.color-group').each(function () {
            if ($(this).find('.color:first').data('instock')) { return; }
            $(this).find('.color').each(function () {
                if ($(this).data('instock')) {
                    $(this).trigger('click');
                    return false;
                }
            });
        });
    }

    // handles the hash change to filter product results
    function handleHash() {
        var hash = location.hash;
        $('#productMenu a')
            .removeClass('selected')
            .closest('li').removeClass('active').end()
            .filter('[href=' + hash + ']').addClass('selected').closest('li').addClass('active');
        if (hash) {
            hash = hash.substr(1);
        }
        if (hash === '') {
            hash = defaultTags;
            $('#productMenu a:eq(0)').addClass('selected').closest('li').addClass('active');
        }

        // go to Emerald Code to get product results
        sessionStorage['products-breadcrumb'] = hash;
        ec.getProducts({
            // offset : 2, // for paging
            limit: 100,
            tags: hash
        }, renderProducts);
    }

    ec.client = 'klim';
    ec.ready(function () {
        handleHash();
    });

    // events
    window.onhashchange = handleHash;
    $('#products')
    // handles color being selected
    .on('click', '.color', function (ev) {
        var $color = $(this), $colorGroup = $color.closest('.color-group'),
                    $productName = $colorGroup.find('.product-name'),
                    $productImage = $colorGroup.find('.product-image'),
                    img = new Image();
        ev.stopPropagation();
        $colorGroup.find('.color').removeClass('selected');
        $color.addClass('selected');
        $productImage.removeClass('out-of-stock');
        if (!$color.data('instock')) {
            $productImage.addClass('out-of-stock');
        }
        $productImage.find('img').fadeOut('fast', function () {
            $productImage.find('img').attr('src', $color.data('thumb'));
            img.src = $color.data('thumb');
        });
        img.onload = function () {
            $productImage.find('img').fadeIn('fast');
        };
        $productName.attr('href', $color.data('url'));
        $productImage.attr('href', $color.data('url'));
    })
    // goes to product page corresponding to product selected
    .on('click', '.color-group', function (ev) {
        ev.preventDefault();
        window.location = './product.htm#' + $(this).find('.product-name').attr('href');
    });
    // set the css where colors listed more than the display can hold will autoscroll
    $('#products .colors').each(function () {
        var $this = $(this);
        if ($this.width() < $this.get(0).scrollWidth) {
            $this.css('height', $this.find('.scroller').height());
            $this.find('.scroller').css({ position: 'absolute', left: 0, top: 0 });
        }
    });
    // set the behavior where colors listed more than the display can hold will autoscroll
    $('#products').on('mousemove', '.colors', function (ev) {
        var $this = $(this), xBuffer = 5, w = $this.width() - xBuffer, pos = $this.offset(),
                    scrollX = $this.scrollLeft(), $scroller = $this.find('.scroller'),
                    sw = $scroller.width(),
                    diff = (ev.pageX - pos.left - xBuffer),
                    percentage = (diff / w), scrollLeft = ((sw - w) * percentage * -1), lp = 0, rp = 0,
                    pw = sw - w;
        if (sw < w) { return; }
        $scroller.css({ left: scrollLeft }, 'fast');
    });

})(emeraldcode);