define([
    'widgets/brease/TableColumnWidget/TableColumnWidget',
    'brease/enum/Enum'
], function (SuperClass, Enum) {

    'use strict';

    /**
     * @class widgets.brease.UserListItem
     * @extends widgets.brease.TableColumnWidget
     *
     * @iatMeta category:Category
     * Data
     *
     * @iatMeta description:short
     * UserListItem, widget used to set the columns wanted to be shown in the Userlist
     * @iatMeta description:de
     * Widget zur Darstellung von Spalten im UserList Widget
     * @iatMeta description:en
     * UserListItem, widget used to set the columns wanted to be shown in the Userlist
     */

    /**
     * @property {WidgetList} parents=["widgets.brease.UserList"]
     * @inheritdoc  
     */

    /**
     * @cfg {brease.enum.UserListItemType} columnType='UserName'
     * @iatStudioExposed
     * @iatCategory Behavior
     * Type the Userlist column will display
     */

    var defaultSettings = {
            text: '',
            columnType: Enum.UserListItemType.userName
        },

        WidgetClass = SuperClass.extend(function UserListItem() {
            SuperClass.apply(this, arguments);
        }, defaultSettings),

        p = WidgetClass.prototype;

    p.init = function () {
        SuperClass.prototype.init.call(this);
        this.el.addClass('breaseUserListItem');
    };

    /**
    * @method setColumnType
    * Sets columnType
    * @param {brease.enum.UserListItemType} columnType
    */
    p.setColumnType = function (columnType) {
        this.settings.columnType = columnType;
        // var event = new CustomEvent('ColumnTypeChanged', { detail: { columnType: Enum.UserListItemType.getKeyForValue(columnType) }, bubbles: true, cancelable: true });
        var event = new CustomEvent('ColumnTypeChanged', { detail: { columnType: columnType }, bubbles: true, cancelable: true });
        this.dispatchEvent(event);
    };

    /**
     * @method getColumnType 
     * Returns columnType.
     * @return {brease.enum.UserListItemType}
     */
    p.getColumnType = function () {
        return this.settings.columnType;
    };

    p.getShortColumnType = function () {
        if (this.settings.columnType !== 'LastLogin') {
            return { data: Enum.UserListItemType.getKeyForValue(this.settings.columnType) };
            // return { data: this.settings.columnType };
        } else {
            return {
                data: Enum.UserListItemType.getKeyForValue(this.settings.columnType),
                type: 'num',
                render: {
                    _: 'display',
                    sort: 'value'
                }
            };
        }
    };

    p.setData = function (telegram) {
        this.telegram = telegram;
    };

    return WidgetClass;
});
