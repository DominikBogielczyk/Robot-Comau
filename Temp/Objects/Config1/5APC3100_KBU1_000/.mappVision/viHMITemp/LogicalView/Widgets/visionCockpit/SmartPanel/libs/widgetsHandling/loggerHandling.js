/*
* Controls the usability of the widgets for the logger 
*
*/
/*global define*/
define([], function () {
    'use strict';
    function LoggerHandling(context) {
        this.parent = context;
        this.widgetRefIds = this.defineWidgetReferences();
        this.setVisibleGroupBox(true);
    }

    var p = LoggerHandling.prototype;

    p.defineWidgetReferences = function () {
        var widgetRefIds = {
            warnings: {
                imagePath: this.callExternalWidgetOnHeader(this.parent.settings.refIdImageLoggerForWarnings),
                numOutCounter: this.callExternalWidgetOnHeader(this.parent.settings.refIdNumOutLoggerForWarnings)
            },
            messages: {
                imagePath: this.callExternalWidgetOnHeader(this.parent.settings.refIdImageLoggerForMessages),
                numOutCounter: this.callExternalWidgetOnHeader(this.parent.settings.refIdNumOutLoggerForMessages)
            },
            successes: {
                imagePath: this.callExternalWidgetOnHeader(this.parent.settings.refIdImageLoggerForSuccesses),
                numOutCounter: this.callExternalWidgetOnHeader(this.parent.settings.refIdNumOutLoggerForSuccesses)
            },
            errors: {
                imagePath: this.callExternalWidgetOnHeader(this.parent.settings.refIdImageLoggerForErrors),
                numOutCounter: this.callExternalWidgetOnHeader(this.parent.settings.refIdNumOutLoggerForErrors)
            }, 
            table: {
                arraySeverity: this.callExternalWidget(this.parent.settings.refIdTabItemImageLoggerForSeverity),
                arrayTime: this.callExternalWidget(this.parent.settings.refIdTabItemLoggerForTime),
                arrayDescription: this.callExternalWidget(this.parent.settings.refIdTabItemLoggerForDescription),
                arrayId: this.callExternalWidget(this.parent.settings.refIdTabItemLoggerForId)  
            },
            flyOut: this.callExternalWidget(this.parent.settings.refIdFlyOutLogger),
            button: this.callExternalWidgetOnHeader(this.parent.settings.refIdBtnLogger),
            groupBox: this.callExternalWidgetOnHeader(this.parent.settings.refIdGroupBoxLogger) 
        };
        return widgetRefIds;
    };

    p.setVisibleGroupBox = function (value) {
        this.widgetRefIds.groupBox.setVisible(value);
    };

    p.reset = function () {
        this.setValueOfButtonLogger();
        if (brease.pageController.getCurrentPage(this.parent.settings.containerId) === this.parent.settings.startPageId) {
            this.setVisibleGroupBox(false);
        }
    };
    
    p.setValueOfButtonLogger = function(){
        this.widgetRefIds.button.setValue(false);  
    };

    p.onButtonLoggerValueChanged = function (value) {
        if (value === true) {
            this.widgetRefIds.flyOut.open();
        } else {
            this.widgetRefIds.flyOut.close();
        }
    };

    p.callExternalWidgetOnHeader = function (widgetId) {
        if (this.parent.isUnitTestEnviroment() === false) {
            return brease.callWidget(this.parent.settings.headerContentId + '_' + widgetId, "widget");
        } else {
            return window.fakeWidgetCaller();
        }
    };

    p.callExternalWidget = function (widgetId) {
        if (this.parent.isUnitTestEnviroment() === false) {
            return brease.callWidget(this.parent.settings.parentContentId + '_' + widgetId, "widget");
        } else {
            return window.fakeWidgetCaller();
        }
    };

    p.setLoggerArrayId = function(loggerArrayId) {
        this.widgetRefIds.table.arrayId.setStringValue(loggerArrayId);   
    };

    p.setLoggerArrayTime = function(loggerArrayTime) {
        this.widgetRefIds.table.arrayTime.setStringValue(loggerArrayTime);  
    };

    p.setLoggerArrayDescription = function(loggerArrayDescription) {
        this.widgetRefIds.table.arrayDescription.setStringValue(loggerArrayDescription);  
    };

    p.setLoggerArraySeverity = function(loggerArraySeverity) {
        this.widgetRefIds.table.arraySeverity.setSelectedIndex(loggerArraySeverity); 
    };

    p.setLoggerCounterOfErrors = function(loggerCounterOfErrors) {
        this.widgetRefIds.errors.numOutCounter.setValue(loggerCounterOfErrors); 
    };

    p.setLoggerCounterOfWarnings = function(loggerCounterOfWarnings) {
        this.widgetRefIds.warnings.numOutCounter.setValue(loggerCounterOfWarnings);  
    };

    p.setLoggerCounterOfSuccesses = function(loggerCounterOfSuccesses) {
        this.widgetRefIds.successes.numOutCounter.setValue(loggerCounterOfSuccesses);   
    };

    p.setLoggerCounterOfInformations = function(loggerCounterOfInformations) {
        this.widgetRefIds.messages.numOutCounter.setValue(loggerCounterOfInformations);    
    };

    p.setLoggerImagesAndStyleOfNumericInputsOfSeverities = function (loggerArraySeverity) {
        var loggerImagePathErrorWithColor = 'Media/mappVision/icons/loggerSeverity/color/icon_error.svg',
            loggerImagePathErrorWithoutColor = 'Media/mappVision/icons/loggerSeverity/gray/icon_error.svg',
            loggerImagePathWarningWithColor = 'Media/mappVision/icons/loggerSeverity/color/icon_warning.svg',
            loggerImagePathWarningWithoutColor = 'Media/mappVision/icons/loggerSeverity/gray/icon_warning.svg',
            loggerImagePathInfoWithColor = 'Media/mappVision/icons/loggerSeverity/color/icon_info.svg',
            loggerImagePathInfoWithoutColor = 'Media/mappVision/icons/loggerSeverity/gray/icon_info.svg',
            loggerImagePathSuccessWithColor = 'Media/mappVision/icons/loggerSeverity/color/icon_success.svg',
            loggerImagePathSuccessWithoutColor = 'Media/mappVision/icons/loggerSeverity/gray/icon_success.svg';


        var loggerImagePathErrorToSet = loggerImagePathErrorWithoutColor,
            loggerImagePathWarningToSet = loggerImagePathWarningWithoutColor,
            loggerImagePathSuccessToSet = loggerImagePathSuccessWithoutColor,
            loggerImagePathInfoToSet = loggerImagePathInfoWithoutColor;

        var loggerNumOuthWarningtyleToSet = 'sloggerGrayrNumericOutput',
            loggerNumOutErrorStyleToSet = 'sloggerGrayrNumericOutput',
            loggerNumOutInfoStyleToSet = 'sloggerGrayrNumericOutput',
            loggerNumOutSuccessStyleToSet = 'sloggerGrayrNumericOutput';

        loggerArraySeverity.forEach(function (entry) {
            switch (entry) {
                case "Information":
                    loggerImagePathInfoToSet = loggerImagePathInfoWithColor;
                    loggerNumOutInfoStyleToSet = 'sloggerInfoNumericOutput';
                    break;
                case "Success":
                    loggerImagePathSuccessToSet = loggerImagePathSuccessWithColor;
                    loggerNumOutSuccessStyleToSet = 'sloggerSuccessNumericOutput';
                    break;
                case "Warning":
                    loggerImagePathWarningToSet = loggerImagePathWarningWithColor;
                    loggerNumOuthWarningtyleToSet = 'sloggerWarningNumericOutput';
                    break;
                case "Error":
                    loggerImagePathErrorToSet = loggerImagePathErrorWithColor;
                    loggerNumOutErrorStyleToSet = 'sloggerErrorNumericOutput';
                    break;
            }
        });
        this.widgetRefIds.warnings.imagePath.setImage(loggerImagePathWarningToSet);
        this.widgetRefIds.errors.imagePath.setImage(loggerImagePathErrorToSet);
        this.widgetRefIds.messages.imagePath.setImage(loggerImagePathInfoToSet);
        this.widgetRefIds.successes.imagePath.setImage(loggerImagePathSuccessToSet);

        this.widgetRefIds.errors.numOutCounter.setStyle(loggerNumOutErrorStyleToSet);
        this.widgetRefIds.warnings.numOutCounter.setStyle(loggerNumOuthWarningtyleToSet);
        this.widgetRefIds.messages.numOutCounter.setStyle(loggerNumOutInfoStyleToSet);
        this.widgetRefIds.successes.numOutCounter.setStyle(loggerNumOutSuccessStyleToSet);
    };
    return LoggerHandling;
});