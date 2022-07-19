/*
* Controls the usability of the Group Boxes from the visualization 
*
*/
/*global define*/
define([], function () {
    'use strict';
    function GroupBoxesHandling(context) {
        this.parent = context;
    }

    var p = GroupBoxesHandling.prototype;

    p.updateGroupBoxesState = function () {
        var selectedVisionFunction = this.parent.settings.selectedVisionFunction,
            parentContentId = this.parent.settings.parentContentId,
            visibilityGroupBox = { ImageAcquisition: false, GenericVisionFuntion: false };

        switch (selectedVisionFunction) {
            case "Image Acquisition":
                visibilityGroupBox.ImageAcquisition = true;
                visibilityGroupBox.GenericVisionFuntion = false;
                break;
            default:
                visibilityGroupBox.ImageAcquisition = false;
                visibilityGroupBox.GenericVisionFuntion = true;
                break;
        }
        if (this.parent.isUnitTestEnviroment() !== true) {
            this.parent._callExternalWidget(parentContentId + '_' + this.parent.settings.refIdGroupBoxImageAcquisition, 'setVisible', visibilityGroupBox.ImageAcquisition);
            this.parent._callExternalWidget(parentContentId + '_' + this.parent.settings.refIdGroupBoxGenericVisionFuntion, 'setVisible', visibilityGroupBox.GenericVisionFuntion);
        }
    };

    p.enableParametersGroupBox = function (valueOfParameterMode) {
        var parentContentId = this.parent.settings.parentContentId,
            enable, valueOfUserDefinedParameter;

        valueOfUserDefinedParameter = this.parent.vpDataProvider.getUserDefinedParameterMode();

        if ((undefined === valueOfUserDefinedParameter) || (valueOfParameterMode === valueOfUserDefinedParameter)) {
            enable = true;
        } else {
            enable = false;
        }

        this.parent._callExternalWidget(parentContentId + '_' + this.parent.settings.refIdGroupBoxVisionParameters, 'setEnable', enable);
    };

    return GroupBoxesHandling;
});