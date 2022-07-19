/**
 * Managing a list of interactive ROIs which can be manually modified by the user.
 *
 */
/*global define, _*/
define(['libs/d3/d3',  './manual_roi'], function (d3, ManualROI) {
    'use strict';

    /**
     * ROIList manages a list of manually modifiable ROIs.
     * sizeObservable is optional. Can be either the size of the control in which
     * they are embedded, or else an observable triggered any time that size changes.
     * See roi.js for further details.
     * 
     * @param {any} renderer the SVG.
     * @param {any} sizeObservable observable to query ROI limits.
     */
    function ROIList(renderer, sizeObservable) {
        this._rois = [];
        this._renderer = renderer;

        /**
         * Add automatically all types of manual ROIs.
         * See manual_roi.js for details.
         */
        var self = this;
        Object.keys(ManualROI).forEach(function (funcname) {
            self[funcname] = function (shape, active) {
                var roi = new ManualROI[funcname](self._renderer, shape, active, sizeObservable);
                self._rois.push(roi);
                return roi;
            };
        });
    }

    /**
     * clear removes all ROIs from control and clears the ROI list.
     * @returns a reference to the ROI list.
     */
    ROIList.prototype.clear = function () {
        var self = this;
        this._rois.forEach(function (roi) {
            self._renderer.selectAll('g#' + roi.id()).remove();
        });
        this._rois = [];
        return this;
    };

    /**
     * remove detaches the object specified by the parameter roi from the control,
     * and deletes its entry from the list.
     * 
     * @param {any} roi the id or else the object containing the id.
     * @returns a reference to the ROI list.
     */
    ROIList.prototype.remove = function (roi) {
        var id;
        if (typeof (roi) === 'string') {
            id = roi;
        } else {
            if (!roi.hasOwnProperty('id')) {
                throw new Error('Input parameter must have an ID');
            }
            id = roi.id;
        }
        this._renderer.selectAll('g' + id).remove();
        _.remove(this._rois, function (roiid) {
            return roiid.id === id;
        });
        return this;
    };

    /**
     * active enables/disables interaction with the manual ROIs so that other type of
     * interactions in the control are possible, withtout interferences.
     * 
     * @param {on} on: should the ROIs be active or frozen?
     * @returns a reference to the ROI list.
     */
    ROIList.prototype.active = function (on) {
        if (typeof (on) !== 'boolean') {
            throw new Error('Unexpected parameter type');
        }
        this._rois.forEach(function (roi) {
            roi.edit(on);
        });
        return this;
    };

    /**
     * getROIs returns all ROIs which match the search criteria given by the input function.
     * 
     * @param {any} criteria a callback function.
     * @returns a new list with the found elements.
     */
    ROIList.prototype.getROIs = function (criteria) {
        return _.filter(this._rois, criteria);
    };

    return ROIList;
});