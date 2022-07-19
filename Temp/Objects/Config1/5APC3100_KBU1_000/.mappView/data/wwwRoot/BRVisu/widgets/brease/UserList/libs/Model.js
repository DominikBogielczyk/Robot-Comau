define([
    'widgets/brease/TableWidget/libs/Model',
    'brease/enum/Enum'
], function (SuperClass, Enum) {

    'use strict';
    /** 
     * @class widgets.brease.UserList.libs.Model
     * Class for storing data and manipulating this data
     */

    var defaultSettings = {},

        ModelClass = SuperClass.extend(function Model(widget) {
            SuperClass.apply(this, arguments);
            this.widget = widget;
        }, defaultSettings),

        p = ModelClass.prototype;

    /**
     * @method initialize
     * This method calls the superclass' initialize method and sets the error mode to false
     */
    p.initialize = function () {
        SuperClass.prototype.initialize.call(this);
        this.internal.admin = false;
        this.internal.userLevel = -1;
        this.internal.user = {};
        this.internal.editSameUserLevel = false;
        this.setUser(brease.user.getCurrentUser());
        if (!brease.config.editMode) {
            this.loadData().catch(function () {});
        }
    };

    /**
     * @method updateTable
     * @private
     * @param {Object[]} data An array of data as defined by the /docs/MpUser_WidgetConnection.docx
     * This method will store the retrieved data in the right position, and either append or prepend the data to already existing data, it will also create
     * a second variable to store the original state of the data, this is useful for when the filtering is to take place and there is data that isn't tampered
     * with.
     */
    p.updateTable = function (data) {

        if (data === undefined) { return; }
        this.currentData = _.cloneDeep(data); //Store data to calculate
        this.data = _.cloneDeep(data);

        //Add User pictures to the User list and fix timestamp at the same time
        for (var itr = 0; itr < this.data.length; itr += 1) {
            this.data[itr] = this._addSVGToRow(this.data[itr]);
            this.data[itr].lastLogin = this._fixTimestamp(this.data[itr].lastLogin);
            this.data[itr].roles = this.data[itr].roles.join(', ');
        }

        this._updateTable(this.data);

    };

    /**
     * @method setMockData
     * Only to be called in the editor. Will grab some mock data to display in the editor.
     */
    p.setMockData = function () {
        // if (!brease.config.editMode) { return false; }
        this._successLoadUserList(_mockEditorData());
    };

    /**
     * @method getName
     * @param {Integer} selectedIndex
     * @returns {String}
     * This method will return the Name of the index passed to the function
     */
    p.getName = function (selectedIndex) {
        return this.currentData[selectedIndex].Name;
    };

    /**
     * @method getIndexOfUserName
     * @param {String} userName 
     * @returns {Integer} data index or -1 if not found 
     * This method returns data index of given userName
     */
    p.getIndexOfUserName = function (userName) {
        return this.data.findIndex(function (userData) {
            return userData.userName === userName;
        });
    };

    /**
     * @method setAdmin
     * @param {Boolean} admin
     * This method will set the widget to whether it's used as admin or not
     */
    p.setAdmin = function (admin) {
        if (this.internal.admin && !admin) {
            this.setData();
        }

        this.internal.admin = admin;
    };

    /**
     * @method getAdmin
     * @returns {Boolean}
     * This method will get the widget status to whether it's used as admin or not
     */
    p.getAdmin = function () {
        return this.internal.admin;
    };

    /**
     * @method setUserLevel
     * @returns {Integer} userLevel
     * This method will set the user level of the logged in user.
     */

    p.setUserLevel = function (userLevel) {
        this.internal.userLevel = userLevel;
    };

    /**
     * @method getUserLevel
     * @returns {Integer}
     * This method will get the user level of the logged in user.
     */
    p.getUserLevel = function () {
        return this.internal.userLevel;
    };

    /**
     * @method getUser
     * @returns {Integer}
     * This method will get the user level of the logged in user.
     */
    p.getUser = function () {
        return this.internal.user;
    };

    p.setUser = function (user) {
        this.internal.user = user;
    };

    p.setEditUserWithSameLevel = function (editSameUserLevel) {
        this.internal.editSameUserLevel = editSameUserLevel;
    };

    p.getEditUserWithSameLevel = function () {
        return this.internal.editSameUserLevel;
    };

    /**
     * @method setData
     * @param {Object} telegram
     * intermediary function to handle the telegram in the correct place.
     */
    p.setData = function (telegram) {
        if (this.internal.admin && telegram !== null && telegram !== undefined) {
            this.updateTable(telegram);
        } else {
            this.updateTable([]);
        }
    };
    
    /**
     * @method sendData
     * This method will send a request to the backend to get the Userlist again by sending the method id GetUserList.
     */
    p.sendData = function () {
        // this.widget.linkHandler.sendRequestAndProvideCallback('GetUserList', this.widget._updateData);    
    };

    /**
     * @method _addSVGToRow
     * @private
     * @param {Object} row entire row that needs to be fixed
     * @returns {String}
     * 
     */
    p._addSVGToRow = function (row) {

        var locked = '';
        if (row.isLocked) {
            locked = (this.widget.settings.imageIsLocked === '') ? 'widgets/brease/UserList/assets/IsLocked.svg' : this.widget.settings.imageIsLocked;
            row.isLocked = '<img src="' + locked + '" /><div class="stateIdent">' + row.isLocked + '</div>';
        } else {
            row.isLocked = '<div class="stateIdent">' + row.isLocked + '</div>';
        }

        var admin = '';
        if (row.isAdmin) {
            admin = (this.widget.settings.imageIsAdmin === '') ? 'widgets/brease/UserList/assets/IsAdmin.svg' : this.widget.settings.imageIsAdmin;
            row.isAdmin = '<img src="' + admin + '" /><div class="stateIdent">' + row.isAdmin + '</div>';
        } else {
            // admin = (this.widget.settings.imageIsNotAdmin === '') ? 'widgets/brease/UserList/assets/NotAdmin.svg' : this.widget.settings.IsNotAdmin;
            row.isAdmin = '<div class="stateIdent">' + row.isAdmin + '</div>';
        }

        return row;
    };

    /**
     * @method _updateTable
     * @param {Object[]} data array of data to set in the frontend
     */
    p._updateTable = function (data) {
        this.widget.renderer.updateData(data);
    };

    //Communication
    /**
     * @method loadData
     * This method will load the list of available users from the backend
     * If the list cannot be loaded it will throw the error 204.
     */
    p.loadData = function () {
        var model = this;
        return new Promise(function (resolve, reject) {
            var getAllData = true;
            brease.user.loadUserList(getAllData)
                .then(function (response, data) {
                    if (response.code === Enum.MpUserXError.SUCCESS) {
                        model._successLoadUserList(data.userData);
                        resolve();
                    } else {
                        model._failLoadUserList(response.code);
                        reject(new Error('Error code: ' + response.code));
                    }
                })
                .fail(function (fail) {
                    if (fail) {
                        model._setOnErrorCode(fail.code);
                        reject(new Error('Error code: ' + fail.code));
                    }
                });
        });
    };

    /**
     * @method 
     * @private
     * method to enable and display the user list
     * @param {Object[]} data array of User objects to be displayed in the list
     */
    p._successLoadUserList = function (data) {
        this.setAdmin(true);
        this.widget.setEnable(true);
        var loggedUserData = this.searchLoggedUserInUserlist(this.getUser().userID, data);
        if (loggedUserData) {
            this.setUserLevel(loggedUserData.userLevel);
        }
        this.setData(data);
        // A&P 711625: UserList: OnError is set back to MpUserXError.SUCCESS after successful login as MpUserX admin
        this._setOnErrorCode(Enum.MpUserXError.SUCCESS);

    };

    p.searchLoggedUserInUserlist = function (userId, data) {
        var userName = userId, userData;
        Object.getOwnPropertyNames(data).forEach(function (val) {
            if (data[val].userName === userName) {
                userData = data[val];
                return userData;

            }
        });
        return userData;
    };

    /**
     * @method 
     * @private
     * method to disable and hide the user list
     * @param {Integer} code error code which is to be sent to the front end
     * @param {String} message message of the error send to the frontend
     */
    p._failLoadUserList = function (code) {
        this.setAdmin(false);
        this.widget.setEnable(false);
        this.setData([]);
        this._setOnErrorCode(code);
    };

    /**
     * @method addUser
     * this method will call the framework to add a user to the list of users. It will thereafter
     * thrown an userAdded event which contains information about whether adding the user was 
     * successful or not and then reload the new list again so it's up to date.
     * @param {Object} userData object containing all information needed to add a user in the backend
     * @param {String} userData.userName the user name
     * @param {String} userData.fullName the full name of the user (optional)
     * @param {String[]} userData.roles the list of roles belonging to the user (optional)
     * @param {String} userData.newPassword the password of the user
     *  
     */
    p.addUser = function (userData) {
        var model = this;
        brease.user.addUserToMpUserX(userData.userName, userData.newPassword, userData.fullName, userData.roles)
            .then(function (response) {
                model._successAddUser(response, userData.userName);
            },
            function (fail) {
                if (fail) {
                    model._setOnErrorCode(fail.code);
                }
            });
    };

    /**
     * @method modifyUser
     * this method will call the framework to add a user to the list of users. It will thereafter
     * thrown an userAdded event which contains information about whether adding the user was 
     * successful or not and then reload the new list again so it's up to date.
     * @param {String} userName string containing the name of the user.
     * @param {Object} modifiedUserData object containing all information needed to modify a user in the backend
     */
    p.modifyUser = function (userName, modifiedUserData) {
        var model = this;
        modifiedUserData = this._prepareModifiedUserData(modifiedUserData);
        brease.user.modifyUserFromMpUserX(userName, modifiedUserData)
            .then(function (response) {
                model._successModifyUser(response, userName);
            },
            function (fail) {
                if (fail) {
                    model._setOnErrorCode(fail.code);
                }
            });
    };

    p._successAddUser = function (response, userName) {
        if (response) {
            var eventName = 'UserAdded';
            this.widget.controller.userEvent(response, userName, eventName);
            if (response.code === Enum.MpUserXError.SUCCESS) {
                this.loadData().catch(function () {});
            }
        }
    };

    p._successModifyUser = function (response, userName) {
        var success = true;
        Object.getOwnPropertyNames(response).forEach(function (val) {
            if (response[val].code !== Enum.MpUserXError.SUCCESS) {
                success = false;
                return success;

            }
        });
        if (success) {
            var eventName = 'UserModified';
            response.code = 1;
            this.widget.controller.userEvent(response, userName, eventName);
            this.loadData().catch(function () {});
        }

    };

    p._setOnErrorCode = function (code) {
        this.widget._onErrorHandler(code);
    };
       
    p._prepareModifiedUserData = function (userdata) {
        if (userdata) {
            delete userdata.userName;
            if (userdata.newPassword && userdata.confirmPassword) {
                delete userdata.confirmPassword;
                userdata.password = userdata.newPassword;
                delete userdata.newPassword;
            }
        }
        return userdata;
    };

    p.retrieveEditUserSameLevel = function (deferred) {
        var model = this;
        brease.user.getUserSettingsFromMpUserX().then(
            function (response) {
                model._successRetrieveEditUserSameLevel(response);
                deferred.resolve(response);
            },
            function (fail) {
                if (fail) {
                    model._setOnErrorCode(fail.code);
                    deferred.reject(fail);
                }
            }
        );

    };
    p._successRetrieveEditUserSameLevel = function (response) {
        var editUserWithSameLevel;
        editUserWithSameLevel = response ? response.EditUsersWithSameUserLevel : false;
        this.setEditUserWithSameLevel(editUserWithSameLevel);
    };

    /**
     * @method deleteUser
     * This method will delete the currently selected user in the user list
     * and then reload the new list again so it's up to date.
     */
    p.deleteUser = function (deferred) {
        var model = this,
            userData = this.widget.renderer.getCurrentRow(),
            userName = userData ? userData.userName : undefined;
        brease.user.deleteUserFromMpUserX(userName).then(
            function (response) {
                model._successDeleteUser(response);
                deferred.resolve(response);
            },
            function (fail) {
                if (fail) {
                    model._setOnErrorCode(fail.code);
                    deferred.reject(fail);
                }
            }
        );
    };
    p._successDeleteUser = function (response) {
        if (response) {
            if (response.code === Enum.MpUserXError.SUCCESS) {
                this.loadData().catch(function () {});
            }
        }
    };
    /**
     * @method _mockEditorData
     * @private
     * @returns {Object} telegram for editor, not to be used in runtime
     */
    function _mockEditorData() {
        return [
            { 'userName': 'Augustus', 'fullName': 'Imperator Caesar Augustus', 'roles': ['Imperator'], 'isAdmin': true, 'isLocked': false, 'lastLogin': '1970-01-01T00:00:01.000Z' },
            { 'userName': 'Tiberius', 'fullName': 'Tiberius Caesar Augustus', 'roles': ['Admin', 'Imperator'], 'isAdmin': true, 'isLocked': false, 'lastLogin': '1970-01-01T11:33:15.141Z' },
            { 'userName': 'Caligula', 'fullName': 'Gaius Caesar Augustus Germanicus', 'roles': ['Service', 'Imperator'], 'isAdmin': true, 'isLocked': true, 'lastLogin': '1970-01-01T11:31:56.541Z' },
            { 'userName': 'Claudius', 'fullName': 'Tiberius Claudius Caesar Augustus Germanicus', 'roles': ['Operator', 'Imperator'], 'isAdmin': false, 'isLocked': true, 'lastLogin': '1970-01-01T11:33:15.141Z' },
            { 'userName': 'Nero', 'fullName': 'Nero Claudius Caesar Augustus Germanicus', 'roles': ['Harpist'], 'isAdmin': false, 'isLocked': true, 'lastLogin': '1970-01-01T11:31:56.341Z' },
            { 'userName': 'Vespasian', 'fullName': 'Caesar Vespasianus Augustus', 'roles': ['Service', 'Imperator'], 'isAdmin': false, 'isLocked': false, 'lastLogin': '1970-01-01T11:31:55.741Z' },
            { 'userName': 'Aurelius', 'fullName': 'Marcus Aurelius Antonius', 'roles': ['Operator', 'Imperator'], 'isAdmin': false, 'isLocked': false, 'lastLogin': '1970-01-01T11:31:55.865Z' }
        ];
    }

    return ModelClass;

});
