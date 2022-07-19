/*
* Controls the usability of the confirmation dialog
*
*/
/*global define*/
define([], function () {
    'use strict';
    function ConfirmationDialog(context) {
        this.saveAsDialogId = "mViSaveAsDialog";
        this.headerText = "Save Application As";
        this.errorStyle = "sTextInputStyleError";
        this.defaultStyle = "sTextInputStyle";
        this.parent = context;
    }

    var p = ConfirmationDialog.prototype;

    p.showDeleteVisionApplicationDialog = function () {
        var dialogPromise,
            messageBoxType = "YesNo",
            headerText = "Vision Application",
            messageText = "Do you really want to delete the selected vision application?",
            messageBoxIcon = "Warning",
            buttonClickYes = 1,
            style = "viHMIDefault",
            that = this;

        dialogPromise = brease.overlayController.showMessageBox(messageBoxType, headerText, messageText, messageBoxIcon, undefined, style);

        $.when(dialogPromise.promise()).then(function (result) {
            if (result === buttonClickYes) {
                that.deleteSelectedVisionApplication();
            }
        });
    };
    
    p.deleteSelectedVisionApplication = function () {
        var args = {
            "ApplicationName": this.parent.settings.visionApplicationToDelete
        };
        this.parent.setVisionApplicationIsDeleting(true);
        this.parent._callOpcUaMethod('DeleteVisionApplication', args, undefined);
    };


    p.showOverwriteActiveVisionApplicationDialog = function () {
        var dialogPromise,
            messageBoxType = "YesNo",
            headerText = "Vision Application",
            messageText = "Do you really want to overwrite the vision application currently active on this camera module?",
            messageBoxIcon = "Warning",
            buttonClickYes = 1,
            style = "viHMIDefault",
            that = this;

        dialogPromise = brease.overlayController.showMessageBox(messageBoxType, headerText, messageText, messageBoxIcon, undefined, style);

        $.when(dialogPromise.promise()).then(function (result) {
            if (result === buttonClickYes) {
                that.overwriteActiveVisionApplication();
            } else {
                that.cancelOverwriteActiveVisionApplication();
            }
        });
        return dialogPromise;
    };

    p.overwriteActiveVisionApplication = function () {
        this.parent.persistVisionApplication();
    };

    p.cancelOverwriteActiveVisionApplication = function () {
    };

    return ConfirmationDialog;
});