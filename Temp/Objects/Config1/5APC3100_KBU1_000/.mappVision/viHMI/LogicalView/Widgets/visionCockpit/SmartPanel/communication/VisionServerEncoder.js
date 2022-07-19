/*global define*/
define([], function () {
    'use strict';

    function VisionServerEncoder(parentContext) {
        this._parentContext = parentContext;
    }

    var p = VisionServerEncoder.prototype;

    p.dispose = function () {};


    p.setSocket = function (socket) {
        this._socket = socket;
    };

    p._send = function (data, skipLogging) {
        var telegram = JSON.stringify(data);
        if ((data.meta.command !== 'get_pixel_values') && (data.meta.command !== 'get_state')) {
            this._parentContext.setStatusResponseReciv(false);
            this._parentContext.updateButtonStates();
        }
        if (this._socket && this._socket.readyState === 1) {
            this._socket.send(telegram);

            if (skipLogging !== true) {
                this._parentContext._consoleEventsSocketOutput(telegram);
            }
        }
    };


    p.initVisionProgram = function (path) {
        var telegram = {
            meta: {
                command: 'init_vp'
            },
            param: {
                path: path
            }
        };
        this._send(telegram);
    };

    p.getState = function (evaluateWiring) {
        var telegram = {
            meta: {
                command: 'get_state'
            }
        };
        if (evaluateWiring === true) {
            telegram.param = {
                wiring: true
            };
        }
        this._send(telegram);
    };

    p.getPixelValues = function (x, y) {
        var telegram = {
            meta: {
                command: 'get_pixel_values'
            },
            param: {
                "x": [x],
                "y": [y]
            }
        };
        this._send(telegram);
    };

    p.openImage = function (imagePath, type, quality, keepSync) {
        var telegram = {
            meta: {
                command: 'open_image'
            },
            param: {
                'type': type,
                'keep_sync': false
            }
        };
        if ((quality !== undefined) && (quality !== "")) {
            telegram.param.quality = quality;
        }
        if ((imagePath !== undefined) && (imagePath !== "")) {
            telegram.param.path = imagePath;
        }
        if (keepSync) {
            telegram.param.keep_sync = keepSync;
        }
        this._send(telegram);
    };

    p.getModels = function (visionFunctionInstance) {
        var telegram = {
            meta: {
                command: 'get_models'
            },
            "param": {
                "model_number": -1,
                "model_type": "",
                "function": visionFunctionInstance
            }
        };
        this._send(telegram);
    };

    p.getGlobalModels = function (visionFunctionInstance) {
        var telegram = {
            meta: {
                command: 'get_global_models'
            },
            "param": {
                "model_number": -1,
                "model_type": "relation",
                "function": visionFunctionInstance
            }
        };
        this._send(telegram);
    };

    p.setGlobalModel = function (visionFunctionInstance, modelNumber, modelType, modelParams) {
        var telegram = {
            meta: {
                command: 'set_global_model'
            },
            "param": {
                "model_number": modelNumber,
                "model_type": modelType,
                "model_params": modelParams,
                "function": visionFunctionInstance
            }
        };
        this._send(telegram);
    };

    p.getRoi = function (visionFunctionInstance) {
        var roiTelegram = {
            meta: {
                command: 'ROI'
            },
            "param": {
                "function": visionFunctionInstance
            }
        };
        this._send(roiTelegram);
    };


    p.setRois = function (visionFunctionInstance, rois) {
        if (rois.length > 0) {
            var telegram = {
                meta: {
                    command: 'ROI'
                },
                "param": {
                    "function": visionFunctionInstance,
                    "ROI": rois
                }
            };
            this._send(telegram);
        }
    };

    p.execute = function (visionFunctionSelector, spInputs, spParam) {
        var telegram = {},
            param = {};

        telegram = {
            meta: {
                command: 'execute'
            },
        };

        param.function = visionFunctionSelector;
        param.specific_input = spInputs;
        param.specific_param = spParam;
        telegram.param = param;

        this._send(telegram);
    };

    p.teachModel = function (visionFunctionInstance, modelNumber, modelParams, modelType) {
        var telegram;
        telegram = {
            "meta": {
                "command": 'teach_model'
            },
            "param": {
                "model_number": modelNumber,
                "model_params": modelParams,
                "model_type": modelType,
                "function": visionFunctionInstance
            }
        };
        this._send(telegram);
    };

    p.modifyModel = function (visionFunctionInstance, modelNumber, modelParams, modelType) {
        var telegram;
        telegram = {
            "meta": {
                "command": 'modify_model'
            },
            "param": {
                "model_number": modelNumber,
                "model_params": modelParams,
                "model_type": modelType,
                "function": visionFunctionInstance
            }
        };
        this._send(telegram);
    };

    p.removeModel = function (visionFunctionInstance, selectedModelId, modelType) {
        var telegram = {
            "meta": {
                "command": 'remove_model'
            },
            "param": {
                "model_number": selectedModelId,
                "model_type": modelType,
                "function": visionFunctionInstance
            }
        };
        this._send(telegram);
    };

    p.getRLEEncoding = function (blob) {
        var vecLength = blob.x.length,
            index,
            x,
            y,
            xvec,
            rx1 = [],
            rx2 = [],
            ry = [],
            xStart,
            xEnd,
            xp,
            xLast,
            keys;

        var vMap = new Map();
        for (index = 0; index < vecLength; index++) {
            x = blob.x[index];
            y = blob.y[index];
            xvec = vMap.get(y);
            if (xvec === undefined) {
                vMap.set(y, [x]);
            } else {
                xvec.push(x);
            }
        }

        keys = vMap.keys();
        vMap.forEach(function (item) {
            item.sort(function (a, b) {
                return a - b;
            });
            xStart = item[0];
            xEnd = item[0];
            xLast = xStart;
            y = keys.next().value;

            if (item.length === 1) {
                rx1.push(xStart);
                rx2.push(xEnd);
                ry.push(y);
            } else if (item.length > 1) {
                for (index = 1; index < item.length; index++) {
                    xp = item[index];
                    if (xp === xLast + 1) {
                        xEnd = xp;
                    } else {
                        rx1.push(xStart);
                        rx2.push(xEnd);
                        ry.push(y);
                        xStart = xp;
                        xEnd = xp;
                    }
                    xLast = xp;
                    if (index === item.length - 1) {
                        rx1.push(xStart);
                        rx2.push(xEnd);
                        ry.push(y);
                    }
                }
            }
        });

        return {
            type: "region",
            format: "region_rle",
            x1: rx1,
            x2: rx2,
            y: ry
        };
    };


    return VisionServerEncoder;
});