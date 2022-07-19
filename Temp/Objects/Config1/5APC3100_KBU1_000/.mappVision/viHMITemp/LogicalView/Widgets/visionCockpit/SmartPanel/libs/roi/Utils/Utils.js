
/*global define*/
define([], function () {
    'use strict';

    function Utils() {
    }

    Utils.prototype.getAlignmentPostion = function (refx, refy, px, py, angleDeg) {
        var rad2deg, gammaRad, gammaDeg, angleRad, g, betaRad, a, ex, ey, qx, qy, betaDeg, aphaDeg, alignmentPostion;

        aphaDeg = angleDeg;
        rad2deg = 180 / Math.PI;
        angleRad = angleDeg / rad2deg;

        if (px > refx) {
            g = 0;
        } else {
            g = 180;
        }

        betaRad = Math.atan((py - refy) / (px - refx));
        betaDeg = (betaRad * rad2deg) + g;

        gammaDeg = aphaDeg - betaDeg;
        gammaRad = gammaDeg / rad2deg;

        a = Math.cos(gammaRad) * Math.sqrt(Math.pow((px - refx), 2) + Math.pow((py - refy), 2));
        ex = Math.cos(angleRad);
        ey = Math.sin(angleRad);
        qx = refx + ex * a;
        qy = refy + ey * a;

        alignmentPostion = {
            x: qx,
            y: qy
        };

        return alignmentPostion;
    };

    Utils.prototype.getDistanceToRefObjectParllelToCenterOfGravityLine = function (refx, refy, px, py, angleDeg) {
        var rad2deg, gammaRad, gammaDeg, angleRad, g, betaRad, betaDeg, aphaDeg, distanceToRefObjectParllelToCenterOfGravityLine;

        if ((px == refx) && (py == refy)) {
            return 0;
        }
        aphaDeg = angleDeg;
        rad2deg = 180 / Math.PI;
        angleRad = angleDeg / rad2deg;

        if (px > refx) {
            g = 0;
        } else {
            g = 180;
        }

        betaRad = Math.atan((py - refy) / (px - refx));
        betaDeg = (betaRad * rad2deg) + g;

        gammaDeg = aphaDeg - betaDeg;
        gammaRad = gammaDeg / rad2deg;

        distanceToRefObjectParllelToCenterOfGravityLine = Math.cos(gammaRad) * Math.sqrt(Math.pow((px - refx), 2) + Math.pow((py - refy), 2));

        return distanceToRefObjectParllelToCenterOfGravityLine;
    };

    Utils.prototype.getSpacing = function (centerPositionX, centerPositionY, currentDistanceToRefObject, index, equidistance, refRoiToolAngle) {
        var rad2deg, angleRad, ex, ey, newDistanceToRefObject, aphaDeg, spacingPosition = {}, dy_i, dx_i;

        aphaDeg = refRoiToolAngle;
        rad2deg = 180 / Math.PI;
        angleRad = refRoiToolAngle / rad2deg;

        ex = Math.cos(angleRad);
        ey = Math.sin(angleRad);

        newDistanceToRefObject = equidistance * index;

        dx_i = ex * (newDistanceToRefObject - currentDistanceToRefObject);
        dy_i = ey * (newDistanceToRefObject - currentDistanceToRefObject);

        spacingPosition.x = centerPositionX + dx_i;
        spacingPosition.y = centerPositionY + dy_i;

        return spacingPosition;
    };

    Utils.prototype.setResizeValues = function (context) {
        context.settings.resize_x0 = d3.transform(context.drawing.anchor.attr("transform")).translate[0];
        context.settings.resize_y0 = d3.transform(context.drawing.anchor.attr("transform")).translate[1];
    };


    return Utils;
});