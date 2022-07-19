define(['libs/d3/d3'], function (d3) {
    'use strict';

    if (!Math.radians) {
        // Converts from degrees to radians.
        Math.radians = function (degrees) {
            return degrees * Math.PI / 180;
        };
    }

    if (!Math.degrees) {
        // Converts from radians to degrees.
        Math.degrees = function (radians) {
            return radians * 180 / Math.PI;
        };
    }

    /**
     * Transform2D is an object providing with some basic 2D affine
     * transformations. I use this own implementations because SVGMatrix
     * is deprecated https://developer.mozilla.org/de/docs/Web/API/SVGMatrix.
     */
    function Transform2D(data) {
        if (data !== undefined) {
            // avoid side effects
            var m = Array.isArray(arguments[0]) ?
              arguments[0].slice() :
              Array.prototype.slice.call(arguments);

            if (m.length !== 6) {
                throw new Error('Unexpected number of input parameters ' +
                            m.length + '. Expected 6');
            }
            this.matrix = m;
        } else {
            // initialize with identity
            this.matrix = [1, 0, 0, 0, 1, 0];
        }
    }

    /**
     * toSVG serializes the affine transformation in the format given by the SVG standard.
     * 
     * @returns a string containing the serialized transform.
     */
    Transform2D.prototype.toSVG = function () {
        var values = [
                this.matrix[0], this.matrix[3], this.matrix[1], this.matrix[4], this.matrix[2], this.matrix[5]
        ],
            str = values.map(String).join(',');
        return 'matrix(' + str + ')';
    };

    /**
     * fromSVG deserialized an affine transform.
     * 
     * @param {any} object 
     * @returns a new transform.
     */
    Transform2D.prototype.fromSVG = function (object) {
        var svgelem = typeof (object) === 'string' ? d3.select(object) : object,
            value = svgelem.attr('transform');
        if (!value) {
            throw new Error('Missing transform attribute');
        }
        var coefficients = value
            .match(/\((.*)\)/)[1]
            .split(',')
            .map(function (v) {
                return Number.parseFloat(v);
            });
        return new Transform2D([
            coefficients[0], coefficients[2], coefficients[4], coefficients[1], coefficients[3], coefficients[5]
        ]);
    };

    /**
     * translate adds a translation to the current affine transformation.
     * 
     * @param {any} tx 
     * @param {any} ty 
     * @returns the new affine transformation.
     */
    Transform2D.prototype.translate = function (tx, ty) {
        if ((typeof tx !== 'number') || (typeof ty !== 'number')) {
            throw new Error('Missing input arguments');
        }

        var translated = new Transform2D(this.matrix);
        translated.matrix[2] += tx;
        translated.matrix[3 + 2] += ty;
        return translated;
    };

    /**
     * scale adds scaling about the fixed point given by (px, py).
     * 
     * @param {any} sx 
     * @param {any} sy 
     * @param {any} px 
     * @param {any} py 
     * @returns the new affine transformation.
     */
    Transform2D.prototype.scale = function (sx, sy, px, py) {
        if ((typeof sx !== 'number') || (typeof sy !== 'number')) {
            throw new Error('Missing input arguments');
        }

        var tx = px || 0,
            ty = py || 0,
            scaled = this.translate(-tx, -ty);
        scaled.matrix[0] *= sx;
        scaled.matrix[1] *= sx;
        scaled.matrix[2] *= sx;
        scaled.matrix[3 + 0] *= sy;
        scaled.matrix[3 + 1] *= sy;
        scaled.matrix[3 + 2] *= sy;
        return scaled.translate(tx, ty);
    };

    /**
     * rotate adds a rotation of angle radians about the fixed point given by (px, py).
     * 
     * @param {any} angle
     * @param {any} px 
     * @param {any} py 
     * @returns the new affine transformation.
     */
    Transform2D.prototype.rotate = function (angle, px, py) {
        if (typeof angle !== 'number') {
            throw new Error('Missing input argument angle');
        }

        var tx = px || 0,
            ty = py || 0,
            tmp = this.translate(-tx, -ty),
            cos = Math.cos(angle),
            sin = Math.sin(angle),
            rotated = new Transform2D();
        rotated.matrix[0] = cos * tmp.matrix[0] - sin * tmp.matrix[3];
        rotated.matrix[1] = cos * tmp.matrix[1] - sin * tmp.matrix[3 + 1];
        rotated.matrix[2] = cos * tmp.matrix[2] - sin * tmp.matrix[3 + 2];
        rotated.matrix[3 + 0] = sin * tmp.matrix[0] + cos * tmp.matrix[3];
        rotated.matrix[3 + 1] = sin * tmp.matrix[1] + cos * tmp.matrix[3 + 1];
        rotated.matrix[3 + 2] = sin * tmp.matrix[2] + cos * tmp.matrix[3 + 2];
        return rotated.translate(tx, ty);
    };

    /**
     * transform applies the transformation on a given point.
     * 
     * @param {any} point 
     * @returns the transformed point.
     */
    Transform2D.prototype.transform = function (point) {
        if (Array.isArray(point)) {
            return [this.matrix[0] * point[0] + this.matrix[1] * point[1] + this.matrix[2],
                this.matrix[3] * point[0] + this.matrix[3 + 1] * point[1] + this.matrix[3 + 2]
            ];
        } else if (point instanceof Object) {
            return {
                x: this.matrix[0] * point.x + this.matrix[1] * point.y + this.matrix[2],
                y: this.matrix[3] * point.x + this.matrix[3 + 1] * point.y + this.matrix[3 + 2]
            };
        }
    };

    return Transform2D;
});