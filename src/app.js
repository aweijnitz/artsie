'use strict';
;(function ($, window, document, undefined) {

    var videoSelect = document.querySelector('select#videoSource');
    var cameraAvailable = false;
    var videoElement = document.querySelector('video');
    var model = new mi.ArbitraryStyleTransferNetwork();
    var stylizedCanvas = document.getElementById('stylized');
    var videoGrab = document.getElementById('photo');
    var styleStrength = 0.8;
    var pictureTaken = false;
    var cameraShowing = true;

    function setSpinner(onOff) {
        console.log('setSpinner ' + onOff);
        onOff ? $('#spinner').show() : $('#spinner').hide();
    }

    function clearStyledCanvas() {
        var cxt = stylizedCanvas.getContext('2d');
        cxt.clearRect(0, 0, stylizedCanvas.width, stylizedCanvas.height);
    }

    function hideCamera(onComplete) {
        cameraShowing = false;
        $('.source').toggle(function () {
            clearStyledCanvas()
            $('.combined').toggle(onComplete);
        });
    }

    function showCamera(onComplete) {
        cameraShowing = true;
        $('.combined').toggle(function () {
            $('.source').toggle(onComplete);
        });
    }


    function getStyleImage() {
        return $('#lightSlider').children(".active").children()[0]
    }

    function restart() {
        showCamera(function () {
            $('#takePic').html('Take Picture');
            $('#takePic').off("click");
            $('#takePic').click(takePicture);
        });

    }

    function takePicture() {
        /**
         * Grab video pixels and put in hidden canvas.
         * Note: This is a workaround for a bug in magenta, which doesn't accept a video element (although it should)
         */
        videoGrab.width = videoElement.videoWidth;
        videoGrab.height = videoElement.videoHeight;
        videoGrab.getContext('2d').drawImage(videoElement, 0, 0);
        pictureTaken = true;
        hideCamera(function () {
            applyStyle(getStyleImage(), styleStrength);
        });

        $('.combined').height(videoElement.videoHeight);
        $('#takePic').html('Show Camera');
        $('#takePic').off("click");
        $('#takePic').click(restart);

    };


    function applyStyle(styleImgElement, strength) {

        if (!cameraAvailable)
            return;
        if (!pictureTaken)
            takePicture(); // Grab pixels


        console.log('Applying style to image - BEGIN');
        setSpinner(true);
        // API: https://github.com/tensorflow/magenta-js/blob/master/image/src/arbitrary_stylization/model.ts
        model.stylize(videoGrab, styleImgElement, strength).then((imageData) => {
            stylizedCanvas.getContext('2d').putImageData(imageData, 0, 0);
            console.log('Applying style to image - DONE');
            setSpinner(false);
        });

    };

    $('#takePic').click(takePicture);
    $('#applyStyleButton').click(function () {
        if (cameraShowing)
            takePicture();
        applyStyle(getStyleImage(), styleStrength);
    });

    /** The carousel contains the style images to will apply to the source image.
     When the user swipes to a new image, that style will be applied.
     */
    $('#lightSlider').lightSlider({
        gallery: false,
        enableTouch: true,
        item: 1,
        loop: false,
        slideMargin: 0,
        keyPress: true,
        freeMove: true,
        onAfterSlide: function (el) {

        }
    });

    function hasGetUserMedia() {
        return !!(navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia);
    }

    function gotDevices(deviceInfos) {
        for (var i = 0; i !== deviceInfos.length; ++i) {
            var deviceInfo = deviceInfos[i];
            var option = document.createElement('option');
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'videoinput') {
                option.text = deviceInfo.label || 'camera ' +
                    (videoSelect.length + 1);
                videoSelect.appendChild(option);
            }
        }
    }

    function gotStream(stream) {
        window.stream = stream; // Convenience global... :-/
        videoElement.srcObject = stream;
    }

    function handleError(error) {
        console.error('Error: ', error);
    }


    function getStream() {
        if (window.stream) {
            window.stream.getTracks().forEach(function (track) {
                track.stop();
            });
        }
        var constraints = {
            video: {
                width: {max: 256},
                height: {max: 256},
                deviceId: {exact: videoSelect.value}
            }
        };
        navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
    }

    if (hasGetUserMedia()) {
        cameraAvailable = true;
        videoSelect.onchange = getStream;
    } else {
        alert('Bummer! getUserMedia() is not supported by your browser');
    }

    navigator.mediaDevices.enumerateDevices()
        .then(gotDevices).then(getStream).catch(handleError);

    $("#selfie").click(function () {
        takePicture();
    });


    $(".privacy").click(function () {
        $("#privacy-policy").fadeToggle("fast");
    });


    model.initialize().then(function () {
        console.log('ready')
    });

})(jQuery, window, document);
