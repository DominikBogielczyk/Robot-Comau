define(function () {

    'use strict';   
 
    /**
    * @class widgets.brease.UserList.libs.Config
    * @extends core.javascript.Object
    * @override widgets.brease.UserList
    */

    /**
     * @cfg {String} filterConfiguration=''
     * @iatCategory Data
     */

    /**
     * @cfg {String} sortConfiguration=''
     * @iatCategory Data
     */

    /**
     * @cfg {String} styleConfiguration=''
     * @iatCategory Data
     */

    /**
    * @cfg {ImagePath} imageIsAdmin=''
    * @iatStudioExposed
    * @iatCategory Appearance
    * @groupRefId Icons
    * @groupOrder 2
    * Path to the image used for user that is admin. If no image is defined, a predefined image will be used.
    */

    /**
    * @cfg {ImagePath} imageIsLocked=''
    * @iatStudioExposed
    * @iatCategory Appearance
    * @groupRefId Icons
    * @groupOrder 2
    * Path to the image used for user that is locked. If no image is defined, a predefined image will be used.
    */
   
    return {
        imageIsAdmin: '',
        imageIsLocked: '',
        mpLink: '',
        type: 'UserList',
        config: {
            columns: [],
            allColumns: ['userName', 'fullName', 'roles', 'isAdmin', 'isLocked', 'lastLogin'],
            columnWidths: [],
            columnTypes: {
                userName: 'str',
                fullName: 'str',
                roles: 'str',
                isAdmin: 'bool',
                isLocked: 'bool',
                lastLogin: 'date'
            },
            style: [],
            order: [],
            hidden: { data: 'userName' },
            filter: [],
            sort: [],
            original: {
                order: []
            }
        }
    };
});
