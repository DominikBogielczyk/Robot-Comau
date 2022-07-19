define([
    'widgets/brease/UserList/libs/UserSettingsWidget',
    'brease/core/StringUtils', 
    'brease/events/BreaseEvent'
], function (
    SuperClass, StringUtils, BreaseEvent
) {
    
    'use strict';

    /** 
     * @class widgets.brease.UserList.libs.ModifyUserSettings
     * @extends brease.core.Class
     * 
     * If this is very hard to grasp, which I might understand if it is, I'd recommend that you open up a dialog in the runtime and a have a look at what
     * it looks like and how it works. This is going to clear things up a lot.
     */

    var UserClass = SuperClass.extend(function UserSetting(dialog, widget, lang, texts) {
            SuperClass.apply(this, arguments);
        }, null),

        p = UserClass.prototype;

    /**
     * @method initialize
     * @returns {Object}
     * This method will instantiate an empty dialog, and if there has been a sorting configuration stored it will with this information
     * initialize any stored information in the dialog.
     */
    p.initialize = function () {
        this.config.names = {
            pwrules: 'pwrules',
            roles: 'roles'
        };
        this.config.pwruleswidth = 340;
        this.config.data = this.widget.model.getRowFromCurrentData(this.widget.controller.getSelectedItem());
        SuperClass.prototype.initialize.apply(this, arguments);
        
        return this.config;
    };

    /**
     * @method _createWidgets
     * @private
     * @param {UInteger} i
     * @returns {Object}
     */
    p._createWidgets = function () {
        var row = [];

        var LEFT_COL_0 = 20,
            LEFT_COL_1 = 140,
            LEFT_COL_2 = 380,
            TOP_ROW_0 = 20,
            TOP_ROW_1 = 60,
            TOP_ROW_2 = 100,
            TOP_ROW_3 = 140,
            TOP_ROW_4 = 180,
            TOP_ROW_5 = 390,
            WIDTH_COL_0 = 113,
            WIDTH_COL_1 = 220,
            WIDTH_GB_0 = 200, 
            WIDTH_GB_1 = this.config.pwruleswidth,
            HEIGHT_GB_0 = 400,
            HEIGHT_GB_1 = 200;//with advanced button below the value 239 should be 200px

        var data = this.config.data;

        //Main input section 
        row.push(this._getLabel('Label_UserName', this.texts.USERNAME, LEFT_COL_0, TOP_ROW_0, WIDTH_COL_0));
        // row.push(this._getTextInput('TextInput_UserName', this.texts.PLH_USERNAME, LEFT_COL_1, TOP_ROW_0, WIDTH_COL_1, data.userName, false));
        row.push(this._getLabel('TextInput_UserName', data.userName, LEFT_COL_1, TOP_ROW_0, WIDTH_COL_1));

        row.push(this._getLabel('Label_FullName', this.texts.FULLNAME, LEFT_COL_0, TOP_ROW_1, WIDTH_COL_0));
        row.push(this._getTextInput('TextInput_FullName', this.texts.PLH_FULLNAME, LEFT_COL_1, TOP_ROW_1, WIDTH_COL_1, data.fullName));

        row.push(this._getButton('Button_Change_Password', this.texts.BTN_CHANGE_PASSWORD, LEFT_COL_1, TOP_ROW_2, WIDTH_COL_1));

        row.push(this._getLabel('Label_Password', this.texts.PASSWORD, LEFT_COL_0, TOP_ROW_2, WIDTH_COL_0, false));
        row.push(this._getPassword('Password_Password', this.texts.PLH_PASSWORD, LEFT_COL_1, TOP_ROW_2, WIDTH_COL_1, false));

        row.push(this._getLabel('Label_Confirm', this.texts.CONFIRM_PASSWORD, LEFT_COL_0, TOP_ROW_3, WIDTH_COL_0, false));
        row.push(this._getPassword('Password_Confirm', this.texts.PLH_CONFIRM_PASSWORD, LEFT_COL_1, TOP_ROW_3, WIDTH_COL_1, false));
        
        row.push(this._getGroupBox('GroupBox_Roles', this.texts.ROLES_HEADER, this.config.names.roles, LEFT_COL_2, TOP_ROW_0, WIDTH_GB_0, HEIGHT_GB_0, true)); 
        
        row.push(this._getGroupBox('GroupBox_PasswordRules', this.texts.ERROR_HEADER, this.config.names.pwrules, LEFT_COL_0, TOP_ROW_4, WIDTH_GB_1, HEIGHT_GB_1, false));
        
        // row.push(this._getButton('Button_Advanced', this.texts.BTN_ADVANCED, 20, 390, 120));
        var user = brease.user.getCurrentUser();
        if (user.userID !== data.userName && user.isAuthenticated) {
            var mdi = 'widgets/brease/UserList/assets/Accept.svg'; //MouseDownImage));
            row.push(this._getCheckBox('Button_Reset_Lock', this.texts.BTN_RESET_LOCK, LEFT_COL_1, TOP_ROW_5, WIDTH_COL_1, true, true, mdi, '', data.isLocked)); 
            // this._getCheckBox('CheckBox_' + r + '_' + j, roles[j], 20, 0, (w - 40), cbEnabled, cbVisible, mdi, '', check)
        }
        this.setInitialFocusWidgetName('TextInput_FullName');
        return row;
    };

    /**
     * @method 
     * @private
     * This method will update the closing button (disabling it) and
     * instantiate the necessary widgets for the user to use.
     */
    p._initWidgets = function () {
        SuperClass.prototype._initWidgets.apply(this, arguments);
        this._handleClosingButton(true);
        this.dialog.el.on(BreaseEvent.CLICK, this._bind('_handleClick'));
        this.dialog.el.on('ValueChanged', this._bind('_handleChanges'));
    };

    /**
     * @method 
     * @private
     * This method will handle the change of a widget and update the dialog
     * accordingly, giving the user the possibility to return all values to
     * the backend (OK - button) if it's correct.
     * @param {Event} e event triggered by a change
     */
    p._handleChanges = function (e) {
        var info = {},
            passwordChange,
            results = {},
            omitPasswordValidation = this.dialog.getWidgetByName('Button_Change_Password').isVisible();

        this._getDataFromForms(info);
        passwordChange = info.hasOwnProperty('newPassword') || info.hasOwnProperty('confirmPassword');

        var updatePasswordVis = e.target.id.includes('Password_Password') || e.target.id.includes('Password_Confirm');
        results.newPassword = omitPasswordValidation;
        results.confirmPassword = omitPasswordValidation;

        if (passwordChange) {
            results.newPassword = this._handlePassword(info.newPassword, updatePasswordVis);
            results.confirmPassword = this._handlePasswordConfirm(info, updatePasswordVis);
        }

        results.roles = this._handleRolesUpdate();

        this._handleClosingButton(results.newPassword && results.confirmPassword && results.roles);
    };

    /**
     * @method 
     * @private
     * This method will handle the click event from the change password button.
     * If it's clicked we want to remove this widget and display the password
     * inputs and the policy/password rules groupbox and subsequently the widgets
     * inside the groupbox.
     * @param {Event} e event triggered by a change
     * 
     */
    p._handleClick = function (e) {
        if (e.target.id.includes('Button_Change_Password')) {
            this.dialog.el.off(BreaseEvent.CLICK, this._bind('_handleClick'));
            var w = this.dialog.getWidgetByName('Button_Change_Password');
            w.setVisible(false);
            var widgets = ['Label_Password', 'Password_Password', 'Label_Confirm', 'Password_Confirm', 'GroupBox_PasswordRules'];
            for (var i = 0; i < widgets.length; i += 1) {
                w = this.dialog.getWidgetByName(widgets[i]);
                w.setVisible(true);
                if (i === 1) {
                    w.elem.focus();
                }
            }
            this._handleClosingButton(false);
        }
    };

    /**
     * @method 
     * @private
     * This method will evaluate the given password and check if it lives
     * up to the specified password policy given by the backend
     * @param {String} pwd the password that is currently written into
     * the password TextInput
     * @returns {Boolean} if all policies are true the method returns true
     */
    p._handlePassword = function (pwd, toggleVis) {
        var result = this.validator.testPolicies(pwd, this.config.policies);

        if (toggleVis) {
            this._updateWidgetRulesHandler(this.config.names.pwrules + '_alpha', result.alphanumeric);
            this._updateWidgetRulesHandler(this.config.names.pwrules + '_mixed', result.mixedCase);
            this._updateWidgetRulesHandler(this.config.names.pwrules + '_min', result.minLength);
            this._updateWidgetRulesHandler(this.config.names.pwrules + '_special', result.specialChar);
        }
        return result.alphanumeric && result.mixedCase && result.minLength && result.specialChar;
    };
    
    /**
     * @method 
     * @private
     * This method vill validate the added information and check whether it's
     * correct according to the rules set up by the backend. It will also check
     * that the confirm password and password are the same.
     * @param {Object} info info object containing necessary data to evaluate 
     * the password policy and username/fullname policy
     * @param {String} info.userName 
     * @param {String} info.fullName 
     * @param {String} info.newPassword 
     * @param {String} info.confirmPassword
     * @param {Boolean} toggleVis whether the visibility of the widgets should be toggled or not
     * @returns {Boolean} returns whether the data is validated or not
     */
    p._handlePasswordConfirm = function (info, toggleVis) {
        var validatedData = this.validator.validate(['confirmPassword'], info);

        if (toggleVis) {
            this._updateWidgetVisibility('Label_' + this.config.names.pwrules + '_pwd_diff', validatedData.arInputs.includes('confirmPassword'));
            this._updateWidgetVisibility('Image_' + this.config.names.pwrules + '_pwd_diff', validatedData.arInputs.includes('confirmPassword'));
        }        
        return validatedData.isValid;
    };

    /**
     * @method 
     * @private
     * This method checks that at least one role as been assigned to the user
     * @returns {Boolean} if at least one role has been assigned, the method
     * returns true
     */
    p._handleRolesUpdate = function () {
        var roles = this._getRolesFromForm();
        // this._updateCheckBoxVisibility('CheckBox_' + this.config.names.pwrules + '_roles_empty', (roles.length === 0));
        return (roles.length > 0);
    };

    /**
     * @method 
     * @private
     * This method will toggle the visibility of a widget to whichever value
     * is passed on the result variable
     * @param {String} name name of the widget part of the dialog widget
     * @param {Boolean} result if the value should be toggled to true or false
     */
    p._updateWidgetVisibility = function (name, result) {
        var id = 'GenericDialog_' + name;
        var cb = brease.callWidget(id, 'widget');

        if (cb) {
            cb.setVisible(result);
        }
    };
    /**
     * @method 
     * @private
     * This method will update the Label and Image that belongs to a rule, dividing
     * up the information needed by the two different widgets
     * @param {String} name the name of the widgets to be changed
     * @param {Boolean} result the result switching between images
     */
    p._updateWidgetRulesHandler = function (name, result) {
        this._updateWidgetRules('Label_' + name, result);
        this._updateWidgetRules('Image_' + name, result, true);
    };

    /**
     * @method 
     * @private
     * This method will toggle the visibility of a widget to whichever value
     * is passed on the result variable
     * @param {String} name name of the widget part of the dialog widget
     * @param {Boolean} result if the value should be toggled to true or false
     * @param {Boolean} img image source if it should be updated
     */
    p._updateWidgetRules = function (name, result, img) {
        var id = 'GenericDialog_' + name;
        var cb = brease.callWidget(id, 'widget');

        if (cb) {
            cb.el.removeClass('success fail');
            if (result) {
                cb.el.addClass('success');
            } else {
                cb.el.addClass('fail');
            }
            if (img) {
                var src = (result) ? 'widgets/brease/UserList/assets/Accept.svg' : 'widgets/brease/UserList/assets/Reject.svg';
                cb.setImage(src);
            }
            cb.setVisible(true);
        }
    };

    /**
     * @method 
     * This method collects all data that is necessary for MpUserX to
     * create a new user in the system
     * @param {Event} e 
     */
    p._widgetCollectStateBeforeClosing = function (e) {
        if (this.validData) {
            
            this.dialog.el.off('ValueChanged', this._bind('_handleChanges'));
            var data = {
                userName: this.config.data.userName
            };
            //First check if we have new passwords
            this._getDataFromForms(data);
            var roles = this._getRolesFromForm();
            var rolesUpdated = !(roles.length === this.config.data.roles.length && this.config.data.roles.every(function (value, index) { return value === roles[index]; }));
            if (rolesUpdated) {
                data.roles = roles;
            }

            var userLocked = this._getLockedUser();
            if (userLocked !== this.config.data.isLocked) {
                data.isLocked = userLocked;
            }

            return data;
        }
    };

    /**
     * @method 
     * @private
     * This method will get the widget button that sets a user as locked or not
     * @returns {Boolean} returns if the user is locked or not
     */
    p._getLockedUser = function () {
        var w = this.dialog.getWidgetByName('Button_Reset_Lock'), ret = false;
        if (w) {
            ret = w.getValue();
        }
        return ret;
    };

    /**
     * @method 
     * @private
     * This method will collect all selected roles for a user
     * return these in an array.
     * @returns {String[]} roles selected
     */
    p._getRolesFromForm = function () {
        var roles = [], cb, id;
        for (var j = 0; j < this.config.roles.length; j++) {
            id = 'GenericDialog_CheckBox_' + this.config.names.roles + '_' + j;
            cb = brease.callWidget(id, 'widget');
            if (cb.getValue()) {
                roles.push(this.config.roles[j]);
            }
        }
        return roles;
    };

    /**
     * @method 
     * @private
     * This method will collect the Username, the Fullname, the password
     * the confirmed password and store this in an object which it returns
     * @param {Object} data the object where all data will be stored
     * @returns {Object}
     */
    p._getDataFromForms = function (data) {
        this._getDataFromFormsHelper('TextInput_FullName', data, 'fullName');
        this._getDataFromFormsHelper('Password_Password', data, 'newPassword');
        this._getDataFromFormsHelper('Password_Confirm', data, 'confirmPassword');
        // return data;
    };

    /**
     * @method 
     * @private
     * Helper function for the _getDataFromForms method
     * @param {String} id the id of the widget we should call
     * @param {Object} blob the object where the data should be stored
     * @param {String} bid the id on where the data in the object should be stored, the key so to say
     */
    p._getDataFromFormsHelper = function (id, blob, bid) {
        var w = this.dialog.getWidgetByName(id);
        if (w) { 
            var val = w.getValue(); 
            if (val && this.config.data[bid] !== val) {
                blob[bid] = val;
            }
        }
        return blob;
    };

    /**
     * @method 
     * @private
     * This method will add all necessary widgets to the Dialog for the
     * user to interact with the widget, and position these accordingly.
     * @param {Object[]} content reference array of content
     * @param {String} r the type of groupbox the widgets belong to
     * @param {Number} w width of the CheckBox
     */
    p._addContentRules = function (content, r) {
        var info = {
            mdi: 'widgets/brease/UserList/assets/Accept.svg', //mouseDownImage
            mui: 'widgets/brease/UserList/assets/Reject.svg', //mouseUpImage
            cbEnabled: false, //Enabled
            cbVisible: false, //Visible
            setWordWrap: true, //set word wrap in label
            w: undefined //width
        };
        var left = 10,
            top = 0,
            flp;
        info.cbVisible = true;

        if (this.config.policies.alphanumeric) {
            flp = this._getFlexLayoutPanel('FLP_' + r + '_alpha');
            flp.content = [
                this._getImage('Image_' + r + '_alpha', info.mui, left, top, info.cbVisible),
                this._getLabel('Label_' + r + '_alpha', this.config.textKeys.alphanumeric, left, top, info.w, info.cbVisible, info.setWordWrap)
            ];
            content.push(flp);
        }
        if (this.config.policies.mixedCase) {
            flp = this._getFlexLayoutPanel('FLP_' + r + '_mixed');
            flp.content = [
                this._getImage('Image_' + r + '_mixed', info.mui, left, top, info.cbVisible),
                this._getLabel('Label_' + r + '_mixed', this.config.textKeys.mixedCase, left, top, info.w, info.cbVisible, info.setWordWrap)
            ];
            content.push(flp);
        }
        if (this.config.policies.minLength > 0) {
            flp = this._getFlexLayoutPanel('FLP_' + r + '_min');
            this.config.textKeys.minLength = this.config.textKeys.minLength.replace('{1}', this.config.policies.minLength);
            flp.content = [
                this._getImage('Image_' + r + '_min', info.mui, left, top, info.cbVisible),
                this._getLabel('Label_' + r + '_min', this.config.textKeys.minLength, left, top, info.w, info.cbVisible, info.setWordWrap)
            ];
            content.push(flp);
        }
        if (this.config.policies.specialChar) {
            flp = this._getFlexLayoutPanel('FLP_' + r + '_special');
            flp.content = [
                this._getImage('Image_' + r + '_special', info.mui, left, top, info.cbVisible),
                this._getLabel('Label_' + r + '_special', this.config.textKeys.specialChar, left, top, info.w, info.cbVisible, info.setWordWrap, info.setWordWrap)
            ];
            content.push(flp);
        }

        flp = this._getFlexLayoutPanel('FLP_' + r + '_pwd_diff');
        flp.content = [
            this._getImage('Image_' + r + '_pwd_diff', info.mui, left, top, info.cbVisible),
            this._getLabel('Label_' + r + '_pwd_diff', this.texts.PASSWORD_PASSWORDS_DIFFERENT, left, top, info.w, info.cbVisible, info.setWordWrap)
        ];
        content.push(flp);

        //Make sure we can update the policy colors directly
        this.config.policyWidgets = 0;
        this.config.policyMaxWidgets = content.length * 3;
        this.dialog.el.on(BreaseEvent.WIDGET_READY, this._bind('_setPolicyClass'));
    };
    /**
     * @method 
     * @private
     * This class will set the class policy and fail of the
     * widgets belonging to the rules when these are instantiated.
     * @param {Object} e event
     */
    p._setPolicyClass = function (e) {
        var id = e.target.id;
        if (id.indexOf('pwrules') > -1) {
            e.target.classList.add('policy');
            e.target.classList.add('fail');
            this.config.policyWidgets++;
            if (this.config.policyWidgets === this.config.policyMaxWidgets) {
                this.config.policyWidgets = 0;
                this.dialog.el.off(BreaseEvent.WIDGET_READY, this._bind('_setPolicyClass'));
            }

            if (id.indexOf('Image') > -1) {
                var w = $(e.target);
                w.next().css('max-width', this.config.pwruleswidth - w.width());
            }
        }
    };

    /**
     * @method 
     * @private
     * This method will add Checkboxes to a content array that is used
     * by the Rules (Policy) Groupbox
     * @param {Object[]} content array of content to add widgets to
     * @param {String} id id of the widget
     * @param {String} text display text of the widget
     * @param {Object} info info object containing necessary data to evaluate 
     * @param {String} info.userName 
     * @param {String} info.fullName 
     * @param {String} info.newPassword 
     * @param {String} info.confirmPassword
     */
    p._createCheckBox = function (content, id, text, info) {
        content.push(this._getCheckBox(id, text, 20, 0, (info.w - 40), info.cbEnabled, info.cbVisible, info.mdi, info.mui));
    };

    /**
     * @method 
     * @private
     * This method will add Checkboxes to the content array that is used
     * by the Roles Groupbox
     * @param {Object[]} content array of content to add widgetst tp
     * @param {String} r the type of groupbox the widgets belong to
     * @param {Number} w width of the CheckBox
     */
    p._addContentRoles = function (content, r, w) {
        var roles = this.config.roles,
            cbEnabled = true, //enabled
            cbVisible = true, //visible
            // mui = 'widgets/brease/UserList/assets/Reject.svg', //MouseUpImage
            mdi = 'widgets/brease/UserList/assets/Accept.svg'; //MouseDownImage
        for (var j = 0; j < roles.length; j++) {
            var check = this.config.data.roles.includes(roles[j]);
            content.push(this._getCheckBox('CheckBox_' + r + '_' + j, roles[j], 20, 0, (w - 40), cbEnabled, cbVisible, mdi, '', check));
        }
    };

    /**
     * @method 
     * Will most probably be removed in the future...
     * @param {String} str 
     * @param {Object} policies 
     */
    p.testPolicies = function (str, policies) {
        return this.validator.testPolicies(str, policies);
    };

    return UserClass;
});
