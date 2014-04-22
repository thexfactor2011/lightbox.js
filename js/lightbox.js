
/*
Lightbox v2.53
1/27/2014
This Script has been modified to allow the transfomation of rotating images 90, 180, 270, and 360 degrees
Apply the tag data-rotate="true" or "false" to enable rotations. 
Register on page with 
<link rel="stylesheet" href="PATHTO/lightbox/css/lightbox.css" type="text/css" media="screen" />
<script type="text/javascript" src="PATHTO/lightbox/js/lightbox.js"></script>
By Harry Anuszewski

Lightbox v2.51
by Lokesh Dhakar - http://www.lokeshdhakar.com

For more information, visit:
http://lokeshdhakar.com/projects/lightbox2/

Licensed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
- free for use in both personal and commercial projects
- attribution requires leaving author name, author link, and the license info intact
	
Thanks
- Scott Upton(uptonic.com), Peter-Paul Koch(quirksmode.com), and Thomas Fuchs(mir.aculo.us) for ideas, libs, and snippets.
- Artemy Tregubenko (arty.name) for cleanup and help in updating to latest proto-aculous in v2.05.


Table of Contents
=================
LightboxOptions

Lightbox
- constructor
- init
- enable
- build
- start
- changeImage
- sizeContainer
- showImage
- updateNav
- updateDetails
- preloadNeigbhoringImages
- enableKeyboardNav
- disableKeyboardNav
- keyboardAction
- end

options = new LightboxOptions
lightbox = new Lightbox options
*/

