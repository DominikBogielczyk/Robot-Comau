/**
 * ROI base class offering common functionality: reacting to changes in image
 * size and switching between edit and default modus.
 *
*/
define([], function () {
    'use strict';

    /**
     * ROI is the "base class" for all types of manual ROIs, that is, ROIs which can be
     * modified through mouse interaction.
     * sizeObservable is either a function that returns the size of the control when called
     * (see observe.js for details), or else an object with members width and height.
     * If not specified, the ROIs can be dragged beyond the borders of the control.
     * 
     * The first case is the way to go, when the size of the viewBox (part in HALCON parlance)
     * is expected to change, the second when its size remains fixed.
     * 
     * @param {any} renderer 
     * @param {any} id 
     * @param {any} sizeObservable
     */
    function ROI(renderer, id, sizeObservable) {
        if (!(renderer instanceof Array)) {
            throw new Error('Missing control to be attached to');
        }
        if (!id) {
            throw new Error('An id for the ROI must be supplied');
        }
        this.roi = renderer.append('g')
            .attr('class', 'manual')
            .attr('id', id);

        // !!!!  it is assumed that MARKER_WIDTH >= STROKE_WIDTH  !!!!
        this.STROKE_WIDTH = 5;
        this.MARKER_WIDTH = 11;

        if (sizeObservable) {
            var size = (sizeObservable instanceof Function) ? sizeObservable() : sizeObservable,
                self = this;
            this.roi.limits = {
                'width': Math.round(size.width),
                'height': Math.round(size.height)
            };

            if (sizeObservable instanceof Function) {
                sizeObservable.subscribe(function (newSize) {
                    self.roi.limits = {
                        'width': Math.round(newSize.width),
                        'height': Math.round(newSize.height)
                    };
                    if (self.reset) {
                        // see for example rectangle1
                        self.reset({
                            width: Math.round(newSize.width),
                            height: Math.round(newSize.height)
                        });
                    }
                });
            }
        } else {
            this.roi.limits = {
                'width': Number.POSITIVE_INFINITY,
                'height': Number.POSITIVE_INFINITY
            };
        }

        this.sizeObservable = null;
    }

    /**
     * id returns the ID of the container element for the ROI.
     * 
     * @returns id of the ROI
     */
    ROI.prototype.id = function () {
        return this.roi.attr('id');
    };

    /**
     * asSelection allows the user to work on the corresponding d3 object.
     * 
     * @returns reference to the corresponding d3 object.
     */
    ROI.prototype.asSelection = function () {
        return this.roi;
    };

    /**
     * hide causes the ROI not to be displayed (though still present in the SVG)
     * 
     * @returns a reference to the ROI itself
     */
    ROI.prototype.hide = function () {
        this.asSelection().style('display', 'none');
        return this;
    };

    /**
     * show causes the ROI to be displayed
     * 
     * @returns a reference to the ROI itself
     */
    ROI.prototype.show = function () {
        this.asSelection().style('display', 'block');
        return this;
    };

    /**
     * getROIParams returns the current values of the parameters describing the ROI shape.
     * 
     * @returns object containing the parameters that describe the shape of the ROI.
     */
    ROI.prototype.getROIParams = function () {
        return this.sizeObservable();
    };

    /**
     * onChange registers a callback which will be triggered whenever the user has finished
     * interacting with the ROI. Please notice that if you provide a new ROI type, you need
     * to provide for a sizeObservable. See rectangle1.js and circle.js for details.
     * 
     * @param {any} callback 
     * @returns reference to the ROI.
     */
    ROI.prototype.onChange = function (callback) {
        if (this.sizeObservable === null) {
            throw new Error('Missing implementation of sizeObservable');
        }
        this.roi.sizeObservable.subscribe(callback);
        return this;
    };

    /**
     * edit allows to switch on betweem edit modus and default modus.
     *
     * @param {any} on
     * @returns reference to the ROI.
     */
    ROI.prototype.edit = function (on) {
        if (on === true) {
            this.roi.select('#mainroi')
                .style('display', 'none');
            this.roi.selectAll('.marker')
                .style('display', 'block');
        } else {
            this.roi.selectAll('.marker')
                .style('display', 'none');
            this.roi.select('#mainroi')
                .style('display', 'block');
        }
        return this;
    };

    return ROI;
});