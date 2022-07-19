define(['widgets/brease/TableWidget/TableWidget',
    'widgets/brease/UserList/libs/Model',
    'widgets/brease/UserList/libs/Controller',
    'widgets/brease/UserList/libs/Config',
    'widgets/brease/UserList/libs/Renderer',
    'brease/decorators/DragAndDropCapability',
    'brease/enum/Enum',
    'widgets/brease/common/DragDropProperties/libs/DroppablePropertiesEvents'
], function (SuperClass, Model, Controller, UserConfig, Renderer, dragAndDropCapability, Enum) {

    'use strict';

    //@requires system.widgets.ChangePasswordDialog
    /**
     * @class widgets.brease.UserList
     *
     * @mixins widgets.brease.common.DragDropProperties.libs.DroppablePropertiesEvents
     *
     * @breaseNote 
     * @extends widgets.brease.TableWidget
     * @requires widgets.brease.UserListStyle
     * @requires widgets.brease.GroupBox
     * @requires widgets.brease.FlexLayoutPanel
     * @requires widgets.brease.Password
     * @iatMeta studio:isContainer
     * true
     * 
     * @iatMeta category:Category
     * Data,User
     *
     * @iatMeta description:short
     * UserList widget that displays Users configured in MpUserX
     * @iatMeta description:de
     * UserList Widget für die Darstellung von Benutzern welche in MpUserX konfiguriert sind
     * @iatMeta description:en
     * UserList widget that displays Users configured in MpUserX
     */

    /**
     * @event ItemClick
     * @iatStudioExposed
     * Fired when a row is clicked on.
     * @param {String} UserName
     * @param {String} FullName
     * @param {Boolean} IsAdmin
     * @param {Boolean} IsLocked
     * @param {String} LastLogin
     * @param {String} horizontalPos horizontal position of click in pixel i.e '10px'
     * @param {String} verticalPos vertical position of click in pixel i.e '10px'
     */

    /**
     * @event ItemDoubleClick
     * @iatStudioExposed
     * Fired when a row is double clicked on.
     * @param {String} UserName
     * @param {String} FullName
     * @param {Boolean} IsAdmin
     * @param {Boolean} IsLocked
     * @param {String} LastLogin
     * @param {String} horizontalPos horizontal position of click in pixel i.e '10px'
     * @param {String} verticalPos vertical position of click in pixel i.e '10px'
     */

    /**
     * @property {WidgetList} children=["widgets.brease.UserListItem"]
     * @inheritdoc  
     */

    var defaultSettings = UserConfig,

        WidgetClass = SuperClass.extend(function UserList() {
            SuperClass.apply(this, arguments);
        }, defaultSettings),

        p = WidgetClass.prototype;

    p.initModel = function () {
        this.model = new Model(this);
        this.model.initialize();
        this.setEnable(false);
    };

    p.initController = function () {
        this.controller = new Controller(this);
        this.controller.initialize();
    };

    p.initRenderer = function () {
        this.renderer = new Renderer(this);
        this.renderer.initialize();
    };

    /**
     * @method setImageIsAdmin
     * Sets imageIsAdmin
     * @param {ImagePath} imageIsAdmin
     */
    p.setImageIsAdmin = function (imageIsAdmin) {
        this.settings.imageIsAdmin = imageIsAdmin;
        if (brease.config.editMode) {
            this.controller.updateData();
        }
    };

    /**
     * @method getImageIsAdmin
     * Returns imageIsAdmin
     * @return {ImagePath}
     */
    p.getImageIsAdmin = function () {
        return this.settings.imageIsAdmin;
    };

    /**
     * @method setImageIsLocked
     * Sets isLocked image
     * @param {ImagePath} imageIsLocked
     */
    p.setImageIsLocked = function (imageIsLocked) {
        this.settings.imageIsLocked = imageIsLocked;
        if (brease.config.editMode) {
            this.controller.updateData();
        }
    };

    /**
     * @method getImageIsLocked
     * Returns isLocked iamge
     * @return {ImagePath}
     */
    p.getImageIsLocked = function () {
        return this.settings.imageIsLocked;
    };

    /**
     * @method setHeaderSorting
     * Sets headerSorting
     * @param {Boolean} headerSorting
     */
    p.setHeaderSorting = function (headerSorting) {
        this.settings.headerSorting = headerSorting;
    };

    /**
     * @method getHeaderSorting
     * Returns headerSorting
     * @return {Boolean}
     */
    p.getHeaderSorting = function () {
        return this.settings.headerSorting;
    };

    p._updateData = function (message, telegram) {
        //TODO
    };

    p._isAllowedToModify = function (rowUserData) {
        if (this.model.getEditUserWithSameLevel()) {  
            return (rowUserData.userLevel <= this.model.getUserLevel());
        } else {
            return (rowUserData.userLevel < this.model.getUserLevel());
        }
    };

    p._resolveEditUserSameLevel = function (def, rowUserData) {
        var widget = this;
        
        this.model.loadData().then(function () {
            var idx = widget.model.getIndexOfUserName(rowUserData.userName);
            if (idx === -1) {
                def.resolve(Enum.MpUserXError.USER_DOESNT_EXIST);
                return;
            }
            widget._retrieveEditUserSameLevel(def).then(function () {
                if (widget._isAllowedToModify(rowUserData)) {
                    widget.controller.setSelectedItem(idx);
                    widget.controller.openConf('modifyuser');
                    def.resolve(Enum.MpUserXError.SUCCESS);
                } else {
                    def.resolve(Enum.MpUserXError.INSUFFICIENT_RIGHTS);
                }
            },
            function () {
                def.resolve(Enum.MpUserXError.INSUFFICIENT_RIGHTS);
            });
        }).catch(function () {
            def.resolve(Enum.MpUserXError.INSUFFICIENT_RIGHTS);
        });
        return def.promise();
    };

    p._retrieveEditUserSameLevel = function () {
        var def = $.Deferred();
        this.controller.retrieveEditUserSameLevel(def);
        return def.promise();
    };

    /* Actions */

    /**
     * @method openConfiguration
     * Open the filter part of the configuration dialogue  
     * override abstract class iatstudioexposed tag
     * @param {MappTableConfigurationType} type (Supported types: Filtering, Sorting and Styling)  
     */

    p.enable = function () {
        if (this.model.getAdmin()) {
            SuperClass.prototype.enable.apply(this, arguments);
        }
    };

    /**
     * @method openAddUserDialog
     * @iatStudioExposed
     * @return {Integer}
     * 
     */
    p.openAddUserDialog = function () {
        if (this.model.getAdmin() && !this.isDisabled) {
            this.controller.openConf('adduser');
            return Enum.MpUserXError.SUCCESS;
        }
        return Enum.MpUserXError.INSUFFICIENT_RIGHTS;
    };

    /**
     * @method openModifyUserDialog
     * @iatStudioExposed
     * @return {Promise}
     * 
     */
    p.openModifyUserDialog = function () {
        if (!this.model.getAdmin() || this.isDisabled) { return Enum.MpUserXError.INSUFFICIENT_RIGHTS; }
        var def = $.Deferred();
        var rowUserData = this.renderer.getCurrentRow();
        if (rowUserData) {
            if (rowUserData.userName === 'Anonymous') {
                def.resolve(Enum.MpUserXError.ACTION_NOT_ALLOWED);
            } else {
                this._resolveEditUserSameLevel(def, rowUserData);
            }
        } else {
            def.resolve(Enum.MpUserXError.USER_DOESNT_EXIST);
        }
        return def.promise();
    };

    /**
     * @method deleteUser
     * @iatStudioExposed
     * @return {Integer}
     */
    p.deleteUser = function () {
        var deferred = $.Deferred();
        if (this.model.getAdmin() && !this.isDisabled) {
            this.controller.deleteUser().then(function (response) {
                deferred.resolve(response.code);
            });
        } else {
            return Enum.MpUserXError.INSUFFICIENT_RIGHTS;
        }
        return deferred.promise();
    };

    /* End Actions */

    /* EVENTS */

    /**
     * @method
     * Method will dispatch the userEvent event
     * @param {String} eventName 
     * @param {Object} data 
     */
    p.userEvent = function (eventName, data) {
        if (this.isDisabled) { return; }
        /**
         * @event UserAdded
         * @iatStudioExposed
         * Fired when a user is added.
         * @param {String} UserName
         * @param {Integer} Code
         */

        /**
         * @event UserModified
         * @iatStudioExposed
         * Fired when a user is modified.
         * @param {String} UserName
         * @param {Integer} Code
         */
        var userEvent = this.createEvent(eventName, data);
        userEvent.dispatch();
    };

    /* End EVENTS */

    p.dispose = function () {
        this.controller._contentDeactivatedHandler();
        SuperClass.prototype.dispose.apply(this, arguments);
    };

    p.wake = function () {
        this.controller._addClassSpecificEventListeners(this.controller);
        this.model.loadData().catch(function () {});
        SuperClass.prototype.wake.apply(this, arguments);
    };

    p.suspend = function () {
        this.controller._contentDeactivatedHandler();
        SuperClass.prototype.suspend.apply(this, arguments);
    };

    return dragAndDropCapability.decorate(WidgetClass, false);

});
