
define([
    'widgets/brease/TableWidgetStyle/TableWidgetStyle'
], function (SuperClass) {
    
    'use strict';

    /**
     * @class widgets.brease.UserListStyle
     * #Description
     * UserListStyle - abstract widget to set styles in the UserList  
     * Text can be language dependent.  
     * @breaseNote 
     * @extends widgets.brease.TableWidgetStyle
     * @iatMeta studio:visible
     * false
     * @abstract
     */

    var WidgetClass = SuperClass.extend(function UserListStyle() {
        SuperClass.apply(this, arguments);
    }, false);

    return WidgetClass;

});
