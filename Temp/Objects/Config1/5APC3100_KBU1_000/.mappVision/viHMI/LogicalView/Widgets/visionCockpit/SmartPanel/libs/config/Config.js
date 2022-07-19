/*global define */
define([
], function () {

    'use strict';

    /**
     * @class widgets.visionCockpit.SmartPanel.config.Config 
     * @extends core.javascript.Object
     * @override widgets.visionCockpit.SmartPanel
     */

    /**
     * @cfg {String} visionComponentReference=''
     * @iatStudioExposed
     * @bindable
     * @iatCategory Data   
     * Reference to the visionComponent
     */

    /**
     * @cfg {NumberArray1D} loadVisionApplicationStatus=0 
     * @not_projectable
     * @bindable
     * @iatCategory Data   
     * For dynamic binding to loadVisionApplicationStatus of VRM
     */

    /**
     * @cfg {Integer} saveVisionApplicationStatus=0
     * @not_projectable
     * @bindable
     * @iatCategory Data   
     * For dynamic binding to saveVisionApplicationStatus of VRM
     */

    /**
     * @cfg {Integer} imageProcessingError=0
     * @not_projectable
     * @bindable
     * @iatCategory Data   
     * For dynamic binding to imageProcessingError of VRM
     */

    /**
     * @cfg {Integer} imageAcquisitionSettingsUpdated=0
     * @not_projectable
     * @bindable
     * @iatCategory Data   
     * For dynamic binding to imageAcquisitionSettingsUpdated of VRM
     */

    /**
     * @cfg {Integer} numResults=1   
     * @bindable
     * @iatStudioExposed 
     * @iatCategory Data   
     * For num results
     */

    /**
     * @cfg {Integer} loggerCounterOfInformations=0    
     * @bindable
     * @iatStudioExposed 
     * @iatCategory Data   
     * Logger counter of informations
     */

    /**
     * @cfg {Integer} loggerCounterOfSuccesses=0    
     * @bindable
     * @iatStudioExposed 
     * @iatCategory Data   
     * Logger counter of successes
     */

    /**
     * @cfg {Integer} loggerCounterOfWarnings=0    
     * @bindable
     * @iatStudioExposed 
     * @iatCategory Data   
     * Logger counter of warnings
     */

    /**
     * @cfg {Integer} loggerCounterOfErrors=0    
     * @bindable
     * @iatStudioExposed 
     * @iatCategory Data   
     * Logger counter of errors
     */

    /**
     * @cfg {StringArray1D} loggerArrayDescription
     * @bindable
     * @iatStudioExposed 
     * @iatCategory Data   
     * One-dimensional Array containing data of type string for the description from the logger 
     */

    /**
     * @cfg {StringArray1D} loggerArrayTime
     * @bindable
     * @iatStudioExposed 
     * @iatCategory Data   
     * One-dimensional Array containing data of type string for the time from the logger 
     */

    /**
     * @cfg {StringArray1D} loggerArrayId
     * @bindable
     * @iatStudioExposed 
     * @iatCategory Data   
     * One-dimensional Array containing data of type string for the id from the logger 
     */

    /**
     * @cfg {NumberArray1D} loggerArraySeverity 
     * @bindable
     * @iatStudioExposed 
     * @iatCategory Data   
     * One-dimensional Array containing data of type Number for the severity
     */

    /**
     * @cfg {String} visionFunctionVariablesRefId (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of Widget on same Content that handles the variables of the Vision Function
     */

    /**
     * @cfg {String} visionFunctionConstantsRefId (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of Widget on same Content that handles the constants of the Vision Function
     */

    /**
     * @cfg {String} refIdGroupBoxGenericVisionFuntion='' 
     * @iatStudioExposed
     * @iatCategory Data
     * Name of the groupBox for the generic Vision Funtion 
     */

    /**
     * @cfg {String} refIdGroupBoxVisionParameters='' (required)  
     * @iatStudioExposed
     * @iatCategory Data
     * Name of the groupBox for the vision parameters  
     */

    /**
     * @cfg {String} refIdGroupBoxImageAcquisition='' 
     * @iatStudioExposed
     * @iatCategory Data
     * Name of the groupBox for the image acquisition  
     */


    /**
     * @cfg {String} loggerImagePathSuccess='Media/mappVision/icons/loggerSeverity/gray/icon_success.svg' 
     * @bindable
     * @iatStudioExposed 
     * @iatCategory Data    
     * Path to image file of logger info success
     */

    /**
     * @cfg {String} refIdButtonShowAllResults (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of ShowAllResults-Button 
     */

    /**
     * @cfg {String} refIdButtonHideAllResults (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of HideAllResults-Button 
     */

    /**
     * @cfg {String} refIdButtonTeach (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of Teach-Button 
     */

    /**
     * @cfg {String} refIdButtonDelete (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of Submit-Delete 
     */

    /**
     * @cfg {String} lightAndFocusRefId (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of Widget on same Content that handles the parameters of light and focus
     */

    /**
     * @cfg {String} extendedParametersRefId (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of Widget on same Content that handles the extended parameters
     */


    /**
     * @cfg {String} visionFunctionGlobalModel (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of Widget on same Content that handles the parameters of the GlobalModel
     */

    /**
     * @cfg {String} visionFunctionModelParameterRefId (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of Widget on same Content that handles the model parameter of the model
     */

    /**
     * @cfg {String} visionImageAcquisitionSettingsRefId (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of Widget on same Content that handles the image acquisition settings
     */

    /**
     * @cfg {String} visionNormalImageParametersRefId (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of Widget on same Content that handles the normal image parameters
     */

    /**
     * @cfg {String} visionLineSensorSettingsRefId (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of Widget on same Content that handles the image acquisition settings
     */

    /**
     * @cfg {String} visionFunctionModelListRefId (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of Widget on same Content that handles the variables of the Vision Function
     */

    /**
     * @cfg {String} visionFunctionGlobalModelListRefId (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of Widget on same Content that handles the variables of the Vision Function
     */

    /**
     * @cfg {String} imageAcquisitionVariablesRefId=''
     * @iatStudioExposed
     * @iatCategory Data
     * ID for the parameter form with the PVs for image acquisition
     */

    /**
     * @cfg {String} visionFunctionsRootPath=''
     * @bindable
     * @iatStudioExposed
     * @iatCategory Data
     * Base path for all vision functions, offline mode only
     */

    /**
     * @cfg {String} visionFunctionsRootDevice=''
     * File Device name to base path for all vision functions
     */

    /**
     * @cfg {String} visionFunctionSubPath=''
     * @bindable
     * @iatStudioExposed
     * @iatCategory Data
     * sub directory in visionFunctionsRootPath for vision function (this is not necessarily equal to visionFunctionName)
     */

    /**
     * @cfg {String} visionFunctionName=''
     * @bindable
     * @readonly
     * @iatStudioExposed
     * @iatCategory Data
     * Name of currently selected vision function (as defined in config.xml)
     */

    /**
     * @cfg {String} visionAplicationNavigation=''
     * @bindable
     * @readonly
     * @iatStudioExposed
     * @iatCategory Data
     * String for the vision aplication navigation
     */

    /**
     * @cfg {String} selectedVisionFunction=''
     * @bindable
     * @readonly
     * @iatStudioExposed
     * @iatCategory Data
     * Name of currently selected vision function
     */

    /**
     * @cfg {String} selectedImage=''
     * @bindable
     * @iatStudioExposed
     * @iatCategory Data
     * Name of currently selected Image
     */

    /**
     * @cfg {Boolean} isSelectedImageAcquisition=false
     * @bindable
     * @iatStudioExposed
     * @readonly
     * @iatCategory Data
     * Flag to indicate if image acquisition is selected
     */

    /**
     * @cfg {Boolean} executionRoiVisible=false
     * @bindable
     * @iatStudioExposed
     * @readonly
     * @iatCategory Data
     * Flag to indicate if execution roi is visible 
     */

    /**
     * @cfg {Boolean} statusReady=false 
     * @bindable
     * @iatStudioExposed
     * @readonly
     * @iatCategory Data
     * status ready indicates that the widget is in state to accept a further command
     */

    /**
     * @cfg {Boolean} activatedLinesensor=false
     * @bindable
     * @iatStudioExposed
     * @readonly
     * @iatCategory Data
     * activatedLinesensor indicates that the the line sensor aktiv oder aktiv ist
     */

    /**
     * @cfg {String} dataProviderModelTypes=''
     * @bindable
     * @readonly
     * @iatStudioExposed
     * @iatCategory Data
     * String for the dropDownBow with the information about the moel types
     */

    /**
     * @cfg {String} selectedModelType=''
     * @bindable
     * @readonly
     * @iatStudioExposed
     * @iatCategory Data
     * Name of currently selected model type
     */

    /**
     * @cfg {Boolean} editModelsTabVisible=true
     * @bindable
     * @iatStudioExposed
     * @readonly
     * @iatCategory Data
     * Flag to indicate if edit models tab is visible 
     */


    /**
     * @cfg {Boolean} showOnlyOneTabForAVisionFuntionTab=false
     * @bindable
     * @iatStudioExposed
     * @readonly
     * @iatCategory Data
     * Flag to indicate if only one tab for a vision funtion is visible 
     */

    /**
     * @cfg {String} lineSensorNormalImageModeButtonRefId (required) 
     * @iatStudioExposed
     * @iatCategory Data
     * Name of the button for the normal image mode
     */

    /**
     * @cfg {String} refIdProcessVariablesFilter (required)
     * @iatStudioExposed
     * @iatCategory Data
     * Name of the Textoutput for the Filter 
     */

    /**
     * @cfg {String} refIdNumericInputFilter (required) 
     * @iatStudioExposed
     * @iatCategory Data
     * Name of Widget on same Content that handles the extended parameters
     */

    return {
        imageAcquisitionName: 'Image Acquisition',
        imageAcquisitionSettingsUpdated: [0, 0, 0],
        ipAddress: '',
        statusReady: false,
        textForOverlayIfModulIsNotOK: 'Please check the camera connection',
        textForOverlayIfConnectionIsFailure: 'Cannot establish connection to Vision Component',
        textForOverlayIfModulIsOK: 'Vision component is initializing, please do not disconnect the camera', 
        imageAcquisitionStatus: -1,
        iconicsFilterIndex: 1,
        loggerArrayDescription: [''],
        loggerArrayTime: [''],
        loggerArrayId: [''],
        loggerArraySeverity: [1],
        visionComponentReference: '',
        moduleOk: undefined,
        isOperationModeSetToHmi: false,
        waitingForLoadVisionApplicationStatusUpdate: false, 
        loadVisionApplicationStatus: [0, -1045168005, 0],
        deleteVisionApplicationStatus: [Number.MIN_SAFE_INTEGER, 0, 0],
        saveVisionApplicationStatus: [Number.MIN_SAFE_INTEGER, 0, 0],
        imageProcessingError: '',
        visionFuntionStartupSequenceStarted: false,
        visionFunctionVariablesRefId: '',
        refIdtextOutputOverlay: 'textOutputOverlay',
        refIdButtonEditTool: 'tglBtnROI',
        refIdDropDownBoxAddMeasurement: 'dropDownBoxAddMeasurement',
        refIdButtonTeach: '',
        refIdBtnZoomIn: 'btnZoomIn',
        refIdBtnZoomOut: 'btnZoomOut',
        refIdBtnZoomReset: 'btnZoomReset',
        refIdButtonDelete: '',
        refIdGroupBoxGenericVisionFuntion: '',
        refIdGroupBoxImageAcquisition: '',
        refIdGroupBoxVisionParameters: '',
        refIdNumericInputFilter: '',
        refIdProcessVariablesFilter: '',
        refIdResultFilterNumericInput: '',
        refIdButtonShowAllResults: '',
        refIdButtonHideAllResults: '',
        refIdResultFilterLabel: '',
        refIdLabelFilterInformation: 'LabelFilterInformation',
        refIdGroupBoxLogger: 'GroupBoxLogger',
        refIdImageLuppe: 'ImageLuppe',
        refIdRepetitiveMode: '',
        repetitiveModeSkipParameterUpdate: false,
        visionFunctionConstantsRefId: '',
        lightAndFocusRefId: '',
        extendedParametersRefId: '',
        groupBoxGlobaleModel: 'GroupBoxGlobaleModel',
        visionFunctionInstance: 1,
        visionFunctionGlobalModel: '',
        visionFunctionModelParameterRefId: '',
        lineSensorNormalImageModeButtonRefId: '',
        visionFunctionModelTypesRefId: '',
        visionFunctionGlobalModelListRefId: '',
        visionFunctionModelListRefId: '',
        visionImageAcquisitionSettingsRefId: '',
        visionLineSensorSettingsRefId: '',
        visionNormalImageParametersRefId: '',
        imageAcquisitionVariablesRefId: '',
        startPageId: 'mVi2StartPage',
        visionFunctionsRootPath: '',
        refIdImageLoggerForWarnings: 'ImageLoggerWarning',
        refIdNumOutLoggerForWarnings: 'NumericOutputloggerCounterOfWarnings',
        refIdImageLoggerForMessages: 'imageLoggerForMessages',
        refIdNumOutLoggerForSuccesses: 'NumericOutputLoggerCounterOfSuccesses',
        refIdImageLoggerForSuccesses: 'imageLoggerSuccess',
        refIdImageLoggerForErrors: 'imageLoggerError',
        refIdNumOutLoggerForErrors: 'NumericOutputLoggerCounterOfErrors',
        refIdNumOutLoggerForMessages: 'NumericOutputLoggerCounterInformation',
        refIdTabItemLoggerForId: 'tabItemLoggerForId', 
        refIdTabItemModels: 'TabItemModels',
        refIdSimulateOnlyOneTabForAVisionFuntion: 'simulateOnlyOneTabForAVisionFuntion',
        loggerImagePathSuccess: 'Media/mappVision/icons/loggerSeverity/gray/icon_success.svg',
        loggerNumOutWarningtyle: 'sloggerGrayrNumericOutput',
        visionFunctionsRootDevice: 'VFDKRootDevice',
        visionFunctionSubPath: '',
        visionFunctionName: '',
        visionProgramName: '',
        selectedVisionFunction: 'Image Acquisition',
        visionAplicationNavigation: [{
            'value': 'Image Acquisition',
            'text': 'Image Acquisition'
        }],
        numResults: 1,
        loggerCounterOfInformations: 0,
        loggerCounterOfSuccesses: 0,
        loggerCounterOfWarnings: 0,
        loggerCounterOfErrors: 0,
        selectedImage: '',
        xoffset: 40,
        yoffset: 40,
        offlineMode: undefined,
        hmiModeActiveCounter: 0,
        selectedModelId: undefined,
        selectedGlobalModelId: undefined,
        lastCenterPosition: undefined,
        modelClouds: undefined,
        modelRois: undefined,
        vfModels: undefined,
        lastImageOfRepetitiveModeIsLoading: false, 
        vfGlobalModels: undefined,
        dataProviderModelTypes: [{
            'value': 'none',
            'text': ''
        }],
        dataProviderTeachableModelTypes: '',
        dataModelTypes: [],
        defaultModelParameters: {},
        defaultGlobalModelParameters: {},
        selectedModelType: '',
        resultClouds: [],
        zoomFactor: 1.25,
        editMode: false,
        numResultsMax: '',
        isSelectedImageAcquisition: true,
        activatedLinesensor: false,
        editModelsTabVisible: true,
        showOnlyOneTabForAVisionFuntionTab: false,
        multiSelect: false,
        resultFilterTimeout: undefined,
        supportsKeyboardHandler: true, // TODO: set to false when buttons Ins/Del are available in CockpitDemo and VFDK - or discuss if remaun true
        orientationToolSearchAngleToDegRatio: 100,
        orientationToolRatioWidthToHeight: 3.5,
        orientationToolRatioViewBoxToTool: 3,
        orientationToolSizeMax: {
            width: 300,
            height: 80
        },
        orientationToolSizeMin: {
            width: 110,
            height: 37
        },
        accessAttributForTeach: 'r',
        accessAttributForSubmit: 'rw',

        refIdDropDownBoxToolList: 'dropDownBoxForTheRoiTools',
        dataProviderRoiTools: [{
            'value': 'tools'
        },
        {
            'value': 'rectangle+'
        },
        {
            'value': 'ellipse+'
        },
        {
            'value': 'ring+'
        },
        {
            'value': 'freehand'
        },
        {
            'value': 'rectangle-'
        },
        {
            'value': 'ellipse-'
        },
        {
            'value': 'ring-'
        },
        {
            'value': 'eraser'
        },
        ].map(function (entry) {
            entry.text = (entry.value === 'tools' ? "ROI " : "") + entry.value.charAt(0).toUpperCase() + entry.value.slice(1);
            entry.image = entry.value + '.png';
            return entry;
        }),
        dataProviderRoiCommands: [{
            'value': 'commands'
        },
        {
            'value': 'size'
        },
        {
            'value': 'angle'
        },
        {
            'value': 'alignment'
        },
        {
            'value': 'spacing'
        }
        ].map(function (entry) {
            entry.text = (entry.value === 'commands' ? "ROI " : "Set Same ") + entry.value.charAt(0).toUpperCase() + entry.value.slice(1);
            entry.image = entry.value + '.png';
            return entry;
        }),
        refIdDropDownBoxRoiCommands: 'dropDownBoxForTheRoiCommands',
        refIdTabControlRoiTools: 'RoiTools',
        selectedValueOfRoiCommads: 'alignment',
        refIdSmartPanelParameterFormModelParameters: 'modelParameters',
        refIdSmartPanelGlobalModelListMeasurementDef: 'visionFunctionGlobalModel',
        refIdTabItemImageLoggerForSeverity: 'tabItemImageLoggerForSeverity', 
        refIdTabItemLoggerForTime: 'tabItemLoggerForTime',
        refIdTabItemLoggerForDescription: 'tabItemLoggerForDescription', 
        refIdBtnLogger: 'btnLogger',
        refIdFlyOutLogger: 'FlyOutLogger',
        refIdGroupBoxForGlobalModel: 'GroupBoxGlobaleModel',
        refIdVfModelsTabControl: 'TabControlModels',
        refIdTabItemVisionFunction: 'TabItemVisionParameterProcessVaribales',
        refIdTabItemVisionModels: 'TabItemModels',
        selectedVfModelTab: 'VisionFunctionPage',
        refIdButtonExecute: 'btnExecuteVisionFunction',
        refIdButtonImageCapture: 'btnLoadImage',
        refIdBtnIncrementFilterIndex: 'btnIncrementFilterIndex',
        refIdBtnDecrementFilterIndex: 'btnDecrementFilterIndex',
        refIdFilterIndex: 'FilterIndex',
        refIdTglBtnShowAllResults: 'tglBtnShowAllResults',
        refIdBtnTeach: 'btnTeach',
        refIdBtnRemoveModel: 'btnRemoveModel',
        refIdTglBtnHideAllResults: 'tglBtnHideAllResults',
        refIdDropDownBoxVisionApplicationNavigation: 'DropDownBoxVisonFunctionName',
        refIdtglBtnLineSensorNormalImage: 'tglBtnLineSensorNormalImage',
        refIdGroupBoxForLineSensor:'groupBoxForLineSensor',
        refIdParameterFormForLineSensor: 'LineSensorParameterForm',
        refIdParameterFormForLightAndFocus: 'lightAndFocus',
        refIdParameterFormForExtendedParameter: 'extendedParameter', 
        refIdParameterFormForImageAcquisitionSettings: 'ImageAcquisitionSettings',
        refIdParameterFormForProcessVaribles: 'InputParameterForm',
        refIdDropDownBoxComponentList: 'DropDownBoxComponentList',
        refIdTabItemRoiTools: 'TabRoiTools', 
        visionFunctionParametersRefId: 'smartPanelParameterFormParameters',
        refIdTabItemFilter: 'Results',
        refIdTabItemImageMode: 'TabItemImageMode', 
        refIdLogoutButton: 'LogoutButton',
        visionApplicationToDelete: '', 
        headerContentId: 'mVi2Navigation',
        dialogSaveAsContentId: 'mViSaveAs',
        refIdButtonSaveApplication: 'buttonSaveApplication', 
        refIdButtonCancelDialog: 'buttonCancel',
        defaultModelType: {
            'value': 'defaultModelType',
            'text': 'Add Model'
        },
        defaultOperation: {
            'value': 'defaultOperation',
            'text': 'Add Operation'
        },
        refIdButtonSaveGlobalModel: 'btnSaveGlobalModel',
        refIdButtonRepetitiveMode: 'tglBtnRepetitiv',
        refIdEditMarker: 'btnEditMarker',
        refIdTextOuputXForPipette: 'textOuputX',
        refIdTextOuputYForPipette: 'textOuputY',
        refIdTextOuputColorForPipette: 'textOuputColor',
        refIdImageVisionApplication: 'imageVisionApplication',
        refIdRemoveMeasurement: 'btnDeleteGlobalModel',
        refIdDropDownBoxModelType: 'dropDownBoxForModelType',
        refIdTextOutSaveAsError: 'textOutSaveAsError',
        refIdTextInApplicationName: 'textInApplicationName',
        refIdDropDownBoxForLoad: 'dropDownBoxForLoad',  
        refIdDropDownBoxForSave: 'dropDownBoxForSave', 
        refIdSelectorListForFilter: 'selectorListForFilter',
        refIdImageSelectorFilter: 'imageSelectorFilter',
        refIdTextOutputSelectorFilter: 'textOutputSelectorFilter',
        refIdDropDownBoxForDelete: 'dropDownBoxForDelete',
        refIdDropDownBoxForSortProcessVariables: 'dropDownBoxForSortProcessVariables',
        refIdLabelForHMIVisionApplicationName: 'labelForHMIVisionApplicationName', 
        refIdDummyTab: 'dummyTab',
        refIdDropDownBoxForTheRoiManipulation: 'dropDownBoxForTheRoiManipulation',
        dataProviderSortProcessVariables: [{
            'value': 'name',
            'text': 'Name',
        },
        {
            'value': 'result',
            'text': 'Result',
        }],
        dataProviderDelete: [{
            'value': 'delete',
            'text': '-- Select Vision Application --',
            'image': 'delete.png'
        },
        {
            'value': 'delete',
            'text': 'application 1',
            'image': 'delete.png'
        }],
        dataProviderSave: [{
            'value': 'save',
            'text': '-- choose option --',
            'image': 'save.png'
        },
        {
            'value': 'save',
            'text': 'Save current application',
            'image': 'save.png'
        },
        {
            'value': 'save',
            'text': 'Save As...',
            'image': 'save.png'
        }],
        dataProviderLoad: [{
            'value': 'load',
            'text': '-- Select Vision Application --',
            'image': 'load.png'
        }],
        dataProviderRoiManipulation: [{
            'value': 'manipulation'
        },
        {
            'value': 'delete'
        },
        {
            'value': 'copy'
        },
        {
            'value': 'paste'
        }
        ].map(function (entry) {
            entry.text = (entry.value === 'manipulation' ? "ROI " : "") + entry.value.charAt(0).toUpperCase() + entry.value.slice(1);
            entry.image = entry.value + '.png';
            return entry;
        }),
    };
});