/*global define */
define([], function () {
    'use strict';

    function VisionProgramDataProvider(repository) {
        this._repository = repository;
        return this;
    }

    var p = VisionProgramDataProvider.prototype;

    p.setVisionProgramState = function (vpState) {
        this._repository.setVisionProgramState(vpState);
        this.updateVisionProgramWiring(vpState);
    };

    p.updateVisionProgramWiring = function (vpState) {
        var param = vpState.param,
            vpParameters,
            vpWiring,
            vpIndex;
        if (param && (param.length > 0)) {
            vpIndex = param.length - 1;
            vpParameters = param[vpIndex];
            if (vpParameters) {
                vpWiring = vpParameters.wirings;
                if (vpWiring && vpWiring.configured && (vpWiring.configured.length > 0)) {
                    this._repository.setVisionProgramWiring(vpWiring.configured);
                }
            }
        }
    };

    p.getOfflineMode = function () {
        var offlineMode,
            vpState = this._repository.getVisionProgramState();
        if (vpState.meta && vpState.meta.VSM) {
            offlineMode = vpState.meta.VSM.offline;
        }
        return offlineMode;
    };

    p.setUserDefinedParameterMode = function (userDefinedParameterMOde) {
        var visionFunctionParameter = this._repository.getVisionFunctionParameter();
        visionFunctionParameter.userDefinedParameterMode = userDefinedParameterMOde;
    };

    p.getUserDefinedParameterMode = function () {
        var visionFunctionParameter = this._repository.getVisionFunctionParameter();
        return visionFunctionParameter.userDefinedParameterMode;
    };

    p.getVisionProgramName = function () {
        var vpState = this._repository.getVisionProgramState(),
            name = vpState.meta.program.name;
        return name;
    };

    p.getVisionFunctionName = function (visionFunctionInstance) {
        var vpState = this._repository.getVisionProgramState(),
            order,
            vfName = "";

        if (vpState.meta && vpState.meta.functions) {
            order = parseInt(visionFunctionInstance);

            vpState.meta.functions.forEach(function (vf) {
                if (vf.order === order) {
                    vfName = vf.name;
                }
            });
        }
        return vfName;
    };

    p.getListOfVisionFunctionNames = function () {
        var vpState = this._repository.getVisionProgramState(),
            visionFunctionsName = [];

        if (vpState.meta && vpState.meta.functions) {

            vpState.meta.functions.forEach(function (vf) {
                visionFunctionsName.push(vf.name);
            });
        }
        return visionFunctionsName;
    };

    p.getVisionFunctionType = function (visionFunctionInstance) {
        var vpState = this._repository.getVisionProgramState(),
            order,
            vfType = "";

        if (vpState.meta && vpState.meta.functions) {
            order = parseInt(visionFunctionInstance);

            vpState.meta.functions.forEach(function (vf) {
                if (vf.order === order) {
                    vfType = vf.type;
                }
            });
        }
        return vfType;
    };

    p.getVisionFunctionInstanceByName = function (visionFunctionName) {
        var vpState = this._repository.getVisionProgramState(),
            vfInstance = "";

        if (vpState.meta && vpState.meta.functions) {
            vpState.meta.functions.forEach(function (vf) {
                if (vf.name === visionFunctionName) {
                    vfInstance = vf.order;
                }
            });
        }
        return vfInstance;
    };

    p.getVisionFunctionFeatures = function (visionFunctionInstance) {
        var vfIndex = visionFunctionInstance - 1,
            vpState = this._repository.getVisionProgramState(),
            features;
        if (vfIndex < vpState.param.length) {
            features = vpState.param[vfIndex].features;
        }
        return features;
    };

    p.isVisionProgramLoaded = function () {
        var vpState = this._repository.getVisionProgramState(),
            isLoaded = false;

        if (vpState && vpState.meta && vpState.meta.program && vpState.meta.program.status === "loaded") {
            isLoaded = true;
        }

        return isLoaded;
    };

    p.getNumResultsMax = function (visionFunctionInstance) {
        var vpConfiguration = this._repository.getVisionApplicationConfiguration(),
            numResultsMax = 0,
            elementOfNumResultsMax;

        if (vpConfiguration.VisionApplication) {
            for (var index = 0; index < vpConfiguration.VisionApplication.VisionFunctions[visionFunctionInstance].Constants.length; index++) {
                if (vpConfiguration.VisionApplication.VisionFunctions[visionFunctionInstance].Constants[index].Id === "NumResultsMax") {
                    elementOfNumResultsMax = index;
                    numResultsMax = vpConfiguration.VisionApplication.VisionFunctions[visionFunctionInstance].Constants[elementOfNumResultsMax].Value;
                    break;
                }
            }
        }
        return numResultsMax;
    };

    p.evaluateImageProcessingError = function () {
        var vpState, result;
        vpState = this._repository.getVisionProgramState();
        if (vpState === undefined || !Array.isArray(vpState.param)) {
            return false;
        }
        //check if any entry of vpState.param has ImageProcessingError != 0 set as an output
        result = vpState.param.some(function (param_) {
            return param_.outputs.some(function (output) {
                return (output.ImageProcessingError !== undefined && output.ImageProcessingError !== 0);
            });
        });
        return result;
    };


    p.getNumResults = function (visionFunctionInstance) {
        var executionResult = this._repository.getExecutionResult(),
            numResults,
            element,
            specificOutputs,
            specificOutput;

        if (executionResult.param && Array.isArray(executionResult.param.function)) {
            specificOutputs = executionResult.param.specific_output;

            if (typeof (specificOutputs) === "object") {
                specificOutput = specificOutputs[visionFunctionInstance];
                if (specificOutput) {
                    for (var index = 0; index < specificOutput.length; index++) {
                        element = specificOutput[index].NumResults;
                        if (element !== undefined) {
                            numResults = element;
                            break;
                        }
                    }
                }
            }
        }
        return numResults;
    };

    p.getVisionApplicationInputs = function () {
        var vaInputs,
            indexOfInputs,
            vpState = this._repository.getVisionProgramState();

        if (vpState.param && (vpState.param.length > 0)) {
            indexOfInputs = vpState.param.length - 1;
            if (vpState.param[indexOfInputs].inputs) {
                vaInputs = vpState.param[indexOfInputs].inputs;
            }
        }
        return vaInputs;
    };

    p.getWiringInfo = function () {
        var wiringInfo = this._repository.getVisionProgramWiring();
        return wiringInfo;
    };

    p.isInputEditable = function (visionFunctionName, inputName) {
        var vpWiring = this._repository.getVisionProgramWiring(),
            index,
            sourceItem,
            destItem,
            isEditable = true;

        for (index = 0; index < vpWiring.length; index++) {
            sourceItem = vpWiring[index].src;
            destItem = vpWiring[index].dst;
            if ((destItem.instance === visionFunctionName) && (destItem.property === inputName)) {
                isEditable = sourceItem.type === "VP" ? true : false;
                break;
            }
        }
        return isEditable;
    };

    p.dispose = function () {};

    return VisionProgramDataProvider;
});