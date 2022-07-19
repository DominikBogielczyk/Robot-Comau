/*
 * Controls the usability of the widgets from the visualization 
 *
 */
/*global define*/
define([], function () {
    'use strict';

    function WidgetsHandling(context) {
        var statusToSet,
            updateInterval = 100,
            that = this;

        this.parent = context;
        this.triggerUpdate = false;
        this.widgetRefIds = this.defineWidgetReferences();
        this.widgetStatus = this.defineWidgetEnableStatus();

        this.updateTimer = setInterval(function () {
            if (that.triggerUpdate === true) {
                statusToSet = that.determineWidgetsStatus(that.parent.settings.statusReady);
                that.updateWidgets(statusToSet);
                that.triggerUpdate = false;
            }
        }, updateInterval);
    }

    var p = WidgetsHandling.prototype;

    p.dispose = function () {
        clearInterval(this.updateTimer);
    };

    p.defineWidgetReferences = function () {
        var widgetRefIds = {
            imageAcquisition: {
                parameterFormForLightAndFocus: this.callExternalWidget(this.parent.settings.refIdParameterFormForLightAndFocus),
                parameterFormForExtendedParameter: this.callExternalWidget(this.parent.settings.refIdParameterFormForExtendedParameter),
                parameterFormForSettings: this.callExternalWidget(this.parent.settings.refIdParameterFormForImageAcquisitionSettings)
            },
            menuPanel: {
                imageCapture: this.callExternalWidget(this.parent.settings.refIdButtonImageCapture),
                repetitiveCapture: this.callExternalWidget(this.parent.settings.refIdButtonRepetitiveMode),
                execute: this.callExternalWidget(this.parent.settings.refIdButtonExecute),
                edit: this.callExternalWidget(this.parent.settings.refIdButtonEditTool)
            },
            lineSensor: {
                buttonNormalImage: this.callExternalWidget(this.parent.settings.refIdtglBtnLineSensorNormalImage),
                groupBoxForConfiguration: this.callExternalWidget(this.parent.settings.refIdGroupBoxForLineSensor),
                parameterFormForLineSensor: this.callExternalWidget(this.parent.settings.refIdParameterFormForLineSensor)    
            },
            filter: {
                tabItem: this.callExternalWidget(this.parent.settings.refIdTabItemFilter),
                selectorList:  this.callExternalWidget(this.parent.settings.refIdSelectorListForFilter),
                imageSelectorFilter: this.callExternalWidget(this.parent.settings.refIdImageSelectorFilter),
                textOutputSelectorFilter: this.callExternalWidget(this.parent.settings.refIdTextOutputSelectorFilter),
                dropDownBoxForSortProcessVariables: this.callExternalWidget(this.parent.settings.refIdDropDownBoxForSortProcessVariables),
                processVariablesList: this.callExternalWidget(this.parent.settings.visionFunctionVariablesRefId)
            },
            imageMode: {
                tabItem: this.callExternalWidget(this.parent.settings.refIdTabItemImageMode),
            },
            dummyTab: {
                tabItem: this.callExternalWidget(this.parent.settings.refIdDummyTab),
            },
            menuTool: {
                toolList: this.callExternalWidget(this.parent.settings.refIdDropDownBoxToolList),
                commandList: this.callExternalWidget(this.parent.settings.refIdDropDownBoxRoiCommands),
                manipulation: this.callExternalWidget(this.parent.settings.refIdDropDownBoxForTheRoiManipulation),
                roiToolsTab: this.callExternalWidget(this.parent.settings.refIdTabControlRoiTools),
                roiToolsTabItem: this.callExternalWidget(this.parent.settings.refIdTabItemRoiTools)
            },
            menuModels: {
                modelType: this.callExternalWidget(this.parent.settings.refIdDropDownBoxModelType),
                teach: this.callExternalWidget(this.parent.settings.refIdButtonTeach),
                marker: this.callExternalWidget(this.parent.settings.refIdEditMarker),
                delete: this.callExternalWidget(this.parent.settings.refIdButtonDelete),
                modelParametersList: this.callExternalWidget(this.parent.settings.refIdSmartPanelParameterFormModelParameters),
            },
            visionFunctionParameters: {
                parameters: this.callExternalWidget(this.parent.settings.visionFunctionParametersRefId),
                processVaribles: this.callExternalWidget(this.parent.settings.refIdParameterFormForProcessVaribles)
            },
            tabVisionFunctionModels: {
                visionFunctionTab: this.callExternalWidget(this.parent.settings.refIdTabItemVisionFunction),
                modelsTab: this.callExternalWidget(this.parent.settings.refIdTabItemVisionModels),
                visionFuntionAndModelsTabControl: this.callExternalWidget(this.parent.settings.refIdVfModelsTabControl),
            },
            menuApplication: {
                visionComponentSelector: this.parent.callWidgetOnContent(this.parent.settings.refIdDropDownBoxComponentList, this.parent.settings.headerContentId),
                visionFunctionSelector: this.parent.callWidgetOnContent(this.parent.settings.refIdDropDownBoxVisionApplicationNavigation, this.parent.settings.headerContentId),
                logoutButton: this.parent.callWidgetOnContent(this.parent.settings.refIdLogoutButton, this.parent.settings.headerContentId),
                hmiVisionApplicationName: this.parent.callWidgetOnContent(this.parent.settings.refIdLabelForHMIVisionApplicationName, this.parent.settings.headerContentId),
                imageVisionApplication: this.parent.callWidgetOnContent(this.parent.settings.refIdImageVisionApplication, this.parent.settings.headerContentId),
                overlay: this.callExternalWidget(this.parent.settings.refIdtextOutputOverlay),
            },
            menuGlobalModels: {
                addMeasurement: this.callExternalWidget(this.parent.settings.refIdDropDownBoxAddMeasurement),
                removeMeasurement: this.callExternalWidget(this.parent.settings.refIdRemoveMeasurement),
                saveGlobalModel: this.callExternalWidget(this.parent.settings.refIdButtonSaveGlobalModel),
                measurementDefinition: this.callExternalWidget(this.parent.settings.refIdSmartPanelGlobalModelListMeasurementDef),
            },
            visionApplication: {
                dropDownBoxForLoad: this.callExternalWidget(this.parent.settings.refIdDropDownBoxForLoad),
                dropDownBoxForSave: this.callExternalWidget(this.parent.settings.refIdDropDownBoxForSave),
                dropDownBoxForDelete: this.callExternalWidget(this.parent.settings.refIdDropDownBoxForDelete),
            }, 
        };
        return widgetRefIds;
    };

    p.defineWidgetEnableStatus = function () {
        var enableStatus = {
            imageAcquisition: {
                parameterFormForLightAndFocus: {
                    enableStatus: false
                },
                extendedParameter: {
                    enableStatus: false
                },
                parameterFormForSettings: {
                    enableStatus: false
                }
            },
            menuPanel: {
                imageCapture: false,
                repetitiveCapture: {
                    enableStatus: false,
                    visibleStatus: false
                },
                execute: false,
                edit: {
                    enableStatus: false,
                    visibleStatus: true
                }
            },
            lineSensor: {
                buttonNormalImage:{
                    enableStatus: false,
                    visibleStatus: false
                }, 
                groupBoxForConfiguration: {
                    visibleStatus: false
                },
                parameterForm: {
                    enableStatus: false
                }
            },
            filter: {
                tabItem: false,
                selectorList: false,
                textOutputSelectorFilter: false,
                imageSelectorFilter: false
            },
            dummyTab: {
                tabItem: false,
            },
            imageMode: {
                tabItem: false,
            },
            menuTool: {
                toolList: false,
                commandList: false,
                manipulation: false,
                roiToolsTabItem: false
            },
            menuModels: {
                modelType: false,
                teach: false,
                marker: {
                    enableStatus: true,
                    visibleStatus: true
                },
                delete: false,
                modelParametersList: true,
            },
            visionFunctionParameters: {
                parameters: false,
                processVaribles: {
                    enableStatus: false,
                },
            },
            tabVisionFunctionModels: {
                visionFunctionTab: {
                    enableStatus: true,
                    visibleStatus: true
                },
                modelsTab: {
                    enableStatus: true,
                    visibleStatus: true
                }
            },
            menuApplication: {
                visionComponentSelector: true,
                visionFunctionSelector: true,
                logoutButton: true,
            },
            menuGlobalModels: {
                addMeasurement: false,
                removeMeasurement: false,
                saveGlobalModel: false,
                measurementDefinition: true,
            },
            visionApplication: {
                load: false,
                save: false,
                delete: false,
            },
        };
        return enableStatus;
    };

    p.updateWidgetsStatus = function () {
        this.triggerUpdate = true;
    };

    p.determineWidgetsStatus = function (statusReady) {
        var status = this.widgetStatus;

        if (statusReady === false) {
            status.imageAcquisition.parameterFormForLightAndFocus = false;
            status.imageAcquisition.extendedParameter = false;
            status.imageAcquisition.parameterFormForSettings.enableStatus = false;

            status.menuPanel.imageCapture = false;
            status.menuPanel.repetitiveCapture.enableStatus = this.determineEnableStatusOfButtonRepetitiveCapture();
            status.menuPanel.repetitiveCapture.visibleStatus = this.determineVisibleStatusOfButtonRepetitiveCapture();     
            status.menuPanel.execute = false;
            status.menuPanel.edit.enableStatus = false;
            status.menuPanel.edit.visibleStatus = this.determineVisibleStatusOfButtonEdit();

            status.lineSensor.buttonNormalImage.enableStatus = false;    
            status.lineSensor.buttonNormalImage.visibleStatus = this.parent.getActivatedLinesensor();    
            status.lineSensor.groupBoxForConfiguration.visibleStatus = this.parent.getActivatedLinesensor(); 
            status.lineSensor.parameterForm.enableStatus = false; 

            status.imageMode.tabItem = this.determineVisibleStatusOfImageModeTabItem();

            status.menuTool.toolList = false;
            status.menuTool.commandList = false;
            status.menuTool.manipulation = false;
            status.menuTool.roiToolsTabItem = this.determineVisibleStatusOfRoiToolsTabItem();

            status.menuModels.modelType = false;
            status.menuModels.teach = false;
            status.menuModels.marker.enableStatus = false;
            status.menuModels.marker.visibleStatus = this.determineVisibleStatusOfButtonMarker();
            status.menuModels.delete = false;
            status.menuModels.modelParametersList = false;

            status.visionFunctionParameters.parameters = true;
            status.visionFunctionParameters.processVaribles.enableStatus = false;

            status.menuGlobalModels.addMeasurement = false;
            status.menuGlobalModels.removeMeasurement = false;
            status.menuGlobalModels.saveGlobalModel = false;
            status.menuGlobalModels.measurementDefinition = false;

            status.menuApplication.visionComponentSelector = this.determineEnableStatusOfVisionComponentSelector();
            status.menuApplication.visionFunctionSelector = false;
            status.menuApplication.logoutButton = this.determineEnableStatusOfLogoutButton();

            status.tabVisionFunctionModels.visionFunctionTab.visibleStatus = this.determineVisibleStatusOfTabPageVisionFunction();
            status.tabVisionFunctionModels.visionFunctionTab.enableStatus = false;

            status.tabVisionFunctionModels.modelsTab.visibleStatus = this.determineVisibleStatusOfTabPageModels();
            status.tabVisionFunctionModels.modelsTab.enableStatus = false;

            status.visionApplication.load =  this.determineEnableStatusOfDropDownBoxForLoad();
            status.visionApplication.save = false;
            status.visionApplication.delete = this.determineEnableStatusOfDropDownBoxForDelete();

            status.filter.tabItem = this.determineVisibleStatusOfFilterTabItem();
            status.filter.selectorList = this.determineVisibleStatusOfSelectorListForFilter();
            status.filter.textOutputSelectorFilter = this.determineVisibleStatusOfSelectorListForFilter();
            status.filter.imageSelectorFilter = this.determineVisibleStatusOfSelectorListForFilter();
            status.dummyTab.tabItem = this.determineVisibleStatusOfDummyTabItem();
        } else {
            status.imageAcquisition.parameterFormForLightAndFocus = true;
            status.imageAcquisition.extendedParameter = true;
            status.imageAcquisition.parameterFormForSettings.enableStatus = true;

            status.menuPanel.imageCapture = this.determineEnableStatusOfButtonImageCapture();
            status.menuPanel.repetitiveCapture.enableStatus = this.determineEnableStatusOfButtonRepetitiveCapture();
            status.menuPanel.repetitiveCapture.visibleStatus = this.determineVisibleStatusOfButtonRepetitiveCapture();
            status.menuPanel.execute = this.determineEnableStatusOfButtonExecuteVisionFunction();
            status.menuPanel.edit.enableStatus = this.determineEnableStatusOfButtonEdit();
            status.menuPanel.edit.visibleStatus = this.determineVisibleStatusOfButtonEdit();

            status.lineSensor.buttonNormalImage.enableStatus = true; 
            status.lineSensor.buttonNormalImage.visibleStatus = this.parent.getActivatedLinesensor(); 
            status.lineSensor.groupBoxForConfiguration.visibleStatus = this.parent.getActivatedLinesensor();
            status.lineSensor.parameterForm.enableStatus = true;         

            status.menuTool.toolList = this.determineEnableStatusOfDropdownTools();
            status.menuTool.commandList = this.determineEnableStatusOfToolCommands();
            status.menuTool.manipulation = this.determineEnableStatusOfToolManipulation();
            status.menuTool.roiToolsTabItem = this.determineVisibleStatusOfRoiToolsTabItem();

            status.menuModels.modelType = this.determineEnableStatusOfDropdownModelType();
            status.menuModels.teach = this.determineEnableStatusOfButtonTeach();
            status.menuModels.modelParametersList = this.determineEnableStatusOfSmartPanelParameterFormModelParameters();
            status.menuModels.marker.enableStatus = this.determineEnableStatusOfButtonMarker();
            status.menuModels.marker.visibleStatus = this.determineVisibleStatusOfButtonMarker();

            status.menuModels.delete = this.determineEnableStatusOfButtonDelete();

            status.menuGlobalModels.addMeasurement = this.determineEnableStatusOfButtonAddMeasurement();
            status.menuGlobalModels.removeMeasurement = this.determineEnableStatusOfButtonRemoveMeasurement();
            status.menuGlobalModels.saveGlobalModel = this.determineEnableStatusOfButtonSaveGlobalModel();
            status.menuGlobalModels.measurementDefinition = this.determineEnableStatusOfSmartPanelGlobalModelMeasurementDef();

            status.menuApplication.visionComponentSelector = this.determineEnableStatusOfVisionComponentSelector();
            status.menuApplication.visionFunctionSelector = this.determineEnableStatusOfVisionFunctionSelector();
            status.menuApplication.logoutButton = this.determineEnableStatusOfLogoutButton();

            status.tabVisionFunctionModels.visionFunctionTab.visibleStatus = this.determineVisibleStatusOfTabPageVisionFunction();
            status.tabVisionFunctionModels.visionFunctionTab.enableStatus = this.determineEnableStatusOfTabPageVisionFunction();
            status.tabVisionFunctionModels.modelsTab.visibleStatus = this.determineVisibleStatusOfTabPageModels();

            status.visionApplication.load = this.determineEnableStatusOfDropDownBoxForLoad();
            status.visionApplication.save = this.determineEnableStatusOfDropDownBoxForSave();
            status.visionApplication.delete = this.determineEnableStatusOfDropDownBoxForDelete();

            status.filter.tabItem = this.determineVisibleStatusOfFilterTabItem();
            status.filter.selectorList = this.determineVisibleStatusOfSelectorListForFilter();
            status.filter.textOutputSelectorFilter = this.determineVisibleStatusOfSelectorListForFilter();
            status.filter.imageSelectorFilter = this.determineVisibleStatusOfSelectorListForFilter();

            status.imageMode.tabItem = this.determineVisibleStatusOfImageModeTabItem();

            status.dummyTab.tabItem = this.determineVisibleStatusOfDummyTabItem();

            status.visionFunctionParameters.processVaribles.enableStatus = true;
        }
        return status;
    };

    p.determineVisibleStatusOfSelectorListForFilter = function () {
        return this.parent.vfCapabilities.has("ModelFilter") && 
            this.widgetRefIds.filter.processVariablesList.isModelNumberMappedAsVpOutput() && 
            ((this.parent.resultFilter.persistedModelIdsAtLastExecute.length > 0));
    };

    p.determineVisibleStatusOfDummyTabItem = function () {
        var status = true;
        if (this.parent.getIsSelectedImageAcquisition() === true) {
            status = true;
        } else {
            status = false;
        }
        return status;
    };

    p.determineVisibleStatusOfImageModeTabItem = function () {
        var status = true;
        if (this.parent.getIsSelectedImageAcquisition() === true) {
            status = true;
        } else {
            status = false;
        }
        return status;
    };

    p.determineVisibleStatusOfFilterTabItem = function () {
        var status = true;
        if (this.parent.getIsSelectedImageAcquisition() === true) {
            status = false;
        } else {
            status = true;
        }
        return status;
    };

    p.determineVisibleStatusOfRoiToolsTabItem = function () {
        var status = true;
        if (this.parent.getIsSelectedImageAcquisition() === true) {
            status = false;
        } else {
            status = true;
        }
        return status;
    };



    p.determineVisibleStatusOfButtonEdit = function () {
        var status = true;
        if (this.parent.getIsSelectedImageAcquisition() === true) {
            status = false;
        } else {
            status = true;
        }
        return status;
    };

    p.determineEnableStatusOfSmartPanelParameterFormModelParameters = function () {
        var status = true;
        if (this.isEditingGlobalModel() === true) {
            status = false;
        }
        if (this.parent.orientationArrow) {
            this.parent.orientationArrow.changeEditMode(status);
        }
        return status;
    };

    p.determineVisibleStatusOfButtonRepetitiveCapture = function () {
        var status = true;
        if (this.parent.getIsSelectedImageAcquisition() === true) {
            status = true;
        } else {
            status = false;
        }
        return status;
    };

    p.determineEnableStatusOfSmartPanelGlobalModelMeasurementDef = function () {
        var status = true;
        if (this.isEditingModel() === true) {
            status = false;
        }
        return status;
    };

    p.isEditingGlobalModel = function () {
        var status = false;
        if (this.parent.vfCapabilities.has("GlobalModel")) {
            if (this.parent.smartPanelGlobalModelList && this.parent.smartPanelGlobalModelList.getPersistedStatus() === false) {
                status = true;
            }
        }
        return status;
    };

    p.isEditingModel = function () {
        var model, status = false, selectedModelId;

        if (this.parent.vfCapabilities.has("Models")) {
            model = this.parent.getSelectedModel();
            selectedModelId = this.parent.getSelectedModelId();
            if ((model && model.modelRoi &&
                (model.modelRoi.getDirtyFlag() === true)) ||
                (this.parent.getDirtyFlagOfChangedSubmitParameter() === true) ||
                (this.parent.getDirtyFlagOfChangedTeachParameter() === true) ||
                (this.widgetRefIds.menuPanel.edit.getValue() === true) ||
                (selectedModelId === 0)) {
                status = true;
            }
        }
        return status;
    };

    p.updateWidgets = function (status) {
        var refIds = this.widgetRefIds;

        refIds.imageAcquisition.parameterFormForLightAndFocus.setEnable(status.imageAcquisition.parameterFormForLightAndFocus);
        refIds.imageAcquisition.parameterFormForExtendedParameter.setEnable(status.imageAcquisition.extendedParameter);
        refIds.imageAcquisition.parameterFormForSettings.setEnable(status.imageAcquisition.parameterFormForSettings.enableStatus);

        // panel menu
        refIds.menuPanel.imageCapture.setEnable(status.menuPanel.imageCapture);
        refIds.menuPanel.repetitiveCapture.setEnable(status.menuPanel.repetitiveCapture.enableStatus);
        refIds.menuPanel.repetitiveCapture.setVisible(status.menuPanel.repetitiveCapture.visibleStatus); 
        refIds.menuPanel.execute.setEnable(status.menuPanel.execute);
        refIds.menuPanel.edit.setEnable(status.menuPanel.edit.enableStatus);
        refIds.menuPanel.edit.setVisible(status.menuPanel.edit.visibleStatus);

        //line sensor 
        refIds.lineSensor.buttonNormalImage.setEnable(status.lineSensor.buttonNormalImage.enableStatus); 
        refIds.lineSensor.buttonNormalImage.setVisible(status.lineSensor.buttonNormalImage.visibleStatus);  
        refIds.lineSensor.groupBoxForConfiguration.setVisible(status.lineSensor.groupBoxForConfiguration.visibleStatus);
        refIds.lineSensor.parameterFormForLineSensor.setEnable(status.lineSensor.parameterForm.enableStatus);        
        
        // tools menu
        refIds.menuTool.toolList.setEnable(status.menuTool.toolList);
        refIds.menuTool.commandList.setEnable(status.menuTool.commandList);
        refIds.menuTool.manipulation.setEnable(status.menuTool.manipulation);
        refIds.menuTool.roiToolsTabItem.setVisible(status.menuTool.roiToolsTabItem);

        // filter
        refIds.filter.tabItem.setVisible(status.filter.tabItem);

       
        refIds.filter.selectorList.setVisible(status.filter.selectorList);
        refIds.filter.textOutputSelectorFilter.setVisible(status.filter.textOutputSelectorFilter);
        refIds.filter.imageSelectorFilter.setVisible(status.filter.imageSelectorFilter);
        
        refIds.visionFunctionParameters.processVaribles.setEnable(status.visionFunctionParameters.processVaribles.enableStatus); 

        // filter
        refIds.dummyTab.tabItem.setVisible(status.dummyTab.tabItem);

        // image mode
        refIds.imageMode.tabItem.setVisible(status.imageMode.tabItem);

        // models menu
        refIds.menuModels.modelType.setEnable(status.menuModels.modelType);
        refIds.menuModels.delete.setEnable(status.menuModels.delete);
        refIds.menuModels.teach.setEnable(status.menuModels.teach);
        refIds.menuModels.modelParametersList.setEnable(status.menuModels.modelParametersList);
        refIds.menuModels.marker.setEnable(status.menuModels.marker.enableStatus);
        refIds.menuModels.marker.setVisible(status.menuModels.marker.visibleStatus);

        // global models menu
        refIds.menuGlobalModels.addMeasurement.setEnable(status.menuGlobalModels.addMeasurement);
        refIds.menuGlobalModels.removeMeasurement.setEnable(status.menuGlobalModels.removeMeasurement);
        refIds.menuGlobalModels.saveGlobalModel.setEnable(status.menuGlobalModels.saveGlobalModel);
        refIds.menuGlobalModels.measurementDefinition.setEnable(status.menuGlobalModels.measurementDefinition);

        // Application menu
        refIds.menuApplication.visionComponentSelector.setEnable(status.menuApplication.visionComponentSelector);
        refIds.menuApplication.visionFunctionSelector.setEnable(status.menuApplication.visionFunctionSelector);
        refIds.menuApplication.logoutButton.setEnable(status.menuApplication.logoutButton);

        // Application Load/Save
        refIds.visionApplication.dropDownBoxForLoad.setEnable(status.visionApplication.load);
        refIds.visionApplication.dropDownBoxForSave.setEnable(status.visionApplication.save);
        refIds.visionApplication.dropDownBoxForDelete.setEnable(status.visionApplication.delete);

        // Vision Function tab
        refIds.tabVisionFunctionModels.visionFunctionTab.setVisible(status.tabVisionFunctionModels.visionFunctionTab.visibleStatus);
        refIds.tabVisionFunctionModels.visionFunctionTab.setEnable(status.tabVisionFunctionModels.visionFunctionTab.enableStatus);

        // Edit Models tab
        refIds.tabVisionFunctionModels.modelsTab.setVisible(status.tabVisionFunctionModels.modelsTab.visibleStatus);
    };

    p.setEnableDropDownBoxRoiTools = function () {
        var enable;
        if (this.parent.isSelectedVfModelTabVisionFunctionPage()) {
            enable = true;
        } else {
            enable = false;
        }
        this.tools.list.setEnable(enable);
    };

    p.setSelectVisionFunctionTab = function () {
        this.parent.setSelectedVfModelTabWithVisionFunctionPage();
        this.widgetRefIds.tabVisionFunctionModels.visionFuntionAndModelsTabControl.setSelectedIndex(0);
    };

    p.setDefaultValueOfRoiCommands = function () {
        this.widgetRefIds.menuTool.commandList.setSelectedValue('commands');
    };

    p.setRoiToolsDataProvider = function () {
        this.widgetRefIds.menuTool.toolList.setDataProvider(this.parent.settings.dataProviderRoiTools);
    };

    p.setRoiCommandsDataProvider = function () {
        this.widgetRefIds.menuTool.commandList.setDataProvider(this.parent.settings.dataProviderRoiCommands);
    };

    p.setRoiManipulationDataProvider = function () {
        this.widgetRefIds.menuTool.manipulation.setDataProvider(this.parent.settings.dataProviderRoiManipulation);
    };

    p.setDefaultValueOfRoiManipulation = function () {
        this.widgetRefIds.menuTool.manipulation.setSelectedValue('manipulation');
    };

    p.setDefaultValueOfRoiTools = function () {
        this.widgetRefIds.menuTool.toolList.setSelectedValue('tools');
    };

    p.setDefaultValueOfModelType = function () {
        this.widgetRefIds.menuModels.modelType.setSelectedValue(this.parent.settings.defaultModelType.value);
    };

    p.setDataProviderOfModelType = function () {
        this.widgetRefIds.menuModels.modelType.setDataProvider(this.parent.settings.dataProviderModelTypes);
    };

    p.setDataProviderOfOperationForGlobalModel = function (dataProvider) {
        if (dataProvider !== undefined) {
            this.widgetRefIds.menuGlobalModels.addMeasurement.setDataProvider(dataProvider);
        }
    };

    p.setDefaultValueOfOperationForGlobalModel = function () {
        this.widgetRefIds.menuGlobalModels.addMeasurement.setSelectedValue(this.parent.settings.defaultOperation.value);
    };

    p.getSelectedValueOfOperation = function () {
        return this.widgetRefIds.menuGlobalModels.addMeasurement.getSelectedValue();
    };

    p.callExternalWidget = function (widgetId) {
        if (this.parent.isUnitTestEnviroment() === false) {
            return brease.callWidget(this.parent.settings.parentContentId + '_' + widgetId, "widget");
        } else {
            return window.fakeWidgetCaller();
        }
    };

    p.setEditButtonValueToOn = function () {
        this.setEditButtonValue(1);
    };

    p.setEditButtonValueToOff = function () {
        this.setEditButtonValue(0);
    };

    p.setEditButtonValue = function (value) {
        var modelType;

        switch (this.parent.settings.selectedVfModelTab) {
            case "VisionFunctionPage":
                this.widgetRefIds.menuPanel.edit.setValue(value);
                break;
            case "EditModelsPage":
                modelType = this.parent.getModelTypeOfSelectedModel();
                if (modelType) {
                    if (this.parent.supportsModelRoi(modelType) === true) {
                        this.widgetRefIds.menuPanel.edit.setValue(value);
                    }

                    if (this.parent.supportsMarker(modelType) === true) {
                        if (this.determinateIfMarkerButtonValueShouldChange(value) === true) {
                            this.widgetRefIds.menuModels.marker.setValue(value);
                        }
                    }
                } else if (this.parent.getSelectedModelId() === undefined) {
                    this.widgetRefIds.menuPanel.edit.setValue(0);
                    this.widgetRefIds.menuModels.marker.setValue(0);
                }
                break;
        }
    };

    p.determinateIfMarkerButtonValueShouldChange = function (valueOfEditButton) {
        var value = false;
        if (valueOfEditButton === 0) {
            value = true;
        } else if ((this.parent.getStatusErrorModel() === true) && (this.parent.isAnyCrosshairTeachToolDefined() === true)) {
            value = true;
        } 
        return value; 
    };

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Functions to determine enable status of widgets - return true if widget may set to enabled
    //////////////////////////////////////////////////////////////////////////////////////////////

    p.determineEnableStatusOfButtonEdit = function () {
        var status = false,
            modelType;

        switch (this.parent.settings.selectedVfModelTab) {
            case "VisionFunctionPage":
                if (this.parent.vfCapabilities.has("ExecutionRoi") === true) {
                    status = true;
                }
                break;
            case "EditModelsPage":
                modelType = this.parent.getModelTypeOfSelectedModel();
                if ((this.parent.supportsModelRoi(modelType) === true) &&
                    (this.isEditingGlobalModel() === false) &&
                    (this.parent.isModelTypeTeachable(modelType))) {
                    status = true;
                }
                break;
        }
        return status;
    };

    p.determineEnableStatusOfButtonImageCapture = function () {
        var status = true;

        if (this.parent.getInitialComplete() === false) {
            status = false;
        }
        if ((this.parent.getVisionApplicationIsSaving() === true) || (this.parent.getVisionApplicationIsLoading() === true)) {
            status = false;
        }

        if (this.parent.getStatusResponseReciv() === false || (this.parent.getRepetitiveMode() === true)) {
            status = false;
        }

        if (this.parent.applicationContext.includes("edit_")) {
            status = false;
        }
        return status;
    };

    p.determineEnableStatusOfButtonRepetitiveCapture = function () {
        var status = true;

        if (!this.widgetRefIds.menuPanel.repetitiveCapture.getValue()) {
            status = this.parent.getStatusReady();
        } else {
            status = !this.parent.getLastImageOfRepetitiveModeIsLoading();
        }
        return status;
    };

    p.determineEnableStatusOfButtonExecuteVisionFunction = function () {
        var status = true;

        if (this.parent.applicationContext.includes("edit_") ||
            (this.isEditingGlobalModel() === true) ||
            (this.isEditingModel() === true)) {
            status = false;
        }

        return status;
    };

    p.determineEnableStatusOfDropdownTools = function () {
        var setEnable = false,
            toolInstances,
            modelType;

        switch (this.parent.applicationContext) {
            case "edit_execution_roi":
                setEnable = true;
                break;

            case "edit_model_roi":
                modelType = this.parent.getModelTypeOfSelectedModel();

                if (this.parent.supportsMarker(modelType) === true) {
                    setEnable = (this.widgetRefIds.menuModels.marker.getValue() && !this.parent.isAnyCrosshairTeachToolDefined());
                } else if (modelType) {
                    toolInstances = this.parent.getToolInstancesOfModelType(modelType);
                    switch (toolInstances) {
                        case "single":
                            if (this.parent.teachTools.length === 0) {
                                setEnable = true;
                            }
                            break;

                        case "multi":
                            setEnable = true;
                            break;
                    }
                }
                break;
        }
        return setEnable;
    };

    p.determineEnableStatusOfToolCommands = function () {
        var setEnable = false,
            selectedCount = 0,
            model, modelid;

        switch (this.parent.applicationContext) {
            case "edit_execution_roi":
                this.parent.executionTools.forEach(function (tool) {
                    if (tool.isSelected() === true) {
                        selectedCount++;
                    }
                });

                if (selectedCount > 1) {
                    setEnable = true;
                    return setEnable;
                }
                break;

            case "edit_model_roi":
                model = this.parent.getSelectedModel();
                if (model) {
                    this.parent.teachTools.forEach(function (tool) {
                        if (tool.isSelected() === true) {
                            selectedCount++;
                        }
                    });
                    if (selectedCount > 1) {
                        setEnable = true;
                        return setEnable;
                    }
                } else {
                    modelid = this.parent.getSelectedModelId();
                    if (modelid === 0) {
                        this.parent.teachTools.forEach(function (tool) {
                            if (tool.isSelected() === true) {
                                selectedCount++;
                            }
                        });
                        if (selectedCount > 1) {
                            setEnable = true;
                            return setEnable;
                        }
                    }
                }
                break;
        }
        return setEnable;
    };

    p.determineEnableStatusOfToolManipulation = function () {
        // Copy/Paste/Delete
        var enableStatus = false,
            modelType,
            toolInstances;

        switch (this.parent.applicationContext) {
            case "edit_execution_roi":
                if (this.parent.executionRoi && (this.parent.executionRoi.isSelected() === true)) {
                    enableStatus = true;
                    return enableStatus;
                }

                if ((this.parent.executionTools.length > 0) || (this.parent.toolsClipboard.length > 0)) {
                    enableStatus = true;
                    return enableStatus;
                }
                break;

            case "edit_model_roi":

                modelType = this.parent.getModelTypeOfSelectedModel();
                if (modelType) {
                    toolInstances = this.parent.getToolInstancesOfModelType(modelType);
                    if (toolInstances === "single") {
                        if (this.parent.teachTools.length > 0) {
                            enableStatus = true;
                        }
                    } else {
                        this.parent.settings.vfModels.forEach(function (model) {
                            if (model && model.modelRoi && model.modelRoi.isSelected() === true) {
                                enableStatus = true;
                                return enableStatus;
                            }
                        });
                        if ((this.parent.teachTools.length > 0) || (this.parent.toolsClipboard.length > 0)) {
                            enableStatus = true;
                            return enableStatus;
                        }
                    }
                    break;
                }
        }
        return enableStatus;
    };

    p.determineEnableStatusOfButtonToolsCopy = function () {
        var enableStatus = false;

        if (!this.parent.applicationContext.includes("edit_")) {
            return enableStatus;
        }
        switch (this.parent.applicationContext) {
            case "edit_execution_roi":
                this.parent.executionTools.forEach(function (tool) {
                    if (tool.isSelected() === true) {
                        enableStatus = true;
                        return enableStatus;
                    }
                });
                break;

            case "edit_model_roi": {
                this.parent.teachTools.forEach(function (tool) {
                    if (tool.isSelected() === true) {
                        enableStatus = true;
                        return enableStatus;
                    }
                });
            }
                break;
        }
        return enableStatus;
    };

    p.determineVisibleStatusOfTabPageModels = function () {
        var status = true;
        if (this.parent.applicationContext === "edit_execution_roi") {
            status = false;
            return status;
        }
        return status;
    };

    p.determineVisibleStatusOfTabPageVisionFunction = function () {
        var status = true;
        if (this.parent.applicationContext === "edit_model_roi") {
            status = false;
            return status;
        }
        return status;
    };

    p.determineEnableStatusOfTabPageVisionFunction = function () {
        var status = true;
        if (this.parent.applicationContext === "edit_execution_roi") {
            status = false;
            return status;
        }
        return status;
    };

    p.determineEnableStatusOfDropdownModelType = function () {
        var enableStatus = false,
            selectedModelId,
            features;

        if (this.parent.applicationContext.includes("edit_")) {
            return enableStatus;
        }

        if (this.parent.vpDataProvider.isVisionProgramLoaded() === false) {
            // Vision Program not initialized yet - deactivate all model buttons
            return enableStatus;
        }
        features = this.parent.getVisionFunctionFeatures();
        if (features === undefined) {
            // the initialize phase is still ongoing - deactivate all model buttons
            return enableStatus;
        }

        if (features.includes("teachable")) {
            // vf does support models
            selectedModelId = this.parent.getSelectedModelId();
            if (selectedModelId === undefined) {
                // no Item in model list is selected - activate AddModel button
                if (this.parent.vfCapabilities.has("GlobalModel")) {
                    if (this.parent.smartPanelGlobalModelList.getPersistedStatus() === true) {
                        enableStatus = true;
                    }
                } else {
                    enableStatus = true;
                }
                return enableStatus;
            } else if ((selectedModelId > 0) && (this.parent.getStatusErrorModel() === false)) {
                // an  already persisted model is selected - activate AddModel button
                if (this.parent.vfCapabilities.has("GlobalModel")) {
                    if (this.parent.smartPanelGlobalModelList.getPersistedStatus() === true) {
                        enableStatus = true;
                    }
                } else {
                    enableStatus = true;
                }
                return enableStatus;
            }
        }
        return enableStatus;
    };

    p.determineEnableStatusOfButtonTeach = function () {
        var enableStatus = false,
            selectedModelId,
            features,
            modelType,
            isTeachable,
            isRequired = false,
            isOptional = false,
            model;

        if (this.parent.vpDataProvider.isVisionProgramLoaded() === false) {
            // Vision Program not initialized yet - deactivate all model buttons
            return enableStatus;
        }
        features = this.parent.getVisionFunctionFeatures();
        if (features === undefined) {
            // the initialize phase is still ongoing - deactivate all model buttons
            return enableStatus;
        }

        if (features.includes("teachable")) {
            // vf does support models
            selectedModelId = this.parent.getSelectedModelId();
            if (selectedModelId === undefined) {
                // no Item in model list is selected - deactivate teach
                return enableStatus;
            }

            if (selectedModelId === 0) { // its a new model
                modelType = this.parent.settings.selectedModelType;

                isRequired = (this.parent.requiresMarker(modelType) === true) || (this.parent.requiresModelRoi(modelType) === true);
                if (isRequired) {
                    if (this.parent.teachTools.length > 0) {
                        enableStatus = true;
                    }
                } else {
                    isOptional = !isRequired && (this.parent.supportsMarker(modelType) === true) || (this.parent.supportsModelRoi(modelType) === true);

                    if (isOptional) {
                        enableStatus = true;
                    }
                }
                return enableStatus;
            }

            model = this.parent.getSelectedModel();
            if (model) {
                isTeachable = this.parent.isModelTypeTeachable(model.modelType);
                if (isTeachable === false) {
                    // the selected modelType is not teachable
                    return enableStatus;
                }

                if ((model.modelRoi && (model.modelRoi.getDirtyFlag() === true)) || (this.parent.getDirtyFlagOfChangedSubmitParameter() === true) || (this.parent.getDirtyFlagOfChangedTeachParameter() === true)) { // the dirty fla has to be set which indicates the user changed something
                    if (this.isEditingGlobalModel() === false) {
                        enableStatus = true;
                    } else {
                        enableStatus = false;
                    }
                    return enableStatus;
                }

                isRequired = (this.parent.requiresMarker(model.modelType) === true) || (this.parent.requiresModelRoi(model.modelType) === true);
                if (isRequired) {
                    if (this.parent.teachTools.length > 0) {
                        enableStatus = true;
                    }
                } else {
                    isOptional = (!isRequired && (this.parent.supportsMarker(model.modelType) === true) ||
                        (this.parent.supportsModelRoi(model.modelType) === true));
                    if (isOptional) {
                        if ((this.parent.getDirtyFlagOfChangedSubmitParameter() === true) ||
                            (this.parent.getDirtyFlagOfChangedTeachParameter() === true)) {
                            enableStatus = true;
                        }
                    }
                }
                return enableStatus;
            }
        }
        return enableStatus;
    };

    p.determineEnableStatusOfButtonMarker = function () {
        var status = false,
            modelType = this.parent.getModelTypeOfSelectedModel();

        if (this.parent.supportsMarker(modelType) === true) {
            status = true;
        }
        return status;
    };

    p.determineVisibleStatusOfButtonMarker = function () {
        var status = this.parent.doesAnyModelTypeSupportMarker();
        return status;
    };

    p.determineEnableStatusOfButtonDelete = function () {
        var enableStatus = true,
            selectedModelId;

        if (this.parent.vpDataProvider.isVisionProgramLoaded() === false) {
            // Vision Program not initialized yet - deactivate all model buttons
            return enableStatus;
        }
        // vf does support models
        selectedModelId = this.parent.getSelectedModelId();
        if (this.parent.smartPanelGlobalModelList.getPersistedStatus() === false) {
            enableStatus = false;
            return enableStatus;
        }
        if (selectedModelId == undefined) {
            // no Item in model list is selected - deactivate delete model button
            enableStatus = false;
            return enableStatus;
        }
        return enableStatus;
    };

    p.isOverlayVisible = function () {
        var visible = this.widgetRefIds.menuApplication.overlay.getVisible();
        return visible;
    };

    p.onModuleNotOk = function () {
        this.widgetRefIds.menuApplication.overlay.setVisible(true);
        this.widgetRefIds.menuApplication.overlay.setValue(this.parent.settings.textForOverlayIfModulIsNotOK);
        this.parent.socketHandling.closeSocket(); 
        this.updateWidgetsStatus();
    };

    p.onModuleOk = function () {
        this.widgetRefIds.menuApplication.overlay.setValue(this.parent.settings.textForOverlayIfModulIsOK);
        this.parent.setWaitingForLoadVisionApplicationStatusUpdate(true);
        this.parent.onVisionApplicationLoading();
        this.parent.resetAndCleanupAfterSelectedVF();
    };

    p.onOperationModeSetToHmi = function () {
        this.widgetRefIds.menuApplication.overlay.setVisible(false); 
    };

    p.determineEnableStatusOfVisionComponentSelector = function () {
        var status = true;

        if (this.isWaitingForLoadOrIsConnectionOpenAndRady() ||
            (this.parent.applicationContext.includes("edit_") ||
                (this.parent.getStatusErrorModel() === true))) {
            if (this.isOverlayVisible() === true) {
                status = true;
            } else {
                status = false;
            }
        }
        return status;
    };

    p.determineEnableStatusOfVisionFunctionSelector = function () {
        var status = true;

        if ((this.parent.getInitialComplete() === false) ||
            (this.parent.getStatusErrorModel() === true) ||
            (this.parent.applicationContext.includes("edit_")) ||
            (this.parent.getVisionApplicationIsDeleting() === true) ||
            (this.parent.getVisionApplicationIsSaving() === true) ||
            (this.parent.getVisionApplicationIsLoading() === true) ||
            (this.isOverlayVisible() === true)) {
            status = false;
        }

        return status;
    };

    p.determineEnableStatusOfLogoutButton = function () {
        var status = true;

        if (this.isWaitingForLoadOrIsConnectionOpenAndRady() ||
            (this.parent.applicationContext.includes("edit_") ||
                (this.parent.getStatusErrorModel() === true))) {
            status = false;
        }
        return status;
    };

    p.determineEnableStatusOfButtonAddMeasurement = function () {
        var status = false;

        if ((this.parent.vfCapabilities.has("GlobalModel") === true) && (this.parent.smartPanelModelList.getMinAndMaxValueIdOfPersistedModels().max > 0)) {
            if ((this.parent.smartPanelGlobalModelList.getModelData().length >= this.parent.settings.numResultsMax) || ((this.parent.smartPanelGlobalModelList.getPersistedStatus() === false))) {
                status = false;
            } else {
                if (this.isEditingModel() === false) {
                    status = true;
                }
            }
        }
        return status;


    };

    p.determineEnableStatusOfButtonRemoveMeasurement = function () {
        var status = false;

        if (this.parent.vfCapabilities.has("GlobalModel") === true) {
            if (this.parent.getSelectedGlobalModelId() && (this.isEditingModel() === false)) {
                status = true;
            }
        }
        return status;
    };

    p.determineEnableStatusOfButtonSaveGlobalModel = function () {
        var status = false;

        if (this.parent.vfCapabilities.has("GlobalModel") === true) {
            if (this.parent.getSelectedGlobalModelId() && (this.isEditingModel() === false)) {
                status = true;
            }
        }
        return status;
    };

    p.determineEnableStatusOfDropDownBoxForLoad = function () {
        var status = true;
        if (this.parent.applicationContext.includes("edit_")) {
            status = false;
        }
        if (this.parent.vfCapabilities.has("GlobalModel")) {
            if (this.parent.smartPanelGlobalModelList && this.parent.smartPanelGlobalModelList.getPersistedStatus() === false) {
                status = false;
            }
        }
        if(this.isWaitingForLoadOrIsConnectionOpenAndRady()){ 
            status = false;
        }
        return status;
    };

    p.determineEnableStatusOfDropDownBoxForSave = function () {
        var status = true;
        if (this.parent.applicationContext.includes("edit_")) {
            status = false;
        }
        if (this.parent.vfCapabilities.has("GlobalModel")) {
            if (this.parent.smartPanelGlobalModelList.getPersistedStatus() === false) {
                status = false;
            }
        }
        return status;
    };

    p.determineEnableStatusOfDropDownBoxForDelete = function () {
        var status = true;
        if (this.parent.applicationContext.includes("edit_")) {
            status = false;
        }
        if (this.parent.vfCapabilities.has("GlobalModel")) {
            if (this.parent.smartPanelGlobalModelList && this.parent.smartPanelGlobalModelList.getPersistedStatus() === false) {
                status = false;
            }
        }

        if(this.isWaitingForLoadOrIsConnectionOpenAndRady()){ 
            status = false;
        }

        return status;
    };

    p.isWaitingForLoadOrIsConnectionOpenAndRady = function () {
        var status = false;
        if (this.parent.socketHandling.isConnectionOpen()) {
            if (this.parent.getStatusReady() === false) {
                status = true;
            }
        } else if (this.parent.getWaitingForLoadVisionApplicationStatusUpdate() || this.parent.isLastApplicationLoadSuccesful() === true) { 
            status = true;
        }
        return status;
    };

    p.setVisionFuntionTab = function () {
        this.widgetRefIds.tabVisionFunctionModels.visionFuntionAndModelsTabControl.setSelectedIndex(0);
        this.parent.setSelectedVfModelTabWithVisionFunctionPage();
    };

    p.setVisionFuntionImageAcquisition = function () {
        this.widgetRefIds.menuApplication.visionFunctionSelector.setSelectedIndex(0);
    };

    p.setVisionRoiTab = function () {
        this.widgetRefIds.menuTool.roiToolsTab.setSelectedIndex(0);
    };

    p.setFilterResultsTab = function () {
        this.widgetRefIds.menuTool.roiToolsTab.setSelectedIndex(1);
    };

    p.setImageModeTabItem = function () {
        this.widgetRefIds.menuTool.roiToolsTab.setSelectedIndex(2);
    };

    p.onSelectedIndexOfDropDownForSortProcessVariablesChanged =  function (selectedIndex) {
        this.parent.resultFilter.filterControls.processVariablesList.sortProcessVariables(selectedIndex);
    };

    p.onSelectedIndexOfDropDownForLoadChanged = function (selectedValue, selectedIndex) {
        this.widgetRefIds.visionApplication.dropDownBoxForLoad.setSelectedIndex(0);
        if (selectedIndex !== 0) {
            this.parent.loadVisionApplication(selectedValue);
        }
    };

    p.onSelectedIndexOfDropDownForDeleteChanged = function (selectedValue, selectedIndex) {
        this.widgetRefIds.visionApplication.dropDownBoxForDelete.setSelectedIndex(0);
        if (selectedIndex !== 0) {
            this.parent.confirmationDialog.showDeleteVisionApplicationDialog();
            this.parent.settings.visionApplicationToDelete = selectedValue;
        }
    };

    p.onSelectedIndexOfDropDownForSaveChanged = function (selectedIndex) {
        this.widgetRefIds.visionApplication.dropDownBoxForSave.setSelectedIndex(0);
        switch (selectedIndex) {
            case 1:
                this.parent.getVAConfiguration();
                break;
            case 2:
                this.parent.saveAsDialogHandling.openAndInitializeSaveAsDialog();
                break;
        }
    };

    p.setTextOfHMIVisionApplicationName = function () {
        this.widgetRefIds.menuApplication.hmiVisionApplicationName.setText(this.parent.settings.hmiVisionApplicationName);
    };

    p.setDataProviderForDelete = function () {
        this.widgetRefIds.visionApplication.dropDownBoxForDelete.setDataProvider(this.parent.settings.dataProviderDelete);
    };

    p.setDataProviderForSave = function () {
        this.widgetRefIds.visionApplication.dropDownBoxForSave.setDataProvider(this.parent.settings.dataProviderSave);
    };

    p.setDataProviderForLoad = function () {
        this.widgetRefIds.visionApplication.dropDownBoxForLoad.setDataProvider(this.parent.settings.dataProviderLoad);
    };

    p.updateDataProviderForSortProcessVariables = function () {
        this.parent.settings.dataProviderForSortProcessVariables = [{
                'value': 'name',
                'text': 'Name',
            },
            {
                'value': 'result',
                'text': 'Result',
            }
        ];
        if (this.parent.vfCapabilities.has("ModelFilter")) {
            this.parent.settings.dataProviderForSortProcessVariables.push({
                'value': 'model',
                'text': 'Model',
            });
        }
        this.widgetRefIds.filter.dropDownBoxForSortProcessVariables.setDataProvider(this.parent.settings.dataProviderForSortProcessVariables);

    };

    p.updateDataProviderForDelete = function (listOfVAs) {
        var image; 
        this.parent.settings.dataProviderDelete = [{
            'value': 'delete',
            'text': '-- select vision application --',
            'image': 'delete.png'
        }];

        for (var indexOfVA = 0; indexOfVA < listOfVAs.length; indexOfVA++) {
            image = this.defineImage(listOfVAs[indexOfVA]);
            this.parent.settings.dataProviderDelete[indexOfVA + 1] = {
                "value": listOfVAs[indexOfVA],
                "text": listOfVAs[indexOfVA],
                'image': image
            };
        }
        this.widgetRefIds.visionApplication.dropDownBoxForDelete.setDataProvider(this.parent.settings.dataProviderDelete);
    };

    p.updateDataProviderForSave = function () {
        var image;
        image = this.defineImage(this.parent.getHmiVisionApplicationName());

        this.parent.settings.dataProviderSave = [{
            'value': 'save',
            'text': '-- choose option --',
            'image': 'save.png'
        },
        {
            'value': 'save',
            'text': 'Save current application',
            'image': image
        },
        {
            'value': 'save',
            'text': 'Save As...',
            'image': 'invisibleIcon.png'
        }];

        this.widgetRefIds.visionApplication.dropDownBoxForSave.setDataProvider(this.parent.settings.dataProviderSave);
    };

    p.updateDataProviderForLoad = function (listOfVAs) {
        this.defineDataProvideForLoad(listOfVAs);
        this.setDataProviderForLoad();
    };

    p.defineDataProvideForLoad = function (listOfVAs) {
        this.defineDefaultDataProviderForLoad();
        this.defineDataProviderForLoadWithOutHmiVAName(listOfVAs);
    };

    p.setDataProviderForLoad = function () {
        this.widgetRefIds.visionApplication.dropDownBoxForLoad.setDataProvider(this.parent.settings.dataProviderLoad);
    };

    p.defineDataProviderForLoadWithOutHmiVAName = function (listOfVAs) {
        var image; 
        for (var indexOfVA = 0; indexOfVA < listOfVAs.length; indexOfVA++) {
            if (listOfVAs[indexOfVA] !== this.parent.getHmiVisionApplicationName()) {
                image = this.defineImage(listOfVAs[indexOfVA]);
                this.parent.settings.dataProviderLoad[indexOfVA + 2] = {
                    "value": listOfVAs[indexOfVA],
                    "text": listOfVAs[indexOfVA],
                    'image': image
                };
            }
        }
    };

    p.defineImage = function (visionApplication) {
        var image;
        if (this.parent.getVisionApplicationName() === visionApplication) {
            image = 'machineVA.png';      
        } else {
            image = 'normalVA.png';
        }
        return image;
    };

    p.setImageOfVisionApplicationInHeader = function(visionApplication){
        var image, imagePath; 

        image = this.defineImage(visionApplication);
        imagePath =  'Media/mappVision/icons/load/' + image;
        this.widgetRefIds.menuApplication.imageVisionApplication.setImage(imagePath);
    };

    p.defineDefaultDataProviderForLoad = function () {
        var image = this.defineImage(this.parent.getHmiVisionApplicationName());
        this.parent.settings.dataProviderLoad = [{
            'value': 'load',
            'text': '-- select vision application --',
            'image': 'load.png'
        }, {
            'value': this.parent.getHmiVisionApplicationName(),
            'text': 'reload current vision application',
            'image': image
        }];
    };

    return WidgetsHandling;
});