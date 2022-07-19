
define(function() {
    'use strict';

    var ColorSettings = {
        // Tool settings
        modelRoiToolColors: {
            color_default: "#aa7700",
            color_selected: "#ffcc00",
            color_transparent: '#00000000',
            fillColor_selected: '#ffcc0099',
            fillColor_roi: "darkgreen",
            fillColor_roni: "darkred",
        },

        executeRoiToolColors: {
            color_default: "#279822",
            color_selected: "#00FF30",
            color_transparent: '#00000000',
            fillColor_selected: '#ffcc0099',
            fillColor_roi: "darkgreen",
            fillColor_roni: "darkred",
        },
    
        executeRoiIconicsSettings: {
            color: {
                fillOpacity: 0.2,
                strokeOpacity: 0, 
                strokeOpacitySelected: 1.0,
                strokeColor: "#896389",
                fillColor: "#785078",
                infoText: "#896389",
                rgba: getRGBAValue("#785078", 0.2)
            },
        },
    
        orientationToolColors: {
            color_default: "#00aaaa",
            color_selected: "#00ffff" 
        },
    };  

    
    function getRGBAValue(color, alpha) {
        var r = parseInt(color.substring(1,3),16),
         g = parseInt(color.substring(3,5),16),
         b = parseInt(color.substring(5,7),16),
         rgba = {
            r: r,
            g:g,
            b:b,
            a:Math.floor(alpha * 255)
        };
        return rgba;
    }
    

    return ColorSettings;
});
