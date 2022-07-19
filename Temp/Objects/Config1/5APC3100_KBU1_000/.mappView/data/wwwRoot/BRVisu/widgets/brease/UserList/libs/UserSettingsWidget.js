define([
    'brease/core/Class',
    'widgets/brease/GenericDialog/libs/models/dialogWidgetModel',
    'brease/events/BreaseEvent',
    'system/widgets/ChangePasswordDialog/libs/Validator'
], function (
    SuperClass, DialogWidgetModel, BreaseEvent, Validator
) {
    
    'use strict';

    /** 
     * @class widgets.brease.UserList.libs.UserSettingsWidget
     * @extends brease.core.Class
     * 
     * If this is very hard to grasp, which I might understand if it is, I'd recommend that you open up a dialog in the runtime and a have a look at what
     * it looks like and how it works. This is going to clear things up a lot.
     */

    var UserClass = SuperClass.extend(function UserSetting(dialog, widget, lang, texts) {
            this.texts = texts;
            this.lang = lang;
            this.config = {};
            this.dialog = dialog;
            this.widget = widget;
            this.validator = new Validator();
            this.initialFocusWidgetName = '';
            SuperClass.call(this);

        }, null),

        p = UserClass.prototype;

    /**
     * @method initialize
     * @returns {Object}
     * This method will instantiate an empty dialog, and if there has been a sorting configuration stored it will with this information
     * initialize any stored information in the dialog.
     */
    p.initialize = function () {
        this.config.rows = [];
        this.config.startWidgets = [];
        
        this.config.textKeys = {
            alphanumeric: this.texts.POLICY_DESC_ALPHANUMERIC,
            mixedCase: this.texts.POLICY_DESC_MIXEDCASE,
            minLength: this.texts.POLICY_DESC_MINLENGTH,
            specialChar: this.texts.POLICY_DESC_SPECIALCHAR,
            userNameMinLength: this.texts.USERNAME_DESC_MINLENGTH
        };
        // ... is now available, but only one role is possible to set. 
        // On MappService side: the separator to be recognised is still incorrect.
        this.loadUserNameMinLength();
        this.loadAvailableRoles();
        return this.config;
    };
    p.loadRoles = function () {
        var widget = this;
        brease.user.loadUserRoles().then(
            function (roles) {
                widget.config.roles = roles;
                widget.loadPolicies();
            },
            function (status) {
                console.iatWarn('load roles for user.fail, status=', status);
            }
        );
    };

    p.loadAvailableRoles = function () {
        var widget = this;
        brease.user.loadAvailableRoles().then(
            function (roles) {
                widget.config.roles = roles;
                widget.loadPolicies();
            },
            function (status) {
                console.iatWarn('load roles for user.fail, status=', status);
            }
        );
    };
    
    p.loadPolicies = function () {
        var widget = this;
        brease.user.loadPasswordPolicies().then(
            function (policies) {
                widget.config.policies = policies;
                widget.validator.setPolicies(policies);
                widget._initWidgets();
            },
            function (status) {
                console.iatWarn('loadPasswordPolicies.fail, status=', status);
            }
        );
    };

    p.loadUserNameMinLength = function () {
        var widget = this;
        brease.user.getUserSettingsFromMpUserX().then(
            function (response) {
                widget.config.userNameMinLength = response.UserNameMinLength;
            },
            function (status) {
                if (status) {
                    console.iatWarn('getUserSettingsFromMpUserX.fail, status=', status);

                }
            }
        );
    };

    /**
     * Set name of widget which should be focused first
     * @param {String} name DialogWidget name
     */
    p.setInitialFocusWidgetName = function (name) {
        this.initialFocusWidgetName = name;
    };

    /**
     * @method _createWidgets
     * @private
     * @param {UInteger} i
     * @returns {Object}
     */
    p._createWidgets = function () {
        //overwrite in derived class
    };

    /**
     * @method _initWidgets
     * @private
     */
    p._initWidgets = function () {
        
        this.row = this._createWidgets();

        for (var j = 0; j < this.row.length; j += 1) {
            this.dialog.addWidget(this.row[j]);
        }

        this.dialog.el.on(BreaseEvent.WIDGET_READY, this._bind('_handleChildWidgetReady'));
    };
  
    /**
     * @method _handleChildWidgetReady
     * @private
     * Handles the widgets when these are ready
     */
    p._handleChildWidgetReady = function (e) {
        this._addCorrectStyle(e);
        this._initFocus(e);
    };

    p._addCorrectStyle = function (e) {
        var type = e.target['dataset'].breaseWidget.split('/')[2];
        var cls = 'widgets_brease_' + type + '_style_tableConfigurationDialogStyle';
        e.target.classList.add(cls);
    };

    /**
     * @method _initFocus
     * @private
     * Sets focus to add button when its ready
     */
    p._initFocus = function (e) {
        var id = this.dialog.getWidgetIdByName(this.initialFocusWidgetName);
        if (e.target.id === id) {
            e.target.focus();
        }
    };
    
    /**
     * @method 
     * This method will remove eventlisteners added at start up
     */
    p.removeEventListeners = function () {
        this.dialog.el.off(BreaseEvent.WIDGET_READY, this._bind('_addCorrectStyle'));
    };

    p._handleClosingButton = function (valid) {
        this.validData = valid;
        var id = this.dialog.getWidgetIdByName('okButton');
        brease.callWidget(id, 'setEnable', valid);
    };
    
    /**
     * @method 
     * This method will return the configuration for an Image widget
     * @param {String} name name of the widget
     * @param {String} img source for the image
     * @param {Integer} x right/left position in px
     * @param {Integer} y top/bottom position in px
     * @param {Boolean} visible 
     */
    p._getImage = function (name, img, x, y, visible) {
        var image = new DialogWidgetModel();
        image.name = name;
        image.type = 'widgets/brease/Image';
        image.x = x;
        image.y = y;
        //we have to set some stuff so the width/height doesnt set auto
        image.width = 'asdf';
        image.height = 'asdf';

        image.options = {
            image: img,
            visible: visible,
            sizeMode: 'cover'
        };

        return image;
    };

    /**
     * @method 
     * This method will return the configuration for a Label widget
     * @param {String} name name of the widget
     * @param {String} text text displayed in the widget
     * @param {Integer} x right/left position in px
     * @param {Integer} y top/bottom position in px
     * @param {Integer} w width in px
     * @param {Boolean} visible
     * @param {Boolean} ww if wordwrap and multiline should be selected or not 
     */
    p._getLabel = function (name, text, x, y, w, visible, ww) {

        var label = new DialogWidgetModel();
        label.name = name;
        label.type = 'widgets/brease/Label';
        label.x = x;
        label.y = y;
        if (w !== undefined) {
            label.width = w;
            label.height = '32px';
        } else {
            label.height = '100%';
            label.width = 'auto';
        }

        label.options = {
            'text': text,
            'ellipsis': true
        };

        if (visible === false) {
            label.options.visible = false;
        }

        if (ww) {
            label.options.wordWrap = true;
            label.options.multiLine = true;
        }

        return label;
    };

    /**
     * @method 
     * This method will return the configuration for a TextInput widget
     * @param {String} name name of the widget
     * @param {String} text placeholder text of the widget
     * @param {Integer} x right/left position in px
     * @param {Integer} y top/bottom position in px
     * @param {Integer} w width in px
     * @param {String} value text of the widget that can be edited
     */
    p._getTextInput = function (name, text, x, y, w, value) {
        var txtInput = new DialogWidgetModel();
        txtInput.name = name;
        txtInput.type = 'widgets/brease/TextInput';
        txtInput.x = x;
        txtInput.y = y;
        txtInput.width = w;
        txtInput.height = '30px';

        txtInput.options = {
            'ellipsis': true,
            'placeholder': text
        };

        if (value) {  
            txtInput.options = {
                'value': value,
                'ellipsis': true
            };
        }

        return txtInput;
    };

    /**
     * @method 
     * This method will create a CheckBox width and the return the configuration
     * @param {String} name name of the widget
     * @param {String} text text of the widget
     * @param {Integer} x left/right position in px
     * @param {Integer} y top/left position in px
     * @param {Integer} w width pixel
     * @param {Boolean} e enabled
     * @param {Boolean} v visible
     * @param {String} mdi MouseDownImage - source path to image
     * @param {String} mui MouseUpImage - source path to image
     * @param {Boolean} checked sets the value of the checkbox 
     */
    p._getCheckBox = function (name, text, x, y, w, e, v, mdi, mui, checked) {
        var cb = new DialogWidgetModel();
        cb.name = name;
        cb.type = 'widgets/brease/CheckBox';
        cb.x = x;
        cb.y = y;
        cb.width = w;
        cb.height = '30px';

        cb.options = {
            'text': text,
            'ellipsis': true,
            'enable': e,
            'visible': v,
            'value': checked
        };

        cb.style = {
            'margin': '0px 10px 0px 10px'
        };

        if (mdi) {
            cb.options.checkedBoxImage = mdi;
            cb.options.disabledCheckedBoxImage = mdi;
        }

        if (mui) {
            cb.options.uncheckedBoxImage = mui;
            cb.options.disabledUncheckedBoxImage = mui;
        }

        return cb;
    };

    /**
     * @method 
     * This method will create a GroupBox width and the return the configuration
     * @param {String} name 
     * @param {String} text text to be portrayed in the header of the groupbox
     * @param {String} r the type of groupbox that should be used. Used by deriving class to differentiate the type of groupbox currently used to add child widgets accordingly
     * @param {Integer} x right/left position in px
     * @param {Integer} y top/bottom position in px
     * @param {Integer} w width in px
     * @param {Integer} h height in px
     * @param {Boolean} v visible
     */
    p._getGroupBox = function (name, text, r, x, y, w, h, v) {

        var gb = new DialogWidgetModel();
        gb.name = name;
        gb.type = 'widgets/brease/GroupBox';
        gb.x = x;
        gb.y = y;
        gb.width = w;
        gb.height = h;

        gb.options = {
            'ellipsis': true,
            'text': text,
            'childPositioning': 'relative'
        };

        if (v !== undefined) gb.options.visible = v;

        gb.content = this._addContent(r, w);

        return gb;
    };

    /**
     * @method 
     * This method will create a FlexLayoutPanel width and the return the configuration
     * @param {String} name 
     * @param {Integer} w width in px
     * @param {Boolean} v visible
     */
    p._getFlexLayoutPanel = function (name, r, w, v) {

        var flp = new DialogWidgetModel();
        flp.name = name;
        flp.type = 'widgets/brease/FlexLayoutPanel';
        flp.x = 0;
        flp.y = 0;
        flp.width = '100%';
        flp.height = 'auto';

        flp.options = {
            'padding': '0px',
            'margin': '0px',
            'childCrossAlign': 'center'
        };

        if (v !== undefined) flp.options.visible = v;

        return flp;
    };

    /**
     * @method
     * @private
     * Method to add Checkboxes to the GroupBox content
     * @param {String} r the type of groupbox the widgets belong to
     * @param {Number} w width of the CheckBox
     */
    p._addContent = function (r, w) {
        var content = [];
        switch (r) {
            case 'roles':
                this._addContentRoles(content, r, w);
                break;
            case 'pwrules':
                this._addContentRules(content, r);
                break;
        }

        return content;
    };

    /**
     * @private
     * This method will add all necessary widgets to the Dialog for the
     * user to interact with the widget, and position these accordingly.
     * Must be derived in child widget.
     * @param {Object[]} content reference array of content
     * @param {String} r the type of groupbox the widgets belong to
     * @param {Number} w width of the CheckBox
     */
    p._addContentRules = function (content, r, w) {
        //Overwrite in derived class
    };

    /**
     * @private
     * This method will add Checkboxes to the content array that is used
     * by the Roles Groupbox. Must be derived in child widget.
     * @param {Object[]} content array of content to add widgetst tp
     * @param {String} r the type of groupbox the widgets belong to
     * @param {Number} w width of the CheckBox
     */
    p._addContentRoles = function (content, r, w) {
        //Overwrite in derived class
    };

    /**
     * @method 
     * This method will return the configuration for a Password widget
     * @param {String} name name of the widget
     * @param {String} text placeholder text of the widget
     * @param {Integer} x right/left position in px
     * @param {Integer} y top/bottom position in px
     * @param {Integer} w width in px
     * @param {Boolean} v visible
     */
    p._getPassword = function (name, text, x, y, w, v) {
        var pwd = new DialogWidgetModel();
        pwd.name = name;
        pwd.type = 'widgets/brease/Password';
        pwd.x = x;
        pwd.y = y;
        pwd.width = w;
        pwd.height = '30px';

        pwd.options = {
            'ellipsis': true,
            'placeholder': text
        };

        if (v !== undefined) pwd.options.visible = v;

        return pwd;
    };

    /**
     * @method 
     * This method will return the configuration for a Button widget
     * @param {String} name name of the widget
     * @param {String} text text of the widget
     * @param {Integer} x right/left position in px
     * @param {Integer} y top/bottom position in px
     * @param {Integer} w width in px
     */
    p._getButton = function (name, text, x, y, w) {
        var btn = new DialogWidgetModel();
        btn.name = name;
        btn.type = 'widgets/brease/Button';
        btn.x = x;
        btn.y = y;
        btn.width = w;
        btn.height = '30px';

        btn.options = {
            'ellipsis': true,
            'text': text
        };

        return btn;
    };

    return UserClass;
});
