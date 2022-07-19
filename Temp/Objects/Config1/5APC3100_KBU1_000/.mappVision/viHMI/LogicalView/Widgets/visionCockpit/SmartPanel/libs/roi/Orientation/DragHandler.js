/*
 * This class is responsible for the dragging behavior of the roi. If a roi is dragged inside 
 * the svg, this class is triggered. The drag handler then decides what to do based on the 
 * class of the element that was dragged.
 * 
 */

var MIN_TOOL_SIZE = 10;

/*global define*/
define(['libs/d3/d3'], function (d3) {
    'use strict';

    function DragHandler(context) {
        var dragHandler = d3.behavior.drag(),
            dragMode = null;

        dragHandler.on("drag", function (d) {
            var targetClassList = d3.event.sourceEvent.target.classList,
                x,
                y;
            if (dragMode === null) {
                dragMode = setDragMode(context, targetClassList);
                if (dragMode === "resize") {
                    d.x += d3.event.dx;
                    d.y += d3.event.dy;
                    x = precisionRound(d.x);
                    y = precisionRound(d.y);
                    initializeResizing(context, x, y, targetClassList);
                } else if (dragMode === "turn") {
                    context.settings.xp0 = precisionRound(d3.transform(context.drawing.anchor.attr("transform")).translate[0]);
                    context.settings.yp0 = precisionRound(d3.transform(context.drawing.anchor.attr("transform")).translate[1]);
                }
            }

            if (dragMode === "move") {

                //// Moving ////
                ////////////////////
                d.x += d3.event.dx;
                d.y += d3.event.dy;
                x = precisionRound(d.x);
                y = precisionRound(d.y);

                d3.select(this).attr("transform", "translate(" + x + ", " + y + ") rotate(" + context.settings.rotationAngle + ")");
                d3.select(this).selectAll("rect.outline.sizeHandle").style("fill", context.defaultSettings.drawing.handle_color_selected);
            } else if (dragMode === "resize") {

                //// Resizing ////
                ////////////////////
                var angle = context.settings.rotationAngle;
                d.x += (d3.event.dx) * Math.cos(angle / 180 * Math.PI) + (d3.event.dy) * Math.sin(angle / 180 * Math.PI);
                d.y += (d3.event.dx) * -Math.sin(angle / 180 * Math.PI) + (d3.event.dy) * Math.cos(angle / 180 * Math.PI);
                x = precisionRound(d.x);
                y = precisionRound(d.y);

                if (context.settings.resizeHandle === "topLeft") {
                    resizeTopLeft(context, x, y);
                } else if (context.settings.resizeHandle === "topRight") {
                    resizeTopRight(context, x, y);
                } else if (context.settings.resizeHandle === "bottomLeft") {
                    resizeBottomLeft(context, x, y);
                } else if (context.settings.resizeHandle === "bottomRight") {
                    resizeBottomRight(context, x, y);
                } else if (context.settings.resizeHandle === "leftMid") {
                    resizeLeftMid(context, x, y);
                } else if (context.settings.resizeHandle === "rightMid") {
                    resizeRightMid(context, x, y);
                } else if (context.settings.resizeHandle === "bottomMid") {
                    resizeBottomMid(context, x, y);
                } else if (context.settings.resizeHandle === "topMid") {
                    resizeTopMid(context, x, y);
                }
            } else if (dragMode === "turn") {

                //// Rotate    ////
                ////////////////////
                var xp = precisionRound(d3.transform(context.drawing.anchor.attr("transform")).translate[0]),
                    yp = precisionRound(d3.transform(context.drawing.anchor.attr("transform")).translate[1]);

                context.settings.rotationAngle = getAngle(xp, yp, d3.event.x, d3.event.y);

                d3.select(this).attr("transform",
                    "translate(" + xp + ", " + yp + ") rotate(" + context.settings.rotationAngle + ")");
            }
        });

        dragHandler.on("dragend", function () {
            if (dragMode === "resize") {
                updateRoi(context);
            }
            context.handleDragend(dragMode);
            dragMode = null;
            context.drawing.anchor.selectAll("rect.outline.sizeHandle").style("fill", context.defaultSettings.drawing.handle_color_default);
        });
        return dragHandler;
    }

    function setDragMode(context, targetClassList) {
        var dragMode = null;
        if (targetClassList.contains("turnHandle") && targetClassList.contains("circle")) {
            dragMode = "turn";
        } else if (targetClassList.contains("moveHandle")) {
                dragMode = "move";
        } else if (targetClassList.contains("sizeHandle")) {
            dragMode = "resize";
        }
        return dragMode;
    }

    function precisionRound(number) {
        return Math.round(number);
    }

    function initializeResizing(context, x, y, targetClassList) {
        var anchor = context.drawing.anchor,
            selOutlineRectangle = anchor.select("rect.outline.moveHandle");

        /* store drag start position */
        context.settings.resize_x = x;
        context.settings.resize_y = y;

        /* store transformation position of anchor */
        context.settings.resize_x0 = precisionRound(d3.transform(anchor.attr("transform")).translate[0]);
        context.settings.resize_y0 = precisionRound(d3.transform(anchor.attr("transform")).translate[1]);

        /* store width and height of outline rectangle */
        context.settings.resize_width = precisionRound(selOutlineRectangle.attr("width"));
        context.settings.resize_height = precisionRound(selOutlineRectangle.attr("height"));

        if (targetClassList.contains("topLeft")) {
            context.settings.resizeHandle = "topLeft";
        } else if (targetClassList.contains("topRight")) {
            context.settings.resizeHandle = "topRight";
        } else if (targetClassList.contains("bottomLeft")) {
            context.settings.resizeHandle = "bottomLeft";
        } else if (targetClassList.contains("bottomRight")) {
            context.settings.resizeHandle = "bottomRight";
        } else if (targetClassList.contains("topMid")) {
            context.settings.resizeHandle = "topMid";
        } else if (targetClassList.contains("bottomMid")) {
            context.settings.resizeHandle = "bottomMid";
        } else if (targetClassList.contains("leftMid")) {
            context.settings.resizeHandle = "leftMid";
        } else if (targetClassList.contains("rightMid")) {
            context.settings.resizeHandle = "rightMid";
        }

    }

    function updateRoi(context) {
        var anchor = context.drawing.anchor,
            rotatedAnchorPositionX,
            rotatedAnchorPositionY,
            position = [{
                x: 0,
                y: 0
            }],
            selOutlineRectangle = anchor.select("rect.outline.moveHandle"),
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
            selOrientationArrowTop = anchor.select("line.outline.orientation.arrow.top"),
            selOrientationArrowBottom = anchor.select("line.outline.orientation.arrow.bottom"),
            width = selOutlineRectangle.attr("width"),
            height = selOutlineRectangle.attr("height"),
            xleft = -width / 2,
            xright = +width / 2,
            xmid = 0,
            ytop = -height / 2,
            ybottom = height / 2,
            ymid = 0,
            handleSize = parseFloat(selTopLeftHandle.attr("width")),
            handleOffset = handleSize / 2,
            arrowLength = width / 5,
            tempArrowOffset = context.defaultSettings.drawing.orientationArrowOffset;

        selOutlineRectangle.attr("x", xleft);
        selOutlineRectangle.attr("y", ytop);

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

        selCircleTurnHandle.attr("cx", xmid);
        selCircleTurnHandle.attr("cy", ytop - handleSize - context.defaultSettings.drawing.handleTurnRadius);

        selLineTurnHandle.attr("x1", xmid);
        selLineTurnHandle.attr("x2", xmid);
        selLineTurnHandle.attr("y1", ytop - handleOffset);
        selLineTurnHandle.attr("y2", ytop - handleSize);

        // Orientation Arrow
        selOrientationLine.attr("x1", xleft + tempArrowOffset);
        selOrientationLine.attr("x2", xright - tempArrowOffset);
        selOrientationLine.attr("y1", ymid);
        selOrientationLine.attr("y2", ymid);

        selOrientationArrow.attr("x1", xright - arrowLength - tempArrowOffset);
        selOrientationArrow.attr("x2", xright - tempArrowOffset);
        selOrientationArrow.attr("y2", ymid);
        selOrientationArrowTop.attr("y1", ytop + tempArrowOffset);
        selOrientationArrowBottom.attr("y1", ybottom - tempArrowOffset);

        context.settings.resize_width = width;
        context.settings.resize_height = height;

        var tx = d3.transform(selTopMidHandle.attr("transform")).translate[0];
        var ty = d3.transform(selLeftMidHandle.attr("transform")).translate[1];

        rotatedAnchorPositionX = context.settings.resize_x0 + tx * Math.cos(context.settings.rotationAngle / 180 * Math.PI) + ty * -Math.sin(context.settings.rotationAngle / 180 * Math.PI);
        rotatedAnchorPositionY = context.settings.resize_y0 + tx * Math.sin(context.settings.rotationAngle / 180 * Math.PI) + ty * Math.cos(context.settings.rotationAngle / 180 * Math.PI);

        // move anchor to x0/y0 position with angle
        position[0].x = rotatedAnchorPositionX;
        position[0].y = rotatedAnchorPositionY;
        anchor.data(position).attr("transform", "translate(" + rotatedAnchorPositionX + "," + rotatedAnchorPositionY + "), rotate(" + context.settings.rotationAngle + ")");

        // reset all translate transformations to 0,0
        anchor.selectAll("rect.sizeHandle").attr("transform", "translate(" + 0 + "," + 0 + ")");
        selOutlineRectangle.attr("transform", "translate(" + 0 + "," + 0 + ")");
        selCircleTurnHandle.attr("transform", "translate(" + 0 + "," + 0 + ")");
        selLineTurnHandle.attr("transform", "translate(" + 0 + "," + 0 + ")");
        selOrientationArrow.attr("transform", "translate(" + 0 + "," + 0 + ")");
        selOrientationLine.attr("transform", "translate(" + 0 + "," + 0 + ")");
    }

    function resizeTopLeft(context, px, py) {
        var anchor = context.drawing.anchor,
            x = px - context.settings.resize_x,
            y = py - context.settings.resize_y,
            width = context.settings.resize_width - x,
            height = context.settings.resize_height - y,
            arrowOffset = context.defaultSettings.drawing.orientationArrowOffset,
            arrowLength = width / 5;

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.sizeHandle.topLeft").style("fill", context.defaultSettings.drawing.handle_color_selected);

        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + x + "," + y + ")")
            .attr("width", width)
            .attr("height", height);

        anchor.select("rect.outline.sizeHandle.topLeft").attr("transform", "translate(" + x + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.topRight").attr("transform", "translate(" + 0 + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.bottomLeft").attr("transform", "translate(" + x + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.bottomRight").attr("transform", "translate(" + 0 + "," + 0 + ")");

        anchor.select("rect.outline.sizeHandle.topMid").attr("transform", "translate(" + x / 2 + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.bottomMid").attr("transform", "translate(" + x / 2 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.rightMid").attr("transform", "translate(" + 0 + "," + y / 2 + ")");
        anchor.select("rect.outline.sizeHandle.leftMid").attr("transform", "translate(" + x + "," + y / 2 + ")");

        anchor.select("circle.outline.turnHandle").attr("transform", "translate(" + x / 2 + "," + y + ")");
        anchor.select("line.outline.turnHandle").attr("transform", "translate(" + x / 2 + "," + y + ")");

        anchor.selectAll("line.outline.orientation").attr("transform", "translate(" + x + "," + y / 2 + ")");
        anchor.selectAll("line.outline.orientation.arrow").attr("x1", width / 2 - x / 2 - arrowLength - arrowOffset)
            .attr("x2", width / 2 - x / 2 - arrowOffset);
        anchor.select("line.outline.orientation.arrow.top").attr("y1", -height / 2 + arrowOffset);
        anchor.select("line.outline.orientation.arrow.bottom").attr("y1", height / 2 - arrowOffset);
        anchor.select("line.outline.orientation.line").attr("x1", -width / 2 - x / 2 + arrowOffset);
        anchor.select("line.outline.orientation.line").attr("x2", width / 2 - x / 2 - arrowOffset);
    }

    function resizeTopRight(context, px, py) {
        var anchor = context.drawing.anchor,
            x = px - context.settings.resize_x,
            y = py - context.settings.resize_y,
            width = context.settings.resize_width + x,
            height = context.settings.resize_height - y,
            arrowOffset = context.defaultSettings.drawing.orientationArrowOffset,
            arrowLength = width / 5;

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.sizeHandle.topRight").style("fill", context.defaultSettings.drawing.handle_color_selected);
        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + 0 + "," + y + ")")
            .attr("width", width)
            .attr("height", height);

        anchor.select("rect.outline.sizeHandle.topLeft").attr("transform", "translate(" + 0 + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.topRight").attr("transform", "translate(" + x + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.bottomLeft").attr("transform", "translate(" + 0 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.bottomRight").attr("transform", "translate(" + x + "," + 0 + ")");

        anchor.select("rect.outline.sizeHandle.topMid").attr("transform", "translate(" + x / 2 + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.bottomMid").attr("transform", "translate(" + x / 2 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.rightMid").attr("transform", "translate(" + x + "," + y / 2 + ")");
        anchor.select("rect.outline.sizeHandle.leftMid").attr("transform", "translate(" + 0 + "," + y / 2 + ")");

        anchor.select("circle.outline.turnHandle").attr("transform", "translate(" + x / 2 + "," + y + ")");
        anchor.select("line.outline.turnHandle").attr("transform", "translate(" + x / 2 + "," + y + ")");

        anchor.selectAll("line.outline.orientation").attr("transform", "translate(" + x + "," + y / 2 + ")");
        anchor.selectAll("line.outline.orientation.arrow").attr("x1", width / 2 - x / 2 - arrowLength - arrowOffset)
            .attr("x2", width / 2 - x / 2 - arrowOffset);
        anchor.select("line.outline.orientation.arrow.top").attr("y1", -height / 2 + arrowOffset);
        anchor.select("line.outline.orientation.arrow.bottom").attr("y1", height / 2 - arrowOffset);
        anchor.select("line.outline.orientation.line").attr("x1", -width / 2 - x / 2 + arrowOffset);
        anchor.select("line.outline.orientation.line").attr("x2", width / 2 - x / 2 - arrowOffset);

    }

    function resizeBottomLeft(context, px, py) {
        var anchor = context.drawing.anchor,
            x = px - context.settings.resize_x,
            y = py - context.settings.resize_y,
            width = context.settings.resize_width - x,
            height = context.settings.resize_height + y,
            arrowOffset = context.defaultSettings.drawing.orientationArrowOffset,
            arrowLength = width / 5;

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.sizeHandle.bottomLeft").style("fill", context.defaultSettings.drawing.handle_color_selected);
        anchor.select("RectangleRoi").attr("transform", "translate(" + x + "," + y + ")");
        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + x + "," + 0 + ")")
            .attr("width", width)
            .attr("height", height);

        anchor.select("rect.outline.sizeHandle.topLeft").attr("transform", "translate(" + x + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.topRight").attr("transform", "translate(" + 0 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.bottomLeft").attr("transform", "translate(" + x + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.bottomRight").attr("transform", "translate(" + 0 + "," + y + ")");

        anchor.select("rect.outline.sizeHandle.topMid").attr("transform", "translate(" + x / 2 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.bottomMid").attr("transform", "translate(" + x / 2 + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.rightMid").attr("transform", "translate(" + 0 + "," + y / 2 + ")");
        anchor.select("rect.outline.sizeHandle.leftMid").attr("transform", "translate(" + x + "," + y / 2 + ")");

        anchor.select("circle.outline.turnHandle").attr("transform", "translate(" + x / 2 + "," + 0 + ")");
        anchor.select("line.outline.turnHandle").attr("transform", "translate(" + x / 2 + "," + 0 + ")");

        anchor.selectAll("line.outline.orientation").attr("transform", "translate(" + x + "," + y / 2 + ")");
        anchor.selectAll("line.outline.orientation.arrow").attr("x1", width / 2 - x / 2 - arrowLength - arrowOffset)
            .attr("x2", width / 2 - x / 2 - arrowOffset);
        anchor.select("line.outline.orientation.arrow.top").attr("y1", -height / 2 + arrowOffset);
        anchor.select("line.outline.orientation.arrow.bottom").attr("y1", height / 2 - arrowOffset);
        anchor.select("line.outline.orientation.line").attr("x1", -width / 2 - x / 2 + arrowOffset);
        anchor.select("line.outline.orientation.line").attr("x2", width / 2 - x / 2 - arrowOffset);
    }

    function resizeBottomRight(context, px, py) {
        var anchor = context.drawing.anchor,
            x = px - context.settings.resize_x,
            y = py - context.settings.resize_y,
            width = context.settings.resize_width + x,
            height = context.settings.resize_height + y,
            arrowOffset = context.defaultSettings.drawing.orientationArrowOffset,
            arrowLength = width / 5;

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.sizeHandle.bottomRight").style("fill", context.defaultSettings.drawing.handle_color_selected);
        anchor.select("RectangleRoi").attr("transform", "translate(" + x + "," + y + ")");

        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + 0 + "," + 0 + ")")
            .attr("width", width)
            .attr("height", height);

        anchor.select("rect.outline.sizeHandle.topLeft").attr("transform", "translate(" + 0 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.topRight").attr("transform", "translate(" + x + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.bottomLeft").attr("transform", "translate(" + 0 + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.bottomRight").attr("transform", "translate(" + x + "," + y + ")");

        anchor.select("rect.outline.sizeHandle.topMid").attr("transform", "translate(" + x / 2 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.bottomMid").attr("transform", "translate(" + x / 2 + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.rightMid").attr("transform", "translate(" + x + "," + y / 2 + ")");
        anchor.select("rect.outline.sizeHandle.leftMid").attr("transform", "translate(" + 0 + "," + y / 2 + ")");

        anchor.select("circle.outline.turnHandle").attr("transform", "translate(" + x / 2 + "," + 0 + ")");
        anchor.select("line.outline.turnHandle").attr("transform", "translate(" + x / 2 + "," + 0 + ")");

        anchor.selectAll("line.outline.orientation").attr("transform", "translate(" + x + "," + y / 2 + ")");
        anchor.selectAll("line.outline.orientation.arrow").attr("x1", width / 2 - x / 2 - arrowLength - arrowOffset)
            .attr("x2", width / 2 - x / 2 - arrowOffset);
        anchor.select("line.outline.orientation.arrow.top").attr("y1", -height / 2 + arrowOffset);
        anchor.select("line.outline.orientation.arrow.bottom").attr("y1", height / 2 - arrowOffset);
        anchor.select("line.outline.orientation.line").attr("x1", -width / 2 - x / 2 + arrowOffset);
        anchor.select("line.outline.orientation.line").attr("x2", width / 2 - x / 2 - arrowOffset);
    }

    ///////////////////////////////////////////////////////////////////////////

    function resizeTopMid(context, px, py) {
        var anchor = context.drawing.anchor,
            y = py - context.settings.resize_y,
            width = context.settings.resize_width,
            height = context.settings.resize_height - y,
            arrowOffset = context.defaultSettings.drawing.orientationArrowOffset,
            arrowLength = width / 5;

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.sizeHandle.topMid").style("fill", context.defaultSettings.drawing.handle_color_selected);
        anchor.select("RectangleRoi").attr("transform", "translate(" + 0 + "," + y + ")");

        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + 0 + "," + y + ")")
            .attr("width", width)
            .attr("height", height);

        anchor.select("rect.outline.sizeHandle.topLeft").attr("transform", "translate(" + 0 + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.topRight").attr("transform", "translate(" + 0 + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.bottomLeft").attr("transform", "translate(" + 0 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.bottomRight").attr("transform", "translate(" + 0 + "," + 0 + ")");

        anchor.select("rect.outline.sizeHandle.topMid").attr("transform", "translate(" + 0 + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.rightMid").attr("transform", "translate(" + 0 + "," + y / 2 + ")");
        anchor.select("rect.outline.sizeHandle.bottomMid").attr("transform", "translate(" + 0 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.leftMid").attr("transform", "translate(" + 0 + "," + y / 2 + ")");

        anchor.select("circle.outline.turnHandle").attr("transform", "translate(" + 0 + "," + y + ")");
        anchor.select("line.outline.turnHandle").attr("transform", "translate(" + 0 + "," + y + ")");

        anchor.selectAll("line.outline.orientation").attr("transform", "translate(" + 0 + "," + y / 2 + ")");
        anchor.selectAll("line.outline.orientation.arrow").attr("x1", width / 2 - arrowLength - arrowOffset);
        anchor.select("line.outline.orientation.arrow.top").attr("y1", -height / 2 + arrowOffset);
        anchor.select("line.outline.orientation.arrow.bottom").attr("y1", height / 2 - arrowOffset);
    }

    function resizeBottomMid(context, px, py) {
        var anchor = context.drawing.anchor,
            x = px - context.settings.resize_x,
            y = py - context.settings.resize_y,
            width = context.settings.resize_width,
            height = context.settings.resize_height + y,
            arrowOffset = context.defaultSettings.drawing.orientationArrowOffset,
            arrowLength = width / 5;

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.sizeHandle.bottomMid").style("fill", context.defaultSettings.drawing.handle_color_selected);
        anchor.select("RectangleRoi").attr("transform", "translate(" + x + "," + y + ")");
        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + 0 + "," + 0 + ")")
            .attr("width", width)
            .attr("height", height);

        anchor.select("rect.outline.sizeHandle.topLeft").attr("transform", "translate(" + 0 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.topRight").attr("transform", "translate(" + 0 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.bottomLeft").attr("transform", "translate(" + 0 + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.bottomRight").attr("transform", "translate(" + 0 + "," + y + ")");

        anchor.select("rect.outline.sizeHandle.topMid").attr("transform", "translate(" + 0 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.rightMid").attr("transform", "translate(" + 0 + "," + y / 2 + ")");
        anchor.select("rect.outline.sizeHandle.bottomMid").attr("transform", "translate(" + 0 + "," + y + ")");
        anchor.select("rect.outline.sizeHandle.leftMid").attr("transform", "translate(" + 0 + "," + y / 2 + ")");

        anchor.select("circle.outline.turnHandle").attr("transform", "translate(" + 0 + "," + 0 + ")");
        anchor.select("line.outline.turnHandle").attr("transform", "translate(" + 0 + "," + 0 + ")");

        anchor.selectAll("line.outline.orientation").attr("transform", "translate(" + 0 + "," + y / 2 + ")");
        anchor.selectAll("line.outline.orientation.arrow").attr("x1", width / 2 - arrowLength - arrowOffset);
        anchor.select("line.outline.orientation.arrow.top").attr("y1", -height / 2 + arrowOffset);
        anchor.select("line.outline.orientation.arrow.bottom").attr("y1", height / 2 - arrowOffset);
    }

    function resizeRightMid(context, px, py) {
        var anchor = context.drawing.anchor,
            x = px - context.settings.resize_x,
            y = py - context.settings.resize_y,
            width = context.settings.resize_width + x,
            height = context.settings.resize_height,
            arrowOffset = context.defaultSettings.drawing.orientationArrowOffset,
            arrowLength = width / 5;

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.sizeHandle.rightMid").style("fill", context.defaultSettings.drawing.handle_color_selected);
        anchor.select("RectangleRoi").attr("transform", "translate(" + x + "," + y + ")");
        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + 0 + "," + 0 + ")")
            .attr("width", width)
            .attr("height", height);

        anchor.select("rect.outline.sizeHandle.topLeft").attr("transform", "translate(" + 0 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.topRight").attr("transform", "translate(" + x + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.bottomLeft").attr("transform", "translate(" + 0 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.bottomRight").attr("transform", "translate(" + x + "," + 0 + ")");

        anchor.select("rect.outline.sizeHandle.topMid").attr("transform", "translate(" + x / 2 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.rightMid").attr("transform", "translate(" + x + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.bottomMid").attr("transform", "translate(" + x / 2 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.leftMid").attr("transform", "translate(" + 0 + "," + 0 + ")");

        anchor.select("circle.outline.turnHandle").attr("transform", "translate(" + x / 2 + "," + 0 + ")");
        anchor.select("line.outline.turnHandle").attr("transform", "translate(" + x / 2 + "," + 0 + ")");

        anchor.selectAll("line.outline.orientation").attr("transform", "translate(" + x + "," + 0 + ")");
        anchor.selectAll("line.outline.orientation.arrow").attr("x1", width / 2 - x / 2 - arrowLength - arrowOffset)
            .attr("x2", width / 2 - x / 2 - arrowOffset);
        anchor.select("line.outline.orientation.line").attr("x1", -width / 2 - x / 2 + arrowOffset);
        anchor.select("line.outline.orientation.line").attr("x2", width / 2 - x / 2 - arrowOffset);
    }

    function resizeLeftMid(context, px, py) {
        var anchor = context.drawing.anchor,
            x = px - context.settings.resize_x,
            y = py - context.settings.resize_y,
            width = context.settings.resize_width - x,
            height = context.settings.resize_height,
            arrowOffset = context.defaultSettings.drawing.orientationArrowOffset,
            arrowLength = width / 5;

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.sizeHandle.leftMid").style("fill", context.defaultSettings.drawing.handle_color_selected);
        anchor.select("RectangleRoi").attr("transform", "translate(" + x + "," + y + ")");
        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + x + "," + 0 + ")")
            .attr("width", width)
            .attr("height", height);

        anchor.select("rect.outline.sizeHandle.topLeft").attr("transform", "translate(" + x + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.topRight").attr("transform", "translate(" + 0 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.bottomLeft").attr("transform", "translate(" + x + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.bottomRight").attr("transform", "translate(" + 0 + "," + 0 + ")");

        anchor.select("rect.outline.sizeHandle.topMid").attr("transform", "translate(" + x / 2 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.rightMid").attr("transform", "translate(" + 0 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.bottomMid").attr("transform", "translate(" + x / 2 + "," + 0 + ")");
        anchor.select("rect.outline.sizeHandle.leftMid").attr("transform", "translate(" + x + "," + 0 + ")");

        anchor.select("circle.outline.turnHandle").attr("transform", "translate(" + x / 2 + "," + 0 + ")");
        anchor.select("line.outline.turnHandle").attr("transform", "translate(" + x / 2 + "," + 0 + ")");

        anchor.selectAll("line.outline.orientation").attr("transform", "translate(" + x + "," + 0 + ")");

        anchor.selectAll("line.outline.orientation.arrow").attr("x1", width / 2 - x / 2 - arrowLength - arrowOffset)
            .attr("x2", width / 2 - x / 2 - arrowOffset);
        anchor.select("line.outline.orientation.line").attr("x1", -width / 2 - x / 2 + arrowOffset);
        anchor.select("line.outline.orientation.line").attr("x2", width / 2 - x / 2 - arrowOffset);
    }

    function getAngle(x1, y1, x2, y2) {
        var angle = 0,
            dx = x2 - x1,
            dy = y2 - y1;

        if ((dx === 0) && (dy < 0)) {
            angle = 0;
        } else if ((dx === 0) && (dy > 0)) {
            angle = 180;
        } else if (dx > 0) {
            angle = Math.atan(dy / dx) / Math.PI * 180 + 90;
        } else if (dx < 0) {
            angle = Math.atan(dy / dx) / Math.PI * 180 + 270;
        }

        if (angle >= 360) {
            angle -= 360;
        } else if (angle <= -360) {
            angle += 360;
        }
        return angle;
    }

    return DragHandler;
});