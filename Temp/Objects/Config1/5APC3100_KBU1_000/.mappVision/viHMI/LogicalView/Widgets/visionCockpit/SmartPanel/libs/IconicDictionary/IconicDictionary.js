/*global define, brease, $*/


define([
        'text!widgets/visionCockpit/SmartPanel/libs/IconicDictionary/IconicDictionary.xml'
    ],

    function (iconicDictionaryXmlFile) {

        'use strict';

        function IconicDictionary() {
            var xmlDoc = $.parseXML(iconicDictionaryXmlFile);

            this.contextExecuteSettings = new Map();
            this.contextTeachSettings = new Map();

            if (xmlDoc) {
                this.updateIconicDictionary(xmlDoc);
            }

            return this;
        }

        var p = IconicDictionary.prototype;

        p.xmlToJson = function (xml) {
            var obj = {};

            if (xml.nodeType == 1) { // element
                // do attributes
                if (xml.attributes.length > 0) {
                    obj["attr"] = {};
                    for (var j = 0; j < xml.attributes.length; j++) {
                        var attribute = xml.attributes.item(j);
                        obj["attr"][attribute.nodeName] = attribute.nodeValue;
                    }
                }
            } else if (xml.nodeType == 3) { // text
                obj = xml.nodeValue;
            }

            // do children
            if (xml.hasChildNodes()) {
                for (var i = 0; i < xml.childNodes.length; i++) {
                    var item = xml.childNodes.item(i);
                    var nodeName = item.nodeName;
                    if (typeof (obj[nodeName]) == "undefined") {
                        obj[nodeName] = this.xmlToJson(item);
                    } else {
                        if (typeof (obj[nodeName].push) == "undefined") {
                            var old = obj[nodeName];
                            obj[nodeName] = [];
                            obj[nodeName].push(old);
                        }
                        obj[nodeName].push(this.xmlToJson(item));
                    }
                }
            }
            return obj;
        };

        p.getIconicDictionary = function () {
            return {
                "TestExecute": this.contextExecuteSettings,
                "ModifyTeach": this.contextTeachSettings
            };
        };

        p.updateIconicDictionary = function (xmlDoc) {
            var that = this,
                iconicDictionary = this.xmlToJson(xmlDoc).IconicDictionary,
                iconicSettings = [],
                iconicTypes = [],
                iconicClass,
                dictionaryKey,
                contextSettings = [],
                iconicItem;

            this.contextExecuteSettings.clear();
            this.contextTeachSettings.clear();

            if (iconicDictionary.IconicSettings && iconicDictionary.IconicSettings.Iconics) {

                iconicSettings = [];
                if (!Array.isArray(iconicDictionary.IconicSettings.Iconics)) {
                    iconicSettings.push(iconicDictionary.IconicSettings.Iconics);
                } else {
                    iconicSettings = iconicDictionary.IconicSettings.Iconics;
                }

                iconicSettings.forEach(function (iconic) {
                    iconicClass = iconic.attr.Class;
                    iconicTypes = iconic.Iconic;

                    iconicTypes = [];
                    if (!Array.isArray(iconic.Iconic)) {
                        iconicTypes.push(iconic.Iconic);
                    } else {
                        iconicTypes = iconic.Iconic;
                    }

                    iconicTypes.forEach(function (iconicType) {
                        dictionaryKey = iconicClass + "_" + iconicType.attr.Type;

                        contextSettings = [];
                        if (Array.isArray(iconicType.Settings)) {
                            contextSettings = iconicType.Settings;
                        } else {
                            contextSettings.push(iconicType.Settings);
                        }

                        contextSettings.forEach(function(setting) {
                            iconicItem = new Object({
                                Key: dictionaryKey,
                                Context: setting.attr.Context,
                                Class: iconicClass,
                                Type: iconicType.attr.Type,
                                DrawOn: "VF",
                                Color: setting.attr.Color,
                                Transparency: setting.attr.Transparency,
                                Visible: setting.attr.Visible
                            });
                            switch (setting.attr.Context) {
                                case "TestExecute":
                                    that.contextExecuteSettings.set(dictionaryKey, iconicItem);
                                    break;
                                case "ModifyTeach":
                                    that.contextTeachSettings.set(dictionaryKey, iconicItem);
                                    break;
                            }
                        });
                    });
                });
            }
        };

        return IconicDictionary;
    });