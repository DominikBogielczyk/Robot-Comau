/**
 * draggable automates the need to define dragging events and setting the
 * corresponding callbacks.
 * Notice that you only need to import this module in order to be able to
 * define the drag behavior for a marker.
 *
*/
define(['libs/d3/d3'], function (d3) {
    'use strict';

    function dragstarted(callback) {
        return function () {
            var marker = d3.select(this),
                roiid = marker.node().parentNode.id;
            d3.select('g#' + roiid).ontop();
            marker
                .classed('activeroi', true);
            callback(this);
        };
    }

    function dragged(callback) {
        return function () {
            callback(d3.event.dx, d3.event.dy,
                d3.event.x - d3.event.dx, d3.event.y - d3.event.dy);
        };
    }

    function dragended(callback) {
        return function () {
            d3.select(this).classed('activeroi', false);
            callback(this);
        };
    }

    function none() { }

    /**
     * Re-inserts each selected element, in order, as the last child of its parent.
     *
     * @returns a reference to the selection
     */
    d3.selection.prototype.ontop = function () {
        var node = this.node();
        node.parentNode.appendChild(node);
        return this;
    };

    /**
     * Re-inserts each selected element, in order, as the first child of its parent.
     *
     * @returns a reference to the selection
     */
    d3.selection.prototype.below = function () {
        var node = this.node();
        node.parentNode.insertBefore(node, node.parentNode.children[0]);
        return this;
    };

    /**
     * draggable adds the necessary event handling functionality automatically.
     * It is possible to add a callback for each of the possible events, namely
     * dragstart, dragged, and dragend through an object with the corresponding keys.
     *
     * dragstart has signature function dragstart(element); where element is a
     * reference to the SVG selected through the click action.
     *
     * drag has signature function drag(x, y, dx, dy) where (x,y) are the coordinates
     * of the last position of the element (mouse), and (dx,dy) represents the
     * displacement corresponding to the mouse action.
     *
     * dragend has signature function dragstart(element); where element is a
     * reference to the SVG selected which has just been released.
     *
     * @param {any} roi
     * @param {any} callback
     * @returns
     */
    d3.selection.prototype.draggable = function (callbacks) {
        var drag = d3.behavior.drag()
            .on("dragstart", dragstarted(callbacks.dragstart || none))
            .on("drag", dragged(callbacks.drag || none))
            .on("dragend", dragended(callbacks.dragend || none));
        return this.call(drag);
    };
});