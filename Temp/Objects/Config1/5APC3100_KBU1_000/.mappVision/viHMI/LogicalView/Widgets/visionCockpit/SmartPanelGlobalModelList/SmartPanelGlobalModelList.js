/*global define, brease, CustomEvent, $*/
define(['brease/core/BaseWidget',
    'brease/events/BreaseEvent',
    'brease/helper/Scroller'
],
    function (SuperClass, BreaseEvent, Scroller) {

        'use strict';

        /**
         * @class widgets.visionCockpit.SmartPanelGlobalModelList
         * #Description
         * Widget for Model ID and meta info output.   
         * @breaseNote 
         * @extends brease.core.BaseWidget
         *
         * @iatMeta category:Category
         * Text
         * @iatMeta description:short
         * SmartPanelGlobalModelList
         * @iatMeta description:de
         * Widget zum tabellarischen Anzeigen von Model-ID's und Parametern
         * die vom VSM geliefert wurden
         * @iatMeta description:en
         * Widget to display Vision Model-ID's and Parameter in a table
         */

        var defaultSettings = {
            operations: ["orthogonal_distance", "angle", "distance_cog", "distance_min", "distance_max", "length", "orientation", "position_x", "position_y"],
        },

            WidgetClass = SuperClass.extend(function SmartPanelGlobalModelList() {
                SuperClass.apply(this, arguments);
            }, defaultSettings),

            p = WidgetClass.prototype;


        p.init = function () {
            if (this.settings.omitClass !== true) {
                this.addInitialClass('visionCockpitSmartPanelGlobalModelList');
            }

            this.scrollContainer = $('<div class="scrollContainer" style="position:absolute;top:25px; overflow:hidden">');
            this.drawContainer = $('<div class="drawContainer">');

            _header(this);
            this._updateTable();
            this.el.on(BreaseEvent.WIDGET_READY, this.scroller.refresh());
            this.el.on("VisibleChanged", this._bind('_scrollUpdateHandler'));
            SuperClass.prototype.init.call(this);
            this.settings.selectedModelLocked = false;
            this.modelData = {
                models: []
            };
        };

        p._scrollUpdateHandler = function (e) {
            this._handleEvent(e);
            if (this.scroller !== undefined) {
                this.scroller.refresh();
            }
        };

        function _addScroller(widget) {
            widget.scroller = Scroller.addScrollbars(widget.scrollContainer[0], {
                mouseWheel: true,
                tap: true,
                scrollY: true,
                scrollX: false
            });
        }

        p.registerSmartPanel = function (smartPanel) {
            this.smartPanel = smartPanel;
        };

        p.initTable = function () {
            this.table = $('<table>');

            this.drawContainer.append(this.table);
            this.scrollContainer.append(this.drawContainer);
            this.el.append(this.scrollContainer);

            var scrollContainerWidth, scrollContainerHeight;
            scrollContainerHeight = this.settings.height - 25;
            scrollContainerWidth = this.settings.width;
            this.scrollContainer.width(scrollContainerWidth);
            this.scrollContainer.height(scrollContainerHeight);

            if (!this.scroller) { // only first time
                _addScroller(this);
            } else {
                this.scroller.refresh();
            }
        };

        function _header(widget) {
            widget.tableHeader = $('<table class="header"></table>');
            var headerRow = $("<tr>"),
                col;
            col = $("<th class='td_id_head'>" + "Id" + "</th>");
            col.css("width", "50px");
            col.css("min-width", "40px");
            col.css("max-width", "40px");
            headerRow.append(col);

            col = $("<th class='td_param_head'>" + "Operation" + "</th>");
            col.css("width", "200px");
            col.css("min-width", "200px");
            col.css("max-width", "200px");
            col.css("text-align", "left");
            headerRow.append(col);

            col = $("<th class='td_param_head'>" + "Reference" + "</th>");
            col.css("width", "89px");
            col.css("min-width", "89px");
            col.css("max-width", "89px");
            col.css("text-align", "center");
            headerRow.append(col);

            col = $("<th class='td_param_head'>" + "Target" + "</th>");
            col.css("width", "89px");
            col.css("min-width", "89px");
            col.css("max-width", "89px");
            col.css("text-align", "center");
            headerRow.append(col);


            widget.tableHeader.append(headerRow);
            var temp = $('<div class="header">');
            temp.append(widget.tableHeader);
            widget.el.append(temp);
        }

        p._drawTable = function () {
            var row, colId, col, colMax = 3,
                tdata, metaValue = '',
                colMetaData;
            if (this.modelData != undefined) {
                tdata = this.modelData;

                if (tdata.models != undefined && tdata.models.length > 0) {
                    for (var index = 0; index < tdata.models.length; index++) {

                        row = $("<tr modelId='" + tdata.models[index].Id + "'>");
                        if (tdata.models[index].isPersisted === true) {
                            colId = $("<td class='td_id'>" + tdata.models[index].Id + "</td>");
                        } else {
                            colId = $("<td class='td_id'>" + "*" + tdata.models[index].Id + "</td>");
                        }
                        colId.css("width", "40px");
                        colId.css("min-width", "40px");
                        colId.css("max-width", "40px");

                        row.append(colId);

                        for (col = 0; col < colMax; col++) {
                            if (col < tdata.models[index].metaData.length) {
                                metaValue = tdata.models[index].metaData[col];
                            }

                            switch (col) {
                                case 0:
                                    if ((metaValue === undefined) || (metaValue === "")) {
                                        metaValue = this.defaultSettings.operations[0];
                                        tdata.models[index].metaData[col] = metaValue;
                                    }
                                    colMetaData = $("<td class='td_param'>" + metaValue + "</td>");
                                    colMetaData.css("border", "0");
                                    colMetaData.css("font-size", "inherit");
                                    break;
                                case 1:
                                    colMetaData = $("<td class='td_param'>" + metaValue + "</td>");
                                    break;
                                case 2:
                                    colMetaData = $("<td class='td_param'>" + metaValue + "</td>");
                                    break;
                            }

                            if (col > 0) {
                                colMetaData.css("width", "89px");
                                colMetaData.css("min-width", "89px");
                                colMetaData.css("max-width", "89px");
                                colMetaData.css("text-align", "center");
                                colMetaData.css("border", "0");
                                colMetaData.css("font-size", "inherit");
                            } else {
                                colMetaData.css("width", "200px");
                                colMetaData.css("min-width", "200px");
                                colMetaData.css("max-width", "200px");
                                colMetaData.css("text-align", "left");
                                colMetaData.css("border", "0");
                                colMetaData.css("font-size", "inherit");
                            }

                            row.append(colMetaData);
                        }
                        this.table.append(row);
                    }
                }
                this.scroller.refresh();
            }
        };

        p._updateTable = function () {
            if (this.table != undefined) {
                this.table.remove();
                this.drawContainer.remove();
            }
            this.initTable();
            this._drawTable();
        };

        p._selectRow = function (modelId) {
            var tr = this.table.find("tr[modelid='" + modelId + "']");
            tr.addClass("selectedRow");
        };

        p._deselectAllRows = function () {
            this.table.find("tr").removeClass("selectedRow");
        };

        p.setSelectedModelLock = function (value) {
            this.settings.selectedModelLocked = value;
        };

        p.getSelectedModelLock = function () {
            return this.settings.selectedModelLocked;
        };

        p._clickHandler = function (e) {
            SuperClass.prototype._clickHandler.apply(this, arguments);
            if (this.isDisabled || brease.config.editMode || this.getSelectedModelLock()) {
                return;
            }
            this.elem.dispatchEvent(new CustomEvent("Click", {
                bubbles: true
            }));
            this._onTableClick(e);
        };

        p._onTableClick = function (e) {
            var selectedRow, selectedModel, modelId;
            if (e.target.tagName === 'TD') {
                modelId = $(e.target).parent("tr").attr("modelId");
                selectedRow = $(e.target).parent("tr.selectedRow");
                selectedModel = selectedRow.attr("modelid");

                if (selectedModel != modelId) {
                    this.selectModel(parseInt(modelId));
                } else {
                    this.deSelectAll();
                }
            }
            this.smartPanel.updateButtonStates();
        };

        p.getPersistedStatus = function () {
            var index;

            if ((this.modelData === undefined) || (this.modelData.models.length === 0)) {
                return true;
            } else if (this.modelData.models != undefined) {
                for (index = 0; index < this.modelData.models.length; index++) {
                    if (this.modelData.models[index].isPersisted === false) {
                        return false;
                    }
                }
            }
            return true;
        };

        p.selectModel = function (modelId) {
            if (this.doesModelIdExist(modelId)) {
                this._deselectAllRows();
                this._selectRow(modelId);
                this.smartPanel.globalModelHandling.onClickGlobalModelListSelectionChanged(modelId);
            } else if (modelId === undefined) {
                this.smartPanel.globalModelHandling.onClickGlobalModelListSelectionChanged(modelId);
            }
        };

        p.deSelectAll = function () {
            this._deselectAllRows();
            this._updateTable();
            this.smartPanel.globalModelHandling.updateValueRangesAndVisibilityofGlobalModel();
            this.smartPanel.globalModelHandling.onGlobalModelListSelectionChanged(undefined);
        };

        p.selectAllNotPersistedModels = function () {
            var model, index;
            this._deselectAllRows();
            for (index = 0; index < this.modelData.models.length; index++) {
                model = this.modelData.models[index];
                if ((model.isPersisted === false) || (model.isPersisted === undefined)) {
                    if (this.doesModelIdExist(model.Id)) {
                        this._selectRow(model.Id);
                        this.smartPanel.globalModelHandling.onGlobalModelListSelectionChanged(model.Id);
                    }
                }
            }
        };

        p.setModelData = function (modelData) {
            if ((this.modelData === undefined) || (this.modelData.length === 0)) {
                this.modelData = {
                    "models": []
                };
            }
            this.modelData.models = modelData;
            this._updateTable();
            this.smartPanel.globalModelHandling.onGlobalModelListSelectionChanged(undefined);
        };

        p.getModelData = function () {
            return this.modelData.models;
        };

        p.getDefinedOperation = function (selectedModel) {
            var modelData, operation;
            modelData = this.getModelData();
            modelData.forEach(function (modelData) {
                if (modelData.Id === selectedModel) {
                    operation = modelData.metaData[0];
                }
            });
            return operation;
        };

        p.setMetaDataOfModel = function (modelNumber, metaData) {
            var tableIndex;

            if (modelNumber >= 0) {
                tableIndex = this._getIndexOfModelId(modelNumber);
                if (tableIndex != undefined) {
                    this.modelData.models[tableIndex].metaData = metaData;
                    this.modelData.models[tableIndex].isPersisted = false;
                    this._updateTable();
                }
            }
        };

        p.removeModels = function () {
            this.modelData = {
                models: []
            };
            this._updateTable();
        };

        p.removeSelectedRow = function () {
            for (var index = 0; index < this.modelData.models.length; index++) {
                if (this.modelData.models[index].Id.toString() === this.smartPanel.getSelectedGlobalModelId().toString()) {
                    this.modelData.models.splice(index, 1);
                    break;
                }
            }
            this._updateTable();

            if (this.smartPanel.getSelectedGlobalModelId() === 0) {
                this.selectModel(undefined);
            }
            this.smartPanel.globalModelHandling.onGlobalModelListSelectionChanged(undefined);
        };

        p._getIndexOfModelId = function (modelId) {
            var result, index = 0;
            if ((this.modelData === undefined) ||
                (this.modelData.models == undefined) ||
                (this.modelData.models.length === 0)) {
                return undefined;
            }

            for (index = 0; index < this.modelData.models.length; index++) {
                if (this.modelData.models[index].Id.toString() === modelId.toString()) {
                    result = index;
                    break;
                }
            }
            return result;
        };

        p.doesModelIdExist = function (modelId) {
            var exists = false;
            if (modelId === undefined) {
                return false;
            }
            if ((this.modelData === undefined) ||
                (this.modelData.models == undefined) ||
                (this.modelData.models.length === 0)) {
                return false;
            }

            for (var index = 0; index < this.modelData.models.length; index++) {
                if (this.modelData.models[index].Id.toString() === modelId.toString()) {
                    exists = true;
                    break;
                }
            }
            return exists;
        };

        p.getOperationCount = function () {
            var count = 0;
            if (this.modelData && this.modelData.models) {
                count = this.modelData.models.length;
            }
            return count;
        };

        p.disable = function () {
            if (this.isActive) {
                this.el.trigger(BreaseEvent.MOUSE_UP);
            }
            SuperClass.prototype.disable.apply(this, arguments);
        };

        p._preventClickHandler = function (e) {
            this._handleEvent(e);
        };

        p.wake = function () {
            this.scroller.refresh();
            SuperClass.prototype.wake.apply(this, arguments);
            this.modelData = {
                models: []
            };
        };

        p.dispose = function () {
            SuperClass.prototype.dispose.apply(this, arguments);
        };

        return WidgetClass;
    });



