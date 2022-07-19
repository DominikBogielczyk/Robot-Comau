/*global define, brease, $*/
define([], function () {
    'use strict';

    function ParameterHandling(parent) {
        this._parent = parent;
        this.setParametersInitialized(false);
        this.setModelParametersInitialized(false);
        this.setModelTypesInitialized(false);
        this.mappings = [];
        return this;
    }

    var SCHEMA = {
            GROUP_TYPE: {
                PARAMETER: 'Parameter',
                VARIABLE: 'Variable',
                CONSTANT: 'Constant',
                MODEL_PARAMETER: 'ModelParameter',
                MODEL_TYPE: 'ModelType',
                MODEL_PARAMETER_REF: 'ModelParameterReference',
                TOOL: 'Tool',
                OPERATIONS: 'Operations',
            },
            OUTPUT_ONLY: [
                'Output', 'Activity', 'NetTime', 'CycleTime', 'Status'
            ],
            ROLE_ATTR: 'Role',
            ACCESS: 'Access',
            VARIABLE_NAME: 'ParameterMode',
            VALUE_OF_USER_DEFINED_PARAMETER: 'user defined',
            NAME_ATTR: 'Name',
            ARRAY_INDICATOR_ATTR: 'NumberElements',
            DATA_TYPE_ATTR: 'PLK',
            DATA_TYPE: 'Type',
            SELECTION_VALUE_ELEM: 'Lookup',
            SELECTION_VALUE_ELEM_2: 'Display',
            SELECTION_VALUE_ELEM_STRING: 'String',
            SELECTION_VALUE_ITEM_KEY: 'Key',
            SELECTION_VALUE_ITEM_TEXT: 'Value',
            ORDER_ATTR: 'Position',
            EXCLUDE_GROUP: ":not('Capabilities')",
        },
        p = ParameterHandling.prototype;

    /*
     * This method initializes Parameter Handling with current schema
     * @param schema the text representation of the xml schema of current Vision Function
     *
     */
    p.init = function (schema) {
        this.mappings = [];

        this.setModelTypeAttributes();

        this.setParametersInitialized(false);
        this.setModelParametersInitialized(false);
        this.setModelTypesInitialized(false);
        this.setFilterVisionFunctionInitialized(false);
        this._provideParameterFormDataFromSchema($(schema));
        this.setParametersInitialized(true);
    };

    p.dispose = function () {};

    //resets session speicfic data
    p.reset = function () {
        this.setModelParametersInitialized(false);
    };

    p.setModelTypeAttributes = function () {
        this.modelTypeAttributes = ["Teachable", "ModelRoi", "Marker"];
    };

    p.handleMessage = function (param) {
        if (this.getParametersInitialized() === false) {
            return;
        }
        var messageHandled = false;
        if (this.filterVisionFunctionInitialized === false) {
            this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionVariablesRefId, 'filterByIndex', 1);
            this.setFilterVisionFunctionInitialized(true);
        }
        if (param) {
            if (param.inputs) {
                this.setVisionFunctionVariables(param.inputs, "Input");
                this._parent.statusGroupBoxes.enableParametersGroupBox(this.getValueOfParameterMode(param.inputs));
                messageHandled = true;
            }
            if (param.outputs) {
                this.setVisionFunctionVariables(param.outputs, "Output");
                messageHandled = true;
            }
            if (param.params) {
                this.setVisionFunctionParameters(param.params);
                messageHandled = true;
            }
            if (param.constants) {
                this.setVisionFunctionConstants(param.constants, "Input");
                this.setValueOfNumResultsMax(param.constants);
                messageHandled = true;
            }
            if (param.model_types) {
                this.setVisionFunctionModelTypes(param.model_types, "Input");
                messageHandled = true;
            }
        }

        return messageHandled;
    };

    p.getValueOfParameterMode = function (inputVaribles) {
        var parameterMode;
        if ((inputVaribles != undefined) && (inputVaribles.length != undefined)) {
            inputVaribles.forEach(function (inputVaribles) {
                if (inputVaribles.ParameterMode != undefined) {
                    parameterMode = inputVaribles.ParameterMode;
                }
            });
        }
        return parameterMode;
    };

    p.setValueOfNumResultsMax = function (constants) {
        var parent = this._parent;
        constants.forEach(function (constant) {
            if (constant.NumResultsMax != undefined) {
                parent.settings.numResultsMax = constant.NumResultsMax;
            }
        });
    };

    p.getValueOfNumSearchMax = function () {
        var numSearchMax, inputVaribles;
        inputVaribles = this.getVisionFunctionVariables();
        if ((inputVaribles != undefined) && (inputVaribles.length != undefined)) {
            inputVaribles.forEach(function (inputVaribles) {
                if (inputVaribles.NumSearchMax != undefined) {
                    numSearchMax = inputVaribles.NumSearchMax;
                }
            });
        } else {
            numSearchMax = 0;
        }
        return numSearchMax;
    };


    p.getValueOfEnableVf = function () {
        var enable, inputVaribles;
        inputVaribles = this.getVisionFunctionVariables();
        if ((inputVaribles != undefined) && (inputVaribles.length != undefined)) {
            inputVaribles.forEach(function (inputVaribles) {
                if (inputVaribles.Enable != undefined) {
                    enable = inputVaribles.Enable;
                }
            });
        } else {
            enable = 0;
        }
        return enable;
    };

    //update the input parameters only once
    p.setParametersInitialized = function (valid) {
        this.parametersInitialized = valid;
    };

    p.getParametersInitialized = function () {
        return this.parametersInitialized;
    };

    //update the model parameters only once
    p.setModelParametersInitialized = function (valid) {
        this.modelParametersInitialized = valid;
    };

    //update the model types only once
    p.setModelTypesInitialized = function (valid) {
        this.modelTypesInitialized = valid;
    };

    p.setFilterVisionFunctionInitialized = function (status) {
        this.filterVisionFunctionInitialized = status;
    };

    p.getFilterVisionFunctionInitialized = function () {
        return this.filterVisionFunctionInitialized;
    };

    p.getModelParametersInitialized = function () {
        return this.modelParametersInitialized;
    };

    p.getModelTypesInitialized = function () {
        return this.modelTypesInitialized;
    };

    p.setVisionFunctionConstants = function (list, direction) {
        var visionFunctionVariablesParameterForm = this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionConstantsRefId, 'widget');
        visionFunctionVariablesParameterForm.update(this._convertParamFromServer(list, SCHEMA.GROUP_TYPE.CONSTANT), direction);
    };

    p.initVisionFunctionConstants = function (list) {
        this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionConstantsRefId, 'setData', list);
    };


    p.initVisionFunctionParameters = function (list) {
        this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionParametersRefId, 'setData', list);
    };

    p.initVisionFunctionGlobaleModel = function (list) {
        this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionGlobalModel, 'setData', list);
    };

    p.initVisionFunctionVariables = function (list) {
        this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionVariablesRefId, 'setData', list);
    };

    p.initVisionFunctionModelParameters = function (list) {
        this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionModelParameterRefId, 'setData', list);
    };

    p.initVisionFunctionModelTypes = function (list) {
        this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionModelTypesRefId, 'setData', list);
    };

    p._getValueOfLookupWithTheName = function (schema, type, nameToFilter, attrFilter) {
        var data, el, entry, roleList = [],
            items = schema.find(type);

        items.each(function () {
            var item = $(this),
                itemRole = item.attr(SCHEMA.ROLE_ATTR);

            if (!roleList.includes(itemRole)) {
                roleList.push(itemRole);
            }
        });
        for (var i = 0; i < items.length; i += 1) {
            el = $(items[i]);
            entry = this._getEntryInfo(el);
            if (entry.name === nameToFilter) {
                for (var index = 1; index <= entry.dataProvider.length - 1; index = index + 1) {
                    if (entry.dataProvider[index].text.endsWith(attrFilter)) {
                        data = parseInt(entry.dataProvider[index].value);
                    }
                }
            }
        }
        return data;
    };


    p.insertHardCodedOutputsOnTopOfOutputsList = function (data) {
        var dataSets = [{
                    name: 'CameraProcessingTime',
                    isNoInput: true,
                    max: 65535,
                    min: 0,
                    type: 'integer',
                    value: 0,
                    unit: 'http://www.opcfoundation.org/UA/units/un/cefact|C26'
                },
                {
                    name: 'ImageProcessingError',
                    isNoInput: true,
                    max: 16777216,
                    min: 1,
                    value: 0,
                    type: 'integer',
                },
                {
                    name: 'ImageNettime',
                    isNoInput: true,
                    max: 2147483647,
                    min: -2147483648,
                    value: 0,
                    type: 'integer',
                    unit: 'http://www.opcfoundation.org/UA/units/un/cefact|B98'
                }
            ],
            index;

        if ((data === undefined) || (data.length === 0)) { // abort on a corrupt xml entry
            data = [];
            return data;
        }

        index = data.findIndex(function (el) {
            return el.isNoInput === true;
        });
        data.splice(index, 0, dataSets[0], dataSets[1], dataSets[2]);
        return data;
    };

    p._convertOutputVariables = function (hardCodeEntries) {
        var outputVariables = [],
            name, value, element = {};
        hardCodeEntries.forEach(function (listElement) {
            if (listElement.isNoInput && listElement.isNoInput === true) {
                element = {};
                name = listElement.name;
                value = listElement.value;
                element[name] = value;
                outputVariables.push(element);
            }
        });
        return outputVariables;
    };

    p.checkIfInputShowBeWritable = function (hardCodeEntries) {
        var that = this;
        hardCodeEntries.forEach(function (listElement) {
            if ((!listElement.isNoInput) || (listElement.isNoInput && listElement.isNoInput === false)) {
                var result = that._parent.vpDataProvider.isInputEditable(that._parent.settings.visionFunctionName, listElement.name);
                if (result === false) {
                    listElement.isReadOnlyInput = true;
                }
            }
        });
        return hardCodeEntries;
    };

    p._provideParameterFormDataFromSchema = function (schema) {
        var hardCodeEntries = this.insertHardCodedOutputsOnTopOfOutputsList(this._getDisplayInfoForAllVisbileEntries(schema, SCHEMA.GROUP_TYPE.VARIABLE, SCHEMA.GROUP_TYPE.EXTENDEDVARIABLES));
        hardCodeEntries = this.checkIfInputShowBeWritable(hardCodeEntries);

        this.initVisionFunctionVariables(hardCodeEntries);

        this._parent.vpRepository.setDefaultValueOfOutputProcessVariables(this._convertOutputVariables(hardCodeEntries));

        this.initVisionFunctionConstants(this._getDisplayInfoForAllVisbileEntries(schema, SCHEMA.GROUP_TYPE.CONSTANT));
        this.initVisionFunctionParameters(this._getDisplayInfoForAllVisbileEntries(schema, SCHEMA.GROUP_TYPE.PARAMETER));

        this._parent.vpDataProvider.setUserDefinedParameterMode(this._getValueOfLookupWithTheName(schema, SCHEMA.GROUP_TYPE.VARIABLE, SCHEMA.VARIABLE_NAME, SCHEMA.VALUE_OF_USER_DEFINED_PARAMETER));


        this.dataModelTypes = this._getValueAndAttributeInfo(schema, SCHEMA.GROUP_TYPE.MODEL_TYPE, this.modelTypeAttributes);
        this._parent.setDataProviderModelTypes(this.dataModelTypes);

        this.modelTypeParameterAssignment = this._getElementGroupAssignment(schema, SCHEMA.GROUP_TYPE.MODEL_TYPE, SCHEMA.GROUP_TYPE.MODEL_PARAMETER_REF);
        this.dataModelParameter = this._getDisplayInfoForAllVisbileEntries(schema, SCHEMA.GROUP_TYPE.MODEL_PARAMETER);
        this.initVisionFunctionModelParameters(this.dataModelParameter);

        this.elementsOfGlobalModel = this._getElementsOfGlobalModel(schema);
        this.initVisionFunctionGlobaleModel(this.elementsOfGlobalModel);
    };

    p.getDataProviderForOperations = function (modelParameter) {
        var dataProviderForOperations, context = this;

        modelParameter.forEach(function (listElement) {
            if (listElement.name === 'Operation') {
                listElement.dataProvider.unshift(context._parent.settings.defaultOperation);
                dataProviderForOperations = listElement.dataProvider;
            }
        });
        return dataProviderForOperations;
    };

    p._getElementsOfGlobalModel = function (schema) {
        var dataProviderForOperations = [],
            elementsOfGlobalModel = [];
        var target = {
            name: "Target",
            type: "integer",
            min: 0,
            max: 255,
            value: 0
        };
        var reference = {
            name: "Reference",
            type: "integer",
            min: 0,
            max: 255,
            value: 0
        };
        var modelParameter;

        modelParameter = this._getDisplayInfoForAllVisbileEntries(schema, SCHEMA.GROUP_TYPE.MODEL_PARAMETER);

        dataProviderForOperations = this.getDataProviderForOperations(modelParameter);
        this._parent.widgetsHandling.setDataProviderOfOperationForGlobalModel(dataProviderForOperations);

        elementsOfGlobalModel.push(reference);
        elementsOfGlobalModel.push(target);
        return elementsOfGlobalModel;
    };

    function addEntryToList(data, entry, numberOfEntryCopies) {
        var maxNumber, multiEntry;

        if (numberOfEntryCopies === undefined) {
            data.push(entry);
        } else {
            maxNumber = parseInt(numberOfEntryCopies);
            for (var i = 1; i <= maxNumber; i = i + 1) {
                entry.ResultIndex = i;
                multiEntry = $.extend(true, {}, entry);
                if (i < 10) {
                    multiEntry.name += '0';
                }
                multiEntry.name += i;
                multiEntry.isArrayData = true;
                if (i === 1) {
                    multiEntry.isFirstMultiEntry = true;
                }
                if (i === maxNumber) {
                    multiEntry.isLastMultiEntry = true;
                }
                data.push(multiEntry);
            }
        }
    }

    p._getElementGroupAssignment = function (schema, element, subElement) {
        var items = schema.find(element),
            groupMap = new Map();

        items.each(function () {
            var item = $(this),
                itemName = item.attr(SCHEMA.NAME_ATTR),
                subItems = item.find(subElement);
            groupMap.set(itemName, subItems);
        });
        return groupMap;
    };

    p._getValueAndAttributeInfo = function (schema, type, attributeFilter) {
        var data = [],
            el, entry, numberOfEntryCopies, roleList = [],
            items = schema.find(type);

        items.each(function () {
            var item = $(this),
                itemRole = item.attr(SCHEMA.ROLE_ATTR);

            if (!roleList.includes(itemRole)) {
                roleList.push(itemRole);
            }
        });

        items.sort(function (a, b) {
            // Primitive Grouping, Sorting of the groups is not yet defined
            var aRole = $(a).attr(SCHEMA.ROLE_ATTR);
            var bRole = $(b).attr(SCHEMA.ROLE_ATTR);
            if (aRole !== bRole) {
                return roleList.findIndex(function (element) {
                        return (element === aRole);
                    }) -
                    roleList.findIndex(function (element) {
                        return (element === bRole);
                    });
            } else {
                // Sorting of Items (within same group)
                var aPosition = parseInt($(a).attr(SCHEMA.ORDER_ATTR));
                var bPosition = parseInt($(b).attr(SCHEMA.ORDER_ATTR));
                return ((aPosition < bPosition) ? -1 : ((aPosition > bPosition) ? 1 : 0));
            }
        });

        this.mappings[type] = [];
        for (var i = 0; i < items.length; i += 1) {
            el = $(items[i]);
            entry = this._getEntryInfo(el);
            if (entry) {
                numberOfEntryCopies = el.attr(SCHEMA.ARRAY_INDICATOR_ATTR);
                if (numberOfEntryCopies !== undefined) {
                    this.mappings[type][entry.name] = parseInt(numberOfEntryCopies);
                }

                if (attributeFilter !== undefined) {
                    for (var indx = 0; indx < attributeFilter.length; indx++) {
                        if (attributeFilter[indx]) {
                            var value = el.attr(attributeFilter[indx]);
                            entry[attributeFilter[indx]] = value;
                        }
                    }
                }
                addEntryToList(data, entry, numberOfEntryCopies);
            } else {
                // abort on a corrupt xml entry
                data = [];
                break;
            }
        }
        return data;
    };

    p.calculateNumberOfElements = function (valueOfNumberOfElements) {
        var multiplier, numResultsMax, numberOfElements; 

        multiplier = parseInt(valueOfNumberOfElements.slice(0, valueOfNumberOfElements.lastIndexOf('*'))); 
        numResultsMax = parseInt(this._parent.vpDataProvider.getNumResultsMax(this._parent.settings.visionFunctionInstance - 1));
        numberOfElements = multiplier * numResultsMax;
        numberOfElements = numberOfElements.toString();

        return numberOfElements;
    };

    p.setNumberOfElements = function (valueOfNumberOfElements) {
        var numberOfElements; 
        if ((typeof (valueOfNumberOfElements) === "string") && valueOfNumberOfElements.includes("NumResultsMax")) {
            if (valueOfNumberOfElements === "NumResultsMax") {
                numberOfElements = this._parent.vpDataProvider.getNumResultsMax(this._parent.settings.visionFunctionInstance - 1);
            } else {
                numberOfElements = this.calculateNumberOfElements(valueOfNumberOfElements);
            }
        } else {
            numberOfElements = valueOfNumberOfElements;
        }
        return numberOfElements;
    };

    p._getDisplayInfoForAllVisbileEntries = function (schema, type, attributeFilter, filterValue) {
        var data = [],
            el, entry, attrFilterValue, numberOfEntryCopies, roleList = [],
            items = schema.children(SCHEMA.EXCLUDE_GROUP).find(type);

        items.each(function () {
            var item = $(this),
                itemRole = item.attr(SCHEMA.ROLE_ATTR);

            if (!roleList.includes(itemRole)) {
                roleList.push(itemRole);
            }
        });

        items.sort(function (a, b) {
            // Sorting of Items 
            var aPosition = parseInt($(a).attr(SCHEMA.ORDER_ATTR));
            var bPosition = parseInt($(b).attr(SCHEMA.ORDER_ATTR));
            return ((aPosition < bPosition) ? -1 : ((aPosition > bPosition) ? 1 : 0));
        });

        this.mappings[type] = [];
        for (var i = 0; i < items.length; i += 1) {
            el = $(items[i]);
            entry = this._getEntryInfo(el);
            if (entry) {
                numberOfEntryCopies = this.setNumberOfElements(el.attr(SCHEMA.ARRAY_INDICATOR_ATTR)); 
                if (attributeFilter !== undefined) {
                    attrFilterValue = el.attr(attributeFilter);
                    if (attrFilterValue != filterValue) {
                        continue;
                    }
                }

                if (numberOfEntryCopies !== undefined) {
                    this.mappings[type][entry.name] = parseInt(numberOfEntryCopies);
                }
                addEntryToList(data, entry, numberOfEntryCopies);
            } else {
                // abort on a corrupt xml entry
                data = [];
                break;
            }
        }
        return data;
    };

    function setReadOnlyBasedOnRole(el, entry) {
        var role = el.attr(SCHEMA.ROLE_ATTR);
        if (SCHEMA.OUTPUT_ONLY.includes(role)) {
            entry.isNoInput = true;
        }
    }

    p.getVisionFunctionGlobalModel = function () {
        var list = this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionGlobalModel, 'getData');
        return this._convertParamForServer(list);
    };

    p._convertGlobalModelParameter = function (list) {
        var globalModelParameter = [];
        globalModelParameter = {
            "Operation": list.Operation,
            "Reference": list.ModelReference,
            "Target": list.ModelTarget
        };

        return globalModelParameter;
    };

    p._getEntryInfoStringValue = function (el, entry) {
        entry.type = 'string';
        entry.value = '';
        entry.maxLength = el.children('ValueRange').attr('Max');
    };

    p._getEntryInfoLookupValue = function (el, entry) {
        var dataProviderList = [],
            keyList = [],
            i,
            hasValueRange,
            valueMin,
            valueMax;

        if (el.children('ValueRange').length === 1) {
            hasValueRange = true;
            valueMin = el.children('ValueRange').attr('Min');
            valueMax = el.children('ValueRange').attr('Max');
        }

        entry.type = 'selection';
        el.children().each(function () {
            var child = $(this),
                item = {};

            if (child.attr(SCHEMA.SELECTION_VALUE_ITEM_KEY)) {
                item.value = child.attr(SCHEMA.SELECTION_VALUE_ITEM_KEY);
                item.text = "[" + item.value + "] " + child.attr(SCHEMA.SELECTION_VALUE_ITEM_TEXT);
                keyList.push(item.value);
            } else if (hasValueRange) {
                return true;
            } else {
                item.value = child.text();
                // value is already in lookup table
                if ($.inArray(item.value, keyList) !== -1) {
                    return true;
                }
                item.text = item.value;
            }
            dataProviderList.push(item);
        });

        if (hasValueRange) {
            for (i = parseInt(valueMin); i <= parseInt(valueMax); i = i + 1) {
                var item = {};
                if ($.inArray(String(i), keyList) === -1) {
                    item.value = String(i);
                    item.text = item.value;
                    dataProviderList.push(item);
                }
            }
        }
        entry.dataProvider = dataProviderList;
        if (isNaN(dataProviderList[0].value)) {
            entry.value = dataProviderList[0].value;
        } else {
            entry.value = parseInt(dataProviderList[0].value);
        }
    };

    p._getEntryInfoValueList = function (el, entry) {
        entry.type = 'selection';
        var dataProviderList = [];
        el.children().each(function () {
            var child = $(this),
                item = {};
            item.value = child.text();
            item.text = item.value;
            dataProviderList.push(item);
        });
        entry.dataProvider = dataProviderList;
        entry.value = parseInt(dataProviderList[0].value);
    };

    function hexToAscii(dezString) {
        var hexString = parseInt(dezString).toString(16),
            strOut = '';

        for (var x = 0; x < hexString.length; x += 2) {
            strOut += String.fromCharCode(parseInt(hexString.substr(x, 2), 16));
        }
        return strOut;
    }

    function setNumericValueForEntry(min, max) {
        var result = 0;
        if (min > 0 || max < 0) {
            result = min;
        }
        return result;
    }

    p._getEntryInfoIntegerValue = function (el, entry) {
        var range, factor, ret = true;

        entry.type = 'integer';
        range = el.children('ValueRange');
        if (el.attr('UnitID') !== undefined) {
            entry.unit = el.attr('UnitNS') + '|' + hexToAscii(el.attr('UnitID'));
        }
        factor = el.children('LinearTransform');
        if (factor.length > 0) {
            entry.linearTransform = 'linearTransform';
            entry.multiplicand = parseInt(factor.attr('Multiplicand'));
            entry.divisor = parseInt(factor.attr('Divisor'));
            entry.initialAddend = parseInt(factor.attr('InitialAddend'));
            entry.finalAddend = parseInt(factor.attr('FinalAddend'));
        }
        if (range.length > 0) {
            entry.min = parseInt(range.attr('Min'));
            if ((!this._parent.vpDataProvider.getOfflineMode()) && (entry.name === 'NumSearchMax')) {
                entry.max = this._parent.vpDataProvider.getNumResultsMax(this._parent.settings.visionFunctionInstance - 1);
            } else {
                entry.max = parseInt(range.attr('Max'));
            }
            if (factor.length > 0) {
                entry.min = (entry.multiplicand * ((entry.min + entry.initialAddend) / entry.divisor)) + entry.finalAddend;
                entry.max = (entry.multiplicand * ((entry.max + entry.initialAddend) / entry.divisor)) + entry.finalAddend;
            }
            entry.value = setNumericValueForEntry(entry.min, entry.max);
        } else {
            ret = false;
            this._parent._consoleEvents("Error: Corrupt xml. Value range for " + entry.name + " is missing!");
        }
        return ret;
    };

    p._getEntryInfoDoubleValue = function (el, entry) {
        var range, factor, ret = true;

        entry.type = 'double';
        range = el.children('ValueInterval');
        if (el.attr('UnitID') !== undefined) {
            entry.unit = el.attr('UnitNS') + '|' + hexToAscii(el.attr('UnitID'));
        }
        factor = el.children('LinearTransform');
        if (factor.length > 0) {
            entry.linearTransform = 'linearTransform';
            entry.multiplicand = parseInt(factor.attr('Multiplicand'));
            entry.divisor = parseInt(factor.attr('Divisor'));
            entry.initialAddend = parseInt(factor.attr('InitialAddend'));
            entry.finalAddend = parseInt(factor.attr('FinalAddend'));
        }

        if (range.length > 0) {
            entry.min = parseFloat(range.attr('Min'));
            entry.max = parseFloat(range.attr('Max'));
            if (isNaN(entry.max)) {
                entry.max = 9007199254740991;
            }
            if (factor.length > 0) {
                entry.min = (entry.multiplicand * ((entry.min + entry.initialAddend) / entry.divisor)) + entry.finalAddend;
                entry.max = (entry.multiplicand * ((entry.max + entry.initialAddend) / entry.divisor)) + entry.finalAddend;
            }
            entry.value = setNumericValueForEntry(entry.min, entry.max);
        } else {
            ret = false;
            this._parent._consoleEvents("Error: Corrupt xml. Value range for " + entry.name + " is missing!");
        }
        return ret;
    };

    p._getEntryInfo = function (el) {
        var entry = {},
            powerlinkType, type, entryValidity = true;

        entry.name = el.attr(SCHEMA.NAME_ATTR);
        entry.access = el.attr(SCHEMA.ACCESS);
        setReadOnlyBasedOnRole(el, entry);
        if ((el.children(SCHEMA.SELECTION_VALUE_ELEM).length > 0) || (el.children(SCHEMA.SELECTION_VALUE_ELEM_2).length > 0)) {
            this._getEntryInfoLookupValue(el, entry);
        } else if ((el.children(SCHEMA.SELECTION_VALUE_ELEM_STRING).length > 0)) {
            this._getEntryInfoLookupValue(el, entry);
        } else if (el.children(SCHEMA.SELECTION_VALUE_ITEM_TEXT).length > 0) {
            this._getEntryInfoValueList(el, entry);
        } else {
            powerlinkType = el.attr(SCHEMA.DATA_TYPE_ATTR);
            if (powerlinkType === undefined) {
                type = el.attr(SCHEMA.DATA_TYPE);
                if (type === 'double') {
                    entryValidity = this._getEntryInfoDoubleValue(el, entry);
                } else if (type === 'integer') {
                    entryValidity = this._getEntryInfoIntegerValue(el, entry);
                } else {
                    //console.error('Unsupported Type: ', entry.type);
                }
            } else {
                if (powerlinkType.includes('INT')) {
                    entryValidity = this._getEntryInfoIntegerValue(el, entry);
                } else if (powerlinkType.includes('OCTET')) {
                    this._getEntryInfoStringValue(el, entry);
                } else {
                    //console.error('Unsupported Type: ', entry.name, powerlinkType);
                }
            }
        }
        // flag is set if information of a entry was missing 
        if (!entryValidity) {
            entry = null;
        }
        return entry;
    };

    p._convertParamForServer = function (list) {
        var keyValuePairObj = [],
            objEntry, listEntry, objEntryName, arrayCollector;
        for (var i = 0; i < list.length; i += 1) {
            objEntry = {};

            listEntry = list[i];
            if (!listEntry.isNoInput) {
                if (listEntry.value !== undefined) {
                    if (listEntry.isArrayData) {
                        objEntryName = listEntry.name.replace(/[$0-9]/g, "");
                        if (listEntry.isFirstMultiEntry && listEntry.isLastMultiEntry) {
                            //Special case: it would be an array in communication to server only if there's more than one
                            objEntry[objEntryName] = listEntry.value;
                            keyValuePairObj.push(objEntry);
                            continue;
                        } else if (listEntry.isFirstMultiEntry) {
                            arrayCollector = [];
                        }
                        arrayCollector.push(listEntry.value);
                        if (listEntry.isLastMultiEntry) {
                            objEntry[objEntryName] = arrayCollector;
                            keyValuePairObj.push(objEntry);
                        }
                    } else {
                        objEntry[listEntry.name] = listEntry.value;
                        keyValuePairObj.push(objEntry);
                    }
                } else {
                    //console.warn("Not sent to server because invalid value", list[i]);
                }
            }
        }
        return keyValuePairObj;
    };

    p.getNumberOfElementsToExtend = function (type, name) {
        var numberOfElements = 0,
            mapping = this.mappings[type];

        if (mapping && mapping[name]) {
            numberOfElements = this.mappings[type][name];
        }
        return numberOfElements;
    };

    p.extendOutputVariables = function (objEntry, list, type, name, value) {
        var j,
            numberOfElements = this.getNumberOfElementsToExtend(type, name);

        if (numberOfElements === 0) {
            objEntry.name = name;
            objEntry.value = value;
            list[objEntry.name] = objEntry.value;
        } else {
            for (j = 1; j <= numberOfElements; j = j + 1) {
                if (j < 10) {
                    objEntry.name = name + '0' + '' + j;
                } else {
                    objEntry.name = name + j;
                }
                if (Array.isArray(value)) {
                    objEntry.value = value[j - 1];
                } else { // 1- Entry only special case
                    objEntry.value = value;
                }
                list[objEntry.name] = objEntry.value;
            }
        }
    };

    p._convertParamFromServer = function (keyValuePairObj, type, direction) {
        var list = {},
            objEntry, name, value;

        for (var i = 0; i < keyValuePairObj.length; i++) {
            objEntry = {};
            name = Object.keys(keyValuePairObj[i])[0];
            value = keyValuePairObj[i][name];

            if (direction === "Output") {
                this.extendOutputVariables(objEntry, list, type, name, value);
            } else {
                objEntry.name = name;
                objEntry.value = value;
                list[objEntry.name] = objEntry.value;
            }
        }
        return list;
    };

    p.setVisionFunctionGlobalModelParameters = function (list) {
        this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionGlobalModel, 'update', this._convertGlobalModelParameter(list, SCHEMA.GROUP_TYPE.PARAMETER));
    };

    p.setVisionFunctionParameters = function (list) {
        this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionParametersRefId, 'update', this._convertParamFromServer(list, SCHEMA.GROUP_TYPE.PARAMETER));
    };

    p.updateParameterHandlerWithDataProviderOfRepository = function () {
        if (this._parent.vfCapabilities.has('UnitDependsOnOperation')) {
            this._parent.updateParameterHandler(this._parent.vpDataProvider._repository.getVisionProgramState());
        }
    };

    p.setUnitSymbolDependsOnOperation = function (visionFunctionVariablesParameterForm) {
        var variableName, globalModelOperations, resultNumber = 0, that = this;

        if (this._parent.vfCapabilities.has('UnitDependsOnOperation')) {
            variableName = this._parent.vfCapabilities.get('UnitDependsOnOperation').attr.Variable;
            globalModelOperations = this._parent.getGlobalModelParams()[0];

            visionFunctionVariablesParameterForm.settings.parameters.forEach(function (parameter) {
                if (parameter.name.startsWith(variableName)) {
                    parameter.unitSymbol = that._parent.capabilityReader.getUnitSymbolDependsOnOperation(globalModelOperations, resultNumber);
                    resultNumber = resultNumber + 1;
                }
            });
        }
    };

    p.setVisionFunctionVariables = function (list, direction) {
        var visionFunctionVariablesParameterForm = this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionVariablesRefId, 'widget');
        var functionVariables = this._convertParamFromServer(list, SCHEMA.GROUP_TYPE.VARIABLE, direction);
        this.setUnitSymbolDependsOnOperation(visionFunctionVariablesParameterForm);
        visionFunctionVariablesParameterForm.update(functionVariables, direction);

    };

    p.setVisionFunctionModelParameters = function (list) {
        this.setModelParametersInitialized(true);
        this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionModelParameterRefId, 'update', this._convertParamFromServer(list, SCHEMA.GROUP_TYPE.MODEL_PARAMETER));
    };

    p.setVisionFunctionModelTypes = function (list) {
        this.setModelTypesInitialized(true);
        this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionModelTypesRefId, 'update', this._convertParamFromServer(list, SCHEMA.GROUP_TYPE.MODEL_TYPE));
    };

    p.filterVisionFunctionModelParameters = function (modelType) {
        var list = this.getModelParameterOfModelType(this.dataModelParameter, modelType);
        this.initVisionFunctionModelParameters(list);
    };

    p.getModelParameterOfModelType = function (dataModelParameter, modelType) {
        var modelParameters = [],
            modelParametersOfModelType = this.modelTypeParameterAssignment.get(modelType);

        dataModelParameter.forEach(function (item) {
            modelParametersOfModelType.each(function () {
                var paramReference = $(this),
                    paramName = paramReference.attr(SCHEMA.NAME_ATTR);
                if (paramName === item.name) {
                    modelParameters.push(item);
                }
            });
        });
        return modelParameters;
    };

    p._getParameterModeFromVisionFunctionVaribles = function () {
        var tempList, tempParameterMode, index;
        tempList = this.getVisionFunctionVariables();
        if (tempList !== undefined) {
            for (index = 0; index < tempList.length; index++) {
                if (tempList[index].ParameterMode !== undefined) {
                    tempParameterMode = tempList[index].ParameterMode;
                    return tempParameterMode;
                }
            }
        }
    };

    p.deleteListOfVisionFunctionModelParameters = function () {
        var list = [];
        this.initVisionFunctionModelParameters(list);
    };



    p.getVisionFunctionVariables = function () {
        var list = this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionVariablesRefId, 'getData');
        return this._convertParamForServer(list);
    };

    p.getVisionFunctionParameters = function () {
        var list;
        if (this.getParametersInitialized()) {
            list = this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionParametersRefId, 'getData');
        } else {
            list = {};
            //console.warn("Parameters needs to be initialized (== taken from VisionServer) first! ");
        }
        return this._convertParamForServer(list);
    };

    p.getVisionFunctionModels = function () {
        var list = this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionModelParameterRefId, 'getData');
        return this._convertParamForServer(list);
    };

    p.getVisionFunctionModelTypes = function () {
        var list = this._callExternalWidget(this._parent.settings.parentContentId + '_' + this._parent.settings.visionFunctionModelTypesRefId, 'getData');
        return this._convertParamForServer(list);
    };

    p.getVisionFunctionCapabilities = function () {
        return this.dataVfCapabilityMap;
    };

    p._callExternalWidget = function (id, method, data) {
        return brease.callWidget(id, method, data);
    };

    return ParameterHandling;

});