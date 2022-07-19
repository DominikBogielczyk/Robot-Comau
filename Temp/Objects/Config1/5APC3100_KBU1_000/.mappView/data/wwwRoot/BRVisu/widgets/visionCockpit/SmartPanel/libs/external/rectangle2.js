/**
 * rectangle2 is a rectangle which can arbitrarily rotated and displaced.
 * Notice the difference on how it is parametrized in contrast to rectangle1.
 * Here the parameters are:
 *  (cx, cy) the center point of the rectangle
 *  angle    the rotation angle with respect to the x axis
 *  width    width of the rectangle along the x-axis for angle=0
 *  height   height of the rectangle along the x-axis for angle=0
*/
define(['libs/d3/d3',
  './observe',
  './roi',
  './draggable'
],
    function (d3, observable, ROI) {
        'use strict';

        function Rectangle2(renderer, rect, active, sizeObservable) {
            ROI.call(this, renderer, rect.id, sizeObservable);

            // triggers end of dragging action
            var notifier = function () { },
                x = -rect.width * 0.5,
                y = -rect.height * 0.5;

            // store the parameters describing the rectangle2 as data- attributes.
            // notice that SVG codes de angles in degrees
            this.roi
                .attr('data-angle', rect.angle)
                .attr('data-centerx', rect.cx)
                .attr('data-centery', rect.cy);

            this.roi.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('width', rect.width)
                .attr('height', rect.height)
                .classed('manualroi', true)
                .attr('id', 'mainroi');

            var self = this;
            // add the markers for interaction
            this.roi.append('rect')
                .attr('x', x + (rect.width - this.MARKER_WIDTH) * 0.5)
                .attr('y', y + (rect.height - this.MARKER_WIDTH) * 0.5)
                .attr('width', this.MARKER_WIDTH)
                .attr('height', this.MARKER_WIDTH)
                .attr('id', 'center')
                .classed('marker', true)
                .draggable({
                    'drag': function (dx, dy) {
                        self.translate(dx, dy);
                    },
                    'dragend': notifier
                });

            // sides
            this.roi.append('rect')
                .attr('x', x - this.STROKE_WIDTH * 0.5)
                .attr('y', y + this.STROKE_WIDTH * 0.5)
                .attr('width', this.STROKE_WIDTH)
                .attr('height', rect.height - this.STROKE_WIDTH)
                .attr('id', 'left')
                .classed('marker', true)
                .draggable({
                    'drag': this._left.bind(this),
                    'dragend': notifier
                });

            this.roi.append('rect')
                .attr('x', x + rect.width - this.STROKE_WIDTH * 0.5)
                .attr('y', y + this.STROKE_WIDTH * 0.5)
                .attr('width', this.STROKE_WIDTH)
                .attr('height', rect.height - this.STROKE_WIDTH)
                .attr('id', 'right')
                .classed('marker', true)
                .draggable({
                    'drag': this._right.bind(this),
                    'dragend': notifier
                });

            this.roi.append('rect')
                .attr('x', x + this.STROKE_WIDTH * 0.5)
                .attr('y', y - this.STROKE_WIDTH * 0.5)
                .attr('width', rect.width - this.STROKE_WIDTH)
                .attr('height', this.STROKE_WIDTH)
                .attr('id', 'top')
                .classed('marker', true)
                .draggable({
                    'drag': this._top.bind(this),
                    'dragend': notifier
                });

            this.roi.append('rect')
                .attr('x', x + this.STROKE_WIDTH * 0.5)
                .attr('y', y + rect.height - this.STROKE_WIDTH * 0.5)
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
                .attr('x', x - this.MARKER_WIDTH * 0.5)
                .attr('y', y - this.MARKER_WIDTH * 0.5)
                .attr('width', this.MARKER_WIDTH)
                .attr('height', this.MARKER_WIDTH)
                .attr('id', 'topleft')
                .classed('marker', true)
                .draggable({
                    'drag': this._topleft.bind(this),
                    'dragend': notifier
                });

            this.roi.append('rect')
                .attr('x', x + rect.width - this.MARKER_WIDTH * 0.5)
                .attr('y', y - this.MARKER_WIDTH * 0.5)
                .attr('width', this.MARKER_WIDTH)
                .attr('height', this.MARKER_WIDTH)
                .attr('id', 'topright')
                .classed('marker', true)
                .draggable({
                    'drag': this._topright.bind(this),
                    'dragend': notifier
                });

            this.roi.append('rect')
                .attr('x', x + rect.width - this.MARKER_WIDTH * 0.5)
                .attr('y', y + rect.height - this.MARKER_WIDTH * 0.5)
                .attr('width', this.MARKER_WIDTH)
                .attr('height', this.MARKER_WIDTH)
                .attr('id', 'bottomright')
                .classed('marker', true)
                .draggable({
                    'drag': this._bottomright.bind(this),
                    'dragend': notifier
                });

            this.roi.append('rect')
                .attr('x', x - this.MARKER_WIDTH * 0.5)
                .attr('y', y + rect.height - this.MARKER_WIDTH * 0.5)
                .attr('width', this.MARKER_WIDTH)
                .attr('height', this.MARKER_WIDTH)
                .attr('id', 'bottomleft')
                .classed('marker', true)
                .draggable({
                    'drag': this._bottomleft.bind(this),
                    'dragend': notifier
                });

            // rotation marks
            this.roi.append('circle')
                .attr('cx', x + rect.width)
                .attr('cy', y + rect.height * 0.5)
                .attr('r', this.MARKER_WIDTH * 0.5)
                .attr('id', 'rotright')
                .classed('marker', true)
                .draggable({
                    'drag': this._rotright.bind(this),
                    'dragend': notifier
                });

            this.roi.append('circle')
                .attr('cx', x)
                .attr('cy', y + rect.height * 0.5)
                .attr('r', this.MARKER_WIDTH * 0.5)
                .attr('id', 'rotleft')
                .classed('marker', true)
                .draggable({
                    'drag': this._rotleft.bind(this),
                    'dragend': notifier
                });

            this.roi.append('circle')
                .attr('cx', x + rect.width * 0.5)
                .attr('cy', y)
                .attr('r', this.MARKER_WIDTH * 0.5)
                .attr('id', 'rottop')
                .classed('marker', true)
                .draggable({
                    'drag': this._rottop.bind(this),
                    'dragend': notifier
                });

            this.roi.append('circle')
                .attr('cx', x + rect.width * 0.5)
                .attr('cy', y + rect.height)
                .attr('r', this.MARKER_WIDTH * 0.5)
                .attr('id', 'rotbottom')
                .classed('marker', true)
                .draggable({
                    'drag': this._rotbottom.bind(this),
                    'dragend': notifier
                });

            // move and rotate the rectangle to its expected position
            // this.translate(rect.cx, rect.cy);
            this._update();
            this.edit(active);
        }

        Rectangle2.prototype = Object.create(ROI.prototype);

        Rectangle2.prototype._update = function (cx, cy, angle) {
            cx = cx || Number.parseFloat(this.roi.attr('data-centerx'));
            cy = cy || Number.parseFloat(this.roi.attr('data-centery'));
            angle = angle || Number.parseFloat(this.roi.attr('data-angle'));

            //console.log('transform = ' + this.roi.attr('transform'));

            this.roi
                .attr('transform',
                    'translate(' + cx + ',' + cy + ') rotate(' + angle + ')');

            //console.log('transform = ' + this.roi.attr('transform'));
            //console.log('');
        };

        /**
         * translate shifts the center of the rectangle2
         */
        Rectangle2.prototype.translate = function (dx, dy) {
            if (arguments.length <= 0 || typeof (dx) !== "number" || typeof (dy) !== "number") {
                return;
            }
            var cx = Number.parseFloat(this.roi.attr('data-centerx')),
                cy = Number.parseFloat(this.roi.attr('data-centery'));

            //console.log('dx, dy = ' + dx + ', ' + dy);
            cx += dx;
            cy += dy;
            this.roi
                .attr('data-centerx', cx)
                .attr('data-centery', cy);

            this._update();
        };

        /**
         * rotate increments the angle of the rectangle2 by delta degrees
         */
        Rectangle2.prototype.rotate = function (delta) {
            if (arguments.length <= 0 || typeof (delta) !== "number") {
                return;
            }
            var cx = Number.parseFloat(this.roi.attr('data-centerx')),
                cy = Number.parseFloat(this.roi.attr('data-centery')),
                angle = Number.parseFloat(this.roi.attr('data-angle')) + delta;

            this._update(cx, cy, angle);
            this.roi
                .attr('data-angle', angle);
        };

        Rectangle2.prototype._center = function (dx, dy) {
            this.translate(dx, dy);
            return this;
        };

        Rectangle2.prototype._top = function () { };

        Rectangle2.prototype._bottom = function () { };

        Rectangle2.prototype._left = function () { };

        Rectangle2.prototype._right = function () { };

        Rectangle2.prototype._topleft = function () { };

        Rectangle2.prototype._topright = function () { };

        Rectangle2.prototype._bottomleft = function () { };

        Rectangle2.prototype._bottomright = function () { };

        Rectangle2.prototype._rotright = function () { };

        Rectangle2.prototype._rotleft = function () { };

        Rectangle2.prototype._rottop = function () { };

        Rectangle2.prototype._rotbottom = function () { };

        Rectangle2.prototype.parameters = function (rect) {
            if (arguments.length === 0) {
                return this.sizeObservable();
            } else {
                var x = rect.cx - rect.width * 0.5,
                    y = rect.cy - rect.height * 0.5;
                this.roi.select('#mainroi')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', rect.width)
                    .attr('height', rect.height);

                // add the markers for interaction
                this.roi.select('#center')
                    .attr('x', x + (rect.width - this.MARKER_WIDTH) * 0.5)
                    .attr('y', y + (rect.height - this.MARKER_WIDTH) * 0.5)
                    .attr('width', this.MARKER_WIDTH)
                    .attr('height', this.MARKER_WIDTH);

                // sides
                this.roi.select('#left')
                    .attr('x', x - this.STROKE_WIDTH * 0.5)
                    .attr('y', y + this.STROKE_WIDTH * 0.5)
                    .attr('width', this.STROKE_WIDTH)
                    .attr('height', rect.height - this.STROKE_WIDTH);

                this.roi.select('#right')
                    .attr('x', x + rect.width - this.STROKE_WIDTH * 0.5)
                    .attr('y', y + this.STROKE_WIDTH * 0.5)
                    .attr('width', this.STROKE_WIDTH)
                    .attr('height', rect.height - this.STROKE_WIDTH);

                this.roi.select('#top')
                    .attr('x', x + this.STROKE_WIDTH * 0.5)
                    .attr('y', y - this.STROKE_WIDTH * 0.5)
                    .attr('width', rect.width - this.STROKE_WIDTH)
                    .attr('height', this.STROKE_WIDTH);

                this.roi.select('#bottom')
                    .attr('x', x + this.STROKE_WIDTH * 0.5)
                    .attr('y', y + rect.height - this.STROKE_WIDTH * 0.5)
                    .attr('width', rect.width - this.STROKE_WIDTH)
                    .attr('height', this.STROKE_WIDTH);

                // corners go on top
                this.roi.select('#topleft')
                    .attr('x', x - this.MARKER_WIDTH * 0.5)
                    .attr('y', y - this.MARKER_WIDTH * 0.5)
                    .attr('width', this.MARKER_WIDTH)
                    .attr('height', this.MARKER_WIDTH);

                this.roi.select('#topright')
                    .attr('x', x + rect.width - this.MARKER_WIDTH * 0.5)
                    .attr('y', y - this.MARKER_WIDTH * 0.5)
                    .attr('width', this.MARKER_WIDTH)
                    .attr('height', this.MARKER_WIDTH);

                this.roi.select('#bottomright')
                    .attr('x', x + rect.width - this.MARKER_WIDTH * 0.5)
                    .attr('y', y + rect.height - this.MARKER_WIDTH * 0.5)
                    .attr('width', this.MARKER_WIDTH)
                    .attr('height', this.MARKER_WIDTH);

                this.roi.select('#bottomleft')
                    .attr('x', x - this.MARKER_WIDTH * 0.5)
                    .attr('y', y + rect.height - this.MARKER_WIDTH * 0.5)
                    .attr('width', this.MARKER_WIDTH)
                    .attr('height', this.MARKER_WIDTH);

                this.roi.select('#rotright')
                    .attr('cx', x + rect.width)
                    .attr('cy', y + rect.height * 0.5)
                    .attr('r', this.MARKER_WIDTH * 0.5);

                this.roi.select('#rotleft')
                    .attr('cx', x)
                    .attr('cy', y + rect.height * 0.5)
                    .attr('r', this.MARKER_WIDTH * 0.5);

                this.roi.select('#rottop')
                    .attr('cx', x + rect.width * 0.5)
                    .attr('cy', y)
                    .attr('r', this.MARKER_WIDTH * 0.5);

                this.roi.append('#rotbottom')
                    .attr('cx', x + rect.width * 0.5)
                    .attr('cy', y + rect.height)
                    .attr('r', this.MARKER_WIDTH * 0.5);
            }
            this._update();
            return this;
        };

        return Rectangle2;
    });