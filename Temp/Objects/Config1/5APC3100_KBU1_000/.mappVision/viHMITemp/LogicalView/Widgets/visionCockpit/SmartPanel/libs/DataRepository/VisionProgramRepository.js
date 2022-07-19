/*global define */
define([], function () {
    'use strict';

    function VisionProgramRepository(parent) {
        this._parent = parent;
        this.visionProgramState = {};
        this.visionApplicationConfiguration = {};
        this.executionResult = {};
        this.visionFunctionParameter = {userDefinedParameterMode: undefined};
        this.defaultValueOfOutputProcessVariables = undefined;
        this.visionProgramWiring = {};
        return this;
    }

    var p = VisionProgramRepository.prototype;

    p.setVisionProgramState = function (state) {
        this.visionProgramState = state;
    };

    p.getVisionProgramState = function () {
        return this.visionProgramState;
    };
    
    p.setVisionProgramWiring = function (vpWiring) {
        this.visionProgramWiring = vpWiring;
    };

    p.getVisionProgramWiring = function () {
        return this.visionProgramWiring;
    };

    p.setDefaultValueOfOutputProcessVariables = function (value) {
        this.defaultValueOfOutputProcessVariables = value;
    };

    p.getDefaultValueOfOutputProcessVariables = function () {
        return this.defaultValueOfOutputProcessVariables; 
    };

    p.getVisionFunctionParameter = function () {
        return this.visionFunctionParameter;
    };  

    p.setVisionApplicationConfiguration = function (configuration) {
        this.visionApplicationConfiguration = configuration;
    };

    p.getVisionApplicationConfiguration = function () {
        return this.visionApplicationConfiguration;
    };

    p.setExecutionResult = function (executionResultMessage) {
        this.executionResult = executionResultMessage;
    };

    p.getExecutionResult = function () {
        return this.executionResult;
    };

    p.dispose = function () {};

    return VisionProgramRepository;
});