
/*global define*/
define([], function () {
    'use strict';

    function VisionAplicationNavigation(context) {
        this.parent = context;
        this.defineWidgetReference();
    }

    var p = VisionAplicationNavigation.prototype;

    p.defineWidgetReference = function () {
        this.dropDownBox = {
            visionAplication: {
                navigation: this.parent.callWidgetOnContent(this.parent.settings.refIdDropDownBoxVisionApplicationNavigation, this.parent.settings.headerContentId),
            }
        };
    };

    p.setDataProviderNavigationVisionApplication = function (visionFunctionsName) {
        var visionFunction, visionFunctionIndex;
        this.parent.settings.visionAplicationNavigation = [{
            "value": this.parent.settings.imageAcquisitionName,
            "text": this.parent.settings.imageAcquisitionName
        }];

        if (Array.isArray(visionFunctionsName)) {
            for (visionFunctionIndex = 0; visionFunctionIndex < visionFunctionsName.length; visionFunctionIndex++) {
                visionFunction = {
                    "value": visionFunctionsName[visionFunctionIndex],
                    "text": visionFunctionsName[visionFunctionIndex]
                };
                this.parent.settings.visionAplicationNavigation.push(visionFunction);
            }
        }
        this.dropDownBox.visionAplication.navigation.setDataProvider(this.parent.settings.visionAplicationNavigation);
    };

    p.getSelectedValueOfVisionApplicationNavigation = function () {
        return (this.dropDownBox.visionAplication.navigation.getSelectedValue());
    };

    p.onSelectedIndexOfVisionApplicationNavigationChanged = function (name, selectedIndex) {
        this.parent.setSelectedVisionFunction(name);
        this.parent.setVisionFunctionInstance(selectedIndex); 
        this.initalizeVf(name);
    };

    p.initalizeVf = function (name) {
        if (name !== this.parent.settings.imageAcquisitionName) {  
            this.parent.widgetsHandling.setVisionRoiTab();
            this.parent.resultFilter.resetSelectorList();
            var that = this;
            this.parent.setVisionFuntionStartupSequenceStarted(true);
            
            this.parent.informationOfGetStateInformationLoaded = $.Deferred();
            this.parent.configFileVisionFunctionLoaded = $.Deferred();
            
            $.when(this.parent.configFileVisionFunctionLoaded.promise())
                .then(function successHandler(vfConfigXml) {
                    that.parent._loadVisionFunctionSuccessHandler(vfConfigXml);
                    that.parent.vsEncoder.getState(); 
                    that.visionFuncionConfigXml = vfConfigXml; 
                });
            $.when(this.parent.informationOfGetStateInformationLoaded.promise())
                .then(function successHandler(message) {
                    that.parent.paramHandler.init(that.visionFuncionConfigXml.documentElement); 
                    that.parent._updateParamsFromGetStateWhenFormIsReady(message);
                    that.parent.updateExternalWidgets(); 
                });
            this.parent._loadVisionFunction();
        } else{
            this.parent.widgetsHandling.setImageModeTabItem();
        }
    };

    return VisionAplicationNavigation;
});