/*global define*/
define([], function () {
    'use strict';

    function GlobalModelHandling(context) {
        this.parent = context;
        this.setGlobalModelInitialized(false);
        this.widgetStatus = this.defineWidgetVisibleStatus();
    }

    var p = GlobalModelHandling.prototype;

    p.defineWidgetReferences = function () {
        if (this.getGlobalModelInitialized() === false) {
            this.smartPanelParameterFormGlobalModel = this.parent.callExternalWidget(this.parent.settings.visionFunctionGlobalModel);
            this.globalModel = {
                numericInputs: {
                    target: this.callExternalWidget(this.getNumericInputIdForTarget()),
                    reference: this.callExternalWidget(this.getNumericInputIdForReference()),
                },
                labels: {
                    target: this.callExternalWidget(this.getLabelIdForTarget()),
                    reference: this.callExternalWidget(this.getLabelIdForReference()),
                }
            };
            this.setGlobalModelInitialized(true);
        }
    };

    p.setVisibleOfGroupBoxGlobaleModel = function (value) {
        if (this.parent.isUnitTestEnviroment() !== true) {
            this.parent._callExternalWidget(this.parent.settings.parentContentId + '_' + this.parent.settings.groupBoxGlobaleModel, 'setVisible', value);
        }
    };

    p.getNumericInputIdForTarget = function () {
        var index = 0, widgetId,
            lengthOfLabelElements = this.smartPanelParameterFormGlobalModel.labelElements.length;

        for (index = 0; index < lengthOfLabelElements; index++) {
            if (this.smartPanelParameterFormGlobalModel.labelElements[index].options.text === "Target") {
                widgetId = this.smartPanelParameterFormGlobalModel.inputElements[index].id;
                break;
            }
        }
        return widgetId;
    };

    p.getLabelIdForReference = function () {
        var index = 0, widgetId,
            lengthOfLabelElements = this.smartPanelParameterFormGlobalModel.labelElements.length;

        for (index = 0; index < lengthOfLabelElements; index++) {
            if (this.smartPanelParameterFormGlobalModel.labelElements[index].options.text === "Reference") {
                widgetId = this.smartPanelParameterFormGlobalModel.labelElements[index].id;
                break;
            }
        }
        return widgetId;
    };

    p.getLabelIdForTarget = function () {
        var index = 0, widgetId,
            lengthOfLabelElements = this.smartPanelParameterFormGlobalModel.labelElements.length;

        for (index = 0; index < lengthOfLabelElements; index++) {
            if (this.smartPanelParameterFormGlobalModel.labelElements[index].options.text === "Target") {
                widgetId = this.smartPanelParameterFormGlobalModel.labelElements[index].id;
                break;
            }
        }
        return widgetId;
    };

    p.setVisibleOfGlobalModelInputs = function (selectedOperation) {
        var status;
        var refIds = this.globalModel;
        status = this.determineWidgetsStatus(selectedOperation);

        refIds.numericInputs.target.setVisible(status.target);
        refIds.numericInputs.reference.setVisible(status.reference);
        refIds.labels.target.setVisible(status.target);
        refIds.labels.reference.setVisible(status.reference);

    };

    p.resetValueOfNumericInputs = function () {
        var refIds = this.globalModel;
        refIds.numericInputs.target.setValue(0);
        refIds.numericInputs.reference.setValue(0);
    };

    p.resetValueOfSettingsParameters = function () {
        var params= this.smartPanelParameterFormGlobalModel.settings.parameters;
        if(params) {
           params.forEach(function(param){
               if(param.value){
                 param.value = 0;
               }
            });
        }
    };

    p.determineWidgetsStatus = function (selectedOperation) {
        var status = this.widgetStatus;

        status.target = this.determineVisibleStatusOfTarget(selectedOperation);
        status.reference = this.determineVisibleStatusOfReference(selectedOperation);
        return status;
    };

    p.setCapabilityMetaInfoOperations = function (operations) {
        this.dataOperationsMap = operations;
    };


    p.determineVisibleStatusOfTarget = function (selectedOperation) {
        var status = false;
        if (selectedOperation !== undefined) {
            if (this.dataOperationsMap.get(selectedOperation).Target === "true") {
                status = true;
            }
        }
        return status;
    };

    p.determineVisibleStatusOfReference = function (selectedOperation) {
        var status = false;
        if (selectedOperation !== undefined) {
            if (this.dataOperationsMap.get(selectedOperation).Reference === "true") {
                status = true;
            }
        }
        return status;
    };

    p.defineWidgetVisibleStatus = function () {
        var enableStatus = {
            numericInputs: {
                target: false,
                reference: false,
            }
        };
        return enableStatus;
    };

    p.onSelectedIndexOfAddMeasurement = function (selectedOperation) {
        if (selectedOperation !== this.parent.settings.defaultOperation.value) {
            this.resetValueOfNumericInputs();
            this.resetValueOfSettingsParameters();
            this.setVisibleOfGlobalModelInputs(selectedOperation);
            this.addGlobalModelEntry(selectedOperation);
            this.parent.widgetsHandling.setDefaultValueOfOperationForGlobalModel();
        }
    };

    p.getNumericInputIdForReference = function () {
        var index = 0, widgetId,
            lengthOfLabelElements = this.smartPanelParameterFormGlobalModel.labelElements.length;

        for (index = 0; index < lengthOfLabelElements; index++) {
            if (this.smartPanelParameterFormGlobalModel.labelElements[index].options.text === "Reference") {
                widgetId = this.smartPanelParameterFormGlobalModel.inputElements[index].id;
                break;
            }
        }
        return widgetId;
    };

    p.setMaxValueOfNumericInputIdForReference = function () {
        var maxValue = 0;
        maxValue = this.parent.smartPanelModelList.getMinAndMaxValueIdOfPersistedModels().max;
        this.globalModel.numericInputs.reference.setMaxValue(maxValue);
    };

    p.setMinValueOfNumericInputIdForReference = function () {
        var minValue = 0;
        minValue = this.parent.smartPanelModelList.getMinAndMaxValueIdOfPersistedModels().min;
        this.globalModel.numericInputs.reference.setMinValue(minValue);
    };

    p.setMinValueOfNumericInputIdForTarget = function () {
        var minValue = 0;
        minValue = this.parent.smartPanelModelList.getMinAndMaxValueIdOfPersistedModels().min;
        this.globalModel.numericInputs.target.setMinValue(minValue);
    };

    p.setMaxValueOfNumericInputIdForTarget = function () {
        var maxValue = 0;
        maxValue = this.parent.smartPanelModelList.getMinAndMaxValueIdOfPersistedModels().max;
        this.globalModel.numericInputs.target.setMaxValue(maxValue);
    };

    p.updateValueRangesAndVisibilityofGlobalModel = function () {
        if (this.getGlobalModelInitialized() === false) {
            this.defineWidgetReferences();
        }
        this.setMinAndMaxValueOfNumericInputsForReferenceAndTarget();
        this.setVisibleOfGlobalModelInputs();
    };

    p.setMinAndMaxValueOfNumericInputsForReferenceAndTarget = function () {
        this.setMaxValueOfNumericInputIdForReference();
        this.setMinValueOfNumericInputIdForReference();
        this.setMaxValueOfNumericInputIdForTarget();
        this.setMinValueOfNumericInputIdForTarget();
    };

    p.callExternalWidget = function (widgetId) {
        if (this.parent.isUnitTestEnviroment() === false) {
            return brease.callWidget(widgetId, "widget");
        } else {
            return window.fakeWidgetCaller();
        }
    };

    p.setGlobalModelInitialized = function (valid) {
        this.globalModelInitialized = valid;
    };

    p.getGlobalModelInitialized = function () {
        return this.globalModelInitialized;
    };

    p.onClickGlobalModelListSelectionChanged = function (tableIndex) {
        var modelEntries,
            tableEntry,
            globalModelData;

        this.parent.settings.selectedGlobalModelId = tableIndex;
        if (tableIndex != undefined) {
            modelEntries = this.parent.smartPanelGlobalModelList.getModelData();
            if (modelEntries && modelEntries.length && (tableIndex >= 1) && (modelEntries.length >= tableIndex)) {
                tableEntry = modelEntries[tableIndex - 1];
                globalModelData = {
                    "Operation": tableEntry.metaData[0],
                    "ModelReference": tableEntry.metaData[1],
                    "ModelTarget": tableEntry.metaData[2]
                };
                this.parent.ingnoredEventParameterValueChanged = true;
                this.parent.paramHandler.setVisionFunctionGlobalModelParameters(globalModelData);
                this.parent.ingnoredEventParameterValueChanged = false;
            }
        }
        this.parent.updateButtonStates();
        this.setVisibleOfGlobalModelInputs(globalModelData.Operation);
    };

    p.onGlobalModelListSelectionChanged = function (tableIndex) {
        var modelEntries,
            tableEntry,
            globalModelInstance = 1;

        this.parent.settings.selectedGlobalModelId = tableIndex;
        if (tableIndex != undefined) {
            modelEntries = this.parent.settings.vfGlobalModels.get(globalModelInstance);
            if (modelEntries && modelEntries.length && (tableIndex >= 1) && (modelEntries.length >= tableIndex)) {
                tableEntry = modelEntries[tableIndex - 1];
                this.parent.paramHandler.setVisionFunctionGlobalModelParameters(tableEntry);
            }
        }
    };

    p.addGlobalModelEntry = function (selectedOperation) {
        var globalModelData = [],
            that = this,
            globalModelNumber = 1,
            index = 0,
            operation,
            modelReference,
            modelTarget,
            widgetParameter,
            modelEntries = that.parent.settings.vfGlobalModels.get(globalModelNumber);

        if (modelEntries != undefined) {
            modelEntries.forEach(function (model) {
                index = model.Id;
                operation = model.Operation;

                globalModelData.push({
                    "Id": model.Id,
                    "metaData": [model.Operation, model.ModelReference, model.ModelTarget, ""],
                    "isPersisted": true,
                    "isSelected": false
                });
            });
        }

        globalModelData.push({
            "Id": index + 1,
            "metaData": [operation, 0, 0, ""],
            "isPersisted": false,
            "isSelected": false
        });

        this.parent.smartPanelGlobalModelList.setModelData(globalModelData);
        this.parent.smartPanelGlobalModelList.selectAllNotPersistedModels();

        widgetParameter = this.parent.paramHandler.getVisionFunctionGlobalModel();

        operation = selectedOperation;
        modelReference = 0;
        modelTarget = 0;

        this.parent.smartPanelGlobalModelList.setMetaDataOfModel(this.parent.getSelectedGlobalModelId(), [operation, modelReference, modelTarget, ""]);
        this.parent.smartPanelGlobalModelList._selectRow(this.parent.getSelectedGlobalModelId());
        this.parent.smartPanelGlobalModelList.setSelectedModelLock(true);
        this.parent.updateButtonStates();
    };

    function getValueOfReference(element) {
        return element.Reference !== undefined;
    }

    function getValueOfTarget(element) {
        return element.Target !== undefined;
    }

    p.clearGlobalModelList = function () {
        this.parent.settings.vfGlobalModels.clear();
    };

    p.updateGlobalModelList = function (models) {
        var modelType,
            globalModelData = [],
            index = 0,
            modelParams,
            operations = [],
            references = [],
            targets = [],
            parent = this.parent;
        this.clearGlobalModelList();
        models.forEach(function (model) {
            if (model.model_number === 0) {
                parent.settings.vfGlobalModels.set(model.model_number, globalModelData);
            } else if (model.model_number === 1) {
                modelType = model.model_type;

                if (modelType === "relation") {
                    modelParams = model.model_params;
                    operations = modelParams[0].Operation;
                    references = modelParams[1].ModelReference;
                    targets = modelParams[2].ModelTarget;

                    if (Array.isArray(operations)) {
                        for (index = 0; index < operations.length; index++) {
                            globalModelData.push({
                                "Id": index + 1,
                                "Operation": operations[index],
                                "ModelReference": references[index],
                                "ModelTarget": targets[index]
                            });
                        }
                    } else {
                        globalModelData.push({
                            "Id": 1,
                            "Operation": operations,
                            "ModelReference": references,
                            "ModelTarget": targets
                        });
                    }
                }
                parent.settings.vfGlobalModels.set(model.model_number, globalModelData);
            }
        });
        this.updateGlobalModelViewList();
    };

    p._updateParametersGlobalModelList = function () {
        var widgetParameter, operation, modelReference, modelTarget, selectedGlobalModelId;
        this.parent.smartPanelGlobalModelList.setSelectedModelLock(true);
        selectedGlobalModelId = this.parent.getSelectedGlobalModelId();
        widgetParameter = this.parent.paramHandler.getVisionFunctionGlobalModel();
        operation = this.parent.smartPanelGlobalModelList.getDefinedOperation(selectedGlobalModelId);
        modelReference = this.globalModel.numericInputs.reference.getValue();
        modelTarget = this.globalModel.numericInputs.target.getValue();
        this.parent.smartPanelGlobalModelList.setMetaDataOfModel(this.parent.getSelectedGlobalModelId(), [operation, modelReference, modelTarget, ""]);
        this.parent.smartPanelGlobalModelList._selectRow(this.parent.getSelectedGlobalModelId());
        this.parent.updateButtonStates();
    };

    p.updateGlobalModelFromViewModel = function () {
        var viewModel = this.parent.smartPanelGlobalModelList.getModelData(),
            globalModelNumber = 1,
            globalModelData = [];

        viewModel.forEach(function (row) {
            globalModelData.push({
                "Id": row.Id,
                "Operation": row.metaData[0],
                "ModelReference": row.metaData[1],
                "ModelTarget": row.metaData[2]
            });
        });
        this.parent.settings.vfGlobalModels.set(globalModelNumber, globalModelData);
    };

    p.updateGlobalModelViewList = function () {
        var globalModelData = [],
            that = this,
            globalModelNumber = 1,
            initialModelNumber = 0,
            modelEntries = that.parent.settings.vfGlobalModels.get(globalModelNumber);

        if (modelEntries) {
            if ( modelEntries.length>0 && modelEntries[initialModelNumber].Operation.length === 0) {  
                that.parent.smartPanelGlobalModelList.removeModels();
            } else {
                modelEntries.forEach(function (model) {
                    globalModelData.push({
                        "Id": model.Id,
                        "metaData": [model.Operation, model.ModelReference, model.ModelTarget, ""],
                        "isPersisted": true,
                        "isSelected": false
                    });
                });
                that.parent.smartPanelGlobalModelList.setModelData(globalModelData);
            }
        } else {
            that.parent.smartPanelGlobalModelList.removeModels();
        }
    };


    return GlobalModelHandling;
});