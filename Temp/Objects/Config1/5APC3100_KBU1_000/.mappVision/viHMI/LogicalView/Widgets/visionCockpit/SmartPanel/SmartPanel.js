/*global define, brease, $*/
define([
    'brease/core/BaseWidget',
    'widgets/visionCockpit/SmartPanel/libs/config/Config',
    'brease/core/Utils',
    'brease/events/BreaseEvent',
    'widgets/visionCockpit/SmartPanel/libs/external/web_control',
    'widgets/visionCockpit/SmartPanel/libs/pixelcloud/PixelCloud',
    'widgets/visionCockpit/SmartPanel/libs/xldcloud/XldCloud',
    'widgets/visionCockpit/SmartPanel/libs/ParameterHandling',
    'widgets/visionCockpit/SmartPanel/libs/IAParameterHandling',
    'widgets/visionCockpit/SmartPanel/libs/DownloadHandler',
    'widgets/visionCockpit/SmartPanel/libs/roi/crosshair/CrosshairRoi',
    'widgets/visionCockpit/SmartPanel/libs/roi/Rectangle/RectangleRoi',
    'widgets/visionCockpit/SmartPanel/libs/SelectionController/SelectionController',
    'widgets/visionCockpit/SmartPanel/libs/roi/Circle/CircleRoi',
    'widgets/visionCockpit/SmartPanel/libs/roi/EllipseRing/EllipseRing',
    'widgets/visionCockpit/SmartPanel/libs/roi/Freehand/FreehandTool',
    'widgets/visionCockpit/SmartPanel/libs/roi/ServerRoi/ServerRoi',
    'widgets/visionCockpit/SmartPanel/libs/roi/Orientation/OrientationArrow',
    'widgets/visionCockpit/SmartPanel/libs/pipette/pipette',
    'widgets/visionCockpit/SmartPanel/libs/navigationBetweenVisionFunctions',
    'widgets/visionCockpit/SmartPanel/libs/widgetsHandling/widgetsHandling',
    'widgets/visionCockpit/SmartPanel/libs/widgetsHandling/smartPanelParameterFormHandling',
    'widgets/visionCockpit/SmartPanel/libs/widgetsHandling/smartPanelModelListHandling',
    'widgets/visionCockpit/SmartPanel/libs/GlobalModelHandling',
    'widgets/visionCockpit/SmartPanel/libs/widgetsHandling/groupBoxesHandling',
    'widgets/visionCockpit/SmartPanel/libs/widgetsHandling/loggerHandling',
    'widgets/visionCockpit/SmartPanel/libs/dialog/saveAsDialogHandling',
    'widgets/visionCockpit/SmartPanel/libs/dialog/confirmationDialog',
    'widgets/visionCockpit/SmartPanel/communication/VisionServerEncoder',
    'widgets/visionCockpit/SmartPanel/communication/VisionServerDecoder',
    'widgets/visionCockpit/SmartPanel/communication/SocketHandling',
    'widgets/visionCockpit/SmartPanel/libs/DataRepository/VisionProgramRepository',
    'widgets/visionCockpit/SmartPanel/libs/DataProvider/VisionProgramDataProvider',
    'widgets/visionCockpit/SmartPanel/libs/ColorSettings',
    'widgets/visionCockpit/SmartPanel/libs/ResultFilter/ResultFilter',
    'widgets/visionCockpit/SmartPanel/libs/CapabilityReader/CapabilityReader',
    'widgets/visionCockpit/SmartPanel/libs/IconicDictionary/IconicDictionary',
    'widgets/visionCockpit/SmartPanel/libs/IconicDecoder/IconicDecoder',
], function (SuperClass,
    Config,
    Utils,
    BreaseEvent,
    HSmartControl,
    PixelCloud,
    XldCloud,
    ParameterHandling,
    ImageAcquisitionParameterHandling,
    DownloadHandler,
    CrosshairRoi,
    RectangleRoi,
    SelectionController,
    CircleRoi,
    EllipseRing,
    FreehandTool,
    ServerRoi,
    OrientationArrow,
    Pipette,
    NavigationBetweenVisionFunctions,
    WidgetsHandling,
    SmartPanelParameterFormHandling,
    SmartPanelModelListHandling,
    GlobalModelHandling,
    GroupBoxesHandling,
    LoggerHandling,
    SaveAsDialogHandling,
    ConfirmationDialog,
    VisionServerEncoder,
    VisionServerDecoder,
    SocketHandling,
    VisionProgramRepository,
    VisionProgramDataProvider,
    ColorSettings,
    ResultFilter,
    CapabilityReader,
    IconicDictionary,
    IconicDecoder) {

    'use strict';

    /**
     * @class widgets.visionCockpit.SmartPanel
     * #Description
     * Vision main widget. The widgetd connects to the backend
     * @extends brease.core.BaseWidget
     * @requires widgets.brease.BusyIndicator
     * 
     * @iatMeta category:Category
     * Vision 
     * @iatMeta description:short
     * Vision main widget. The widgetd connects to the backend
     * @iatMeta description:de
     * (INTERNAL USE ONLY) Vision Hauptwidget. Dieses Widget verbindet sich mit dem Backend
     * @iatMeta description:en
     * (INTERNAL USE ONLY) The widgetd connects to the backend
     */
    var defaultSettings = Config,

        WidgetClass = SuperClass.extend(function SmartPanel() {
                SuperClass.apply(this, arguments);
            },
            defaultSettings),
        p = WidgetClass.prototype;


    p.init = function () {
        this.el.addClass('visionCockpitSmartPanel');

        if (!brease.config.editMode) {
            this._initSmartPanel();
            _addBusyIndicator(this);
        } else {
            this.el.css('background-image', 'url("widgets/visionCockpit/SmartPanel/assets/Example_1.png")');
        }
        SuperClass.prototype.init.call(this);
    };

    p.wake = function () {
        SuperClass.prototype.wake.apply(this, arguments);

        this._initSmartPanel();
    };

    p.keyUpEventDetection = function (ev) {
        var ctrlKey = 17;
        ev = ev || window.event;
        var key = ev.which || ev.keyCode;

        var ctrl = ev.ctrlKey ? ev.ctrlKey : ((key === ctrlKey) ? true : false);
        if (ctrl) {
            this.pasteDebounce = false;
            this.setMultiSelectMode(false);
        }
    };

    p.keyDownEventDetection = function (ev) {
        var ctrlKey = 17;
        var cKey = 67;
        var vKey = 86;
        var akey = 65;
        var delKey = 46;
        var cancelKey = 27;
        ev = ev || window.event;
        var key = ev.which || ev.keyCode;

        var ctrl = ev.ctrlKey ? ev.ctrlKey : ((key === ctrlKey) ? true : false);
        if (ctrl) {
            this.setMultiSelectMode(true);
        }

        if (key == vKey && ctrl && !this.pasteDebounce) {
            this.pasteDebounce = true;
            this.pasteRoiToolsFromClipboard();
        } else if (key == cKey && ctrl) {
            this.copySelectedRoiToolsToClipboard();
        } else if (key == akey && ctrl) {
            this.selectAllRoiTools();
        } else if (key == delKey && !ctrl) {
            this.deleteSelectedTools();
        } else if (key == cancelKey && !ctrl) {
            this.removeFocusFromAllFreehandTools();
            this.updateToolList();
        }
    };

    p.addKeyboardEventListener = function () {
        document.addEventListener("keydown", this._bind('keyDownEventDetection'));
        document.addEventListener("keyup", this._bind('keyUpEventDetection'));
    };

    p.removeKeyboardEventListener = function () {
        document.removeEventListener("keydown", this._bind('keyDownEventDetection'));
        document.removeEventListener("keyup", this._bind('keyUpEventDetection'));
    };

    p._initSmartPanel = function () {
        this.toolsClipboard = [];
        this.pasteCount = 0;
        this.pasteDebounce = false;
        this.teachTools = [];
        this.applicationContext = "";
        this.paintMode = "off";

        this.hmiStatus = {
            isImageRequestTriggeredAfterConnect: false,
            initialComplete: false,
            statusResponseReciv: false,
            visionApplicationIsLoading: false,
            visionApplicationIsSaving: false,
            visionApplicationIsDeleting: false,
            imageIsLoading: false,
            repetitiveModeEnabled: false,
            visionApplicationIsExecuting: false
        };
        this.vfCapabilities = new Map();
        this.toolLists = undefined;
        this.pipette = 0;
        this.executionTools = [];
        this.numberOfLoadResponses = 0;
        this.RoiSymbolType = {
            crosshair: 1,
            rectangle: 2,
            ellipse: 3,
            orientation: 4,
            freehand: 5,
            ellipseRing: 6,
        };
        this.imageSizes = {
            x: 0,
            y: 0,
            width: 1280,
            height: 1024
        };
        this.settings.dataProviderTeachableModelTypes = '';
        this.settings.dataModelTypes = [];
        this.colorSettings = ColorSettings;
        this.settings.selectedVisionFunction = 'Image Acquisition';
        this.dynamicBindingList = [{
                src: 'LoadVisionApplicationStatus',
                target: 'loadVisionApplicationStatus',
                mode: "oneWay"
            },
            {
                src: 'SaveVisionApplicationStatus',
                target: 'saveVisionApplicationStatus',
                mode: "oneWay"
            },
            {
                src: 'ImageAcquisitionSettingsUpdated',
                target: 'imageAcquisitionSettingsUpdated',
                mode: "oneWay"
            },
            {
                src: 'HmiModeActiveCounter',
                target: 'hmiModeActiveCounter',
                mode: "oneWay"
            },
            {
                src: 'ImageAcquisitionStatus',
                target: 'imageAcquisitionStatus',
                mode: "oneWay"
            },
            {
                src: 'IsOperationModeSetToHmi',
                target: 'isOperationModeSetToHmi',
                mode: "oneWay"
            },
            {
                src: 'LogArrayDescription',
                target: 'loggerArrayDescription',
                mode: "oneWay"
            },
            {
                src: 'LogArrayEventID',
                target: 'loggerArrayId',
                mode: "oneWay"
            },
            {
                src: 'LogArraySeverity',
                target: 'loggerArraySeverity',
                mode: "oneWay"
            },
            {
                src: 'LogArrayTime',
                target: 'loggerArrayTime',
                mode: "oneWay"
            },
            {
                src: 'DeleteVisionApplicationStatus',
                target: 'deleteVisionApplicationStatus',
                mode: "oneWay"
            },
            {
                src: 'ModuleOk',
                target: 'moduleOk',
                mode: "oneWay"
            }

        ];
        this.smartControl = new HSmartControl('#' + this.elem.id,
            this.elem.id + '_renderer',
            function () {
                this._consoleEvents('Module >>web_control<< initialized!');
            });
        this.setStatusErrorModel(false);
        this.imageAcquisitionParamHandler = new ImageAcquisitionParameterHandling(this);
        $(document.body).on("ContentActivated", this._bind('_handleContentActivated'));
        if (brease.uiController.bindingController.isContentActive(this.settings.parentContentId)) {
            this._handleContentActivated({
                detail: {
                    contentId: this.settings.parentContentId
                }
            });
        }
        this.settings.defaultModelParameters = new Map();
        this.settings.defaultGlobalModelParameters = new Map();
        this.settings.modelClouds = new Map();
        this.settings.vfModels = new Map();
        this.settings.vfGlobalModels = new Map();
        this.settings.imageTpye = {
            singleCapture: 'jpg',
            repetitiveCapture: 'jpg'
        };
        this.settings.imageQuality = {
            singleCapture: 80,
            repetitiveCapture: 80
        };
        this.settings.lowestImageHeightWithCompression = 16;

        this.settings.imageHeight = undefined;

        this.createObjects();

        this.statusGroupBoxes.updateGroupBoxesState();
        this.settings.isSelectedImageAcquisition = true; 
        this._initializeCustomEvents();
        this.initPromise();
        this.initPromiseForConfigLoadFilesAndHMIModeActive();

        this.setWaitingForLoadVisionApplicationStatusUpdate(!this.getLoadVisionApplicationStatus()[2]);
    };

    p.createObjects = function () {
        this.capabilityReader = new CapabilityReader();
        this.iconicDictionary = new IconicDictionary();
        this.iconicDecoder = new IconicDecoder(this);
        this.paramHandler = new ParameterHandling(this);
        this.navigationBetweenVisionFunctions = new NavigationBetweenVisionFunctions(this);
        this.smartPanelModelListHandling = new SmartPanelModelListHandling(this);
        this.smartPanelParameterFormHandling = new SmartPanelParameterFormHandling(this);
        this.globalModelHandling = new GlobalModelHandling(this);
        this.statusGroupBoxes = new GroupBoxesHandling(this);
        this.vsEncoder = new VisionServerEncoder(this);
        this.vsDecoder = new VisionServerDecoder(this);
        this.loggerHandling = new LoggerHandling(this);
        this.saveAsDialogHandling = new SaveAsDialogHandling(this);
        this.confirmationDialog = new ConfirmationDialog(this);
        this.repetitiveTimer = undefined;
        this.lastRepetitiveImageTimer = undefined;
        this.vpRepository = new VisionProgramRepository(this);
        this.vpDataProvider = new VisionProgramDataProvider(this.vpRepository);
        this.resultFilter = new ResultFilter(this);
        this.socketHandling = new SocketHandling(this, this.vsEncoder, this.vsDecoder);
    };

    p.callExternalWidget = function (widgetId) {
        if (this.isUnitTestEnviroment() === false) {
            return brease.callWidget(this.settings.parentContentId + '_' + widgetId, "widget");
        } else {
            return window.fakeWidgetCaller();
        }
    };

    function _addBusyIndicator(widget) {

        widget.busyId = Utils.uniqueID(widget.elem.id + '_busyIndicator');
        widget.busyWrapper = $('<div class="busyWrapper"/>');
        widget.busyWrapper.css({
            "z-Index": 1
        });
        widget.busyWrapper.css({
            "position": "absolute"
        });
        widget.busyWrapper.addClass('visible');
        widget.el.append(widget.busyWrapper);

        widget.busyWrapper.on(BreaseEvent.WIDGET_READY, widget._bind('_onBusyIndicatorReady'));

        brease.uiController.createWidgets(widget.busyWrapper[0],
            [{
                className: 'BusyIndicator',
                id: widget.busyId,
                options: {}
            }],
            true,
            widget.settings.parentContentId);
    }

    p._onBusyIndicatorReady = function (e) {
        if (e.target.id === this.busyId) {
            this.busyIndicator = brease.uiController.callWidget(this.busyId, 'widget');
            this.busyWrapper.off(BreaseEvent.WIDGET_READY, this._bind('_onBusyIndicatorReady'));
        }
    };

    p._showBusyIndicator = function () {
        if ((brease.config.editMode) || ((this.hmiStatus.repetitiveModeEnabled === true) && (this.getLastImageOfRepetitiveModeIsLoading()=== false))) {
            return;
        }

        if (this.busyWrapper) {
            this.busyWrapper[0].style.visibility = "visible";
        }

    };

    p.callWidgetOnContent = function (widgetId, contentID) {
        if (this.isUnitTestEnviroment() === false) {
            return brease.callWidget(contentID + '_' + widgetId, "widget");
        } else {
            return window.fakeWidgetCaller();
        }
    };

    p.callExternalWidget = function (widgetId) {
        return this.callWidgetOnContent(widgetId, this.settings.parentContentId);
    };

    p._hideBusyIndicator = function () {
        if (this.busyWrapper) {
            this.busyWrapper[0].style.visibility = "hidden";
        }
    };

    p.getStatusResponseReciv = function () {
        return this.hmiStatus.statusResponseReciv;
    };

    p.setStatusResponseReciv = function (statusResponseReciv) {
        this.hmiStatus.statusResponseReciv = statusResponseReciv;
        this.setStatusReady();
    };

    p.getInitialComplete = function () {
        return this.hmiStatus.initialComplete;
    };

    p.setInitialComplete = function (initialComplete) {
        this.hmiStatus.initialComplete = initialComplete;
        this.setStatusReady();
    };

    p.getVisionApplicationIsSaving = function () {
        return this.hmiStatus.visionApplicationIsSaving;
    };

    p.setVisionApplicationIsSaving = function (visionApplicationIsSaving) {
        this.hmiStatus.visionApplicationIsSaving = visionApplicationIsSaving;
        this.setStatusReady();
    };

    p.onVisionApplicationLoading = function () {
        this.socketHandling.closeSocket();
        this.hmiStatus.visionApplicationIsLoading = true;
        this.setStatusReady();
        this.setStatusErrorModel(false);
        this.smartPanelModelList.setSelectedModelLock(false);
        this.updateButtonStates();
    };

    p.onVisionApplicationLoaded = function () {
        this.hmiStatus.visionApplicationIsLoading = false;
        this.setStatusErrorModel(false);
        this.smartPanelModelList.setSelectedModelLock(false);
        this.widgetsHandling.setSelectVisionFunctionTab();
    };

    p.getVisionApplicationIsLoading = function () {
        return this.hmiStatus.visionApplicationIsLoading;
    };

    p.getImageIsLoading = function () {
        return this.hmiStatus.imageIsLoading;
    };

    p.setImageIsLoading = function (imageIsLoading) {
        this.hmiStatus.imageIsLoading = imageIsLoading;
        this.setStatusReady();
    };

    /**
     * @method getStatusReady
     * Gets the statusReady 
     * @param {Boolean} statusReady
     */
    p.getStatusReady = function () {
        return this.settings.statusReady;
    };

    /**
     * @method setStatusReady
     * Sets the statusReady (statusReady enables the HMI, it depends of the flags: statusResponseReciv, visionApplicationIsExecuting, initialComplete, visionApplicationIsLoading, imageIsLoading and visionApplicationIsSaving)  
     * @param {Boolean} statusReady
     */
    p.setStatusReady = function () {
        this.settings.statusReady = (this.getStatusResponseReciv() &&
            this.getInitialComplete() &&
            !this.getVisionApplicationIsLoading() &&
            !this.getVisionApplicationIsExecuting() &&
            !this.getVisionApplicationIsSaving() &&
            !this.getImageIsLoading() &&
            !this.getRepetitiveMode() &&
            !this.getVisionApplicationIsDeleting());

        this.sendValueChange({
            statusReady: this.settings.statusReady
        });

        if (this.settings.statusReady === true) {
            this._hideBusyIndicator();
        } else if (this.settings.statusReady === false) {
            this._showBusyIndicator();
        }
        this.widgetsHandling.updateWidgetsStatus();
    };

    p.beginTransactionExecute = function () {
        this.setVisionApplicationIsExecuting(true);
    };

    p.terminateTransactionExecute = function () {
        this.setVisionApplicationIsExecuting(false);
        this.resultFilter.resetResultFilter();
    };

    p.setVisionApplicationIsExecuting = function (value) {
        this.hmiStatus.visionApplicationIsExecuting = value;
        this.setStatusReady();
    };

    p.getVisionApplicationIsExecuting = function () {
        return this.hmiStatus.visionApplicationIsExecuting;
    };

    /**
     * @method setLoggerArrayDescription
     * Sets loggerArrayDescription 
     * @param {StringArray1D} loggerArrayDescription
     */
    p.setLoggerArrayDescription = function (loggerArrayDescription) {
        if (loggerArrayDescription === null) {
            return;
        }

        this.settings.loggerArrayDescription = loggerArrayDescription;
        this.loggerHandling.setLoggerArrayDescription(loggerArrayDescription);
    };

    /**
     * @method getLoggerArrayDescription
     * Returns loggerArrayDescription.
     * @return {StringArray1D}
     */
    p.getLoggerArrayDescription = function () {
        return this.settings.loggerArrayDescription;
    };

    /**
     * @method setLoggerArrayTime
     * Sets loggerArrayTime 
     * @param {StringArray1D} loggerArrayTime
     */
    p.setLoggerArrayTime = function (loggerArrayTime) {
        if (loggerArrayTime === null) {
            return;
        }

        this.settings.loggerArrayTime = loggerArrayTime;
        this.loggerHandling.setLoggerArrayTime(loggerArrayTime); 
    };

    /**
     * @method getLoggerArrayTime
     * Returns loggerArrayTime.
     * @return {StringArray1D}
     */
    p.getLoggerArrayTime = function () {
        return this.settings.loggerArrayTime;
    };

    /**
     * @method setLoggerArrayId
     * Sets loggerArrayId 
     * @param {StringArray1D} loggerArrayId
     */
    p.setLoggerArrayId = function (loggerArrayId) {
        if (loggerArrayId === null) {
            return;
        }

        this.settings.loggerArrayId = loggerArrayId;
        this.loggerHandling.setLoggerArrayId(loggerArrayId);   
    };

    /**
     * @method getLoggerArrayId
     * Returns loggerArrayId.
     * @return {StringArray1D}
     */
    p.getLoggerArrayId = function () {
        return this.settings.loggerArrayId;
    };

    /**
     * @method setLoggerArraySeverity
     * Sets loggerArraySeverity 
     * @param {NumberArray1D} loggerArraySeverity 
     */
    p.setLoggerArraySeverity = function (loggerArraySeverity) {
        if (loggerArraySeverity === null) {
            return;
        }

        var arSeverity = [],
            severityId;

        loggerArraySeverity.forEach(function (entry) {
            switch (entry) {
                case "Information":
                    severityId = 0;
                    break;
                case "Success":
                    severityId = 1;
                    break;
                case "Warning":
                    severityId = 2;
                    break;
                case "Error":
                    severityId = 3;
                    break;
            }
            arSeverity.push(severityId);
        });

        this.settings.loggerArraySeverity = arSeverity;
        this.loggerHandling.setLoggerArraySeverity(this.settings.loggerArraySeverity);
        this.setLoggerCounterOfSeverities(loggerArraySeverity);
        this.loggerHandling.setLoggerImagesAndStyleOfNumericInputsOfSeverities(loggerArraySeverity);
    };

    p.setLoggerCounterOfSeverities = function (loggerArraySeverity) {
        var loggerCounterOfInformations = 0,
            loggerCounterOfSuccesses = 0,
            loggerCounterOfWarnings = 0,
            loggerCounterOfErrors = 0;

        loggerArraySeverity.forEach(function (entry) {
            switch (entry) {
                case "Information":
                    loggerCounterOfInformations = loggerCounterOfInformations + 1;
                    break;
                case "Success":
                    loggerCounterOfSuccesses = loggerCounterOfSuccesses + 1;
                    break;
                case "Warning":
                    loggerCounterOfWarnings = loggerCounterOfWarnings + 1;
                    break;
                case "Error":
                    loggerCounterOfErrors = loggerCounterOfErrors + 1;
                    break;
            }
        });
        this.loggerHandling.setLoggerCounterOfInformations(loggerCounterOfInformations);
        this.loggerHandling.setLoggerCounterOfSuccesses(loggerCounterOfSuccesses);
        this.loggerHandling.setLoggerCounterOfWarnings(loggerCounterOfWarnings);
        this.loggerHandling.setLoggerCounterOfErrors(loggerCounterOfErrors);
    };

    /**
     * @method getLoggerArraySeverity
     * Returns loggerArraySeverity.
     * @return {NumberArray1D}
     */
    p.getLoggerArraySeverity = function () {
        return this.settings.loggerArraySeverity;
    };

    /**
     * @method getIsSelectedImageAcquisition
     * Gets the isSelectedImageAcquisition 
     * @param {Boolean} isSelectedImageAcquisition
     */
    p.getIsSelectedImageAcquisition = function () {
        return this.settings.isSelectedImageAcquisition;
    };

    /**
     * @method setIsSelectedImageAcquisition
     * Sets the isSelectedImageAcquisition
     * @param {Boolean} isSelectedImageAcquisition
     */
    p.setIsSelectedImageAcquisition = function (isSelectedImageAcquisition) {
        this.settings.isSelectedImageAcquisition = isSelectedImageAcquisition;
        if (this.isUnitTestEnviroment() !== true) {
            this._callExternalWidget(this.settings.parentContentId + '_' + this.settings.refIdLabelFilterInformation, 'setVisible', !isSelectedImageAcquisition); 
            this._callExternalWidget(this.settings.parentContentId + '_' + this.settings.refIdImageLuppe, 'setVisible', !isSelectedImageAcquisition); 
        }
    };

    /**
     * @method getActivatedLinesensor
     * Gets the activatedLinesensor 
     * @param {Boolean} activatedLinesensor
     */
    p.getActivatedLinesensor = function () {
        return this.settings.activatedLinesensor;
    };

    /**
     * @method setActivatedLinesensor
     * Sets the activatedLinesensor
     * @param {Boolean} activatedLinesensor
     */
    p.setActivatedLinesensor = function (activatedLinesensor) {
        this.settings.activatedLinesensor = activatedLinesensor;
        this.sendValueChange({
            activatedLinesensor: this.settings.activatedLinesensor
        });
    };

    p._initialPrepare = function () {
        this.smartControl.init();
        this.zoomFactor = this.smartControl.getZoomFactor();
        this.getCameraIPAddress();
        var context = this;
        this.smartControl.imSizeObservable.subscribe(function () {
            context._imageSizeChanged();
        });

        if (this.defaultSettings.supportsKeyboardHandler === true) {
            this.addKeyboardEventListener();
        }
        this._addPipette();
        this._addSelectionController();
        this.executionRoi = new ServerRoi("ExecutionRoi", this, this.imageSizes, this.colorSettings.executeRoiIconicsSettings);
        this.executionRoi.hide();
        this.smartControl.imageClickObservable.subscribe(function (ev) {
            context.updateModelRoiSelectionState(ev);
            context.updateExecutionRoiSelectionState(ev);
            context.updateButtonStates();
        });

        this.smartControl.imageClickObservable.subscribe(function () {
            context.sortTools();
        });
        this.pipette.resetValues();

    };

    p.updateExecutionRoiSelectionState = function (ev) {
        var selcount = 0,
            xpos, ypos;

        if (this.applicationContext === "edit_execution_roi") {
            this.executionTools.forEach(function (roi) {
                if (roi.isSelected()) {
                    selcount++;
                }
            });

            if (ev) {
                xpos = ev.event[0];
                ypos = ev.event[1];
                if ((selcount > 0) || (!this.isPixelInsideImage(xpos, ypos))) {
                    this.executionRoi.setSelected(false);
                } else {
                    this.executionRoi.setSelected(true);
                }
            }
        }
    };

    p.updateModelRoiSelectionState = function (ev) {
        var selcount = 0,
            modelRoi,
            model,
            xpos, ypos;

        if (this.applicationContext === "edit_model_roi") {
            model = this.getSelectedModel();

            if (model) {
                this.teachTools.forEach(function (roi) {
                    if (roi.isSelected()) {
                        selcount++;
                    }
                });

                modelRoi = model.modelRoi;

                if (modelRoi) {
                    if (model && (selcount > 0)) {
                        modelRoi.setSelected(false);
                    } else {
                        modelRoi.setSelected(true);
                    }

                    if (ev) {
                        xpos = ev.event[0];
                        ypos = ev.event[1];
                        if ((selcount > 0) || (!this.isPixelInsideImage(xpos, ypos))) {
                            modelRoi.setSelected(false);
                        } else {
                            modelRoi.setSelected(true);
                        }
                    }
                }
            }
        }
    };

    p.isPixelInsideImage = function (x, y) {
        var inside = false;
        if ((x >= 0) && (x < this.imageSizes.width) && (y >= 0) && (y < this.imageSizes.height)) {
            inside = true;
        }

        return inside;
    };

    p.copySelectedRoiToolsToClipboard = function () {
        this.toolsClipboard = [];
        this.pasteCount = 0;

        switch (this.applicationContext) {
            case "edit_execution_roi":
                this._copySelectedToolsToClipboard(this.executionTools, "ExecutionRoiTool");
                break;
            case "edit_model_roi":
                if (this.isToolToClipboardAllowed()) {
                    this._copySelectedToolsToClipboard(this.teachTools, "ModelRoiTool");
                }
                break;
        }
    };

    p._copySelectedToolsToClipboard = function (toolList, type) {
        var copiedRoiParams;

        toolList.forEach(function (tool) {
            if (tool.isSelected()) {
                copiedRoiParams = Object.create(tool.getRoiParams());
                if (copiedRoiParams.symbolType === this.RoiSymbolType.ellipseRing) {
                    copiedRoiParams.initialRingThickness = {
                        "ringWidth": tool.defaultSettings.ring.ringWidth,
                        "ringHeight": tool.defaultSettings.ring.ringHeight
                    };
                }
                this.toolsClipboard.push({
                    "type": type,
                    "roiParams": copiedRoiParams
                });
            }
        }, this);
    };

    p.isToolToClipboardAllowed = function () {
        return (!this.isASingleToolInstanceModelSelected());
    };

    p.isASingleToolInstanceModelSelected = function () {
        var modelType,
            toolInstances,
            selected = false;

        modelType = this.getModelTypeOfSelectedModel();
        if (modelType) {
            toolInstances = this.getToolInstancesOfModelType(modelType);
            selected = (toolInstances === "single");
        }
        return selected;
    };

    p.isDeletionOfSingleInstanceModelRoiAllowed = function () {
        return (!this.isASingleToolInstanceModelSelected()) || this.teachTools.length > 0;
    };

    p.pasteRoiToolsFromClipboard = function () {

        var index,
            clipboardEntry,
            xpos,
            ypos,
            roiSize,
            angle,
            roiParams,
            symbolType,
            roiFunction,
            viewBox,
            initialRingThickness,
            isZoomAdjustmentNeccessary,
            zoomMinX,
            zoomMinY,
            zoomMaxX,
            zoomMaxY,
            currentMultiSelectMode = this.settings.multiSelect;

        this.pasteCount++;

        this.clearSelectionOfAllRoiTools();

        viewBox = this.smartControl.getViewBox();
        zoomMaxX = viewBox[0] + viewBox[2];
        zoomMaxY = viewBox[1] + viewBox[3];
        zoomMinX = viewBox[0];
        zoomMinY = viewBox[1];

        for (index = 0; index < this.toolsClipboard.length; index++) {

            clipboardEntry = this.toolsClipboard[index];
            roiParams = clipboardEntry.roiParams;
            angle = roiParams.angle;
            symbolType = roiParams.symbolType;
            roiFunction = roiParams.roiFunction;

            this.settings.multiSelect = true;

            xpos = roiParams.x + this.settings.xoffset * this.pasteCount;
            ypos = roiParams.y + this.settings.yoffset * this.pasteCount;

            if ((xpos > viewBox[0] + viewBox[2]) || (ypos > viewBox[1] + viewBox[3]) || (xpos < viewBox[0]) || (ypos < viewBox[1])) {
                isZoomAdjustmentNeccessary = true;
            }

            zoomMaxX = Math.max(zoomMaxX, xpos);
            zoomMaxY = Math.max(zoomMaxY, ypos);
            zoomMinX = Math.min(zoomMinX, xpos);
            zoomMinY = Math.min(zoomMinY, ypos);

            roiSize = {
                x: xpos,
                y: ypos,
                width: roiParams.width,
                height: roiParams.height
            };
            if (symbolType === this.RoiSymbolType.ellipseRing) {
                initialRingThickness = roiParams.initialRingThickness;
            }

            if (clipboardEntry.type === "ExecutionRoiTool" && this.applicationContext === "edit_execution_roi") {
                this._addExecuteTool(symbolType, roiFunction, roiSize, angle, initialRingThickness);
            } else if (clipboardEntry.type === "ModelRoiTool" && this.applicationContext === "edit_model_roi") {
                this._addTeachTool(symbolType, roiFunction, roiSize, angle, initialRingThickness);
            }

            this.settings.multiSelect = currentMultiSelectMode;

        }
        if (isZoomAdjustmentNeccessary) {
            this.smartControl.setViewBox(zoomMinX - this.settings.xoffset * 3, zoomMinY - this.settings.xoffset * 3, (zoomMaxX + this.settings.xoffset * 6) - zoomMinX, (zoomMaxY + this.settings.xoffset * 6) - zoomMinY);
        }
        this.updateModelRoiSelectionState();
        this.updateExecutionRoiSelectionState();
        this.updateButtonStates();
    };


    p.setMultiSelectMode = function (mode) {
        this.settings.multiSelect = mode;
    };

    p.getMultiSelectMode = function () {
        return this.settings.multiSelect;
    };

    p.clearSelectionOfAllRoiTools = function () {

        this.executionTools.forEach(function (roi) {
            roi.clearSelection();
            roi.redraw();
        });

        this.teachTools.forEach(function (roi) {
            roi.clearSelection();
            roi.redraw();
        });
    };

    p.selectAllRoiTools = function () {
        var mode = this.getMultiSelectMode();
        this.setMultiSelectMode(true);
        this.executionTools.forEach(function (roi) {
            roi.setSelected(true);
            roi.redraw();
        });

        this.teachTools.forEach(function (roi) {
            roi.setSelected(true);
            roi.redraw();
        });
        this.setMultiSelectMode(mode);
    };

    p.roiToolSelectionChanged = function (selectedRoi) {
        if (!this.settings.multiSelect) {
            this.executionTools.forEach(function (roi) {
                if (roi.isSelected()) {
                    if (roi !== selectedRoi) {
                        roi.clearSelection();
                        roi.redraw();
                    }
                }
            });

            this.teachTools.forEach(function (roi) {
                if (roi !== selectedRoi) {
                    if (roi.isSelected()) {
                        roi.clearSelection();
                        roi.redraw();
                    }
                }
            });
        }

        if (selectedRoi.isSelected() === true) {
            this.deselectExecutionRoi();
            this.deselectModelRois();
        }
        this.updateButtonStates();
    };

    p.deselectModelRois = function () {
        this.settings.vfModels.forEach(function (model) {
            if (model.modelRoi) {
                model.modelRoi.setSelected(false);
            }
        });
    };

    p.deselectExecutionRoi = function () {
        if (this.executionRoi) {
            this.executionRoi.setSelected(false);
        }
    };

    /**
     * @method addExecutionTool
     * @iatStudioExposed
     * Add Execution Tool
     */
    p.addExecutionTool = function (roiTool, roiFunction) {
        var toolListReference, toolList, toolConfigXmlEntry, toolProperties;

        if (this.applicationContext === "edit_execution_roi") {
            toolListReference = this.getToolListReference();
            toolList = this.toolLists.get(toolListReference);
            toolConfigXmlEntry = toolList.find(function (tool) {
                return ((this.toolTypeToRoiSymbolTypeConverter(tool.Type) === roiTool) && (this.toolOperationToRoiRoniConverter(tool.Operation) === roiFunction));
            }, this);
            toolProperties = this.determineToolPropertiesFromConfigXml(toolConfigXmlEntry);

            this._addExecuteTool(toolProperties.toolType, toolProperties.toolFunction, toolProperties.toolSizeAndPosition, toolProperties.angle, toolProperties.ringThickness);

            this.executionRoi.setDirtyFlag(true);
        }
        this.updateExecutionRoiSelectionState();
        this.updateButtonStates();
    };

    /**
     * @method deleteSelectedTools  
     * @iatStudioExposed
     * Deleted selected ROIs
     */
    p.deleteSelectedTools = function () {
        switch (this.applicationContext) {
            case "edit_execution_roi":
                this.deleteAllSelectedExecutionRoiTools();
                if (this.executionRoi.isSelected() === true) {
                    this.executionRoi.clearRoiData();
                    this.executionRoi.setDirtyFlag(true);
                }
                break;

            case "edit_model_roi":
                this.deleteAllSelectedModelRoiTools();
                this.clearModelRoiDataOfSelectedModel();
                this.setDirtyFlagOfSelectedModelRoi(true);
                break;
        }
        this.updateButtonStates();
        this.selectionController.firstSelectedTool = undefined;
    };

    p.deleteAllSelectedModelRoiTools = function () {
        var index, roi;
        for (index = this.teachTools.length - 1; index >= 0; index--) {
            roi = this.teachTools[index];
            if (roi.isSelected() === true) {
                roi.dispose();
                this.teachTools.splice(index, 1);
            }
        }
    };

    p.deleteAllSelectedExecutionRoiTools = function () {
        var index, roi;
        for (index = this.executionTools.length - 1; index >= 0; index--) {
            roi = this.executionTools[index];
            if (roi.isSelected() === true) {
                roi.dispose();
                this.executionTools.splice(index, 1);
            }
        }
    };

    p._addTeachTool = function (symbolType, roiFunction, roiSize, angle, initialRingThickness) {
        var teachTool,
            viewBox = this.smartControl.getViewBox(),
            initialSize = Math.min(viewBox[2] / 2, 400);

        if (symbolType === undefined) {
            return;
        }

        if (roiFunction === undefined) {
            roiFunction = "roi";
        }

        if (roiSize === undefined) {
            roiSize = {
                x: viewBox[2] / 2 + viewBox[0],
                y: viewBox[3] / 2 + viewBox[1],
                width: initialSize,
                height: initialSize
            };

            if (this.lastCenterPosition !== undefined) {
                roiSize.x = this.lastCenterPosition.x;
                roiSize.y = this.lastCenterPosition.y;
            }

            if (this.teachTools.length >= 1) {
                roiSize.x = viewBox[2] / 2 + viewBox[0] + (this.teachTools.length * 20);
                roiSize.y = viewBox[3] / 2 + viewBox[1] + (this.teachTools.length * 20);
            }
        }

        angle = (typeof angle !== 'undefined') ? angle : 0;


        switch (symbolType) {
            case this.RoiSymbolType.rectangle:
                teachTool = new RectangleRoi("RectangleRoi",
                    this.smartControl,
                    this.selectionController,
                    roiSize,
                    this.imageSizes,
                    this.colorSettings.modelRoiToolColors,
                    false,
                    angle,
                    symbolType,
                    roiFunction);

                this._initializeSymbolTool(teachTool, this.teachTools);
                break;

            case this.RoiSymbolType.ellipse:
                teachTool = new CircleRoi("CircleRoi",
                    this.smartControl,
                    this.selectionController,
                    roiSize,
                    this.imageSizes,
                    this.colorSettings.modelRoiToolColors,
                    false,
                    angle,
                    symbolType,
                    roiFunction);

                this._initializeSymbolTool(teachTool, this.teachTools);
                break;
            case this.RoiSymbolType.ellipseRing:
                initialRingThickness = (typeof initialRingThickness !== 'undefined') ? initialRingThickness : {
                    ringWidth: 0,
                    ringHeight: 0
                };
                teachTool = new EllipseRing("EllipseRing",
                    this.smartControl,
                    this.selectionController,
                    roiSize,
                    initialRingThickness,
                    this.imageSizes,
                    this.colorSettings.modelRoiToolColors,
                    false,
                    angle,
                    symbolType,
                    roiFunction);

                this._initializeSymbolTool(teachTool, this.teachTools);
                break;

            case this.RoiSymbolType.freehand:
                teachTool = new FreehandTool("FreehandTool",
                    this.smartControl,
                    this.imageSizes,
                    this.colorSettings.modelRoiToolColors,
                    symbolType,
                    roiFunction);
                teachTool.setFocus(true);
                this._initializeSymbolTool(teachTool, this.teachTools);
                break;

            case this.RoiSymbolType.crosshair: {
                teachTool = new CrosshairRoi(this.smartControl, roiSize.x, roiSize.y);
                this.teachTools.push(teachTool);

                this.smartControl.clickObservable.subscribe(function (event) {
                    if (event !== 'undefined') {
                        teachTool.onClick(event);
                    }
                });

                this.smartControl.panPositionObservable.subscribe(function () {
                    teachTool.onUpdateZoomValue();
                });

                this.smartControl.touchPointObservable.subscribe(function (pos) {
                    if (pos !== 'undefined') {
                        teachTool.setCenterPosition(pos.posx, pos.posy);
                    }
                });
            }
            break;
        }
        this.setDirtyFlagOfSelectedModelRoi(true);
        this.updateButtonStates();
        return teachTool;
    };

    p._initializeSymbolTool = function (symbolTool, targetList) {
        var methodRoiToolSelectionChanged, that = this;

        this.smartControl.imageClickObservable.subscribe(function (ev) {

            if (!that.settings.multiSelect) {
                symbolTool.setSelected(false);
                symbolTool.redraw();
            }
            that.updateModelRoiSelectionState(ev);
            that.updateExecutionRoiSelectionState(ev);
            that.updateButtonStates();
        });

        this.smartControl.panPositionObservable.subscribe(function () {
            symbolTool.onUpdateZoomValue();
        });

        methodRoiToolSelectionChanged = this.roiToolSelectionChanged.bind(this);
        symbolTool.registerCallback("methodRoiToolSelectionChanged", methodRoiToolSelectionChanged);
        this.selectionController.firstSelectedTool = undefined;
        symbolTool.setSelected(true);
        targetList.push(symbolTool);

        this.removeFocusFromAllFreehandTools();

        if (symbolTool.className === "FreehandTool") {
            this.deselectAllOtherTools(symbolTool);
            symbolTool.setFocus(true);

            if (symbolTool.getRoiFunction) {
                if (symbolTool.getRoiFunction() === "roi") {
                    this.paintMode = "paint";
                } else {
                    this.paintMode = "erase";
                }
            }
        }
        this.updateToolList();
    };

    p.deselectAllOtherTools = function (symbolTool) {
        this.teachTools.forEach(function (tool) {
            if ((symbolTool != tool) && tool.isSelected()) {
                tool.clearSelection();
                tool.redraw();
            }
        });

        this.executionTools.forEach(function (tool) {
            if ((symbolTool != tool) && tool.isSelected()) {
                tool.clearSelection();
                tool.redraw();
            }
        });
    };

    p.removeAllRois = function () {
        var modelNumber;
        if (this.settings.editMode === true) {
            this.removeAllExecutionRois();
        } else {
            modelNumber = this.getSelectedModelId();
            if (modelNumber && modelNumber >= 0) {
                this._deleteModelRoi(modelNumber);
            }
        }
    };

    p.removeFocusFromAllFreehandTools = function () {
        this.teachTools.forEach(function (tool) {
            if (tool.setFocus) {
                tool.setFocus(false);
            }
        });

        this.executionTools.forEach(function (tool) {
            if (tool.setFocus) {
                tool.setFocus(false);
            }
        });
        this.paintMode = "off";
    };

    p._addPipette = function () {
        this.pipette = new Pipette(this.smartControl.renderer, this);
    };

    p._addSelectionController = function () {
        this.selectionController = new SelectionController(this);
    };

    p.onVisionFunctionParametersValueChanged =  function (evt, changedParameter) {
        switch (changedParameter) {
            case 'SearchAngle':
                this._updateOrientationToolAngle();
                break;
        }
    }; 

    p.onVisionFunctionModelParameterValueChanged = function (evt, changedParameter, accessAttribut) {
        switch (changedParameter) {
            case 'SearchAngle':
                this._updateOrientationToolAngle();
                break;
        }
        this.setDirtyFlagOfChangedTeachParameter(accessAttribut);
        this.setDirtyFlagOfChangedSubmitParameter(accessAttribut);
        this.widgetsHandling.updateWidgetsStatus();
    };

    p.onVisionFunctionVariableValueChanged = function (evt, changedParameter) {
        switch (changedParameter) {
            case 'ParameterMode':
                this.statusGroupBoxes.enableParametersGroupBox(this.paramHandler._getParameterModeFromVisionFunctionVaribles());
                break;
        }
    };

    p.onVisionFunctionGlobalModelValueChanged = function (evt, changedParameter) {
        if (this.ingnoredEventParameterValueChanged != true) {
            switch (changedParameter) {
                case 'Operation':
                case 'Target':
                case 'Reference':
                    this.globalModelHandling._updateParametersGlobalModelList();
                    break;
            }
        }
    };

    p.onSelectorListChange = function () {
        this.resultFilter.onSelectorListChange();
    };

    p.onSelectedIndexOfAddMeasurement = function (evt) {
        this.globalModelHandling.onSelectedIndexOfAddMeasurement(evt.detail.selectedValue);
    };

    p.onSelectedIndexOfDropDownForLoadChanged = function (evt) {
        this.widgetsHandling.onSelectedIndexOfDropDownForLoadChanged(evt.detail.selectedValue, evt.detail.selectedIndex);
    };

    p.onSelectedIndexOfDropDownForSaveChanged = function (evt) {
        this.widgetsHandling.onSelectedIndexOfDropDownForSaveChanged(evt.detail.selectedIndex);
    };

    p.onSelectedIndexOfDropDownForDeleteChanged = function (evt) {
        this.widgetsHandling.onSelectedIndexOfDropDownForDeleteChanged(evt.detail.selectedValue, evt.detail.selectedIndex);
    };

    p.onSelectedIndexOfDropDownForSortProcessVariablesChanged = function (evt) {
        this.widgetsHandling.onSelectedIndexOfDropDownForSortProcessVariablesChanged(evt.detail.selectedIndex);
    };

    p.onEditButtonValueChanged = function (evt) {
        var selectedValue = evt.detail.newValueBool; 
        this.onEditButtonClick(selectedValue);
    };

    p.onSelectedIndexOfModelTypeChanged = function (evt) {
        this.setSelectedModelType(evt.detail.selectedValue);
    };

    p.onButtonLoggerValueChanged = function (evt) {
        this.loggerHandling.onButtonLoggerValueChanged(evt.detail.newValueBool);
    };

    p.onSelectedIndexOfVisionApplicationNavigationChanged = function (evt) {
        var selectedValue, selectedIndex;
        selectedValue = evt.detail.selectedValue;
        selectedIndex = evt.detail.selectedIndex;
        this.navigationBetweenVisionFunctions.onSelectedIndexOfVisionApplicationNavigationChanged(selectedValue, selectedIndex);
    };

    p.resetEventBindings = function () {
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxRoiCommands).off('SelectedIndexChanged', this._bind(this.onSelectedIndexOfRoiCommandsChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxToolList).off('SelectedIndexChanged', this._bind(this.onSelectedIndexOfRoiToolsChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdVfModelsTabControl).off('SelectedIndexChanged', this._bind(this.onSelectedIndexOfVfModelsTabControlChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdSelectorListForFilter).off('SelectedIndexChanged', this._bind(this.onSelectorListChange));
        $('#' + this.settings.parentContentId + '_' + this.settings.visionFunctionParametersRefId).off('parameterValueChanged', this._bind(this.onVisionFunctionParametersValueChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.visionFunctionModelParameterRefId).off('parameterValueChanged', this._bind(this.onVisionFunctionModelParameterValueChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.visionFunctionVariablesRefId).off('parameterValueChanged', this._bind(this.onVisionFunctionVariableValueChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.visionFunctionGlobalModel).off('parameterValueChanged', this._bind(this.onVisionFunctionGlobalModelValueChanged)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxForTheRoiManipulation).off('SelectedIndexChanged', this._bind(this.onSelectedIndexOfRoiManipulationChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxAddMeasurement).off('SelectedIndexChanged', this._bind(this.onSelectedIndexOfAddMeasurement));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxForLoad).off('SelectedIndexChanged', this._bind(this.onSelectedIndexOfDropDownForLoadChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxForSortProcessVariables).off('SelectedIndexChanged', this._bind(this.onSelectedIndexOfDropDownForSortProcessVariablesChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxForSave).off('SelectedIndexChanged', this._bind(this.onSelectedIndexOfDropDownForSaveChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxForDelete).off('SelectedIndexChanged', this._bind(this.onSelectedIndexOfDropDownForDeleteChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdButtonEditTool).off('ValueChanged', this._bind(this.onEditButtonValueChanged)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxModelType).off('SelectedIndexChanged', this._bind(this.onSelectedIndexOfModelTypeChanged)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdBtnZoomIn).off('Click', this._bind(this.zoomIn)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdBtnZoomOut).off('Click', this._bind(this.zoomOut));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdBtnZoomReset).off('Click', this._bind(this.zoomReset));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdRemoveMeasurement).off('Click', this._bind(this.deleteGlobalModel));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdButtonSaveGlobalModel).off('Click', this._bind(this.saveGlobalModel)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdButtonRepetitiveMode).off('ValueChanged', this._bind(this.setRepetitiveMode)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdButtonExecute).off('Click', this._bind(this.onButtonClickPlay));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdButtonImageCapture).off('Click', this._bind(this.triggerToggle));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdBtnIncrementFilterIndex).off('Click', this._bind(this.onButtonResultFilterNext)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdBtnDecrementFilterIndex).off('Click', this._bind(this.onButtonResultFilterPrevious)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdFilterIndex).off('ValueChanged', this._bind(this.onResultFilterIndexChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdTglBtnShowAllResults).off('ValueChanged', this._bind(this.onButtonResultFilterShowAllResults)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdBtnTeach).off('Click', this._bind(this.teachOrSubmitAction));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdBtnRemoveModel).off('Click', this._bind(this.removeModel)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdTglBtnHideAllResults).off('ValueChanged', this._bind(this.onButtonResultFilterHideAllResults));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdEditMarker).off('ValueChanged', this._bind(this.onButtonValueChangeEditMarker));
        $(document.body).off(BreaseEvent.WIDGET_READY, this._bind('_handleWidgetReady'));
    };

    p.resetEventBindingsOfHeaderContent = function () {
        $('#' + this.settings.headerContentId + '_' + this.settings.refIdDropDownBoxVisionApplicationNavigation).off('SelectedIndexChanged', this._bind(this.onSelectedIndexOfVisionApplicationNavigationChanged)); 
        $('#' + this.settings.headerContentId + '_' + this.settings.refIdBtnLogger).off('ValueChanged', this._bind(this.onButtonLoggerValueChanged));
        $('#' + this.settings.headerContentId + '_' + this.settings.refIdDropDownBoxComponentList).off('SelectedIndexChanged', this._bind(this.onSelectedIndexChangedOfComponentList));    
    };

    p._initializeCustomEvents = function () {
        this.resetEventBindings();
        $('#' + this.settings.parentContentId + '_' + this.settings.visionFunctionParametersRefId).on('parameterValueChanged', this._bind(this.onVisionFunctionParametersValueChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.visionFunctionModelParameterRefId).on('parameterValueChanged', this._bind(this.onVisionFunctionModelParameterValueChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.visionFunctionVariablesRefId).on('parameterValueChanged', this._bind(this.onVisionFunctionVariableValueChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.visionFunctionGlobalModel).on('parameterValueChanged', this._bind(this.onVisionFunctionGlobalModelValueChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxRoiCommands).on('SelectedIndexChanged', this._bind(this.onSelectedIndexOfRoiCommandsChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdSelectorListForFilter).on('SelectedIndexChanged', this._bind(this.onSelectorListChange));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxToolList).on('SelectedIndexChanged', this._bind(this.onSelectedIndexOfRoiToolsChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdVfModelsTabControl).on('SelectedIndexChanged', this._bind(this.onSelectedIndexOfVfModelsTabControlChanged));
        $('#' + this.settings.headerContentId + '_' + this.settings.refIdDropDownBoxVisionApplicationNavigation).on('SelectedIndexChanged', this._bind(this.onSelectedIndexOfVisionApplicationNavigationChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxForTheRoiManipulation).on('SelectedIndexChanged', this._bind(this.onSelectedIndexOfRoiManipulationChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxAddMeasurement).on('SelectedIndexChanged', this._bind(this.onSelectedIndexOfAddMeasurement));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxForLoad).on('SelectedIndexChanged', this._bind(this.onSelectedIndexOfDropDownForLoadChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxForSave).on('SelectedIndexChanged', this._bind(this.onSelectedIndexOfDropDownForSaveChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxForDelete).on('SelectedIndexChanged', this._bind(this.onSelectedIndexOfDropDownForDeleteChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxForSortProcessVariables).on('SelectedIndexChanged', this._bind(this.onSelectedIndexOfDropDownForSortProcessVariablesChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdButtonEditTool).on('ValueChanged', this._bind(this.onEditButtonValueChanged)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdDropDownBoxModelType).on('SelectedIndexChanged', this._bind(this.onSelectedIndexOfModelTypeChanged));
        $('#' + this.settings.headerContentId + '_' + this.settings.refIdDropDownBoxComponentList).on('SelectedIndexChanged', this._bind(this.onSelectedIndexChangedOfComponentList));
        $('#' + this.settings.headerContentId + '_' + this.settings.refIdBtnLogger).on('ValueChanged', this._bind(this.onButtonLoggerValueChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdBtnZoomIn).on('Click', this._bind(this.zoomIn)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdBtnZoomOut).on('Click', this._bind(this.zoomOut));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdBtnZoomReset).on('Click', this._bind(this.zoomReset));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdRemoveMeasurement).on('Click', this._bind(this.deleteGlobalModel));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdButtonSaveGlobalModel).on('Click', this._bind(this.saveGlobalModel)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdButtonRepetitiveMode).on('ValueChanged', this._bind(this.setRepetitiveMode)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdButtonExecute).on('Click', this._bind(this.onButtonClickPlay));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdButtonImageCapture).on('Click', this._bind(this.triggerToggle));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdBtnIncrementFilterIndex).on('Click', this._bind(this.onButtonResultFilterNext)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdBtnDecrementFilterIndex).on('Click', this._bind(this.onButtonResultFilterPrevious)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdFilterIndex).on('ValueChanged', this._bind(this.onResultFilterIndexChanged));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdTglBtnShowAllResults).on('ValueChanged', this._bind(this.onButtonResultFilterShowAllResults)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdBtnTeach).on('Click', this._bind(this.teachOrSubmitAction)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdBtnRemoveModel).on('Click', this._bind(this.removeModel)); 
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdTglBtnHideAllResults).on('ValueChanged', this._bind(this.onButtonResultFilterHideAllResults));
        $('#' + this.settings.parentContentId + '_' + this.settings.refIdEditMarker).on('ValueChanged', this._bind(this.onButtonValueChangeEditMarker));
    };

    p.onSelectedIndexChangedOfComponentList = function (evt) {
        var value = evt.detail.selectedValue; 
        if (value === "N/D") {
            this.loggerHandling.setVisibleGroupBox(false);
        }
    };

    p._handleWidgetReady = function (e) {
        if (e.target.id === this.settings.dialogSaveAsContentId + '_' + this.settings.refIdTextInApplicationName) {
            this.saveAsDialogHandling.onTextInApplicationNameReady();
        }
    };

    p._handleSaveAsDialogContentActivated = function (ev) {
        if (ev.detail.contentId === this.settings.dialogSaveAsContentId) {
            $(document.body).off("ContentActivated", this._bind('_handleSaveAsDialogContentActivated'));
            this.saveAsDialogHandling.onSaveAsDialogContentActivated();
        }
    };

    p.loadVisionApplication = function (visionApplicationName) {
        var args = {
            ApplicationName: visionApplicationName
        };
        this.setWaitingForLoadVisionApplicationStatusUpdate(true);
        this._callOpcUaMethod('LoadVisionApplication', args);
        this.onVisionApplicationLoading();
        this.resetAndCleanupAfterSelectedVF();
    };

    p.getSelectedIndexOfVfModelsTabControl = function () {
        var selectedIndexOfModelsTabControl;

        if (this.isUnitTestEnviroment() !== true) {
            selectedIndexOfModelsTabControl = this._callExternalWidget(this.settings.parentContentId + '_' + this.settings.refIdVfModelsTabControl, 'getSelectedIndex');
        }
        return selectedIndexOfModelsTabControl;
    };

    p.setInitialSelectedIndexOfVfModelsTabControl = function () {
        var selectedIndexOfModelsTabControl;

        selectedIndexOfModelsTabControl = this.getSelectedIndexOfVfModelsTabControl();

        switch (selectedIndexOfModelsTabControl) {
            case 0:
                this.setSelectedVfModelTabWithVisionFunctionPage();
                break;
            case 1:
                this.setSelectedVfModelTabWithEditModelsPage();
                break;
        }
        this.updateApplicationContext();
    };

    p.setSelectedVfModelTabWithVisionFunctionPage = function () {
        this.settings.selectedVfModelTab = "VisionFunctionPage";
    };

    p.setSelectedVfModelTabWithEditModelsPage = function () {
        this.settings.selectedVfModelTab = "EditModelsPage";
    };

    p.onSelectedIndexOfVfModelsTabControlChanged = function (evt) {
        var selectedIndexOfVfModelsTabControl = evt.detail.value;
        if (selectedIndexOfVfModelsTabControl >= 0) {
            if (selectedIndexOfVfModelsTabControl === 0) {
                this.setSelectedVfModelTabWithVisionFunctionPage();
                this.hideOrientationTool();
            } else if (selectedIndexOfVfModelsTabControl === 1) {
                this.setSelectedVfModelTabWithEditModelsPage();
                this.updateOrientationTool();
            }
            this.setEditMode(false);
            this.updateApplicationContext();
        }
    };

    p.addTool = function (toolType, toolFunction) {
        if (this.applicationContext === "edit_execution_roi") {
            this.addExecutionTool(toolType, toolFunction);
        } else if (this.applicationContext === "edit_model_roi") {
            if (this.determineAddToolAllowed()) {
                this.addSymbolModelRoiTool(toolType, toolFunction);
            }
        }
    };

    p.onSelectedIndexOfRoiManipulationChanged = function (evt) {
        this.settings.selectedValueOfRoiManipulation = evt.detail.selectedValue;
        switch (this.settings.selectedValueOfRoiManipulation) {
            case "delete":
                this.deleteSelectedTools();
                this.widgetsHandling.setDefaultValueOfRoiManipulation();
                break;
            case "copy":
                this.copySelectedRoiToolsToClipboard();
                this.widgetsHandling.setDefaultValueOfRoiManipulation();
                break;
            case "paste":
                this.pasteRoiToolsFromClipboard();
                this.widgetsHandling.setDefaultValueOfRoiManipulation();
                break;
        }
    };


    p.onSelectedIndexOfRoiToolsChanged = function (evt) {
        this.settings.selectedValueOfRoiTools = evt.detail.selectedValue;
        switch (this.settings.selectedValueOfRoiTools) {
            case "ring+":
                this.addTool(this.RoiSymbolType.ellipseRing, "roi");
                this.widgetsHandling.setDefaultValueOfRoiTools();
                break;
            case "ring-":
                this.addTool(this.RoiSymbolType.ellipseRing, "roni");
                this.widgetsHandling.setDefaultValueOfRoiTools();
                break;
            case "ellipse+":
                this.addTool(this.RoiSymbolType.ellipse, "roi");
                this.widgetsHandling.setDefaultValueOfRoiTools();
                break;
            case "ellipse-":
                this.addTool(this.RoiSymbolType.ellipse, "roni");
                this.widgetsHandling.setDefaultValueOfRoiTools();
                break;
            case "rectangle+":
                this.addTool(this.RoiSymbolType.rectangle, "roi");
                this.widgetsHandling.setDefaultValueOfRoiTools();
                break;
            case "rectangle-":
                this.addTool(this.RoiSymbolType.rectangle, "roni");
                this.widgetsHandling.setDefaultValueOfRoiTools();
                break;
            case "freehand":
                if (this.paintMode != "paint") {
                    this.addTool(this.RoiSymbolType.freehand, "roi");
                    this.widgetsHandling.setDefaultValueOfRoiTools();
                } else {
                    this.removeFocusFromAllFreehandTools();
                    this.updateToolList();
                    this.widgetsHandling.setDefaultValueOfRoiTools();
                }
                break;
            case "eraser":
                if (this.paintMode != "erase") {
                    this.addTool(this.RoiSymbolType.freehand, "roni");
                    this.widgetsHandling.setDefaultValueOfRoiTools();
                } else {
                    this.removeFocusFromAllFreehandTools();
                    this.updateToolList();
                    this.widgetsHandling.setDefaultValueOfRoiTools();
                }
                break;
            case "crosshair":
                this.addCrossHairTool();
                this.widgetsHandling.setDefaultValueOfRoiTools();
                break;

            default:
                break;
        }
    };

    p.onSelectedIndexOfRoiCommandsChanged = function (evt) {
        this.settings.selectedValueOfRoiCommads = evt.detail.selectedValue;
        switch (this.settings.selectedValueOfRoiCommads) {
            case "size":
                this.selectionController.setSizeOfAllSelectedRoiTools(this);
                this.widgetsHandling.setDefaultValueOfRoiCommands();
                break;
            case "angle":
                this.selectionController.setSameAngleOfAllSelectedRoiTools(this);
                this.widgetsHandling.setDefaultValueOfRoiCommands();
                break;
            case "alignment":
                this.selectionController.setAlignmentOfAllSelectedRoiTools(this);
                this.widgetsHandling.setDefaultValueOfRoiCommands();
                break;
            case "spacing":
                this.selectionController.setSpacingOfAllSelectedRoiTools(this);
                this.widgetsHandling.setDefaultValueOfRoiCommands();
                break;

        }
    };

    p._registerAllBindings = function () {
        var context = this;
        this.dynamicBindingsActive = true;
        this.dynamicBindingList.forEach(function (element) {
            context._registerBinding(element.src, element.target, element.mode);
        });
    };

    p._deleteAllBindings = function () {
        var context = this;
        if (!this.dynamicBindingsActive) {
            return;
        }
        this.dynamicBindingList.forEach(function (element) {
            context._deleteBinding(element.target);
        });
        this.dynamicBindingsActive = false;
    };

    p.getVisuId = function () {
        var container, visuId;
        container = $('#' + this.elem.id).closest('.LayoutArea').parent().closest('.LayoutArea');
        if (container.length === 0) {
            this.settings.containerId = brease.appElem.id;
        } else {
            this.settings.containerId = container[0].id;
        }
        visuId = brease.pageController.getVisu4Page(brease.pageController.getCurrentPage(this.settings.containerId));
        return visuId;
    };

    p._registerBinding = function (opcUaAttribute, widgetAttribute, mode) {
        var context = this;
        if (this.settings.visionComponentReference === '') {
            return;
        }
        this.settings.visuId = this.getVisuId();
        $.when(
            brease.uiController.createBindings(
                this.settings.parentContentId,
                this.settings.visuId,
                [{
                    "mode": mode,
                    "source": {
                        "type": "opcUa",
                        "refId": '"urn:B&R/Diagnosis/mappCockpit"|String|' +
                            this.settings.visionComponentReference +
                            '.' +
                            opcUaAttribute,
                        "attribute": "value"
                    },
                    "target": {
                        "type": "brease",
                        "refId": this.el[0].id,
                        "attribute": widgetAttribute
                    }
                }]
            )
        ).then(function success(result) {
                context._consoleEvents('DynamicBinding of ' +
                    widgetAttribute +
                    ' was set up. statusCode: ' +
                    result[0].code +
                    ' message: "' +
                    result[0].message +
                    '"');
            },
            function fail(result) {
                context._consoleEvents('DynamicBinding of ' +
                    widgetAttribute +
                    ' was failed to set up. statusCode: ' +
                    result[0].code +
                    ' message: "' +
                    result[0].message +
                    '"');
            });
    };

    p._deleteBinding = function (widgetAttribute) {
        var context = this;
        this.settings.visuId = this.getVisuId();
        $.when(
            brease.uiController.deleteBindings(
                this.settings.parentContentId,
                this.settings.visuId,
                [{
                    "type": "brease",
                    "refId": this.el[0].id,
                    "attribute": widgetAttribute

                }]
            )
        ).then(function success(result) {
                context._consoleEvents('DynamicBinding of ' +
                    widgetAttribute +
                    ' was deleted. statusCode: ' +
                    result[0].code +
                    ' message: "' +
                    result[0].message +
                    '"');
            },
            function fail(result) {
                context._consoleEvents('DynamicBinding of ' +
                    widgetAttribute +
                    ' was failed to delete. statusCode: ' +
                    result.code +
                    ' message: "' +
                    result.message +
                    '"');
            });
    };

    p.initializeWidgetsHandling = function () {
        this.widgetsHandling = new WidgetsHandling(this);
        this.widgetsHandling.setRoiToolsDataProvider();
        this.widgetsHandling.setRoiCommandsDataProvider();
        this.widgetsHandling.setRoiManipulationDataProvider();
        this.widgetsHandling.setDefaultValueOfModelType();
        this.widgetsHandling.updateWidgetsStatus();
        this.widgetsHandling.setDataProviderForSave();
        this.widgetsHandling.setImageModeTabItem();
        this.setVisionApplicationIsSaving(!this.getSaveVisionApplicationStatus()[2]);
        this.setVisionApplicationIsDeleting(!this.getDeleteVisionApplicationStatus()[2]);
    };

  
    p.setHmiVisionApplicationName = function (configuration) {
        try {
            this.settings.hmiVisionApplicationName = JSON.parse(configuration.arguments.Configuration).HmiVisionApplicationName;
        } catch (parseEvent) {
            console.warn("Parse error, incoming message was not valid JSON");
        }
        this.widgetsHandling.setImageOfVisionApplicationInHeader(this.settings.hmiVisionApplicationName);
        this.widgetsHandling.setTextOfHMIVisionApplicationName();
        this.updateListOfVAs();
    };

    p.getHmiVisionApplicationName = function () {
        return this.settings.hmiVisionApplicationName;
    };

    p.updateListOfVAsAndHMIVAName = function () {
        this._callOpcUaMethod('GetVAConfiguration', undefined, 'setHmiVisionApplicationName');
    };

    p.updateListOfVAs = function () {
        this._callOpcUaMethod('GetListOfVAs', undefined, 'updateDropDownListForLoadDeleteAndSave');
    };

    p.updateDropDownListForLoadDeleteAndSave = function (listOfVAs_) {
        try {
            var listOfVAs = JSON.parse(listOfVAs_.arguments.VAs);
            if (listOfVAs.length !== undefined) {
                this.widgetsHandling.updateDataProviderForLoad(listOfVAs);
                this.widgetsHandling.updateDataProviderForDelete(listOfVAs);
                this.widgetsHandling.updateDataProviderForSave();
            }
        } catch (parseEvent) {
            console.warn("Parse error, incoming message was not valid JSON");
        }
    };

    p._handleContentActivated = function (ev) {
        if (ev.detail.contentId === this.settings.parentContentId) {
            $(document.body).off("ContentActivated", this._bind('_handleContentActivated'));
            this._initialPrepare();
            this.initializeWidgetsHandling();
            this._registerAllBindings();
            this._initSmartPanelModel();
            this.setInitialSelectedIndexOfVfModelsTabControl();
        }
    };

    p.hideOrientationTool = function () {
        if (this.orientationArrow) {
            this.orientationArrow.hide();
        }
    };

    p.showOrientationTool = function () {
        if (this.orientationArrow) {
            this.orientationArrow.show();
        }
    };

    p.deleteOrientationTool = function () {
        if (this.orientationArrow) {
            this.orientationArrow.dispose();
            this.orientationArrow = undefined;
        }
    };

    p._createOrientationTool = function () {
        var viewBox = this.smartControl.getViewBox(),
            dimension;

        dimension = {
            x: viewBox[2] / 2 + viewBox[0],
            y: viewBox[3] / 2 + viewBox[1],
            width: viewBox[2] / this.settings.orientationToolRatioViewBoxToTool,
            height: (viewBox[2] / this.settings.orientationToolRatioViewBoxToTool) / this.settings.orientationToolRatioWidthToHeight
        };

        if (dimension.width > this.defaultSettings.orientationToolSizeMax.width) {
            dimension.width = this.defaultSettings.orientationToolSizeMax.width;
            dimension.height = this.defaultSettings.orientationToolSizeMax.height;
        } else if (dimension.width < this.defaultSettings.orientationToolSizeMin.width) {
            dimension.width = this.defaultSettings.orientationToolSizeMin.width;
            dimension.height = this.defaultSettings.orientationToolSizeMin.height;
        }
        this.orientationArrow = new OrientationArrow("OrientationArrow", this.smartControl.renderer, dimension, this.imageSizes, this.colorSettings.orientationToolColors, false);
        this.orientationArrow.registerParentFunction(this, this._onOrientationToolRotated);
    };



    p._setOrientationToolEditMode = function (editability) {
        if (this.orientationArrow === undefined) {
            this._createOrientationTool();
        }
        if (editability) {
            var tempRoiParams = this.orientationArrow.getRoiParams();
            var tempRoiSize = {
                x: tempRoiParams.x,
                y: tempRoiParams.y,
                width: tempRoiParams.width,
                height: tempRoiParams.height
            };
            this.orientationArrow.changeEditMode(!this.widgetsHandling.isEditingGlobalModel());
            this.orientationArrow.setSize(tempRoiSize);
            this.orientationArrow.redraw();
            this._updateOrientationToolAngle();
            this.orientationArrow.show();
        } else {
            this.orientationArrow.changeEditMode(false);

        }
    };

    p._getSearchAngleFromVisionFunction = function () {
        var tempList, tempSearchAngle, index;
        if (this.paramHandler !== undefined) {

            if (this.getCapabilityOfExecutionRoi("OrientationTool")) {
                tempList = this.paramHandler.getVisionFunctionParameters();
            } else {
                tempList = this.paramHandler.getVisionFunctionModels();
            }
            if (tempList) {
                for (index = 0; index < tempList.length; index++) {
                    if (tempList[index].SearchAngle !== undefined) {
                        tempSearchAngle = tempList[index].SearchAngle;
                        return tempSearchAngle;
                    }
                }
            }
            return;
        }
    };

    p._updateOrientationToolAngle = function () {
        var tempAngle = this._getSearchAngleFromVisionFunction();
        if (tempAngle !== undefined) {
            if (this.getCapabilityOfExecutionRoi("OrientationTool")) {
                tempAngle = tempAngle / this.defaultSettings.orientationToolSearchAngleToDegRatio;
            }
            this._setOrientationToolAngle(tempAngle);
        }
    };

    p.handleExecutionRoiOrientation = function (params) {
        var index, angleDeg;
        if (this.getCapabilityOfExecutionRoi("OrientationTool")) {
            for (index = 0; index < params.length; index++) {
                if (params[index].SearchAngle !== undefined) {
                    angleDeg = params[index].SearchAngle / this.defaultSettings.orientationToolSearchAngleToDegRatio;
                    this._setOrientationToolAngle(angleDeg);
                }
            }
        }
    };

    p._setOrientationToolAngle = function (angleDegIn) {
        if (this.orientationArrow) {
            this.orientationArrow.setAngleDefMath(angleDegIn);
        }
    };

    p._onOrientationToolRotated = function (arrowAngle) {
        if (this.vfCapabilities.has("GlobalModel")) {
            if (arrowAngle > 180 && arrowAngle <= 360) {
                arrowAngle = arrowAngle - 360;
            }
            this._setSearchAngleInModel(arrowAngle);
            this.updateButtonStates();
        } else {
            arrowAngle = Math.round(arrowAngle * this.defaultSettings.orientationToolSearchAngleToDegRatio);
            this._setSearchAngleInVisionFunction(arrowAngle);
        }
    };

    p._setSearchAngleInVisionFunction = function (newSearchAngle) {
        var index;
        if (this.paramHandler !== undefined) {
            var tempListVFparams = this.paramHandler.getVisionFunctionParameters();
            for (index = 0; index < tempListVFparams.length; index++) {
                if (tempListVFparams[index].SearchAngle !== undefined) {
                    tempListVFparams[index].SearchAngle = newSearchAngle;
                    break;
                }
            }

            var tempListVFvars = this.paramHandler.getVisionFunctionVariables();
            for (index = 0; index < tempListVFvars.length; index++) {
                if (tempListVFvars[index].Enable !== undefined) {
                    tempListVFvars[index].Enable = 0;
                    break;
                }
            }
            this.paramHandler.setVisionFunctionParameters(tempListVFparams); // tell the SmartPanelParameterMode
        }
    };

    p.updateOrientationTool = function (modelType) {
        var angle;

        if (this.getIsSelectedImageAcquisition() != true) {
            if ((this.applicationContext === "edit_execution_roi") && (this.getCapabilityOfExecutionRoi("OrientationTool"))) {
                this._setOrientationToolEditMode(true);
                angle = this.orientationArrow.getAngleDefMath();
                angle = Math.round(angle * this.defaultSettings.orientationToolSearchAngleToDegRatio);
                this._setSearchAngleInVisionFunction(angle);
            } else {
                this.hideOrientationTool();
            }
        }

        if (this.vfCapabilities.has("Models")) {
            if (modelType === undefined) {
                modelType = this.getModelTypeOfSelectedModel();
            }
            if (this.getOrientationToolOfModelType(modelType) === true) {
                this._setOrientationToolEditMode(true);
            } else {
                this.hideOrientationTool();
            }
        }
    };


    p._setSearchAngleInModel = function (newSearchAngle) {
        var index, currentAngle, tempListModelparams;
        if (this.paramHandler !== undefined) {
            tempListModelparams = this.paramHandler.getVisionFunctionModels();
            for (index = 0; index < tempListModelparams.length; index++) {
                if (tempListModelparams[index].SearchAngle !== undefined) {
                    currentAngle = tempListModelparams[index].SearchAngle;
                    if (currentAngle != newSearchAngle) {
                        this.setDirtyFlagOfChangedTeachParameter(this.settings.accessAttributForTeach);
                    }
                    tempListModelparams[index].SearchAngle = newSearchAngle;
                    break;
                }
            }
            this.paramHandler.setVisionFunctionModelParameters(tempListModelparams); // tell the SmartPanelParameterMode
        }
    };

    p._initSmartPanelModel = function () {
        this.smartPanelModelList = brease.callWidget(this.settings.parentContentId +
            '_' +
            this.settings.visionFunctionModelListRefId,
            'widget');
        if (this.smartPanelModelList) {
            this.smartPanelModelList.registerSmartPanel(this);
        }

        this.smartPanelGlobalModelList = brease.callWidget(this.settings.parentContentId +
            '_' +
            this.settings.visionFunctionGlobalModelListRefId,
            'widget');

        if (this.smartPanelGlobalModelList) {
            this.smartPanelGlobalModelList.registerSmartPanel(this);
        }
    };

    /**
     * @method setVisionComponentReference
     * Sets the visionComponentReference
     * @param {String} visionComponentReference
     */
    p.setVisionComponentReference = function (visionComponentReference) {
        this.settings.visionComponentReference = visionComponentReference;
    };

    /**
     * @method getVisionComponentReference
     * Gets the visionComponentReference 
     * @param {String} visionComponentReference
     */
    p.getVisionComponentReference = function () {
        return this.settings.visionComponentReference;
    };

    p.handleOfLoadVisionApplication = function () {
        this.updateListOfVAsAndHMIVAName();
        if (this.isLastApplicationLoadSuccesful()) {
            this.onVisionApplicationLoaded();
            this.socketHandling.signalUpdateOfCameraStatus();
        } else {
            this.widgetsHandling.updateWidgetsStatus();
        }
    };

    p.isLastApplicationLoadSuccesful = function () {
        if ((this.getLoadVisionApplicationStatus()[1] >> 30) === -1) {
            return false;
        } else {
            return true;
        }
    };

    /**
     * @method setLoadVisionApplicationStatus
     * Sets the loadVisionApplicationStatus
     * @param {NumberArray1D} loadVisionApplicationStatus
     */
    p.setLoadVisionApplicationStatus = function (status) {
        if ((this.socketHandling) && (status !== null) && (status.length === 3)) {
            if ((this.isCounterOfLoadVisionApplicationIncremented(status) === true) && (this.getValidInfoOfStatus(status) === true)) {
                this.settings.loadVisionApplicationStatus = status;
                this.handleOfLoadVisionApplication();
            }
            this.setWaitingForLoadVisionApplicationStatusUpdate(!this.getLoadVisionApplicationStatus()[2]);
        }
    };


    p.getWaitingForLoadVisionApplicationStatusUpdate = function () {
        return this.settings.waitingForLoadVisionApplicationStatusUpdate;
    };

    p.setWaitingForLoadVisionApplicationStatusUpdate = function (waitingForLoadVisionApplicationStatusUpdate) {
        this.settings.waitingForLoadVisionApplicationStatusUpdate = waitingForLoadVisionApplicationStatusUpdate;
    };

    p.isCounterOfLoadVisionApplicationIncremented = function (loadVisionApplicationStatus) {
        var loadVisionApplicationCounterInput, registeredCounterOfLoadVisionApplication;

        loadVisionApplicationCounterInput = loadVisionApplicationStatus[0];
        registeredCounterOfLoadVisionApplication = this.settings.loadVisionApplicationStatus[0];

        if (loadVisionApplicationCounterInput !== registeredCounterOfLoadVisionApplication) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * @method getLoadVisionApplicationStatus
     * Gets the loadVisionApplicationStatus 
     * @param {NumberArray1D} loadVisionApplicationStatus
     */
    p.getLoadVisionApplicationStatus = function () {
        return this.settings.loadVisionApplicationStatus;
    };

    /**
     * @method setImageAcquisitionStatus
     * Sets the imageAcquisitionStatus 
     * @param {Integer} imageAcquisitionStatus
     */
    p.setImageAcquisitionStatus = function (imageAcquisitionStatus) {
        if (imageAcquisitionStatus === null) {
            return;
        }

        this.settings.imageAcquisitionStatus = imageAcquisitionStatus;
        this.socketHandling.signalUpdateOfCameraStatus();
    };

    /**
     * @method getImageAcquisitionStatus
     * Gets the imageAcquisitionStatus 
     * @return {Integer} imageAcquisitionStatus
     */
    p.getImageAcquisitionStatus = function () {
        return this.settings.imageAcquisitionStatus;
    };


    /**
     * @method setIsOperationModeSetToHmi
     * Sets the isOperationModeSetToHmi 
     * @param {Boolean} isOperationModeSetToHmi
     */
    p.setIsOperationModeSetToHmi = function (isOperationModeSetToHmi) {
        if (isOperationModeSetToHmi === null) {
            return;
        }

        this.settings.isOperationModeSetToHmi = isOperationModeSetToHmi;
        this.socketHandling.signalUpdateOfCameraStatus();
        if (isOperationModeSetToHmi === true) {
            this.HMIModeActive.resolve();
            this.updateListOfVAsAndHMIVAName();
            if (this.getModuleOk() === true) {
                this.widgetsHandling.onOperationModeSetToHmi();
            }
        }
    };

    /**
     * @method getIsOperationModeSetToHmi
     * Gets the isOperationModeSetToHmi
     * @return {Boolean} isOperationModeSetToHmi
     */
    p.getIsOperationModeSetToHmi = function () {
        return this.settings.isOperationModeSetToHmi;
    };

    /**  
     * @method setHmiModeActiveCounter
     * Sets the hmiModeActiveCounter
     * @param {Integer} hmiModeActiveCounter
     */
    p.setHmiModeActiveCounter = function (hmiModeActiveCounter) {
        if (hmiModeActiveCounter === null) {
            return;
        }
        this.settings.hmiModeActiveCounter = hmiModeActiveCounter;
        if (this.getIsOperationModeSetToHmi() === true) {
            this.HMIModeActive.resolve();
        }
    };

    /**
     * @method getHmiModeActiveCounter
     * Gets the hmiModeActiveCounter 
     * @param {Integer} hmiModeActiveCounter 
     */
    p.getHmiModeActiveCounter = function () {
        return this.settings.hmiModeActiveCounter;
    };

    p.initPromiseForConfigLoadFilesAndHMIModeActive = function () {
        var widget = this;
        this.HMIModeActive = $.Deferred();
        this.configFileImageAcquisitionLoaded = $.Deferred();
        $.when(widget.HMIModeActive.promise(), widget.configFileImageAcquisitionLoaded.promise()).then(function successHandler() {
            widget.socketHandling.signalUpdateOfCameraStatus();
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

    p.updateVisionProgramState = function (message) {
        this.vpDataProvider.setVisionProgramState(message);
        this.settings.offlineMode = this.vpDataProvider.getOfflineMode();
        if (this.vpDataProvider.isVisionProgramLoaded()) {
            var visionProgramName = this.vpDataProvider.getVisionProgramName();
            this.setVisionProgramName(visionProgramName);
            var visionFunctionsName = this.vpDataProvider.getListOfVisionFunctionNames();
            this.setVisionAplicationNavigation(visionFunctionsName);
            this.setVisionFunctionName(visionFunctionsName[this.getVisionFunctionInstance() - 1]);
        }
    };

    p._updateParamsFromGetStateWhenFormIsReady = function (message) {
        var param = message.param,
            vfParameters,
            specialOutputIndex,
            specialOutputs,
            vfIndex = this.settings.visionFunctionInstance - 1;
        if (param && (param.length > 0)) {
            if (vfIndex < param.length - 1) {
                vfParameters = param[vfIndex];
                specialOutputIndex = param.length - 1;
                specialOutputs = message.param[specialOutputIndex].outputs;
                vfParameters.outputs = vfParameters.outputs.concat(specialOutputs);
                this.paramHandler.handleMessage(vfParameters);
            }
        }
    };

    p.updateParameterHandler = function (message) {
        if ((message.meta.error === undefined) && (this.informationOfGetStateInformationLoaded !== undefined)) {
            this.informationOfGetStateInformationLoaded.resolve(message);
        }
        if (this.configFileVisionFunctionLoaded && this.configFileVisionFunctionLoaded.state() === "resolved") {
            this._updateParamsFromGetStateWhenFormIsReady(message);
        }
    };

    p._showErrorMessageBox = function (title, text) {
        var btnValue = 'OK',
            icon = 'Error',
            style = "viHMIDefault";
        brease.overlayController.showMessageBox(btnValue, title, text, icon, undefined, style);
    };

    p._reportErrorCode = function (message) {
        var errorCode = Number(message.meta.errorId),
            text, vfList;
        if (message.meta.errorSource && message.meta.errorSource > 0) {
            vfList = this.vpDataProvider.getListOfVisionFunctionNames();
            text = 'Vision Function [' + message.meta.errorSource + ']: "' + vfList[message.meta.errorSource - 1] + '" ' + '\r\n' + message.meta.errorString;
        } else {
            text = message.meta.errorString;
        }
        this._showErrorMessageBox('Error Code: ' + errorCode, text);
    };

    p._reportInternalError = function (message) {
        var text;
        if (message.meta.errorId === 77556) //wsMem
        {
            return;
        }
        if (message.meta.errorId === 77913) //Feature Mismatch
        {
            return;
        }

        text = 'Internal Error occurred: "' + message.meta.command + '" code: ' + message.meta.errorId + ' ';
        if (message.meta.errorSource && message.meta.errorSource > 0) {
            text += 'VF[' + message.meta.errorSource + ']';
        }
        text += ' message: ' + message.meta.errorString;
        console.log(text);
    };

    p.onWsErrorResponse = function (message) {
        if (message.meta.errorId < 77000) {
            this._reportErrorCode(message);
        } else {
            this._reportInternalError(message);
        }
    };

    p.handleOfflineOrOnlineState = function (message) {
        var offlineMode = true;
        if (message.meta && message.meta.VSM) {
            offlineMode = message.meta.VSM.offline;
            this.setVisionApplicationIsExecuting(false);
            if (false === offlineMode) {
                this.onGetStateMessageOnline();
            } else {
                this.onGetStateMessageOffline();
            }
        }
    };

    p.onGetStateMessageOffline = function () {
        if (!this.vpDataProvider.isVisionProgramLoaded() || this.settings.visionFuntionStartupSequenceStarted === false) {
            this.settings.visionFuntionStartupSequenceStarted = true;
        }
        return true;
    };

    p.onGetStateMessageOnline = function () {
        if (!this.hmiStatus.isImageRequestTriggeredAfterConnect) {
            this.hmiStatus.isImageRequestTriggeredAfterConnect = true;
            this.settings.visionFuntionStartupSequenceStarted = true;
            this.initialImageLoaded = false;
            this.triggerToggle();
            return true;
        }

        if (this.settings.visionFuntionStartupSequenceStarted && this.vpDataProvider.isVisionProgramLoaded()) {
            this.vsEncoder.getRoi(this.settings.visionFunctionName);
        }
        return true;
    };
 
    
    
    p.onGetStateMessage = function (message) {
        this.updateVisionProgramState(message);
        this.handleOfflineOrOnlineState(message);
        this.updateParameterHandler(message);
        if (this.vpDataProvider.isVisionProgramLoaded()) {
            this.updateOrientationTool();
            this.resultFilter.executionError = this.vpDataProvider.evaluateImageProcessingError();
            this.resultFilter.resetResultFilter();            
        }
    };





    p.setVisionFuntionStartupSequenceStarted = function (value) {
        this.settings.visionFuntionStartupSequenceStarted = value;
        if (this.settings.visionFuntionStartupSequenceStarted === false) {
            this.resultFilter.resetResultFilter();
        }
    };

    p.setInitialExecutionRoi = function () {
        if ((this.getInitializeROI() === false) && (this.vfCapabilities.has("ExecutionRoi") === true) && (this.navigationBetweenVisionFunctions.getSelectedValueOfVisionApplicationNavigation() !== this.settings.imageAcquisitionName)) {
            this.executionRoi.setDirtyFlag(true);
            this.roiModus(true);
            this.addDefaultExecutionRoiTool();
        }
    };

    p.getVisionFuntionStartupSequenceStarted = function () {
        return (this.settings.visionFuntionStartupSequenceStarted);
    };

    p.isVisionFunctionPathDefined = function () {
        var isDefined = false,
            vfPath = this.settings.visionFunctionSubPath;
        if (vfPath && vfPath != '') {
            isDefined = true;
        }
        return isDefined;
    };

    p.onInitVisionProgramMessage = function ( /*message*/ ) {
        this.vsEncoder.getRoi(this.settings.visionFunctionName);
    };

    /**
     * @method setSaveVisionApplicationStatus
     * Sets the saveVisionApplicationStatus
     * @param {Integer} saveVisionApplicationStatus
     */
    p.setSaveVisionApplicationStatus = function (status) {
        if ((status !== null) && (status.length === 3) && (this.getValidInfoOfStatus(status) === true)) {
            if (this.isCounterOfSaveVisionApplicationIncremented(status) === true) {
                this.updateListOfVAsAndHMIVAName();
                this.settings.saveVisionApplicationStatus = status;
            }
            this.setVisionApplicationIsSaving(false);
        }
    };

    p.getValidInfoOfStatus = function (status) {
        var validIndex = 2;
        return (status[validIndex] === 1) ? true : false;
    };

    p.isCounterOfSaveVisionApplicationIncremented = function (status) {
        var saveVisionApplicationCounterInput, registeredCounterOfSaveVisionApplication;

        saveVisionApplicationCounterInput = status[0];
        registeredCounterOfSaveVisionApplication = this.settings.saveVisionApplicationStatus[0];

        if (saveVisionApplicationCounterInput !== registeredCounterOfSaveVisionApplication) {
            return true;
        } else {
            return false;
        }
    };


    p.setVisionApplicationIsDeleting = function (visionApplicationIsDeleting) {
        this.hmiStatus.visionApplicationIsDeleting = visionApplicationIsDeleting;
        this.setStatusReady();
    };

    p.getVisionApplicationIsDeleting = function () {
        return this.hmiStatus.visionApplicationIsDeleting;
    };

    /**
     * @method setDeleteVisionApplicationStatus
     * Sets the deleteVisionApplicationStatus
     * @param {NumberArray1D} deleteVisionApplicationStatus
     */
    p.setDeleteVisionApplicationStatus = function (status) {
        if ((status !== null) && (status.length === 3) && (this.getValidInfoOfStatus(status) === true)) {
            if (this.isCounterOfDeleteVisionApplicationIncremented(status) === true) {
                this.updateListOfVAsAndHMIVAName();
                this.settings.deleteVisionApplicationStatus = status;
            }
            this.setVisionApplicationIsDeleting(false);
        }
    };

    p.getModuleOk = function () {
        return this.settings.moduleOk;
    };

    /**
     * @method setModuleOk
     * Sets the modul ok
     * @param {Boolean} moduleOk
     */
    p.setModuleOk = function (moduleOk) {
        if (moduleOk === null) {
            return;
        }
        if(this.settings.moduleOk != moduleOk) {
            if (moduleOk === false) {
                this.widgetsHandling.onModuleNotOk();
            } else {
                this.widgetsHandling.onModuleOk();
            }
        }
        this.settings.moduleOk = moduleOk;
    };

    p.isCounterOfDeleteVisionApplicationIncremented = function (deleteVisionApplicationStatus) {
        var deleteVisionApplicationCounterInput, registeredCounterOfDeleteVisionApplication;

        deleteVisionApplicationCounterInput = deleteVisionApplicationStatus[0];
        registeredCounterOfDeleteVisionApplication = this.settings.deleteVisionApplicationStatus[0];

        if (deleteVisionApplicationCounterInput !== registeredCounterOfDeleteVisionApplication) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * @method getDeleteVisionApplicationStatus
     * Gets the deleteVisionApplicationStatus 
     * @param {NumberArray1D} deleteVisionApplicationStatus
     */
    p.getDeleteVisionApplicationStatus = function () {
        return this.settings.deleteVisionApplicationStatus;
    };

    /**
     * @method getSaveVisionApplicationStatus
     * Gets the saveVisionApplicationStatus 
     * @param {Integer} saveVisionApplicationStatus
     */
    p.getSaveVisionApplicationStatus = function () {
        return this.settings.saveVisionApplicationStatus;
    };

    /**
     * @method setImageAcquisitionSettingsUpdated    
     * Sets the imageAcquisitionSettingsUpdated
     * @param {String} imageAcquisitionSettingsUpdated
     */
    p.setImageAcquisitionSettingsUpdated = function (imageAcquisitionSettingsUpdated) {
        if (imageAcquisitionSettingsUpdated === null) {
            return;
        }
        this.settings.imageAcquisitionSettingsUpdated = imageAcquisitionSettingsUpdated;
        this.valueChangeImageAcquisitionSettingsUpdated.resolve();
    };

    p.onOpenImageSucceeded = function ( /*message*/ ) {
        this.openImageSucceeded.resolve();
    };

    p.initPromise = function () {
        var widget = this;
        this.valueChangeImageAcquisitionSettingsUpdated = $.Deferred();
        this.openImageSucceeded = $.Deferred();
        $.when(widget.openImageSucceeded.promise(), widget.valueChangeImageAcquisitionSettingsUpdated.promise()).then(function successHandler() {
            getImageAcquisitionSettingsAndInitPromise(widget);
        });
    };

    function getImageAcquisitionSettingsAndInitPromise(widget) {
        widget.getImageAcquisitionSettings();
        widget.initPromise();
        widget.setImageIsLoading(false);
        widget.setLastImageOfRepetitiveModeIsLoading(false);
        widget.updateButtonStates();
    }

    /**
     * @method getImageAcquisitionSettingsUpdated
     * Gets the imageAcquisitionSettingsUpdated  
     * @param {String} imageAcquisitionSettingsUpdated 
     */
    p.getImageAcquisitionSettingsUpdated = function () {
        return this.settings.imageAcquisitionSettingsUpdated;
    };

    p.roiModus = function (enable) {
        this.onEditButtonClick(enable);
    };

    p.isJSON = function (myTestStr) {
        var type = typeof (myTestStr);
        if (type === "object")
            return true;
        return false;
    };

    p._consoleEventsSocketOutput = function (logMessage) {
        //  console.warn("remove me");
    };

    p._consoleEventsSocketInput = function (logMessage) {
        //  console.warn("remove me");
    };

    p._consoleEvents = function (logMessage) {
        //  console.warn("remove me");
    };

    p.zoomReset = function () {
        this.smartControl.resetViewBox();
    };

    /**
     * @method onButtonClickPlay  
     */
    p.onButtonClickPlay = function () {
        this.executeVisionFunction();
    };

    p.executeVisionFunction = function () {
        var inputVariables,
            visionFunctionSelector,
            vpInputs = {},
            vpParameter = {},
            selectedVisionFunction = this.settings.visionFunctionInstance,
            parameters;
        this.beginTransactionExecute();
        this.deleteAllResultClouds();
        this.removeAllTeachTools();
        this.hideAllModelClouds();
        this.hideAllModelRois();
        this.deselectAllModels();

        visionFunctionSelector = this.getVisionFunctionSelector("until_selected");

        inputVariables = this.paramHandler.getVisionFunctionVariables();
        vpInputs = this.resetTestExecuteOfNotSelectedVisionFunctions(inputVariables);

        parameters = this.paramHandler.getVisionFunctionParameters();
        vpParameter[selectedVisionFunction] = parameters;

        this.vfInstanceExecuted = this.settings.visionFunctionInstance;
        this.vsEncoder.execute(visionFunctionSelector, vpInputs, vpParameter);
        this.widgetsHandling.setFilterResultsTab();
    };

    p.resetTestExecuteOfNotSelectedVisionFunctions = function (userInputs) {
        var vfIndex,
            firstIndex = 1,
            vpInputs = {},
            lastIndex = this.settings.visionFunctionInstance;

        for (vfIndex = firstIndex; vfIndex < lastIndex; vfIndex++) {
            vpInputs[vfIndex] = [{
                TestExecute: 0
            }];
        }
        vpInputs[lastIndex] = userInputs;
        return vpInputs;
    };

    p.getVisionFunctionSelector = function (mode) {
        var vfIndex, result = [],
            firstIndex = 1,
            lastIndex = this.settings.visionFunctionInstance;

        switch (mode) {
            case "until_selected":
                for (vfIndex = firstIndex; vfIndex <= lastIndex; vfIndex++) {
                    result.push(vfIndex);
                }
                break;
            case "selected_only":
                result = this.settings.visionFunctionInstance;
                break;
        }
        return result;
    };

    p.isSelectedModelFocused = function () {
        var focused = false,
            model = this.getSelectedModel();

        if (model && model.modelRoi) {
            focused = model.modelRoi.isSelected();
        }
        return focused;
    };

    p.setFocusOfSelectedModelRoi = function () {
        var model = this.getSelectedModel();
        if (model && model.modelRoi) {
            model.modelRoi.setSelected(true);
            this.updateToolList("ModelRoi", model.modelType);
        }
    };

    p.clearFocusOfModelRois = function (selected) {
        this.settings.vfModels.forEach(function (model) {
            if (model && model.modelRoi) {
                model.modelRoi.setSelected(selected);
            }
        });
    };

    p.onExecuteSucceeded = function (message) {
        var specificOutputs,
            outputs;

        if (message.param) {
            if (message.param.specific_output) {
                specificOutputs = message.param.specific_output;

                if (specificOutputs) {
                    this.vpRepository.setExecutionResult(message);
                    this.hideAllModelClouds();
                    outputs = specificOutputs[this.settings.visionFunctionInstance];
                    this.iconicDecoder.decodeExecuteResults(outputs);
                }
            }
        }
        this.resultFilter.executionError = false;
    };

    p.updateExecutionRoiVisibility = function () {
        if (this.getExecutionRoisVisibleMode() === true) {
            this.executionRoi.show();
        } else {
            this.executionRoi.hide();
        }
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

    /**
     * @method setSelectedModelType 
     * @param {String} name of the selected model type
     */
    p.setSelectedModelType = function (modelType) {
        if ((modelType !== this.settings.defaultModelType.value) && (modelType !== undefined)) {
            this.updateModelView();
            this.settings.selectedModelType = modelType;
            this.addModel(modelType);
            this.widgetsHandling.setDefaultValueOfModelType();
        }
    };

    /**
     * @method getSelectedModelType
     * @return {String} name of the selected model type
     */
    p.getSelectedModelType = function () {
        return this.settings.selectedModelType;
    };

    p.saveGlobalModel = function () {
        this.sendGlobalModel();
    };

    p.sendGlobalModel = function () {
        var modelNumber,
            modelType = "relation",
            modelParams,
            doSend = false;

        modelNumber = this.getGlobalModelNumber();

        this.globalModelHandling.updateGlobalModelFromViewModel();
        modelParams = this.getGlobalModelParams();
        if (this.validateGlobalModelParams(modelParams) === true) {
            doSend = true;
        } else {
            if (this.smartPanelGlobalModelList.getOperationCount() === 0) {
                modelParams = [];
                doSend = true;
            }
        }

        if (doSend === true) {
            this.vsEncoder.setGlobalModel(this.settings.visionFunctionName, modelNumber, modelType, modelParams);
        }
    };

    p.getGlobalModelNumber = function () {
        var globalModelNumber = 1,
            model = this.settings.vfGlobalModels.get(globalModelNumber);

        if (model === undefined) {
            globalModelNumber = 0;
        }
        return globalModelNumber;
    };

    p.validateGlobalModelParams = function (params) {
        var checkOk = true;

        if (Array.isArray(params[0].Operation)) {
            if (params[0].Operation.length === 0) {
                checkOk = false;
            }
        } else {
            if (params[0].Operation === "") {
                checkOk = false;
            }
        }

        if (Array.isArray(params[0].ModelReference)) {
            if (params[1].ModelReference.length === 0) {
                checkOk = false;
            } else if (params[0].ModelReference[0] === 0) {
                checkOk = false;
            }
        } else {
            if (params[0].ModelReference === "") {
                checkOk = false;
            } else {
                if (params[0].ModelReference === 0) {
                    checkOk = false;
                }
            }
        }

        if (Array.isArray(params[0].ModelTarget)) {
            if (params[1].ModelTarget.length === 0) {
                checkOk = false;
            }
        } else {
            if (params[0].ModelTarget === "") {
                checkOk = false;
            }
        }

        return checkOk;
    };

    p.deleteGlobalModel = function () {
        this.deleteSelectedGlobalModelEntry();
    };

    p.addModel = function (modelType) {
        this.smartPanelModelList.setSelectedModelLock(true);
        this.removeAllTeachTools();
        this.smartPanelModelList.addModel();
        this.smartPanelModelList.setMetaData(modelType);
        if (this.requiresModelRoi(modelType) === true) {
            this.addDefaultModelRoiToolAndActivateModelRoiEditMode(modelType);
        }
        else if (this.supportsMarker(modelType) === true) {
            this.setApplicationContext("edit_model_roi");
        }
        this.updateModelViewBySelectedModelType();
    };

    p.submitModel = function () {
        var vfModel,
            modelType,
            modelNumber = this.getSelectedModelId(),
            modelParameter = this.paramHandler.getVisionFunctionModels();

        if ((modelNumber === undefined) || (modelNumber === 0)) {
            return;
        }

        vfModel = this.settings.vfModels.get(modelNumber);
        if (vfModel === undefined) {
            modelType = this.settings.selectedModelType;
        } else {
            modelType = vfModel.modelType;
        }

        this.lastCenterPosition = this._getCenterPosition();

        if (!this.isModelTypeTeachable(modelType)) {
            this.smartPanelModelList.setMetaDataOfModel(modelNumber, modelType);
            this.smartPanelModelList.deSelectAll();
            this.smartPanelModelList.setModelToPersistedStatus(modelNumber);
            this.smartPanelModelList.setSelectedModelLock(false);
            this.updateButtonStates();
            return;
        }

        this.smartPanelModelList.setSelectedModelLock(true);
        this.vsEncoder.modifyModel(this.settings.visionFunctionName, modelNumber, modelParameter, modelType);
        this.smartPanelModelList.setMetaDataOfModel(modelNumber, "Submitting model...");
    };

    p.onSubmitModel = function (teachedModels) {
        var modelNumber,
            iterFirst;

        if (0 == teachedModels.length) {
            return;
        }

        iterFirst = teachedModels.keys();
        modelNumber = iterFirst.next().value;
        this.smartPanelModelList.setModelId(modelNumber);

        teachedModels.forEach(function (teachModel) {
            this.smartPanelModelList.setMetaDataOfModel(teachModel.modelNumber, teachModel.modelType);
            this.smartPanelModelList.setModelToPersistedStatus(teachModel.modelNumber);
        }, this);


        this.iconicDecoder.decodeTeachResults(teachedModels);
        this.smartPanelModelList.selectModel(modelNumber);

        this.updateModelView();
        this.closeModelRoiEditMode();
        this.smartPanelModelList.setSelectedModelLock(false);
        this.setStatusErrorModel(false);
        this.resetDirtyFlagOfChangedSubmitParameter();
    };

    p.onSubmitModelError = function (message) {
        this.setStatusErrorModel(true);
        this.smartPanelModelList.setMetaData("&lt;ErrorId&gt;");
    };

    /**
     * @method removeModel
     * Delete model 
     */
    p.removeModel = function () {
        var model, notPersistedModelId = 0;

        this.smartPanelModelList.setSelectedModelLock(true);

        if (this.isAnyModelSelected() === true) {
            model = this.getSelectedModel();
            if (model) {
                model.removing = true;
                this.vsEncoder.removeModel(this.settings.visionFunctionName, model.modelNumber, model.modelType);
            } else {
                this.smartPanelModelList.removeModel(notPersistedModelId);
                this.smartPanelModelList.deSelectAll();
                this.setStatusErrorModel(false);
            }
            this.removeAllTeachTools();

            this.deleteOrientationTool();

        }
        this.widgetsHandling.setEditButtonValueToOff();
        this.updateButtonStates();
        this.smartPanelModelList.setMetaDataOfModel(notPersistedModelId, "Removing model...");
        this.setStatusErrorModel(false);
    };

    p.onModelRemoveError = function (message) {
        var model, errorOutOfSync = 48137;

        if (message.meta) {
            if (message.meta.errorId === errorOutOfSync) {
                model = this.getSelectedModel();
                this.removeModelFromViewModel(model);
            }
        }
        this.smartPanelModelList.setSelectedModelLock(false);
    };

    p.onModelRemoveSucceeded = function (modelNumber) {
        var model;
        model = this.settings.vfModels.get(modelNumber);
        this.removeModelFromViewModel(model);
        this.smartPanelModelList.setSelectedModelLock(false);
    };

    p.removeModelFromViewModel = function (model) {
        if (model && model.removing === true) {
            if (model.parameters) {
                delete model.parameters;
            }
            this._deleteModelRoi(model.modelNumber);
            this._deleteModelCloud(model.modelNumber);
            this.smartPanelModelList.removeModel(model.modelNumber);
            this.settings.vfModels.delete(model.modelNumber);
            this.setStatusErrorModel(false);
            this.smartPanelModelList.deSelectAll();
            this.paramHandler.deleteListOfVisionFunctionModelParameters();

            if (this.vfCapabilities.has("GlobalModel")) {
                this.globalModelHandling.updateValueRangesAndVisibilityofGlobalModel();
            }
        }
    };

    p.decideTeachOrSubmitOrCancel = function () {
        var actionToTrigger,
            changedSubmitParam = false,
            changedTeachParam = false,
            changedModelRoi = false,
            model, modelId;

        model = this.getSelectedModel();
        if (model !== undefined) {
            if (model.removing === true) {
                actionToTrigger = "cancel";
                return actionToTrigger;
            }

            if (model.modelRoi) {
                changedModelRoi = model.modelRoi.getDirtyFlag();
            }
        }

        modelId = this.getSelectedModelId();
        if (modelId === 0) {
            changedModelRoi = true;
        }

        changedSubmitParam = this.getDirtyFlagOfChangedSubmitParameter();
        changedTeachParam = this.getDirtyFlagOfChangedTeachParameter();

        if (changedSubmitParam || changedTeachParam || changedModelRoi) {
            if ((changedSubmitParam === true) && (changedTeachParam === false) && (changedModelRoi === false)) {
                actionToTrigger = 'submit';
            } else {
                actionToTrigger = 'teach';
            }
        } else {
            actionToTrigger = "cancel";
        }
        return actionToTrigger;
    };

    p.teachOrSubmitAction = function () {
        switch (this.decideTeachOrSubmitOrCancel()) {
            case "teach":
                this.teachModel();
                break;
            case "submit":
                this.submitModel();
        }
        this.widgetsHandling.updateWidgetsStatus();
    };

    p.teachModel = function () {
        var vfModel,
            modelNumber = this.getSelectedModelId(),
            modelType = this.getModelTypeOfSelectedModel(),
            roiIconics = [],
            modelRois,
            modelRoi,
            markerPixel,
            pos,
            toolInstances = this.getToolInstancesOfModelType(modelType),
            modelParameter = this.paramHandler.getVisionFunctionModels();


        if (modelNumber === undefined) {
            return;
        }

        this.smartPanelModelList.setSelectedModelLock(true);
        this._deleteModelCloud(modelNumber);

        if ((this.supportsMarker(modelType) && (this.teachTools.length === 1))) {
            pos = this.teachTools[0].getCenterPosition();
            markerPixel = {
                "Marker": [
                    [{
                        "type": "region",
                        "x": [pos.x],
                        "y": [pos.y],
                    }]
                ]
            };
            modelParameter.push(markerPixel);

        } else if (this.supportsModelRoi(modelType)) {
            switch (toolInstances) {
                case "single":
                    if (this.teachTools.length > 0) {
                        roiIconics = this._createRoisFromSymbolTools([], this.teachTools);
                    } else {
                        vfModel = this.settings.vfModels.get(modelNumber);
                        if (vfModel && vfModel.modelRoi && (vfModel.modelRoi.isDataModelValid() === true)) {
                            modelRois = vfModel.modelRoi.getRois();
                            roiIconics = this._createRoisFromSymbolTools(modelRois, []);
                        }
                    }
                    break;

                case "multi":
                    vfModel = this.settings.vfModels.get(modelNumber);
                    if (vfModel && vfModel.modelRoi && (vfModel.modelRoi.isDataModelValid() === true)) {
                        modelRois = vfModel.modelRoi.getRois();
                        roiIconics = this._createRoisFromSymbolTools(modelRois, this.teachTools);
                    } else {
                        roiIconics = this._createRoisFromSymbolTools([], this.teachTools);
                    }
                    break;
            }

            if (roiIconics.length > 0) {
                modelRoi = {
                    "ModelRoi": [roiIconics]
                };
                modelParameter.push(modelRoi);
            }
        }

        if (this.requiresModelRoi(modelType) && (roiIconics.length <= 0)) {
            this.restartEditMode();
        } else {
            this.vsEncoder.teachModel(this.settings.visionFunctionName, modelNumber, modelParameter, modelType);
            this.smartPanelModelList.setMetaDataOfModel(modelNumber, "Teaching in progress...");
        }
    };

    p.restartEditMode = function () {
        this.showModelRoiOfSelectedModel();
        this.widgetsHandling.setEditButtonValueToOn();
        this.setStatusErrorModel(true);
    };

    p.teachSinglePixelTool = function (modelNumber, vfModel, modelType, modelParameter) {
        var pos, modelRoi;

        if (this.teachTools.length > 0) {
            pos = this.teachTools[0].getCenterPosition();

            modelRoi = {
                "ModelRoi": [
                    [{
                        "type": "region",
                        "x": [pos.x],
                        "y": [pos.y],
                    }]
                ]
            };

            modelParameter.push(modelRoi);
            this.vsEncoder.teachModel(this.settings.visionFunctionName, modelNumber, modelParameter, modelType);
        }
    };

    p.onTeachModel = function (teachedModels) {
        this.handleTeachedModels(teachedModels);
        this.setDirtyFlagOfSelectedModelRoi(false);
        this.closeModelRoiEditMode();
        this.smartPanelModelList.setSelectedModelLock(false);
        this.updateModelView();
        this.setStatusErrorModel(false);
        this.resetDirtyFlagOfChangedTeachParameter();
    };

    p.handleTeachedModels = function (teachedModels) {
        var modelNumber;

        if (0 == teachedModels.length) {
            return;
        }

        var iterFirst = teachedModels.keys();

        modelNumber = iterFirst.next().value;
        this.smartPanelModelList.setModelId(modelNumber);

        teachedModels.forEach(function (teachModel) {
            if (false === this.smartPanelModelList.doesModelIdExist(teachModel.modelNumber)) {
                this.smartPanelModelList.addModel(teachModel.modelNumber);
            }
            this.smartPanelModelList.setMetaDataOfModel(teachModel.modelNumber, teachModel.modelType);
            this.smartPanelModelList.setModelToPersistedStatus(teachModel.modelNumber);
        }, this);

        this.iconicDecoder.decodeTeachResults(teachedModels);
        this.smartPanelModelList.selectModel(modelNumber);
    };

    p.setStatusErrorModel = function (statusErrorModel) {
        this.settings.statusErrorModel = statusErrorModel;
    };

    p.getStatusErrorModel = function () {
        return (this.settings.statusErrorModel);
    };

    p.onTeachModelError = function (message) {
        this.setStatusErrorModel(true);
        this.smartPanelModelList.setMetaData("&lt;Error&gt;");
        this.widgetsHandling.setEditButtonValueToOn();
    };

    p.onGetGlobalModelsSucceeded = function (message) {
        this.globalModelHandling.updateGlobalModelList(message.param);
        this.smartPanelGlobalModelList.setSelectedModelLock(false);
        if (this.getVisionFuntionStartupSequenceStarted() === true) {
            this.paramHandler.updateParameterHandlerWithDataProviderOfRepository();
            this.setVisionFuntionStartupSequenceStarted(false);
        }
    };

    p.setInitializeROI = function (value) {
        this.settings.initializeROI = value;
    };

    p.getInitializeROI = function () {
        return this.settings.initializeROI;
    };

    p.decodeExecutionRoiIconics = function (roiIconics) {
        var drawSettings = this.colorSettings.executeRoiIconicsSettings,
            that = this;
        roiIconics.forEach(function (roiItems) {
            roiItems.forEach(function (roiItem) {
                that.executionRoi.decodeRoiItem(roiItem, drawSettings);
            });
        });
    };

    p.deleteAllRoiData = function () {
        this.settings.vfModels.forEach(function (model) {
            if (model && model.modelRoi) {
                model.modelRoi.deleteRoiData();
            }
        });
    };
    
    p.onROISucceeded = function (message) {
        var roiVector,
            executionRoiIconics,
            that = this;

        this.removeAllExecutionTools();
        this.executionRoi.deleteRoiData();

        if (message) {
            if (message.param !== undefined) {
                roiVector = message.param;

                if (roiVector[0]["ROI@Offset"].length === 0) {
                    this.setInitializeROI(false);
                } else
                    this.setInitializeROI(true);

                roiVector.forEach(function (roiItem) {
                    executionRoiIconics = roiItem["ROI@Offset"];
                    if (executionRoiIconics !== null) {
                        that.decodeExecutionRoiIconics(executionRoiIconics);
                    }
                });
                this.updateExecutionRoiVisibility();
                this.executionRoi.setDirtyFlag(false);
            }
        }
        if (this.getVisionFuntionStartupSequenceStarted() === true) {
            this.setInitialExecutionRoi();
            if ((this.vfCapabilities.has("ExecutionRoi") === true) || (this.getSelectedVisionFunction() === this.settings.imageAcquisitionName)) {
                this.setVisionFuntionStartupSequenceStarted(false);
            }
        } else {
            this.closeExecutionRoiEditMode();
        }
    };

    p.onROIError = function () {
        this.widgetsHandling.setEditButtonValueToOn();
    };

    p.onWebSocketCommandReceived = function () {
        this.updateButtonStates();
    };

    p.onOpenImageError = function ( /*message*/ ) {
        // probably used in future
    };

    p._getNumberOfPixelFromModelRois = function (modelRois) {
        var numberOfPixels = 0;
        modelRois.forEach(function (icon) {
            icon.forEach(function (roi) {
                numberOfPixels += roi.x.length;
            });
        });
        return numberOfPixels;
    };

    p.getToolInstancesOfModelType = function (modelType) {
        var toolInstances,
            modelTypes = this.vfCapabilities.get("ModelTypes");

        if (modelTypes) {
            modelTypes.forEach(function (item) {
                if (item.Name === modelType) {
                    if (item.Capabilities) {
                        item.Capabilities.forEach(function (capability) {
                            if (capability.Name === "ToolInstances") {
                                toolInstances = capability.Value;
                            }
                        });
                    }
                }
            });
        }
        return toolInstances;
    };

    p.getOrientationToolOfModelType = function (modelType) {
        var useOrientationTool = false,
            modelTypes = this.vfCapabilities.get("ModelTypes");

        if (modelTypes) {
            modelTypes.forEach(function (item) {
                if (item.Name === modelType) {
                    if (item.Capabilities) {
                        item.Capabilities.forEach(function (capability) {
                            if (capability.Name === "OrientationTool") {
                                if (capability.Value === "true") {
                                    useOrientationTool = true;
                                }
                            }
                        });
                    }
                }
            });
        }
        return useOrientationTool;
    };

    p.getTeachableOfSelectedModel = function () {
        var teachable = false,
            modelType = this.getModelTypeOfSelectedModel(),
            modelTypes = this.vfCapabilities.get("ModelTypes");

        if (modelTypes) {
            modelTypes.forEach(function (item) {
                if (item.Name === modelType) {
                    if (item.Teachable === "true") {
                        teachable = true;
                    }
                }
            });
        }
        return teachable;
    };

    p.showModelTeachResults = function (modelNumber) {
        var model,
            modelClouds,
            modelRoi;

        this.hideAllModelRois();
        this.hideAllModelClouds();

        if (modelNumber) {
            modelClouds = this.settings.modelClouds.get(modelNumber);
            if (modelClouds) {
                modelClouds.forEach(function (cloud) {
                    cloud.show();
                });
            }

            model = this.settings.vfModels.get(modelNumber);
            if (model) {
                modelRoi = model.modelRoi;
                if (modelRoi) {
                    modelRoi.show();
                }
            }
        }
    };

    p.showModelRoiOfSelectedModel = function () {
        var model = this.getSelectedModel();
        if (model && model.modelRoi) {
            model.modelRoi.show();
        }
    };

    p.showModelRoi = function (modelNumber) {
        this.settings.vfModels.forEach(function (model) {
            if (modelNumber === model.modelNumber) {
                if (model.modelRoi) {
                    model.modelRoi.show();
                } else {
                    model.modelRoi.hide();
                }
            }
        });
    };


    p.showAllModelRois = function () {
        this.settings.vfModels.forEach(function (model) {
            if (model.modelRoi) {
                model.modelRoi.show();
            }
        });
    };

    p.hideAllModelRois = function () {
        this.settings.vfModels.forEach(function (model) {
            if (model.modelRoi) {
                model.modelRoi.hide();
            }
        });
    };

    p.hideAllModelTeachResults = function () {
        this.hideAllModelClouds();
        this.hideAllModelRois();
    };

    p.showAllModelTeachResults = function () {
        this.showAllModelClouds();
        this.showAllModelRois();
    };

    p.hideAllModelClouds = function () {
        this.settings.modelClouds.forEach(function (model) {
            model.forEach(function (item) {
                item.hide();
            });
        });
    };

    p.showAllModelClouds = function () {
        this.settings.modelClouds.forEach(function (model) {
            model.forEach(function (item) {
                item.show();
            });
        });
    };

    p._hideAllRoisTools = function () {
        this.executionRoi.hide();

        this.executionTools.forEach(function (tool) {
            tool.hide();
        });
        this.teachTools.forEach(function (tool) {
            tool.hide();
        });
    };

    p.getExecutionRoisVisibleMode = function () {
        return ((this.settings.selectedVisionFunction != this.settings.imageAcquisitionName) &&
            (this.vfCapabilities.has("ExecutionRoi") === true));
    };

    p._showAllRoisTools = function () {
        if (this.getExecutionRoisVisibleMode() === true) {
            this.executionRoi.show();
            this.executionTools.forEach(function (tool) {
                tool.show();
            });
        }
        this.teachTools.forEach(function (tool) {
            tool.show();
        });
    };

    p.deleteAllModelClouds = function () {
        this.settings.modelClouds.forEach(function (model) {
            model.forEach(function (item) {
                item.dispose();
            });
        });
        this.settings.modelClouds.clear();
    };

    p.deleteAllModelRois = function () {
        this.settings.vfModels.forEach(function (model) {
            if (model && model.modelRoi) {
                model.modelRoi.dispose();
            }
        });
    };

    p._deleteModelRoi = function (modelNumber) {
        var model;
        model = this.settings.vfModels.get(modelNumber);
        if (model && model.modelRoi) {
            model.modelRoi.dispose();
        }
    };

    p._deleteModelCloud = function (modelNumber) {
        var items;

        items = this.settings.modelClouds.get(modelNumber);
        if (items) {
            items.forEach(function (item) {
                item.dispose();
            });
        }
        this.settings.modelClouds.delete(modelNumber);
    };

    p.deleteAllResultClouds = function () {
        var resultCloud = {};
        while (this.settings.resultClouds.length !== 0) {
            resultCloud = this.settings.resultClouds.pop();
            resultCloud.dispose();
        }
    };

    p.toolTypeToRoiSymbolTypeConverter = function (toolTypeFromConfigXml) {
        switch (toolTypeFromConfigXml) {
            case "crosshair":
                return this.RoiSymbolType.crosshair;
            case "rectangle":
                return this.RoiSymbolType.rectangle;
            case "ellipse":
                return this.RoiSymbolType.ellipse;
            case "ring":
                return this.RoiSymbolType.ellipseRing;
            case "freehand":
            case "eraser":
                return this.RoiSymbolType.freehand;
            default:
                console.log("Error: unexpected toolType ${toolTypeFromConfigXml}!");
                return undefined;
        }
    };

    p.toolOperationToRoiRoniConverter = function (toolOperationFromConfigXml) {
        switch (toolOperationFromConfigXml) {
            case "add":
                return "roi";
            case "remove":
                return "roni";
            default:
                console.log("Error: unexpected toolOperation ${toolOperationFromConfigXml}!");
                return undefined;
        }
    };



    p.calculateToolSizeAndPosition = function (toolConfigXmlEntry) {
        var toolSizeAndPosition = {},
            viewBox = this.smartControl.getViewBox();

        toolConfigXmlEntry.PositionFactor = isNaN(parseFloat(toolConfigXmlEntry.PositionFactor)) ? 0.5 : parseFloat(toolConfigXmlEntry.PositionFactor); //fallback horizontal and vertical center
        toolConfigXmlEntry.SizeFactor = isNaN(parseFloat(toolConfigXmlEntry.SizeFactor)) ? 0.33 : parseFloat(toolConfigXmlEntry.SizeFactor); //fallback 33% = 1/3 of viewBox height

        toolSizeAndPosition.x = viewBox[2] * toolConfigXmlEntry.PositionFactor + viewBox[0];
        toolSizeAndPosition.y = viewBox[3] * toolConfigXmlEntry.PositionFactor + viewBox[1];
        toolSizeAndPosition.height = viewBox[3] * toolConfigXmlEntry.SizeFactor;
        toolSizeAndPosition.width = toolConfigXmlEntry.SizeFactor < 1.0 ? toolSizeAndPosition.height : toolConfigXmlEntry.SizeFactor * viewBox[2]; // SizeFactor < 1 -> tool box has quadratic shape 

        return toolSizeAndPosition;
    };


    p.determineToolPropertiesFromConfigXml = function (toolConfigXmlEntry) {
        var toolProperties = {};

        toolProperties.toolType = this.toolTypeToRoiSymbolTypeConverter(toolConfigXmlEntry.Type);
        toolProperties.toolFunction = this.toolOperationToRoiRoniConverter(toolConfigXmlEntry.Operation);
        toolProperties.toolSizeAndPosition = this.calculateToolSizeAndPosition(toolConfigXmlEntry);
        toolProperties.angle = undefined; // angle could be specified in config.xml in future
        toolProperties.ringThickness = undefined; // ringThicknes could be specified in config.xml in future
        return toolProperties;
    };

    p.addDefaultExecutionRoiTool = function () {
        var toolListReference = this.getToolListReference(),
            toolList = this.toolLists.get(toolListReference),
            defaultToolConfigXmlEntry, defaultToolProperties;

        defaultToolConfigXmlEntry = toolList.find(function (tool) {
            return tool.Default === "true";
        });
        defaultToolProperties = this.determineToolPropertiesFromConfigXml(defaultToolConfigXmlEntry);

        this._addExecuteTool(defaultToolProperties.toolType, defaultToolProperties.toolFunction, defaultToolProperties.toolSizeAndPosition, defaultToolProperties.angle, defaultToolProperties.ringThickness);

        this.updateExecutionRoiSelectionState();
        this.widgetsHandling.updateWidgetsStatus();
    };


    p.addDefaultModelRoiTool = function (modelType) {
        var toolListReference = this.getToolListReference(modelType),
            toolList = this.toolLists.get(toolListReference),
            defaultToolConfigXmlEntry, defaultToolProperties;

        if (this.determineAddToolAllowed()) {
            defaultToolConfigXmlEntry = toolList.find(function (tool) {
                return tool.Default === "true";
            });
            defaultToolProperties = this.determineToolPropertiesFromConfigXml(defaultToolConfigXmlEntry);
            this._addTeachTool(defaultToolProperties.toolType, defaultToolProperties.toolFunction, defaultToolProperties.toolSizeAndPosition, defaultToolProperties.angle, defaultToolProperties.ringThickness);
        }
    };

    p.getModelType = function (modelTypeName) {
        var modType,
            modelTypes = this.vfCapabilities.get("ModelTypes");

        if (modelTypes) {
            modelTypes.forEach(function (modelType) {
                if (modelType.Name === modelTypeName) {
                    modType = modelType;
                }
            });
        }
        return modType;
    };

    p.doesAnyModelTypeSupportMarker = function () {
        var supportsMarker = false,
            markerValue,
            modelTypes = this.vfCapabilities.get("ModelTypes");
        if (modelTypes) {
            modelTypes.forEach(function (modelType) {
                markerValue = modelType.Marker;
                if ((markerValue === "optional") || (markerValue === "required")) {
                    supportsMarker = true;
                }
            });
        }
        return supportsMarker;
    };

    p.isModelTypeTeachable = function (modelTypeName) {
        var isTeachable = false,
            teachable = 'false',
            modelType = this.getModelType(modelTypeName);

        if (modelType) {
            teachable = modelType.Teachable;
            if (teachable === "true") {
                isTeachable = true;
            }
        }
        return isTeachable;
    };

    p.requiresMarker = function (modelTypeName) {
        var requiresMarker = false,
            marker,
            modelType = this.getModelType(modelTypeName);

        if (modelType) {
            marker = modelType.Marker;
            if (marker === "required") {
                requiresMarker = true;
            }
        }
        return requiresMarker;
    };

    p.supportsMarker = function (modelTypeName) {
        var supportsMarker = false,
            marker,
            modelType = this.getModelType(modelTypeName);

        if (modelType) {
            marker = modelType.Marker;
            if ((marker === "required") || (marker === "optional")) {
                supportsMarker = true;
            }
        }
        return supportsMarker;
    };

    p.requiresModelRoi = function (modelTypeName) {
        var requiresModelRoi = false,
            modelRoi,
            modelType = this.getModelType(modelTypeName);

        if (modelType) {
            modelRoi = modelType.ModelRoi;
            if (modelRoi === "required") {
                requiresModelRoi = true;
            }
        }
        return requiresModelRoi;
    };

    p.supportsModelRoi = function (modelTypeName) {
        var supportsModelRoi = false,
            modelRoi,
            modelType = this.getModelType(modelTypeName);

        if (modelType) {
            modelRoi = modelType.ModelRoi;
            if ((modelRoi === "required") || (modelRoi === "optional")) {
                supportsModelRoi = true;
            }
        }
        return supportsModelRoi;
    };

    p.determineAddToolAllowed = function () {
        var allow = false,
            toolInstances,
            modelType = this.getModelTypeOfSelectedModel();

        if (modelType) {
            toolInstances = this.getToolInstancesOfModelType(modelType);
            switch (toolInstances) {
                case "single":
                    if (this.teachTools.length === 0) {
                        allow = true;
                    }
                    break;

                case "multi":
                    allow = true;
                    break;
            }
        }
        return allow;
    };

    p.isModelSingleToolMode = function (model) {
        var mode = false;
        if (model && model.capabilities.supportedModelTools === "single") {
            mode = true;
        }
        return mode;
    };

    p.isModelMultiToolMode = function (model) {
        var mode = false;
        if (model && model.capabilities.supportedModelTools === "multi") {
            mode = true;
        }
        return mode;
    };

    p.addCrossHairTool = function () {
        if (this.teachTools.length === 0) {
            this._addTeachTool(this.RoiSymbolType.crosshair, "roi");
        }
    };

    p.addSymbolModelRoiTool = function (toolType, toolFunction) {
        var toolListReference, toolList, toolConfigXmlEntry, toolProperties, modelType;
        modelType = this.getModelTypeOfSelectedModel();
        toolListReference = this.getToolListReference(modelType);
        toolList = this.toolLists.get(toolListReference);
        toolConfigXmlEntry = toolList.find(function (tool) {
            return ((this.toolTypeToRoiSymbolTypeConverter(tool.Type) === toolType) && (this.toolOperationToRoiRoniConverter(tool.Operation) === toolFunction));
        }, this);
        toolProperties = this.determineToolPropertiesFromConfigXml(toolConfigXmlEntry);

        this._addTeachTool(toolProperties.toolType, toolProperties.toolFunction, toolProperties.toolSizeAndPosition, toolProperties.angle, toolProperties.ringThickness);
    };

    p.zoomIn = function () {
        this.smartControl.zoom(1 / this.settings.zoomFactor);
    };

    p.zoomOut = function () {
        this.smartControl.zoom(this.settings.zoomFactor);
    };

    p._addExecuteTool = function (symbolType, roiFunction, roiSize, angle, initialRingThickness) {
        var showOrientationTool = false,
            executeRoi;

        angle = (typeof angle !== 'undefined') ? angle : 0;


        switch (symbolType) {
            case this.RoiSymbolType.rectangle:
                executeRoi = new RectangleRoi("RectangleRoi",
                    this.smartControl,
                    this.selectionController,
                    roiSize,
                    this.imageSizes,
                    this.colorSettings.executeRoiToolColors,
                    showOrientationTool,
                    angle,
                    symbolType,
                    roiFunction);
                break;
            case this.RoiSymbolType.ellipse:
                executeRoi = new CircleRoi("CircleRoi",
                    this.smartControl,
                    this.selectionController,
                    roiSize,
                    this.imageSizes,
                    this.colorSettings.executeRoiToolColors,
                    showOrientationTool,
                    angle,
                    symbolType,
                    roiFunction);
                break;
            case this.RoiSymbolType.ellipseRing:
                initialRingThickness = (typeof initialRingThickness !== 'undefined') ? initialRingThickness : {
                    ringWidth: 0,
                    ringHeight: 0
                };
                executeRoi = new EllipseRing("EllipseRing",
                    this.smartControl,
                    this.selectionController,
                    roiSize,
                    initialRingThickness,
                    this.imageSizes,
                    this.colorSettings.executeRoiToolColors,
                    showOrientationTool,
                    angle,
                    symbolType,
                    roiFunction);
                break;
            case this.RoiSymbolType.freehand:
                executeRoi = new FreehandTool("FreehandTool",
                    this.smartControl,
                    this.imageSizes,
                    this.colorSettings.executeRoiToolColors,
                    symbolType,
                    roiFunction);
                break;
        }

        if (executeRoi) {
            this._initializeSymbolTool(executeRoi, this.executionTools);
        }
        return executeRoi;
    };

    p.removeAllTeachTools = function () {
        for (var i = 0; i < this.teachTools.length; i++) {
            this.teachTools[i].dispose();
        }
        this.teachTools = [];
    };

    p.removeAllExecutionTools = function () {
        for (var i = 0; i < this.executionTools.length; i++) {
            this.executionTools[i].dispose();
        }
        this.executionTools = [];
    };

    p.removeAllExecutionRois = function () {
        this.executionRoi.deleteRoiData();
    };

    p._imageSizeChanged = function () {
        var image = this.smartControl.renderer[0][0].getElementsByTagName("image")[0],
            fitSize = image.getBoundingClientRect();

        this.imageFitSizes = {
            x: 0,
            y: 0,
            width: fitSize.width,
            height: fitSize.height
        };
        this.imageSizes = {
            x: 0,
            y: 0,
            width: Math.floor(image.getAttribute("width")),
            height: Math.floor(image.getAttribute("height"))
        };
    };

    /**
     * @method removeRoi
     * @param {UInteger} index
     * @iatStudioExposed
     * Allows to delete a roi inside of this widget. The roi is identified by it's index. Index starts at zero.
     */
    p.removeRoi = function (index) {
        if (index < this.teachTools.length && index > -1) {
            this.teachTools[index].dispose();
            this.teachTools.splice(index, 1);
        } else {
            this._consoleEvents("Could not remove roi with index " + index + " because it does not exist.");
        }
    };

    p.isAnyCrosshairTeachToolDefined = function () {
        var defined = false;
        if (this.teachTools.length > 0) {
            this.teachTools.forEach(function (tool) {
                if (tool.className === 'CrosshairRoi') {
                    defined = true;
                }
            });
        }
        return defined;
    };

    /**
     * @method setVisionFunctionsRootDevice
     * sets the visionFunctionsRootDevice
     * @param {String} visionFunctionsRootDevice
     */
    p.setVisionFunctionsRootDevice = function (visionFunctionsRootDevice) {
        this.settings.visionFunctionsRootDevice = visionFunctionsRootDevice;
    };

    /**
     * @method getVisionFunctionsRootDevice
     * gets the visionFunctionsRootDevice
     * @return {String} visionFunctionsRootDevice
     */
    p.getVisionFunctionsRootDevice = function () {
        return this.settings.visionFunctionsRootDevice;
    };

    /**
     * @method setLoggerImagePathSuccess
     * sets the loggerImagePathSuccess
     * @param {String} loggerImagePathSuccess
     */
    p.setLoggerImagePathSuccess = function (loggerImagePathSuccess) {
        this.settings.loggerImagePathSuccess = loggerImagePathSuccess;
        this.sendValueChange({
            loggerImagePathSuccess: this.settings.loggerImagePathSuccess
        });
    };

    /**
     * @method getLoggerImagePathSuccess
     * gets the loggerImagePathSuccess
     * @return {String} loggerImagePathSuccess
     */
    p.getLoggerImagePathSuccess = function () {
        return this.settings.loggerImagePathSuccess;
    };


    /**
     * @method setIpAddress     
     * sets the visible ipAddress
     * @param {String} ipAddress The new ipAddress
     */
    p.setIpAddress = function (ipAddress) {
        this.settings.ipAddress = ipAddress;
    };

    p.setVisionApplicationName = function (visionApplicationName) {
        this.settings.visionApplicationName = visionApplicationName;
    };

    p.getVisionApplicationName = function () {
        return this.settings.visionApplicationName;
    };

    /**
     * @method getIpAddress
     * gets the visible ipAddress
     * @return {String} ipAddress
     */
    p.getIpAddress = function () {
        return this.settings.ipAddress;
    };

    /**
     * @method setVisionFunctionVariablesRefId
     * @param {String} id
     */
    p.setVisionFunctionVariablesRefId = function (id) {
        this.settings.visionFunctionVariablesRefId = id;
    };

    /**
     * @method getVisionFunctionVariablesRefId
     * @return {String} id
     */
    p.getVisionFunctionVariablesRefId = function () {
        return this.settings.visionFunctionVariablesRefId;
    };

    /** 
     * @method setVisionFunctionModelParameterRefId
     * @param {String} id
     */
    p.setVisionFunctionModelParameterRefId = function (id) {
        this.settings.visionFunctionModelParameterRefId = id;
    };

    /**
     * @method getVisionFunctionModelParameterRefId
     * @return {String} id
     */
    p.getVisionFunctionModelParameterRefId = function () {
        return this.settings.visionFunctionModelParameterRefId;
    };


    /**
     * @method setVisionFunctionConstantsRefId
     * @param {String} id
     */
    p.setVisionFunctionConstantsRefId = function (id) {
        this.settings.visionFunctionConstantsRefId = id;
    };

    /**
     * @method getVisionFunctionConstantsRefId
     * @return {String} id
     */
    p.getVisionFunctionConstantsRefId = function () {
        return this.settings.visionFunctionConstantsRefId;
    };

    /**
     * @method getRefIdButtonShowAllResults
     * @return {String} id
     */
    p.getRefIdButtonShowAllResults = function () {
        return this.settings.refIdButtonShowAllResults;
    };

    /**
     * @method setRefIdButtonShowAllResults 
     * @param {String} id
     */
    p.setRefIdButtonShowAllResults = function (id) {
        this.settings.refIdButtonShowAllResults = id;
    };

    /**
     * @method getRefIdButtonHideAllResults
     * @return {String} id
     */
    p.getRefIdButtonHideAllResults = function () {
        return this.settings.refIdButtonHideAllResults;
    };

    /**
     * @method setRefIdButtonHideAllResults 
     * @param {String} id
     */
    p.setRefIdButtonHideAllResults = function (id) {
        this.settings.refIdButtonHideAllResults = id;
    };


    /**
     * @method setRefIdButtonTeach 
     * @param {String} id
     */
    p.setRefIdButtonTeach = function (id) {
        this.settings.refIdButtonTeach = id;
    };

    /**
     * @method getRefIdButtonTeach
     * @return {String} id
     */
    p.getRefIdButtonTeach = function () {
        return this.settings.refIdButtonTeach;
    };


    /**
     * @method setRefIdNumericInputFilter
     * @param {String} id
     */
    p.setRefIdNumericInputFilter = function (id) {
        this.settings.refIdNumericInputFilter = id;
    };

    /**
     * @method getRefIdNumericInputFilter
     * @return {String} id
     */
    p.getRefIdNumericInputFilter = function () {
        return this.settings.refIdNumericInputFilter;
    };

    /**
     * @method setRefIdProcessVariablesFilter
     * @param {String} id
     */
    p.setRefIdProcessVariablesFilter = function (id) {
        this.settings.refIdProcessVariablesFilter = id;
    };

    /**
     * @method getRefIdProcessVariablesFilter
     * @return {String} id
     */
    p.getRefIdProcessVariablesFilter = function () {
        return this.settings.refIdProcessVariablesFilter;
    };


    /**
     * @method getRefIdGroupBoxGenericVisionFuntion
     * @return {String} id
     */
    p.getRefIdGroupBoxGenericVisionFuntion = function () {
        return this.settings.refIdGroupBoxGenericVisionFuntion;
    };

    /**
     * @method setRefIdGroupBoxGenericVisionFuntion
     * @param {String} id
     */
    p.setRefIdGroupBoxGenericVisionFuntion = function (id) {
        this.settings.refIdGroupBoxGenericVisionFuntion = id;
    };

    /**
     * @method getRefIdGroupBoxImageAcquisition
     * @return {String} id
     */
    p.getRefIdGroupBoxImageAcquisition = function () {
        return this.settings.refIdGroupBoxImageAcquisition;
    };

    /**
     * @method setRefIdGroupBoxImageAcquisition
     * @param {String} id
     */
    p.setRefIdGroupBoxImageAcquisition = function (id) {
        this.settings.refIdGroupBoxImageAcquisition = id;
    };

    /**
     * @method getRefIdGroupBoxVisionParameters
     * @return {String} id
     */
    p.getRefIdGroupBoxVisionParameters = function () {
        return this.settings.refIdGroupBoxVisionParameters;
    };

    /**
     * @method setRefIdGroupBoxVisionParameters
     * @param {String} id
     */
    p.setRefIdGroupBoxVisionParameters = function (id) {
        this.settings.refIdGroupBoxVisionParameters = id;
    };


    /**
     * @method setLightAndFocusRefId
     * @param {String} id
     */
    p.setLightAndFocusRefId = function (id) {
        this.settings.lightAndFocusRefId = id;
    };

    /**
     * @method getLightAndFocusRefId
     * @return {String} id
     */
    p.getLightAndFocusRefId = function () {
        return this.settings.lightAndFocusRefId;
    };


    /**
     * @method setExtendedParametersRefId
     * @param {String} id
     */
    p.setExtendedParametersRefId = function (id) {
        this.settings.extendedParametersRefId = id;
    };


    /**
     * @method getExtendedParametersRefId
     * @return {String} id
     */
    p.getExtendedParametersRefId = function () {
        return this.settings.extendedParametersRefId;
    };

    /**
     * @method getRefIdButtonDelete 
     * @return {String} id
     */
    p.getRefIdButtonDelete = function () {
        return this.settings.refIdButtonDelete;
    };

    /**
     * @method setVisionFunctionGlobalModel
     * @param {String} id
     */
    p.setVisionFunctionGlobalModel = function (id) {
        this.settings.visionFunctionGlobalModel = id;
    };

    /**
     * @method getVisionFunctionGlobalModel
     * @return {String} id
     */
    p.getVisionFunctionGlobalModel = function () {
        return this.settings.visionFunctionGlobalModel;
    };

    /**
     * @method setRefIdButtonDelete
     * @param {String} id
     */
    p.setRefIdButtonDelete = function (id) {
        this.settings.refIdButtonDelete = id;
    };

    /**
     * @method setVisionFunctionModelListRefId
     * @param {String} id
     */
    p.setVisionFunctionModelListRefId = function (id) {
        this.settings.visionFunctionModelListRefId = id;
    };

    /**
     * @method getVisionFunctionModelListRefId
     * @return {String} id
     */
    p.getVisionFunctionModelListRefId = function () {
        return this.settings.visionFunctionModelListRefId;
    };

    /**
     * @method setLineSensorNormalImageModeButtonRefId
     * @param {String} id
     */
    p.setLineSensorNormalImageModeButtonRefId = function (id) {
        this.settings.lineSensorNormalImageModeButtonRefId = id;
    };

    /**
     * @method getLineSensorNormalImageModeButtonRefId
     * @return {String} id
     */
    p.getLineSensorNormalImageModeButtonRefId = function () {
        return this.settings.lineSensorNormalImageModeButtonRefId;
    };

    /**
     * @method setVisionFunctionGlobalModelListRefId
     * @param {String} id
     */
    p.setVisionFunctionGlobalModelListRefId = function (id) {
        this.settings.visionFunctionGlobalModelListRefId = id;
    };

    /**
     * @method getVisionFunctionGlobalModelListRefId
     * @return {String} id
     */
    p.getVisionFunctionGlobalModelListRefId = function () {
        return this.settings.visionFunctionGlobalModelListRefId;
    };

    /**
     * @method setVisionImageAcquisitionSettingsRefId
     * @param {String} id
     */
    p.setVisionImageAcquisitionSettingsRefId = function (id) {
        this.settings.visionImageAcquisitionSettingsRefId = id;
    };

    /**
     * @method getVisionImageAcquisitionSettingsRefId
     * @return {String} id
     */
    p.getVisionImageAcquisitionSettingsRefId = function () {
        return this.settings.visionImageAcquisitionSettingsRefId;
    };

    /**
     * @method setVisionNormalImageParametersRefId
     * @param {String} id
     */
    p.setVisionNormalImageParametersRefId = function (id) {
        this.settings.visionNormalImageParametersRefId = id;
    };

    /**
     * @method getVisionNormalImageParametersRefId
     * @return {String} id
     */
    p.getVisionNormalImageParametersRefId = function () {
        return this.settings.visionNormalImageParametersRefId;
    };

    /**
     * @method setVisionLineSensorSettingsRefId
     * @param {String} id
     */
    p.setVisionLineSensorSettingsRefId = function (id) {
        this.settings.visionLineSensorSettingsRefId = id;
    };

    /**
     * @method getVisionLineSensorSettingsRefId
     * @return {String} id
     */
    p.getVisionLineSensorSettingsRefId = function () {
        return this.settings.visionLineSensorSettingsRefId;
    };

    /**
     * @method setImageAcquisitionVariablesRefId
     * @param {String} id
     */
    p.setImageAcquisitionVariablesRefId = function (id) {
        this.settings.imageAcquisitionVariablesRefId = id;
    };

    /**
     * @method getImageAcquisitionVariablesRefId
     * @return {String} id
     */
    p.getImageAcquisitionVariablesRefId = function () {
        return this.settings.imageAcquisitionVariablesRefId;
    };

    /**
     * @method getVisionFunctionName
     * @return {String} name of vision function
     */
    p.getVisionFunctionName = function () {
        return this.settings.visionFunctionName;
    };

    /**
     * @method setVisionFunctionName
     * @param {String} name of vision function
     * 
     * Note: This method is invoked by widget itself when receiving name of current active vision function
     */
    p.setVisionFunctionName = function (name) {
        if (name != undefined) {
            this.settings.visionFunctionName = name;
        }
    };

    p.setVisionProgramName = function (name) {
        if (name != undefined) {
            this.settings.visionProgramName = name;
            this.sendValueChange({
                visionProgramName: this.settings.visionProgramName
            });
        }
    };


    p.getVisionFunctionFeatures = function () {
        return this.vpDataProvider.getVisionFunctionFeatures(this.settings.visionFunctionInstance);
    };

    p.setVisionFunctionInstance = function (value) {
        if (value !== 0) {
            this.settings.visionFunctionInstance = value;
        }
    };

    p.getVisionFunctionInstance = function () {
        return (this.settings.visionFunctionInstance);
    };

    p.setVisionAplicationNavigation = function (visionFunctionsName) {
        this.navigationBetweenVisionFunctions.setDataProviderNavigationVisionApplication(visionFunctionsName);
    };

    p.getVisionAplicationNavigation = function () {
        return this.settings.visionAplicationNavigation;
    };

    /**
     * @method getDataProviderModelTypes
     * @return {String} string for the model types
     */
    p.getDataProviderModelTypes = function () {
        return this.settings.dataProviderModelTypes;
    };

    /**
     * @method setDataProviderModelTypes
     * @param {String} string for the model types
     */
    p.setDataProviderModelTypes = function (dataModelTypes) {
        var modelType = [],
            teachableModelTypes = [],
            modelTypeIndex;
        teachableModelTypes.push(this.settings.defaultModelType);
        for (modelTypeIndex = 0; modelTypeIndex < dataModelTypes.length; modelTypeIndex++) {
            if (dataModelTypes[modelTypeIndex].Teachable === "true") {
                modelType[modelTypeIndex] = {
                    "value": dataModelTypes[modelTypeIndex].name,
                    "text": dataModelTypes[modelTypeIndex].name
                };
                teachableModelTypes.push(modelType[modelTypeIndex]);
            }
        }

        this.settings.dataModelTypes = dataModelTypes;
        this.settings.dataProviderTeachableModelTypes = teachableModelTypes;
        this.settings.dataProviderModelTypes = this.settings.dataProviderTeachableModelTypes;
        this.widgetsHandling.setDataProviderOfModelType();
    };

    p.setDataProviderToolLists = function (toolLists) {
        this.toolLists = toolLists;

        // TODO: read toolLists Map
        this.settings.dataProviderRoiTools = [{
                'value': 'Tools',
                'text': 'Add tool'
            },
            {
                'value': 'rectangle+',
                'text': 'Rectangle+'
            }
        ];
        this.widgetsHandling.setRoiToolsDataProvider();
    };

    p.setCapabilityMetaInfoOperations = function (operations) {
        //TODO: add your code here please
        console.log(operations);
    };


    p.updateToolList = function (editMode, modelTypeName) {
        var toolLists = this.toolLists,
            toolList,
            toolType,
            toolOperation,
            dataProvider,
            toolDefault,
            entry,
            toolListReference;

        if (editMode === undefined) {
            if (this.applicationContext === "edit_execution_roi") {
                toolListReference = this.getToolListReference();
            } else if (this.applicationContext === "edit_model_roi") {
                modelTypeName = this.getModelTypeOfSelectedModel();
                toolListReference = this.getToolListReference(modelTypeName);
            }
        } else {
            if (editMode === "ExecutionRoi") {
                toolListReference = this.getToolListReference();
            } else {
                if (modelTypeName === undefined) {
                    modelTypeName = this.getModelTypeOfSelectedModel();
                }
                if (modelTypeName) {
                    toolListReference = this.getToolListReference(modelTypeName);
                }
            }
        }

        if (toolListReference) {
            toolList = toolLists.get(toolListReference);

            if (toolList) {
                dataProvider = [{
                    'value': 'tools',
                    'text': 'Tools',
                    'image': 'tools.png'
                }];

                toolList.forEach(function (tool) {
                    toolType = tool.Type;
                    toolOperation = tool.Operation;
                    toolDefault = tool.Default;

                    if ((toolType !== "freehand") && (toolType !== "eraser") && (toolType != "crosshair")) {
                        if (toolOperation === "add") {
                            toolType += "+";
                        } else if (toolOperation === "remove") {
                            toolType += "-";
                        }
                    }

                    entry = {
                        'value': toolType,
                        'text': toolType.charAt(0).toUpperCase() + toolType.slice(1) + (toolDefault ? " (d)" : ""),
                        'image': toolType + ".png"
                    };

                    if (((toolType === "freehand") && (this.paintMode === "paint")) || ((toolType === "eraser") && (this.paintMode === "erase"))) {
                        entry.image = toolType + "Off.png";
                    }

                    dataProvider.push(entry);
                }, this);

                if (this.compareDataPrividerRoiTools(this.settings.dataProviderRoiTools, dataProvider) === false) {
                    this.settings.dataProviderRoiTools = dataProvider;
                    this.widgetsHandling.setRoiToolsDataProvider();
                }
            }
        }
    };

    p.compareDataPrividerRoiTools = function (providerA, providerB) {
        var index, isSame = true;

        if (providerA.length != providerB.length) {
            isSame = false;
            return isSame;
        }

        for (index = 0; index < providerA.length; index++) {
            if (providerA[index].image != providerB[index].image) {
                isSame = false;
                break;
            }
        }
        return isSame;
    };

    p.getImageNameForFreehandEraserTool = function (toolType) {
        var imageName = toolType + ".png";

        switch (this.applicationContext) {
            case "edit_execution_roi":
                if (toolType === "freehand") {
                    if (this.getToolFocusStatus(this.executionTools, this.RoiSymbolType.freehand, "roi") === true) {
                        imageName = toolType + "Off.png";
                    }
                } else if (toolType === "eraser") {
                    if (this.getToolFocusStatus(this.executionTools, this.RoiSymbolType.freehand, "roni") === true) {
                        imageName = toolType + "Off.png";
                    }
                }
                break;
            case "edit_model_roi":
                if (toolType === "freehand") {
                    if (this.getToolFocusStatus(this.teachTools, "this.RoiSymbolType.freehand", "roi") === true) {
                        imageName = toolType + "Off.png";
                    }
                } else if (toolType === "eraser") {
                    if (this.getToolFocusStatus(this.teachTools, "this.RoiSymbolType.freehand", "roni") === true) {
                        imageName = toolType + "Off.png";
                    }
                }
                break;
        }
        return imageName;
    };

    p.getToolFocusStatus = function (toolList, symbolType, roiFunction) {
        var hasFocus = false;
        toolList.forEach(function (tool) {
            if (tool.getFocus && tool.getSymbolType && tool.getRoiFunction) {
                if ((tool.getFocus() === true) && (tool.getSymbolType() === symbolType) && (tool.getRoiFunction() === roiFunction)) {
                    hasFocus = true;
                }
            }
        });
        return hasFocus;
    };


    p.updateExecutionRoiToolList = function () {
        // TOD: Read from this.toolLists (source is config.xml) 
        this.settings.dataProviderRoiTools = [{
                'value': 'tools',
            },
            {
                'value': 'rectangle+',
            },
            {
                'value': 'ellipse+',
            },
            {
                'value': 'ring+',
            },
            {
                'value': 'freehand',
            },
            {
                'value': 'rectangle-',
            },
            {
                'value': 'ellipse-',
            },
            {
                'value': 'ring-',
            },
            {
                'value': 'eraser',
            },
        ];
        this.settings.dataProviderRoiTools.forEach(function (entry) {
            entry.text = entry.value.charAt(0).toUpperCase() + entry.value.slice(1);
            entry.image = entry.value + '.png';
        });
        this.widgetsHandling.setRoiToolsDataProvider();
    };

    p.setSelectedVisionFunction = function (name) {
        this.setVisionFunctionName(name);
        this.settings.selectedVisionFunction = name;
        this.statusGroupBoxes.updateGroupBoxesState();
        if (name === '') {
            this._hideAllRoisTools();
            this.hideAllResultClouds();
        } else {

            if (name === this.settings.imageAcquisitionName) {
                this.setIsSelectedImageAcquisition(true);
                this._hideAllRoisTools();
                this.deleteOrientationTool();
                this.hideAllResultClouds();
                if (this.vfCapabilities.has("Models")) {
                    this.smartPanelModelList.deSelectAll();
                }
            } else {
                this.setIsSelectedImageAcquisition(false);
                this._showAllRoisTools();
                this.deleteOrientationTool();
                this.deleteAllResultClouds();
                this.resetAndCleanupAfterSelectedVF();
            }
            this.stopRepetitiveMode();
        }
    };

    p.getSelectedVisionFunction = function () {
        return this.settings.selectedVisionFunction;
    };

    /**
     * @method setSelectedImage
     * @param {String} selectedImage
     */
    p.setSelectedImage = function (selectedImage) {
        this.settings.selectedImage = selectedImage;
    };

    /**
     * @method getSelectedImage
     * @return {String} selectedImage
     */
    p.getSelectedImage = function () {
        return this.settings.selectedImage;
    };

    /**
     * @method setVisionFunctionsRootPath
     * @param {String} visionFunctionsRootPath
     */
    p.setVisionFunctionsRootPath = function (visionFunctionsRootPath) {
        this.settings.visionFunctionsRootPath = visionFunctionsRootPath;
    };

    /**
     * @method getVisionFunctionsRootPath
     * @return {String} visionFunctionsRootPath
     */
    p.getVisionFunctionsRootPath = function () {
        return this.settings.visionFunctionsRootPath;
    };

    /**
     * @method setVisionFunctionSubPath
     * @param {String} visionFunctionSubPath
     */
    p.setVisionFunctionSubPath = function (visionFunctionSubPath) {
        this.settings.visionFunctionSubPath = visionFunctionSubPath;
    };

    /**
     * @method getVisionFunctionSubPath
     * @return {String} visionFunctionSubPath
     */
    p.getVisionFunctionSubPath = function () {
        return this.settings.visionFunctionSubPath;
    };

    /**
     * @method setExecutionRoiVisible
     * @param {Boolean} visible
     */
    p.setExecutionRoiVisible = function (visible) {

        if (visible === false) {
            this.executionRoi.hide();
        } else {
            if (this.getExecutionRoisVisibleMode() === true) {
                this.executionRoi.show();
            }
        }
        this.sendValueChange({
            executionRoiVisible: this.vfCapabilities.has("ExecutionRoi")
        });
    };

    /**
     * @method getExecutionRoiVisible
     * @return {Boolean} executionRoiVisible 
     */
    p.getExecutionRoiVisible = function () {
        return this.vfCapabilities.has("ExecutionRoi");
    };

    /**
     * @method setEditModelsTabVisible
     * @param {Boolean} visible
     */
    p.setEditModelsTabVisible = function (visible) {
        this.settings.editModelsTabVisible = visible;
        if (this.isUnitTestEnviroment() !== true) {
            this._callExternalWidget(this.settings.parentContentId + '_' + this.settings.refIdTabItemModels, 'setVisible', visible); 
        }
    };

    /**
     * @method getEditModelsTabVisible
     * @return {Boolean} editModelsTabVisible 
     */
    p.getEditModelsTabVisible = function () {
        return this.settings.editModelsTabVisible;
    };

    /**
     * @method setShowOnlyOneTabForAVisionFuntionTab
     * @param {Boolean} visible
     */
    p.setShowOnlyOneTabForAVisionFuntionTab = function (visible) {
        this.settings.showOnlyOneTabForAVisionFuntionTab = visible;
        if (this.isUnitTestEnviroment() !== true) {
            this._callExternalWidget(this.settings.parentContentId + '_' + this.settings.refIdSimulateOnlyOneTabForAVisionFuntion, 'setVisible', visible); 
        }
    };

    /**
     * @method getShowOnlyOneTabForAVisionFuntionTab
     * @return {Boolean} showOnlyOneTabForAVisionFuntionTab 
     */
    p.getShowOnlyOneTabForAVisionFuntionTab = function () {
        return this.settings.showOnlyOneTabForAVisionFuntionTab;
    };


    /**
     * @method loadImage
     * @iatStudioExposed
     * Load image 
     */
    p.loadImage = function () {
        var type, quality, keepSync = false;
        if (this.vpRepository.getDefaultValueOfOutputProcessVariables() !== undefined) {
            this.vpRepository.setExecutionResult(0);
            this.resultFilter.resetSelectorList();
            this.resultFilter.resetResultFilter();
        }
        this.setImageIsLoading(true);
        this.hideAllModelRois();
        this.deleteAllResultClouds();
        this.deleteAllModelClouds();
        this.deselectAllModels();

        if (this.settings.offlineMode) {
            this.settings.imagePath = this.settings.visionFunctionsRootPath +
                '/' +
                this.settings.visionFunctionSubPath +
                '/Images/' +
                this.settings.selectedImage;
        }


        keepSync = this.initialImageLoaded;

        if (this._isImageCompressionDisabledDueToASmallImage()) {
            this.vsEncoder.openImage(this.settings.imagePath, 'bmp', quality, keepSync);
        } else {
            type = this.settings.repetitiveModeSkipParameterUpdate ? this.settings.imageTpye.repetitiveCapture : this.settings.imageTpye.singleCapture;
            quality = this.settings.repetitiveModeSkipParameterUpdate ? this.settings.imageQuality.repetitiveCapture : this.settings.imageQuality.singleCapture;
            this.vsEncoder.openImage(this.settings.imagePath, type, quality, keepSync);
        }
        this.pipette.resetValues();
        this.vfInstanceExecuted = 0;
    };


    p._isImageCompressionDisabledDueToASmallImage = function () {
        var compValue;
        if (this.settings.activatedLinesensor && (!this.getIAParameters().isLinesensorNormalImageMode)) {
            compValue = this.getIAParameters().LineHeight * this.getIAParameters().LinesPerImage;
        } else {
            compValue = this.settings.imageHeight;
        }
        return compValue < this.settings.lowestImageHeightWithCompression;
    };

    p.getEditMode = function () {
        return this.settings.editMode;
    };

    p.onEditButtonClick = function (value) {
        if (value === false) {
            this.startProcessToDeactivateEditMode();
        } else {
            this.activateEditMode();
        }
    };

    p.startProcessToDeactivateEditMode = function () {
        if (this.applicationContext === "edit_execution_roi") {
            if (this.executionRoi.getDirtyFlag() === true) {
                this.saveExecutionRois();
            } else {
                this.closeExecutionRoiEditMode();
            }
        } else if (this.applicationContext === "edit_model_roi") {
            if (this.decideTeachOrSubmitOrCancel() === "cancel") {
                this.closeModelRoiEditMode();
            } else {
                this.teachOrSubmitAction();
            }
        }
    };

    p.saveExecutionRois = function () {
        this._sendRoiCommand();
    };

    p.closeExecutionRoiEditMode = function () {
        // ROI command was sucessfully responded - close edit execution roi edit mode
        this.removeAllExecutionTools();
        this.deselectExecutionRoi();
        this.setEditMode(false);
        this.widgetsHandling.updateWidgetsStatus();
        this.updateOrientationTool();
    };

    p.closeModelRoiEditMode = function () {
        // Teach command was sucessfully reponded - close edit execution roi edit mode
        this.removeAllTeachTools();
        this.deselectModelRois();
        this.smartPanelModelList.setSelectedModelLock(false);
        this.setEditMode(false);
        this.widgetsHandling.updateWidgetsStatus();
    };

    p.activateExecutionRoiEditMode = function () {
        this.applicationContext = "edit_execution_roi";
        this.updateToolList("ExecutionRoi");
        this.executionRoi.setSelected(true);
        this.executionRoi.redraw();
        this.updateOrientationTool();
        this.setEditMode(true);
    };

    p.addDefaultModelRoiToolAndActivateModelRoiEditMode = function (modelType) {
        this.applicationContext = "edit_model_roi";
        this.updateToolList("ModelRoi", modelType);
        this.addDefaultModelRoiTool(modelType);
        this.updateOrientationTool(modelType);
        this.setFocusOfSelectedModelRoi();
        this.setEditMode(true);
    };

    p.activateModelRoiEditMode = function () {
        var modelType = this.getModelTypeOfSelectedModel();
        this.applicationContext = "edit_model_roi";
        this.smartPanelModelList.setSelectedModelLock(true);
        this.updateToolList("ModelRoi", modelType);
        this.addMarkerOrModelRoiTool(modelType);
        this.updateOrientationTool(modelType);
        this.setFocusOfSelectedModelRoi();
        this.setEditMode(true);
    };

    p.addMarkerOrModelRoiTool = function (modelType) {
        var isNewModel = this.selectedModelId === 0 ? true : false;

        if (isNewModel === true) {
            if (this.supportsModelRoi(modelType)) {
                this.addDefaultModelRoiTool(modelType);
            }
        }

        if (this.supportsMarker(modelType)) {
            this.addCrossHairTool();
            this.setDirtyFlagOfChangedTeachParameter(this.settings.accessAttributForTeach);
        }
    };



    p.activateEditMode = function () {
        if (this.isSelectedVfModelTabVisionFunctionPage()) {
            this.activateExecutionRoiEditMode();
        } else if (this.isSelectedVfModelTabEditModelsPage()) {
            this.activateModelRoiEditMode();
        }
        this.widgetsHandling.updateWidgetsStatus();
    };

    p.deactivateEditMode = function (applicationContext) {
        this.removeAllExecutionTools();
        this.removeAllTeachTools();
        this.executionRoi.setSelected(false);
        this.deselectModelRois();
        this.clearFocusOfModelRois();
        this.toolsClipboard = [];
        this.pasteCount = 0;

        if (applicationContext === "edit_execution_roi") {
            this.executionRoi.showServerRoi();
            this.executionRoi.redraw();
        } else if (applicationContext === "edit_model_roi") {
            this.showModelRoiOfSelectedModel();
        }
        this.setEditMode(false);
        this.widgetsHandling.updateWidgetsStatus();
    };

    p.setEditMode = function (editMode) {
        this.settings.editMode = editMode;
        this.clearToolsClipboard();
        this.updateApplicationContext();
        this.paintMode = "off";
        if (editMode === false) {
            this.widgetsHandling.setEditButtonValue(0);
        } else {
            this.widgetsHandling.setEditButtonValue(1);
            this.widgetsHandling.setVisionRoiTab();
        }
        this.updateButtonStates();
    };

    p.clearToolsClipboard = function () {
        this.toolsClipboard = [];
    };

    p.persistVisionApplication = function () {
        this._callOpcUaMethod('PersistVisionApplication');
        this.setVisionApplicationIsSaving(true);
    };

    /**
     * @method triggerToggle
     * Triggers the imageAcquisition and opens the image
     */
    p.triggerToggle = function () {
        this.isWaitingForImageCommandAck = true;
        this.loadImage();
    };

    p.resetAndCleanupAfterSelectedVF = function () {
        this.resetSelectedModelId();
        this.deselectAllModels();
        this.deleteAllModelRois();
        this.deleteAllModelClouds();
        this.deleteAllResultClouds();
        this.removeAllTeachTools();
        this.deleteOrientationTool();
        this.clearMaps();
        this.globalModelHandling.setGlobalModelInitialized(false);
        this.widgetsHandling.setVisionFuntionTab();
        this.vpDataProvider.setUserDefinedParameterMode(undefined);
    };

    p.clearMaps = function () {
        this.settings.vfModels.clear();
        this.vfCapabilities.clear();
        this.settings.defaultModelParameters.clear();
        this.settings.defaultGlobalModelParameters.clear();
        this.settings.modelClouds.clear();
        this.settings.vfGlobalModels.clear();
    };

    p.resetAndCleanupAfterSocketOpen = function () {
        this.hmiStatus.isImageRequestTriggeredAfterConnect = false;
        this.isWaitingForImageCommandAck = false;
        this.settings.counterSocketErrors = 0;
        this.settings.offlineMode = undefined;
        this.setVisionFunctionName("");
        this.setInitialComplete(false);
        this.paramHandler.reset();
        this.widgetsHandling.setVisionFuntionImageAcquisition();
    };

    p.onSocketOpen = function () {
        this._callExternalWidget(this.settings.parentContentId + '_' + this.settings.refIdtextOutputOverlay, 'setVisible', false); 
        this.resetAndCleanupAfterSocketOpen();
        this.vsEncoder.getState();
    };

    //called when socket handler is giving up
    p.onSocketReconnectFailure = function () {
        this._callExternalWidget(this.settings.parentContentId + '_' + this.settings.refIdtextOutputOverlay, 'setVisible', true);
        this._callExternalWidget(this.settings.parentContentId + '_' + this.settings.refIdtextOutputOverlay, 'setValue', this.settings.textForOverlayIfConnectionIsFailure);
    };

    p.deselectAllModels = function () {
        if (this.vfCapabilities.has("Models") && this.smartPanelModelList) {
            this.smartPanelModelList.deSelectAll();
        }
    };

    p.getVAConfiguration = function () {
        this._callOpcUaMethod('GetVAConfiguration', undefined, 'decideToShowOverwriteApplicationDialogAndPersistApplication');
    };

    p.checkIfHmiVaIsMachineVa = function (configuration) {
        var objConfiguration = JSON.parse(configuration.arguments.Configuration);
        if (objConfiguration.VisionApplication.Name === objConfiguration.HmiVisionApplicationName) {
            return true;
        } else {
            return false;
        }
    };

    p.decideToShowOverwriteApplicationDialogAndPersistApplication = function (configuration) {
        if (this.checkIfHmiVaIsMachineVa(configuration) === true) {
            this.confirmationDialog.showOverwriteActiveVisionApplicationDialog();
        } else {
            this.persistVisionApplication();
        }
    };

    p.getCameraIPAddress = function () {
        this._callOpcUaMethod('GetVAConfiguration', undefined, '_readVAConfiguration');
    };

    p._readVAConfiguration = function (configuration) {
        var objConfiguration;
        if (configuration.arguments) {
            objConfiguration = JSON.parse(configuration.arguments.Configuration);
            this.vpRepository.setVisionApplicationConfiguration(objConfiguration);
            if ((objConfiguration) && (configuration.status.code === 0)) {
                this.setVisionApplicationName(objConfiguration.VisionApplication.Name);
                this.setVisionFunctionsRootDevice(objConfiguration.VISION_FILEDEVICE);
                this._loadImageAcquisitionConfig();
                this.setVisionFunctionSubPath();
                this.setIpAddress(objConfiguration.IPAddress);
                this.setHmiVisionApplicationName(configuration);
            }
        }
    };

    p.getImageAcquisitionSettings = function () {
        this._callOpcUaMethod('GetImageAcquisitionSettings', undefined, '_setImageAcquisitionSettingsInHMI');
    };

    p._setImageAcquisitionSettingsInHMI = function (configuration) {
        var parameters, variables;

        if (configuration.arguments) {
            parameters = JSON.parse(configuration.arguments.Parameters);
            variables = JSON.parse(configuration.arguments.Variables);
            if ((parameters) && (variables) && (configuration.status.code === 0) && (this.imageAcquisitionParamHandler.getIAParameterInitialized() === true)) {
                this.settings.imageHeight = parameters.ImageHeight;
                this.setActivatedLinesensor(parameters.Linesensor);
                this.widgetsHandling.updateWidgetsStatus();
                this.imageAcquisitionParamHandler.updateParameterFormWidget(parameters, this.settings.visionImageAcquisitionSettingsRefId);
                this.imageAcquisitionParamHandler.updateParameterFormWidget(parameters, this.settings.visionNormalImageParametersRefId);
                this.imageAcquisitionParamHandler.updateParameterFormWidget(parameters, this.settings.visionLineSensorSettingsRefId);
                this.imageAcquisitionParamHandler.updateParameterFormWidget(variables, this.settings.lightAndFocusRefId);
                this.imageAcquisitionParamHandler.updateParameterFormWidget(variables, this.settings.extendedParametersRefId);
                if (parameters.Linesensor === true) {
                    this.imageAcquisitionParamHandler.setLineSensorNormalImageMode(this.settings.lineSensorNormalImageModeButtonRefId, parameters.isLinesensorNormalImageMode);
                }
            }
        }
    };

    p.updateExternalWidgets = function () {
        var hasGlobalModel = this.vfCapabilities.has("GlobalModel"),
            hasExecutionRoi = this.vfCapabilities.has("ExecutionRoi");

        this.widgetsHandling.updateWidgetsStatus();
        this.setExecutionRoiVisible(hasExecutionRoi);
        this.globalModelHandling.setVisibleOfGroupBoxGlobaleModel(hasGlobalModel); 
    };

    /**
     * @method saveConfigurationToFile
     * @iatStudioExposed
     * Download the current parameter configuration as a file
     */
    p.saveConfigurationToFile = function () {
        var parameters = this._callExternalWidget(this.settings.parentContentId + '_' + this.settings.visionFunctionParametersRefId, 'getData'),
            constants = this._callExternalWidget(this.settings.parentContentId + '_' + this.settings.visionFunctionConstantsRefId, 'getData'),
            variables = this._callExternalWidget(this.settings.parentContentId + '_' + this.settings.visionFunctionVariablesRefId, 'getData'),
            fileContent = {
                parameters: parameters,
                constants: constants,
                variables: variables
            };
        DownloadHandler.sendFileToClient("configuration.json", JSON.stringify(fileContent, null, 2));
    };

    p.onButtonValueChangeEditMarker = function (evt) {
        this.onEditButtonClick(evt.detail.newValueBool);
    };

    p._callExternalWidget = function () {
        if (this.isUnitTestEnviroment() === false) {
            return brease.callWidget.apply(this, arguments);
        } else {
            return window.fakeWidgetCaller();
        }
    };

    p.addRleEncodedRoiToIconics = function (iconics, rleEncodedBlob, operation) {
        if (operation === undefined) {
            iconics.push({
                "type": "region",
                "format": "region_rle",
                "x1": rleEncodedBlob.x1,
                "x2": rleEncodedBlob.x2,
                "y": rleEncodedBlob.y,
            });
        } else {
            iconics.push({
                "type": "region",
                "format": "region_rle",
                "x1": rleEncodedBlob.x1,
                "x2": rleEncodedBlob.x2,
                "y": rleEncodedBlob.y,
                "operation": operation
            });
        }
    };

    p.addPolygonRoiToIconics = function (iconics, polygonBlob, operation) {
        if (operation === undefined) {
            iconics.push({
                "type": "region",
                "format": "xld_poly",
                "x": polygonBlob.x,
                "y": polygonBlob.y,
            });
        } else {
            iconics.push({
                "type": "region",
                "format": "xld_poly",
                "x": polygonBlob.x,
                "y": polygonBlob.y,
                "operation": operation
            });
        }
    };

    p._createRoisFromSymbolTools = function (rois, tools) {
        var iconics = [],
            that = this,
            polygon,
            pixels,
            blob,
            rleEncodedBlob;

        if (rois) {
            rois.forEach(function (roi) {
                blob = roi.getBlob();

                if ((blob.type === 'xld_cont') || ((blob.type === 'region') && (blob.format === 'xld_poly'))) {
                    iconics.push({
                        "type": "region",
                        "format": "xld_poly",
                        "x": blob.x,
                        "y": blob.y,
                    });
                } else if ((blob.type === 'region') || ((blob.type === 'region') && (blob.format === 'region_rle'))) {
                    iconics.push({
                        "type": "region",
                        "format": "region_rle",
                        "x1": blob.x1,
                        "x2": blob.x2,
                        "y": blob.y,
                    });
                }
            });
        }

        tools.forEach(function (tool) {
            if (tool.getPixels) {
                pixels = tool.getPixels();
                if (pixels.x.length > 0) {
                    rleEncodedBlob = that.vsEncoder.getRLEEncoding(pixels);

                    if (iconics.length === 0) {
                        if (tool.roiFunction === "roi") {
                            that.addRleEncodedRoiToIconics(iconics, rleEncodedBlob);
                        } else {
                            that.addRleEncodedRoiToIconics(iconics, rleEncodedBlob, "remove");
                        }
                    } else {
                        if (tool.roiFunction === "roi") {
                            that.addRleEncodedRoiToIconics(iconics, rleEncodedBlob, "add");
                        } else if (tool.roiFunction === "roni") {
                            that.addRleEncodedRoiToIconics(iconics, rleEncodedBlob, "remove");
                        }
                    }
                }
            } else if (tool.getXldPolygon) {
                polygon = tool.getXldPolygon();

                if (iconics.length === 0) {
                    if (tool.roiFunction === "roi") {
                        that.addPolygonRoiToIconics(iconics, polygon);
                    } else {
                        that.addPolygonRoiToIconics(iconics, polygon, "remove");
                    }
                } else {

                    if (tool.roiFunction === "roi") {
                        that.addPolygonRoiToIconics(iconics, polygon, "add");
                    } else if (tool.roiFunction === "roni") {
                        that.addPolygonRoiToIconics(iconics, polygon, "remove");
                    }
                }
            }
        });

        return iconics;
    };

    p._sendRoiCommand = function () {
        var iconics;
        if (this.executionRoi.isDataModelValid() === true) {
            iconics = this._createRoisFromSymbolTools(this.executionRoi.getRois(), this.executionTools);
        } else {
            iconics = this._createRoisFromSymbolTools([], this.executionTools);
        }
        if (iconics.length > 0) {
            this.vsEncoder.setRois(this.settings.visionFunctionName, [iconics]);
        } else {
            this.widgetsHandling.setEditButtonValueToOn();
        }
    };

    p.updateCapabilities = function (vfConfigXml) {
        this.capabilityReader.readCapabilitiesFromXmlDoc(vfConfigXml);
        this.vfCapabilities = this.capabilityReader.getVisionFunctionCapabilities();
        this.toolListMap = this.capabilityReader.getToolListMap();
        this.operationsMap = this.capabilityReader.getOperationsMap();
        this.setDataProviderToolLists(this.toolListMap);
        this.globalModelHandling.setCapabilityMetaInfoOperations(this.operationsMap);
    };

    p._loadVisionFunctionSuccessHandler = function (vfConfigXml) {
        var visionProgramPath;
        if (vfConfigXml !== '') {
            this._consoleEvents("VisionFunction -> " + vfConfigXml.getElementsByTagName("VisionFunction")[0].attributes.Version.name + ': ' + vfConfigXml.getElementsByTagName("VisionFunction")[0].attributes.Version.value);
        }
        if (this.settings.offlineMode) {
            visionProgramPath = this.settings.visionFunctionsRootPath + '\\VP';
            this.vsEncoder.initVisionProgram(visionProgramPath);
        }

        this.updateCapabilities(vfConfigXml);
        this.adjustHeightOfWidgets();
        this.widgetsHandling.updateWidgetsStatus();
        this.setEditModelsTabVisible(this.vfCapabilities.has("Models"));
        this.setShowOnlyOneTabForAVisionFuntionTab(!this.vfCapabilities.has("Models"));
        this.widgetsHandling.updateDataProviderForSortProcessVariables();

    };

    p._loadVisionFunction = function () {
        var context = this,
            url,
            visionFunctionType;
        visionFunctionType = this.vpDataProvider.getVisionFunctionType(this.settings.visionFunctionInstance);
        url = '/FileDevice:' + this.settings.visionFunctionsRootDevice + '/widget/' + visionFunctionType + '/template-config.xml';
        $.ajax({
            url: url,
            success: function (vfConfigXml) {
                context.configFileVisionFunctionLoaded.resolve(vfConfigXml);
            }
        });
    };

    p._loadImageAcquisitionConfig = function () {
        var context = this,
            url;

        url = '/FileDevice:' + this.settings.visionFunctionsRootDevice + '/Widget/' + this.settings.visionComponentReference + '/iaconfig.xml';

        $.ajax({
            url: url,
            success: function (imageAcquisitionConfigXml) {
                context.imageAcquisitionParamHandler.initImageAcquisition(imageAcquisitionConfigXml.documentElement);
                context.getImageAcquisitionSettings();
                context.configFileImageAcquisitionLoaded.resolve();
            }
        });
    };

    p.validNewNameOfVisionApplicationInViCore = function (valid) {
        this.saveAsDialogHandling.validNewNameOfVisionApplicationInViCore(valid);
    };

    p._callOpcUaMethod = function (methodName, args, resultHandler) {
        var objectId, methodId;
        if (this.settings.visionComponentReference === '') {
            this._consoleEvents("Error: no visionComponentReference set");
            return;
        }
        objectId = '"urn:B&R/Diagnosis/mappCockpit"|String|' + this.settings.visionComponentReference + '.MethodSet';
        methodId = '"urn:B&R/Diagnosis/mappCockpit"|String|' + this.settings.visionComponentReference + '.' + methodName;
        this._consoleEvents("OPCUA: called " + methodName);

        if (resultHandler !== undefined) {
            brease.services.opcua.callMethod(objectId, methodId, args).then(this._bind(resultHandler));
        } else {
            brease.services.opcua.callMethod(objectId, methodId, args).then(this._bind('showResult'));
        }
    };

    p.showResult = function (result) {
        if (result && result.status) {
            this._consoleEvents("OPCUA callMethod responed: statusCode " + result.status.code + ' with message "' + result.status.message + '"');
        } else {
            this._consoleEvents("OPCUA: Received unkonwn response");
        }
    };

    p._resetSmartPanel = function () {
        this.resetEventBindingsOfHeaderContent();
        this.widgetsHandling.setVisionFuntionImageAcquisition();
        this.loggerHandling.reset(); 
        this.stopRepetitiveMode();
        this.socketHandling.closeSocket();
        this.removeAllTeachTools();
        this.deleteAllModelRois();
        this.deleteAllModelClouds();
        this.deleteExecutionRoi();
        this.pipette.resetValues();
        this.paramHandler.dispose();
        this.setInitialComplete(false);
        this.imageAcquisitionParamHandler.dispose();
        this.widgetsHandling.dispose();
        this.smartControl.dispose();
        this.ipAddress = '';
        this.settings.imageAcquisitionSettingsUpdated = '';
        this.lastCenterPosition = undefined;
        this.settings.offlineMode = undefined;
        this.selectionController.firstSelectedTool = undefined;
        this.settings.selectedModelId = undefined;
        for (var key in this.settings.modelClouds) {
            if (this.settings.modelClouds.hasOwnProperty(key)) {
                this.settings.modelClouds[key].dispose();
                delete this.settings.modelClouds[key];
            }
        }
        $(document.body).off("ContentActivated", this._bind('_handleContentActivated'));
        $('#' + this.settings.parentContentId + '_' + this.settings.visionFunctionParametersRefId).off('parameterValueChanged');

        this.settings.selectedVisionFunction = 'Image Acquisition';
        this.statusGroupBoxes.updateGroupBoxesState();
        this.setIsSelectedImageAcquisition(true);
        this.removeKeyboardEventListener();
    };

    p.setUnselectedModelState = function () {
        this.smartPanelModelList.setSelectedModelLock(false);
        this.hideAllModelTeachResults();
        this.removeAllTeachTools();
        this.updateOrientationTool();
        this.updateButtonStates();
        this.setEditMode(false);
        this.paramHandler.deleteListOfVisionFunctionModelParameters();
    };

    p.isAnyModelSelected = function () {
        var selected = false,
            model = this.getSelectedModel(),
            modelid = this.getSelectedModelId();

        if ((model || modelid === 0)) {
            selected = true;
        }
        return selected;
    };

    p.getSelectedModel = function () {
        var modelId = this.getSelectedModelId(),
            model = this.settings.vfModels.get(modelId);
        return model;
    };

    p.getModelTypeOfSelectedModel = function () {
        var modelType,
            modelId,
            model = this.getSelectedModel();
        if (model) {
            modelType = model.modelType;
        } else {
            modelId = this.getSelectedModelId();
            if (modelId >= 0) {
                modelType = this.getSelectedModelType();
            }
        }
        return modelType;
    };

    p.setModelParameterList = function (modelNumber) {
        if ((modelNumber === undefined) || (modelNumber === 0)) {
            var modelType = this.settings.selectedModelType;
            if (this.settings.defaultModelParameters.get(modelType) !== undefined) {
                this.paramHandler.filterVisionFunctionModelParameters(modelType);
                this.paramHandler.setVisionFunctionModelParameters(this.settings.defaultModelParameters.get(modelType));
            }
        } else if (this.settings.vfModels.get(modelNumber) !== undefined) {
            this.paramHandler.filterVisionFunctionModelParameters(this.settings.vfModels.get(modelNumber).modelType);
            this.paramHandler.setVisionFunctionModelParameters(this.settings.vfModels.get(modelNumber).parameters);
        }
    };

    p.setSelectedModelId = function (modelNumber) {
        var modelType;
        if (modelNumber === undefined) {
            this.resetDirtyFlagOfSelectedModelRoi();
        }
        this.deleteOrientationTool();

        if (this.settings.selectedModelId !== modelNumber) {
            this.resetDirtyFlagOfChangedTeachParameter();
            this.resetDirtyFlagOfChangedSubmitParameter();
        }
        this.settings.selectedModelId = modelNumber;

        if (modelNumber === undefined) {
            this.setUnselectedModelState();
        } else if (!(this.getStatusErrorModel())) {
            this.setModelParameterList(modelNumber);
        }

        if (this.isAnyModelSelected()) {
            modelType = this.getModelTypeOfSelectedModel();
            if (modelType) {
                this.updateToolList("ModelRoi", modelType);

                this.updateOrientationTool(modelType);
            }
        }

        if (this.getEditMode() === true) {
            this.setFocusOfSelectedModelRoi();
        }
        this.showModelTeachResults(modelNumber);
        this.updateButtonStates();
    };

    p.getSelectedModelId = function () {
        return this.settings.selectedModelId;
    };

    p.adjustHeightOfWidgets = function () {
        this.smartPanelParameterFormHandling.setHeight();
        this.smartPanelModelListHandling.setHeight();
    };

    p._setCenterPosition = function (x, y) {
        var roiCount = this.teachTools.length;
        if (this.teachTools.length !== 0) {
            for (var index = 0; index < roiCount; index++) {
                this.teachTools[index].setCenterPosition(x, y);
            }
        }
    };

    p._getCenterPosition = function () {
        var roiCount = this.teachTools.length;
        if (this.teachTools.length !== 0) {
            for (var index = 0; index < roiCount; index++) {
                return (this.teachTools[index].getCenterPosition());
            }
        }
    };

    p._onDelKeyPressed = function () {
        this.deleteSelectedTools();
    };

    p.updateButtonStates = function () {
        this.widgetsHandling.updateWidgetsStatus();
    };

    p.onCtrlArrowKeyPressed = function (key) {

        switch (key) {
            case "ArrowUp":
                this.setAngleOfSelectedTools(0);
                break;
            case "ArrowDown":
                this.setAngleOfSelectedTools(180);
                break;
            case "ArrowLeft":
                this.setAngleOfSelectedTools(270);
                break;
            case "ArrowRight":
                this.setAngleOfSelectedTools(90);
                break;
        }

    };

    p.onCtrlShiftArrowKeyPressed = function (key) {
        switch (key) {
            case "ArrowUp":
            case "ArrowDown":
                this.setHeightSameAsWidthOfSelectedTools();
                break;
            case "ArrowLeft":
            case "ArrowRight":
                this.setWidthSameAsHeightOfSelectedTools();
                break;
        }

    };

    p.onCtrlShiftBPressed = function () {
        this.moveSelectedToolsToBottom();
    };

    p.onCtrlShiftFPressed = function () {
        this.moveSelectedToolsToFront();
    };

    p.onCtrlShiftOPressed = function () {
        this.sortTools();
    };


    p.moveSelectedToolsToBottom = function () {
        this.executionTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.moveToBottom();
            }
        });

        this.teachTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.moveToBottom();
            }
        });
    };

    p.moveSelectedToolsToFront = function () {
        this.executionTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.moveToFront();
            }
        });

        this.teachTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.moveToFront();
            }
        });
    };

    p.sortTools = function () {
        this.executionTools.forEach(function (tool) {
            tool.moveToFront();
        });

        this.teachTools.forEach(function (tool) {
            tool.moveToFront();
        });
    };

    p.setAngleOfSelectedTools = function (angle) {
        this.executionTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.setAngle(angle);
            }
        });

        this.teachTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.setAngle(angle);
            }
        });

    };

    p.turnSelectedRoiToolsCounterclockwise = function (angle) {
        this.executionTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.rotateCounterclockwise(angle);
            }
        });

        this.teachTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.setAngle(angle);
            }
        });

    };

    p.setWidthSameAsHeightOfSelectedTools = function () {
        this.executionTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.setWidthSameAsHeight();
            }
        });

        this.teachTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.setWidthSameAsHeight();
            }
        });
    };

    p.setHeightSameAsWidthOfSelectedTools = function () {
        this.executionTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.setHeightSameAsWidth();
            }
        });

        this.teachTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.setHeightSameAsWidth();
            }
        });
    };

    p.updateModelViewBySelectedModel = function (modelNumber, model) {
        this.paramHandler.filterVisionFunctionModelParameters(model.modelType);
        this.paramHandler.setVisionFunctionModelParameters(this.settings.vfModels.get(modelNumber).parameters);
    };

    p.updateModelViewBySelectedModelType = function () {
        var modelType = this.settings.selectedModelType;
        if (this.settings.defaultModelParameters.get(modelType) !== undefined) {
            this.paramHandler.filterVisionFunctionModelParameters(modelType);
            this.paramHandler.setVisionFunctionModelParameters(this.settings.defaultModelParameters.get(modelType));
            this.smartPanelModelList.setMetaData(modelType);
        }
    };

    p.updateModelViewByDefaultParameters = function (modelType) {
        if (this.settings.defaultModelParameters.get(modelType) !== undefined) {
            this.paramHandler.filterVisionFunctionModelParameters(modelType);
            this.paramHandler.setVisionFunctionModelParameters(this.settings.defaultModelParameters.get(modelType));
        }
    };

    p.updateModelView = function (modelNumber) {
        var model;

        if (modelNumber === undefined) {
            modelNumber = this.getSelectedModelId();
        }

        if (modelNumber === undefined) {
            this.paramHandler.deleteListOfVisionFunctionModelParameters();
        } else {
            if (modelNumber === 0) {
                this.updateModelViewBySelectedModelType();
            } else if (this.settings.vfModels.get(modelNumber) !== undefined) {
                model = this.settings.vfModels.get(modelNumber);
                if (model !== undefined) {
                    this.updateModelViewBySelectedModel(modelNumber, model);
                }
            }
        }
    };

    p.isAnyRoiToolSelected = function () {
        var selectedToolExists = false;

        this.executionTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                selectedToolExists = true;
            }
        });

        if (selectedToolExists === false) {
            this.teachTools.forEach(function (tool) {
                if (tool.isSelected() === true) {
                    selectedToolExists = true;
                }
            });
        }
        return selectedToolExists;
    };


    p.suspend = function () {
        this._resetSmartPanel();
        SuperClass.prototype.suspend.apply(this, arguments);
    };

    p.dispose = function () {
        if (!brease.config.editMode) {
            this._resetSmartPanel();
        }
        SuperClass.prototype.dispose.apply(this, arguments);
    };

    p.onSetGlobalModelListError = function (message) {
        // TODO: handle error
        console.log("onSetGlobalModelListError " + message);
    };

    p.setGlobalViewModelAssign = function (col, row, modelId) {
        var index,
            relation,
            globalModelNumber = 1,
            globalModel = this.settings.vfGlobalModels.get(globalModelNumber);

        for (index = 0; index < globalModel.length; index++) {
            relation = globalModel[index];
            if (row === relation.Id) {
                switch (col) {
                    case 2:
                        relation.ModelReference = modelId;
                        break;
                    case 3:
                        relation.ModelTarget = modelId;
                        break;
                }
                break;
            }
        }
    };

    p.getGlobalModelParams = function () {
        var modelNumber = 1,
            modelParams = [],
            operations = [],
            references = [],
            targets = [],
            models = this.settings.vfGlobalModels.get(modelNumber);

        if (models !== undefined) {
            models.forEach(function (model) {
                if ((model.ModelReference > 0) && (model.Operation !== "") && (model.Operation !== undefined)) {
                    operations.push(model.Operation);
                    references.push(model.ModelReference);
                    targets.push(model.ModelTarget);
                }
            });

            modelParams.push({
                Operation: operations
            }, {
                ModelReference: references
            }, {
                ModelTarget: targets
            });
        }
        return modelParams;
    };

    p.getSelectedGlobalModelId = function () {
        return this.settings.selectedGlobalModelId;
    };

    /**
     * @method hideAllResultClouds
     * @iatStudioExposed
     * hide all result clouds
     */
    p.hideAllResultClouds = function () {
        this.settings.resultClouds.forEach(function (PixelCloud) {
            PixelCloud.hide();
        });
    };

    /**
     * @method showAllResultClouds
     * @iatStudioExposed
     * show all result clouds 
     */
    p.showAllResultClouds = function () {
        this.settings.resultClouds.forEach(function (PixelCloud) {
            PixelCloud.show();
        });
    };

    p.addGlobalModelEntry = function () {
        var globalModelData = [],
            that = this,
            globalModelNumber = 1,
            index = 0,
            operation,
            modelEntries = that.settings.vfGlobalModels.get(globalModelNumber);

        if (modelEntries != undefined) {
            modelEntries.forEach(function (model) {
                index = model.Id;
                operation = model.Operation;

                globalModelData.push({
                    "Id": model.Id,
                    "metaData": [model.Operation, model.ModelReference, model.ModelTarget, ""],
                    "isPersisted": true,
                    "isSelected": false
                });
            });
        }

        globalModelData.push({
            "Id": index + 1,
            "metaData": [operation, 0, 0, ""],
            "isPersisted": false,
            "isSelected": false
        });

        this.smartPanelGlobalModelList.setModelData(globalModelData);
    };

    p.deleteSelectedGlobalModelEntry = function () {
        this.smartPanelGlobalModelList.removeSelectedRow();
        this.sendGlobalModel();
        this.updateButtonStates();
        this.globalModelHandling.setVisibleOfGlobalModelInputs();
    };

    p.acquireImage = function () {
        var args;
        if (this.isWaitingForImageCommandAck === true) {
            this.isWaitingForImageCommandAck = false;


            if (!this.getInitialComplete() || (true === this.hmiStatus.repetitiveModeEnabled) && (true === this.settings.repetitiveModeSkipParameterUpdate)) {
                args = {
                    Parameters: '{}',
                    Variables: '{}',
                    IsRepetitiveMode: this.settings.repetitiveModeSkipParameterUpdate
                };
            } else {
                args = {
                    Parameters: JSON.stringify(this.getIAParameters()),
                    Variables: JSON.stringify(this.getIAVariables()),
                    IsRepetitiveMode: this.settings.repetitiveModeSkipParameterUpdate
                };
                if (true === this.hmiStatus.repetitiveModeEnabled) {
                    this.settings.repetitiveModeSkipParameterUpdate = true;
                }

            }
            this._callOpcUaMethod('AcquireImage', args);
        }
    };


    p.getIAParameters = function () {
        var imageAcquisitionSettings = this.imageAcquisitionParamHandler.getImageAcquisitionData(this.settings.visionImageAcquisitionSettingsRefId);
        var visionLineSensorSettings = this.imageAcquisitionParamHandler.getImageAcquisitionData(this.settings.visionLineSensorSettingsRefId);
        var lineSensorNormalImageMode = this.imageAcquisitionParamHandler.getLineSensorNormalImageMode(this.settings.lineSensorNormalImageModeButtonRefId);
        return Object.assign(imageAcquisitionSettings, visionLineSensorSettings, lineSensorNormalImageMode);
    };

    p.getIAVariables = function () {
        var extendedVariables = this.imageAcquisitionParamHandler.getImageAcquisitionData(this.settings.extendedParametersRefId);
        var lightAndFocus = this.imageAcquisitionParamHandler.getImageAcquisitionData(this.settings.lightAndFocusRefId);
        return Object.assign(extendedVariables, lightAndFocus);
    };

    /**
     * @method onButtonResultFilterNext
     * on Button Result Filter Next
     */
    p.onButtonResultFilterNext = function () {
        this.resultFilter.showNextResult();
    };

    /**
     * @method onButtonResultFilterPrevious
     * @iatStudioExposed
     * on Button Result Filter Previous
     */
    p.onButtonResultFilterPrevious = function () {
        this.resultFilter.showPreviousResult();
    };

    p.setUpdateSource = function (source) {
        this.settings.updateSource = source;
    };

    p.getUpdateSource = function () {
        return this.settings.updateSource;
    };

    /**
     * on Button Result Filter show all results
     */
    p.onButtonResultFilterShowAllResults = function () {
        if (this.getUpdateSource() === undefined) {
            this.setUpdateSource('internal');
            this.resultFilter.filterControls.buttonHideAllResults.setValue(false);
            this.resultFilter.applyIconicsFilter();
        }
        this.setUpdateSource(undefined);  
    };

    /**
     * on Button Result Filter hide all results
     */
    p.onButtonResultFilterHideAllResults = function () {
        if (this.getUpdateSource() === undefined) {
            this.setUpdateSource('internal');
            this.resultFilter.filterControls.buttonShowAllResults.setValue(false);
            this.resultFilter.applyIconicsFilter();
        }
        this.setUpdateSource(undefined);   
    };


    /**
     * @method onResultFilterIndexChanged
     * on Button Result Filter hide all results
     */
    p.onResultFilterIndexChanged = function () {
        this.resultFilter.applyFilterIndexOfNumericInput();
    };

    p.getLastImageOfRepetitiveModeIsLoading = function () {
        return (this.settings.lastImageOfRepetitiveModeIsLoading);
    };

    p.setLastImageOfRepetitiveModeIsLoading = function (value) {
        this.settings.lastImageOfRepetitiveModeIsLoading = value;
        this.setStatusReady();
    };

    /**
     * @method setRepetitiveMode
     * Set repetitive mode
     */
    p.setRepetitiveMode = function (evt) {
        var value = evt.detail.newValueBool; 
        if (value === true) {
            this.enableRepetitiveMode(true);
        } else {
            this.enableRepetitiveMode(false);
        }
    };

    p.enableRepetitiveMode = function (mode) {
        var that = this;
        if (mode === true) {
            this.hmiStatus.repetitiveModeEnabled = true;
            this.settings.repetitiveModeSkipParameterUpdate = false;
            if (this.repetitiveTimer) {
                clearInterval(this.repetitiveTimer);
            }
            this.repetitiveTimer = setInterval(function () {

                var readyForFriggerToggle = that.getStatusResponseReciv() &&
                    that.getInitialComplete() &&
                    !that.getVisionApplicationIsLoading() &&
                    !that.getVisionApplicationIsSaving() &&
                    !that.getImageIsLoading();

                if (readyForFriggerToggle === true) {
                    that.triggerToggle();
                }
            }, 100);
        } else {
            this.setLastImageOfRepetitiveModeIsLoading(true);
            this.settings.repetitiveModeSkipParameterUpdate = false;
            if (this.repetitiveTimer) {
                clearInterval(this.repetitiveTimer);
            }
            this.stopRepetitiveModeWithOnelastImage();
        }
    };

    p.stopRepetitiveModeWithOnelastImage = function () {
        var that = this;
        if (this.lastRepetitiveImageTimer) {
            clearInterval(this.lastRepetitiveImageTimer);
        }
        this.lastRepetitiveImageTimer = setInterval(function () {

            var readyForFriggerToggleAgain = that.getStatusResponseReciv() &&
                that.getInitialComplete() &&
                !that.getVisionApplicationIsLoading() &&
                !that.getVisionApplicationIsSaving() &&
                !that.getImageIsLoading();

            if (readyForFriggerToggleAgain === true) {
                that.triggerToggle();
                that.setLastImageOfRepetitiveModeIsLoading(true);
                that.hmiStatus.repetitiveModeEnabled = false;
                clearInterval(that.lastRepetitiveImageTimer);
            }
        }, 100);
    };

    p.stopRepetitiveMode = function () {
        var toggleRepetitiveButton;
        if (this.repetitiveTimer) {
            clearInterval(this.repetitiveTimer);
        }
        if (this.isUnitTestEnviroment() !== true) {
            toggleRepetitiveButton = brease.callWidget(this.settings.parentContentId + '_' + this.settings.refIdButtonRepetitiveMode, "widget");
            if (toggleRepetitiveButton !== null) {
                toggleRepetitiveButton.setValue(false);
            }
        }
        this.hmiStatus.repetitiveModeEnabled = false;
        this.settings.repetitiveModeSkipParameterUpdate = false;
        this.setStatusReady();
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

    p.getRepetitiveMode = function () {
        return this.hmiStatus.repetitiveModeEnabled;
    };

    p.isSelectedVfModelTabVisionFunctionPage = function () {
        if (this.settings.selectedVfModelTab === "VisionFunctionPage") {
            return true;
        } else {
            return false;
        }
    };

    p.isSelectedVfModelTabEditModelsPage = function () {
        if (this.settings.selectedVfModelTab === "EditModelsPage") {
            return true;
        } else {
            return false;
        }
    };

    p.updateApplicationContext = function () {
        var editMode = this.settings.editMode;
        if (this.isSelectedVfModelTabVisionFunctionPage()) {
            switch (editMode) {
                case true:
                    this.applicationContext = "edit_execution_roi";
                    break;
                case false:
                    this.applicationContext = "execute_vision_function";
                    break;
            }
        } else if (this.isSelectedVfModelTabEditModelsPage()) {
            switch (editMode) {
                case true:
                    this.applicationContext = "edit_model_roi";
                    break;
                case false:
                    this.applicationContext = "submit_model_parameter";
                    break;
            }
        }
        this.widgetsHandling.updateWidgetsStatus();
    };

    p.setApplicationContext = function (context) {
        this.applicationContext = context;

        if (this.applicationContext.includes("edit_")) {
            this.settings.editMode = true;
        } else {
            this.settings.editMode = false;
        }
    };

    p.addNewModelToVisionFunction = function (model) {
        var newModel = {
            parameters: model.model_params,
            modelType: model.model_type,
            modelNumber: model.model_number,
            modelRoi: undefined,
            modelMeta: model.model_meta
        };
        this.settings.vfModels.set(model.model_number, newModel);
    };

    p.clearModelRoiDataOfSelectedModel = function () {
        var model = this.getSelectedModel();
        if (model && model.modelRoi && model.modelRoi.isSelected() && this.isDeletionOfSingleInstanceModelRoiAllowed()) {
            model.modelRoi.clearRoiData();
        }
    };

    p.setDirtyFlagOfSelectedModelRoi = function (dirty) {
        var model = this.getSelectedModel();
        if (model && model.modelRoi) {
            model.modelRoi.setDirtyFlag(dirty);
        }
    };

    p.getDirtyFlagOfSelectedModelRoi = function () {
        var isDirty = false,
            model = this.getSelectedModel();
        if (model && model.modelRoi) {
            isDirty = model.modelRoi.getDirtyFlag();
        }
        return isDirty;
    };

    p.resetDirtyFlagOfSelectedModelRoi = function () {
        var model = this.getSelectedModel();
        if (model && model.modelRoi) {
            model.modelRoi.setDirtyFlag(false);
        }
    };

    p.resetSelectedModelId = function () {
        this.settings.selectedModelId = undefined;
        this.smartPanelModelList.setSelectedModelLock(false);
    };

    p.setDirtyFlagOfChangedSubmitParameter = function (accessAttribut) {
        if (accessAttribut === this.settings.accessAttributForSubmit) {
            this.settings.dirtyFlagOfChangedSubmitParameter = true;
        }
    };

    p.resetDirtyFlagOfChangedSubmitParameter = function () {
        this.settings.dirtyFlagOfChangedSubmitParameter = false;
    };

    p.getDirtyFlagOfChangedSubmitParameter = function () {
        return (this.settings.dirtyFlagOfChangedSubmitParameter);
    };

    p.setDirtyFlagOfChangedTeachParameter = function (accessAttribut) {
        if (accessAttribut === this.settings.accessAttributForTeach) {
            this.settings.dirtyFlagOfChangedTeachParameter = true;
        }
    };

    p.resetDirtyFlagOfChangedTeachParameter = function () {
        this.settings.dirtyFlagOfChangedTeachParameter = false;
    };

    p.getDirtyFlagOfChangedTeachParameter = function () {
        return (this.settings.dirtyFlagOfChangedTeachParameter);
    };

    p.getCapabilityOfExecutionRoi = function (capabilityName) {
        var result = false,
            capabilities = [],
            executionRoi;

        if (this.vfCapabilities.has("ExecutionRoi")) {
            executionRoi = this.vfCapabilities.get("ExecutionRoi");
            if (executionRoi.Capability) {
                if (Array.isArray(executionRoi.Capability) === true) {
                    capabilities = executionRoi.Capability;
                } else {
                    capabilities.push(executionRoi.Capability);
                }

                capabilities.forEach(function (capability) {
                    if (capability.attr.Name === capabilityName) {
                        result = true;
                        if (capability.attr.Value) {
                            if (capability.attr.Value === "true") {
                                result = true;
                            } else if (capability.attr.Value === "false") {
                                result = false;
                            } else {
                                result = capability.attr.Value;
                            }
                        }
                    }
                });
            }
        }
        return result;
    };

    p.getExecutionToolLIstReference = function () {
        var result,
            capabilities = [],
            executionRoi;

        if (this.vfCapabilities.has("ExecutionRoi")) {
            executionRoi = this.vfCapabilities.get("ExecutionRoi");
            if (executionRoi.Capability) {
                if (Array.isArray(executionRoi.Capability) === true) {
                    capabilities = executionRoi.Capability;
                } else {
                    capabilities.push(executionRoi.Capability);
                }

                capabilities.forEach(function (capability) {
                    if ((capability.attr.Name === "ToolListReference") && capability.attr.Value) {
                        result = capability.attr.Value;
                    }
                });
            }
        }
        return result;
    };

    p.getModelTypeToolListReference = function (modelTypeName) {
        var toolListReference,
            editMode = "ModelRoi",
            modelTypes;

        if (this.supportsMarker(modelTypeName)) {
            editMode = "Marker";
        }

        if (modelTypeName) {
            modelTypes = this.vfCapabilities.get("ModelTypes");
            if (modelTypes) {
                modelTypes.forEach(function (modelType) {
                    if (modelType.Name === modelTypeName) {
                        if (modelType.Capabilities) {
                            modelType.Capabilities.forEach(function (capability) {
                                if ((capability.Name === "ToolListReference") && (capability.Type === editMode)) {
                                    toolListReference = capability.Value;
                                }
                            });
                        }
                    }
                });
            }
        }
        return toolListReference;
    };

    p.getToolListReference = function (modelTypeName) {
        var toolListReference;
        if ((modelTypeName === undefined) || (modelTypeName === "")) {
            toolListReference = this.getExecutionToolLIstReference();
        } else {
            toolListReference = this.getModelTypeToolListReference(modelTypeName);
        }
        return toolListReference;
    };

    p.deleteExecutionRoi = function () {
        if (this.executionRoi) {
            this.executionRoi.dispose();
            this.executionRoi = undefined;
        }
    };

    return WidgetClass;
});