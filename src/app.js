'use strict';
;(function ($, window, document, undefined) {

    var loggingEnabled = false;
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
    var cameraConstraints = {};


    function isMobileDevice() {
        var check = false;
        var a = navigator.userAgent || navigator.vendor || window.opera; // get agent string
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
            check = true;
        return check;
    }

    function iOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    function log(msg) {
        if (!loggingEnabled)
            return;

        console.log(msg);
        if (isMobileDevice()) {
            $('#log').append('<div>' + msg + '</div>');
        }
    };


    function setCameraConstraints() {
        cameraConstraints = {
            video: {}
        };

        if (isMobileDevice() && !iOS()) {
            log('Constraining camera for mobile');
            cameraConstraints.video.width = {max: 320}
        }

        if (!iOS()) {
            cameraConstraints.video.deviceId = {exact: videoSelect.value}
        }

    }

    function setSpinner(onOff, cb) {
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
        return $('#lightSlider').children(".active").children()[0];
    }

    function drawCombinedResult(imageData) {

        // Original is bigger than most phone screens, so save in hidden canvas
        // then draw to smaller canvas for display
        stylizedOriginalCanvas.width = imageData.width;
        stylizedOriginalCanvas.height = imageData.height;

        stylizedOriginalCanvas.getContext('2d').putImageData(imageData, 0, 0);
        log('Saved original image to hidden canvas');

        // Fit it
        var scale = 0.7;

        if (isMobileDevice() && !iOS())
            scale = 1.1;


        stylizedCanvas.width = imageData.width * scale;
        stylizedCanvas.height = imageData.height * scale;
        log('Styled canvas width '+stylizedCanvas.width);

        stylizedCanvas.getContext('2d')
            .drawImage(stylizedOriginalCanvas,
                0, 0, stylizedOriginalCanvas.width, stylizedOriginalCanvas.height,
                0, 0, stylizedCanvas.width, stylizedCanvas.height);

        $('.combined').width('100%');
        $('.combined').height('100%');

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

            // Don't kill mobile devices
        var scale = 1.0;
        if (iOS()) scale = 0.5;
        videoGrab.width = videoElement.videoWidth * scale;
        videoGrab.height = videoElement.videoHeight * scale;
        videoGrab.getContext('2d').drawImage(videoElement, 0, 0);

        pictureTaken = true;
        hideCamera(function () {
            applyStyle(getStyleImage(), styleStrength);
        });

        $('#takePic').html('Show Camera');
        $('#takePic').off("click");
        $('#takePic').click(restart);

    };


    /**
     * Apply the selected style image to the photo.
     * This is the meat of the whole app. It sends the photo and the style image
     * into the arbitrary style transfer network and draws the result.
     *
     * Consumes a lot of GPU and CPU!
     *
     * @param styleImgElement
     * @param strength - How much styling should be applied (think of it like a mixer value)
     */
    function applyStyle(styleImgElement, strength) {

        if (!cameraAvailable)
            return;
        if (!pictureTaken)
            takePicture(); // Grab pixels


        setSpinner(true, function () {
            log('Applying style to image - START');
            // API: https://github.com/tensorflow/magenta-js/blob/master/image/src/arbitrary_stylization/model.ts
            model.stylize(videoGrab, styleImgElement, strength).then(function (imageData) {
                setSpinner(false);
                drawCombinedResult(imageData);
                saveImageButton.show(200);
                log('Applying style to image - DONE');
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
        setCameraConstraints();
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

        navigator.mediaDevices.getUserMedia(cameraConstraints).then(gotStream).catch(handleError);
    }

    if (hasGetUserMedia()) {
        cameraAvailable = true;
        videoSelect.onchange = getStream;
    } else {
        alert('Bummer! getUserMedia() is not supported by your browser');
    }


    if (loggingEnabled)
        $('#log').show();


    setSpinner(true);
    model.initialize().then(function () {
        setSpinner(false);
        iOS() ? videoElement.setAttribute("playsinline", true) : log('not iOS');
        $('#takePic').show(200);

        navigator.mediaDevices.enumerateDevices()
            .then(gotDevices).then(getStream).catch(handleError);

        $("#selfie").click(function () {
            takePicture();
        });


        $(".privacy").click(function () {
            $("#privacy-policy").fadeToggle("fast");
        });


        log('neural network model ready!')
    });

})(jQuery, window, document);
