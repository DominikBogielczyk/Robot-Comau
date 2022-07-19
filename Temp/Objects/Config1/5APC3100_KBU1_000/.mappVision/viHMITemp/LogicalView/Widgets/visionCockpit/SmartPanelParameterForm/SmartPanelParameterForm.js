/*global define, brease, $*/
define(['brease/core/BaseWidget',
    'brease/events/BreaseEvent',
    'brease/decorators/VisibilityDependency',
    'brease/config/NumberFormat',
    'brease/core/Utils',
    'brease/helper/Scroller',
    'brease/enum/Enum'
], function (SuperClass, BreaseEvent, VisibiliyDependency, NumberFormat, Utils, Scroller, Enum) {

    'use strict';

    /**
     * @class widgets.visionCockpit.SmartPanelParameterForm      
     * #Description
     * shows the parameter of a selected Vision Function
     * 
     * @breaseNote 
     * @extends brease.core.BaseWidget
     * @requires widgets.brease.Label
     * @requires widgets.brease.NumericInput
     * @requires widgets.brease.TextInput
     * @requires widgets.brease.DropDownBox
     * @requires widgets.brease.Table 
     * @requires widgets.brease.TableItem 
     * @requires widgets.brease.TabControl  
     * @requires widgets.brease.TableItemWidget   
     *  
     *
     * @iatMeta category:Category
     * Process
     * @iatMeta description:short
     * Parameter Form
     * @iatMeta description:de
     * (INTERNAL USE ONLY) Zeigt die Parameter der selektierten Vision Funktion an
     * @iatMeta description:en
     * (INTERNAL USE ONLY) shows the parameter of a selected Vision Function
     */

    /**
     * @cfg {StyleReference} labelStyle='default' 
     * @iatStudioExposed
     * @iatCategory Appearance
     * @typeRefId widgets.brease.Label
     * Styling of the paramter labels. 
     */

    /**
     * @cfg {StyleReference} numericInputStyle='default'
     * @iatStudioExposed
     * @iatCategory Appearance
     * @typeRefId widgets.brease.NumericInput
     * Styling of numeric input fields. 
     */

    /**
     * @cfg {StyleReference} textInputStyle='default'
     * @iatStudioExposed
     * @iatCategory Appearance
     * @typeRefId widgets.brease.Textinput
     * Styling of text input fields. 
     */

    /**
     * @cfg {StyleReference} textOutputStyle='default'
     * @iatStudioExposed
     * @iatCategory Appearance
     * @typeRefId widgets.brease.TextOutput
     * Styling of text output fields. 
     */

    /**
     * @cfg {StyleReference} dropDownBoxStyle='default'
     * @iatStudioExposed
     * @iatCategory Appearance
     * @typeRefId widgets.brease.DropDownBox
     * Styling of drop down boxes. 
     */

    /**
     * @cfg {Integer} dropDownBoxListWidth= 150
     * @iatStudioExposed
     * @iatCategory Layout DropDownBox
     */

  
    /**
     * @cfg {Boolean} useTableWidgetForResultsList =false  
     * @iatStudioExposed    
     * @iatCategory Data
     * Define the table widget for results list 
     */

    var defaultSettings = {
            labelStyle: 'default',
            useTableWidgetForResultsList: false,
            numericInputStyle: 'default',
            textInputStyle: 'default',
            textOutputStyle: 'default',
            dropDownBoxStyle: 'default',
            numPadStyle: 'viHMIDefault',
            padding: 20,
            parameters: [],
            dropDownBoxListWidth: 150,
            sortCriterion: 0, // sort by name
            lastFilterIndex: 1,
            isFilterIndexAppliedOnModelNumber: false,
            isModelNumberMappedAsVpOutput: false,
            numResults: 0
        },


        WidgetClass = SuperClass.extend(function SmartPanelParameterForm() {
            SuperClass.apply(this, arguments);
        }, defaultSettings),

        p = WidgetClass.prototype;

    p.init = function () {

        if (this.settings.omitClass !== true) {
            this.addInitialClass('visionCockpitSmartPanelParameterForm');
        }
        this.scrollContainer = $('<div class="scrollContainer">');
        this.drawContainer = $('<div class="drawContainer">');
        this.labelContainer = $('<div class="ParamRowContainer">');
        this.inputContainer = $('<div class="ParamRowContainer">');
        this.tableContainer = $('<div class="ParamRowContainer">');
        this.inputContainer.on("ValueChanged", this._bind('_valueChangedHandler'));
        this.inputContainer.on("SelectedIndexChanged", this._bind('_indexChangedHandler'));

        this.resultTable = {
            'resultValues': new Map(),
            'viewModel': new Map(),
            'resultIndexToResultKeyMapping': new Map(),
            'modelNumberToResultIndexMapping': new Map(),
            'resultIndexToModelNumberMapping': new Map()
        };

        if (brease.config.editMode) {
            // we only got events for appended elements in iat-designer... 
            this.drawContainer.append(this.labelContainer);
            this.drawContainer.append(this.inputContainer);
            this.scrollContainer.append(this.drawContainer);
            this.scrollContainer.append(this.tableContainer);

            this.el.append(this.scrollContainer);
            _initEditor(this);
            _addChildWidgets(this);
        } 
        SuperClass.prototype.init.call(this);
    };

    p.setHeight = function (height) {
        SuperClass.prototype._setHeight.apply(this, arguments);
        this.elem.style.height = parseInt(height) + 'px';
    };


    p.sortProcessVariables = function (sortCriterion) {
        this.settings.sortCriterion = sortCriterion;
        if ((this.state === Enum.WidgetState.READY) && (this.settings.allChildWidgetsReady)) {
            this.drawResultTable();
        } else {
            this.postponeDrawResultTable = true;
        }
    };


    /**
     * @method filterByIndex        
     * @param {UInteger} filterIndex
     * @iatStudioExposed
     */
    p.filterByIndex = function (filterIndex) {
        this.settings.lastFilterIndex = filterIndex;
        this.settings.isFilterIndexAppliedOnModelNumber = false;
        if ((this.state === Enum.WidgetState.READY) && (this.settings.allChildWidgetsReady)) {
            this.drawResultTable();
        } else {
            this.postponeDrawResultTable = true;
        }
    };


    p.filterByModel = function (filterIndex) {
        this.settings.lastFilterIndex = filterIndex;
        this.settings.isFilterIndexAppliedOnModelNumber = true;

        if ((this.state === Enum.WidgetState.READY) && (this.settings.allChildWidgetsReady)) {
            this.drawResultTable();
        } else {
            this.postponeDrawResultTable = true;
        }
    };

    p.drawResultTable = function () {
        var widget = this,
            table = brease.callWidget(widget.tableIds[0], "widget"),
            colLabel = brease.callWidget(widget.tableIds[1], "widget"),
            colValue = brease.callWidget(widget.tableIds[2], "widget"),
            colUnit = brease.callWidget(widget.tableIds[3], "widget"),
            filterIndex = this.settings.lastFilterIndex,
            TableWidth = "458px",
            modelNumber,
            resultIndices,
            resultKeys,
            visibleLabels = [],
            visibleValues = [],
            valueObjects = [],
            visibleUnits = [],
            mapSortedValueObjects = [];
        if (table === null) {
            return;
        }
        // we only want to do this once, move it somewhere else
        if (typeof table.placedInDatabase === 'function') {
            table.placedInDatabase();
        }
        if (colLabel && colValue && colUnit) {
            if ( filterIndex === 0) {
                valueObjects = Array.from(widget.resultTable.resultValues.values());
            }
            else {
                resultKeys = widget.resultTable.resultIndexToResultKeyMapping.get(undefined);
                resultKeys = (resultKeys === undefined) ? new Set(): resultKeys;
                resultKeys.forEach(function (key) {
                    valueObjects.push(widget.resultTable.resultValues.get(key));
                });
                
                if (widget.settings.isFilterIndexAppliedOnModelNumber) {
                    modelNumber = filterIndex;
                    resultIndices = widget.resultTable.modelNumberToResultIndexMapping.get(modelNumber);
                    resultIndices = (resultIndices === undefined) ? new Set(): resultIndices;
                    resultIndices.forEach(function (index) {
                        resultKeys = widget.resultTable.resultIndexToResultKeyMapping.get(index);
                        resultKeys = (resultKeys === undefined) ? new Set(): resultKeys;
                        resultKeys.forEach(function (key) {
                            valueObjects.push(widget.resultTable.resultValues.get(key));
                        });
                    });                    
                } else {
                    resultKeys = widget.resultTable.resultIndexToResultKeyMapping.get(filterIndex);
                    resultKeys = (resultKeys === undefined) ? new Set(): resultKeys;
                    resultKeys.forEach(function (key) {
                        valueObjects.push(widget.resultTable.resultValues.get(key));
                     });
                }
            }

            switch (widget.settings.sortCriterion) {
                case 0:
                    valueObjects.sort(widget.sortResultsByName);
                    break;
                case 1:
                    valueObjects.sort(widget.sortResultsByIndex);
                    break;
                case 2:
                    mapSortedValueObjects = valueObjects.map(function (valueObject) {
                        return {'valueObject': valueObject, 'modelNumber': widget.resultTable.resultIndexToModelNumberMapping.get(valueObject.index)};
                    });
                    mapSortedValueObjects.sort(widget.sortResultsByModelNumber);
                    valueObjects = mapSortedValueObjects.map(function (extendedValueObject) {
                        return extendedValueObject.valueObject;                         
                    });
                    break;
                default:
                    break;
            }
            
            valueObjects.forEach(function (valueObject) {     
                    visibleLabels.push(valueObject.label);
                    visibleValues.push(valueObject.value);
                    visibleUnits.push(valueObject.unit);
            });
            
            // since this is not a standard usecase we have to purge the data from the table since
            // the sice of the arrays magically change - non OPCUA arrays
            if (typeof table.purgeDatabaseData === 'function') {
                table.purgeDatabaseData();
            }
            colLabel.setStringValue(visibleLabels);
            colValue.setStringValue(visibleValues);
            colUnit.setStringValue(visibleUnits);
        }

        table.elem.style.height = "auto";

        if (table.renderer.tableWrapper) {
            table.renderer.tableWrapper.find('.dataTables_scrollBody')[0].style.height = 'auto';
        }
        table.elem.style.width = TableWidth;
        this._refreshScroller();
    };

    p.sortResultsByIndex = function (a, b) {
        if (a.index && b.index) {
            if (a.index < b.index) {
                return -1;
            }
            if (a.index > b.index) {
                return 1;
            }
        }
        return 0;
    };

    p.sortResultsByModelNumber = function (a, b) {
        
        if (a.modelNumber !== undefined && b.modelNumber !== undefined){
            if ((a.modelNumber === b.modelNumber) && a.valueObject.index !== undefined && b.valueObject.index !== undefined ) {
                return a.valueObject.index - b.valueObject.index;
            }
            return a.modelNumber - b.modelNumber;
        }

        if (a.valueObject.index === undefined && b.valueObject.index === undefined){
            return 0;
        }
        if (a.valueObject.index === undefined){
            return -1;
        }
        if (b.valueObject.index === undefined){
            return 1;
        }
        if (a.modelNumber !== undefined && b.modelNumber === undefined){
            return -1;
        }
        if (a.modelNumber === undefined && b.modelNumber !== undefined){
            return 1;
        }
        return 0;
    };




    p.sortResultsByName = function (a, b) {
        var sa, sb;
        if (a.index && b.index && a.label && b.label) {
            sa = a.label.replace(/\d+/g, '') + a.index.toString().padStart(4, "0");
            sb = b.label.replace(/\d+/g, '') + b.index.toString().padStart(4, "0");

            if (sa < sb) {
                return -1;
            }
            if (sa > sb) {
                return 1;
            }
        }
        return 0;
    };

    /**
     * @method setDropDownBoxListWidth
     * @param {Integer} dropDownBoxListWidth
     */
    p.setDropDownBoxListWidth = function (dropDownBoxListWidth) {
        this.settings.dropDownBoxListWidth = dropDownBoxListWidth;
    };

    /**
     * @method getDropDownBoxListWidth
     * @return {Integer} dropDownBoxListWidth
     */
    p.getDropDownBoxListWidth = function () {
        return this.settings.dropDownBoxListWidth;
    };



    p.disable = function () {
        SuperClass.prototype.disable.apply(this, arguments);
        if (this.initialized !== true) {
            _selectChildren(this.inputContainer).each(function () {
                if (brease.uiController.callWidget(this.id, "setParentEnableState", false) === null) {
                    brease.uiController.addWidgetOption(this.id, 'parentEnableState', false);
                }
            });
            _selectChildren(this.labelContainer).each(function () {
                if (brease.uiController.callWidget(this.id, "setParentEnableState", false) === null) {
                    brease.uiController.addWidgetOption(this.id, 'parentEnableState', false);
                }
            });
        }
    };

    p._onWidgetReadySetEnableStatus = function () {
        // should be set to false in addChildWidgets but there is a bug in the scroller
        this._enableHandler(); //fixes state 
        for (var i = 0; i < this.settings.parameters.length; i++) {
            if (this.settings.parameters[i].isNoInput && (this.tableIds != undefined)) { // Output and table exists
                continue;
            }

            var hasPermission = (this.settings.editable && this.settings.permissions.operate);
            if (this.settings.parameters[i].isNoInput || this.settings.parameters[i].isReadOnlyInput || !this.settings.enable || !hasPermission) {
                brease.uiController.callWidget(this.inputElements[i].id, "setEnable", false);
            }
        }
    };

    p._enableHandler = function () {
        var disabled,
            that = this,
            childElement;

        SuperClass.prototype._enableHandler.apply(this, arguments);
        disabled = this.isDisabled;

        _selectChildren(this.inputContainer).each(function () {
            childElement = _getChildElementByWidgetId(this.id, that.inputElements);
            if (childElement && childElement.options.direction === "Input") {
                if ((childElement.options.readonly === true)) {
                    brease.callWidget(this.id, "setEnable", false);
                } else {
                    brease.callWidget(this.id, "setEnable", !disabled);
                }
            }
        });
        _selectChildren(this.labelContainer).each(function () {
            childElement = _getChildElementByWidgetId(this.id, that.labelElements);
            if (childElement && childElement.options.direction === "Input") {
                if ((childElement.options.readonly === true)) {
                    brease.callWidget(this.id, "setEnable", false);
                } else {
                    brease.callWidget(this.id, "setEnable", !disabled);
                }
            }

        });
    };

    function _getChildElementByWidgetId(widgetId, list) {
        var childOptions;
        list.forEach(function (widgetElem) {
            if (widgetElem.id === widgetId) {
                childOptions = widgetElem;
            }
        });
        return childOptions;
    }

    p.wake = function () {
        this.inputContainer.on("ValueChanged", this._bind('_valueChangedHandler'));
        this.inputContainer.on("SelectedIndexChanged", this._bind('_indexChangedHandler'));
        SuperClass.prototype.wake.apply(this, arguments);
    };

    p.suspend = function () {
        this.inputContainer.off();
        this.settings.parameters = undefined;
        _removeChildWidgets(this);
        SuperClass.prototype.suspend.apply(this, arguments);
    };

    p.dispose = function () {
        this.inputContainer.off();
        _removeChildWidgets(this);
        SuperClass.prototype.dispose.apply(this, arguments);
    };

    /**
     * @method setLabelStyle
     * Sets labelStyle
     * @param {StyleReference} labelStyle
     */
    p.setLabelStyle = function (labelStyle) {
        this.settings.labelStyle = labelStyle;
        if (brease.config.editMode) {
            _selectChildrenInEditor(this.labelContainer).each(function () {
                if (brease.uiController.callWidget(this.id, 'setStyle', labelStyle) === null) {
                    brease.uiController.addWidgetOption(this.id, 'setStyle', labelStyle);
                }
            });
        }
    };

    /**
     * @method getLabelStyle 
     * Returns labelStyle.
     * @return {StyleReference}
     */
    p.getLabelStyle = function () {
        return this.settings.labelStyle;
    };

    /**
     * @method setNumericInputStyle
     * Sets numericInputStyle
     * @param {StyleReference} numericInputStyle
     */
    p.setNumericInputStyle = function (numericInputStyle) {
        this.settings.numericInputStyle = numericInputStyle;
        if (brease.config.editMode) {
            _selectChildrenInEditor(this.inputContainer).each(function () {
                if (brease.uiController.callWidget(this.id, 'setStyle', numericInputStyle) === null) {
                    brease.uiController.addWidgetOption(this.id, 'setStyle', numericInputStyle);
                }
            });
        }
    };

    /**
     * @method getNumericInputStyle 
     * Returns numericInputStyle.
     * @return {StyleReference}
     */
    p.getNumericInputStyle = function () {
        return this.settings.numericInputStyle;
    };

    /**
     * @method setTextInputStyle
     * Sets textInputStyle
     * @param {StyleReference} textInputStyle
     */
    p.setTextinputStyle = function (textInputStyle) {
        this.settings.textInputStyle = textInputStyle;
        if (brease.config.editMode) {
            _selectChildrenInEditor(this.inputContainer).each(function () {
                if (brease.uiController.callWidget(this.id, 'setStyle', textInputStyle) === null) {
                    brease.uiController.addWidgetOption(this.id, 'setStyle', textInputStyle);
                }
            });
        }
    };

    /**
     * @method getTextinputStyle 
     * Returns textInputStyle.
     * @return {StyleReference}
     */
    p.getTextinputStyle = function () {
        return this.settings.textInputStyle;
    };

    /**
     * @method setTextOutputStyle
     * Sets textOutputStyle
     * @param {StyleReference} textOutputStyle
     */
    p.setTextOutputStyle = function (textOutputStyle) {
        this.settings.textOutputStyle = textOutputStyle;
        if (brease.config.editMode) {
            _selectChildrenInEditor(this.inputContainer).each(function () {
                if (brease.uiController.callWidget(this.id, 'setStyle', textOutputStyle) === null) {
                    brease.uiController.addWidgetOption(this.id, 'setStyle', textOutputStyle);
                }
            });
        }
    };

    /**
     * @method getTextOutputStyle 
     * Returns textOutputStyle.
     * @return {StyleReference}
     */
    p.getTextOutputStyle = function () {
        return this.settings.textOutputStyle;
    };

    /**
     * @method setDropDownBoxStyle
     * Sets dropDownBoxStyle
     * @param {StyleReference} dropDownBoxStyle
     */
    p.setDropDownBoxStyle = function (dropDownBoxStyle) {
        this.settings.dropDownBoxStyle = dropDownBoxStyle;
        if (brease.config.editMode) {
            _selectChildrenInEditor(this.inputContainer).each(function () {
                if (brease.uiController.callWidget(this.id, 'setStyle', dropDownBoxStyle) === null) {
                    brease.uiController.addWidgetOption(this.id, 'setStyle', dropDownBoxStyle);
                }
            });
        }
    };

    /**
     * @method getDropDownBoxStyle 
     * Returns textinputStyle.
     * @return {StyleReference}
     */
    p.getDropDownBoxStyle = function () {
        return this.settings.dropDownBoxStyle;
    };


    /**
     * @method setData  initializing data for parameterform
     * @param {Array} data array containing all parameters as objects  name, type and value
     */
    p.setData = function (data) {
        this.settings.lastData = undefined;
        this.settings.lastInputData = undefined;
        this.settings.lastOutputData = undefined;
        this.resultTable.resultValues.clear();
        this.resultTable.modelNumberToResultIndexMapping.clear();
        this.resultTable.resultIndexToModelNumberMapping.clear();
        this.resultTable.resultIndexToResultKeyMapping.clear();

        if (data) {
            this.settings.parameters = $.extend(true, [], data);
            _replaceChildWidgets(this);
        } else { // if the data are not as excepted
            this.settings.parameters = undefined;
            _removeChildWidgets(this);
        }
    };

    p.setUpdateSource = function (source) {
        this.settings.updateSource = source;
    };

    p.getUpdateSource = function () {
        return this.settings.updateSource;
    };

    /**
     * @method update
     * @return {Array} array containing all parameters as objects  name, type and value
     **/
    p.update = function (data, direction) {
        var key;
        if (this.settings.allChildWidgetsReady) {
            this.setUpdateSource('internal');
            for (key in data) {
                if (data.hasOwnProperty(key)) {
                    this._changeValue(key, data[key], direction);
                }
            }
            this.setUpdateSource(undefined);

            if ((this.settings.useTableWidgetForResultsList === true) && (direction === "Output")) {
                if(this.evaluateImageProcessingError(data) === true){
                    this.updateResultTableImageProcessingError(data);    
                }else{
                    this.updateResultTableData(data);
                }

                if (this.state === Enum.WidgetState.READY) {
                    this.drawResultTable();
                } else {
                    this.postponeDrawResultTable = true;
                }
            }


        } else {
            for (key in data) {
                if (data.hasOwnProperty(key)) {
                    this._updateData(key, data[key], direction);
                }
            }
            if (direction === "Input") {
                this.settings.lastInputData = data;
            } else if (direction === "Output") {
                this.settings.lastOutputData = data;
            } else {
                this.settings.lastData = data;
            }
        }
    };

    p.evaluateImageProcessingError = function (data) {
        var result = false;

        if (data && data.ImageProcessingError) {
            result = data.ImageProcessingError === 0 ? false : true;

        }
        return result;
    };

    p.updateResultTableImageProcessingError = function (data) {
        var widget = this,
            key = "ImageProcessingError",
            keySet = new Set(),
            resultValue = {
                'label': key,
                'value': data.ImageProcessingError
            };

        if ((widget.tableIds === undefined) || (widget.tableIds.length < 3)) {
            return;
        }
        keySet.add(key);
        widget.resultTable.resultValues.clear();
        widget.resultTable.modelNumberToResultIndexMapping.clear();
        widget.resultTable.resultIndexToModelNumberMapping.clear();
        widget.resultTable.resultIndexToResultKeyMapping.clear();
        widget.resultTable.resultIndexToResultKeyMapping.set(undefined, keySet);
        widget.resultTable.resultValues.set(key, resultValue);
    };

    p.isModelNumberMappedAsVpOutput = function () {
        return this.settings.isModelNumberMappedAsVpOutput;
    };

    p.updateResultTableData = function (data) {
        var widget = this,
            colLabel,
            colValue,
            colUnit,
            outFormat,
            outOptions,
            unit,
            unitSymbol,
            type,
            textOut,
            i, key,
            outVal,
            mms,
            numberFormat,
            resultIndex,
            valueWithLinearTransform,
            oldModelNumber,
            modelNumber,
            resultValue,
            resultKeys,
            resultIndices;

        this.settings.isModelNumberMappedAsVpOutput = false;
        if ((widget.tableIds === undefined) || (widget.tableIds.length < 3)) {
            return;
        }

        colLabel = brease.callWidget(widget.tableIds[1], "widget");
        colValue = brease.callWidget(widget.tableIds[2], "widget");
        colUnit = brease.callWidget(widget.tableIds[3], "widget");

        if ((colLabel === null) || (colValue === null) || (colUnit === null)  ) {
            return;
        }

        for (i = 0; i < widget.settings.parameters.length; i++) {
            if (widget.settings.parameters[i].isNoInput) {
                key = widget.settings.parameters[i].name;

                if (data && data.hasOwnProperty(key)) {
                    if (key === "NumResults") {
                        widget.settings.numResults = data[key]; // used by filtering for calculation of max index to list if filter index is 0 
                    }
                    unit = widget.settings.parameters[i].unit;
                    type = widget.settings.parameters[i].type;
                    resultIndex = widget.settings.parameters[i].ResultIndex;

                    outFormat = widget.resultTable.viewModel.get(key);
                    if (outFormat) {
                        outOptions = outFormat.options;
                        outVal = data[key];

                        if (outOptions.divisor) {
                            valueWithLinearTransform = (outOptions.multiplicand * ((outVal + outOptions.initialAddend) / outOptions.divisor)) + outOptions.finalAddend;
                            Number(valueWithLinearTransform.toString().replace(',', '.'));
                            outVal = valueWithLinearTransform;
                        }

                        switch (type) {
                            case "integer":
                            case "number":
                            case "double":
                                mms = brease.measurementSystem.getCurrentMeasurementSystem();
                                numberFormat = NumberFormat.getFormat(outOptions.format, mms);
                                textOut = brease.formatter.formatNumber(outVal, numberFormat, outOptions.useDigitGrouping);
                                break;

                            case "string":
                                textOut = data[key];
                                break;

                            case "selection":
                                textOut = getSelectedTextOfTheDataProvider(outOptions.dataProvider, outVal);
                                break;
                        }

                        if (widget.settings.parameters[i].unitSymbol) {
                            unitSymbol = widget.settings.parameters[i].unitSymbol;
                        } else {
                            unitSymbol = ''; 
                        }

                        resultValue = {
                            'label': key,
                            'value': textOut,
                            'unit': unitSymbol,
                            'index': resultIndex
                        };

                        widget.resultTable.resultValues.set(key, resultValue);

                        resultKeys = widget.resultTable.resultIndexToResultKeyMapping.get(resultIndex);
                        resultKeys = (resultKeys === undefined) ? new Set() : resultKeys;
                        resultKeys.add(key);
                        widget.resultTable.resultIndexToResultKeyMapping.set(resultIndex, resultKeys);

                        if (key.startsWith('ModelNumber')) {
                            widget.settings.isModelNumberMappedAsVpOutput = true;
                            modelNumber = parseInt(resultValue.value);
                            
                            oldModelNumber = widget.resultTable.resultIndexToModelNumberMapping.get(resultValue.index);
                            if ((oldModelNumber !== undefined) && (oldModelNumber !== modelNumber)) {
                                widget.resultTable.modelNumberToResultIndexMapping.get(oldModelNumber).delete(resultValue.index);
                            }
                            
                            if (modelNumber !== 0) {
                                widget.resultTable.resultIndexToModelNumberMapping.set(resultValue.index, modelNumber);
                                resultIndices = widget.resultTable.modelNumberToResultIndexMapping.get(modelNumber);
                                resultIndices = (resultIndices === undefined) ? new Set() : resultIndices;
                                resultIndices.add(resultValue.index);
                                widget.resultTable.modelNumberToResultIndexMapping.set(modelNumber, resultIndices);
                            }
                        }
                    }
                }
            }
        }
    };

    function getSelectedTextOfTheDataProvider(dataProvider, value) {
        var selectedTextOfDataProvider, selectedElemOfDataProvider;

        selectedElemOfDataProvider = dataProvider.find(function (dataProvider) {
            if(value !== undefined){ 
                return dataProvider.value === value.toString();
            }
        });

        if (selectedElemOfDataProvider !== undefined) {
            selectedTextOfDataProvider = selectedElemOfDataProvider.text;
        } else {
            selectedTextOfDataProvider = "";
        }

        return selectedTextOfDataProvider;
    }

    /**
     * @method getData
     * @return {Array} array containing all parameters as objects  name, type and value
     */
    p.getData = function () {
        if (this.settings.parameters) {
            return this.settings.parameters;

            //extracts properties of object this.settings.lastData  e.g
            //and updates the value properties inside the copy "shadowParameters" of the list this.settings.parameters 
            //e.g.   {"property1": value1, "property2": value2, ...}  -> [{"name": "property1", "value": value1, "type": "integer", ...}, {"name": "property2", "value": value2, "type": "double", ...}, .... ]




            //private function
        }
    };

    p._getValueWithLinearTransform = function (outputWidget, newValue) {
        var valueWithLinearTransform;
        valueWithLinearTransform = (outputWidget.settings.multiplicand * ((newValue + outputWidget.settings.initialAddend) / outputWidget.settings.divisor)) + outputWidget.settings.finalAddend;
        Number(valueWithLinearTransform.toString().replace(',', '.'));
        return valueWithLinearTransform;
    };

    p._updateData = function (refName, newValue, direction) {
        var context = this;
        this.labelElements.forEach(function (labelWidgetElem, index) {
            if (labelWidgetElem.options.text === refName) {
                if (!direction || labelWidgetElem.options.direction === "Input") {
                    context.settings.parameters[index].value = newValue;
                }
            }
        });
    };

    p._updateVisibleValue = function (valueWidget, index, newValue) {
        var valueWithLinearTransform;
        if ((this.inputElements[index].className === 'widgets.brease.NumericInput') || (this.inputElements[index].className === 'widgets.brease.TextInput') || (this.inputElements[index].className === 'widgets.brease.TextOutput')) {
            if (valueWidget.settings.divisor !== undefined) {
                valueWithLinearTransform = this._getValueWithLinearTransform(valueWidget, newValue);
                valueWidget.setValue(valueWithLinearTransform);
            } else {
                valueWidget.setValue(newValue);
            }
        } else if (this.inputElements[index].className === 'widgets.brease.DropDownBox') {
            valueWidget.setSelectedValue('' + newValue);
        }
    };
  
    p._changeValue = function (refName, newValue, direction) {
        var context = this,
            valueWidget;
        this.labelElements.forEach(function (labelWidgetElem, index) {
            if (labelWidgetElem.options.text === refName) {
                if (!direction || (labelWidgetElem.options.direction === direction)) {
                    valueWidget = brease.callWidget(context.inputElements[index].id, "widget");
                    if (valueWidget === null) {
                        return;
                    }
                    context._updateVisibleValue(valueWidget, index, newValue);
                    context.settings.parameters[index].value = newValue;
                }
            }
        });
    };
 
    p.isUnitTestEnviroment = function () {
        var isUnitTestEnviroment;
        if (this.settings.parentContentId !== brease.settings.globalContent) {
            isUnitTestEnviroment = false;
        } else {
            isUnitTestEnviroment = true;
        }
        return isUnitTestEnviroment;
    };

    p._callExternalWidget = function () {
        if (this.isUnitTestEnviroment() === false) {
            return brease.callWidget.apply(this, arguments);
        } else {
            return window.fakeWidgetCaller();
        }
    };

    p._indexChangedHandler = function (e) {
        var i = this.inputIds.findIndex(function (elem) {
            if (this === elem) {
                return true;
            }
            return false;
        }, e.target.id);

        if ((i !== -1) && (this.settings.parameters[i]) && (this.isIndexChanged(this.settings.parameters[i].value, e.detail.selectedValue) === true)) {
            if (isNaN(e.detail.selectedValue)) {
                this.settings.parameters[i].value = this._callExternalWidget(e.target.id, 'getSelectedValue');
            } else {
                this.settings.parameters[i].value = parseInt(this._callExternalWidget(e.target.id, 'getSelectedValue'));
            }
            if (this.getUpdateSource() !== 'internal') {
                $('#' + this.elem.id).trigger("parameterValueChanged", [this.settings.parameters[i].name, this.settings.parameters[i].access]);
            }
        } 
    };

    p.isIndexChanged = function (oldValue, newValue) {
        if (isNaN(newValue) === false) {
            newValue = parseInt(newValue);
        }

        if (oldValue !== newValue) {
            return true;
        } else {
            return false;
        }
    };

    p.isValueChanged = function (oldValue, newValue) {
        if (oldValue !== newValue) {
            return true;
        } else {
            return false;
        }
    };

    p._valueChangedHandler = function (e) {
        var i = this.inputIds.findIndex(function (elem) {
            if (this === elem) {
                return true;
            }
            return false;
        }, e.target.id);

        if ((i !== -1) && (this.settings.parameters[i]) && (this.isValueChanged(this.settings.parameters[i].value, e.detail.value) === true)) {
            if (this.settings.parameters[i].linearTransform !== undefined) {
                this.settings.parameters[i].value = (this.settings.parameters[i].divisor * ((e.detail.value - this.settings.parameters[i].finalAddend) / this.settings.parameters[i].multiplicand)) - this.settings.parameters[i].initialAddend;
            } else {
                this.settings.parameters[i].value = e.detail.value;
            }
            $('#' + this.elem.id).trigger("parameterValueChanged", [this.settings.parameters[i].name, this.settings.parameters[i].access]);
        }
    };

    p.setAllChildWidgetsReady = function (value){
        this.settings.allChildWidgetsReady = value;
    };

    p._onAllChildWidgetsReady = function (widget) {

        widget.drawContainer.append(widget.labelContainer);
        widget.drawContainer.append(widget.inputContainer);
        widget.scrollContainer.append(widget.drawContainer);
        widget.scrollContainer.append(widget.tableContainer);
        widget.el.append(widget.scrollContainer);

        if (!widget.scroller) { // only first time
            _addScroller(widget);
            this.setVisibilityDependency(true);
        } else {
            widget._refreshScroller();
        }
        this._onWidgetReadySetEnableStatus();
        widget.inputContainer.off(BreaseEvent.WIDGET_READY);
        widget.labelContainer.off(BreaseEvent.WIDGET_READY);
        widget.tableContainer.off(BreaseEvent.WIDGET_READY);

        this.setAllChildWidgetsReady(true);

        this.updateLastData(widget);

        if (this.postponeDrawResultTable) {
            this.postponeDrawResultTable = false;
            this.drawResultTable();
        }
        this._refreshScroller();

    };

    p.updateLastData = function (widget) {
        if (this.settings.lastData) {
            widget.update(this.settings.lastData);
        }
        if (this.settings.lastInputData) {
            widget.update(this.settings.lastInputData, "Input");
        }
        if (this.settings.lastOutputData) {
            widget.update(this.settings.lastOutputData, "Output");
        }
    };

    function _selectChildrenInEditor(container) {
        var children = container.find('.breaseWidget');
        if (children.length > 0) {
            children = children.first().parent().children('.breaseWidget');
        }
        return children;
    }

    function _selectChildren(container) {
        if (brease.config.editMode) {
            return _selectChildrenInEditor(container);
        }
        var children = $(container).find('[data-brease-widget]');
        if (children.length > 0) {
            children = children.first().parent().children('[data-brease-widget]');
        }
        return children;
    }

    function _replaceChildWidgets(widget) {
        _removeChildWidgets(widget);
        _addChildWidgets(widget);
    }

    function _removeChildWidgets(widget) {
        widget.settings.allChildWidgetsReady = false;
        widget.scrollContainer.detach();
        brease.uiController.dispose(widget.labelContainer, false, function () {});
        brease.uiController.dispose(widget.inputContainer, false, function () {});
        brease.uiController.dispose(widget.tableContainer, false, function () {});
        brease.uiController.dispose(widget.scrollContainer, false, function () {});
    }

    p._getUnitSymbolAsync = function (childParameters, deferredUnitSymbol) {
        brease.language.pipeAsyncUnitSymbol(childParameters.unit, function (unitSymbol) {
            if (unitSymbol === undefined) {
                childParameters.unitSymbol = '';
            } else {
                childParameters.unitSymbol = unitSymbol;
            }
            deferredUnitSymbol.resolve();
        });
    };


    function _extendNumericInputOptionsWithLimitsUnitAndLinearTansform(numericOptions, settings) {
        var factor, digits;

        if (settings.min) {
            numericOptions.minValue = settings.min;
        }
        if (settings.max !== undefined) {
            numericOptions.maxValue = settings.max;
        }
        if (settings.linearTransform !== undefined) {
            numericOptions.multiplicand = settings.multiplicand;
            numericOptions.divisor = settings.divisor;
            numericOptions.initialAddend = settings.initialAddend;
            numericOptions.finalAddend = settings.finalAddend;
        }
        if (settings.unit) {
            numericOptions.unit = {
                'metric': settings.unit,
                'imperial': settings.unit,
                'imperial-us': settings.unit
            };
        }
        if (settings.type === 'integer') {
            factor = 0;
            digits = 0;
            if (settings.linearTransform !== undefined) {
                factor = settings.divisor / settings.multiplicand;
                digits = Math.trunc(factor.toString().length) - 1;
            }
            numericOptions.format = {
                'metric': {
                    decimalPlaces: digits,
                    maximumIntegerDigits: 10
                },
                'imperial': {
                    decimalPlaces: digits,
                    maximumIntegerDigits: 10
                },
                'imperial-us': {
                    decimalPlaces: digits,
                    maximumIntegerDigits: 10
                }
            };

        }
        if (settings.type === 'double') {
            numericOptions.format = {
                'metric': {
                    decimalPlaces: 3,
                    maximumIntegerDigits: 10
                },
                'imperial': {
                    decimalPlaces: 3,
                    maximumIntegerDigits: 10
                },
                'imperial-us': {
                    decimalPlaces: 3,
                    maximumIntegerDigits: 10
                }
            };

        }
        return numericOptions;
    }


    function _addChildWidgets(widget) {
        var deferredInitStates = [],
            deferredUnitSymbol = [],
            deferredInitStatesFlatList = [],
            deferredUnitSymbolFlatList = [],
            numericOptions,
            textOptions,
            dropDownOptions,
            factor,
            digits,
            i;

        widget.labelElements = [];
        widget.inputElements = [];
        widget.inputIds = [];
        widget.labelIds = [];
        if (widget.settings.useTableWidgetForResultsList === true) {
            widget.tableElements = [];
            widget.tableIds = [];
            widget.tableIds[0] = Utils.uniqueID(widget.elem.id) + '_ResultTable';
            widget.tableIds[1] = Utils.uniqueID(widget.elem.id) + '_ResultTable_ColLabel';
            widget.tableIds[2] = Utils.uniqueID(widget.elem.id) + '_ResultTable_ColValue';
            widget.tableIds[3] = Utils.uniqueID(widget.elem.id) + '_ResultTable_ColUnit';

            deferredInitStates[widget.tableIds[0]] = $.Deferred();
            deferredInitStates[widget.tableIds[0]].promise();
            deferredInitStatesFlatList.push(deferredInitStates[widget.tableIds[0]]);
            widget.resultTable.viewModel.clear();

            // Result Table Outputs
            for (i = 0; i < widget.settings.parameters.length; i++) {
                if (widget.settings.parameters[i].isNoInput) {
                    switch (widget.settings.parameters[i].type) {
                        case 'integer':
                        case 'number':
                        case 'double':
                            numericOptions = {
                                useDigitGrouping: false,
                                enable: true,
                                style: widget.settings.numericInputStyle,
                                numPadStyle: widget.settings.numPadStyle,
                                value: widget.settings.parameters[i].value,
                                modelOrder: i,
                                multiplicand: 1,
                                unitAlign: 'right',
                                divisor: 1,
                                initialAddend: 0,
                                finalAddend: 0,
                            };

                            numericOptions = _extendNumericInputOptionsWithLimitsUnitAndLinearTansform(numericOptions, widget.settings.parameters[i]);
                            if (widget.settings.parameters[i].unit) {

                                deferredUnitSymbol[i]  = $.Deferred();
                                deferredUnitSymbol[i].promise();
                                deferredUnitSymbolFlatList.push(deferredUnitSymbol[i]);

                                widget._getUnitSymbolAsync(widget.settings.parameters[i], deferredUnitSymbol[i]);
                            }

                            widget.resultTable.viewModel.set(widget.settings.parameters[i].name, {
                                type: widget.settings.parameters[i].type,
                                options: numericOptions
                            });
                            break;
                        case 'selection':
                            dropDownOptions = {
                                enable: true,
                                style: widget.settings.dropDownBoxStyle,
                                dataProvider: widget.settings.parameters[i].dataProvider,
                                selectedValue: '' + widget.settings.parameters[i].value,
                                width: widget.settings.inputWidth,
                                listWidth: widget.settings.dropDownBoxListWidth,
                                listPosition: 'bottom',
                                multiLine: true,
                                fitHeight2Items: true,
                                breakWord: true,
                                wordWrap: true,
                                height: 0,
                                modelOrder: i
                            };
                            widget.resultTable.viewModel.set(widget.settings.parameters[i].name, {
                                type: widget.settings.parameters[i].type,
                                options: dropDownOptions
                            });
                            break;
                        case 'string':
                            textOptions = {
                                enable: widget.settings.enable,
                                value: widget.settings.parameters[i].value,
                                maxLength: widget.settings.parameters[i].maxLength,
                                multiLine: true,
                                wordWrap: true,
                                breakWord: true,
                                modelOrder: i
                            };
                            textOptions.style = widget.settings.textOutputStyle;
                            if (textOptions.value === undefined) {
                                textOptions.value = '';
                            }
                            textOptions.enable = true;
                            widget.resultTable.viewModel.set(widget.settings.parameters[i].name, {
                                type: widget.settings.parameters[i].type,
                                options: textOptions
                            });
                            break;
                    }
                }
            }
        }

        for (i = 0; i < widget.settings.parameters.length; i++) {
            if (widget.settings.parameters[i].isNoInput) {
                if (widget.settings.useTableWidgetForResultsList === true) {
                    continue;
                } else {
                    widget.inputIds[i] = Utils.uniqueID(widget.elem.id) + '_Output';
                    widget.labelIds[i] = Utils.uniqueID(widget.elem.id) + '_parameterLabelOutput';
                }
            } else if (widget.settings.parameters[i].isReadOnlyInput) {
                widget.inputIds[i] = Utils.uniqueID(widget.elem.id) + '_Output';
                widget.labelIds[i] = Utils.uniqueID(widget.elem.id) + '_parameterLabelOutput';
            } else {
                widget.inputIds[i] = Utils.uniqueID(widget.elem.id) + '_Input';
                widget.labelIds[i] = Utils.uniqueID(widget.elem.id) + '_parameterLabelInput';
            }
            deferredInitStates[widget.inputIds[i]] = $.Deferred();
            deferredInitStates[widget.inputIds[i]].promise();
            deferredInitStatesFlatList.push(deferredInitStates[widget.inputIds[i]]);

            deferredInitStates[widget.labelIds[i]] = $.Deferred();
            deferredInitStates[widget.labelIds[i]].promise();
            deferredInitStatesFlatList.push(deferredInitStates[widget.labelIds[i]]);

            widget.labelElements[i] = {
                className: 'Label',
                id: widget.labelIds[i],
                options: {
                    text: widget.settings.parameters[i].name,
                    enable: widget.settings.enable,
                    permissions: widget.settings.permissions,
                    style: widget.settings.labelStyle,
                    modelOrder: i,
                    resultIndex: widget.settings.parameters[i].ResultIndex,
                    direction: (widget.settings.parameters[i].isNoInput === true) ? "Output" : "Input",
                    readonly: widget.settings.parameters[i].isReadOnlyInput
                },
                HTMLAttributes: {
                    style: 'order:' + i + ';',
                    class: 'smartPanelParameterLabel'
                }
            };

            // enable should be set to this.settings.enable but there is a bug in the scroller
            // the widget will be disabled after initialitaion if necessary

            switch (widget.settings.parameters[i].type) {

                case 'integer':
                case 'number':
                case 'double':
                    numericOptions = {
                        useDigitGrouping: false,
                        enable: true,
                        style: widget.settings.numericInputStyle,
                        value: widget.settings.parameters[i].value,
                        numPadStyle: widget.settings.numPadStyle,
                        modelOrder: i,
                        unitAlign: 'right',
                        multiplicand: 1,
                        divisor: 1,
                        initialAddend: 0,
                        finalAddend: 0,
                    };

                    numericOptions = _extendNumericInputOptionsWithLimitsUnitAndLinearTansform(numericOptions, widget.settings.parameters[i]);

                    widget.inputElements[i] = {
                        className: 'NumericInput',
                        id: widget.inputIds[i],
                        options: numericOptions,
                        HTMLAttributes: {
                            style: 'order:' + i + ';',
                            class: 'smartPanelParameterNumericInput'
                        }
                    };
                    break;
                case 'selection':
                    dropDownOptions = {
                        enable: true,
                        style: widget.settings.dropDownBoxStyle,
                        dataProvider: widget.settings.parameters[i].dataProvider,
                        selectedValue: '' + widget.settings.parameters[i].value,
                        width: widget.settings.inputWidth,
                        listWidth: widget.settings.dropDownBoxListWidth,
                        listPosition: 'bottom',
                        multiLine: true,
                        fitHeight2Items: true,
                        breakWord: true,
                        wordWrap: true,
                        height: 0,
                        modelOrder: i
                    };

                    widget.inputElements[i] = {
                        className: 'DropDownBox',
                        id: widget.inputIds[i],
                        options: dropDownOptions,
                        HTMLAttributes: {
                            style: 'order:' + i + ';',
                            class: 'smartPanelParameterDropDownBox'
                        }
                    };
                    break;
                case 'string':
                    textOptions = {
                        enable: widget.settings.enable,
                        value: widget.settings.parameters[i].value,
                        maxLength: widget.settings.parameters[i].maxLength,
                        multiLine: true,
                        wordWrap: true,
                        breakWord: true,
                        modelOrder: i
                    };
                    if (widget.settings.parameters[i].isNoInput) {
                        textOptions.style = widget.settings.textOutputStyle;
                        if (textOptions.value === undefined) {
                            textOptions.value = '';
                        }
                        widget.inputElements[i] = {
                            className: 'TextOutput',
                            id: widget.inputIds[i],
                            options: textOptions,
                            HTMLAttributes: {
                                style: 'order:' + i + ';',
                                class: 'smartPanelParameterFormTextOutput'
                            }
                        };
                        textOptions.enable = true;
                    } else {
                        textOptions.style = widget.settings.textInputStyle;
                        widget.inputElements[i] = {
                            className: 'TextInput',
                            id: widget.inputIds[i],
                            options: textOptions,
                            HTMLAttributes: {
                                style: 'order:' + i + ';',
                                class: 'smartPanelParameterTextInput'
                            }
                        };
                        textOptions.enable = true;
                    }
                    break;
            }

            widget.inputElements[i].options.direction = widget.labelElements[i].options.direction;
            widget.inputElements[i].options.readonly = widget.labelElements[i].options.readonly;
        }

        widget.labelContainer.on(BreaseEvent.WIDGET_READY, function (e) {
            if (deferredInitStates[e.target.id]) {
                deferredInitStates[e.target.id].resolve();
            }
        });
        widget.inputContainer.on(BreaseEvent.WIDGET_READY, function (e) {
            if (deferredInitStates[e.target.id]) {
                deferredInitStates[e.target.id].resolve();
            }
        });

        if (widget.settings.useTableWidgetForResultsList === true) {
            widget.tableContainer.on(BreaseEvent.WIDGET_READY, function (e) {
                if (deferredInitStates[e.target.id]) {
                    deferredInitStates[e.target.id].resolve();
                }
            });
        }

        $.when.apply($, deferredInitStatesFlatList, deferredUnitSymbolFlatList).then(function () {
            widget._onAllChildWidgetsReady(widget);
        });

        brease.uiController.createWidgets(widget.labelContainer, widget.labelElements, true);
        brease.uiController.createWidgets(widget.inputContainer, widget.inputElements, true);

        if (widget.settings.useTableWidgetForResultsList === true) {
            _addTableElements(widget);
        }
    }

    function _addTableElements(widget) {
        var libPath = 'widgets.brease.',
            libPathItems = 'widgets/brease/',
            className = 'Table';

        widget.tableElements[0] = {
            className: libPath + className,
            id: widget.tableIds[0],
            options: {
                rowHeight: 35,
                columnWidth: 239,
                selection: false,
                showHeader: false,
                multiLine: true,
                wordWrap: true,
                showScrollbars: false,
                height: 800,
                // maxHeight: 800,  
                width: 600,
                offsetRow: 0,
                offsetColumn: 0,
                fontName: 'arial',
                style: 'TableSmartPanel',
                useTableStyling: false,
                refreshRate: 0,
                initRefreshRate: 0,
            },
            content: {

                //HTMLAttributes:
                html: generateHtmlContentString([{
                        id: widget.tableIds[1],
                        className: libPathItems + 'TableItem',
                        options: {
                            style: 'TableItemLeftStyle',
                            columnWidth: 221
                        }
                    },
                    {
                        id: widget.tableIds[2],
                        className: libPathItems + 'TableItem',
                        options: {
                            style: 'TableItemValueStyle',
                            columnWidth: 132
                        }
                    },
                    {
                        id: widget.tableIds[3],
                        className: libPathItems + 'TableItem',
                        options: {
                            style: 'TableItemUnitsStyle',
                            columnWidth: 75
                        }
                    }
                ])
            }
        };
        widget.tableContainer.on('TableReady', widget._bind(widget._initializeTableforScrollers));
        brease.uiController.createWidgets(widget.tableContainer, widget.tableElements, true);
    }

    p._initializeTableforScrollers = function () {
        var emptyArray = [''];
        this.tableContainer.off('TableReady', this._bind(this._initializeTableforScrollers));
        brease.callWidget(this.tableIds[1], 'setStringValue', emptyArray);
        brease.callWidget(this.tableIds[2], 'setStringValue', emptyArray);  
        brease.callWidget(this.tableIds[3], 'setStringValue', emptyArray); 
    };

    function _addScroller(widget) {
        widget.scroller = Scroller.addScrollbars('#' + widget.elem.id, {
            mouseWheel: true
        });
    }

    function _initEditor(widget) {
        widget.settings.parameters = [{
                name: 'Parameter 1',
                value: 2000
            },
            {
                name: 'Parameter 2',
                value: 4
            },
            {
                name: 'Parameter 3',
                value: 6
            }
        ];
    }


    function createHtmlForWidget(classname, options, id, htmlTagName) {
        if (htmlTagName === undefined) {
            htmlTagName = 'div';
        }
        var item = $('<' + htmlTagName + '/>').attr("id", id);
        item.attr("data-brease-options", JSON.stringify(options).replace(/"/g, "'"));
        item.attr("data-brease-widget", classname);

        //TBD wether content.html should do a recursive call and append to this div
        return item;
    }

    function generateHtmlContentString(contentConfiguration) {
        //TODO each widget call createHtmlForWidget
        //collect and generate html string out of them...
        var collection = "",
            domEl;

        for (var index in contentConfiguration) {
            var item = contentConfiguration[index];
            domEl = createHtmlForWidget(item.className, item.options, item.id, item.htmlTagName);
            collection = collection + domEl.prop('outerHTML');
        }

        return collection;
    }


    return VisibiliyDependency.decorate(WidgetClass, false);
});