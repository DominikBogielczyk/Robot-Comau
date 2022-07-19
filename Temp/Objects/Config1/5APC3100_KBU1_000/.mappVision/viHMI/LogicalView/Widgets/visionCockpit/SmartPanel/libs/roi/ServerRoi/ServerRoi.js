/*
 * This class is the main class for all rectangular rois. 
 *
 */
/*global define*/
define(['libs/d3/d3',
    'widgets/visionCockpit/SmartPanel/libs/pixelcloud/PixelCloud',
    'widgets/visionCockpit/SmartPanel/libs/xldcloud/XldCloud',
], function (d3, PixelCloud, XldCloud) {
    'use strict';

    function ServerRoi(className,
        smartPanel,
        imageSize,
        drawSettings) {

        this.smartPanel = smartPanel;
        this.smartControl = smartPanel.smartControl;
        this.renderer = smartPanel.smartControl.renderer;
        this.drawSettings = drawSettings;
        this.className = className;
        this.selected = false;
        this.dirty = false;
        this.dataModel = {
            rois: [],
            valid: false
        };

        this.settings = {
            imageSize: imageSize,
        };

        this.drawing = {
            rootContainer: this.renderer.select('#group'),
            strokeWidth: 4
        };

        this.prepareInternalSettings();
        this.initialDraw();
    }

    ServerRoi.prototype.prepareInternalSettings = function () {
        this.settings.position = [{
            x: this.settings.imageSize.x,
            y: this.settings.imageSize.y
        }];
    };

    ServerRoi.prototype.initialDraw = function () {
        var that = this,
            strokeWidth,
            width,
            height,
            borderStyle;

        if (this.className === "ExecutionRoi") {
            strokeWidth = 6;
            borderStyle = strokeWidth + "px solid " + this.drawSettings.color.strokeColor;
            height = (this.smartPanel.el.height() - 2 * strokeWidth) + "px";
            width = (this.smartPanel.el.width() - 2 * strokeWidth) + "px";

            this.selectionFrame = $('<div>')
                .css('top', '0')
                .css('left', '0')
                .css('position', 'absolute')
                .css('visibility', 'hidden')
                .css('pointer-events', 'none')
                .css('border', borderStyle)
                .css('height', height)
                .css('width', width);
            this.smartPanel.el.append(this.selectionFrame);
        }


        this.drawing.anchor = this.drawing.rootContainer.append('g')
            .data(this.settings.position)
            .attr('class', this.className)
            .style("pointer-events", "inherit")
            .on("click", this.onClickSurface.bind(this))
            .attr('transform',
                function (d) {
                    var position_x = that.smartControl.precisionRound(d.x);
                    var position_y = that.smartControl.precisionRound(d.y);
                    return "translate(" + position_x + ", " + position_y + ")";
                });

        this.onUpdateZoomValue();
        this.redraw();
    };

    ServerRoi.prototype.dispose = function () {
        this.dataModel.rois.forEach(function (roi) {
            roi.dispose();
        });
        this.drawing.anchor.remove();

        if (this.selectionFrame) {
            this.selectionFrame.remove();
        }
    };

    ServerRoi.prototype.isSelected = function () {
        return this.selected;
    };

    ServerRoi.prototype.setSelected = function (selected) {
        this.selected = selected;
        this.redraw();
    };

    ServerRoi.prototype.getDirtyFlag = function () {
        return this.dirty;
    };

    ServerRoi.prototype.setDirtyFlag = function (status) {
        this.dirty = status;
    };

    ServerRoi.prototype.onUpdateZoomValue = function () {
        this.redraw();
    };

    ServerRoi.prototype.onClickSurface = function () {
        if (d3.event.defaultPrevented) {
            return;
        }

        if (this.className.includes("ExecutionRoi") && this.smartPanel.applicationContext.includes("edit_execut")) {
            this.setSelected(true);
        }

        if (this.className.includes("ModelRoi") && this.smartPanel.applicationContext.includes("edit_model")) {
            this.setSelected(true);
        }
    };

    ServerRoi.prototype.redraw = function () {
        if (this.smartPanel.applicationContext.includes("edit_")) {
            if (this.selectionFrame) {
                this.selectionFrame.css('visibility', 'visible');
            }
        } else {
            if (this.selectionFrame) {
                this.selectionFrame.css('visibility', 'hidden');
            }

        }
        this.updateColors();
    };

    ServerRoi.prototype.updateColors = function () {
        if (this.isSelected()) {
            if (this.selectionFrame) {
                this.selectionFrame.css('visibility', 'visible');
            } else {
                this.dataModel.rois.forEach(function (roi) {
                    roi.setSelected(true);
                });
            }
        } else {
            if (this.selectionFrame) {
                this.selectionFrame.css('visibility', 'hidden');
            } else {
                this.dataModel.rois.forEach(function (roi) {
                    roi.setSelected(false);
                });
            }
        }
    };

    ServerRoi.prototype.hide = function () {
        this.dataModel.rois.forEach(function (roi) {
            roi.hide();
        });
        if (this.selectionFrame) {
            this.selectionFrame.css('visibility', 'hidden');
        }
    };

    ServerRoi.prototype.show = function () {
        this.dataModel.rois.forEach(function (roi) {
            roi.show();
        });
        this.redraw();
    };

    ServerRoi.prototype.addRoi = function (roi) {
        this.dataModel.rois.push(roi);
    };

    ServerRoi.prototype.deleteRoiData = function () {
        var i;
        for (i = 0; i < this.dataModel.rois.length; i++) {
            this.dataModel.rois[i].dispose();
        }
        this.dataModel.rois = [];
        this.dataModel.valid = false;
    };

    ServerRoi.prototype.clearRoiData = function () {
        this.dataModel.rois.forEach(function (roi) {
            roi.hide();
        });

        this.dataModel.valid = false;
        this.redraw();
    };

    ServerRoi.prototype.setDataModelValid = function (valid) {
        this.dataModel.valid = valid;
    };

    ServerRoi.prototype.isDataModelValid = function () {
        return this.dataModel.valid;
    };

    ServerRoi.prototype.getRois = function () {
        return this.dataModel.rois;
    };

    ServerRoi.prototype.getDataModel = function () {
        return this.dataModel;
    };

    ServerRoi.prototype.decodeRoiItem = function (roiItem, drawSettings, prefix, identifier) {
        var roi,
            identifierText,
            showIdentifier;

        if (prefix && identifier) {
            identifierText = prefix + "-" + identifier;
            showIdentifier = true;
        }

        if (roiItem.type === "xld_cont") {
            roi = new XldCloud(this.smartControl,
                roiItem,
                drawSettings,
                0,
                0,
                identifierText,
                showIdentifier);
            this.dataModel.rois.push(roi);
            this.setDataModelValid(true);
            this.smartControl.panPositionObservable.subscribe(function () {
                roi.onUpdateZoomValue();
            });

        } else if (roiItem.type === "region") {
            if ((roiItem.format === "region") || (roiItem.format === "region_rle")) {
                roi = new PixelCloud(this.smartControl,
                    roiItem,
                    drawSettings,
                    0,
                    0,
                    identifierText,
                    showIdentifier);
                this.dataModel.rois.push(roi);
                this.setDataModelValid(true);
                this.smartControl.panPositionObservable.subscribe(function () {
                    roi.onUpdateZoomValue();
                });

            } else if (roiItem.format === "xld_poly") {
                roi = new XldCloud(this.smartControl,
                    roiItem,
                    drawSettings,
                    0,
                    0,
                    identifierText,
                    showIdentifier);
                this.dataModel.rois.push(roi);
                this.setDataModelValid(true);
                this.smartControl.panPositionObservable.subscribe(function () {
                    roi.onUpdateZoomValue();
                });
            }
        }
    };

    ServerRoi.prototype.getFocus = function () {
        return this.selected;
    };

    ServerRoi.prototype.showServerRoi = function () {
        this.setDataModelValid(true);
        this.show();
    };

    ServerRoi.prototype.onMouseDown = function () {};
    ServerRoi.prototype.clearSelection = function () {};
    ServerRoi.prototype.setFocus = function ( /*selected*/ ) {};
    ServerRoi.prototype.moveToFront = function () {};
    ServerRoi.prototype.moveToBottom = function () {};

    ServerRoi.prototype.rotateCounterclockwise = function ( /*rotationAngle*/ ) {};
    ServerRoi.prototype.setAngle = function ( /*angle*/ ) {};
    ServerRoi.prototype.setCenterPosition = function () {};
    ServerRoi.prototype.setWidthSameAsHeight = function () {};
    ServerRoi.prototype.setHeightSameAsWidth = function () {};
    ServerRoi.prototype.moveToPosition = function ( /*x, y*/ ) {};
    ServerRoi.prototype.updateRoi = function () {};
    ServerRoi.prototype.showHandles = function () {};
    ServerRoi.prototype.hideHandles = function () {};
    ServerRoi.prototype.hideHorizontalMidHandles = function () {};
    ServerRoi.prototype.hideVerticalMidHandles = function () {};
    ServerRoi.prototype.moveToPosition = function ( /*x, y, angle*/ ) {};
    ServerRoi.prototype.moveRelativePosition = function ( /*deltaX, deltaY*/ ) {};
    ServerRoi.prototype.onMouseMoved = function ( /*x, y*/ ) {};
    ServerRoi.prototype.onHandleDragend = function () {};

    return ServerRoi;
});