/*global define*/
define([], function () {
    'use strict';

    function ResultFilter(context) {
        this.parent = context;
        this.settings = context.settings;
        this.vpDataProvider = context.vpDataProvider;
        this.resultFilterTimer = undefined;
        this.defaultFilterIndex = 1;
        this.initialized = false;
        this.executionError = false;
        this.resultFilterMaxIndex = 0;
        this.persistedModelIdsAtLastExecute = [];
        this.wereTherePersistedGlobalModelsAtLastExecute = false;
        this.disableselectorListEventHandling = false;

        if (this.parent.isUnitTestEnviroment() !== true) {
            this.filterControls = {
                numericInput: brease.callWidget(this.settings.parentContentId + '_' + this.settings.refIdNumericInputFilter, "widget"),
                buttonNext: brease.callWidget(this.settings.parentContentId + '_' + this.settings.refIdBtnIncrementFilterIndex, "widget"),
                buttonPrevious: brease.callWidget(this.settings.parentContentId + '_' + this.settings.refIdBtnDecrementFilterIndex, "widget"),
                processVariablesList: brease.callWidget(this.settings.parentContentId + '_' + this.settings.visionFunctionVariablesRefId, "widget"),
                buttonShowAllResults: brease.callWidget(this.settings.parentContentId + '_' + this.settings.refIdButtonShowAllResults, "widget"),
                buttonHideAllResults: brease.callWidget(this.settings.parentContentId + '_' + this.settings.refIdButtonHideAllResults, "widget"),
                selectorList: brease.callWidget(this.settings.parentContentId + '_' + this.settings.refIdSelectorListForFilter, "widget"),
                processVariablesFilter: brease.callWidget(this.settings.parentContentId + '_' + this.settings.refIdProcessVariablesFilter, "widget"),
                labelFilterInformation: brease.callWidget(this.settings.parentContentId + '_' + this.settings.refIdLabelFilterInformation, "widget")
            };
            if ((this.filterControls.numericInput != null) &&
                (this.filterControls.buttonNext != null) &&
                (this.filterControls.buttonPrevious != null) &&
                (this.filterControls.buttonShowAllResults != null) &&
                (this.filterControls.buttonHideAllResults != null) &&
                (this.filterControls.selectorList != null) &&
                (this.filterControls.processVariablesFilter != null)) {
                this.initialized = true;
            }
        }
    }

    var p = ResultFilter.prototype;


    p.determineNumberOfResults = function () {
        var numberOfResults = this.parent.vpDataProvider.getNumResults(this.settings.visionFunctionInstance);           
        if ((numberOfResults === undefined) && (this.parent.vfInstanceExecuted >= this.settings.visionFunctionInstance) && (this.parent.paramHandler.getValueOfEnableVf() === 1)) {
            numberOfResults = this.parent.paramHandler.getValueOfNumSearchMax();
        }
        numberOfResults = (numberOfResults === undefined ? 0 : numberOfResults);
        return numberOfResults;
    };

    p.determineMaxModelNumber = function () {
        var maxModelNumber = 0;
        if(this.persistedModelIdsAtLastExecute.length > 0) {
            maxModelNumber = Math.max.apply(null, this.persistedModelIdsAtLastExecute);
        }
        return maxModelNumber;
    };
    
    p.determineResultFilterMaxValue = function () {
        var filterMaxValue, maxModelNumber;
        if (this.parent.vfCapabilities.has("GlobalModel") && (!this.wereTherePersistedGlobalModelsAtLastExecute)) {
            //no global model -> deactivate result filter
            filterMaxValue = 0;
        } else {
            maxModelNumber = this.determineMaxModelNumber();
            if (this.parent.vfCapabilities.has("Models") && (maxModelNumber === 0)) {
                //no model -> deactivate result filter
                filterMaxValue = 0;
            } else {
                if (this.isFilterIndexAppliedOnModelNumber()) {
                    filterMaxValue = maxModelNumber;
                } else {
                    filterMaxValue = this.determineNumberOfResults();
                }
            }
        }
        return filterMaxValue;
    };


    p.isFilterIndexAppliedOnModelNumber = function () {
        return this.filterControls.selectorList.getSelectedIndex() == 1;
    };

    p.resetSelectorList = function () {
        if (this.filterControls.selectorList.getSelectedIndex() !== 0) {
            this.disableselectorListEventHandling = true;
            this.filterControls.selectorList.setSelectedIndex(0);
        } 
    };

    p.onSelectorListChange = function () {
        if (this.disableselectorListEventHandling)
        {
            this.disableselectorListEventHandling = false;
            return;
        }
        this.resultFilterMaxIndex = this.determineResultFilterMaxValue();
        this.applyFilterIndexOfNumericInput();
        
    };
    
    p.applyFilterIndexOfNumericInput = function () {
        this.applyFilterIndex(this.filterControls.numericInput.getValue());
    };

    
    p.applyFilterIndex = function (filterIndex) {
        this.settings.iconicsFilterIndex = filterIndex;
        this.applyResultFilter();

    };

    p.applyResultFilter = function() {
        this.updateFilterControls();
        this.applyIconicsFilter();
        this.applyPvFilter();
    };


    p.resetResultFilter = function () {
        var isWithError;
        if (this.initialized === false ||this.settings.statusReady === false || this.vpDataProvider === undefined) {
            this.disableAllFilterControls();
            return;
        }
        if (this.executionError === true) {
            isWithError = true;
            this.resetResultFilterAfterNoResults(isWithError);
            return;
        }
        this.persistedModelIdsAtLastExecute = this.parent.smartPanelModelList.getIdsOfPersistedModels();
        this.wereTherePersistedGlobalModelsAtLastExecute = Array.from(this.settings.vfGlobalModels).some(function (globalModelKeyValueArray) {
            return (Array.isArray(globalModelKeyValueArray[1]) && globalModelKeyValueArray[1].length > 0);
        });
        this.resultFilterMaxIndex = this.determineResultFilterMaxValue();
        if (this.resultFilterMaxIndex === 0) {
            isWithError = false;
            this.resetResultFilterAfterNoResults(isWithError);
            return;
        }
        this.filterControls.numericInput.setValue(this.defaultFilterIndex);
        this.applyFilterIndexOfNumericInput();
    };

    p.resetResultFilterAfterNoResults = function (isWithError) {
        var labelFilterInformationString, processVariablesFilterString;
        labelFilterInformationString = 'No result iconic data' + (isWithError ? ' due to error' : '');
        processVariablesFilterString = 'No results' + (isWithError ? ' due to error' : '');

        this.disableAllFilterControls();
        this.settings.iconicsFilterIndex = this.defaultFilterIndex;
        this.filterControls.labelFilterInformation.setText(labelFilterInformationString);
        this.filterControls.numericInput.setValue(this.defaultFilterIndex);
        this.filterControls.processVariablesFilter.setText(processVariablesFilterString);
        this.resetSelectorList();
        this.filterControls.processVariablesList.filterByIndex(this.defaultFilterIndex);
    };

    p.generateProcessVariableFilterInfoText = function (isFilterIndexAppliedOnModelNumber) {
        if (this.filterControls.processVariablesList.resultTable.resultIndexToResultKeyMapping.size <= 1) {
            return "No results";
        } 
        if (this.settings.iconicsFilterIndex === 0) {
            return "All Results";
        }
        if (isFilterIndexAppliedOnModelNumber) {
            return ('Results for Model ' + this.settings.iconicsFilterIndex);
        }
        return ('Result ' + this.settings.iconicsFilterIndex);
    };
    
    p.applyPvFilter = function () {
        var isFilterIndexAppliedOnModelNumber = this.isFilterIndexAppliedOnModelNumber();

        if (this.settings.iconicsFilterIndex > 0 && isFilterIndexAppliedOnModelNumber) {
            this.filterControls.processVariablesList.filterByModel(this.settings.iconicsFilterIndex);
        } else {
            this.filterControls.processVariablesList.filterByIndex(this.settings.iconicsFilterIndex);
        }
        this.filterControls.processVariablesFilter.setText(this.generateProcessVariableFilterInfoText(isFilterIndexAppliedOnModelNumber));
    };

    p.determineNextIconicsFilterIndexValue = function (currentValue) {
        var modelIdsBiggerThanCurrentValue,
            nextValue;

        if (this.isFilterIndexAppliedOnModelNumber()) {
            modelIdsBiggerThanCurrentValue = this.persistedModelIdsAtLastExecute.filter(function (id) {
                return id > currentValue;
            });
            if (modelIdsBiggerThanCurrentValue.length >  0) {
                nextValue = Math.min.apply(null, modelIdsBiggerThanCurrentValue);
            } else {
                nextValue = this.resultFilterMaxIndex;
            }
        } else {
            nextValue = currentValue + 1;
        }
        return nextValue;
    };

    p.showNextResult = function () {
        var currentValue = this.filterControls.numericInput.getValue();
        if (currentValue < this.resultFilterMaxIndex) {
            this.settings.iconicsFilterIndex = this.determineNextIconicsFilterIndexValue(currentValue);
            this.filterControls.numericInput.setValue(this.settings.iconicsFilterIndex);
            this.applyResultFilter();
        } else {
            this.filterControls.buttonNext.setEnable(false);
        }
    };

    p.determinePreviousIconicsFilterValue = function (currentValue) {
        var modelIdsSmallerThanCurrentValue,
            previousValue;

        if (this.isFilterIndexAppliedOnModelNumber()) {
            modelIdsSmallerThanCurrentValue = this.persistedModelIdsAtLastExecute.filter(function (id) {
                return id < currentValue;
            });
            if (modelIdsSmallerThanCurrentValue.length >  0) {
                previousValue = Math.max.apply(null, modelIdsSmallerThanCurrentValue);
            } else {
                previousValue = 0;
            } 
        } else {
            previousValue = currentValue - 1;
        }
        return previousValue;
    };
   
    p.showPreviousResult = function () {
        var currentValue = this.filterControls.numericInput.getValue();
        if (currentValue > 0) {
            this.settings.iconicsFilterIndex = this.determinePreviousIconicsFilterValue(currentValue);
            this.filterControls.numericInput.setValue(this.settings.iconicsFilterIndex);
            this.applyResultFilter();
        } else {
            this.filterControls.buttonPrevious.setEnable(false);
        }
    };

    p.updateFilterControls = function () {
        this.settings.iconicsFilterIndex = Math.min(this.resultFilterMaxIndex, this.settings.iconicsFilterIndex);
        this.filterControls.numericInput.setMaxValue(this.resultFilterMaxIndex);
        this.filterControls.numericInput.setEnable(true);
        this.filterControls.selectorList.setEnable(true);
        this.filterControls.numericInput.setMaxValue(this.resultFilterMaxIndex);
        this.filterControls.numericInput.setValue(this.settings.iconicsFilterIndex);
        this.filterControls.buttonNext.setEnable(this.settings.iconicsFilterIndex < this.resultFilterMaxIndex);
        this.filterControls.buttonPrevious.setEnable(this.settings.iconicsFilterIndex > 0);
        this.filterControls.buttonHideAllResults.setEnable(this.settings.resultClouds.length > 0);
        this.filterControls.buttonShowAllResults.setEnable(this.settings.resultClouds.length > 0);  
    };

    p.disableAllFilterControls = function () {
        this.filterControls.numericInput.setEnable(false);
        this.filterControls.buttonNext.setEnable(false);
        this.filterControls.buttonPrevious.setEnable(false);
        this.filterControls.buttonShowAllResults.setEnable(false);
        this.filterControls.buttonHideAllResults.setEnable(false);
        this.filterControls.selectorList.setEnable(false);
        this.filterControls.processVariablesFilter.setEnable(false);
    };


    p.generateIconicFilterInfoText = function (isFilterIndexAppliedOnModelNumber, numberOfResults, baseVerb) {
        var labelFilterInformationString;
        
        if (numberOfResults === 0) {
            labelFilterInformationString = 'No result iconic data ';
            labelFilterInformationString += (isFilterIndexAppliedOnModelNumber ? '- Model: ' : '- Result: ') + this.settings.iconicsFilterIndex;
            return labelFilterInformationString;
        }
        labelFilterInformationString =  baseVerb + ' result iconic data ';
        labelFilterInformationString += (isFilterIndexAppliedOnModelNumber ? '- Model: ' : '- Result: ') + this.settings.iconicsFilterIndex;
        if (isFilterIndexAppliedOnModelNumber) {
            labelFilterInformationString +=  ' - found: ' + numberOfResults + (numberOfResults === 1 ? ' result' : ' results');
        }
        return labelFilterInformationString;
    };


    p.hideAllResultIconics = function () {
        var results = new Set(),
            labelFilterInformationString;

        this.settings.resultClouds.forEach(function (iconic) {
            iconic.hide();
            results.add(iconic.dataResultIndex);
        });
        labelFilterInformationString = 'Hiding all result iconic data - Total number of results: ' + results.size;
        this.filterControls.labelFilterInformation.setText(labelFilterInformationString);
    };

    p.showAllResultIconics = function () {
        var results = new Set(),
        labelFilterInformationString;
        
        this.settings.resultClouds.forEach(function (iconic) {
            iconic.redraw();
            results.add(iconic.dataResultIndex);
        });

        labelFilterInformationString = 'Showing all result iconic data - Total number of results: ' + results.size;
        this.filterControls.labelFilterInformation.setText(labelFilterInformationString);
    };

    p.hideAllFilteredResultIconics = function () {
        var results = new Set(),
        labelFilterInformationString,
        filterCriterion,
        isFilterIndexAppliedOnModelNumber = this.isFilterIndexAppliedOnModelNumber();

        this.settings.resultClouds.forEach(function (iconic) {
            iconic.hide();
            filterCriterion = isFilterIndexAppliedOnModelNumber ? iconic.dataModels : iconic.dataResultIndex;
            if (filterCriterion === this.settings.iconicsFilterIndex) {
                results.add(iconic.dataResultIndex);
            }
        }, this);
        labelFilterInformationString = this.generateIconicFilterInfoText(isFilterIndexAppliedOnModelNumber, results.size, 'Hiding all');
        this.filterControls.labelFilterInformation.setText(labelFilterInformationString);
    };

    p.highlightFilteredResultIconics = function () {
        var results = new Set(),
        labelFilterInformationString,
        filterCriterion,
        isFilterIndexAppliedOnModelNumber = this.isFilterIndexAppliedOnModelNumber();

        this.settings.resultClouds.forEach(function (iconic) {
            filterCriterion = isFilterIndexAppliedOnModelNumber ? iconic.dataModels : iconic.dataResultIndex;
            if (filterCriterion === this.settings.iconicsFilterIndex) {
                results.add(iconic.dataResultIndex);
                iconic.highlight();
            } else {
                iconic.redraw();
            }
        }, this);
        labelFilterInformationString = this.generateIconicFilterInfoText(isFilterIndexAppliedOnModelNumber, results.size, 'Highlighting');
        this.filterControls.labelFilterInformation.setText(labelFilterInformationString);
                
    };

    p.showOnlyFilteredResultIconics = function () {
        var results = new Set(),
        labelFilterInformationString,
        filterCriterion,
        isFilterIndexAppliedOnModelNumber = this.isFilterIndexAppliedOnModelNumber();

        this.settings.resultClouds.forEach(function (iconic) {
            filterCriterion = isFilterIndexAppliedOnModelNumber ? iconic.dataModels : iconic.dataResultIndex;
            if (filterCriterion === this.settings.iconicsFilterIndex) {
                results.add(iconic.dataResultIndex);
                iconic.highlight();
            } else {
                iconic.hide();
            }
        }, this);
        labelFilterInformationString = this.generateIconicFilterInfoText(isFilterIndexAppliedOnModelNumber, results.size, 'Showing');
        this.filterControls.labelFilterInformation.setText(labelFilterInformationString);
                
    };


    p.applyIconicsFilter = function () {
        var isHideAllResultsToggleButtonPressed = this.filterControls.buttonHideAllResults.getValue(),
            isShowAllResultsToggleButtonPressed = this.filterControls.buttonShowAllResults.getValue();

        if (this.settings.resultClouds.length === 0) {
            this.filterControls.labelFilterInformation.setText("No result iconic data");
            return;
        }
        if (this.settings.iconicsFilterIndex === 0) {
            if (isHideAllResultsToggleButtonPressed) {
                this.hideAllResultIconics();
            } else {
                this.showAllResultIconics();
            }
        } else {
            if (isHideAllResultsToggleButtonPressed) {
                this.hideAllFilteredResultIconics();
            } else if (isShowAllResultsToggleButtonPressed) {
                this.highlightFilteredResultIconics();
            } else {
                this.showOnlyFilteredResultIconics();
            }
        }
    };

    return ResultFilter;
});