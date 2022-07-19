/*global define, brease, CustomEvent, $*/
define(['brease/core/BaseWidget',
        'brease/core/Utils',
        'brease/enum/Enum',
        'brease/core/Types',
        'brease/events/BreaseEvent',
        'brease/helper/Scroller'
    ],
    function (SuperClass, Utils, Enum, Types, BreaseEvent, Scroller) {

        'use strict';

        /**
         * @class widgets.visionCockpit.SmartPanelModelList
         * #Description
         * Widget for Model ID and meta info output.   
         * @breaseNote 
         * @extends brease.core.BaseWidget
         *
         * @iatMeta category:Category
         * Text
         * @iatMeta description:short
         * SmartPanelModelList
         * @iatMeta description:de
         * Widget zum tabellarischen Anzeigen von Model-ID's und Parametern
         * die vom VSM geliefert wurden
         * @iatMeta description:en
         * Widget to display Vision Model-ID's and Parameter in a table
         */

        var defaultSettings = {},


            WidgetClass = SuperClass.extend(function SmartPanelModelList() {
                SuperClass.apply(this, arguments);
            }, defaultSettings),

            p = WidgetClass.prototype;


        p.init = function () {
            if (this.settings.omitClass !== true) {
                this.addInitialClass('visionCockpitSmartPanelModelList');
            }

            this.scrollContainer = $('<div class="scrollContainer" style="position:absolute;top:25px; overflow:hidden">');
            this.drawContainer = $('<div class="drawContainer">');

            _header(this);
            this._updateTable();
            this.el.on(BreaseEvent.WIDGET_READY, this.scroller.refresh());
            this.el.on("VisibleChanged", this._bind('_scrollUpdateHandler'));
            this.settings.selectedModelLocked = false;
            SuperClass.prototype.init.call(this);
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
            scrollContainerHeight = this.settings.height - parseInt(this.scrollContainer[0].style.top);
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
            var headerRow = $("<tr>");
            headerRow.append($("<th class='td_id_head'>" + "Id" + "</th>"));
            headerRow.append($("<th class='td_param_head'>" + "Model Type" + "</th>"));
            widget.tableHeader.append(headerRow);
            var temp = $('<div class="header">');
            temp.append(widget.tableHeader);
            widget.el.append(temp);
        }

        p._updateTable = function () {
            var row, colId, colMetaData, tdata;

            if (this.table != undefined) {
                this.table.remove();
                this.drawContainer.remove();

            }

            this.initTable();

            if (this.modelData != undefined) {
                tdata = this.modelData;
                if (tdata.models != undefined && tdata.models.length > 0) {
                    for (var index = 0; index < tdata.models.length; index++) {
                        row = $("<tr modelId='" + tdata.models[index].Id + "'>");

                        if (tdata.models[index].isSelected === true) {
                            row.addClass("selectedRow");
                        }

                        if (!tdata.models[index].metaData) {
                            colMetaData = $("<td class='td_param'>" + "</td>");
                        } else {
                            colMetaData = $("<td class='td_param'>" + tdata.models[index].metaData + "</td>");
                        }
                        if (tdata.models[index].isPersisted === true) {
                            colId = $("<td class='td_id' draggable='true' ondragstart= 'drag(event)'>" + tdata.models[index].Id + "</td>");
                        } else {
                            colId = $("<td class='td_id' draggable='true' ondragstart= 'drag(event)'>" + "*" + tdata.models[index].Id + "</td>");
                        }
                        row.append(colId);
                        row.append(colMetaData);
                        this.table.append(row);
                    }
                }
                this.scroller.refresh();
            }
        };

        p.setHeight = function (height) {
            SuperClass.prototype._setHeight.apply(this, arguments);
            this.elem.style.height = parseInt(height) + 'px';
        };

        p._selectRow = function (modelId) {
            var tr = this.table.find("tr[modelid='" + modelId + "']"),
                models = this.modelData.models,
                index;

            tr.addClass("selectedRow");

            for (index = 0; index < models.length; index++) {
                if (models[index].Id === modelId) {
                    models[index].isSelected = true;
                } else {
                    models[index].isSelected = false;
                }
            }
        };

        p._removeUnpersistedRows = function () {
            var index,
                models;

            if (this.modelData) {
                models = this.modelData.models;
                this.table.find("tr").removeClass("selectedRow");

                for (index = 0; index < models.length; index++) {
                    if (models[index].Id === 0) {
                        models.splice(index, 1);
                    }
                }
            }
        };

        p._deselectAllRows = function () {
            var index,
                models;
            if (this.modelData) {
                models = this.modelData.models;
                this.table.find("tr").removeClass("selectedRow");

                for (index = 0; index < models.length; index++) {
                    models[index].isSelected = false;
                }
            }
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
        };

        p.selectModel = function (modelId) {
            if (this.doesModelIdExist(modelId)) {
                this._deselectAllRows();
                this._selectRow(modelId);
                this.smartPanel.setSelectedModelId(modelId);
            } else if (modelId === undefined) {
                this.smartPanel.setSelectedModelId(modelId);
            }
        };

        p.deSelectAll = function () {
            this._removeUnpersistedRows();
            this._deselectAllRows();
            this._updateTable();
            this.smartPanel.setSelectedModelId(undefined);
        };

        p.selectAllNotPersistedModels = function () {
            var model, index;
            this._deselectAllRows();
            for (index = 0; index < this.modelData.models.length; index++) {
                model = this.modelData.models[index];
                if ((model.isPersisted === false) || (model.isPersisted === undefined)) {
                    if (this.doesModelIdExist(model.Id)) {
                        this._selectRow(model.Id);
                        this.smartPanel.setSelectedModelId(model.Id);
                    }
                }
            }
        };

        p.hasSelectedModel = function () {
            if (this.table.find("tr[class= selectedRow]"))
                return true;
            else return false;
        };

        p.getSelectedModel = function () {
            var selectedModel, row;
            row = this.table.find("tr[class= selectedRow]");
            selectedModel = $(row).parent("tr").attr("modelId");
            return selectedModel;
        };

        p.addModel = function (newModelId) {
            if (newModelId === undefined) {
                newModelId = 0;
            }

            if ((this.modelData === undefined) || (this.modelData.length === 0)) {
                this.modelData = {
                    "models": []
                };
            }
            this.modelData.models.push({
                "Id": newModelId,
                "metaData": "",
                "isPersisted": false,
                "isSelected": false
            });
            this._updateTable();
            this.selectModel(newModelId);
        };

        p.setModelId = function (modelId) {
            var tableIndex = this._getIndexOfModelId(modelId);
            var modelNumber = this.smartPanel.getSelectedModelId();

            if (modelNumber > 0) {
                if (tableIndex === undefined) {
                    this.addModel(modelId);
                    this.selectModel(modelId);
                    modelNumber = modelId;
                }
            }
            tableIndex = this._getIndexOfModelId(modelNumber);
            if (tableIndex !== undefined) {
                this.modelData.models[tableIndex].Id = modelId;
                this._updateTable();
            }
        };

        p.setMetaDataOfModel = function (modelNumber, message) {
            var tableIndex;

            if (modelNumber >= 0) {
                tableIndex = this._getIndexOfModelId(modelNumber);
                if (tableIndex != undefined) {
                    this.modelData.models[tableIndex].metaData = message;
                    this.modelData.models[tableIndex].isPersisted = false;
                    this._updateTable();
                }
            }
        };

        p.setMetaData = function (message) {
            var selectedModelId,
                tableIndex;

            selectedModelId = this.smartPanel.getSelectedModelId();
            if (selectedModelId >= 0) {
                tableIndex = this._getIndexOfModelId(selectedModelId);
                if (tableIndex != undefined) {
                    this.modelData.models[tableIndex].metaData = message;
                    this.modelData.models[tableIndex].isPersisted = false;
                    this._updateTable();
                    this.selectModel(selectedModelId);
                }
            }
        };

        p.setMetaDataAndSelectAllNotPersistedModels = function (message) {
            var selectedModelId,
                tableIndex;

            selectedModelId = this.smartPanel.getSelectedModelId();
            if (selectedModelId >= 0) {
                if (tableIndex != undefined) {
                    this.modelData.models[tableIndex].metaData = message;
                    this.modelData.models[tableIndex].isPersisted = false;
                    this._updateTable();
                    this.selectAllNotPersistedModels();
                }
            }
        };

        p.emptyRowExists = function () {
            var result = false;
            if (this.modelData != undefined) {
                if (this.modelData.models != undefined) {
                    for (var index = 0; index < this.modelData.models.length; index++) {
                        if (this.modelData.models[index].metaData.length === 0) {
                            result = true;
                            continue;
                        }
                    }
                }
            }
            return result;
        };

        p.setModelToPersistedStatus = function (modelNumber) {
            if (modelNumber >= 0) {
                var indexOfModelId = this._getIndexOfModelId(modelNumber);
                if (indexOfModelId >= 0) {
                    this.modelData.models[indexOfModelId].isPersisted = true;
                }
            }
            this._updateTable();
        };

        p.setSelectedModelToPersistedStatus = function () {
            var modelNumber = this.smartPanel.getSelectedModelId(),
                indexOfModelId = this._getIndexOfModelId(modelNumber);
            if (indexOfModelId >= 0) {
                this.modelData.models[indexOfModelId].isPersisted = true;
            }
            this._updateTable();
        };

        p.setAllModelsToPersistedStatus = function () {
            for (var index = 0; index < this.modelData.models.length; index++) {
                this.modelData.models[index].isPersisted = true;
            }
            this._updateTable();
        };

        p.getMinAndMaxValueIdOfPersistedModels = function () {
            var idsOfPersistedModels = this.getIdsOfPersistedModels(),
                maxValue, minValue, minAndMaxValuesOfPersistedModelsIds;

                if (idsOfPersistedModels.length === 0) {
                    maxValue = minValue = 0;
                } else{
                    minValue = Math.min.apply(null, idsOfPersistedModels);
                    maxValue = Math.max.apply(null, idsOfPersistedModels);
                }
                minAndMaxValuesOfPersistedModelsIds = {
                    min: minValue,
                    max: maxValue,
                };
            return minAndMaxValuesOfPersistedModelsIds;
        };

        p.getIdsOfPersistedModels = function () {
            var idsOfPersistedModels = [];
            if (this.modelData !== undefined && Array.isArray(this.modelData.models)) {
                this.modelData.models.forEach(function (model) {
                    if (model.isPersisted) {
                        idsOfPersistedModels.push(model.Id);
                    }
                });
            }
            return idsOfPersistedModels;
        };

        p.updateSmartPanelModelList = function (modelList) {
            var that = this;
            this.modelData = {
                models: []
            };

            modelList.forEach(function (model) {
                that.modelData.models.push({
                    "Id": model.model_number,
                    "metaData": model.model_meta,
                    "isPersisted": true,
                    "isSelected": false
                });
            });

            this._updateTable();
            this.smartPanel.globalModelHandling.updateValueRangesAndVisibilityofGlobalModel();
        };

        p.removeModels = function () {
            this.modelData = {
                models: []
            };
            this._updateTable();
        };

        p.removeModel = function (modelNumber) {
            for (var index = 0; index < this.modelData.models.length; index++) {
                if (this.modelData.models[index].Id === modelNumber) {
                    this.modelData.models.splice(index, 1);
                    break;
                }
            }
            this._updateTable();

            if (this.smartPanel.getSelectedModelId() === 0) {
                this.selectModel(undefined);
            }
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
        };


        p.dispose = function () {

            SuperClass.prototype.dispose.apply(this, arguments);
        };

        return WidgetClass;

    });

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.innerText);
}