/*
 * This class is the main class for the Pipette. 
 */
/*global define, $*/
define(['libs/d3/d3'], function (d3) {
    'use strict';
    function Pipette(renderer, smartPanel) {
        this.parent = smartPanel;
        this.renderer = renderer;
        this.drawing = {
            rootContainer: this.renderer.select('#group')
        };
        this.renderer.select("#group").on("mousedown", this.onClick.bind(this));
        this.widgetRefIds = this.defineWidgetReferences();
    }

    Pipette.prototype.defineWidgetReferences = function () {
        var widgetRefIds = {
            textOuputX: this.callExternalWidget(this.parent.settings.refIdTextOuputXForPipette),
            textOuputY: this.callExternalWidget(this.parent.settings.refIdTextOuputYForPipette),
            textOuputColor: this.callExternalWidget(this.parent.settings.refIdTextOuputColorForPipette)
        };
        return widgetRefIds;
    };

    Pipette.prototype.callExternalWidget = function (widgetId) {
        if (this.parent.isUnitTestEnviroment() === false) {
            return brease.callWidget(this.parent.settings.parentContentId + '_' + widgetId, "widget");
        } else {
            return window.fakeWidgetCaller();
        }
    };

    Pipette.prototype.click = function () {
        this.widgetRefIds.textOuputX.setValue(this.x);
        this.widgetRefIds.textOuputY.setValue(this.y);
        this.widgetRefIds.textOuputColor.setValue(this.color);
    };

    Pipette.prototype.validateCoordinatesInImage = function (x, y) {
        var check = false;
        if ((0 <= x) && (x < this.parent.imageSizes.width) && (0 <= y) && (y < this.parent.imageSizes.height)) {
            check = true;
        }
        return check;
    };

    Pipette.prototype.onClick = function () {
        var coordinates, x, y;
        if ((this.parent.getRepetitiveMode() === false) && (this.parent.getInitialComplete() === true)) {
            coordinates = d3.mouse(this.drawing.rootContainer[0][0]);
            x = Math.floor(coordinates[0]);
            y = Math.floor(coordinates[1]);
            this.x = x.toString();
            this.y = y.toString();
            if (this.validateCoordinatesInImage(this.x, this.y) === true) {
                this.parent.vsEncoder.getPixelValues(x, y);
            }
        } else {
            this.resetValues();
        }
    };

    Pipette.prototype.resetValues = function () {
        this.x = ' --';
        this.y = ' --';
        this.color = ' --';
        this.click();
    };

    return Pipette;
});