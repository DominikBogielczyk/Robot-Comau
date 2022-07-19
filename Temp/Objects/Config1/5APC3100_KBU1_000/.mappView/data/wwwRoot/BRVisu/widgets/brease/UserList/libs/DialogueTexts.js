define([], function () {
    'use strict';
    function DialogueTexts() {
        return {
            en: {
                // filter: {
                //     title: 'Configuration dialogue to filter the users',
                //     col: 'Column',
                //     op: 'Operator',
                //     val: 'Value',
                //     and: 'and',
                //     or: 'or',
                //     true: 'true',
                //     false: 'false'
                // },
                // sort: {
                //     title: 'Configuration dialog to sort the users',
                //     col: 'Column',
                //     sort: 'Sort',
                //     by: 'By',
                //     first: 'First',
                //     then: 'then',
                //     inc: 'increasing',
                //     dec: 'decreasing',
                //     az: 'A - Z',
                //     za: 'Z - A',
                //     old: 'oldest first',
                //     new: 'newest first',
                //     true: 'true',
                //     false: 'false'
                // },
                // style: {
                //     title: 'Configuration dialogue to style the users',
                //     and: 'and',
                //     or: 'or',
                //     style: 'Set style',
                //     state: 'if audit is'
                // },
                adduser: {
                    TITLE: 'Add a user',
                    ERROR_HEADER: 'User account requirements:',
                    POLICY_DESC_ALPHANUMERIC: 'Alphanumerical characters are necessary in the password',
                    POLICY_DESC_MIXEDCASE: 'Upper- and lowercase letters required in the password',
                    POLICY_DESC_MINLENGTH: '{1} or more characters required in the password',
                    POLICY_DESC_SPECIALCHAR: 'At least one special character (e.g. $£]) required in the password',
                    PASSWORD_USERNAME_EMPTY: 'Username must not be empty',
                    PASSWORD_PASSWORD_EMPTY: 'Password cannot be empty',
                    PASSWORD_PASSWORDS_DIFFERENT: 'Confirm password does not match',
                    USERNAME_DESC_MINLENGTH: '{1} or more characters required in the username',
                    SERVICE_NOTAVAILABLE: 'Creating user not possible. Use MpUserX instead of RBAC for authentication',
                    ROLES_HEADER: 'Available roles',
                    FULLNAME: 'Name',
                    USERNAME: 'User',
                    PASSWORD: 'Password',
                    CONFIRM_PASSWORD: 'Confirm',
                    PLH_FULLNAME: 'Full name',
                    PLH_USERNAME: 'Username',
                    PLH_PASSWORD: 'Password',
                    PLH_CONFIRM_PASSWORD: 'Confirm password'
                },
                modifyuser: {
                    TITLE: 'Modify a user',
                    ERROR_HEADER: 'User account requirements:',
                    POLICY_DESC_ALPHANUMERIC: 'Alphanumerical characters are necessary in the password',
                    POLICY_DESC_MIXEDCASE: 'Upper- and lowercase letters required in the password',
                    POLICY_DESC_MINLENGTH: '{1} or more characters required in the password',
                    POLICY_DESC_SPECIALCHAR: 'At least one special character (e.g. $£]) required in the password',
                    PASSWORD_PASSWORDS_DIFFERENT: 'Confirm password does not match',
                    ROLES_HEADER: 'Available roles',
                    FULLNAME: 'Name',
                    USERNAME: 'User',
                    PASSWORD: 'Password',
                    CONFIRM_PASSWORD: 'Confirm',
                    PLH_FULLNAME: 'Full name',
                    PLH_PASSWORD: 'Change password',
                    PLH_CONFIRM_PASSWORD: 'Confirm password',
                    BTN_CHANGE_PASSWORD: 'Reset password',
                    BTN_RESET_LOCK: 'User locked'
                }
            },
            de: {
                // filter: {
                //     title: 'Konfigurationsdialog für das Filtern der Userliste',
                //     col: 'Spalte',
                //     op: 'Operator',
                //     val: 'Wert',
                //     and: 'und',
                //     or: 'oder',
                //     true: 'wahr',
                //     false: 'falsch'
                // },
                // sort: {
                //     title: 'Konfigurationsdialog zum Sortieren der Userliste',
                //     col: 'Spalte',
                //     sort: 'Sortieren',
                //     by: 'Nach',
                //     first: 'Zuerst',
                //     then: 'dann',
                //     inc: 'aufsteigend',
                //     dec: 'absteigend',
                //     az: 'A - Z',
                //     za: 'Z - A',
                //     old: 'älteste',
                //     new: 'neueste',
                //     true: 'wahr',
                //     false: 'falsch'
                // },
                // style: {
                //     title: 'Konfigurationsdialog zum Stylen der Userliste',
                //     and: 'und',
                //     or: 'oder',
                //     style: 'Set style',
                //     state: 'if event is of type'
                // }
                adduser: {
                    TITLE: 'Benutzer hinzufügen',
                    ERROR_HEADER: 'Benutzerkonto Anforderungen:',
                    POLICY_DESC_ALPHANUMERIC: 'Alphanumerische Zeichen sind im Passwort erforderlich',
                    POLICY_DESC_MIXEDCASE: 'Groß- und Kleinbuchstaben sind im Passwort erforderlich',
                    POLICY_DESC_MINLENGTH: '{1} oder mehr Zeichen sind im Passwort erforderlich',
                    POLICY_DESC_SPECIALCHAR: 'Mindestens ein Sonderzeichen (z.B. %$ö) ist erforderlich',
                    PASSWORD_USERNAME_EMPTY: 'Benutzername darf nicht leer sein',
                    PASSWORD_PASSWORD_EMPTY: 'Passwort darf nicht leer sein',
                    PASSWORD_PASSWORDS_DIFFERENT: 'Passwortwiederholung stimmt nicht dem neuen Passwort überein',
                    USERNAME_DESC_MINLENGTH: '{1} oder mehr Zeichen sind im Benutzernamen erforderlich',
                    ROLES_HEADER: 'Verfügbare Rollen',
                    USERNAME: 'Benutzer',
                    FULLNAME: 'Name',
                    PASSWORD: 'Passwort',
                    CONFIRM_PASSWORD: 'Bestätigen',
                    PLH_FULLNAME: 'Vollständiger Name',
                    PLH_USERNAME: 'Benutzername',
                    PLH_PASSWORD: 'Passwort',
                    PLH_CONFIRM_PASSWORD: 'Passwort bestätigen'
                },
                modifyuser: {
                    TITLE: 'Einen Benutzer ändern',
                    ERROR_HEADER: 'Benutzerkonto Anforderungen:',
                    POLICY_DESC_ALPHANUMERIC: 'Alphanumerische Zeichen sind im Passwort erforderlich',
                    POLICY_DESC_MIXEDCASE: 'Groß- und Kleinbuchstaben sind im Passwort erforderlich',
                    POLICY_DESC_MINLENGTH: '{1} oder mehr Zeichen sind im Passwort erforderlich',
                    POLICY_DESC_SPECIALCHAR: 'Mindestens ein Sonderzeichen (z.B. %$ö) ist erforderlich',
                    PASSWORD_PASSWORDS_DIFFERENT: 'Passwortwiederholung stimmt nicht dem neuen Passwort überein',
                    ROLES_HEADER: 'Verfügbare Rollen',
                    USERNAME: 'Benutzer',
                    FULLNAME: 'Name',
                    PASSWORD: 'Passwort',
                    CONFIRM_PASSWORD: 'Bestätigen',
                    PLH_FULLNAME: 'Vollständiger Name',
                    PLH_PASSWORD: 'Passwort ändern',
                    PLH_CONFIRM_PASSWORD: 'Passwort bestätigen',
                    BTN_CHANGE_PASSWORD: 'Passwort zurücksetzen',
                    BTN_RESET_LOCK: 'Benutzer gesperrt'
                }
            }
        };
    }
    
    return new DialogueTexts();
});
