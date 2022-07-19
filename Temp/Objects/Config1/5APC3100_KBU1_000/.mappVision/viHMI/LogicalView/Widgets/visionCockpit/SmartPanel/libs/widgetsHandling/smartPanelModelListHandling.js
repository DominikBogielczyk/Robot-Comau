/*
 * Controls the usability of the smartPanelParameterForm from the visualization 
 *
 */
/*global define*/
define([], function () {
    'use strict';

    function SmartPanelModelListHandling(context) {
        this.parent = context;
        this.defineWidgetReference();
    }

    var p = SmartPanelModelListHandling.prototype;

    p.defineWidgetReference = function (){
        this.smartPanelModelList = this.parent.callExternalWidget(this.parent.settings.visionFunctionModelListRefId); 
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
        this.smartPanelModelList.setHeight(height); 
    };

    return SmartPanelModelListHandling;
});