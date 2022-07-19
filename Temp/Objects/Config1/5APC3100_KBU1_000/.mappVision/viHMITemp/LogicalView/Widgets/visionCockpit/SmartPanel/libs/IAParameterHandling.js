/*global define, brease, $*/
define([], function () {
    'use strict';

    function IAParameterHandling(parent) {
        this._parent = parent;
        this.mappings = [];
        this.setIAParameterInitialized(false);
        return this;
    }

    var SCHEMA = {
            GROUP_TYPE: {
                PARAMETER: 'Parameter',
                VARIABLE: 'Variable',
                LINESENSORPARAMS: 'LinescanParams',
                LIGHTANDFOCUS: 'LightAndFocus',
                IMAGESIZEPARAMS: 'ImageSizeParams',
                EXTENDEDVARIABLES: 'ExtendedIAVariables',
                PARAMS: 'params',
            },
            OUTPUT_ONLY: [
                'Output', 'Activity', 'NetTime', 'CycleTime', 'Status'
            ],
            ROLE_ATTR: 'Role',
            ACCESS: 'Access',
            NAME_ATTR: 'Name',
            ARRAY_INDICATOR_ATTR: 'NumberElements',
            DATA_TYPE_ATTR: 'PLK',
            DATA_TYPE: 'Type',
            SELECTION_VALUE_ELEM: 'Lookup',
            SELECTION_VALUE_ELEM_STRING: 'String',
            SELECTION_VALUE_ITEM_KEY: 'Key',
            SELECTION_VALUE_ITEM_TEXT: 'Value',
            ORDER_ATTR: 'Position'
        },
        p = IAParameterHandling.prototype;

    /*
     * This method initializes Parameter Handling with current schema
     * @param schema the text representation of the xml schema of current image acquisition
     *
     */

    p.initImageAcquisition = function (schema) {
        this._provideLightParamsFormDataFromSchema($(schema));
    };

    p._provideLightParamsFormDataFromSchema = function (schema) {
        this.initParameterFormWidget(this._getEntryInfoForAllEntriesOfGroup(schema, SCHEMA.GROUP_TYPE.PARAMETER, SCHEMA.GROUP_TYPE.LINESENSORPARAMS), this._parent.settings.visionLineSensorSettingsRefId);
        this.initParameterFormWidget(this._getEntryInfoForAllEntriesOfGroup(schema, SCHEMA.GROUP_TYPE.PARAMETER, SCHEMA.GROUP_TYPE.PARAMS), this._parent.settings.visionImageAcquisitionSettingsRefId);
        this.initParameterFormWidget(this._getEntryInfoForAllEntriesOfGroup(schema, SCHEMA.GROUP_TYPE.PARAMETER, SCHEMA.GROUP_TYPE.IMAGESIZEPARAMS), this._parent.settings.visionNormalImageParametersRefId);
        this.initParameterFormWidget(this._getEntryInfoForAllEntriesOfGroup(schema, SCHEMA.GROUP_TYPE.VARIABLE, SCHEMA.GROUP_TYPE.LIGHTANDFOCUS), this._parent.settings.lightAndFocusRefId);
        this.initParameterFormWidget(this._getEntryInfoForAllEntriesOfGroup(schema, SCHEMA.GROUP_TYPE.VARIABLE, SCHEMA.GROUP_TYPE.EXTENDEDVARIABLES), this._parent.settings.extendedParametersRefId);
        this.setIAParameterInitialized(true);
    };

    p.initParameterFormWidget = function (list, widgetRefId) {
        this._callExternalWidget(this._parent.settings.parentContentId + '_' + widgetRefId, 'setData', list);
    };

    //update the input parameters only once
    p.setIAParameterInitialized = function (valid) {
        this.imageAcquisitionParameterInitialized = valid;
    };

    p.getIAParameterInitialized = function () {
        return this.imageAcquisitionParameterInitialized;
    };

    p._getEntryInfoForAllEntriesOfGroup = function (schema, type, filterGroup) {
        var data = [],
            dataAfterFilter = [],
            el, entry, attrFilterValue, numberOfEntryCopies, roleList = [],
            items = schema.find(type);

        items.each(function () {
            var item = $(this),
                itemGroup = item.attr('Group');
            if (itemGroup.includes(filterGroup)) {
                dataAfterFilter.push(item[0]);
            }
        });
        items = $(dataAfterFilter);
        items.each(function () {
            var item = $(this),
                itemRole;
            if (item.attr(SCHEMA.ROLE_ATTR) !== undefined) {
                itemRole = item.attr(SCHEMA.ROLE_ATTR);
            } else {
                itemRole = item.attr(SCHEMA.ACCESS);
                if (itemRole === 'rw') {
                    itemRole = 'Input';
                } else if (itemRole === 'r') {
                    itemRole = 'Output';
                }
            }
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
                addEntryToList(data, entry, numberOfEntryCopies);
            } else {
                // abort on a corrupt xml entry
                data = [];
                break;
            }
        }
        return data;
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

    function setReadOnlyBasedOnRole(el, entry) {
        var role = el.attr(SCHEMA.ROLE_ATTR);
        if (SCHEMA.OUTPUT_ONLY.includes(role)) {
            entry.isNoInput = true;
        }
    }

    p._getEntryInfoStringValue = function (el, entry) {
        entry.type = 'string';
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
        var dataProviderList = [],
            val;
        el.children().each(function () {
            var child = $(this),
                item = {};
            item.value = child.text();
            item.text = item.value;
            dataProviderList.push(item);
        });

        entry.dataProvider = dataProviderList;
        val = dataProviderList[0].value;
        if (val === "true") {
            entry.value = true;
        } else if (val === "false") {
            entry.value = false;
        } else {
            entry.value = parseInt(dataProviderList[0].value);
        }
    };

    function hexToAscii(dezString) {
        var hexString = parseInt(dezString).toString(16),
            strOut = '';

        for (var x = 0; x < hexString.length; x += 2) {
            strOut += String.fromCharCode(parseInt(hexString.substr(x, 2), 16));
        }
        return strOut;
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
                entry.max = this._parent.vpDataProvider.getNumResultsMax(0);  
            } else {
                entry.max = parseInt(range.attr('Max'));
            }
            if (factor.length > 0) {
                entry.min = (entry.multiplicand * ((entry.min + entry.initialAddend) / entry.divisor)) + entry.finalAddend;
                entry.max = (entry.multiplicand * ((entry.max + entry.initialAddend) / entry.divisor)) + entry.finalAddend;
            }
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
        setReadOnlyBasedOnRole(el, entry);
        if ((el.children(SCHEMA.SELECTION_VALUE_ELEM).length > 0)) {
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
                } else if (type === 'std::string') {
                    this._getEntryInfoStringValue(el, entry);
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

    p._convertParamForCamera = function (list) {
        var objEntry, listEntry;
        objEntry = {};
        if (list) {
            for (var i = 0; i < list.length; i += 1) {
                listEntry = list[i];
                if (!listEntry.isNoInput) {
                    if (listEntry.value !== undefined) {
                        if (listEntry.dataProvider !== undefined) {
                            objEntry[listEntry.name] = JSON.parse(listEntry.value);
                        } else {
                            objEntry[listEntry.name] = listEntry.value;
                        }
                    }
                }
            }
        }
        return objEntry;
    };

    p.updateParameterFormWidget = function (list, widgetRefId) {
        this._callExternalWidget(this._parent.settings.parentContentId + '_' + widgetRefId, 'update', list);
    };

    p.getImageAcquisitionData = function (widgetId) {
        var list = this._callExternalWidget(this._parent.settings.parentContentId + '_' + widgetId, 'getData');
        return this._convertParamForCamera(list);
    };

    p.getLineSensorNormalImageMode  = function (widgetId) {
        var lineSensorNormalImageMode = {},
        isLinesensorNormalImageMode = this._callExternalWidget(this._parent.settings.parentContentId + '_' + widgetId, 'getValue');       
        
        lineSensorNormalImageMode.isLinesensorNormalImageMode = isLinesensorNormalImageMode;
        
        return lineSensorNormalImageMode; 
    }; 

    p.setLineSensorNormalImageMode  = function (widgetId, value) {
        this._callExternalWidget(this._parent.settings.parentContentId + '_' + widgetId, 'setValue', value);   
    };
     
    p._callExternalWidget = function (id, method, data) {
        return brease.callWidget(id, method, data);
    };
    p.dispose = function () {};
    return IAParameterHandling;

});