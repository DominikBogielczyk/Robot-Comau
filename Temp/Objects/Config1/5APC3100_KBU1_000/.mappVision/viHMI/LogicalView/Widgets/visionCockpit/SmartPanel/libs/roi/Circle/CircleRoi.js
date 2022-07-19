/*
 * This class is the main class for all rectangular rois. 
 *
 * Supported features: 
 *  1. panning
 *  2. zooming
 *  3. resizing
 *  4. handles for resizing
 *  5. subclasses: DragHandler.js
 */
/*global define*/
define(['libs/d3/d3', '../Common/DragHandler', '../Utils/Utils'], function (d3, DragHandler, Utilities) {
    'use strict';

    function CircleRoi(className,
        smartControl,
        selectionController,
        roiSize,
        imageSize,
        colors,
        orientationArrowVisible,
        angle,
        symbolType,
        roiFunction) {

        this.selectionController = selectionController;
        this.smartControl = smartControl;
        this.className = className;
        this.selected = true;
        this.symbolType = symbolType;
        this.roiFunction = roiFunction;
        this.callbackFn = [];
        this.defaultSettings = {
            opacity: 0.6,
            handle_fillOpacity: 0.5,
            markerWidth: 20,
            orientationArrowVisible: orientationArrowVisible,
            drawing: {
                colorTransparent: colors.colorTransparent,
                strokeWidth_max: 4,
                strokeWidth_min: 1,
                strokeWidth: 4,
                strokeWidth_dashed: "2,1",
                ratioRoiToHandleLimit: 3,
                strokeWidthOrientationLine: 1,
                strokeWidth_outline: 0.5,
                strokeColor_default: colors.color_default,
                strokeColor_selected: colors.color_selected,
                fillColor_selected: colors.fillColor_selected,
                fillColorFunctionNone: colors.color_transparent,
                fillColorFunctionRoi: colors.fillColor_roi,
                fillColorFunctionRoni: colors.fillColor_roni,
                handle_color_default: colors.color_default,
                zoomWidthToStroke_Ratio: 200,
                strokeToHandle_Ratio: 10,
                handle_strokeWidth: 5,
                handle_strokeOpacity: 1.0,
                handle_maxSize: 40,
                handle_minSize: 4,
                handleTurnLineLength: 20,
                handleTurnRadius: 10,
                orientationArrowLength: 20,
                handleSize: 30,
            }
        };

        this.settings = {
            imageSize: imageSize,
            roiSize: roiSize,
            markerWidth: 0,
            rotationAngle: angle,
        };

        this.drawing = {
            rootContainer: this.smartControl.renderer.select('#group')
        };

        this.prepareInternalSettings();
        this.initialDraw();
        this.utils = new Utilities();
    }

    CircleRoi.prototype.prepareInternalSettings = function () {
        this.settings.drawing = {
            strokeWidth: this.defaultSettings.drawing.strokeWidth_selected
        };

        this.settings.position = [{
            x: this.settings.roiSize.x,
            y: this.settings.roiSize.y
        }];
    };

    CircleRoi.prototype.initialDraw = function () {
        var that = this,
            fillColor = this.defaultSettings.drawing.fillColorFunctionNone;

        if (this.roiFunction === "roi") {
            fillColor = this.defaultSettings.drawing.fillColorFunctionRoi;
        } else if (this.roiFunction === "roni") {
            fillColor = this.defaultSettings.drawing.fillColorFunctionRoni;
        }

        this.drawing.anchor = this.drawing.rootContainer.append('g')
            .data(this.settings.position)
            .attr('class', this.className);

        var dragHandler = new DragHandler(this),
            width = this.smartControl.precisionRound(this.settings.roiSize.width),
            height = this.smartControl.precisionRound(this.settings.roiSize.height),
            xleft = this.smartControl.precisionRound(-width / 2),
            xright = this.smartControl.precisionRound(width / 2),
            xmid = 0,
            ytop = this.smartControl.precisionRound(-height / 2),
            ybottom = this.smartControl.precisionRound(height / 2),
            ymid = 0;


        // the outline rectangle
        this.drawing.anchor.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('x', xleft)
            .attr('y', ytop)
            .attr('opacity', this.defaultSettings.opacity)
            .attr('fill', 'transparent')
            .style('stroke', this.defaultSettings.drawing.strokeColor_default)
            .attr('stroke-width', this.defaultSettings.drawing.strokeWidth_outline)
            .attr('stroke-dasharray', this.defaultSettings.drawing.strokeWidth_dashed)
            .attr('class', 'outline moveHandle')
            .on("click", this.onClickElement.bind(this))
            .attr("visibility", "visible")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // horizontal helper line
        this.drawing.anchor.append('line')
            .attr('x1', xleft)
            .attr('y1', ymid)
            .attr('x2', xright)
            .attr('y2', ymid)
            .attr('opacity', this.defaultSettings.opacity)
            .attr('fill', 'transparent')
            .style('stroke', this.defaultSettings.drawing.strokeColor_default)
            .attr('stroke-width', this.defaultSettings.drawing.strokeWidth_outline)
            .attr('stroke-dasharray', this.defaultSettings.drawing.strokeWidth_dashed)
            .attr('class', 'outline moveHandle helper horizontal')
            .on("click", this.onClickElement.bind(this))
            .attr("visibility", "visible")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // vertical helper line
        this.drawing.anchor.append('line')
            .attr('x1', xmid)
            .attr('y1', ytop)
            .attr('x2', xmid)
            .attr('y2', ybottom)
            .attr('opacity', this.defaultSettings.opacity)
            .attr('fill', 'transparent')
            .style('stroke', this.defaultSettings.drawing.strokeColor_default)
            .attr('stroke-width', this.defaultSettings.drawing.strokeWidth_outline)
            .attr('stroke-dasharray', this.defaultSettings.drawing.strokeWidth_dashed)
            .attr('class', 'outline moveHandle helper vertical')
            .on("click", this.onClickElement.bind(this))
            .attr("visibility", "visible")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");


        // the main ellipse
        this.drawing.anchor.append('ellipse')
            .attr('cx', xmid)
            .attr('cy', ymid)
            .attr('rx', width / 2)
            .attr('ry', height / 2)
            .style('stroke', this.defaultSettings.drawing.strokeColor_default)
            .attr('stroke-width', this.defaultSettings.drawing.strokeWidth_default)
            .attr('opacity', this.defaultSettings.drawing.handle_strokeOpacity)
            .attr('fill-opacity', this.defaultSettings.opacity)
            .attr('fill', fillColor)
            .attr('class', 'outline ellipse')
            .attr("visibility", "visible")
            .on("click", this.onClickElement.bind(this))
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        this.drawing.anchor.append('text')
            .attr('x', xmid)
            .attr('y', ymid)
            .attr('fill', "yellow")
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
            .attr("visibility", "visible")
            .on("click", this.onClickElement.bind(this))
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
            .attr("visibility", "visible")
            .on("click", this.onClickElement.bind(this))
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
            .attr("visibility", "visible")
            .on("click", this.onClickElement.bind(this))
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
            .attr("visibility", "visible")
            .on("click", this.onClickElement.bind(this))
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
            .attr("visibility", "visible")
            .on("click", this.onClickElement.bind(this))
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
            .attr("visibility", "visible")
            .on("click", this.onClickElement.bind(this))
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
            .attr("visibility", "visible")
            .on("click", this.onClickElement.bind(this))
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
            .attr("visibility", "visible")
            .on("click", this.onClickElement.bind(this))
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // turn handle line
        this.drawing.anchor.append('line')
            .attr('x1', xmid)
            .attr('y1', ytop - this.defaultSettings.markerWidth)
            .attr('x2', xmid / 2)
            .attr('y2', ytop - this.defaultSettings.drawing.handleTurnLineLength)
            .style('stroke', this.defaultSettings.drawing.strokeColor_default)
            .attr('stroke-width', this.defaultSettings.drawing.strokeWidth_outline)
            .attr('fill-opacity', this.defaultSettings.drawing.handle_strokeOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline turnHandle')
            .attr("visibility", "visible")
            .on("click", this.onClickElement.bind(this))
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
            .attr('stroke-width', this.defaultSettings.drawing.strokeWidth_outline)
            .attr('opacity', this.defaultSettings.drawing.handle_strokeOpacity)
            .attr('fill-opacity', 0)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline turnHandle circle')
            .attr("visibility", "visible")
            .on("click", this.onClickElement.bind(this))
            .attr("transform", "translate(" + 0 + "," + 0 + ")");


        // orientation line
        this.drawing.anchor.append('line')
            .attr('x1', xleft)
            .attr('y1', ymid)
            .attr('x2', xright)
            .attr('y2', ymid)
            .style('stroke', this.defaultSettings.drawing.strokeColor_default)
            .attr('stroke-width', this.defaultSettings.drawing.strokeWidthOrientationLine)
            .attr('fill-opacity', this.defaultSettings.drawing.handle_strokeOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline orientation line')
            .attr("visibility", "visible")
            .on("click", this.onClickElement.bind(this))
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // orientation arrow.1
        this.drawing.anchor.append('line')
            .attr('x1', xright - this.defaultSettings.drawing.orientationArrowLength)
            .attr('y1', ymid - 8)
            .attr('x2', xright)
            .attr('y2', ymid)
            .style('stroke', this.defaultSettings.drawing.strokeColor_default)
            .attr('stroke-width', this.defaultSettings.drawing.strokeWidthOrientationLine)
            .attr('fill-opacity', this.defaultSettings.drawing.handle_strokeOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline orientation arrow')
            .attr("visibility", "visible")
            .on("click", this.onClickElement.bind(this))
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        // orientation arrow.2 
        this.drawing.anchor.append('line')
            .attr('x1', xright - this.defaultSettings.drawing.orientationArrowLength)
            .attr('y1', ymid + 8)
            .attr('x2', xright)
            .attr('y2', ymid)
            .style('stroke', this.defaultSettings.drawing.strokeColor_default)
            .attr('stroke-width', this.defaultSettings.drawing.strokeWidthOrientationLine)
            .attr('fill-opacity', this.defaultSettings.drawing.handle_strokeOpacity)
            .attr('fill', this.defaultSettings.drawing.handle_color_default)
            .attr('class', 'outline orientation arrow')
            .attr("visibility", "visible")
            .on("click", this.onClickElement.bind(this))
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        this.showOrientationArrow(this.defaultSettings.orientationArrowVisible);

        this.drawing.anchor
            .style("pointer-events", "inherit")
            .call(dragHandler)
            .on("mousedown", this.onMouseDown.bind(this))
            .on("click", this.onClickSurface.bind(this))
            .on("mouseover", this.onMouseOver.bind(this))
            .on("mouseout", this.onMouseOut.bind(this))
            .attr('transform',
                function (d) {
                    var position_x = that.smartControl.precisionRound(d.x);
                    var position_y = that.smartControl.precisionRound(d.y);
                    return "translate(" + position_x + ", " + position_y + ") rotate(" + that.settings.rotationAngle + ")";
                });

        this.drawing.anchor.selectAll("rect.outline.sizeHandle").style("stroke-width", this.defaultSettings.drawing.handle_strokeWidth);
        this.drawing.anchor.selectAll("rect.outline.sizeHandle").style("stroke-opacity", this.defaultSettings.drawing.handle_strokeOpacity);
        this.drawing.anchor.select("rect.outline.moveHandle").style("stroke-width", this.defaultSettings.drawing.strokeWidth_dashed);
        this.drawing.anchor.select("ellipse.outline.ellipse").style("stroke-width", this.defaultSettings.drawing.strokeWidth_selected);

        this.settings.resize_x0 = d3.transform(this.drawing.anchor.attr("transform")).translate[0];
        this.settings.resize_y0 = d3.transform(this.drawing.anchor.attr("transform")).translate[1];

        this.onUpdateZoomValue();
        this.show();
        this.redraw();
    };

    CircleRoi.prototype.dispose = function () {
        this.drawing.anchor.remove();
        this.callbackFn = [];
    };

    CircleRoi.prototype.show = function () {
        this.drawing.anchor.style('visibility', 'visible');
    };

    CircleRoi.prototype.hide = function () {
        this.drawing.anchor.style('visibility', 'hidden');
    };

    CircleRoi.prototype.onMouseOver = function () {
    };

    CircleRoi.prototype.onMouseOut = function () {
    };

    CircleRoi.prototype.clearSelection = function () {
        this.selectionController.setFirstSelectedRoiTool(this, false);
        this.selected = false;
    };

    CircleRoi.prototype.isSelected = function () {
        return this.selected;
    };

    CircleRoi.prototype.setSelected = function (selected) {
        this.selected = selected;

        if (this.callbackFn.methodRoiToolSelectionChanged != undefined) {
            this.callbackFn.methodRoiToolSelectionChanged(this);
        }
        this.selectionController.setFirstSelectedRoiTool(this, selected);

        if (selected === true) {
            this.moveToFront();
        }
    };

    CircleRoi.prototype.moveToFront = function () {
        var thisElement = $(this.drawing.anchor[0][0])[0];
        var parentNode = thisElement.parentNode;
        if (parentNode) {
            parentNode.append(thisElement);
        }
    };

    CircleRoi.prototype.moveToBottom = function () {
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

    CircleRoi.prototype.registerCallback = function (functionName, callBackFn) {
        this.callbackFn[functionName] = callBackFn;
    };

    CircleRoi.prototype.onClickSurface = function () {

        if (d3.event.defaultPrevented) {
            return;
        }

        this.setSelected(true);
    };

    CircleRoi.prototype.onClickElement = function () {
        if (d3.event.defaultPrevented) {
            return;
        }
        this.setSelected(true);
    };

    CircleRoi.prototype.onMouseDown = function () {

        if (d3.event.defaultPrevented) {
            return;
        }

        this.setSelected(true);

        var targetClassList = d3.event.target.classList;
        if (!(targetClassList.contains("outline") && targetClassList.contains("ellipse"))) {
            return;
        }
    };

    CircleRoi.prototype.getCenterPosition = function () {
        var x = parseFloat(d3.transform(this.drawing.anchor.attr("transform")).translate[0]),
            y = parseFloat(d3.transform(this.drawing.anchor.attr("transform")).translate[1]),
            width = parseFloat(this.drawing.anchor.select("rect.outline.moveHandle").attr("width")),
            height = parseFloat(this.drawing.anchor.select("rect.outline.moveHandle").attr("height"));
        return {
            "x": x,
            "y": y,
            "width": width,
            "height": height
        };
    };

    CircleRoi.prototype.getAbsolutePosition = function () {
        var x = parseFloat(d3.transform(this.drawing.anchor.attr("transform")).translate[0]),
            y = parseFloat(d3.transform(this.drawing.anchor.attr("transform")).translate[1]),
            moveHandleX = parseFloat(this.drawing.anchor.select("rect.outline.moveHandle").attr("x")),
            moveHandleY = parseFloat(this.drawing.anchor.select("rect.outline.moveHandle").attr("y")),
            width = parseFloat(this.drawing.anchor.select("rect.outline.moveHandle").attr("width")),
            height = parseFloat(this.drawing.anchor.select("rect.outline.moveHandle").attr("height"));
        return {
            "x": x + moveHandleX,
            "y": y + moveHandleY,
            "width": width,
            "height": height
        };
    };



    CircleRoi.prototype.isPixelInsideRoi = function (px, py, pos, angle) {
        var ra = pos.width / 2,
            rb = pos.height / 2,
            xc = pos.x + ra,
            yc = pos.y + rb,
            x = px,
            y = py,
            tcos = Math.cos(-angle * Math.PI / 180),
            tsin = Math.sin(-angle * Math.PI / 180),
            part1,
            part2,
            inside = false;

        part1 = Math.pow(-(x - xc) * tcos + (y - yc) * tsin, 2) / Math.pow(ra, 2);
        part2 = Math.pow((x - xc) * tsin + (y - yc) * tcos, 2) / Math.pow(rb, 2);

        if (part1 + part2 < 1) {
            return true;
        }
        return inside;
    };

    CircleRoi.prototype.updateColors = function () {
        var anc = this.drawing.anchor;
        if (this.isSelected()) {
            anc.select("rect.outline.moveHandle").style('stroke', this.defaultSettings.drawing.strokeColor_selected);
            anc.select("ellipse.outline.ellipse").style('stroke', this.defaultSettings.drawing.strokeColor_selected);
            anc.selectAll("rect.outline.sizeHandle").style('stroke', this.defaultSettings.drawing.strokeColor_selected);
            anc.selectAll("rect.outline.sizeHandle").style('fill', this.defaultSettings.drawing.fillColor_selected);
            anc.selectAll("line").style('stroke', this.defaultSettings.drawing.strokeColor_selected);
            anc.select("circle").style('stroke', this.defaultSettings.drawing.strokeColor_selected);

        } else {
            anc.select("rect.outline.moveHandle").style('stroke', this.defaultSettings.drawing.strokeColor_default);
            anc.select("ellipse.outline.ellipse").style('stroke', this.defaultSettings.drawing.strokeColor_default);
            anc.selectAll("rect.outline.sizeHandle").style('stroke', this.defaultSettings.drawing.strokeColor_default);
            anc.selectAll("rect.outline.sizeHandle").style('fill', this.defaultSettings.drawing.fillColor_selected);
            anc.selectAll("line").style('stroke', this.defaultSettings.drawing.strokeColor_default);
            anc.select("circle").style('stroke', this.defaultSettings.drawing.strokeColor_default);
        }
    };

    CircleRoi.prototype.handleDragstarted = function () {
        if (!this.isSelected()) {
            this.setSelected(true);
        }
    };

    CircleRoi.prototype.handleDragend = function () {
        if (!this.isSelected()) {
            this.setSelected(true);
        }
        this.redrawDragend();
    };

    CircleRoi.prototype.showHandles = function () {
        var width = parseFloat(this.drawing.anchor.select("rect.outline.moveHandle").attr("width")),
            height = parseFloat(this.drawing.anchor.select("rect.outline.moveHandle").attr("height"));

        this.drawing.anchor.selectAll("circle.outline.turnHandle").style('visibility', "visible");
        this.drawing.anchor.selectAll("line.outline.turnHandle").style('visibility', "visible");
        this.drawing.anchor.selectAll("rect.outline.sizeHandle").style('visibility', "visible");
    };

    CircleRoi.prototype.hideHandles = function () {
        this.drawing.anchor.selectAll("rect.outline.sizeHandle").style('visibility', "hidden");
        this.drawing.anchor.selectAll("circle.outline.turnHandle").style('visibility', "hidden");
        this.drawing.anchor.selectAll("line.outline.turnHandle").style('visibility', "hidden");
    };

    CircleRoi.prototype.hideHorizontalMidHandles = function () {
        this.drawing.anchor.select("rect.outline.sizeHandle.leftMid").style("visibility", "hidden");
        this.drawing.anchor.select("rect.outline.sizeHandle.rightMid").style("visibility", "hidden");
        this.drawing.anchor.select("rect.outline.sizeHandle.leftMid").style("visibility", "hidden");
        this.drawing.anchor.select("rect.outline.sizeHandle.rightMid").style("visibility", "hidden");
    };

    CircleRoi.prototype.hideVerticalMidHandles = function () {
        this.drawing.anchor.select("rect.outline.sizeHandle.topMid").style("visibility", "hidden");
        this.drawing.anchor.select("rect.outline.sizeHandle.bottomMid").style("visibility", "hidden");
        this.drawing.anchor.select("rect.outline.sizeHandle.topMid").style("visibility", "hidden");
        this.drawing.anchor.select("rect.outline.sizeHandle.bottomMid").style("visibility", "hidden");
    };

    CircleRoi.prototype.redrawDragend = function () {

        this.settings.resize_x0 = d3.transform(this.drawing.anchor.attr("transform")).translate[0];
        this.settings.resize_y0 = d3.transform(this.drawing.anchor.attr("transform")).translate[1];

        this.redraw();
    };

    CircleRoi.prototype.getBoundingRect = function () {
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

    CircleRoi.prototype.getPixels = function () {
        var px = [],
            py = [],
            paintedPixels;

        this.appendPixelData(px, py);
        paintedPixels = {
            "x": px,
            "y": py
        };
        return paintedPixels;
    };


    CircleRoi.prototype.appendPixelData = function (px, py) {
        var x, y,
            polygon = this.getPolygon(),
            br = this.getBoundingRect(),
            left = Math.floor(br.xMin),
            right = Math.floor(br.xMax + 0.5),
            top = Math.floor(br.yMin),
            bottom = Math.floor(br.yMax + 0.5),
            maxLeft = 0,
            maxRight = this.settings.imageSize.width,
            maxTop = 0,
            maxBottom = this.settings.imageSize.height;

        left = Math.max(left, maxLeft);
        right = Math.min(right, maxRight);
        bottom = Math.min(bottom, maxBottom);
        top = Math.max(top, maxTop);

        for (x = left; x <= right; x++) {
            for (y = top; y <= bottom; y++) {
                if (this.smartControl.isPixelInsidePolygon({
                    x: x,
                    y: y
                }, polygon)) {
                    px.push(x);
                    py.push(y);
                }
            }
        }
    };
    CircleRoi.prototype.getPolygon = function () {
        var pos = this.getAbsolutePosition(),
            angle = this.settings.rotationAngle,
            ra = pos.width / 2,
            rb = pos.height / 2,
            xc = pos.x + ra,
            yc = pos.y + rb,
            x, xp,
            y, yp,
            radians,
            index,
            tcos = Math.cos(-angle * Math.PI / 180),
            tsin = Math.sin(-angle * Math.PI / 180),
            iterations = 100,
            polygon = [];

        for (index = 0; index < iterations; index++) {
            radians = Math.PI * index / iterations;
            x = ra * Math.cos(radians);
            y = rb * Math.sin(radians);
            xp = -x * tcos + y * tsin;
            yp = x * tsin + y * tcos;
            polygon.push({
                x: xp + xc,
                y: yp + yc
            });
        }

        for (index = 0; index < iterations; index++) {
            radians = Math.PI * index / iterations;
            x = -ra * Math.cos(radians);
            y = -rb * Math.sin(radians);
            xp = -x * tcos + y * tsin;
            yp = x * tsin + y * tcos;
            polygon.push({
                x: xp + xc,
                y: yp + yc
            });
        }

        if (polygon.length > 0) {
            polygon.push(polygon[0]);
        }
        return polygon;
    };

    CircleRoi.prototype.getXldPolygon = function () {
        var polygon = this.getPolygon(),
            index,
            xldPolygon = {
                x: [],
                y: []
            };

        for (index = 0; index < polygon.length; index++) {
            xldPolygon.x.push(polygon[index].x);
            xldPolygon.y.push(polygon[index].y);
        }
        return xldPolygon;
    };

    CircleRoi.prototype.getRoiParams = function () {
        var x = parseFloat(d3.transform(this.drawing.anchor.attr("transform")).translate[0]),
            y = parseFloat(d3.transform(this.drawing.anchor.attr("transform")).translate[1]),
            width = parseFloat(this.drawing.anchor.select("rect.outline.moveHandle").attr("width")),
            height = parseFloat(this.drawing.anchor.select("rect.outline.moveHandle").attr("height")),
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
            rectPoints: rectPoints,
            angle: angle,
            symbolType: this.symbolType,
            roiFunction: this.roiFunction
        });
    };

    CircleRoi.prototype.onUpdateZoomValue = function () {
        var viewBox = this.smartControl.getViewBox(),
            zoom = {
                width: parseFloat(viewBox[2]),
                height: parseFloat(viewBox[3])
            };

        this.defaultSettings.drawing.strokeWidth = Math.max(zoom.width / this.defaultSettings.drawing.zoomWidthToStroke_Ratio, this.defaultSettings.drawing.strokeWidth_min);

        if (this.defaultSettings.drawing.strokeWidth > this.defaultSettings.drawing.strokeWidth_max) {
            this.defaultSettings.drawing.strokeWidth = this.defaultSettings.drawing.strokeWidth_max;
        }

        this.drawing.anchor.selectAll("rect.outline.sizeHandle").style('stroke-width', this.defaultSettings.drawing.strokeWidth);
        this.drawing.anchor.selectAll("circle.outline.turnHandle").style('stroke-width', this.defaultSettings.drawing.strokeWidth);
        this.drawing.anchor.selectAll("line.outline.turnHandle").style('stroke-width', this.defaultSettings.drawing.strokeWidth);

        this.redraw();
    };

    CircleRoi.prototype.updateRoi = function () {
        var anchor = this.drawing.anchor,
            rotatedAnchorPositionX,
            rotatedAnchorPositionY,
            position = [{
                x: 0,
                y: 0
            }],
            selOutlineRectangle = anchor.select("rect.outline.moveHandle"),
            selOutlineEllipse = anchor.select("ellipse.outline.ellipse"),
            selCircleTurnHandle = anchor.select("circle.outline.turnHandle"),
            selLineTurnHandle = anchor.select("line.outline.turnHandle"),
            selTopLeftHandle = anchor.select("rect.outline.sizeHandle.topLeft"),
            selTopRightHandle = anchor.select("rect.outline.sizeHandle.topRight"),
            selBottomLeftHandle = anchor.select("rect.outline.sizeHandle.bottomLeft"),
            selBottomRightHandle = anchor.select("rect.outline.sizeHandle.bottomRight"),
            selLeftMidHandle = anchor.select("rect.outline.sizeHandle.leftMid"),
            selBottomMidHandle = anchor.select("rect.outline.sizeHandle.bottomMid"),
            selRightMidHandle = anchor.select("rect.outline.sizeHandle.rightMid"),
            selTopMidHandle = anchor.select("rect.outline.sizeHandle.topMid"),
            selOrientationLine = anchor.select("line.outline.orientation.line"),
            selOrientationArrow = anchor.selectAll("line.outline.orientation.arrow"),
            selHelperLineHoricontal = anchor.selectAll("line.outline.moveHandle.horizontal"),
            selHelperLineVertical = anchor.selectAll("line.outline.moveHandle.vertical"),

            width = parseFloat(selOutlineRectangle.attr("width")),
            height = parseFloat(selOutlineRectangle.attr("height")),
            xleft = -width / 2,
            xright = width / 2,
            xmid = 0,
            ytop = -height / 2,
            ybottom = height / 2,
            ymid = 0,
            handleSize = parseFloat(selTopLeftHandle.attr("width")),
            handleOffset = handleSize / 2;


        selOutlineRectangle.attr("x", xleft);
        selOutlineRectangle.attr("y", ytop);

        selOutlineEllipse.attr("cx", xmid);
        selOutlineEllipse.attr("cy", ymid);
        selOutlineEllipse.attr("rx", xright);
        selOutlineEllipse.attr("ry", ybottom);

        selHelperLineHoricontal.attr("x1", xleft);
        selHelperLineHoricontal.attr("x2", xright);
        selHelperLineHoricontal.attr("y1", ymid);
        selHelperLineHoricontal.attr("y2", ymid);

        selHelperLineVertical.attr("x1", xmid);
        selHelperLineVertical.attr("x2", xmid);
        selHelperLineVertical.attr("y1", ytop);
        selHelperLineVertical.attr("y2", ybottom);

        selTopLeftHandle.attr("x", xleft - handleOffset);
        selTopLeftHandle.attr("y", ytop - handleOffset);
        selTopRightHandle.attr("x", xright - handleOffset);
        selTopRightHandle.attr("y", ytop - handleOffset);
        selBottomLeftHandle.attr("x", xleft - handleOffset);
        selBottomLeftHandle.attr("y", ybottom - handleOffset);
        selBottomRightHandle.attr("x", xright - handleOffset);
        selBottomRightHandle.attr("y", ybottom - handleOffset);

        selLeftMidHandle.attr("x", xleft - handleOffset);
        selLeftMidHandle.attr("y", ymid - handleOffset);
        selBottomMidHandle.attr("x", xmid - handleOffset);
        selBottomMidHandle.attr("y", ybottom - handleOffset);
        selRightMidHandle.attr("x", xright - handleOffset);
        selRightMidHandle.attr("y", ymid - handleOffset);
        selTopMidHandle.attr("x", xmid - handleOffset);
        selTopMidHandle.attr("y", ytop - handleOffset);

        this.settings.resize_width = width;
        this.settings.resize_height = height;

        var tx = d3.transform(selTopMidHandle.attr("transform")).translate[0];
        var ty = d3.transform(selLeftMidHandle.attr("transform")).translate[1];

        rotatedAnchorPositionX = this.settings.resize_x0 + tx * Math.cos(this.settings.rotationAngle / 180 * Math.PI) + ty * -Math.sin(this.settings.rotationAngle / 180 * Math.PI);
        rotatedAnchorPositionY = this.settings.resize_y0 + tx * Math.sin(this.settings.rotationAngle / 180 * Math.PI) + ty * Math.cos(this.settings.rotationAngle / 180 * Math.PI);

        // move anchor to x0/y0 position with angle
        position[0].x = rotatedAnchorPositionX;
        position[0].y = rotatedAnchorPositionY;
        anchor.data(position).attr("transform", "translate(" + rotatedAnchorPositionX + "," + rotatedAnchorPositionY + "), rotate(" + this.settings.rotationAngle + ")");

        // reset all translate transformations to 0,0
        anchor.selectAll("rect.sizeHandle").attr("transform", "translate(" + 0 + "," + 0 + ")");
        selOutlineRectangle.attr("transform", "translate(" + 0 + "," + 0 + ")");
        selOutlineEllipse.attr("transform", "translate(" + 0 + "," + 0 + ")");
        selCircleTurnHandle.attr("transform", "translate(" + 0 + "," + 0 + ")");
        selLineTurnHandle.attr("transform", "translate(" + 0 + "," + 0 + ")");
        selOrientationArrow.attr("transform", "translate(" + 0 + "," + 0 + ")");
        selOrientationLine.attr("transform", "translate(" + 0 + "," + 0 + ")");
        selHelperLineHoricontal.attr("transform", "translate(" + 0 + "," + 0 + ")");
        selHelperLineVertical.attr("transform", "translate(" + 0 + "," + 0 + ")");
    };

    CircleRoi.prototype.redraw = function () {
        var viewBox = this.smartControl.getViewBox(),
            zoom = {
                width: parseFloat(viewBox[2]),
                height: parseFloat(viewBox[3])
            },
            handleSize,
            handleOffset,
            roiParams = this.getRoiParams(),
            handleTurnLineLength,
            handleTurnRadius,
            positionRoi = {
                xleft: -roiParams.width / 2,
                xright: roiParams.width / 2,
                xmid: 0,
                ytop: -roiParams.height / 2,
                ybottom: roiParams.height / 2,
                ymid: 0
            };

        handleSize = Math.min(zoom.width / this.defaultSettings.drawing.zoomWidthToStroke_Ratio * this.defaultSettings.drawing.strokeToHandle_Ratio, this.defaultSettings.drawing.handle_maxSize);
        handleSize = Math.max(handleSize, this.defaultSettings.drawing.handle_minSize);
        handleTurnRadius = handleSize / 2;
        handleTurnLineLength = handleSize;
        handleOffset = handleSize / 2;


        this.defaultSettings.drawing.handleSize = handleSize;
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
        this.drawing.anchor.select("circle.outline.turnHandle").attr("r", handleTurnRadius);

        this.drawing.anchor.select("line.outline.turnHandle").attr("x1", positionRoi.xmid);
        this.drawing.anchor.select("line.outline.turnHandle").attr("x2", positionRoi.xmid);
        this.drawing.anchor.select("line.outline.turnHandle").attr("y1", positionRoi.ytop);
        this.drawing.anchor.select("line.outline.turnHandle").attr("y2", positionRoi.ytop - handleTurnLineLength);

        this.drawing.anchor.select("line.outline.orientation.line").attr("x1", positionRoi.xleft + handleOffset);
        this.drawing.anchor.select("line.outline.orientation.line").attr("x2", positionRoi.xright - handleOffset);

        this.drawing.anchor.selectAll("line.outline.orientation.arrow").attr("x1", positionRoi.xright - this.defaultSettings.drawing.orientationArrowLength - handleOffset);
        this.drawing.anchor.selectAll("line.outline.orientation.arrow").attr("x2", positionRoi.xright - handleOffset);

        if (this.isSelected()) {
            this.showHandles();
        } else {
            this.hideHandles();
        }

        if (roiParams.height < this.defaultSettings.drawing.ratioRoiToHandleLimit * this.defaultSettings.drawing.handleSize) {
            this.hideHorizontalMidHandles();
        }

        if (roiParams.width < this.defaultSettings.drawing.ratioRoiToHandleLimit * this.defaultSettings.drawing.handleSize) {
            this.hideVerticalMidHandles();
        }

        this.updateColors();
    };

    CircleRoi.prototype.rotateCounterclockwise = function (rotationAngle) {
        var that = this,
            xp = d3.transform(that.drawing.anchor.attr("transform")).translate[0],
            yp = d3.transform(that.drawing.anchor.attr("transform")).translate[1];
        this.settings.rotationAngle = this.settings.rotationAngle + rotationAngle;
        this.drawing.anchor
            .attr('transform', function () {
                return "translate(" + xp + ", " + yp + ") rotate(" + that.settings.rotationAngle + ")";
            });
    };

    CircleRoi.prototype.setAngle = function (angle) {
        var that = this,
            xp = d3.transform(that.drawing.anchor.attr("transform")).translate[0],
            yp = d3.transform(that.drawing.anchor.attr("transform")).translate[1];
        this.settings.rotationAngle = angle;
        this.drawing.anchor
            .attr('transform', function () {
                return "translate(" + xp + ", " + yp + ") rotate(" + that.settings.rotationAngle + ")";
            });
    };

    CircleRoi.prototype.showOrientationArrow = function (status) {
        var that = this;
        that.defaultSettings.orientationArrowVisible = status;
        if (status === false) {
            that.drawing.anchor.selectAll("line.outline.orientation").attr("visibility", "hidden");
        } else {
            that.drawing.anchor.selectAll("line.outline.orientation").attr("visibility", "visible");
        }
    };

    CircleRoi.prototype.setCenterPosition = function () {
        var that = this;
        var xpos = (that.settings.imageSize.width - that.settings.roiSize.width) / 2,
            ypos = (that.settings.imageSize.height - that.settings.roiSize.height) / 2,
            position = [{
                x: xpos,
                y: ypos
            }];
        that.drawing.anchor.data(position).attr("transform", "translate(" + xpos + "," + ypos + ")");
    };

    CircleRoi.prototype.setWidthSameAsHeight = function () {
        var height = parseFloat(this.drawing.anchor.select("rect.outline.moveHandle").attr("height"));
        this.drawing.anchor.select("rect.outline.moveHandle").attr("width", height);

        this.updateRoi();
        this.redraw();
    };

    CircleRoi.prototype.setHeightSameAsWidth = function () {
        var width = parseFloat(this.drawing.anchor.select("rect.outline.moveHandle").attr("width"));
        this.drawing.anchor.select("rect.outline.moveHandle").attr("height", width);

        this.updateRoi();
        this.redraw();
    };

    CircleRoi.prototype.moveToPosition = function (x, y) {
        var position = [{
            x: x,
            y: y
        }];
        this.drawing.anchor.data(position).attr("transform", "translate(" + x + "," + y + ")");
    };

    CircleRoi.prototype.setSize = function (width, height) {
        this.drawing.anchor.select("rect.outline.moveHandle").attr("width", width);
        this.drawing.anchor.select("rect.outline.moveHandle").attr("height", height);
        this.utils.setResizeValues(this);
        this.updateRoi();
        this.redraw();
    };

    CircleRoi.prototype.onHandleDragend = function () {
        this.selectionController.onHandleDragend();
    };


    CircleRoi.prototype.moveToPosition = function (x, y, angle) {
        this.drawing.anchor.attr('transform', "translate(" + x + ", " + y + ")rotate(" + angle + ")");
    };

    CircleRoi.prototype.moveRelativePosition = function (deltaX, deltaY) {
        var x, y, angle;
        x = deltaX + this.getCenterPosition().x;
        y = deltaY + this.getCenterPosition().y;
        angle = this.settings.rotationAngle === undefined ? 0 : this.settings.rotationAngle;
        this.moveToPosition(x, y, angle);
    };

    CircleRoi.prototype.onMouseMoved = function (x, y) {
        this.selectionController.onMouseMoved(x, y);
    };

    CircleRoi.prototype.setAlignment = function (refRoiToolAngle, refCenterPosition) {
        var centerPosition, alignmentPostion;

        centerPosition = this.getCenterPosition();

        alignmentPostion = this.utils.getAlignmentPostion(refCenterPosition.x, refCenterPosition.y, centerPosition.x, centerPosition.y, refRoiToolAngle);

        this.moveToPosition(alignmentPostion.x, alignmentPostion.y, this.settings.rotationAngle);
    };

    CircleRoi.prototype.getDistanceToRefObjectParllelToCenterOfGravityLine = function (refRoiToolAngle, refCenterPosition) {
        var centerPosition, getDistanceToRefObject;

        centerPosition = this.getCenterPosition();

        getDistanceToRefObject = this.utils.getDistanceToRefObjectParllelToCenterOfGravityLine(refCenterPosition.x, refCenterPosition.y, centerPosition.x, centerPosition.y, refRoiToolAngle);

        return getDistanceToRefObject;
    };

    CircleRoi.prototype.setSpacing = function (distanceA, index, equidistance, refRoiToolAngle) {
        var centerPosition, spacingPosition;

        centerPosition = this.getCenterPosition();

        spacingPosition = this.utils.getSpacing(centerPosition.x, centerPosition.y, distanceA, index, equidistance, refRoiToolAngle);

        this.moveToPosition(spacingPosition.x, spacingPosition.y, this.settings.rotationAngle);
    };

    return CircleRoi;
});