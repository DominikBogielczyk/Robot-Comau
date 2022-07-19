/*
 * Controls the usability of the smartPanelParameterForm from the visualization 
 *
 */
/*global define*/
define([], function () {
    'use strict';

    function SmartPanelParameterFormHandling(context) {
        this.parent = context;
        this.defineWidgetReference();
    }

    var p = SmartPanelParameterFormHandling.prototype;

    p.defineWidgetReference = function () {
        this.smartPanelParameterForm = {
            modelParameters: this.parent.callExternalWidget(this.parent.settings.visionFunctionModelParameterRefId)
        };
    };

    p.determinateHeight = function () {
        var height;
        if (this.parent.vfCapabilities.has("GlobalModel") === true) {   
            height = 433; 
        } else {
            height = 817;
        }
        return height;
    };

    p.setHeight = function () {
        var height;
        height = this.determinateHeight();
        this.smartPanelParameterForm.modelParameters.setHeight(height);
    };

    return SmartPanelParameterFormHandling;
});