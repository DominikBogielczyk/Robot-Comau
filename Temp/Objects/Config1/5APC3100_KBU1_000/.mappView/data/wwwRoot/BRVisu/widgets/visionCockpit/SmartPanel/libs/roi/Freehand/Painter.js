/*
 * This class implements a painter object for freehand tool
 * 
 */
/*global define, */

define(['libs/d3/d3'], function () {
    'use strict';

    function Painter(context, pixelColor) {

        this.settings = {
            imageSize: context.settings.imageSize,
            roiSize: context.getAbsolutePosition()
        };

        this.painterSettings = {
            canva: undefined,
            paintImage: undefined,
            paintDataMap: undefined,
            imageData: undefined,
            painterSize: 60,
            rgbaInvisible: {
                r: 0,
                g: 0,
                b: 0,
                a: 0
            },
            rgbaVisible: pixelColor
        };

        this.appendPainter(context);
        this.timerInProgress = false;
    }

    Painter.prototype.remove = function () {
        this.painterSettings.paintImage.remove();
    };

    Painter.prototype.dispose = function () {
        if (this.painterSettings.paintDataMap != undefined) {
            this.painterSettings.paintImage.remove();
            delete this.painterSettings.paintDataMap;
        }
    };

    Painter.prototype.appendPainter = function (context) {
        var canvaContext;
        this.painterSettings.paintDataMap = new Map();
        this.painterSettings.canva = this.createCanvas(this.settings.imageSize.width, this.settings.imageSize.height);
        canvaContext = this.painterSettings.canva.getContext("2d");
        this.painterSettings.imageData = canvaContext.createImageData(this.settings.imageSize.width, this.settings.imageSize.height);

        this.painterSettings.paintImage = context.drawing.rootContainer.append("image")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.settings.imageSize.width)
            .attr("height", this.settings.imageSize.height)
            .style("pointer-events", "none")
            .attr('class', 'Painter ' + context.className);
    };

    Painter.prototype.getPaintDataMap = function () {
        return this.painterSettings.paintDataMap;
    };

    Painter.prototype.setPaintDataMap = function (paintData) {
        this.painterSettings.paintDataMap = paintData;
        this.updateCanvasData(this);
    };


    Painter.prototype.updateCanvasData = function (context) {
        var that = this,
            url = "",
            imageData = this.painterSettings.imageData,
            imageSize = this.settings.imageSize,
            canvaContext = this.painterSettings.canva.getContext("2d");

        this.settings.roiSize = context.getAbsolutePosition();

        this.painterSettings.paintDataMap.forEach(function (pixel) {
            if ((pixel.x >= 0) && (pixel.x < imageSize.width) &&
                (pixel.y >= 0) && (pixel.y < imageSize.height)) {
                that.showPixel(pixel.x, pixel.y, imageData);
            } else {
                that.hidePixel(pixel.x, pixel.y, imageData);
            }
        });

        if (this.timerInProgress === false) {
            this.timerInProgress = true;
            setTimeout(function () {
                canvaContext.putImageData(imageData, 0, 0);
                url = that.painterSettings.canva.toDataURL();
                that.painterSettings.paintImage.attr("xlink:href", url);
                that.timerInProgress = false;
            }, 10);
        }
    };

    Painter.prototype.setPixel = function (imageData, pixel) {
        var index = (pixel.x + pixel.y * imageData.width) * 4;
        imageData.data[index + 0] = pixel.rgba.r; // red
        imageData.data[index + 1] = pixel.rgba.g; // green
        imageData.data[index + 2] = pixel.rgba.b; // blue
        imageData.data[index + 3] = pixel.rgba.a; // alpha
    };

    Painter.prototype.createCanvas = function (width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    };

    Painter.prototype.doPaint = function (context, parameter) {
        var x = parameter.x,
            y = parameter.y,
            paintMode = parameter.paintMode,
            url = "",
            that = this,
            imageSize = this.settings.imageSize,
            canvaContext = this.painterSettings.canva.getContext("2d"),
            imageData = this.painterSettings.imageData,
            rootSvgElement = context.drawing.rootContainer[0][0].parentElement,
            viewBoxSettings = rootSvgElement.getAttribute("viewBox"),
            settings = viewBoxSettings.split(" "),
            painterSize = Math.floor(settings[2] / this.painterSettings.painterSize);

        for (var xe = x - painterSize; xe <= x + painterSize; xe++) {
            for (var ye = y - painterSize; ye <= y + painterSize; ye++) {
                if ((xe >= 0) && (xe < imageSize.width) &&
                    (ye >= 0) && (ye < imageSize.height)) {
                    this.paintAtPosition(xe, ye, paintMode, imageData);
                }
            }
        }

        if (this.timerInProgress === false) {
            this.timerInProgress = true;
            setTimeout(function () {
                canvaContext.putImageData(imageData, 0, 0);
                url = that.painterSettings.canva.toDataURL();
                that.painterSettings.paintImage.attr("xlink:href", url);
                that.timerInProgress = false;
            }, 10);
        }

    };

    Painter.prototype.paintAtPosition = function (x, y, paintMode, imageData) {
        var key = x + "; " + y,
            blob = this.painterSettings.paintDataMap.get(key);

        if (blob === undefined) {
            blob = {
                x: x,
                y: y,
                rgba: this.painterSettings.rgbaInvisible,
                painted: false
            };
            this.painterSettings.paintDataMap.set(key, blob);
        }

        if (blob != undefined) {
            if (paintMode === "erase") {
                blob.rgba = this.painterSettings.rgbaInvisible;
                blob.painted = false;
            } else {
                blob.rgba = this.painterSettings.rgbaVisible;
                blob.painted = true;
            }

            this.setPixel(imageData, blob);
        }
    };

    Painter.prototype.hidePixel = function (x, y, imageData) {
        var key = x + "; " + y,
            blob = this.painterSettings.paintDataMap.get(key);

        if (blob != undefined) {
            blob.rgba = this.painterSettings.rgbaInvisible;
            this.setPixel(imageData, blob);
        }
    };

    Painter.prototype.showPixel = function (x, y, imageData) {
        var key = x + "; " + y,
            blob = this.painterSettings.paintDataMap.get(key);

        if ((blob != undefined) && (blob.painted === true)) {
            blob.rgba = this.painterSettings.rgbaVisible;
            this.setPixel(imageData, blob);
        }
    };

    return Painter;
});