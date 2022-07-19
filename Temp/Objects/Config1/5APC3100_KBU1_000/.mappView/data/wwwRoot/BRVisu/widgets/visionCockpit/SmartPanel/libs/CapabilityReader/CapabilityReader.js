/*global define, brease, $*/

define([], function () {

    'use strict';

    function CapabilityReader() {
        this.vfCapabilityMap = new Map();
        this.toolListMap = new Map();
        this.modelTypeCapabilityMap = new Map();
        this.operationsMap = new Map();
        return this;
    }

    var p = CapabilityReader.prototype;

    p.xmlToJson = function (xml) {
        var obj = {};

        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["attr"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["attr"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof (obj[nodeName]) == "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }
        return obj;
    };

    p.getVisionFunctionCapabilities = function () {
        return this.vfCapabilityMap;
    };

    p.getToolListMap = function () {
        return this.toolListMap;
    };

    p.getOperationsMap = function () {
        return this.operationsMap;
    };

    p.readCapabilitiesFromXmlDoc = function (xmlDoc) {
        this.initializeMaps();
        this.vfCapabilityMap = this.getVfCapabilityData(xmlDoc);

        if (this.vfCapabilityMap.has("Models")) {
            this.modelTypeCapabilityMap = this.getModelTypeCapabilityData(xmlDoc);
            this.vfCapabilityMap.set("ModelTypes", this.modelTypeCapabilityMap);
        }

        if (this.vfCapabilityMap.has("GlobalModel")) {
            this.operationsMap = this.getOperationsData(xmlDoc);
            this.vfCapabilityMap.set("Operations", this.operationsMap);
        }

        this.toolListMap = this.getToolListData(xmlDoc);
        return this.vfCapabilityMap;
    };

    p.initializeMaps = function () {
        this.vfCapabilityMap.clear();
        this.toolListMap.clear();
        this.modelTypeCapabilityMap.clear();
        this.operationsMap.clear();
    };

    p.getVfCapabilityData = function (xmlDoc) {
        var vfCapabilityMap = this.vfCapabilityMap,
            capabilities = [],
            itemVisionFunction = this.xmlToJson(xmlDoc).VisionFunction;

        if (itemVisionFunction && itemVisionFunction.Capabilities && itemVisionFunction.Capabilities.Capability) {
            if (!Array.isArray(itemVisionFunction.Capabilities.Capability)) {
                capabilities.push(itemVisionFunction.Capabilities.Capability);
            } else {
                capabilities = itemVisionFunction.Capabilities.Capability;
            }

            capabilities.forEach(function (capability) {
                vfCapabilityMap.set(capability.attr.Function, capability);

            });
        }
        return vfCapabilityMap;
    };

    p.getModelTypeCapabilityData = function (xmlDoc) {
        var modelTypeMap = this.modelTypeCapabilityMap,
            capabilities = [],
            capabilityEntries = [],
            capabilityItem,
            modelTypes = [],
            modelTypeName,
            modelTypeItem,
            itemVisionFunction = this.xmlToJson(xmlDoc).VisionFunction;

        if (itemVisionFunction && itemVisionFunction.ModelParameters && itemVisionFunction.ModelParameters.ModelType) {
            if (!Array.isArray(itemVisionFunction.ModelParameters.ModelType)) {
                modelTypes.push(itemVisionFunction.ModelParameters.ModelType);
            } else {
                modelTypes = itemVisionFunction.ModelParameters.ModelType;
            }

            modelTypes.forEach(function (modelType) {
                modelTypeName = modelType.attr.Name;

                if (modelType.Capabilities && modelType.Capabilities.Capability) {
                    if (!Array.isArray(modelType.Capabilities.Capability)) {
                        capabilities.push(modelType.Capabilities.Capability);
                    } else {
                        capabilities = modelType.Capabilities.Capability;
                    }
                    capabilityEntries = [];
                    capabilities.forEach(function (capability) {
                        capabilityItem = {
                            Name: capability.attr.Name,
                            Value: capability.attr.Value,
                            Type: capability.attr.Type,
                        };
                        capabilityEntries.push(capabilityItem);
                    });
                }

                modelTypeItem = {
                    Name: modelType.attr.Name,
                    Teachable: modelType.attr.Teachable,
                    Marker: modelType.attr.Marker,
                    ModelRoi: modelType.attr.ModelRoi,
                    Capabilities: capabilityEntries,
                };
                modelTypeMap.set(modelTypeName, modelTypeItem);

            });
        }

        return modelTypeMap;
    };

    p.getToolListData = function (xmlDoc) {
        var toolListMap = this.toolListMap,
            toolList = [],
            tools = [],
            toolListReferences = [],
            toolListReferenceName,
            capabilities,
            toolItem,
            itemVisionFunction = this.xmlToJson(xmlDoc).VisionFunction;

        if (itemVisionFunction && itemVisionFunction.Capabilities) {
            capabilities = itemVisionFunction.Capabilities;

            if (capabilities.Capability) {
                itemVisionFunction.Capabilities.Capability.forEach(function (itemCapability) {
                    if (itemCapability.ToolListReference) {
                        if (!Array.isArray(itemCapability.ToolListReference)) {
                            toolListReferences.push(itemCapability.ToolListReference);
                        } else {
                            toolListReferences = itemCapability.ToolListReference;
                        }
                        toolListReferences.forEach(function (toolListReference) {
                            toolListReferenceName = toolListReference.attr.Name;
                            tools = [];
                            toolList = [];

                            if (toolListReference.Tool) {
                                if (!Array.isArray(toolListReference.Tool)) {
                                    tools.push(toolListReference.Tool);
                                } else {
                                    tools = toolListReference.Tool;
                                }
                                tools.forEach(function (tool) {
                                    toolItem = {
                                        Type: tool.attr.type,
                                        Default: tool.attr.default,
                                        Operation: tool.attr.operation,
                                        SizeFactor: tool.attr.size,
                                        PositionFactor: tool.attr.position
                                    };
                                    toolList.push(toolItem);
                                });
                                toolListMap.set(toolListReferenceName, toolList);
                            }
                        });
                    }
                });
            }
        }

        return toolListMap;
    };

    function hexToAscii(dezString) {
        var hexString = parseInt(dezString).toString(16),
            strOut = '';

        for (var x = 0; x < hexString.length; x += 2) {
            strOut += String.fromCharCode(parseInt(hexString.substr(x, 2), 16));
        }
        return strOut;
    }

    p.getUnitSymbolDependsOnOperation = function (globalModelOperations, resultNumber) {
        var unitSymbol = '', configuredOperation;

        if (globalModelOperations !== undefined && globalModelOperations.Operation.length > 0) {
            configuredOperation = globalModelOperations.Operation[resultNumber];
            this.operationsMap.forEach(function (element) {
                if (element.Operation === configuredOperation) {
                    unitSymbol = element.UnitSymbol;
                }
            });
        }

        return unitSymbol;
    };

    p._setUnitSymbolAsync = function (widget, unit, operation) {
        brease.language.pipeAsyncUnitSymbol(unit, function (unitSymbol) {
            if (unitSymbol === undefined) {
                widget.operationsMap.get(operation).UnitSymbol = '';
            } else {
                widget.operationsMap.get(operation).UnitSymbol = unitSymbol;
            }
        });
    };

    p.getOperationsData = function (xmlDoc) {
        var operationsMap = this.operationsMap,
            operations = [],
            entry,
            capabilities,
            attrOperationName,
            attrReference,
            attrTarget,
            attrUnit,
            that = this,
            itemVisionFunction = this.xmlToJson(xmlDoc).VisionFunction;

        if (itemVisionFunction && itemVisionFunction.Capabilities) {
            capabilities = itemVisionFunction.Capabilities;

            if (capabilities.Capability) {
                itemVisionFunction.Capabilities.Capability.forEach(function (itemCapability) {
                    if (itemCapability.Operation) {
                        if (!Array.isArray(itemCapability.Operation)) {
                            operations.push(itemCapability.Operation);
                        } else {
                            operations = itemCapability.Operation;
                        }
                        operations.forEach(function (operation) {
                            attrOperationName = operation.attr.Name;
                            attrReference = operation.attr.Reference;
                            attrTarget = operation.attr.Target;
                            entry = {
                                Operation: attrOperationName,
                                Reference: attrReference,
                                Target: attrTarget,
                                UnitSymbol: ''
                            };
                            operationsMap.set(attrOperationName, entry);
                            attrUnit = operation.attr.UnitNS + '|' + hexToAscii(operation.attr.UnitID); 
                            that._setUnitSymbolAsync(that, attrUnit, entry.Operation);
                        });
                    }
                });
            }
        }

        return operationsMap;
    };

    return CapabilityReader;

});