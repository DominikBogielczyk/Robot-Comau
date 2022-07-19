/*
 * This class is responsible for the dragging behavior of the crosshair.  
 */

/*global define*/
define(['libs/d3/d3'], function (d3) {
    'use strict';

    function DragHandler(context) {
        var dragHandler = d3.behavior.drag(),
            x,
            y;

        dragHandler.on("drag", function (d) {
            d.x += d3.event.dx;
            d.y += d3.event.dy;
            x = context.smartControl.precisionRound(d.x);
            y = context.smartControl.precisionRound(d.y);

            d3.select(this).attr("transform", "translate(" + x + ", " + y + ")"); 
        });
        return dragHandler;
    }

    return DragHandler;
}); 