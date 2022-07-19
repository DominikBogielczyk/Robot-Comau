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
                shiftKey = d3.event.sourceEvent.shiftKey,
                angle = context.settings.rotationAngle === undefined ? 0 : context.settings.rotationAngle,
                x,
                y;
            switch (dragMode) {
                case null: {
                    dragMode = setDragMode(context, targetClassList);
                    if (dragMode === "resize") {
                        d.x += d3.event.dx;
                        d.y += d3.event.dy;
                        x = context.smartControl.precisionRound(d.x);
                        y = context.smartControl.precisionRound(d.y);
                        initializeResizing(context, x, y, targetClassList);
                    } else if (dragMode === "turn") {
                        context.settings.xp0 = context.smartControl.precisionRound(d3.transform(context.drawing.anchor.attr("transform")).translate[0]);
                        context.settings.yp0 = context.smartControl.precisionRound(d3.transform(context.drawing.anchor.attr("transform")).translate[1]);
                    }
                }
                    break;

                case "move": {
                    //// Moving ////
                    ////////////////////
                    x = context.smartControl.precisionRound(d3.event.dx);
                    y = context.smartControl.precisionRound(d3.event.dy);

                    if (context.onMouseMoved) {
                        context.onMouseMoved(x, y);
                    }
                }
                    break;

                case "paint": {
                    var paintParam = {
                        x: Math.floor(d3.event.x),
                        y: Math.floor(d3.event.y),
                        paintMode: ((d3.event.sourceEvent.buttons === 1) ? "fill" : "erase")
                    };

                    if ((context.painter && context.focus === true)) {
                        context.painter.doPaint(context, paintParam);
                    }
                }
                    break;

                case "resize": {
                    //// Resizing ////
                    ////////////////////
                    d.x += (d3.event.dx) * Math.cos(angle / 180 * Math.PI) + (d3.event.dy) * Math.sin(angle / 180 * Math.PI);
                    d.y += (d3.event.dx) * -Math.sin(angle / 180 * Math.PI) + (d3.event.dy) * Math.cos(angle / 180 * Math.PI);
                    x = context.smartControl.precisionRound(d.x);
                    y = context.smartControl.precisionRound(d.y);


                    if (context.settings.resizeHandle === "topLeft") {
                        resizeTopLeft(context, x, y, shiftKey);
                    } else if (context.settings.resizeHandle === "topRight") {
                        resizeTopRight(context, x, y, shiftKey);
                    } else if (context.settings.resizeHandle === "bottomLeft") {
                        resizeBottomLeft(context, x, y, shiftKey);
                    } else if (context.settings.resizeHandle === "bottomRight") {
                        resizeBottomRight(context, x, y, shiftKey);
                    } else if (context.settings.resizeHandle === "leftMid") {
                        resizeLeftMid(context, x, y);
                    } else if (context.settings.resizeHandle === "rightMid") {
                        resizeRightMid(context, x, y);
                    } else if (context.settings.resizeHandle === "bottomMid") {
                        resizeBottomMid(context, x, y);
                    } else if (context.settings.resizeHandle === "topMid") {
                        resizeTopMid(context, x, y);
                    } else if (context.settings.resizeHandle === "ring") {
                        resizeInlineRing(context, x, y);
                    }

                    if (context.hideHandles) {
                        context.hideHandles();
                    }
                }
                    break;

                case "turn": {
                    //// Rotate    ////
                    ////////////////////
                    var xp = context.smartControl.precisionRound(d3.transform(context.drawing.anchor.attr("transform")).translate[0]),
                        yp = context.smartControl.precisionRound(d3.transform(context.drawing.anchor.attr("transform")).translate[1]);

                    context.settings.rotationAngle = getAngle(xp, yp, d3.event.x, d3.event.y);

                    d3.select(this).attr("transform",
                        "translate(" + xp + ", " + yp + ") rotate(" + context.settings.rotationAngle + ")");

                    if (context.hideHandles) {
                        context.hideHandles();
                    }
                }
                    break;
            }
        });

        dragHandler.on("dragstart", function () {
            if (context.setSelected) {
                context.setSelected(true);
            }
            if (context.updateColors) {
                context.updateColors();
            }
        });

        dragHandler.on("dragend", function () {
            if (dragMode === "resize") {
                if (context.updateRoi) {
                    context.updateRoi();
                }
            }
            if (dragMode !== "paint") {
                if (context.handleDragend) {
                    context.onHandleDragend(); 
                }
            }
            dragMode = null;
        });
        return dragHandler;
    }


    function isDragableObject(targetClassList) {
        var isdragable = false;
        if (targetClassList.contains("moveHandle") ||
            targetClassList.contains("ellipse") ||
            targetClassList.contains("freehand")) {
            isdragable = true;
        }
        return isdragable;
    }

    function isRotatableObject(targetClassList) {
        var isRotatable = false;
        if (targetClassList.contains("turnHandle") && targetClassList.contains("circle")) {
            isRotatable = true;
        }
        return isRotatable;
    }

    function setDragMode(context, targetClassList) {
        var dragMode = null;
        if (isRotatableObject(targetClassList)) {
            dragMode = "turn";
        } else if (isDragableObject(targetClassList)) {
            if (context.settings.paintMode === true) {
                dragMode = "paint";
                startPaint(context, d3.event);
            } else {
                dragMode = "move";
            }
        } else if (targetClassList.contains("sizeHandle")) {
            dragMode = "resize";
        }
        return dragMode;
    }

    function initializeResizing(context, x, y, targetClassList) {
        var anchor = context.drawing.anchor,
            selOutlineRectangle = anchor.select("rect.outline.moveHandle"),
            dragHandlePosition;

        /* store drag start position */
        context.settings.resize_x = x;
        context.settings.resize_y = y;
        /* store transformation position of anchor */
        context.settings.resize_x0 = d3.transform(anchor.attr("transform")).translate[0];
        context.settings.resize_y0 = d3.transform(anchor.attr("transform")).translate[1];

        /* store width and height of outline rectangle */
        context.settings.resize_width = parseFloat(selOutlineRectangle.attr("width"));
        context.settings.resize_height = parseFloat(selOutlineRectangle.attr("height"));

        if (anchor.select("rect.inline.sizeHandle.ring")[0][0]) {
            /* store x start position of ring handle */
            dragHandlePosition = parseFloat(anchor.select("rect.inline.sizeHandle.ring").attr("x"));
            context.settings.dragHandleStartPosX = dragHandlePosition + anchor.select("rect.inline.sizeHandle.ring").attr("width") / 2 + context.settings.resize_width / 2;
        }

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
        } else if (targetClassList.contains("ring")) {
            context.settings.resizeHandle = "ring";
        }
    }


    function resizeTopLeft(context, px, py, shiftKey) {
        var anchor = context.drawing.anchor,
            outlineEllipse = anchor.select("ellipse.outline.ellipse"),
            inlineEllipse = anchor.select("ellipse.inline.ellipse"),
            middleEllipse = anchor.select("path.ring.mid.ellipse"),
            x = context.smartControl.precisionRound(px - context.settings.resize_x),
            y = context.smartControl.precisionRound(py - context.settings.resize_y),
            m = context.settings.resize_height / context.settings.resize_width,
            ratio = context.settings.resize_height / context.settings.resize_width,
            width = context.settings.resize_width - x,
            height = context.settings.resize_height - y,
            arrowLength = context.defaultSettings.drawing.orientationArrowLength,
            handleWidth = parseFloat(anchor.select("rect.outline.sizeHandle.topLeft").attr("width")) / 2,
            diagonalPositionPy = context.settings.resize_y + (px - context.settings.resize_x) * m,
            ringPath;

        if (shiftKey === true) {
            if (py >= diagonalPositionPy) {
                width = context.settings.resize_width - x;
                height = width * ratio;
                x = context.settings.resize_width - width;
                y = context.settings.resize_height - height;

            } else {
                height = context.settings.resize_height - y;
                width = height / ratio;
                x = context.settings.resize_width - width;
                y = context.settings.resize_height - height;
            }
        }

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + x + "," + y + ")")
            .attr("width", width)
            .attr("height", height);

        if (outlineEllipse[0][0]) {
            outlineEllipse.attr("transform", "translate(" + x / 2 + "," + y / 2 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
        }
        if (inlineEllipse[0][0]) {
            inlineEllipse.attr("transform", "translate(" + x / 2 + "," + y / 2 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
            ringPath = context.resizeRingPath(width, height);
            middleEllipse.attr("transform", "translate(" + x / 2 + "," + y / 2 + ")")
                .attr("d", ringPath);
        }

        anchor.select("line.outline.moveHandle.horizontal").attr("transform", "translate(" + x + "," + y / 2 + ")");
        anchor.select("line.outline.moveHandle.horizontal").attr("x1", width / 2 - x / 2 - width);
        anchor.select("line.outline.moveHandle.horizontal").attr("x2", width / 2 - x / 2);

        anchor.select("line.outline.moveHandle.vertical").attr("transform", "translate(" + x / 2 + "," + y + ")");
        anchor.select("line.outline.moveHandle.vertical").attr("y1", -height / 2 - y / 2);
        anchor.select("line.outline.moveHandle.vertical").attr("y2", -height / 2 - y / 2 + height);

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
        anchor.selectAll("line.outline.orientation.arrow").attr("x1", width / 2 - x / 2 - arrowLength - handleWidth)
            .attr("x2", width / 2 - x / 2 - handleWidth);
        anchor.select("line.outline.orientation.line").attr("x2", width / 2 - x / 2 - handleWidth);
    }

    function resizeTopRight(context, px, py, shiftKey) {
        var anchor = context.drawing.anchor,
            outlineEllipse = anchor.select("ellipse.outline.ellipse"),
            inlineEllipse = anchor.select("ellipse.inline.ellipse"),
            middleEllipse = anchor.select("path.ring.mid.ellipse"),
            x = context.smartControl.precisionRound(px - context.settings.resize_x),
            y = context.smartControl.precisionRound(py - context.settings.resize_y),
            ratio = context.settings.resize_height / context.settings.resize_width,
            m = -context.settings.resize_height / context.settings.resize_width,
            width = context.settings.resize_width + x,
            height = context.settings.resize_height - y,
            handleWidth = parseFloat(anchor.select("rect.outline.sizeHandle.topLeft").attr("width")) / 2,
            diagonalPositionPy = context.settings.resize_y + (px - context.settings.resize_x) * m,
            ringPath;

        if (shiftKey === true) {
            if (py < diagonalPositionPy) {
                height = context.settings.resize_height - y;
                width = height / ratio;
                x = -context.settings.resize_width + width;
            } else {
                width = context.settings.resize_width + x;
                height = width * ratio;
                y = -height + context.settings.resize_height;
            }
        }

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + 0 + "," + y + ")")
            .attr("width", width)
            .attr("height", height);

        if (outlineEllipse[0][0]) {
            outlineEllipse.attr("transform", "translate(" + x / 2 + "," + y / 2 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
        }
        if (inlineEllipse[0][0]) {
            inlineEllipse.attr("transform", "translate(" + x / 2 + "," + y / 2 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
            ringPath = context.resizeRingPath(width, height);
            middleEllipse.attr("transform", "translate(" + x / 2 + "," + y / 2 + ")")
                .attr("d", ringPath);
        }

        if (inlineEllipse[0][0]) {
            outlineEllipse.attr("transform", "translate(" + x / 2 + "," + y / 2 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
        }

        anchor.select("line.outline.moveHandle.horizontal").attr("transform", "translate(" + x + "," + y / 2 + ")");
        anchor.select("line.outline.moveHandle.horizontal").attr("x1", -width / 2 - x / 2);
        anchor.select("line.outline.moveHandle.horizontal").attr("x2", +width / 2 - x / 2);

        anchor.select("line.outline.moveHandle.vertical").attr("transform", "translate(" + x / 2 + "," + y + ")");
        anchor.select("line.outline.moveHandle.vertical").attr("y1", -height / 2 - y / 2);
        anchor.select("line.outline.moveHandle.vertical").attr("y2", -height / 2 - y / 2 + height);

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

        anchor.select("line.outline.orientation.line").attr("x1", -width / 2 - x / 2 + handleWidth)
            .attr("x2", width / 2 - x / 2 - handleWidth);

    }

    function resizeBottomLeft(context, px, py, shiftKey) {
        var anchor = context.drawing.anchor,
            outlineEllipse = anchor.select("ellipse.outline.ellipse"),
            inlineEllipse = anchor.select("ellipse.inline.ellipse"),
            middleEllipse = anchor.select("path.ring.mid.ellipse"),
            x = context.smartControl.precisionRound(px - context.settings.resize_x),
            y = context.smartControl.precisionRound(py - context.settings.resize_y),
            m = -context.settings.resize_height / context.settings.resize_width,
            ratio = context.settings.resize_height / context.settings.resize_width,
            width = context.settings.resize_width - x,
            height = context.settings.resize_height + y,
            arrowLength = context.defaultSettings.drawing.orientationArrowLength,
            handleWidth = parseFloat(anchor.select("rect.outline.sizeHandle.topLeft").attr("width")) / 2,
            diagonalPositionPy = context.settings.resize_y + (px - context.settings.resize_x) * m,
            ringPath;

        if (shiftKey === true) {
            if (py < diagonalPositionPy) {
                width = context.settings.resize_width - x;
                height = width * ratio;
                x = context.settings.resize_width - width;
                y = -context.settings.resize_height + height;
            } else {
                height = context.settings.resize_height + y;
                width = height / ratio;
                x = context.settings.resize_width - width;
                y = -context.settings.resize_height + height;
            }
        }

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + x + "," + 0 + ")")
            .attr("width", width)
            .attr("height", height);

        if (outlineEllipse[0][0]) {
            outlineEllipse.attr("transform", "translate(" + x / 2 + "," + y / 2 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
        }
        if (inlineEllipse[0][0]) {
            inlineEllipse.attr("transform", "translate(" + x / 2 + "," + y / 2 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
            ringPath = context.resizeRingPath(width, height);
            middleEllipse.attr("transform", "translate(" + x / 2 + "," + y / 2 + ")")
                .attr("d", ringPath);
        }

        anchor.select("line.outline.moveHandle.horizontal").attr("transform", "translate(" + x + "," + y / 2 + ")");
        anchor.select("line.outline.moveHandle.horizontal").attr("x1", width / 2 - x / 2 - width);
        anchor.select("line.outline.moveHandle.horizontal").attr("x2", +width / 2 - x / 2);

        anchor.select("line.outline.moveHandle.vertical").attr("transform", "translate(" + x / 2 + "," + y + ")");
        anchor.select("line.outline.moveHandle.vertical").attr("y1", -height / 2 - y / 2);
        anchor.select("line.outline.moveHandle.vertical").attr("y2", -height / 2 - y / 2 + height);

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
        anchor.selectAll("line.outline.orientation.arrow").attr("x1", width / 2 - x / 2 - arrowLength - handleWidth)
            .attr("x2", width / 2 - x / 2 - handleWidth);
        anchor.select("line.outline.orientation.line").attr("x2", width / 2 - x / 2 - handleWidth);
    }

    function resizeBottomRight(context, px, py, shiftKey) {
        var anchor = context.drawing.anchor,
            outlineEllipse = anchor.select("ellipse.outline.ellipse"),
            inlineEllipse = anchor.select("ellipse.inline.ellipse"),
            middleEllipse = anchor.select("path.ring.mid.ellipse"),
            x = context.smartControl.precisionRound(px - context.settings.resize_x),
            y = context.smartControl.precisionRound(py - context.settings.resize_y),
            m = context.settings.resize_height / context.settings.resize_width,
            ratio = context.settings.resize_height / context.settings.resize_width,
            width = context.settings.resize_width + x,
            height = context.settings.resize_height + y,
            handleWidth = parseFloat(anchor.select("rect.outline.sizeHandle.topLeft").attr("width")) / 2,
            diagonalPositionPy = context.settings.resize_y + (px - context.settings.resize_x) * m,
            ringPath;

        if (shiftKey === true) {
            if (py >= diagonalPositionPy) {
                height = context.settings.resize_height + y;
                width = height / ratio;
                x = -context.settings.resize_width + width;
                y = -context.settings.resize_height + height;
            } else {
                width = context.settings.resize_width + x;
                height = width * ratio;
                x = -context.settings.resize_width + width;
                y = -context.settings.resize_height + height;
            }
        }

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + 0 + "," + 0 + ")")
            .attr("width", width)
            .attr("height", height);

        if (outlineEllipse[0][0]) {
            outlineEllipse.attr("transform", "translate(" + x / 2 + "," + y / 2 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
        }
        if (inlineEllipse[0][0]) {
            inlineEllipse.attr("transform", "translate(" + x / 2 + "," + y / 2 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
            ringPath = context.resizeRingPath(width, height);
            middleEllipse.attr("transform", "translate(" + x / 2 + "," + y / 2 + ")")
                .attr("d", ringPath);
        }

        anchor.select("line.outline.moveHandle.horizontal").attr("transform", "translate(" + x + "," + y / 2 + ")");
        anchor.select("line.outline.moveHandle.horizontal").attr("x1", -width / 2 - x / 2);
        anchor.select("line.outline.moveHandle.horizontal").attr("x2", +width / 2 - x / 2);

        anchor.select("line.outline.moveHandle.vertical").attr("transform", "translate(" + x / 2 + "," + y + ")");
        anchor.select("line.outline.moveHandle.vertical").attr("y1", -height / 2 - y / 2);
        anchor.select("line.outline.moveHandle.vertical").attr("y2", -height / 2 - y / 2 + height);

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
        anchor.select("line.outline.orientation.line").attr("x1", -width / 2 - x / 2 + handleWidth)
            .attr("x2", width / 2 - x / 2 - handleWidth);
    }

    ///////////////////////////////////////////////////////////////////////////

    function resizeTopMid(context, _px, py) {
        var anchor = context.drawing.anchor,
            outlineEllipse = anchor.select("ellipse.outline.ellipse"),
            inlineEllipse = anchor.select("ellipse.inline.ellipse"),
            middleEllipse = anchor.select("path.ring.mid.ellipse"),
            y = context.smartControl.precisionRound(py - context.settings.resize_y),
            width = context.settings.resize_width,
            height = context.settings.resize_height - y,
            ringPath;

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + 0 + "," + y + ")")
            .attr("width", width)
            .attr("height", height);

        if (outlineEllipse[0][0]) {
            outlineEllipse.attr("transform", "translate(" + 0 + "," + y / 2 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
        }
        if (inlineEllipse[0][0]) {
            inlineEllipse.attr("transform", "translate(" + 0 + "," + y / 2 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
            ringPath = context.resizeRingPath(width, height);
            middleEllipse.attr("transform", "translate(" + 0 + "," + y / 2 + ")")
                .attr("d", ringPath);
        }

        anchor.select("line.outline.moveHandle.horizontal").attr("transform", "translate(" + 0 + "," + y / 2 + ")");

        anchor.select("line.outline.moveHandle.vertical").attr("transform", "translate(" + 0 + "," + y + ")");
        anchor.select("line.outline.moveHandle.vertical").attr("y1", -height / 2 - y / 2);
        anchor.select("line.outline.moveHandle.vertical").attr("y2", -height / 2 - y / 2 + height);

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
    }

    function resizeBottomMid(context, _px, py) {
        var anchor = context.drawing.anchor,
            outlineEllipse = anchor.select("ellipse.outline.ellipse"),
            inlineEllipse = anchor.select("ellipse.inline.ellipse"),
            middleEllipse = anchor.select("path.ring.mid.ellipse"),
            y = context.smartControl.precisionRound(py - context.settings.resize_y),
            width = context.settings.resize_width,
            height = context.settings.resize_height + y,
            ringPath;

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + 0 + "," + 0 + ")")
            .attr("width", width)
            .attr("height", height);

        if (outlineEllipse[0][0]) {
            outlineEllipse.attr("transform", "translate(" + 0 + "," + y / 2 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
        }
        if (inlineEllipse[0][0]) {
            inlineEllipse.attr("transform", "translate(" + 0 + "," + y / 2 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
            ringPath = context.resizeRingPath(width, height);
            middleEllipse.attr("transform", "translate(" + 0 + "," + y / 2 + ")")
                .attr("d", ringPath);
        }

        anchor.select("line.outline.moveHandle.horizontal").attr("transform", "translate(" + 0 + "," + y / 2 + ")");

        anchor.select("line.outline.moveHandle.vertical").attr("transform", "translate(" + 0 + "," + y + ")");
        anchor.select("line.outline.moveHandle.vertical").attr("y1", -height / 2 - y / 2);
        anchor.select("line.outline.moveHandle.vertical").attr("y2", -height / 2 - y / 2 + height);

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
    }

    function resizeRightMid(context, px, _py) {
        var anchor = context.drawing.anchor,
            outlineEllipse = anchor.select("ellipse.outline.ellipse"),
            inlineEllipse = anchor.select("ellipse.inline.ellipse"),
            middleEllipse = anchor.select("path.ring.mid.ellipse"),
            x = context.smartControl.precisionRound(px - context.settings.resize_x),
            width = context.settings.resize_width + x,
            height = context.settings.resize_height,
            handleWidth = parseFloat(anchor.select("rect.outline.sizeHandle.topLeft").attr("width")) / 2,
            ringPath;

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + 0 + "," + 0 + ")")
            .attr("width", width)
            .attr("height", height);

        if (outlineEllipse[0][0]) {
            outlineEllipse.attr("transform", "translate(" + x / 2 + "," + 0 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
        }
        if (inlineEllipse[0][0]) {
            inlineEllipse.attr("transform", "translate(" + x / 2 + "," + 0 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
            ringPath = context.resizeRingPath(width, height);
            middleEllipse.attr("transform", "translate(" + x / 2 + "," + 0 + ")")
                .attr("d", ringPath);
        }

        anchor.select("line.outline.moveHandle.horizontal").attr("transform", "translate(" + x + "," + 0 + ")");
        anchor.select("line.outline.moveHandle.horizontal").attr("x1", -width / 2 - x / 2);
        anchor.select("line.outline.moveHandle.horizontal").attr("x2", +width / 2 - x / 2);
        anchor.select("line.outline.moveHandle.vertical").attr("transform", "translate(" + x / 2 + "," + 0 + ")");

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
        anchor.select("line.outline.orientation.line").attr("x1", -width / 2 - x / 2 + handleWidth)
            .attr("x2", width / 2 - x / 2 - handleWidth);
    }

    function resizeLeftMid(context, px, _py) {
        var anchor = context.drawing.anchor,
            outlineEllipse = anchor.select("ellipse.outline.ellipse"),
            inlineEllipse = anchor.select("ellipse.inline.ellipse"),
            middleEllipse = anchor.select("path.ring.mid.ellipse"),
            x = context.smartControl.precisionRound(px - context.settings.resize_x),
            width = context.settings.resize_width - x,
            height = context.settings.resize_height,
            arrowLength = context.defaultSettings.drawing.orientationArrowLength,
            handleWidth = parseFloat(anchor.select("rect.outline.sizeHandle.topLeft").attr("width")) / 2,
            ringPath;

        if ((width < MIN_TOOL_SIZE) || (height < MIN_TOOL_SIZE)) return;

        anchor.select("rect.outline.moveHandle").attr("transform", "translate(" + x + "," + 0 + ")")
            .attr("width", width)
            .attr("height", height);

        if (outlineEllipse[0][0]) {
            outlineEllipse.attr("transform", "translate(" + x / 2 + "," + 0 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
        }
        if (inlineEllipse[0][0]) {
            inlineEllipse.attr("transform", "translate(" + x / 2 + "," + 0 + ")")
                .attr("rx", width / 2)
                .attr("ry", height / 2);
            ringPath = context.resizeRingPath(width, height);
            middleEllipse.attr("transform", "translate(" + x / 2 + "," + 0 + ")")
                .attr("d", ringPath);
        }
        anchor.select("line.outline.moveHandle.horizontal").attr("transform", "translate(" + x + "," + 0 + ")");
        anchor.select("line.outline.moveHandle.horizontal").attr("x1", width / 2 - x / 2 - width);
        anchor.select("line.outline.moveHandle.horizontal").attr("x2", width / 2 - x / 2);
        anchor.select("line.outline.moveHandle.vertical").attr("transform", "translate(" + x / 2 + "," + 0 + ")");

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
        anchor.selectAll("line.outline.orientation.arrow").attr("x1", width / 2 - x / 2 - arrowLength - handleWidth)
            .attr("x2", width / 2 - x / 2 - handleWidth);
        anchor.select("line.outline.orientation.line").attr("x2", width / 2 - x / 2 - handleWidth);
    }

    function calculateInnerEllipseParameters(context, px) {
        var innerEllipseParameters = {
            radiusX: 0,
            radiusY: 0,
            deltaX: 0
        };

        innerEllipseParameters.deltaX = context.smartControl.precisionRound(px - context.settings.resize_x);

        // the inner radii are limited by 1 and by outerRadius - 1
        innerEllipseParameters.radiusX = Math.max(1, Math.min(context.settings.resize_width / 2 - 1, context.settings.resize_width / 2 - context.settings.dragHandleStartPosX - innerEllipseParameters.deltaX));
        innerEllipseParameters.radiusY = Math.max(1, Math.min(context.settings.resize_height / 2 - 1, context.settings.resize_height / 2 - context.settings.dragHandleStartPosX - innerEllipseParameters.deltaX));
        context.defaultSettings.ring.radiusXInnerEllipse = innerEllipseParameters.radiusX;
        context.defaultSettings.ring.radiusYInnerEllipse = innerEllipseParameters.radiusY;

        return innerEllipseParameters;
    }

    function resizeInlineRing(context, px, py) {
        var anchor = context.drawing.anchor,
            inlineEllipse = anchor.select("ellipse.inline.ellipse"),
            ellipseRingFill = anchor.select("path.ring.mid.ellipse"),
            ringPath,
            innerEllipseParameters;

        innerEllipseParameters = calculateInnerEllipseParameters(context, px);
        ringPath = context.resizeInnerRingPath();

        inlineEllipse.attr("rx", innerEllipseParameters.radiusX).attr("ry", innerEllipseParameters.radiusY);
        ellipseRingFill.attr("d", ringPath);
        anchor.select("rect.inline.sizeHandle.ring").attr("transform", "translate(" + innerEllipseParameters.deltaX + "," + 0 + ")");
    }

    function startPaint(context) {
        var paintParam = {
            x: Math.floor(d3.event.x),
            y: Math.floor(d3.event.y),
            paintMode: ((d3.event.sourceEvent.buttons === 1) ? "fill" : "erase")
        };

        context.settings.xp0 = Math.floor(d3.transform(context.drawing.anchor.attr("transform")).translate[0]);
        context.settings.yp0 = Math.floor(d3.transform(context.drawing.anchor.attr("transform")).translate[1]);
        if (context.painter && (context.focus === true)) {
            context.painter.doPaint(context, paintParam);
        }
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