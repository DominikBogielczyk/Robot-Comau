/**
 * Circle implements a circular ROI which can be dragged by the center point
 * and expanded or shrunk when dragging the circle margin.
 */
define(['libs/d3/d3', './observe', './roi', './draggable'],

    function (d3, observable, ROI) {
        'use strict';

        function Circle(renderer, circle, active, sizeObservable) {
            ROI.call(this, renderer, circle.id, sizeObservable);
            this.roi.append('circle')
                .attr('cx', circle.cx)
                .attr('cy', circle.cy)
                .attr('r', circle.r)
                .classed('manualroi', true)
                .attr('id', 'mainroi');

            // Notify subscribers whenever any of the ROI parameters changes.
            var mainroi = this.roi.select('#mainroi');
            this.sizeObservable = observable({
                cx: Number.parseFloat(mainroi.attr('cx')),
                cy: Number.parseFloat(mainroi.attr('cy')),
                r: Number.parseFloat(mainroi.attr('r'))
            });

            /**
             * notifier is responsible for triggering subscribers as soon as  the user
             * has finished editing the ROI.
             */
            var notifier = function () {
                var mainroi = this.roi.select('#mainroi');
                this.sizeObservable({
                    cx: Number.parseFloat(mainroi.attr('cx')),
                    cy: Number.parseFloat(mainroi.attr('cy')),
                    r: Number.parseFloat(mainroi.attr('r'))
                });
            }.bind(this);

            this.roi.append('rect')
                .attr('x', circle.cx - this.MARKER_WIDTH * 0.5)
                .attr('y', circle.cy - this.MARKER_WIDTH * 0.5)
                .attr('width', this.MARKER_WIDTH)
                .attr('height', this.MARKER_WIDTH)
                .attr('id', 'center')
                .classed('marker', true)
                .draggable({
                    'drag': this._center.bind(this),
                    'dragend': notifier
                });

            this.roi.append('circle')
                .attr('cx', circle.cx)
                .attr('cy', circle.cy)
                .attr('r', circle.r)
                .attr('id', 'border')
                .style('stroke-width', this.MARKER_WIDTH / 2 + 'px')
                .classed('marker', true)
                .classed('border', true)
                .draggable({
                    'drag': this._border.bind(this),
                    'dragend': notifier
                });

            this.edit(active);
            return this;
        }

        Circle.prototype = Object.create(ROI.prototype);

        Circle.prototype._center = function (dx, dy) {
            var cx = Number.parseFloat(this.roi.select('#mainroi').attr('cx')),
                cy = Number.parseFloat(this.roi.select('#mainroi').attr('cy')),
                r = Number.parseFloat(this.roi.select('#mainroi').attr('r')),
                dxmax = (dx >= 0) ? Math.min(this.roi.limits.width - (cx + r), dx) : (cx - r + dx < 0) ? 0 : dx,
                dymax = (dy >= 0) ? Math.min(this.roi.limits.height - (cy + r), dy) : (cy - r + dy < 0) ? 0 : dy;

            var self = this;
            ['#mainroi', '#border'].forEach(function (id) {
                self.roi.select(id)
                    .attr('cx', cx + dxmax)
                    .attr('cy', cy + dymax);
            });
            var center = self.roi.select('#center');
            center
                .attr('x', Number.parseFloat(center.attr('x')) + dxmax)
                .attr('y', Number.parseFloat(center.attr('y')) + dymax);
            return this;
        };

        function euclid_dist(x, y) {
            return Math.sqrt(x * x + y * y);
        }

        Circle.prototype._border = function (dx, dy, x, y) {
            var cx = Number.parseFloat(this.roi.select('#mainroi').attr('cx')),
                cy = Number.parseFloat(this.roi.select('#mainroi').attr('cy')),
                r = Number.parseFloat(this.roi.select('#mainroi').attr('r')),
                dr = euclid_dist(dx, dy);

            if (euclid_dist(x + dx - cx, y + dy - cy) < euclid_dist(x - cx, y - cy)) {
                if (r - dr > 0.5) {
                    dr = -dr;
                }
            }

            var self = this,
                newr = r + dr;
            if (cx + newr > this.roi.limits.width || cy + newr > this.roi.limits.height ||
                cx - newr < 0 || cy - newr < 0) {
                newr = r;
            }
            ['#mainroi', '#border'].forEach(function (id) {
                self.roi.select(id)
                    .attr('r', newr);
            });
            return this;
        };

        /**
         * parameters sets or returns the parameters, depending on whether an input
         * parameter is given or not, describing the shape of this manual ROI.
         * 
         * @param {any} rect 
         * @returns 
         */
        Circle.prototype.parameters = function (circle) {
            var mainroi = this.roi.select('#mainroi');
            if (circle === undefined) {
                return this.sizeObservable();
            } else {
                mainroi
                    .attr('cx', circle.cx)
                    .attr('cy', circle.cy)
                    .attr('r', circle.r);

                this.sizeObservable({
                    'cx': Number.parseFloat(mainroi.attr('cx')),
                    'cy': Number.parseFloat(mainroi.attr('cy')),
                    'r': Number.parseFloat(mainroi.attr('r'))
                });
            }
            return this;
        };

        return Circle;
    });