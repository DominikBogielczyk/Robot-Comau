/*
* Controls the usability of the widgets of the save As dialog 
*
*/
/*global define*/
define(['brease/events/BreaseEvent'], function (BreaseEvent) { 
    'use strict';
    function SaveAsDialogHandling(context) {
        this.saveAsDialogId = "mViSaveAsDialog";
        this.headerText = "Save vision application as...";
        this.errorStyle = "sTextInputStyleError";
        this.defaultStyle = "sTextInputStyle";
        this.parent = context;
    }

    var p = SaveAsDialogHandling.prototype;

    p.onSaveAsDialogContentActivated = function () {
        this.defineWidgetReferencesAndCustomEvents();
    };
    
    p.onTextInApplicationNameReady = function () {
        this.defineWidgetReferencesAndCustomEvents();
    };

    p.initializeCustomEventsForDialog = function () {
        this.resetEventBinding();
        $('#' + this.parent.settings.dialogSaveAsContentId + '_' + this.parent.settings.refIdButtonCancelDialog).on('MouseDown', function () {
            this.onMouseDownOfButtonCancelDialog();
        }.bind(this));
        $('#' + this.parent.settings.dialogSaveAsContentId + '_' + this.parent.settings.refIdButtonSaveApplication).on('MouseDown', function () {
            this.onMouseDownOfButtonSaveApplication();
        }.bind(this));
        $('#' + this.parent.settings.dialogSaveAsContentId + '_' + this.parent.settings.refIdTextInApplicationName).on('ValueChanged', function (evt) {
            this.onValueChangedOfTextInApplicationName(evt.detail.value);
        }.bind(this));
    };

    p.resetEventBinding = function () {
        $('#' + this.parent.settings.dialogSaveAsContentId + '_' + this.parent.settings.refIdButtonCancelDialog).off('MouseDown');
        $('#' + this.parent.settings.dialogSaveAsContentId + '_' + this.parent.settings.refIdButtonSaveApplication).off('MouseDown');
        $('#' + this.parent.settings.dialogSaveAsContentId + '_' + this.parent.settings.refIdTextInApplicationName).off('ValueChanged');
    };

    p.defineWidgetReferencesAndCustomEvents = function () {
        if (this.getSaveAsDialogInitialized() === false) {
            this.saveAs = {
                textOutputError: this.callExternalWidget(this.parent.settings.refIdTextOutSaveAsError),
                textInApplicationName: this.callExternalWidget(this.parent.settings.refIdTextInApplicationName),
                buttonSaveApplication: this.callExternalWidget(this.parent.settings.refIdButtonSaveApplication)
            };
            this.initializeCustomEventsForDialog();
        }
        if (this.getSaveAsDialogInitialized() === true) {
            this.setHmiVisionApplicationNameAndCheckItInViCore(this.parent.getHmiVisionApplicationName());
        }
    };

    p.setHmiVisionApplicationNameAndCheckItInViCore = function (hmiVisionApplicationName) {
        this.saveAs.textInApplicationName.setValue(hmiVisionApplicationName);
        this.checkIfNewApplicationNameIsValidInViCore(hmiVisionApplicationName);
    };

    p.getSaveAsDialogInitialized = function () {
        var saveAsDialogInitialized = false;
        if ((this.saveAs === undefined) || (this.saveAs.textOutputError === null) || (this.saveAs.textInApplicationName === null) || (this.saveAs.buttonSaveApplication === null)) { 
            saveAsDialogInitialized = false;
        } else {
            saveAsDialogInitialized = true;
        }
        return saveAsDialogInitialized;
    };

    p.onValueChangedOfTextInApplicationName = function (newApplicationName) {
        if (this.isNewApplicationNameValid(newApplicationName) === true) {
            this.checkIfNewApplicationNameIsValidInViCore(newApplicationName);
        } else {
            this.onInvalidVisionApplicationName("*Invalid format for vision application name");
        }
    };

    p.checkIfNewApplicationNameIsValidInViCore = function (newApplicationName) {
        var args = {
            NewApplicationName: newApplicationName
        };
        this.parent._callOpcUaMethod('ValidateNewApplicationName', args, 'validNewNameOfVisionApplicationInViCore');
    };

    p.validNewNameOfVisionApplicationInViCore = function (valid) {

        switch (valid.arguments.Result) {
            case 0:
                this.onValidVisionApplicationName();
                break;
            case (0xC1B400A2 >> 0):
                this.onInvalidVisionApplicationName("*Invalid format for vision application name");
                break;
            case (0xC1B400A1 >> 0):
                this.onInvalidVisionApplicationName("*The name already exists, please modify it.");
                break;
        }
    };

    p.onInvalidVisionApplicationName = function (errorMessage) {
        this.saveAs.textOutputError.setValue(errorMessage);
        this.saveAs.textOutputError.setVisible(true);
        this.saveAs.buttonSaveApplication.setEnable(false);
        this.saveAs.textInApplicationName.setStyle(this.errorStyle);
    };

    p.onValidVisionApplicationName = function () {
        this.saveAs.textOutputError.setVisible(false);
        this.saveAs.buttonSaveApplication.setEnable(true);
        this.saveAs.textInApplicationName.setStyle(this.defaultStyle);
    };

    p.isNewApplicationNameValid = function (newApplicationName) {
        var valid, regEx;

        regEx = new RegExp("^[a-zA-Z_]{1}[a-zA-Z0-9_]{0,49}$");
        if (newApplicationName.match(regEx) !== null) {
            valid = true;
        }
        else {
            valid = false;
        }
        return valid;
    };

    p.onMouseDownOfButtonSaveApplication = function () {
        this.persistVisionApplicationAs();
        this.saveAs.textInApplicationName.setValue('');
        this.saveAs.buttonSaveApplication.setEnable(false);
        this.closeSaveAsDialog();
    };

    p.persistVisionApplicationAs = function () {
        var args = {
            NewApplicationName: ''
        };
        args.NewApplicationName = this.saveAs.textInApplicationName.getValue();
        this.parent._callOpcUaMethod('PersistVisionApplicationAs', args);
        this.parent.setVisionApplicationIsSaving(true);
    };

    p.onMouseDownOfButtonCancelDialog = function () {
        this.saveAs.textOutputError.setVisible(false);
        this.saveAs.textInApplicationName.setStyle(this.defaultStyle);
        this.saveAs.textInApplicationName.setValue('');
        this.saveAs.buttonSaveApplication.setEnable(false);
        this.closeSaveAsDialog();
    };

    p.callExternalWidget = function (widgetId) {
        if (this.parent.isUnitTestEnviroment() === false) {
            return brease.callWidget(this.parent.settings.dialogSaveAsContentId + '_' + widgetId, "widget");
        } else {
            return window.fakeWidgetCaller();
        }
    };

    p.openAndInitializeSaveAsDialog = function () {
        this._initializeCustomEventForSaveAsDialog();
        brease.overlayController.openDialog(this.saveAsDialogId, undefined, undefined, undefined, undefined, this.headerText);
        if (this.getSaveAsDialogInitialized() === true) {
            this.setHmiVisionApplicationNameAndCheckItInViCore(this.parent.getHmiVisionApplicationName()); 
        }
    };

    p._initializeCustomEventForSaveAsDialog = function () {
        $(document.body).on("ContentActivated", this.parent._bind('_handleSaveAsDialogContentActivated'));
        $(document.body).on(BreaseEvent.WIDGET_READY, this.parent._bind('_handleWidgetReady')); 
    };

    p.closeSaveAsDialog = function () {
        brease.overlayController.closeDialog(this.saveAsDialogId);
    };

    return SaveAsDialogHandling;
});