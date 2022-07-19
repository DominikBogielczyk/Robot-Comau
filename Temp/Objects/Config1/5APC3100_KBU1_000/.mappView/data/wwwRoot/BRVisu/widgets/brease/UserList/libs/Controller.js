define([
    'widgets/brease/TableWidget/libs/Controller',
    'brease/events/BreaseEvent',
    'widgets/brease/UserList/libs/Dialogue'
], function (SuperClass, BreaseEvent, ConfigDialogue) {

    'use strict';
    /** 
     * @class widgets.brease.UserList.libs.Controller
     * Class for controlling user and widget input and directing this either to the model or the renderer directly.
     */

    var ControllerClass = SuperClass.extend(function Controller(widget) {
            SuperClass.call(this);
            this.widget = widget;
        }, null),

        p = ControllerClass.prototype;

    /**
     * @method _addClassSpecificEventListeners
     * @private
     * Adds the event listener for content activated handler to the document which will trigger when the content the UserList resides in get's
     * actived.
     * @param {Function} listener
     */
    p._addClassSpecificEventListeners = function (listener) {

        //document.body.addEventListener(BreaseEvent.CONTENT_ACTIVATED, listener._bind('_contentActivatedHandler'));
        document.body.addEventListener(BreaseEvent.USER_CHANGED, listener._bind('_loginChanged'));
    };

    /* Commands */

    /* Handler */
    /**
     * @method _contentActivatedHandler
     * Removes the eventlistener for content activated, calls the framework 
     * to see if the user has administrator privileges, if so gets the user list.
     * @private
     * @param {Object} e
     */
    p._contentActivatedHandler = function (e) {
        if (e.detail.contentId === this.widget.settings.parentContentId && this) {
            document.body.removeEventListener(BreaseEvent.CONTENT_ACTIVATED, this._bind('_contentActivatedHandler'));
            this.widget.model.loadData().catch(function () {});
        }
    };
    /**
     * @method _contentDeactivatedHandler
     * @private
     * This method get's called when the content get's deactivated. It will unsubscribe from the server with the method
     * GetUpdateCount
     */
    p._contentDeactivatedHandler = function () {
        // this.widget.linkHandler.unSubscribe('GetUpdateCount');
    };

    /**
    * @method userEvent
    * @private
    * This method is called when a user action is successfully added
    */
    p.userEvent = function (response, username, eventname) {
        var data = {
            UserName: username,
            Code: response.code
        };
        this.widget.userEvent(eventname, data);
    };

    /**
     * @method 
     * Callback function to the event USER CHANGED, at which point
     * the entire UserList is reloaded. If the reload fails an
     * empty list is displayed. This means the list cannot differentiate
     * between a failed login and a logged out user.
     * @param {Object} e 
     */
    p._loginChanged = function () {
        this.widget.model.setUser(brease.user.getCurrentUser());
        this.widget.model.loadData().catch(function () {});
    };

    /**
     * @method languageChanged
     * This method will force the model to refetch the data from the backend, so the data is available in the correct
     * language.
     */
    p.languageChanged = function () {
        this.widget.model.setData(this.widget.model.getCurrentData());
    };

    /**
    * @method deleteUser
    * This method will force the model to delete the currently selected user in the user list, so the user is removed in the updated user list.
    */
    p.deleteUser = function () {
        var def = $.Deferred();
        this.widget.model.deleteUser(def);
        return def.promise();
    };

    /**
    * @method adduser
    * This method will force the model to add a user to the user list, so the userAdded event can be thrown
    * if adding user was successful and the user is available in the updated user list.
    */
    p.adduser = function (userData) {
        this.widget.model.addUser(userData);
    };

    /**
    * @method modifyuser
    * This method will force the model to modifiy a user which is selected in the user list, so the userModified event can be thrown
    * if modifying user was successful and the modified user is available in the updated user list.
    */
    p.modifyuser = function (userData) {
        this.widget.model.modifyUser(userData.userName, userData);
    };

    /**
    * @method retrieveEditUserSameLevel
    * This method will force the model to read the property "EditUsersWithSameLevel" from the object Data of the received response.
    */

    p.retrieveEditUserSameLevel = function (def) {
        this.widget.model.retrieveEditUserSameLevel(def);
    };

    /* Public methods */

    /**
     * @method getEventItem
     * This method will retrieve the original data (unaltered by timestamps and images) for the given row index, and put it into an object with readable names
     * and return this.
     * @param {UInteger} item
     * @returns {Object}
     */
    p.getEventItem = function (item) {
        var data = this.widget.model.getRowFromCurrentData(item);

        var value = {
            'UserName': data.userName,
            'FullName': data.fullName,
            // 'Role': data.roles,
            'IsAdmin': data.isAdmin,
            'IsLocked': data.isLocked,
            'LastLogin': (data.lastLogin !== null) ? data.lastLogin.substring(0, 23) + 'Z' : ''
        };
        return value;
    };

    /**
     * @method updateData
     * ONLY to be called in the editor
     * Set's mock data in the table and updates the renderer
     */
    p.updateData = function () {
        this.widget.model.setMockData();
        this.widget.renderer.updateData();
    };

    /**
     * @method openConf
     * This method instantiates a new configuration dialog and opens it with the type of configuration passed in the parameter
     * @param {String} type
     */
    p.openConf = function (type) {
        this.configDialogue = new ConfigDialogue(this.widget);
        this.configDialogue.open(type);
    };

    p.dispose = function () {
        SuperClass.prototype.dispose.apply(this, arguments);
        document.body.removeEventListener(BreaseEvent.USER_CHANGED, this._bind('_loginChanged'));
    };

    return ControllerClass;
});
