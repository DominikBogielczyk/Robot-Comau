define([
    'brease/core/ContainerWidget', 
    'brease/enum/Enum'
], function (SuperClass, Enum) {

    'use strict';

    /**
    * @class widgets.brease.FlexLayoutPanel
    * @extends brease.core.ContainerWidget
     * @iatMeta studio:license
     * licensed
    * @iatMeta studio:isContainer
    * true
    * @iatMeta category:Category
    * Container
    * @iatMeta description:short
    * Container Widget
    * @iatMeta description:de
    * Bereich in dem definierte Widgets für eine dynamische Größenanpassung platziert werden können
    * @iatMeta description:en
    * Area in which defined widgets can be placed for dynamic sizing
    */

    /**
     * @property {WidgetList} children=["widgets.brease.FlexLayoutPanel", "widgets.brease.Button", "widgets.brease.TextOutput", "widgets.brease.Label", "widgets.brease.Image", "widgets.brease.LoginInfo", "widgets.brease.DateTimeOutput", "widgets.brease.NumericOutput", "widgets.brease.NumericInput", "widgets.brease.ProgressBar", "widgets.brease.TextInput", "widgets.brease.DateTimeInput", "widgets.brease.Login", "widgets.brease.DropDownBox", "widgets.brease.ListBox", "widgets.brease.Ellipse", "widgets.brease.Rectangle", "widgets.brease.RadioButtonGroup", "widgets.brease.ButtonBar", "widgets.brease.NavigationBar", "widgets.brease.Navigation"]
     * @inheritdoc  
     */

    /**
     * @cfg {String} tooltip=''
     * @hide
     */

    /**
     * @method showTooltip
     * @hide
     */

    var defaultSettings = {
            childPositioning: Enum.ChildPositioning.relative //needed in order to sort children in the content editor
        },
        WidgetClass = SuperClass.extend(function FlexLayoutPanel() {
            SuperClass.apply(this, arguments);
        }, defaultSettings, true),
        p = WidgetClass.prototype;

    p.init = function init() {
        if (this.settings.omitClass === true) {
            this.elem.classList.remove('breaseFlexLayoutPanel');
        } else {
            this.addInitialClass('breaseFlexLayoutPanel');
        }
        if (brease.config.editMode === true) {
            this.addInitialClass('iatd-outline');
        }
        SuperClass.prototype.init.apply(this, arguments);
    };
    return WidgetClass;

});
