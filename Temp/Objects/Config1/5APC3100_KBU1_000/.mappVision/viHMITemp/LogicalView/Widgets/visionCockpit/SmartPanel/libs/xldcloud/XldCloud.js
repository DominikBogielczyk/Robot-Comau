/*
 * This class pain paints the 
 
 */
/*global define*/
define(['libs/d3/d3'], function () {
    'use strict';

    function XldCloud(smartControl, blob, drawSettings, dataResultIndex, dataModels, infoText) {

        this.className = "XldCloud";
        this.smartControl = smartControl;
        this.renderer = smartControl.renderer;
        this.dataResultIndex = dataResultIndex;
        this.dataModels = dataModels;
        this.iconicInfo ="";

        this.settings = {
            theBlob: blob,
            fillColor: drawSettings.color.fillColor,
            fillOpacity: drawSettings.color.fillOpacity,
            strokeColor: drawSettings.color.strokeColor,
            strokeOpacity: drawSettings.color.strokeOpacity,
            strokeOpacitySelected: drawSettings.color.strokeOpacitySelected,
            highlightColor: (drawSettings.color.highlightColor !== undefined) ? drawSettings.color.highlightColor : drawSettings.color.strokeColor,
            colorInfoText: drawSettings.color.infoText,
            infoText: infoText,
        };

        if(drawSettings.meta && drawSettings.meta.iconicInfo){
            this.iconicInfo = drawSettings.meta.iconicInfo;
        }

        this.drawing = {
            rootContainer: this.renderer.select('#group'),
            strokeWidth_max: 8,
            strokeWidth_min: 1,
            strokeWidth: 4,
            zoomWidthToStroke_Ratio: 200,
            zoomWidthToOpacity_Ratio: 1280,
        };

        this.isHighLighted = false;

        this.draw();
        this.onUpdateZoomValue();
    }

    XldCloud.prototype.getBlob = function () {
        return this.settings.theBlob;
    };

    XldCloud.prototype.draw = function () {
        if ((this.settings.theBlob.type === 'xld_cont') ||
            ((this.settings.theBlob.type === 'region') && (this.settings.theBlob.format === 'xld_poly'))) {
            this.drawing.anchor = this.drawing.rootContainer.append('g')
                .style("pointer-events", "none")
                .attr('class', 'XldCloud' + ' ' + this.iconicInfo);

            this.mapXldSvg(this.settings.theBlob);
            this.calculateRoiParameter(this.settings.theBlob);
        }
    };

    XldCloud.prototype.mapXldSvg = function (xldBlob) {
        var svgpath,
            path = "M ",
            roiParam,
            textPosX,
            textPosY;

        for (var i = 0; i < xldBlob.x.length; i++) {
            path += xldBlob.x[i] + ',' + xldBlob.y[i] + ',';
        }
        svgpath = this.drawing.anchor
            .append('path')
            .attr('id', "ResultCloud")
            .attr("data-result-index", this.dataResultIndex)
            .attr("data-models", this.dataModels)
            .classed('contour_execRois', true)
            .style("stroke", (this.isHighLighted ? this.settings.highlightColor :this.settings.strokeColor))
            .style("fill-opacity", this.settings.fillOpacity)
            .style("stroke-opacity", this.settings.strokeOpacity)
            .style("fill", (this.isHighLighted ? this.settings.highlightColor :this.settings.fillColor))
            .style("stroke-width", this.drawing.strokeWidth)
            .attr('d', path);

        if (this.settings.infoText !== undefined) {
            this.calculateRoiParameter(xldBlob);
            roiParam = this.getRoiParameter();
            textPosX = roiParam.x;
            textPosY = roiParam.y - roiParam.height / 2 - 8;

            this.drawing.anchor
                .append('text')
                .attr('x', textPosX)
                .attr('y', textPosY)
                .attr('dominant-baseline', "middle")
                .attr('fill', this.settings.colorInfoText)
                .attr('text-anchor', "middle")
                .text(this.settings.infoText);
        }

        return svgpath;
    };

    XldCloud.prototype.calculateRoiParameter = function (xldBlob) {
        var xMin = 0,
            xMax = 0,
            yMin = 0,
            yMax = 0;

        for (var i = 0; i < xldBlob.x.length - 1; i++) {

            if (i === 0) {
                xMin = xldBlob.x[i];
                yMin = xldBlob.y[i];
                xMax = xldBlob.x[i];
                yMax = xldBlob.y[i];
            } else {
                if (xldBlob.x[i] < xMin) {
                    xMin = xldBlob.x[i];
                }

                if (xldBlob.y[i] < yMin) {
                    yMin = xldBlob.y[i];
                }

                if (xldBlob.x[i] > xMax) {
                    xMax = xldBlob.x[i];
                }

                if (xldBlob.y[i] > yMax) {
                    yMax = xldBlob.y[i];
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

    XldCloud.prototype.show = function () {
        this.drawing.anchor.style('visibility', 'visible');
    };

    XldCloud.prototype.hide = function () {
        this.drawing.anchor.style('visibility', 'hidden');
    };

    XldCloud.prototype.highlight = function () {
        this.isHighLighted = true;
        this.redraw();
        this.isHighLighted = false;
    };

    XldCloud.prototype.redraw = function () {
        this.dispose();
        this.draw();
        this.show();
    };

    XldCloud.prototype.dispose = function () {
        this.drawing.anchor.remove();
    };

    XldCloud.prototype.getRoiParameter = function () {
        return this.settings.roiParameter;
    };

    XldCloud.prototype.onUpdateZoomValue = function () {
        var viewBox = this.smartControl.getViewBox(),
            zoom = {
                width: parseFloat(viewBox[2]),
                height: parseFloat(viewBox[3])
            };

        this.drawing.strokeWidth = Math.max(zoom.width / this.drawing.zoomWidthToStroke_Ratio, this.drawing.strokeWidth_min);
        if (this.drawing.strokeWidth > this.drawing.strokeWidth_max) {
            this.drawing.strokeWidth = this.drawing.strokeWidth_max;
        }
        this.drawing.anchor.select("path").style('stroke-width', this.drawing.strokeWidth);
    };

    XldCloud.prototype.setSelected = function (selected) {
        if (selected === true) {
            this.drawing.anchor.select("path").style('stroke-opacity', this.settings.strokeOpacitySelected);
        } else {
            this.drawing.anchor.select("path").style('stroke-opacity', this.settings.strokeOpacity);
        }
    };

    return XldCloud;
});