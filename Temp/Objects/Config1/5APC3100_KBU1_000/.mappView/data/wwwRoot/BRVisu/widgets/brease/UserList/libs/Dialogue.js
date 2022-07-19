define([
    'widgets/brease/TableWidget/libs/Dialogue',
    'brease/enum/Enum',
    // 'widgets/brease/TableWidget/libs/FilterSettings',
    // 'widgets/brease/TableWidget/libs/SortingSettings',
    // 'widgets/brease/UserList/libs/StylingSettings',
    'widgets/brease/UserList/libs/AddUserSettings',
    'widgets/brease/UserList/libs/ModifyUserSettings',
    'widgets/brease/UserList/libs/DialogueTexts',
    'widgets/brease/TableWidget/libs/TextRetriever',
    'widgets/brease/GroupBox/GroupBox',
    'widgets/brease/Password/Password'
], function (SuperClass, Enum, AddUser, ModifyUser, Texts, TextRetriever, GB, Pwd) {
    'use strict';
    /** 
     * @class widgets.brease.UserList.libs.Dialogue
     * Class opening and controlling the different configuration dialogues
     */
    var DialogueClass = SuperClass.extend(function Dialogue(widget) {
            SuperClass.apply(this, arguments);
        }, null),

        p = DialogueClass.prototype;

    /**
     * @method initialize
     * @param {brease.enum.MappTableConfigurationType} type which type of dialog should be instantiated 
     * @returns {Object}
     */
    p.initialize = function (type) {
        switch (type) {
            // case Enum.MappTableConfigurationType.Filtering:
            //     this.filter = new Filter(this.dialog, this.widget, this.lang, this.widget.model.categories, Texts[this.lang][type]);
            //     break;
                
            // case Enum.MappTableConfigurationType.Sorting:
            //     this.sort = new Sorting(this.dialog, this.widget, this.lang, Texts[this.lang][type]);
            //     break;

            // case Enum.MappTableConfigurationType.Styling:
            //     this.style = new Styling(this.dialog, this.widget, this.lang, Texts[this.lang][type]);
            //     break;

            case Enum.MappTableConfigurationType.AddUser:
                this.adduser = new AddUser(this.dialog, this.widget, this.actualLang, Texts[this.lang][type]);
                break;

            case 'modifyuser':
                this.modifyuser = new ModifyUser(this.dialog, this.widget, this.actualLang, Texts[this.lang][type]);
                break;
                
        }
        var dialogWidth = 436;
        this._initializeEmptyDialogConfig(Texts[this.lang][type].TITLE, dialogWidth);
        return this.config;
    };

    p._widgetAdded = function (e) {
        e.target.classList.add('breaseUserListGenericDialog');
        SuperClass.prototype._widgetAdded.apply(this, arguments);
    };
    
    /**
     * @method _collectDataBeforeClosing
     * @private
     * This method will listen for the closing event and once it it is thrown it will collect the filter configuration, store it into the table
     * and redraw the table. Then it will update the backend that there was a change in the filter.
     */
    p._collectDataBeforeClosing = function (e) {
        if (brease.uiController.parentWidgetId(e.target) === this.dialog.elem.id) {
            var type = e.data.type;
            this[type].removeEventListeners();
            if (this.dialog.getDialogResult() === 'ok') {
            // this[type]._widgetCollectStateBeforeClosing();
            //Send data over brease.user somehow
                var userData = this[type]._widgetCollectStateBeforeClosing();
                this.widget.controller[type](userData);
            }
        }
    };

    /**
     * @method setUpTexts
     * This method will set up all text keys necessary to instantiate the dialogue
     * @param {Promise} def a deferred object used to retrieve the texts from the asynchronous function
     * @param {String} lang the language currently in use
     * @param {String} fallbackLang the fallback language to use if current language is missing
     * @param {String} type the type of the Dialog window, valid values are filter, style or order
     */
    p.setUpTexts = function (def, lang, fallbackLang, type) {
        // var defSys = new $.Deferred();
        TextRetriever.getTexts(lang, Texts[fallbackLang], 'UserList', type, this, def);
    };
    
    return DialogueClass;

});
