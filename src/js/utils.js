'use strict';
window.appUtils = {};

;(function ($, window, document, undefined) {
    function clearCanvas() {
        ctx.clearRect(0, 0, stylizedCanvas.width, stylizedCanvas.height);
        ctx.font = "36px Roboto";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#7777aa";
        ctx.fillText("...", stylizedCanvas.width / 2, stylizedCanvas.height / 2);
    }

    window.appUtils.clearCanvas = clearCanvas;

})(jQuery, window, document);