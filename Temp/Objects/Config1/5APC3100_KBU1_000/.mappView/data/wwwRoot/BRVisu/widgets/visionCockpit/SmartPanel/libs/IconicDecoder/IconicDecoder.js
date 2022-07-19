/*global define*/
define([
        'widgets/visionCockpit/SmartPanel/libs/pixelcloud/PixelCloud',
        'widgets/visionCockpit/SmartPanel/libs/xldcloud/XldCloud',
        'widgets/visionCockpit/SmartPanel/libs/roi/ServerRoi/ServerRoi',
    ],

    function (PixelCloud, XldCloud, ServerRoi) {
        'use strict';

        function IconicDecoder(parentContext) {
            this._parentContext = parentContext;
            this.settings = this._parentContext.settings;
            this.iconicDictionary = this._parentContext.iconicDictionary;
            this.smartControl = this._parentContext.smartControl;
            this.colorSettings = this._parentContext.colorSettings;
            this.imageSizes = this._parentContext.imageSizes;
        }

        var p = IconicDecoder.prototype;

        p.dispose = function () {};

        /////////////////////////////////////////////////////////////////////
        // decode Execute results

        p.decodeExecuteResults = function (outputs) {

            var that = this;
            if (outputs) {
                outputs.forEach(function (output) {
                    if (output.ObjectDataOut) {
                        that.decodeObjectDataOut(output.ObjectDataOut);
                    }
                });
            }
        };

        p.decodeObjectDataOut = function (objectDataOut) {
            var filterInfo,
                objectDataOuts = [],
                that = this;

            if (objectDataOut) {
                objectDataOuts = [];
                if (Array.isArray(objectDataOut)) {
                    objectDataOuts = objectDataOut;
                } else {
                    objectDataOuts.push(objectDataOut);
                }
                objectDataOuts.forEach(function (objectDataOutItem, resultIndex) {
                    filterInfo = that.parseFilterInfo(objectDataOutItem, resultIndex);
                    that.decodeClassObjects(objectDataOutItem, filterInfo);
                });
            }
        };

        p.decodeClassObjects = function (classObjects, filterInfo) {
            var className,
                classType,
                classElement,
                classElements = [],
                that = this;

            for (className in classObjects) {
                classElement = classObjects[className];
                classElements = [];
                if (Array.isArray(classElement)) {
                    classElements = classElement;
                } else {
                    classElements.push(classElement);
                }
                classElements.forEach(function (classItem) {
                    classType = classItem.type;
                    if (className && classType) {
                        if (!((className === "Region") && classType.includes("modelroi"))) {
                            that.decodeIconicObjects(classItem.iconic, className, classType, filterInfo);
                        }
                    }
                });
            }
        };

        p.decodeIconicObjects = function (iconicObjects, className, classType, filterInfo) {
            var that = this,
                iconicDrawSettings;

            if (iconicObjects) {
                iconicObjects.forEach(function (iconic) {
                    iconic.forEach(function (iconicElement) {
                        iconicDrawSettings = that.getIconicDrawSettings("TestExecute", className, classType, iconicElement.type);
                        if (iconicDrawSettings) {
                            that.paintExecuteIconicItem(iconicElement, filterInfo.ResultIndex, filterInfo.FilterModels, iconicDrawSettings);
                        }
                    });
                });
            }
        };

        p.paintExecuteIconicItem = function (iconicItem, filterIndex, filterModels, drawSettings) {
            var pixelCloud, xldCloud;

            if (iconicItem.type === "region") {
                switch (iconicItem.format) {
                    case "region":
                    case "region_rle":
                        pixelCloud = new PixelCloud(this.smartControl,
                            iconicItem,
                            drawSettings,
                            filterIndex,
                            filterModels);
                            pixelCloud.hide();
                        this.smartControl.panPositionObservable.subscribe(function () {
                            pixelCloud.onUpdateZoomValue();
                        });
                        this.settings.resultClouds.push(pixelCloud);
                        break;

                    case "xld_poly":
                    case "xld_cont":
                        xldCloud = new XldCloud(this.smartControl,
                            iconicItem,
                            drawSettings,
                            filterIndex,
                            filterModels);
                            xldCloud.hide();
                        this.smartControl.panPositionObservable.subscribe(function () {
                            xldCloud.onUpdateZoomValue();
                        });
                        this.settings.resultClouds.push(xldCloud);
                        break;
                }
            } else {
                xldCloud = new XldCloud(this.smartControl,
                    iconicItem,
                    drawSettings,
                    filterIndex,
                    filterModels);
                    xldCloud.hide();
                this.smartControl.panPositionObservable.subscribe(function () {
                    xldCloud.onUpdateZoomValue();
                });
                this.settings.resultClouds.push(xldCloud);
            }
        };

        /////////////////////////////////////////////////////////////////////
        // decode Teach results

        p.decodeTeachResults = function (teachedModels) {
            var iconic,
                iconicItems = [],
                model,
                className,
                classElement,
                classElements = [],
                classType,
                classIconics,
                iconicDrawSettings,
                that = this;

            teachedModels.forEach(function (tmodel) {

                iconicItems = [];
                model = that.settings.vfModels.get(tmodel.modelNumber);

                if (model) {
                    that._parentContext._deleteModelCloud(model.modelNumber);

                    for (className in model.modelMeta) {
                        if (className != "ModelNumber") {
                            classElement = model.modelMeta[className];
                            classElements = [];
                            if (Array.isArray(classElement)) {
                                classElements = classElement;
                            } else {
                                classElements.push(classElement);
                            }

                            classElements.forEach(function (classItem) {
                                classType = classItem.type;

                                if ((className === "Region") && (classType.includes("modelroi"))) {
                                    that.updateModelRoi(model.modelNumber, classItem);
                                    that.showModelRoi(model.modelNumber);
                                } else {
                                    classIconics = classItem.iconic;
                                    if (classIconics) {
                                        classIconics.forEach(function (classIconic) {
                                            classIconic.forEach(function (subElement) {
                                                iconicDrawSettings = that.getIconicDrawSettings("ModifyTeach", className, classType, subElement.type);
                                                if (iconicDrawSettings) {
                                                    iconic = that.paintTeachIconicItem(subElement, iconicDrawSettings);
                                                    if (iconic) {
                                                        iconic.show();
                                                        iconicItems.push(iconic);
                                                    }
                                                }
                                            });
                                        });
                                    }
                                }
                            });
                        }
                    }
                    that.settings.modelClouds.set(model.modelNumber, iconicItems);
                }
            });
        };

        p.paintTeachIconicItem = function (iconicItem, drawSettings) {
            var item;
            if (iconicItem.type === "region") {
                switch (iconicItem.format) {
                    case undefined:
                    case "region":
                    case "region_rle":
                        item = new PixelCloud(this.smartControl,
                            iconicItem,
                            drawSettings,
                            0,
                            0);
                        this.smartControl.panPositionObservable.subscribe(function () {
                            item.onUpdateZoomValue();
                        });
                        break;

                    case "xld_poly":
                    case "xld_cont":
                        item = new XldCloud(this.smartControl,
                            iconicItem,
                            drawSettings,
                            0,
                            0);
                        this.smartControl.panPositionObservable.subscribe(function () {
                            item.onUpdateZoomValue();
                        });
                        break;
                }
            } else {
                item = new XldCloud(this.smartControl,
                    iconicItem,
                    drawSettings,
                    0,
                    0);
                this.smartControl.panPositionObservable.subscribe(function () {
                    item.onUpdateZoomValue();
                });
            }
            return item;
        };

        p.updateModelRoi = function (modelNumber, classItem) {
            var that = this,
                prefixString = "M",
                model = this.settings.vfModels.get(modelNumber),
                iconicDrawSettings,
                classIconics = [],
                modelRoi;

            if (model) {
                iconicDrawSettings = this.getIconicDrawSettings("ModifyTeach", "Region", "modelroi", "region");
                modelRoi = model.modelRoi;

                if (modelRoi) {
                    modelRoi.deleteRoiData();
                } else {
                    model.modelRoi = new ServerRoi("ModelRoi", this._parentContext, this.imageSizes, iconicDrawSettings);
                }

                classIconics = classItem.iconic;
                if (classIconics) {
                    classIconics.forEach(function (classIconic) {
                        classIconic.forEach(function (subElement) {
                            iconicDrawSettings = that.getIconicDrawSettings("ModifyTeach", "Region", "modelroi", subElement.type);
                            model.modelRoi.decodeRoiItem(subElement, iconicDrawSettings, prefixString, model.modelNumber);
                        });
                    });
                }
            }
        };

        /////////////////////////////////////////////////////////////////////
        // decode and update modelroi/model-serverroi on get_models

        p.setModelRois = function () {
            var that = this,
                iconicDrawSettings,
                className,
                classType,
                classElement,
                classElements = [];

            iconicDrawSettings = this.getIconicDrawSettings("ModifyTeach", "Region", "modelroi", "region");

            this.settings.vfModels.forEach(function (model) {
                if (model.modelRoi === undefined) {
                    model.modelRoi = new ServerRoi("ModelRoi", that._parentContext, that.imageSizes, iconicDrawSettings);
                }

                for (className in model.modelMeta) {
                    if (className != "ModelNumber") {
                        classElement = model.modelMeta[className];
                        classElements = [];
                        if (Array.isArray(classElement)) {
                            classElements = classElement;
                        } else {
                            classElements.push(classElement);
                        }

                        classElements.forEach(function (classItem) {
                            classType = classItem.type;

                            if ((className === "Region") && (classType.includes("modelroi"))) {
                                that.updateModelRoi(model.modelNumber, classItem);
                            }
                        });
                    }
                }

                if (model.modelRoi != undefined) {
                    model.modelRoi.hide();
                }
            });
        };

        p.showModelRoi = function (modelNumber) {
            var model = this.settings.vfModels.get(modelNumber),
                modelRoi;

            if (model) {
                modelRoi = model.ModelRoi;
                if (modelRoi) {
                    modelRoi.show();
                }
            }
        };

        p.getIconicDrawSettings = function (context, className, classType, iconicType) {
            var dictionaryKey,
                drawSettings,
                alphaValue,
                iconicSettings;

            if (className && classType && ((context === "TestExecute") || (context === "ModifyTeach"))) {
                dictionaryKey = className + "_" + classType;
                iconicSettings = this.iconicDictionary.getIconicDictionary()[context].get(dictionaryKey);

                if (iconicSettings) {
                    if (iconicSettings.Visible && iconicSettings.Visible === "false") {
                        return undefined;
                    }

                    if (iconicSettings.Transparency === undefined) {
                        return undefined;
                    }

                    if (iconicSettings.Color === undefined) {
                        return undefined;
                    }

                    alphaValue = (100 - parseInt(iconicSettings.Transparency)) / 100.0;
                    drawSettings = {
                        meta: {
                            iconicInfo: context + " " + className + " " + classType
                        },
                        color: {
                            fillOpacity: alphaValue,
                            strokeOpacity: 0,
                            strokeOpacitySelected: 1,
                            strokeColor: iconicSettings.Color,
                            highlightColor: this.calculateHighlightColor(iconicSettings.Color),
                            fillColor: iconicSettings.Color,
                            infoText: iconicSettings.Color,
                            highlightRgba: this.getRGBAValue(this.calculateHighlightColor(iconicSettings.Color), alphaValue),
                            rgba: this.getRGBAValue(iconicSettings.Color, alphaValue),
                        }
                    };

                    if (iconicType === 'region') {
                        drawSettings.color.fillOpacity = alphaValue;
                        drawSettings.color.strokeOpacity = 0;
                    } else {
                        drawSettings.color.fillOpacity = 0;
                        drawSettings.color.strokeOpacity = alphaValue;
                    }
                } else {
                    console.log("Key: ", dictionaryKey + ' iconic settings undefined - key not found in dictionary!');
                }
            }
            return drawSettings;
        };

        p.parseFilterInfo = function (objectDataOut, resultIndex) {
            var filterInfo = {
                    ResultIndex: resultIndex + 1,
                    FilterModels: undefined,
                    OperationIndex: undefined
                },
                className;

            for (className in objectDataOut) {
                switch (className) {
                    case "ListNumber":
                        filterInfo.OperationIndex = parseInt(objectDataOut.ListNumber);
                        break;
                    case "ModelNumber":
                        filterInfo.FilterModels = objectDataOut.ModelNumber;
                        break;
                }
            }
            return filterInfo;
        };

        p.getRGBAValue = function (color, alpha) {
            var r = parseInt(color.substring(1, 3), 16),
                g = parseInt(color.substring(3, 5), 16),
                b = parseInt(color.substring(5, 7), 16),
                rgba = {
                    r: r,
                    g: g,
                    b: b,
                    a: Math.floor(alpha * 255)
                };
            return rgba;
        };

        p.calculateHighlightColor = function(color) {
            var offset = 127,
                r = parseInt(color.substring(1, 3), 16) + offset,
                g = parseInt(color.substring(3, 5), 16) + offset,
                b = parseInt(color.substring(5, 7), 16) + offset,
                highlightColor;
                r = Math.min(r, 0xff);
                g = Math.min(g, 0xff);
                b = Math.min(b, 0xff);
                highlightColor = "#" + this.decimalToHex(r,2) + this.decimalToHex(g,2) + this.decimalToHex(b,2);
            return highlightColor;
        };

        p.decimalToHex = function (d, padding) {
            var hex = Number(d).toString(16);
            padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
        
            while (hex.length < padding) {
                hex = "0" + hex;
            }
            return hex;
        };

        return IconicDecoder;
    });