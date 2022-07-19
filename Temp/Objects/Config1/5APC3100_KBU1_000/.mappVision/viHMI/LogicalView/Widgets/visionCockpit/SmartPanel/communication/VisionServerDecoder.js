/*global define*/
define([
        'widgets/visionCockpit/SmartPanel/libs/pixelcloud/PixelCloud',
        'widgets/visionCockpit/SmartPanel/libs/xldcloud/XldCloud'
    ],
    function () {
        'use strict';

        function VisionServerDecoder(parentContext) {
            this._parentContext = parentContext;
            this.settings = this._parentContext.settings;
        }

        var p = VisionServerDecoder.prototype;

        p.dispose = function () {};

        p.parseMessageIfNecessary = function (context, data) {
            var message;

            if (typeof data === "string") {
                try {
                    message = JSON.parse(data);
                } catch (parseEvent) {
                    context._consoleEventsSocketInput("Parse error, incoming message was not valid JSON");
                    return {};
                }
            } else {
                message = data;
            }
            return message;
        };


        p.handleMessage = function (e) {
            var message;
            this._parentContext.setStatusResponseReciv(true);
            if (e.data instanceof Blob) {
                this._parentContext.updateButtonStates();
                this._handleImageData(e.data);
                return;
            }

            message = this.parseMessageIfNecessary(this._parentContext, e.data);

            if (message != undefined && message.meta) {

                if ((message.meta.errorString !== undefined || message.meta.error !== undefined)) {
                    this._parentContext.onWsErrorResponse(message);
                }

                if (message.meta.active === 1) {
                    if (message.meta.command === 'open_image') {
                        this._handleCommandoAckForOpenImage(message);
                    }
                } else {
                    switch (message.meta.command) {

                        case 'get_state':
                            if (this._handleGetState(e, message)) {
                                this._parentContext.onWebSocketCommandReceived();
                                return;
                            }
                            break;

                        case 'init_vp': //offline case
                            this._handleInitVisionProgram(message);
                            break;

                        case 'teach_model':
                            this._handleTeachModel(e, message);
                            break;

                        case 'modify_model':
                            this._handleModifyModel(e, message);
                            break;

                        case 'remove_model':
                            this._handleRemoveModel(e, message);
                            break;

                        case 'get_models':
                            this._handleGetModels(e, message);
                            break;

                        case 'get_global_models':
                            this._handleGetGlobalModels(e, message);
                            this._parentContext.setInitialComplete(true);
                            break;

                        case 'set_global_model':
                            this._handleSetGlobalModel(e, message);
                            break;

                        case 'ROI':
                            this._handleRoi(e, message);
                            if (!this._parentContext.paramHandler.getModelParametersInitialized() && (!this._parentContext.vfCapabilities.has("Models"))) {
                                this._parentContext.setInitialComplete(true);
                            }
                            break;

                        case 'execute':
                            this._handleExecute(e, message);
                            break;

                        case 'open_image':
                            this.handleOpenImage(e, message);
                            break;

                        case 'get_pixel_values':
                            this._handleGetPixelValues(message);
                            break;
                        default:
                            this._parentContext._consoleEventsSocketInput("Unknown message received " + JSON.stringify(message));
                            break;
                    }

                    this._parentContext.onWebSocketCommandReceived();
                }
            } else {
                this._parentContext._consoleEventsSocketInput("Unknown message received " + JSON.stringify(message));
            }

        };

        p.handleParameterMessageExecute = function (message) {
            var param = message.param,
                specificParameters,
                cameraProcessingTimeIndex = 0,
                imageAcquisitionErrorIndex = 1,
                imageNettimeIndex = 2;

            if (param) {
                if (param.specific_output) {
                    param.outputs = message.param.specific_output[this.settings.visionFunctionInstance];
                    param.inputs = message.param.specific_input[this.settings.visionFunctionInstance];
                    param.params = message.param.specific_param[this.settings.visionFunctionInstance];
                    param.outputs.push(param.vp_outputs[cameraProcessingTimeIndex]);
                    param.outputs.push(param.vp_outputs[imageAcquisitionErrorIndex]);
                    param.outputs.push(param.vp_outputs[imageNettimeIndex]);
                    this._parentContext.paramHandler.handleMessage(param);
                }
                if (param.specific_param) {
                    specificParameters = message.param.specific_param[this.settings.visionFunctionInstance];
                    this._handleSpecificParameter(specificParameters);
                }
            }
        };

        p._handleSpecificParameter = function (specificParameters) {
            if (specificParameters) {
                this._parentContext.handleExecutionRoiOrientation(specificParameters);
            }
        };

        p._handleRemoveModel = function (e, message) {
            var modelNumber;
            if (message.meta && message.meta.errorId) {
                this._parentContext.onModelRemoveError(message);
            } else if (message.param) {
                modelNumber = message.param.model_number;
                this._parentContext.onModelRemoveSucceeded(modelNumber);
            }
            if (this._parentContext.vfCapabilities.has("GlobalModel")) {
                this._sendCommand("getGlobalModels");
            }
        };

        p._handleGetModels = function (e, message) {
            if (message.param && message.param.length > 0) {
                this._handleGetModelsMessage(message.param);
            }
            this._sendCommand("getGlobalModels");
        };

        p._handleGetPixelValues = function (message) {
            if (!message.meta.error) {
                this._parentContext.pipette.color = message.param.v[0].toString();
                this._parentContext.pipette.click();
            }
        };

        p._handleGetGlobalModels = function (e, message) {
            if (message.param && message.param.length > 0) {
                this._parentContext.onGetGlobalModelsSucceeded(message);
            }
            this._parentContext.terminateTransactionExecute();
        };

        p._handleSetGlobalModel = function (e, message) {
            if ((message.meta) && (message.meta.error === 1)) {
                this._parentContext.onSetGlobalModelListError(message);
                this._parentContext.smartPanelGlobalModelList.setSelectedModelLock(true);
            } else if ((message.param && message.param.length > 0)) {
                this._parentContext.globalModelHandling.updateGlobalModelList(message.param);
                this._parentContext.globalModelHandling.onGlobalModelListSelectionChanged(undefined);
                this._parentContext.smartPanelGlobalModelList.setSelectedModelLock(false);
                this._parentContext.globalModelHandling.setVisibleOfGlobalModelInputs();
                this._parentContext.updateButtonStates();
            }
        };

        p._handleRoi = function (e, message) {
            var errMsg = false;
            if (message.meta) {
                if (message.meta.error === 1) {
                    this._parentContext.onROIError();
                    errMsg = true;
                }
            }
            if (errMsg === false) {
                this._parentContext.onROISucceeded(message);
                if (this._parentContext.vfCapabilities.has("Models")) {
                    this._sendCommand("getModels");
                } else {
                    this._parentContext.terminateTransactionExecute();
                }
            }    
        };

        p.handleOpenImage = function (e, message) {
            var evaluateWiring = true;
            if (message.meta) {
                if (message.meta.error === 1) {
                    this._parentContext.onOpenImageError(message);
                }
                if (message.meta.active === 0) {
                    this._parentContext.onOpenImageSucceeded(message);
                    this._parentContext.vsEncoder.getState(evaluateWiring);
                }
            }
        };

        p._handleExecute = function (e, message) {
            if (message.meta && (message.meta.error === 1)) {
                this._sendCommand("getState");
            } else if (message.param) {
                this.handleParameterMessageExecute(message);
                this._parentContext.onExecuteSucceeded(message);

                if (this._parentContext.vfCapabilities.has("ExecutionRoi")) {
                    this._sendCommand("getRoi");
                } else if (this._parentContext.vfCapabilities.has("Models")) {
                    this._sendCommand("getModels");
                }
            }
        };

        p._handleTeachModel = function (e, message) {
            if (message.meta) {
                if (message.meta.error === 1) {
                    this._handleCommandoTeachModelError(message);
                }
            }

            if (message.param && (message.param.length > 0)) {
                this.handleTeachModelResponse(message);
            } else {
                this._parentContext._consoleEventsSocketInput(e.data);
            }
            if (this._parentContext.vfCapabilities.has("GlobalModel")) {
                this._parentContext.globalModelHandling.updateValueRangesAndVisibilityofGlobalModel();
                this._parentContext.smartPanelGlobalModelList.deSelectAll();
                this._parentContext.smartPanelGlobalModelList.setSelectedModelLock(false);
            }
        };

        p._handleModifyModel = function (e, message) {
            if (message.meta) {
                if (message.meta.error === 1) {
                    this._handleCommandoModifyModelError(message);
                }
            }

            if (message.param && (message.param.length > 0)) {
                this.handleModifyModelResponse(message);
            } else {
                this._parentContext._consoleEventsSocketInput(e.data);
            }
        };

        p._handleInitVisionProgram = function (message) {
            this._parentContext.onInitVisionProgramMessage(message);
        };

        p._handleGetState = function (e, message) {
            return this._parentContext.onGetStateMessage(message);
        };

        p._handleGetModelsMessage = function (models) {
            var modelList = [],
                context = this,
                contextSettings = this.settings,
                modelType,
                metaData;

            this._parentContext.deleteAllRoiData();    

            models.forEach(function (model) {
                if (model.model_number === 0) {
                    modelType = model.model_type;
                    context._parentContext.selectedModelType = modelType;
                    contextSettings.defaultModelParameters.set(modelType, model.model_params);
                } else if (model.model_number > 0) {
                    metaData = model.model_type;
                    modelList.push({
                        "model_number": model.model_number,
                        "model_meta": metaData,
                    });
                    context._parentContext.addNewModelToVisionFunction(model);
                }
            });

            this._parentContext.iconicDecoder.setModelRois();
            this._parentContext.smartPanelModelList.updateSmartPanelModelList(modelList);
            this._parentContext.updateModelView();
        };

        p._handleGetGlobalModelsMessage = function (models) {
            this._parentContext.updateGlobalModelList(models);
        };

        p._handleImageData = function (data) {
            if (!this.settings.offlineMode) {
                if (!this._parentContext.initialImageLoaded) {
                    this._parentContext.initialImageLoaded = true;
                }
            }
            this._parentContext.smartControl.dispImage(data, 'AnyID');
        };


        p._handleCommandoAckForOpenImage = function (message) {
            if (message.meta.command === 'open_image') {
                this._parentContext.acquireImage();
            }
        };

        p.handleTeachModelResponse = function (message) {
            var modelNumber,
                teachedModels = new Map(),
                modelParams,
                modelType,
                modelMeta,
                model,
                that = this;

            message.param.forEach(function (param) {
                modelMeta = undefined;

                if (param.function && param.model_number && param.model_type) {
                    modelNumber = param.model_number;
                    modelType = param.model_type;

                    teachedModels.set(modelNumber, {
                        modelNumber: modelNumber,
                        modelType: modelType,
                    });
                }

                if (param.model_params) {
                    modelParams = param.model_params;
                }

                if (param.model_meta) {
                    modelMeta = param.model_meta;
                    if (param.model_meta.ModelNumber) {
                        modelNumber = param.model_meta.ModelNumber;
                    }
                }

                model = that.settings.vfModels.get(modelNumber);
                if (model) {
                    model.parameters = modelParams;
                    model.modelType = modelType;
                    Object.assign(model.modelMeta, modelMeta);
                } else {
                    that.settings.vfModels.set(modelNumber, {
                        parameters: modelParams,
                        modelType: modelType,
                        modelMeta: modelMeta,
                        modelNumber: modelNumber
                    });
                }
            });

            this._parentContext.onTeachModel(teachedModels);
        };

        p._handleCommandoTeachModelError = function (message) {
            this._parentContext.onTeachModelError(message);
        };

        p._handleCommandoModifyModelError = function (message) {
            this._parentContext.onSubmitModelError(message);
            this._sendCommand("getState");
        };

        p.handleModifyModelResponse = function (message) {
            var modelNumber,
                modelParams,
                teachedModels = new Map(),
                modelType,
                modelMeta,
                model,
                that = this;

            // add model to model list - select model in model list
            message.param.forEach(function (param) {

                modelParams = undefined;
                modelMeta = undefined;

                if (param.function && param.model_number && param.model_type) {
                    modelNumber = param.model_number;
                    modelType = param.model_type;

                    teachedModels.set(modelNumber, {
                        modelNumber: modelNumber,
                        modelType: modelType,
                    });
                }

                if (param.model_params) {
                    modelParams = param.model_params;
                }

                if (param.model_meta) {
                    modelMeta = param.model_meta;
                    if (param.model_meta.ModelNumber) {
                        modelNumber = param.model_meta.ModelNumber;
                    }
                }

                model = that.settings.vfModels.get(modelNumber);

                if (model && (model.modelNumber === modelNumber)) {
                    model.parameters = modelParams;
                    model.modelType = modelType;
                    Object.assign(model.modelMeta, modelMeta);
                }
            });
            this._parentContext.onSubmitModel(teachedModels);
        };

        p._evaluateOnlineOrOfflineMode = function (message) {
            this.settings.offlineMode = message.meta.VSM.offline;
        };

        p._sendCommand = function (command) {
            switch (command) {
                case "getState":
                    this._parentContext.vsEncoder.getState();
                    break;
                case "getModels":
                    this._parentContext.vsEncoder.getModels(this.settings.visionFunctionName);
                    break;
                case "getGlobalModels":
                    this._parentContext.vsEncoder.getGlobalModels(this.settings.visionFunctionName);
                    break;
                case "getRoi":
                    this._parentContext.vsEncoder.getRoi(this.settings.visionFunctionName);
                    break;
            }
        };

        return VisionServerDecoder;
    });