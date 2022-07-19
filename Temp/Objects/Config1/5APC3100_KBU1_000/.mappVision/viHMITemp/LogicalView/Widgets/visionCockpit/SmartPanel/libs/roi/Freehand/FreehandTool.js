/*
 * This class is the main class for all rectangular rois. 
 *
 */
/*global define*/
define(['libs/d3/d3', '../Common/DragHandler', './Painter'], function (d3, DragHandler, Painter) {
    'use strict';

    function FreehandTool(className,
        smartControl,
        imageSize,
        colors,
        symbolType,
        roiFunction) {

        this.smartControl = smartControl;
        this.className = className;
        this.selected = true;
        this.focus = false;
        this.symbolType = symbolType;
        this.roiFunction = roiFunction;
        this.callbackFn = [];
        this.defaultSettings = {
            opacity: 0.6,
            handle_fillOpacity: 0.5,
            markerWidth: 20,
            drawing: {
                colorTransparent: colors.colorTransparent,
                ratioRoiToHandleLimit: 3,
                zoomWidthToStroke_Ratio: 200,
            }
        };

        this.settings = {
            imageSize: imageSize,
            paintMode: true,
            markerWidth: 0,
        };

        this.drawing = {
            rootContainer: this.smartControl.renderer.select('#group')
        };

        this.prepareInternalSettings();
        this.initialDraw();

        if (this.roiFunction === "roi") {
            this.painter = new Painter(this, { // Brush
                r: 0,
                g: 0x64,
                b: 0,
                a: 153
            });
        } else {
            this.painter = new Painter(this, { // Eraser
                r: 0x8b,
                g: 0,
                b: 0,
                a: 153
            });
        }
    }

    FreehandTool.prototype.prepareInternalSettings = function () {
        this.settings.position = [{
            x: this.settings.imageSize.x,
            y: this.settings.imageSize.y
        }];
    };

    FreehandTool.prototype.initialDraw = function () {
        var that = this;

        this.drawing.anchor = this.drawing.rootContainer.append('g')
            .data(this.settings.position)
            .attr('class', this.className);

        var dragHandler = new DragHandler(this),
            width = this.smartControl.precisionRound(this.settings.imageSize.width),
            height = this.smartControl.precisionRound(this.settings.imageSize.height),
            xleft = 0,
            ytop = 0;

        // the main rectangle
        this.drawing.anchor.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('x', xleft)
            .attr('y', ytop)
            .attr('opacity', 0)
            .attr('class', 'outline freehand')
            .attr("visibility", "visible")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        this.drawing.anchor
            .style("pointer-events", "none")
            .call(dragHandler)
            .on("mousedown", this.onMouseDown.bind(this))
            .on("click", this.onClickSurface.bind(this))
            .on("mouseover", this.onMouseOver.bind(this))
            .on("mouseout", this.onMouseOut.bind(this))
            .attr('transform',
                function (d) {
                    var position_x = that.smartControl.precisionRound(d.x);
                    var position_y = that.smartControl.precisionRound(d.y);
                    return "translate(" + position_x + ", " + position_y + ")";
                });

        this.onUpdateZoomValue();
        this.redraw();
    };

    FreehandTool.prototype.dispose = function () {
        this.drawing.anchor.remove();

        if (this.painter != undefined) {
            this.painter.remove();
            delete this.painter;
        }
    };

    FreehandTool.prototype.onMouseOver = function () {
        if (this.focus === true) {
            document.body.style.cursor = "crosshair";
        }
    };

    FreehandTool.prototype.onMouseOut = function () {
        document.body.style.cursor = "default";
    };

    FreehandTool.prototype.isSelected = function () {
        return false;
    };

    FreehandTool.prototype.clearSelection = function () { };

    FreehandTool.prototype.setSelected = function ( /*selected*/) { };

    FreehandTool.prototype.moveToFront = function () {
        var thisElement = $(this.drawing.anchor[0][0])[0];
        var parentNode = thisElement.parentNode;
        if (parentNode) {
            parentNode.append(thisElement);
        }
    };

    FreehandTool.prototype.moveToBottom = function () {
        var el, el1, el2, thisElement = $(this.drawing.anchor[0][0])[0];
        var parentNode = thisElement.parentNode;
        if (parentNode) {
            el1 = parentNode.firstElementChild;
            if (el1) {
                el = el1;
                el2 = el1.nextSibling;
                if (el2) {
                    el = el2;
                }

                this.setSelected(false);
                this.redraw();
                parentNode.insertBefore(thisElement, el);
            }
        }
    };

    FreehandTool.prototype.registerCallback = function (functionName, callBackFn) {
        this.callbackFn[functionName] = callBackFn;
    };

    FreehandTool.prototype.onClickSurface = function () {
        if (this.focus === true) {
            if (d3.event.defaultPrevented) {
                return;
            }

            this.setSelected(true);
        }
    };

    FreehandTool.prototype.onMouseDown = function () {
        var mousePoint = {
            x: 0,
            y: 0
        },
            paintParam;

        if (this.focus === true) {

            if (d3.event.defaultPrevented) {
                return;
            }

            mousePoint.x = d3.mouse(this.drawing.rootContainer[0][0])[0];
            mousePoint.y = d3.mouse(this.drawing.rootContainer[0][0])[1];

            paintParam = {
                x: Math.floor(mousePoint.x),
                y: Math.floor(mousePoint.y),
                paintMode: (d3.event.buttons === 1) ? "fill" : "erase"
            };
            this.painter.doPaint(this, paintParam);
        }
    };

    FreehandTool.prototype.getCenterPosition = function () {
        return {
            "x": this.settings.imageSize.width / 2,
            "y": this.settings.imageSize.height / 2,
            "width": this.settings.imageSize.width,
            "height": this.settings.imageSize.x.height
        };
    };

    FreehandTool.prototype.getAbsolutePosition = function () {
        return {
            "x": this.settings.imageSize.x,
            "y": this.settings.imageSize.y,
            "width": this.settings.imageSize.width,
            "height": this.settings.imageSize.x.height
        };
    };

    FreehandTool.prototype.appendPixelData = function (pixelMap) {
        var key,
            pixelData,
            mapIter,
            pixelPainterMap,
            px, py,
            br = this.getBoundingRect(),
            left = this.smartControl.precisionRound(br.xMin),
            right = this.smartControl.precisionRound(br.xMax),
            top = this.smartControl.precisionRound(br.yMin),
            bottom = this.smartControl.precisionRound(br.yMax),
            maxLeft = 0,
            maxRight = this.settings.imageSize.width,
            maxTop = 0,
            maxBottom = this.settings.imageSize.height;

        left = Math.max(left, maxLeft);
        right = Math.min(right, maxRight);
        bottom = Math.min(bottom, maxBottom);
        top = Math.max(top, maxTop);

        for (px = left; px <= right; px++) {
            for (py = top; py <= bottom; py++) {
                key = px + "; " + py;
                pixelMap.set(key, {
                    x: px,
                    y: py
                });
            }
        }

        if (this.painter !== undefined) {
            pixelPainterMap = this.painter.getPixelMap();

            if ((pixelPainterMap !== undefined) && (pixelPainterMap.size > 0)) {
                mapIter = pixelPainterMap.keys();
                do {
                    key = mapIter.next().value;
                    if (key != undefined) {
                        pixelData = pixelMap.get(key);
                        if ((pixelData != undefined) && (pixelData.painted === true)) {
                            pixelMap.delete(key);
                        }
                    }
                } while (key != undefined);
            }
        }
    };

    FreehandTool.prototype.removePixelData = function (pixelMap) {
        var key,
            removeData,
            px, py,
            br = this.getBoundingRect(),
            left = this.smartControl.precisionRound(br.xMin),
            right = this.smartControl.precisionRound(br.xMax),
            top = this.smartControl.precisionRound(br.yMin),
            bottom = this.smartControl.precisionRound(br.yMax);

        for (px = left; px <= right; px++) {
            for (py = top; py <= bottom; py++) {
                key = px + "; " + py;
                removeData = pixelMap.get(key);
                if (removeData != undefined) {
                    pixelMap.delete(key);
                }
            }
        }
    };

    FreehandTool.prototype.appendPaintedPixelData = function (pixelsX, pixelsY) {
        var key,
            paintedData,
            mapIter,
            paintedDataMap;

        if (this.painter !== undefined) {
            paintedDataMap = this.painter.getPaintDataMap();

            if ((paintedDataMap !== undefined) && (paintedDataMap.size > 0)) {
                mapIter = paintedDataMap.keys();
                do {
                    key = mapIter.next().value;
                    if (key != undefined) {
                        paintedData = paintedDataMap.get(key);
                        if ((paintedData != undefined) && (paintedData.painted === true)) {
                            pixelsX.push(paintedData.x);
                            pixelsY.push(paintedData.y);
                        }
                    }
                } while (key != undefined);
            }
        }
    };

    FreehandTool.prototype.hasPaintedPixels = function () {
        var result = false,
            paintDataMap;

        paintDataMap = this.painter.getPaintDataMap();
        if ((paintDataMap !== undefined) && (paintDataMap.size > 0)) {
            result = true;
        }
        return result;
    };

    FreehandTool.prototype.updateColors = function () { };
    FreehandTool.prototype.handleDragstarted = function () { };
    FreehandTool.prototype.handleDragend = function (dragMode) {

        this.redrawDragend();

        if (dragMode !== "paint") {
            if (this.painter != undefined) {
                this.painter.updateCanvasData(this);
            }
        }
    };

    FreehandTool.prototype.setPaintData = function (data) {
        if (this.painter != undefined) {
            this.painter.setPaintDataMap(data);
        }
    };

    FreehandTool.prototype.redrawDragend = function () {
        this.redraw();
    };

    FreehandTool.prototype.getBoundingRect = function () {
        var roiParams = this.getRoiParams(),
            xMin = Math.min(roiParams.rectPoints.p0.x, roiParams.rectPoints.p1.x, roiParams.rectPoints.p2.x, roiParams.rectPoints.p3.x),
            xMax = Math.max(roiParams.rectPoints.p0.x, roiParams.rectPoints.p1.x, roiParams.rectPoints.p2.x, roiParams.rectPoints.p3.x),
            yMin = Math.min(roiParams.rectPoints.p0.y, roiParams.rectPoints.p1.y, roiParams.rectPoints.p2.y, roiParams.rectPoints.p3.y),
            yMax = Math.max(roiParams.rectPoints.p0.y, roiParams.rectPoints.p1.y, roiParams.rectPoints.p2.y, roiParams.rectPoints.p3.y);
        return ({
            xMin: xMin,
            xMax: xMax,
            yMin: yMin,
            yMax: yMax
        });
    };

    FreehandTool.prototype.getPixels = function () {
        var px = [],
            py = [],
            paintedPixels;

        this.appendPaintedPixelData(px, py);
        paintedPixels = {
            "x": px,
            "y": py
        };
        return paintedPixels;
    };

    FreehandTool.prototype.getRoiParams = function () {
        var x = parseFloat(d3.transform(this.drawing.anchor.attr("transform")).translate[0]),
            y = parseFloat(d3.transform(this.drawing.anchor.attr("transform")).translate[1]),
            width = this.settings.imageSize.width,
            height = this.settings.imageSize.height,
            w2 = width / 2,
            h2 = height / 2,
            angle = 0,
            rectPoints = {},
            paintedPixels = {},
            tcos = Math.cos(-angle * Math.PI / 180),
            tsin = Math.sin(-angle * Math.PI / 180),

            p0 = {
                x: tcos * -w2 + tsin * -h2,
                y: -tsin * -w2 + tcos * -h2
            },
            p1 = {
                x: tcos * w2 + tsin * -h2,
                y: -tsin * w2 + tcos * -h2
            },
            p2 = {
                x: tcos * w2 + tsin * h2,
                y: -tsin * w2 + tcos * h2
            },
            p3 = {
                x: tcos * -w2 + tsin * h2,
                y: -tsin * -w2 + tcos * h2
            };

        p0.x = p0.x + x;
        p1.x = p1.x + x;
        p2.x = p2.x + x;
        p3.x = p3.x + x;
        p0.y = p0.y + y;
        p1.y = p1.y + y;
        p2.y = p2.y + y;
        p3.y = p3.y + y;

        rectPoints = {
            p0: p0,
            p1: p1,
            p2: p2,
            p3: p3
        };

        var px = [];
        var py = [];
        paintedPixels = this.appedPaintedPixelData(px, py);
        paintedPixels = {
            "x": px,
            "y": py
        };

        return ({
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            rectPoints: rectPoints,
            angle: angle,
            paintedPixels: paintedPixels,
            symbolType: this.symbolType,
            roiFunction: this.roiFunction
        });
    };

    FreehandTool.prototype.onUpdateZoomValue = function () {
        this.redraw();
    };

    FreehandTool.prototype.redraw = function () {
        if (focus === true) {
            this.drawing.anchor.style("pointer-events", "inherit");
        }
        this.drawing.anchor.selectAll("rect.outline.freehand").style('visibility', 'visible');
        this.updateColors();
    };


    FreehandTool.prototype.setFocus = function (focus) {
        this.focus = focus;
        if (focus === true) {
            document.body.style.cursor = "crosshair";
            this.drawing.anchor.style("pointer-events", "inherit");
        } else {
            document.body.style.cursor = "default";
            this.drawing.anchor.style("pointer-events", "none");
        }
    };

    FreehandTool.prototype.getFocus = function () {
        return this.focus;
    };

    FreehandTool.prototype.getSymbolType = function () {
        return this.symbolType;
    };

    FreehandTool.prototype.getRoiFunction = function () {
        return this.roiFunction;
    };

    FreehandTool.prototype.show = function () { };
    FreehandTool.prototype.hide = function () { };
    FreehandTool.prototype.rotateCounterclockwise = function ( /*rotationAngle*/) { };
    FreehandTool.prototype.setAngle = function ( /*angle*/) { };
    FreehandTool.prototype.setCenterPosition = function () { };
    FreehandTool.prototype.setWidthSameAsHeight = function () { };
    FreehandTool.prototype.setHeightSameAsWidth = function () { };
    FreehandTool.prototype.moveToPosition = function ( /*x, y*/) { };
    FreehandTool.prototype.updateRoi = function () { };
    FreehandTool.prototype.showHandles = function () { };
    FreehandTool.prototype.hideHandles = function () { };
    FreehandTool.prototype.hideHorizontalMidHandles = function () { };
    FreehandTool.prototype.hideVerticalMidHandles = function () { };
    FreehandTool.prototype.moveToPosition = function (/*x, y, angle*/) { };
    FreehandTool.prototype.moveRelativePosition = function (/*deltaX, deltaY*/) { };
    FreehandTool.prototype.onMouseMoved = function (/*x, y*/) { };
    FreehandTool.prototype.onHandleDragend = function () { };

    return FreehandTool;
});