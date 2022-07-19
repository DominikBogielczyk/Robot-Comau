/**
 * rectangle1 is an axis parallel rectangle whose position and dimensions
 * can only be changed along the axis.
 * rectangle1 is parametrized as a rect SVG element:
 *  (x, y)  is the top left corner
 *  width   width of the rectangle
 * height   height of the rectangle
 *
*/
define(['libs/d3/d3', './observe', './roi', './draggable'], function (d3, observable, ROI) {
    'use strict';

    /**
     * Rectangle1 adds a manually editable rectangle to the renderer.
     * By design, the manual ROI is packed in a group on top of the rest of the SVG
     * elements (is an overlay).
     *
     * Use the sizeObservable property in order to get trigerred as soon as the size
     * of the manual ROI changes. sizeObservable() returns its current size, whereas
     * sizeObservable.subscribe(function(newrect){ ... }) sets the notification callback.
     *
     * @param {any} renderer a reference to a SVG canvas
     * @param {any} rect  initial parameters of the rectangle
     * @param {any} active true/false, is in edit modus?
     * @param {any} sizeObservable see roi.js for a description
     * @returns
     */
    function Rectangle1(renderer, rect, active, sizeObservable) {
        ROI.call(this, renderer, rect.id, sizeObservable);

        this.roi.append('rect')
            .attr('x', rect.x)
            .attr('y', rect.y)
            .attr('width', rect.width)
            .attr('height', rect.height)
            .classed('manualroi', true)
            .attr('id', 'mainroi');

        // Notify subscribers whenever any of the ROI parameters changes.
        var mainroi = this.roi.select('#mainroi');
        this.sizeObservable = observable({
            x: Number.parseFloat(mainroi.attr('x')),
            y: Number.parseFloat(mainroi.attr('y')),
            width: Number.parseFloat(mainroi.attr('width')),
            height: Number.parseFloat(mainroi.attr('height'))
        });

        /**
         * notifier is responsible for triggering subscribers as soon as  the user
         * has finished editing the ROI.
         */
        var notifier = function () {
            var mainroi = this.roi.select('#mainroi');
            this.sizeObservable({
                x: Number.parseFloat(mainroi.attr('x')),
                y: Number.parseFloat(mainroi.attr('y')),
                width: Number.parseFloat(mainroi.attr('width')),
                height: Number.parseFloat(mainroi.attr('height'))
            });
        }.bind(this);

        // add the markers for interaction
        this.roi.append('rect')
            .attr('x', rect.x + (rect.width - this.MARKER_WIDTH) * 0.5)
            .attr('y', rect.y + (rect.height - this.MARKER_WIDTH) * 0.5)
            .attr('width', this.MARKER_WIDTH)
            .attr('height', this.MARKER_WIDTH)
            .attr('id', 'center')
            .classed('marker', true)
            .draggable({
                'drag': this._center.bind(this),
                'dragend': notifier
            });

        // sides
        this.roi.append('rect')
            .attr('x', rect.x - this.STROKE_WIDTH * 0.5)
            .attr('y', rect.y + this.STROKE_WIDTH * 0.5)
            .attr('width', this.STROKE_WIDTH)
            .attr('height', rect.height - this.STROKE_WIDTH)
            .attr('id', 'left')
            .classed('marker', true)
            .draggable({
                'drag': this._left.bind(this),
                'dragend': notifier
            });

        this.roi.append('rect')
            .attr('x', rect.x + rect.width - this.STROKE_WIDTH * 0.5)
            .attr('y', rect.y + this.STROKE_WIDTH * 0.5)
            .attr('width', this.STROKE_WIDTH)
            .attr('height', rect.height - this.STROKE_WIDTH)
            .attr('id', 'right')
            .classed('marker', true)
            .draggable({
                'drag': this._right.bind(this),
                'dragend': notifier
            });

        this.roi.append('rect')
            .attr('x', rect.x + this.STROKE_WIDTH * 0.5)
            .attr('y', rect.y - this.STROKE_WIDTH * 0.5)
            .attr('width', rect.width - this.STROKE_WIDTH)
            .attr('height', this.STROKE_WIDTH)
            .attr('id', 'top')
            .classed('marker', true)
            .draggable({
                'drag': this._top.bind(this),
                'dragend': notifier
            });

        this.roi.append('rect')
            .attr('x', rect.x + this.STROKE_WIDTH * 0.5)
            .attr('y', rect.y + rect.height - this.STROKE_WIDTH * 0.5)
            .attr('width', rect.width - this.STROKE_WIDTH)
            .attr('height', this.STROKE_WIDTH)
            .attr('id', 'bottom')
            .classed('marker', true)
            .draggable({
                'drag': this._bottom.bind(this),
                'dragend': notifier
            });

        // corners go on top
        this.roi.append('rect')
            .attr('x', rect.x - this.MARKER_WIDTH * 0.5)
            .attr('y', rect.y - this.MARKER_WIDTH * 0.5)
            .attr('width', this.MARKER_WIDTH)
            .attr('height', this.MARKER_WIDTH)
            .attr('id', 'topleft')
            .classed('marker', true)
            .draggable({
                'drag': this._topleft.bind(this),
                'dragend': notifier
            });

        this.roi.append('rect')
            .attr('x', rect.x + rect.width - this.MARKER_WIDTH * 0.5)
            .attr('y', rect.y - this.MARKER_WIDTH * 0.5)
            .attr('width', this.MARKER_WIDTH)
            .attr('height', this.MARKER_WIDTH)
            .attr('id', 'topright')
            .classed('marker', true)
            .draggable({
                'drag': this._topright.bind(this),
                'dragend': notifier
            });

        this.roi.append('rect')
            .attr('x', rect.x + rect.width - this.MARKER_WIDTH * 0.5)
            .attr('y', rect.y + rect.height - this.MARKER_WIDTH * 0.5)
            .attr('width', this.MARKER_WIDTH)
            .attr('height', this.MARKER_WIDTH)
            .attr('id', 'bottomright')
            .classed('marker', true)
            .draggable({
                'drag': this._bottomright.bind(this),
                'dragend': notifier
            });

        this.roi.append('rect')
            .attr('x', rect.x - this.MARKER_WIDTH * 0.5)
            .attr('y', rect.y + rect.height - this.MARKER_WIDTH * 0.5)
            .attr('width', this.MARKER_WIDTH)
            .attr('height', this.MARKER_WIDTH)
            .attr('id', 'bottomleft')
            .classed('marker', true)
            .draggable({
                'drag': this._bottomleft.bind(this),
                'dragend': notifier
            });

        this.edit(active);

        return this;
    }

    Rectangle1.prototype = Object.create(ROI.prototype);

    Rectangle1.prototype._update_center_x = function () {
        var center = this.roi.select('#center'),
            mainroi = this.roi.select('#mainroi'),
            width = parseFloat(mainroi.attr('width')),
            x = parseFloat(mainroi.attr('x'));
        center.attr('x', x + (width - this.MARKER_WIDTH) * 0.5);
    };

    Rectangle1.prototype._update_center_y = function () {
        var center = this.roi.select('#center'),
            mainroi = this.roi.select('#mainroi'),
            height = parseFloat(mainroi.attr('height')),
            y = parseFloat(mainroi.attr('y'));
        center.attr('y', y + (height - this.MARKER_WIDTH) * 0.5);
    };

    Rectangle1.prototype._update_center = function () {
        this._update_center_x();
        this._update_center_y();
    };

    Rectangle1.prototype._center = function (dx, dy) {
        var leftcoord = Number.parseFloat(this.roi.select('#topleft').attr('x')) + this.MARKER_WIDTH * 0.5,
            rightcoord = Number.parseFloat(this.roi.select('#topright').attr('x')) + this.MARKER_WIDTH * 0.5,
            topcoord = Number.parseFloat(this.roi.select('#topleft').attr('y')) + this.MARKER_WIDTH * 0.5,
            bottomcoord = Number.parseFloat(this.roi.select('#bottomleft').attr('y')) + this.MARKER_WIDTH * 0.5,
            dxmax = (dx > 0) ? Math.min(dx, this.roi.limits.width - rightcoord) : Math.max(dx, -leftcoord),
            dymax = (dy > 0) ? Math.min(dy, this.roi.limits.height - bottomcoord) : Math.max(dy, -topcoord),
            control = this.roi;

        ['.marker', '.manualroi'].forEach(function (roitype) {
            control.selectAll(roitype)
                .each(function () {
                    var rect = d3.select(this),
                        x = parseFloat(rect.attr('x')),
                        y = parseFloat(rect.attr('y'));
                    rect
                        .attr('x', x + dxmax)
                        .attr('y', y + dymax);
                });
        });
        return this;
    };

    Rectangle1.prototype._left = function (dx) {
        var leftcoord = Number.parseFloat(this.roi.select('#topleft').attr('x')) + this.MARKER_WIDTH * 0.5,
            rightcoord = Number.parseFloat(this.roi.select('#topright').attr('x')) + this.MARKER_WIDTH * 0.5,
            dxmax = (dx > 0) ? Math.min(dx, rightcoord - leftcoord - this.STROKE_WIDTH) : Math.max(dx, -leftcoord),
            control = this.roi;

        ['#left', '#topleft', '#bottomleft'].forEach(function (id) {
            var rect = control.select(id),
                x = parseFloat(rect.attr('x'));
            rect
                .attr('x', x + dxmax);
        });

        ['#top', '#bottom', '#mainroi'].forEach(function (id) {
            var rect = control.select(id),
                x = parseFloat(rect.attr('x')),
                width = parseFloat(rect.attr('width'));
            rect
                .attr('x', x + dxmax)
                .attr('width', width - dxmax);
        });
        this._update_center_x(this.roi);
        return this;
    };

    Rectangle1.prototype._top = function (dx, dy) {
        var topcoord = Number.parseFloat(this.roi.select('#topleft').attr('y')) + this.MARKER_WIDTH * 0.5,
            bottomcoord = Number.parseFloat(this.roi.select('#bottomleft').attr('y')) + this.MARKER_WIDTH * 0.5,
            dymax = (dy > 0) ? Math.min(dy, bottomcoord - topcoord - this.STROKE_WIDTH) : Math.max(dy, -topcoord),
            control = this.roi;

        ['#top', '#topright', '#topleft'].forEach(function (id) {
            var rect = control.select(id),
                y = parseFloat(rect.attr('y'));
            rect
                .attr('y', y + dymax);
        });

        ['#left', '#right', '#mainroi'].forEach(function (id) {
            var rect = control.select(id),
                y = Number.parseFloat(rect.attr('y')),
                height = Number.parseFloat(rect.attr('height'));
            rect
                .attr('y', y + dymax)
                .attr('height', height - dymax);
        });
        this._update_center_y(this.roi);
        return this;
    };

    Rectangle1.prototype._right = function (dx) {
        var leftcoord = Number.parseFloat(this.roi.select('#topleft').attr('x')) + this.MARKER_WIDTH * 0.5,
            rightcoord = Number.parseFloat(this.roi.select('#topright').attr('x')) + this.MARKER_WIDTH * 0.5,
            dxmax = (dx > 0) ? Math.min(dx, this.roi.limits.width - rightcoord) : Math.max(dx, leftcoord - rightcoord + this.STROKE_WIDTH),
            control = this.roi;

        ['#right', '#topright', '#bottomright'].forEach(function (id) {
            var rect = control.select(id),
                x = parseFloat(rect.attr('x'));
            rect
                .attr('x', x + dxmax);
        });

        ['#top', '#bottom', '#mainroi'].forEach(function (id) {
            var rect = control.select(id),
                width = parseFloat(rect.attr('width'));
            rect
                .attr('width', width + dxmax);
        });
        this._update_center_x(this.roi);
        return this;
    };

    Rectangle1.prototype._bottom = function (dx, dy) {
        var topcoord = Number.parseFloat(this.roi.select('#topleft').attr('y')) + this.MARKER_WIDTH * 0.5,
            bottomcoord = Number.parseFloat(this.roi.select('#bottomleft').attr('y')) + this.MARKER_WIDTH * 0.5,
            dymax = (dy > 0) ? Math.min(dy, this.roi.limits.height - bottomcoord) : Math.max(dy, topcoord - bottomcoord + this.STROKE_WIDTH),
            control = this.roi;

        ['#bottom', '#bottomright', '#bottomleft'].forEach(function (id) {
            var rect = control.select(id),
                y = parseFloat(rect.attr('y'));
            rect
                .attr('y', y + dymax);
        });

        ['#left', '#right', '#mainroi'].forEach(function (id) {
            var rect = control.select(id),
                height = parseFloat(rect.attr('height'));
            rect
                .attr('height', height + dymax);
        });
        this._update_center_y(this.roi);
        return this;
    };

    Rectangle1.prototype._topright = function (dx, dy) {
        this._top(dx, dy)
            ._right(dx, dy);
        this._update_center(this.roi);
        return this;
    };

    Rectangle1.prototype._topleft = function (dx, dy) {
        this._top(dx, dy)
            ._left(dx, dy);
        this._update_center(this.roi);
        return this;
    };

    Rectangle1.prototype._bottomright = function (dx, dy) {
        this._bottom(dx, dy)
            ._right(dx, dy);
        this._update_center(this.roi);
        return this;
    };

    Rectangle1.prototype._bottomleft = function (dx, dy) {
        this._bottom(dx, dy)
            ._left(dx, dy);
        this._update_center(this.roi);
        return this;
    };

    /**
     * parameters sets or returns the parameters, depending on whether an input
     * parameter is given or not, describing the shape of this manual ROI.
     *
     * @param {any} rect
     * @returns
     */
    Rectangle1.prototype.parameters = function (rect) {
        var mainroi = this.roi.select('#mainroi');

        if (arguments.length === 0) {
            return this.sizeObservable();
        } else {
            this.roi.select('#mainroi')
                .attr('x', rect.x)
                .attr('y', rect.y)
                .attr('width', rect.width)
                .attr('height', rect.height);

            // add the markers for interaction
            this.roi.select('#center')
                .attr('x', rect.x + (rect.width - this.MARKER_WIDTH) * 0.5)
                .attr('y', rect.y + (rect.height - this.MARKER_WIDTH) * 0.5)
                .attr('width', this.MARKER_WIDTH)
                .attr('height', this.MARKER_WIDTH);

            // sides
            this.roi.select('#left')
                .attr('x', rect.x - this.STROKE_WIDTH * 0.5)
                .attr('y', rect.y + this.STROKE_WIDTH * 0.5)
                .attr('width', this.STROKE_WIDTH)
                .attr('height', rect.height - this.STROKE_WIDTH);

            this.roi.select('#right')
                .attr('x', rect.x + rect.width - this.STROKE_WIDTH * 0.5)
                .attr('y', rect.y + this.STROKE_WIDTH * 0.5)
                .attr('width', this.STROKE_WIDTH)
                .attr('height', rect.height - this.STROKE_WIDTH);

            this.roi.select('#top')
                .attr('x', rect.x + this.STROKE_WIDTH * 0.5)
                .attr('y', rect.y - this.STROKE_WIDTH * 0.5)
                .attr('width', rect.width - this.STROKE_WIDTH)
                .attr('height', this.STROKE_WIDTH);

            this.roi.select('#bottom')
                .attr('x', rect.x + this.STROKE_WIDTH * 0.5)
                .attr('y', rect.y + rect.height - this.STROKE_WIDTH * 0.5)
                .attr('width', rect.width - this.STROKE_WIDTH)
                .attr('height', this.STROKE_WIDTH);

            // corners go on top
            this.roi.select('#topleft')
                .attr('x', rect.x - this.MARKER_WIDTH * 0.5)
                .attr('y', rect.y - this.MARKER_WIDTH * 0.5)
                .attr('width', this.MARKER_WIDTH)
                .attr('height', this.MARKER_WIDTH);

            this.roi.select('#topright')
                .attr('x', rect.x + rect.width - this.MARKER_WIDTH * 0.5)
                .attr('y', rect.y - this.MARKER_WIDTH * 0.5)
                .attr('width', this.MARKER_WIDTH)
                .attr('height', this.MARKER_WIDTH);

            this.roi.select('#bottomright')
                .attr('x', rect.x + rect.width - this.MARKER_WIDTH * 0.5)
                .attr('y', rect.y + rect.height - this.MARKER_WIDTH * 0.5)
                .attr('width', this.MARKER_WIDTH)
                .attr('height', this.MARKER_WIDTH);

            this.roi.select('#bottomleft')
                .attr('x', rect.x - this.MARKER_WIDTH * 0.5)
                .attr('y', rect.y + rect.height - this.MARKER_WIDTH * 0.5)
                .attr('width', this.MARKER_WIDTH)
                .attr('height', this.MARKER_WIDTH);

            this.sizeObservable({
                'x': Number.parseFloat(mainroi.attr('x')),
                'y': Number.parseFloat(mainroi.attr('y')),
                'width': Number.parseFloat(mainroi.attr('width')),
                'height': Number.parseFloat(mainroi.attr('height'))
            });
        }
        return this;
    };

    return Rectangle1;
});