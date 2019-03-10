'use strict';
;(function ($, window, document, undefined) {

    var videoSelect = document.querySelector('select#videoSource');
    var cameraAvailable = false;
    var videoElement = document.querySelector('video');
    var model = new mi.ArbitraryStyleTransferNetwork();
    var stylizedOriginalCanvas = document.getElementById('stylized_original');
    var stylizedCanvas = document.getElementById('stylized');
    var saveImageButton = $('#saveImage');
    var videoGrab = document.getElementById('photo');
    var styleStrength = 0.8;
    var pictureTaken = false;
    var cameraShowing = true;

    function setSpinner(onOff, cb) {
        console.log('setSpinner ' + onOff);
        onOff ? $('#spinner').show(100, cb) : $('#spinner').hide(cb);

    }

    function clearStyledCanvas() {
        var cxt = stylizedCanvas.getContext('2d');
        cxt.clearRect(0, 0, stylizedCanvas.width, stylizedCanvas.height);
    }

    function hideCamera(onComplete) {
        cameraShowing = false;
        $('.source').toggle(function () {
            clearStyledCanvas();
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

    function drawCombinedResult(imageData) {

        // Original is bigger than most phone screens, so save in hidden canvas
        // then draw to smaller canvas for display
        stylizedOriginalCanvas.width = imageData.width;
        stylizedOriginalCanvas.height = imageData.height;

        stylizedOriginalCanvas.getContext('2d').putImageData(imageData, 0, 0);

        // Fit it
        stylizedCanvas.width = imageData.width * 0.5;
        stylizedCanvas.height = imageData.height * 0.5;
        stylizedCanvas.getContext('2d')
            .drawImage(stylizedOriginalCanvas,
                0, 0, stylizedOriginalCanvas.width, stylizedOriginalCanvas.height,
                0, 0, stylizedCanvas.width, stylizedCanvas.height);


        $('.combined').width('100%');
        $('.combined').height('100%');
//        console.log('videoWidth' + videoElement.videoWidth + ' .combined width: ' + $('.combined').width() + ' #stylzyed width: ' + $('#stylized').width());
//        console.log('videoHeight ' + videoElement.videoHeight + ' .combined height: ' + $('.combined').height() + ' #stylzyed height: ' + $('#stylized').height());

    }

    function restart() {
        saveImageButton.hide(200);
        showCamera(function () {
            $('#takePic').html('Take Picture');
            $('#takePic').off("click");
            $('#takePic').click(takePicture);
        });

    }

    function downloadImageAction() {
        var link = document.createElement('a');
        link.download = 'artsie-portrait.png';
        link.href = stylizedOriginalCanvas.toDataURL("image/png");
        link.click();
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

        $('#takePic').html('Show Camera');
        $('#takePic').off("click");
        $('#takePic').click(restart);

    };


    function applyStyle(styleImgElement, strength) {

        if (!cameraAvailable)
            return;
        if (!pictureTaken)
            takePicture(); // Grab pixels


        setSpinner(true, function () {
            console.log('Applying style to image - START');
            // API: https://github.com/tensorflow/magenta-js/blob/master/image/src/arbitrary_stylization/model.ts
            model.stylize(videoGrab, styleImgElement, strength).then(function (imageData) {
                setSpinner(false);
                drawCombinedResult(imageData);
                saveImageButton.show(200);
                console.log('Applying style to image - DONE');
            });
        });

    };

    $('#takePic').click(takePicture);
    $('#applyStyleButton').click(function () {
        if (cameraShowing)
            takePicture();

        saveImageButton.hide(200, function () {
            applyStyle(getStyleImage(), styleStrength);
        });
    });
    saveImageButton.click(downloadImageAction);

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
        alert('Could not initialize camera!');
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
