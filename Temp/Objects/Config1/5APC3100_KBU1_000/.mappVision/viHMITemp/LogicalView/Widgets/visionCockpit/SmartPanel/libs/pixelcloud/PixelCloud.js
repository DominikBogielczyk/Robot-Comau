/*
 * This class pain paints the 
 
 */
/*global define, $*/

define(['libs/d3/d3'], function () {
    'use strict';

    function PixelCloud(smartControl, blob, drawSettings, dataResultIndex, dataModels, infoText, showOutlineRect) {

        this.className = "PixelCloud";
        this.smartControl = smartControl;
        this.renderer = smartControl.renderer;
        this.dataResultIndex = dataResultIndex;
        this.dataModels = dataModels;
        this.iconicInfo ="";

        this.settings = {
            theBlob: blob,
            rect: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            showOutlineRect: showOutlineRect,
            colorInfoText: drawSettings.color.infoText,
            strokeColor: drawSettings.color.strokeColor,
            strokeOpacity: drawSettings.color.strokeOpacity,
            strokeOpacitySelected: drawSettings.color.strokeOpacitySelected,
            infoText: infoText
        };

        if(drawSettings.meta && drawSettings.meta.iconicInfo){
            this.iconicInfo = drawSettings.meta.iconicInfo;
        }

        this.settings.rgba = drawSettings.color.rgba;
        this.settings.highlightRgba =  (drawSettings.color.highlightRgba !== undefined) ? drawSettings.color.highlightRgba : drawSettings.color.rgba;
        this.isHighlighted = false;
        this.settings.imageWidth = 1280;
        this.settings.imageHeight = 1024;

        this.drawing = {
            rootContainer: this.renderer.select('#group'),
            zoomWidthToStroke_Ratio: 200,
            strokeWidth_max: 8,
            strokeWidth_min: 1,
            strokeWidth: 4
        };

        this.determineInitialPosition();
        this.decodeBlobFormat();
        this.calculateRoiParameter();
        this.draw();
    }

    PixelCloud.prototype.getBlob = function () {
        return this.settings.theBlob;
    };

    PixelCloud.prototype.determineInitialPosition = function () {
        var widthAttr, heightAttr;
        var imageElement = this.drawing.rootContainer.select('image')[0][0];
        if (imageElement !== null) {
            imageElement = $(imageElement);
            widthAttr = imageElement.attr("width");
            heightAttr = imageElement.attr("height");

            if ((widthAttr != undefined) && (heightAttr != undefined)) {
                this.settings.imageHeight = parseFloat(imageElement.attr("height"));
                this.settings.imageWidth = parseFloat(imageElement.attr("width"));
            }
        }
    };

    PixelCloud.prototype.draw = function () {
        var url,
            canva = this.createCanvas(this.settings.imageWidth, this.settings.imageHeight),
            canvaContext = canva.getContext("2d"),
            roiParam,
            textPosX,
            textPosY;

        this.calculateRoiParameter();
        roiParam = this.getRoiParameter();

        textPosX = roiParam.x;
        textPosY = roiParam.y - roiParam.height / 2 - 8;

        this.drawing.anchor = this.drawing.rootContainer.insert('g', '.XldCloud')
            .style("pointer-events", "none")
            .attr('class', 'PixelCloud' + ' ' + this.iconicInfo);

        this.updateCanvasData(canvaContext);

        url = canva.toDataURL();

        this.drawing.anchor.append("image")
            .attr("xlink:href", url)
            .attr("data-result-index", this.dataResultIndex)
            .attr("data-models", this.dataModels)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.settings.imageWidth)
            .attr("height", this.settings.imageHeight);

        if (this.settings.infoText !== undefined) {
            this.drawing.anchor
                .append('text')
                .attr('x', textPosX)
                .attr('y', textPosY)
                .attr('dominant-baseline', "middle")
                .attr('fill', this.settings.colorInfoText)
                .attr('text-anchor', "middle")
                .text(this.settings.infoText);
        }


        if (this.settings.showOutlineRect === true) {
            this.drawing.anchor.append('rect')
                .attr('width', roiParam.width + 1)
                .attr('height', roiParam.height + 1)
                .attr('x', roiParam.x - roiParam.width / 2)
                .attr('y', roiParam.y - roiParam.height / 2)
                .style('stroke', this.settings.strokeColor)
                .attr('stroke-opacity', this.settings.strokeOpacity)
                .attr('stroke-width', this.drawing.strokeWidth)
                .attr('fill-opacity', 0.0)
                .attr('fill', 0)
                .attr('class', 'outlineRect')
                .attr("transform", "translate(" + 0 + "," + 0 + ")");
        }
    };

    PixelCloud.prototype.updateCanvasData = function (canvaContext) {
        var imgData = canvaContext.createImageData(this.settings.imageWidth, this.settings.imageHeight);
        var len = this.settings.theBlob.xp.length;

        for (var i = 0; i < len; i++) {
            if (this.isPixelInRange(this.settings.theBlob.xp[i], this.settings.theBlob.yp[i])) {
                PixelCloud.prototype.setPixel(imgData,
                    this.settings.theBlob.xp[i],
                    this.settings.theBlob.yp[i],
                    (this.isHighlighted ? this.settings.highlightRgba.r : this.settings.rgba.r), // red
                    (this.isHighlighted ? this.settings.highlightRgba.g : this.settings.rgba.g), // green
                    (this.isHighlighted ? this.settings.highlightRgba.b : this.settings.rgba.b), // blue
                    (this.isHighlighted ? this.settings.highlightRgba.a : this.settings.rgba.a)); // alpha
            }
        }

        canvaContext.putImageData(imgData, 0, 0);
    };

    PixelCloud.prototype.isPixelInRange = function (x, y) {
        var inRange = false;
        if ((x >= 0) && (y >= 0) && (x < this.settings.imageWidth) && (y < this.settings.imageHeight)) {
            inRange = true;
        }
        return inRange;
    };

    PixelCloud.prototype.setPixel = function (imageData, x, y, r, g, b, a) {
        var index = (x + y * imageData.width) * 4;
        imageData.data[index + 0] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = a;
    };

    PixelCloud.prototype.createCanvas = function (width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    };

    PixelCloud.prototype.decodeBlobFormat = function () {
        var type = this.settings.theBlob.type,
            format = this.settings.theBlob.format;

        if (type === "region") {
            if (format === "region_rle") {
                this.decodeBlobFormatRegionRLE();
            } else if (format === "region") {
                this.decodeBlobFormatRegion();
            }
        }else{
            this.settings.theBlob.xp = [];
            this.settings.theBlob.yp = [];
        }
    };

    PixelCloud.prototype.decodeBlobFormatRegion = function () {
        this.settings.theBlob.xp = this.settings.theBlob.x;
        this.settings.theBlob.yp = this.settings.theBlob.y;
    };

    PixelCloud.prototype.decodeBlobFormatRegionRLE = function () {
        var vecX1 = this.settings.theBlob.x1,
            vecX2 = this.settings.theBlob.x2,
            vecY = this.settings.theBlob.y,
            vecLength = vecY.length,
            xStart,
            xStop,
            resX = [],
            resY = [],
            xIndex,
            index;

        for (index = 0; index < vecLength; index++) {
            xStart = vecX1[index];
            xStop = vecX2[index];

            for (xIndex = xStart; xIndex <= xStop; xIndex++) {
                resX.push(xIndex);
                resY.push(vecY[index]);
            }
        }
        this.settings.theBlob.xp = resX;
        this.settings.theBlob.yp = resY;
    };

    PixelCloud.prototype.getPixelData = function () {
        return this.settings.theBlob;
    };

    PixelCloud.prototype.show = function () {
        this.drawing.anchor.style('visibility', 'visible');
    };

    PixelCloud.prototype.hide = function () {
        this.drawing.anchor.style('visibility', 'hidden');
    };


    PixelCloud.prototype.highlight = function () {
        this.isHighlighted = true;
        this.redraw();
        this.isHighlighted = false;
    };

    PixelCloud.prototype.redraw = function () {
        this.drawing.anchor.remove("image");
        this.draw();
        this.show();
    };


    PixelCloud.prototype.dispose = function () {
        this.drawing.anchor.remove();
    };

    PixelCloud.prototype.calculateRoiParameter = function () {
        var xMin = 0,
            xMax = 0,
            yMin = 0,
            yMax = 0,
            blob = this.settings.theBlob;

        for (var i = 0; i < blob.xp.length; i++) {

            if (i === 0) {
                xMin = blob.xp[i];
                yMin = blob.yp[i];
                xMax = blob.xp[i];
                yMax = blob.yp[i];
            } else {
                if (blob.xp[i] < xMin) {
                    xMin = blob.xp[i];
                }

                if (blob.yp[i] < yMin) {
                    yMin = blob.yp[i];
                }

                if (blob.xp[i] >= xMax) {
                    xMax = blob.xp[i];
                }

                if (blob.yp[i] >= yMax) {
                    yMax = blob.yp[i];
                }
            }
        }

        this.settings.roiParameter = {
            width: xMax - xMin,
            height: yMax - yMin,
            x: xMin + (xMax - xMin) / 2,
            y: yMin + (yMax - yMin) / 2
        };
    };

    PixelCloud.prototype.getRoiParameter = function () {
        return this.settings.roiParameter;
    };

    PixelCloud.prototype.onUpdateZoomValue = function () {
        var viewBox = this.smartControl.getViewBox(),
            zoom = {
                width: parseFloat(viewBox[2]),
                height: parseFloat(viewBox[3])
            };

        this.drawing.strokeWidth = Math.max(zoom.width / this.drawing.zoomWidthToStroke_Ratio, this.drawing.strokeWidth_min);
        if (this.drawing.strokeWidth > this.drawing.strokeWidth_max) {
            this.drawing.strokeWidth = this.drawing.strokeWidth_max;
        }
        this.drawing.anchor.select("rect").style('stroke-width', this.drawing.strokeWidth);
    };

    PixelCloud.prototype.setSelected = function (selected) {
        if (selected === true) {
            this.drawing.anchor.select("rect").style('stroke-opacity', this.settings.strokeOpacitySelected);
        } else {
            this.drawing.anchor.select("rect").style('stroke-opacity', this.settings.strokeOpacity);
        }
    };

    return PixelCloud;
});