(function () {
    var $, Lightbox, LightboxOptions;
    var RotateCount = 0;

    $ = jQuery;

    LightboxOptions = (function () {

        function LightboxOptions() {
            this.fileLoadingImage = '../lightbox/images/loading.gif';
            this.fileCloseImage = '../lightbox/images/close.png';
            this.fileRotateImage = '../lightbox/images/rotate.png';
            this.resizeDuration = 700;
            this.fadeDuration = 500;
            this.labelImage = "Image";
            this.labelOf = "of";
        }

        return LightboxOptions;

    })();

    Lightbox = (function () {

        function Lightbox(options) {
            this.options = options;
            this.album = [];
            this.currentImageIndex = void 0;
            this.init();
        }

        Lightbox.prototype.init = function () {
            this.enable();
            return this.build();
        };

        Lightbox.prototype.enable = function () {
            var _this = this;
            return $('body').on('click', 'a[rel^=lightbox], area[rel^=lightbox]', function (e) {
                _this.start($(e.currentTarget));
                return false;
            });
        };

        Lightbox.prototype.build = function () {
            var $lightbox,
        _this = this;
            $("<div>", {
                id: 'lightboxOverlay'
            }).after($('<div/>', {
                id: 'lightbox'
            }).append($('<div/>', {
                "class": 'lb-outerContainer'
            }).append($('<div/>', {
                "class": 'lb-container'
            }).append($('<img/>', {
                "class": 'lb-image'
            }), $('<div/>', {
                "class": 'lb-nav'
            }).append($('<a/>', {
                "class": 'lb-prev'
            }), $('<a/>', {
                "class": 'lb-next'
            })), $('<div/>', {
                "class": 'lb-loader'
            }).append($('<a/>', {
                "class": 'lb-cancel'
            }).append($('<img/>', {
                src: this.options.fileLoadingImage
            }))))), $('<div/>', {
                "class": 'lb-dataContainer'
            }).append($('<div/>', {
                "class": 'lb-data'
            }).append($('<div/>', {
                "class": 'lb-details'
            }).append($('<span/>', {
                "class": 'lb-caption'
            }), $('<span/>', {
                "class": 'lb-number'
            }))) , $('<div/>', {
                "class": 'lb-rotateContainer'
            }).append($('<a/>', {
                "class": 'lb-rotate'
            }).append($('<img/>', {
                src: this.options.fileRotateImage
            }))), $('<div/>', {
                "class": 'lb-closeContainer'
            }).append($('<a/>', {
                "class": 'lb-close'
            }).append($('<img/>', {
                src: this.options.fileCloseImage
            })))))).appendTo($('body'));
            $('#lightboxOverlay').hide().on('click', function (e) {
                _this.end();
                return false;
            });
            $lightbox = $('#lightbox');
            $lightbox.hide().on('click', function (e) {
                if ($(e.target).attr('id') === 'lightbox') _this.end();
                return false;
            });
            $lightbox.find('.lb-outerContainer').on('click', function (e) {
                if ($(e.target).attr('id') === 'lightbox') _this.end();
                return false;
            });
            $lightbox.find('.lb-prev').on('click', function (e) {
                _this.changeImage(_this.currentImageIndex - 1);
                return false;
            });
            $lightbox.find('.lb-next').on('click', function (e) {
                _this.changeImage(_this.currentImageIndex + 1);
                return false;
            });
            $lightbox.find('.lb-rotate').on('click', function (e) {
                _this.rotateImage(_this.currentImageIndex);
                return false;
            });
            $lightbox.find('.lb-loader, .lb-close').on('click', function (e) {
                _this.end();
                return false;
            });
        };

        Lightbox.prototype.start = function ($link) {
            var $lightbox, $window, a, i, imageNumber, left, top, _len, _ref;
            $(window).on("resize", this.sizeOverlay);
            $('select, object, embed').css({
                visibility: "hidden"
            });
            $('#lightboxOverlay').width($(document).width()).height($(document).height()).fadeIn(this.options.fadeDuration);
            this.album = [];
            imageNumber = 0;
            if ($link.attr('rel') === 'lightbox') {
                this.album.push({
                    link: $link.attr('href'),
		    rotate: $link.attr('data-rotate'),
                    title: $link.attr('title')
                });
            } else {
                _ref = $($link.prop("tagName") + '[rel="' + $link.attr('rel') + '"]');
                for (i = 0, _len = _ref.length; i < _len; i++) {
                    a = _ref[i];
                    this.album.push({
                        link: $(a).attr('href'),
		        rotate: $link.attr('data-rotate'),
                        title: $(a).attr('title')
                    });
                    if ($(a).attr('href') === $link.attr('href')) imageNumber = i;
                }
            }
            $window = $(window);
            top = $window.scrollTop() + $window.height() / 10;
            left = $window.scrollLeft();
            $lightbox = $('#lightbox');
            $lightbox.css({
                top: top + 'px',
                left: left + 'px'
            }).fadeIn(this.options.fadeDuration);
            RotateCount = 3;
            //if (this.album[imageNumber].title != "Applicant Photo") { $lightbox.find('.lb-rotate').show(); }
            if (this.album[imageNumber].rotate == "true") { $lightbox.find('.lb-rotate').show(); }
            else { $lightbox.find('.lb-rotate').hide(); }
            this.rotateImage(imageNumber);
            this.changeImage(imageNumber);
        };

        Lightbox.prototype.rotateImage = function (imageNumber) {
            var $image, $lightbox, preloader,
        _this = this;
            this.disableKeyboardNav();
            $lightbox = $('#lightbox');
            $image = $lightbox.find('.lb-image');
            this.sizeOverlay();
            $('#lightboxOverlay').fadeIn(this.options.fadeDuration);
            $('.loader').fadeIn('slow');
            $lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption, .lb-rotate').hide();
            $lightbox.find('.lb-outerContainer').addClass('animating');
            
            //if (_this.album[imageNumber].title != "Applicant Photo") { $lightbox.find('.lb-rotate').show(); }
	    if (_this.album[imageNumber].rotate == "true") { $lightbox.find('.lb-rotate').show(); }
            else { $lightbox.find('.lb-rotate').hide(); }
            preloader = new Image;
            preloader.onload = function () {
                $image.attr('src', _this.album[imageNumber].link);
                $image.width = preloader.width;
                $image.height = preloader.height;

                RotateCount++;
                switch (RotateCount) {
                    case 1: degree = 90; break;
                    case 2: degree = 180; break;
                    case 3: degree = 270; break;
                    case 4: degree = 0; RotateCount = 0; break;
                }

                var rv = -1;
                if (navigator.appName == 'Microsoft Internet Explorer') {
                    var ua = navigator.userAgent;
                    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                    if (re.exec(ua) != null)
                        rv = parseFloat(RegExp.$1);
                }

                //IE 10 or CSS3 browser                
                if (rv == -1 || rv > 9.0) {                    
                    var css = "rotateZ(" + degree + "deg)";
                    if (_this.album[imageNumber].rotate != "false") {
                        //If the degree is 180 or 270 we have to shift the image.
                        if (degree == 90 || degree == 270) {
                            if ($image.height <= 188 && $image.width <= 288) {
                                //Drivers License
                                if (degree == 270) {
                                    css = css + " translateX(-19%) translateY(-30%)";
                                } else {
					alert("Here");
                                    css = css + " translateX(19%) translateY(30%)";
                                }
                            } else if ($image.height <= 280 && $image.width <= 252) {
                                //Badge
                                if (degree == 270) {
                                    css = css + " translateX(8%) translateY(0%)";
                                } else {
					alert("here2");
                                    css = css + " translateX(-8%) translateY(0%)";
                                }

                            } else if ($image.height == $image.width) {
                                //Passport
                                css = css + " translateX(0%) translateY(0%)";
                            } else {
                                //Letter
                                if (degree == 270) {
                                    css = css + " translateX(15%) translateY(0%)";
                                } else {
                                    css = css + " translateX(-15%) translateY(0%)";
                                }
                            }
                        }
                        $image.css("-ms-transform", css);
			$image.css("-webkit-transform", css);
                    }
                } else {                    
                    //IE 9 or earlier
                    switch (degree) {
                        case 0: $image.css("filter", "progid:DXImageTransform.Microsoft.BasicImage(rotation=0)"); break;
                        case 90: $image.css("filter", "progid:DXImageTransform.Microsoft.BasicImage(rotation=1)");
                            $image.css("position", "absolute"); break;
                        case 180: $image.css("filter", "progid:DXImageTransform.Microsoft.BasicImage(rotation=2)"); break;
                        case 270: $image.css("filter", "progid:DXImageTransform.Microsoft.BasicImage(rotation=3)"); break;
                    }
                }

                if ((RotateCount == 4) || (RotateCount == 2) || (RotateCount == 0)) {
                    return _this.sizeContainer(preloader.width, preloader.height);
                } else {
                    return _this.sizeContainer(preloader.height, preloader.width);
                }
            };
            preloader.src = this.album[imageNumber].link;
            this.currentImageIndex = imageNumber;
        };


        Lightbox.prototype.changeImage = function (imageNumber) {
            var $image, $lightbox, preloader,
        _this = this;
            this.disableKeyboardNav();
            $lightbox = $('#lightbox');
            $image = $lightbox.find('.lb-image');
            this.sizeOverlay();
            $('#lightboxOverlay').fadeIn(this.options.fadeDuration);
            $('.loader').fadeIn('slow');
            $lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide();
            $lightbox.find('.lb-outerContainer').addClass('animating');
            preloader = new Image;
            preloader.onload = function () {
                $image.attr('src', _this.album[imageNumber].link);
                $image.width = preloader.width;
                $image.height = preloader.height;
                return _this.sizeContainer(preloader.width, preloader.height);
            };
            preloader.src = this.album[imageNumber].link;
            this.currentImageIndex = imageNumber;
        };

        Lightbox.prototype.sizeOverlay = function () {
            return $('#lightboxOverlay').width($(document).width()).height($(document).height());
        };

        Lightbox.prototype.sizeContainer = function (imageWidth, imageHeight) {
            var $container, $lightbox, $outerContainer, containerBottomPadding, containerLeftPadding, containerRightPadding, containerTopPadding, newHeight, newWidth, oldHeight, oldWidth,
        _this = this;
            $lightbox = $('#lightbox');
            $outerContainer = $lightbox.find('.lb-outerContainer');
            oldWidth = $outerContainer.outerWidth();
            oldHeight = $outerContainer.outerHeight();
            $container = $lightbox.find('.lb-container');
            containerTopPadding = parseInt($container.css('padding-top'), 10);
            containerRightPadding = parseInt($container.css('padding-right'), 10);
            containerBottomPadding = parseInt($container.css('padding-bottom'), 10);
            containerLeftPadding = parseInt($container.css('padding-left'), 10);
            newWidth = imageWidth + containerLeftPadding + containerRightPadding;
            newHeight = imageHeight + containerTopPadding + containerBottomPadding;
            if (newWidth !== oldWidth && newHeight !== oldHeight) {
                $outerContainer.animate({
                    width: newWidth,
                    height: newHeight
                }, this.options.resizeDuration, 'swing');
            } else if (newWidth !== oldWidth) {
                $outerContainer.animate({
                    width: newWidth
                }, this.options.resizeDuration, 'swing');
            } else if (newHeight !== oldHeight) {
                $outerContainer.animate({
                    height: newHeight
                }, this.options.resizeDuration, 'swing');
            }
            setTimeout(function () {
                $lightbox.find('.lb-dataContainer').width(newWidth);
                $lightbox.find('.lb-prevLink').height(newHeight);
                $lightbox.find('.lb-nextLink').height(newHeight);
                _this.showImage();
            }, this.options.resizeDuration);
        };

        Lightbox.prototype.showImage = function () {
            var $lightbox;
            $lightbox = $('#lightbox');
            $lightbox.find('.lb-loader').hide();
            $lightbox.find('.lb-image').fadeIn('slow');
            this.updateNav();
            this.updateDetails();
            this.preloadNeighboringImages();
            this.enableKeyboardNav();
        };

        Lightbox.prototype.updateNav = function () {
            var $lightbox;
            $lightbox = $('#lightbox');
            $lightbox.find('.lb-nav').show();
            if (this.currentImageIndex > 0) $lightbox.find('.lb-prev').show();
            if (this.currentImageIndex < this.album.length - 1) {
                $lightbox.find('.lb-next').show();
            }
        };

        Lightbox.prototype.updateDetails = function () {
            var $lightbox,
        _this = this;
            $lightbox = $('#lightbox');
            if (typeof this.album[this.currentImageIndex].title !== 'undefined' && this.album[this.currentImageIndex].title !== "") {
                $lightbox.find('.lb-caption').html(this.album[this.currentImageIndex].title).fadeIn('fast');
            }
            if (this.album.length > 1) {
                $lightbox.find('.lb-number').html(this.options.labelImage + ' ' + (this.currentImageIndex + 1) + ' ' + this.options.labelOf + '  ' + this.album.length).fadeIn('fast');
            } else {
                $lightbox.find('.lb-number').hide();
            }
            $lightbox.find('.lb-outerContainer').removeClass('animating');
            $lightbox.find('.lb-dataContainer').fadeIn(this.resizeDuration, function () {
                return _this.sizeOverlay();
            });
        };

        Lightbox.prototype.preloadNeighboringImages = function () {
            var preloadNext, preloadPrev;
            if (this.album.length > this.currentImageIndex + 1) {
                preloadNext = new Image;
                preloadNext.src = this.album[this.currentImageIndex + 1].link;
            }
            if (this.currentImageIndex > 0) {
                preloadPrev = new Image;
                preloadPrev.src = this.album[this.currentImageIndex - 1].link;
            }
        };

        Lightbox.prototype.enableKeyboardNav = function () {
            $(document).on('keyup.keyboard', $.proxy(this.keyboardAction, this));
        };

        Lightbox.prototype.disableKeyboardNav = function () {
            $(document).off('.keyboard');
        };

        Lightbox.prototype.keyboardAction = function (event) {
            var KEYCODE_ESC, KEYCODE_LEFTARROW, KEYCODE_RIGHTARROW, key, keycode;
            KEYCODE_ESC = 27;
            KEYCODE_LEFTARROW = 37;
            KEYCODE_RIGHTARROW = 39;
            keycode = event.keyCode;
            key = String.fromCharCode(keycode).toLowerCase();
            if (keycode === KEYCODE_ESC || key.match(/x|o|c/)) {
                this.end();
            } else if (key === 'p' || keycode === KEYCODE_LEFTARROW) {
                if (this.currentImageIndex !== 0) {
                    this.changeImage(this.currentImageIndex - 1);
                }
            } else if (key === 'n' || keycode === KEYCODE_RIGHTARROW) {
                if (this.currentImageIndex !== this.album.length - 1) {
                    this.changeImage(this.currentImageIndex + 1);
                }
            }
        };

        Lightbox.prototype.end = function () {
            this.disableKeyboardNav();
            $(window).off("resize", this.sizeOverlay);
            $('#lightbox').fadeOut(this.options.fadeDuration);
            $('#lightboxOverlay').fadeOut(this.options.fadeDuration);
            return $('select, object, embed').css({
                visibility: "visible"
            });
        };

        return Lightbox;

    })();

    $(function () {
        var lightbox, options;
        options = new LightboxOptions;
        return lightbox = new Lightbox(options);
    });

}).call(this);
