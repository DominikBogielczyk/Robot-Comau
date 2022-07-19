/*
 * This class is the main class for all rectangular rois.
 *
 * Supported features:
 *  1. panning
 *  2. zooming
 *  3. resizing
 *  4. rotation

 *  6. handles for resizing and rotation
 *  7. subclasses: DragHandler.js
 */
/*global define, $*/
define(['libs/d3/d3', './DragHandler'], function (d3, DragHandler) {
    'use strict';

    function OrientationArrow(className, renderer, roiSize, imageSize, colors, editMode) {
        var strokeWidthNarrow = 3;
        var strokeWidthFat = 6;

        this.renderer = renderer;
        this.className = className;

        this.editMode = editMode;
        this.visible = true;
        this.FunctionAtTurnEnd = undefined;
        this.SmartPanelContext = undefined;

        this.defaultSettings = {
            opacity: 1.0,
            handle_fillOpacity: 0.5,
            strokeWidth: strokeWidthNarrow,
            markerWidth: 20,
            drawing: {
                strokeWidth_default: strokeWidthNarrow,
                strokeWidth_selected: strokeWidthNarrow,
                strokeWidthOrientationLine: strokeWidthFat,
                strokeColor_default: colors.color_default,
                strokeColor_selected: colors.color_selected,
                handle_color_selected: colors.color_selected,
                handle_color_default: colors.color_default,
                handle_strokeColor: colors.color_default,
                handle_strokeWidth: strokeWidthNarrow,
                handle_strokeOpacity: 1.0,
                handle_relSize: 0.02, // relative to image size
                handle_minSize: 15,
                handleTurnLineLength: 20,
                handleTurnLineMinLength: 25,
                handleTurnRadius: 15,
                orientationArrowOffset: 10
            }
        };

        this.settings = {
            imageSize: imageSize,
            roiSize: roiSize,
            markerWidth: 0,
            rotationAngle: 0,
        };

        this.drawing = {
            rootContainer: this.renderer.select('#group')
        };

        this.prepareInternalSettings();
        this.initialDraw();
        this.show();
    }

    OrientationArrow.prototype.prepareInternalSettings = function () {
        this.settings.drawing = {
            strokeWidth: this.defaultSettings.drawing.strokeWidth_selected
        };

        this.settings.position = [{
            x: this.settings.roiSize.x,
            y: this.settings.roiSize.y
        }];
    };

    OrientationArrow.prototype.initialDraw = function () {
        var that = this;

        // append a root group element that will contain all svg parts of the roi
        this.drawing.anchor = this.drawing.rootContainer.append('g')
            .data(this.settings.position)
            .attr('class', this.className);

        var dragHandler = new DragHandler(this),
            width = this.settings.roiSize.width,
            height = this.settings.roiSize.height,
            xleft = -width / 2,
            xright = width / 2,
            xmid = 0,
            ytop = -height / 2,
            ybottom = height / 2,
            ymid = 0;

        // ORIENTATION ARROW
        // orientation line
        var tempArrowOffset = this.defaultSettings.drawing.orientationArrowOffset;
        this.drawing.anchor.append('line')
            .attr('x1', xleft)
            .attr('y1', ymid)
            .attr('x2', xright - tempArrowOffset)
            .attr('y2', ymid)
            .style('stroke', this.defaultSettings.drawing.strokeColor_default)
            .attr('stroke-width', this.defaultSettings.drawing.strokeWidthOrientationLine)
            .attr('stroke-linecap', 'round')
            .attr('fill-opacity', this.defaultSettings.drawing.handle_strokeOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline orientation line')
            .attr("visibility", "inherit")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // orientation arrow head top part
        var arrowLength = height / 2;
        this.drawing.anchor.append('line')
            .attr('x1', xright - tempArrowOffset - arrowLength)
            .attr('y1', ytop + tempArrowOffset)
            .attr('x2', xright - tempArrowOffset)
            .attr('y2', ymid)
            .style('stroke', this.defaultSettings.drawing.strokeColor_default)
            .attr('stroke-width', this.defaultSettings.drawing.strokeWidthOrientationLine)
            .attr('stroke-linecap', 'round')
            .attr('fill-opacity', this.defaultSettings.drawing.handle_strokeOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline orientation arrow top')
            .attr("visibility", "inherit")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // orientation arrow head bottom part
        this.drawing.anchor.append('line')
            .attr('x1', xright - tempArrowOffset - arrowLength)
            .attr('y1', ybottom - tempArrowOffset)
            .attr('x2', xright - tempArrowOffset)
            .attr('y2', ymid)
            .style('stroke', this.defaultSettings.drawing.strokeColor_default)
            .attr('stroke-width', this.defaultSettings.drawing.strokeWidthOrientationLine)
            .attr('stroke-linecap', 'round')
            .attr('fill-opacity', this.defaultSettings.drawing.handle_strokeOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline orientation arrow bottom')
            .attr("visibility", "inherit")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // the main rectangle
        this.drawing.anchor.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('x', xleft)
            .attr('y', ytop)
            .attr('opacity', this.defaultSettings.opacity)
            .attr('fill', 'transparent')
            .style('stroke', this.defaultSettings.drawing.strokeColor_default)
            .attr('stroke-width', this.defaultSettings.strokeWidth_selected)
            .attr('class', 'outline moveHandle')
            .attr("visibility", "inherit")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // size handle top-left
        this.drawing.anchor.append('rect')
            .attr('width', this.defaultSettings.markerWidth)
            .attr('height', this.defaultSettings.markerWidth)
            .attr('x', xleft - this.defaultSettings.markerWidth / 2)
            .attr('y', ytop - this.defaultSettings.markerWidth / 2)
            .attr('fill-opacity', this.defaultSettings.handle_fillOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline sizeHandle topLeft')
            .attr("visibility", "inherit")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // size handle top-mid
        this.drawing.anchor.append('rect')
            .attr('width', this.defaultSettings.markerWidth)
            .attr('height', this.defaultSettings.markerWidth)
            .attr('x', xmid - this.defaultSettings.markerWidth / 2)
            .attr('y', ytop - this.defaultSettings.markerWidth / 2)
            .attr('fill-opacity', this.defaultSettings.handle_fillOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline sizeHandle topMid')
            .attr("visibility", "inherit")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // size handle top-right
        this.drawing.anchor.append('rect')
            .attr('width', this.defaultSettings.markerWidth)
            .attr('height', this.defaultSettings.markerWidth)
            .attr('x', xright - this.defaultSettings.markerWidth / 2)
            .attr('y', ytop - this.defaultSettings.markerWidth / 2)
            .attr('fill-opacity', this.defaultSettings.handle_fillOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline sizeHandle topRight')
            .attr("visibility", "inherit")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // size handle mid-right
        this.drawing.anchor.append('rect')
            .attr('width', this.defaultSettings.markerWidth)
            .attr('height', this.defaultSettings.markerWidth)
            .attr('x', xright - this.defaultSettings.markerWidth / 2)
            .attr('y', ymid - this.defaultSettings.markerWidth / 2)
            .attr('fill-opacity', this.defaultSettings.handle_fillOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline sizeHandle rightMid')
            .attr("visibility", "inherit")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // size handle bottom-right
        this.drawing.anchor.append('rect')
            .attr('width', this.defaultSettings.markerWidth)
            .attr('height', this.defaultSettings.markerWidth)
            .attr('x', xright - this.defaultSettings.markerWidth / 2)
            .attr('y', ybottom - this.defaultSettings.markerWidth / 2)
            .attr('fill-opacity', this.defaultSettings.handle_fillOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline sizeHandle bottomRight')
            .attr("visibility", "inherit")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // size handle bottom-mid
        this.drawing.anchor.append('rect')
            .attr('width', this.defaultSettings.markerWidth)
            .attr('height', this.defaultSettings.markerWidth)
            .attr('x', xmid - this.defaultSettings.markerWidth / 2)
            .attr('y', ybottom - this.defaultSettings.markerWidth / 2)
            .attr('fill-opacity', this.defaultSettings.handle_fillOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline sizeHandle bottomMid')
            .attr("visibility", "inherit")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // size handle bottom-left
        this.drawing.anchor.append('rect')
            .attr('width', this.defaultSettings.markerWidth)
            .attr('height', this.defaultSettings.markerWidth)
            .attr('x', xleft - this.defaultSettings.markerWidth / 2)
            .attr('y', ybottom - this.defaultSettings.markerWidth / 2)
            .attr('fill-opacity', this.defaultSettings.handle_fillOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline sizeHandle bottomLeft')
            .attr("visibility", "inherit")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // size handle mid-left
        this.drawing.anchor.append('rect')
            .attr('width', this.defaultSettings.markerWidth)
            .attr('height', this.defaultSettings.markerWidth)
            .attr('x', xleft - this.defaultSettings.markerWidth / 2)
            .attr('y', ymid - this.defaultSettings.markerWidth / 2)
            .attr('fill-opacity', this.defaultSettings.handle_fillOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline sizeHandle leftMid')
            .attr("visibility", "inherit")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // turn handle line
        this.drawing.anchor.append('line')
            .attr('x1', xmid)
            .attr('y1', ytop - this.defaultSettings.markerWidth / 2)
            .attr('x2', xmid / 2)
            .attr('y2', ytop - this.defaultSettings.drawing.handleTurnLineLength)
            .style('stroke', this.defaultSettings.drawing.strokeColor_default)
            .attr('stroke-width', this.defaultSettings.drawing.strokeWidth_default)
            .attr('fill-opacity', this.defaultSettings.drawing.handle_strokeOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline turnHandle')
            .attr("visibility", "inherit")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // turn handle circle
        this.drawing.anchor.append('circle')
            .attr('cx', xmid)
            .attr('cy',
                ytop -
                this.defaultSettings.drawing.handleTurnLineLength -
                this.defaultSettings.drawing.handleTurnRadius)
            .attr('r', this.defaultSettings.drawing.handleTurnRadius)
            .style('stroke', this.defaultSettings.drawing.strokeColor_default)
            .attr('stroke-width', this.defaultSettings.drawing.strokeWidth_default)
            .attr('opacity', this.defaultSettings.drawing.handle_strokeOpacity)
            .attr('fill-opacity', 0)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline turnHandle circle')
            .attr("visibility", "inherit")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        this.showOrientationArrow(true);

        this.drawing.anchor
            .style("pointer-events", "inherit")
            .call(dragHandler)
            .on("mousedown", this.onMouseDown.bind(this))
            .attr('transform',
                function (d) {
                    return "translate(" + d.x + ", " + d.y + ") rotate(" + that.settings.rotationAngle + ")";
                });

        this.drawing.anchor.selectAll("rect.outline.sizeHandle").style("stroke-width", this.defaultSettings.drawing.handle_strokeWidth);
        this.drawing.anchor.selectAll("rect.outline.sizeHandle").style("stroke-opacity", this.defaultSettings.drawing.handle_strokeOpacity);
        this.drawing.anchor.select("rect.outline.moveHandle").style("stroke-width", this.defaultSettings.drawing.strokeWidth_selected);
        this.show();
        this.redraw();
        this.updateColors();
    };

    OrientationArrow.prototype.changeEditMode = function (modeIn) {
        this.editMode = modeIn;

        this.updateVisibility();
    };

    OrientationArrow.prototype.dispose = function () {
        this.drawing.anchor.remove();
    };

    OrientationArrow.prototype.isEditable = function () {
        return this.editMode;
    };

    OrientationArrow.prototype.isVisible = function () {
        return this.visible;
    };

    OrientationArrow.prototype.onMouseDown = function () {
        if (d3.event.defaultPrevented) {
            return;
        }

        var targetClassList = d3.event.target.classList;
        if (!(targetClassList.contains("moveHandle"))) {
            return;
        }
    };

    OrientationArrow.prototype.getCenterPosition = function () {
        var x = Math.round(d3.transform(this.drawing.anchor.attr("transform")).translate[0]),
            y = Math.round(d3.transform(this.drawing.anchor.attr("transform")).translate[1]),
            width = Math.round(this.drawing.anchor.select("rect.outline.moveHandle").attr("width")),
            height = Math.round(this.drawing.anchor.select("rect.outline.moveHandle").attr("height"));
        return {
            "x": x,
            "y": y,
            "width": width,
            "height": height
        };
    };

    OrientationArrow.prototype.getAngleDefClockwise = function () {
        return this.settings.rotationAngle;
    };

    OrientationArrow.prototype.getAngleDefMath = function () {
        var tempN, tempAngle;
        tempAngle = -1 * this.settings.rotationAngle;
        if (tempAngle >= 0 && tempAngle <= 360) {
            return tempAngle;
        } else {
            tempN = Math.floor(tempAngle / 360);
            tempAngle = tempAngle - tempN * 360;
        }
        return tempAngle;
    };

    OrientationArrow.prototype.getAbsolutePosition = function () {
        var x = Math.round(d3.transform(this.drawing.anchor.attr("transform")).translate[0]),
            y = Math.round(d3.transform(this.drawing.anchor.attr("transform")).translate[1]),
            width = Math.round(this.drawing.anchor.select("rect.outline.moveHandle").attr("width")),
            height = Math.round(this.drawing.anchor.select("rect.outline.moveHandle").attr("height"));
        return {
            "x": x - Math.floor(width / 2),
            "y": Math.floor(y - height / 2),
            "width": width,
            "height": height
        };
    };

    OrientationArrow.prototype.appendPixelData = function (pixelMap) {
        var pos = this.getAbsolutePosition(),
            left = pos.x,
            right = left + pos.width,
            top = pos.y,
            bottom = top + pos.height,
            angle = this.settings.rotationAngle,
            anchorPositionX = Math.round(d3.transform(this.drawing.anchor.attr("transform")).translate[0]),
            anchorPositionY = Math.round(d3.transform(this.drawing.anchor.attr("transform")).translate[1]),
            key,
            px,
            py,
            pixel;

        if (angle === 0) {
            for (px = left; px < right; px++) {
                for (py = top; py < bottom; py++) {
                    key = px + "." + py;
                    pixelMap.set(key, {
                        x: px,
                        y: py
                    });
                }
            }
        } else {
            for (px = left; px < right; px++) {
                for (py = top; py < bottom; py++) {
                    pixel = this.getTransformedPixel(angle, px, py, anchorPositionX, anchorPositionY);
                    key = pixel.x + "." + pixel.y;
                    pixelMap.set(key, {
                        x: pixel.x,
                        y: pixel.y
                    });
                }
            }
        }
    };

    OrientationArrow.prototype.getTransformedPixel = function (angle, xs, ys, x0, y0) {
        var tcos = Math.cos(-angle * Math.PI / 180),
            tsin = Math.sin(-angle * Math.PI / 180);
        return {
            x: Math.floor(x0 + tcos * (xs - x0) + tsin * (ys - y0)),
            y: Math.floor(y0 - tsin * (xs - x0) + tcos * (ys - y0))
        };
    };

    OrientationArrow.prototype.updateColors = function () {
        var anc = this.drawing.anchor;
        anc.select("rect.outline.moveHandle").style('stroke', this.defaultSettings.drawing.strokeColor_default);
        anc.selectAll("rect.outline.sizeHandle").style('stroke', this.defaultSettings.drawing.strokeColor_default);
        anc.selectAll("line").style('stroke', this.defaultSettings.drawing.strokeColor_default);
        anc.select("circle").style('stroke', this.defaultSettings.drawing.strokeColor_default);

        this.updateVisibility();
    };

    OrientationArrow.prototype.updateVisibility = function () {
        var anc = this.drawing.anchor;

        if (this.isVisible()) {
            if (this.isEditable()) {
                anc.select("rect.outline.moveHandle").style('stroke-opacity', this.defaultSettings.opacity);
                anc.selectAll("rect.outline.moveHandle").attr("visibility", "visible");
                anc.selectAll("rect.outline.sizeHandle").attr("visibility", "visible");
                anc.select("circle").attr("visibility", "visible");
                anc.select("line.outline.turnHandle").attr("visibility", "visible");
            } else {
                anc.select("rect.outline.moveHandle").style('stroke-opacity', 0);
                anc.selectAll("rect.outline.sizeHandle").attr("visibility", "hidden");
                anc.select("circle").attr("visibility", "hidden");
                anc.select("line.outline.turnHandle").attr("visibility", "hidden");
            }
        } else {
            anc.style('visibility', 'hidden');

            anc.select("rect.outline.moveHandle").attr("visibility", 'hidden');
            anc.selectAll("rect.outline.sizeHandle").attr("visibility", 'hidden');
            anc.select("circle").attr("visibility", 'hidden');
            anc.select("line.outline.turnHandle").attr("visibility", 'hidden');

            anc.selectAll("line.outline.orientation.line").attr("visibility", "hidden");
            anc.selectAll("line.outline.orientation.arrow").attr("visibility", "hidden");
        }
    };

    OrientationArrow.prototype.handleDragend = function (dragMode) {
        if (dragMode === "turn") {
            this.turnEndHandler();
        }
    };

    OrientationArrow.prototype.turnEndHandler = function () {
        if (this.FunctionAtTurnEnd !== undefined) {
            this.FunctionAtTurnEnd.call(this.SmartPanelContext, this.getAngleDefMath());
        }
    };

    OrientationArrow.prototype.show = function () {
        var anc = this.drawing.anchor;
        anc.style('visibility', 'visible');

        if (this.editMode === true) {
            anc.select("rect.outline.moveHandle").attr("visibility", 'visible');
            anc.selectAll("rect.outline.sizeHandle").attr("visibility", 'visible');
            anc.select("circle").attr("visibility", 'visible');
            anc.select("line.outline.turnHandle").attr("visibility", 'visible');
        } else {
            anc.select("rect.outline.moveHandle").attr("visibility", 'hidden');
            anc.selectAll("rect.outline.sizeHandle").attr("visibility", 'hidden');
            anc.select("circle").attr("visibility", 'hidden');
            anc.select("line.outline.turnHandle").attr("visibility", 'hidden');
        }

        anc.selectAll("line.outline.orientation.line").attr("visibility", "visible");
        anc.selectAll("line.outline.orientation.arrow").attr("visibility", "visible");

        this.visible = true;
    };

    OrientationArrow.prototype.hide = function () {
        var anc = this.drawing.anchor;
        anc.style('visibility', 'hidden');
        anc.select("rect.outline.moveHandle").attr("visibility", 'hidden');
        anc.selectAll("rect.outline.sizeHandle").attr("visibility", 'hidden');
        anc.select("circle").attr("visibility", 'hidden');
        anc.select("line.outline.turnHandle").attr("visibility", 'hidden');
        anc.selectAll("line.outline.orientation.line").attr("visibility", "hidden");
        anc.selectAll("line.outline.orientation.arrow").attr("visibility", "hidden");

        this.visible = false;
    };

    OrientationArrow.prototype.registerParentFunction = function (context, fn) {
        this.FunctionAtTurnEnd = fn;
        this.SmartPanelContext = context;
    };

    OrientationArrow.prototype.getRoiParams = function () {
        var x = Math.round(d3.transform(this.drawing.anchor.attr("transform")).translate[0]),
            y = Math.round(d3.transform(this.drawing.anchor.attr("transform")).translate[1]),
            width = Math.round(this.drawing.anchor.select("rect.outline.moveHandle").attr("width")),
            height = Math.round(this.drawing.anchor.select("rect.outline.moveHandle").attr("height")),
            w2 = width / 2,
            h2 = height / 2,
            angle = this.settings.rotationAngle,
            rectPoints = {},
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

        return ({
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            rectPoints: rectPoints
        });
    };

    OrientationArrow.prototype.redraw = function () {
        var rootSvgElement = this.drawing.rootContainer[0][0].parentElement,
            viewBoxSettings = rootSvgElement.getAttribute("viewBox"),
            settings = viewBoxSettings.split(" "),
            handleSize1 = Math.floor(settings[2] * this.defaultSettings.drawing.handle_relSize),
            roiParams = this.getRoiParams(),
            imageElement = $(this.drawing.rootContainer.select('image')[0][0]),
            imageParams = {
                width: imageElement.attr("height"),
                height: imageElement.attr("width")
            }, // gets the original height and width of the
            smallerSize = (imageParams.height < imageParams.width) ? imageParams.height : imageParams.width,
            handleSize = Math.min(handleSize1, smallerSize * this.defaultSettings.drawing.handle_relSize),
            handleOffset = handleSize / 2,
            positionRoi = {
                xleft: -roiParams.width / 2,
                xright: roiParams.width / 2,
                xmid: 0,
                ytop: -roiParams.height / 2,
                ybottom: roiParams.height / 2,
                ymid: 0
            },
            handleTurnLineLength = handleSize,
            handleTurnRadius = this.defaultSettings.drawing.handleTurnRadius;

        if ((imageElement.attr("height") === undefined) && (imageElement.attr("width") === undefined)) {
            return;
        }

        if (roiParams.height < 2.5 * handleSize || roiParams.width < 2.5 * handleSize) {
            handleSize = roiParams.height < roiParams.width ? roiParams.height * 0.3 : roiParams.width * 0.3;
            handleSize = (handleSize < this.defaultSettings.drawing.handle_minSize) ? this.defaultSettings.drawing.handle_minSize : handleSize;
            handleOffset = handleSize / 2;
            handleTurnLineLength = (handleSize < this.defaultSettings.drawing.handleTurnLineMinLength) ? this.defaultSettings.drawing.handleTurnLineMinLength : handleSize;
        }

        this.settings.markerWidth = handleSize;

        this.drawing.anchor.selectAll("rect.outline.sizeHandle").attr("height", handleSize);
        this.drawing.anchor.selectAll("rect.outline.sizeHandle").attr("width", handleSize);

        this.drawing.anchor.select("rect.outline.sizeHandle.topLeft").attr("x", positionRoi.xleft - handleOffset);
        this.drawing.anchor.select("rect.outline.sizeHandle.topLeft").attr("y", positionRoi.ytop - handleOffset);
        this.drawing.anchor.select("rect.outline.sizeHandle.topMid").attr("x", positionRoi.xmid - handleOffset);
        this.drawing.anchor.select("rect.outline.sizeHandle.topMid").attr("y", positionRoi.ytop - handleOffset);
        this.drawing.anchor.select("rect.outline.sizeHandle.topRight").attr("x", positionRoi.xright - handleOffset);
        this.drawing.anchor.select("rect.outline.sizeHandle.topRight").attr("y", positionRoi.ytop - handleOffset);

        this.drawing.anchor.select("rect.outline.sizeHandle.leftMid").attr("x", positionRoi.xleft - handleOffset);
        this.drawing.anchor.select("rect.outline.sizeHandle.leftMid").attr("y", positionRoi.ymid - handleOffset);
        this.drawing.anchor.select("rect.outline.sizeHandle.rightMid").attr("x", positionRoi.xright - handleOffset);
        this.drawing.anchor.select("rect.outline.sizeHandle.rightMid").attr("y", positionRoi.ymid - handleOffset);

        this.drawing.anchor.select("rect.outline.sizeHandle.bottomLeft").attr("x", positionRoi.xleft - handleOffset);
        this.drawing.anchor.select("rect.outline.sizeHandle.bottomLeft").attr("y", positionRoi.ybottom - handleOffset);
        this.drawing.anchor.select("rect.outline.sizeHandle.bottomMid").attr("x", positionRoi.xmid - handleOffset);
        this.drawing.anchor.select("rect.outline.sizeHandle.bottomMid").attr("y", positionRoi.ybottom - handleOffset);
        this.drawing.anchor.select("rect.outline.sizeHandle.bottomRight").attr("x", positionRoi.xright - handleOffset);
        this.drawing.anchor.select("rect.outline.sizeHandle.bottomRight").attr("y", positionRoi.ybottom - handleOffset);

        this.drawing.anchor.select("circle.outline.turnHandle").attr("cx", positionRoi.xmid);
        this.drawing.anchor.select("circle.outline.turnHandle").attr("cy", positionRoi.ytop - handleTurnLineLength - handleTurnRadius);

        this.drawing.anchor.select("line.outline.turnHandle").attr("x1", positionRoi.xmid);
        this.drawing.anchor.select("line.outline.turnHandle").attr("x2", positionRoi.xmid);
        this.drawing.anchor.select("line.outline.turnHandle").attr("y1", positionRoi.ytop - handleOffset);
        this.drawing.anchor.select("line.outline.turnHandle").attr("y2", positionRoi.ytop - handleTurnLineLength);

        var tempArrowOffset = this.defaultSettings.drawing.orientationArrowOffset;
        var arrowLength = (positionRoi.ybottom - positionRoi.ytop) / 2;

        this.drawing.anchor.select("line.outline.orientation.line").attr("x1", positionRoi.xleft + tempArrowOffset);
        this.drawing.anchor.select("line.outline.orientation.line").attr("x2", positionRoi.xright - tempArrowOffset);
        this.drawing.anchor.select("line.outline.orientation.line").attr("y1", positionRoi.ymid);
        this.drawing.anchor.select("line.outline.orientation.line").attr("y2", positionRoi.ymid);

        this.drawing.anchor.selectAll("line.outline.orientation.arrow").attr("x1", positionRoi.xright - arrowLength - tempArrowOffset);
        this.drawing.anchor.selectAll("line.outline.orientation.arrow").attr("x2", positionRoi.xright - tempArrowOffset);
        this.drawing.anchor.select("line.outline.orientation.arrow.top").attr("y1", positionRoi.ytop + tempArrowOffset);
        this.drawing.anchor.select("line.outline.orientation.arrow.bottom").attr("y1", positionRoi.ybottom - tempArrowOffset);
    };

    OrientationArrow.prototype.rotateRight = function () {
        var that = this,
            xp = d3.transform(that.drawing.anchor.attr("transform")).translate[0],
            yp = d3.transform(that.drawing.anchor.attr("transform")).translate[1];
        this.settings.rotationAngle = this.settings.rotationAngle + 1;
        this.drawing.anchor
            .attr('transform', function () {
                return "translate(" + xp + ", " + yp + ") rotate(" + that.settings.rotationAngle + ")";
            });
    };

    OrientationArrow.prototype.setAngleDefClockwise = function (angle) {
        var that = this,
            xp = d3.transform(that.drawing.anchor.attr("transform")).translate[0],
            yp = d3.transform(that.drawing.anchor.attr("transform")).translate[1];
        this.settings.rotationAngle = angle;
        this.drawing.anchor
            .attr('transform', function () {
                return "translate(" + xp + ", " + yp + ") rotate(" + that.settings.rotationAngle + ")";
            });
    };

    OrientationArrow.prototype.setAngleDefMath = function (angle) {
        this.setAngleDefClockwise(-1 * angle);
        if (this.FunctionAtTurnEnd !== undefined) {
            this.FunctionAtTurnEnd.call(this.SmartPanelContext, this.getAngleDefMath());
        }
    };

    OrientationArrow.prototype.showOrientationArrow = function (status) {
        var that = this;
        that.defaultSettings.orientationArrowVisible = status;
        if (status === false) {
            that.drawing.anchor.selectAll("line.outline.orientation").attr("visibility", "hidden");
        } else {
            that.drawing.anchor.selectAll("line.outline.orientation").attr("visibility", "visible");
        }
    };

    OrientationArrow.prototype.setCenterPosition = function () {
        var that = this;
        var xpos = (that.settings.imageSize.width - that.settings.roiSize.width) / 2,
            ypos = (that.settings.imageSize.height - that.settings.roiSize.height) / 2,
            position = [{
                x: xpos,
                y: ypos
            }];
        that.drawing.anchor.data(position).attr("transform", "translate(" + xpos + "," + ypos + ")");
    };

    OrientationArrow.prototype.setSize = function (dimension) {
        this.settings.roiSize = dimension;
    };

    return OrientationArrow;
});