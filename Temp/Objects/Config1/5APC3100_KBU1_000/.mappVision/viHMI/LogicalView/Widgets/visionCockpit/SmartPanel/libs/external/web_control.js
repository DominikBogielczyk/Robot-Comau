/**
 * Web control, responsible for the visualization of graphical objects
 * like regions contours and images, as well as primitives (ROIs), and
 * interaction.
 *
 */
/*global define, _*/
const MIN_ZOOM_WIDTH = 1,
    MAX_ZOOM_WIDTH = 50000,
    ZOOM_FACTOR = 1.25;


define(['libs/d3/d3',
        './transformations',
        './roilist',
        './observe'
    ],
    function (d3, Affine, ROIList, observable) {
        'use strict';

        /**
         * Shows an image so that it fills up the window, while preserving
         * aspect ratio.
         *
         * @param {any} renderer
         * @param {any} src can be either the file path or else binary data.
         * @param {any} varName
         * @returns reference to the container (a SVG)
         */
        function dispImage(renderer, src, varName) {
            var imagetobe = $.Deferred(),
                tmpimg = new Image(),
                image;
            if ($(renderer.select('#group')[0][0]).find('#' + varName).length === 0) {
                image = renderer.select('#group')
                    .insert('image', 'g');
            } else {
                image = renderer.select('#' + varName);
            }

            tmpimg.onload = function () {
                imagetobe.resolve(tmpimg);
            };

            if (src instanceof Blob) {
                var reader = new window.FileReader();
                reader.onloadend = function () {
                    image
                        .attr('xlink:href', reader.result)
                        .attr('id', varName);
                    tmpimg.src = image.attr('xlink:href');
                };
                reader.onerror = function () {
                    imagetobe.reject('Something went wrong when reading the image blob.');
                };
                reader.readAsDataURL(src);
            } else {
                image
                    .attr('xlink:href', src)
                    .attr('id', varName);
                tmpimg.src = src;
            }

            return imagetobe.promise();
        }

        /**
         * Displays text 'msg' at the the position given by point coordinates (x, y).
         *
         * @param {any} renderer
         * @param {any} msg
         * @param {any} x
         * @param {any} y
         * @param {any} id
         * @returns reference to the container (a SVG)
         */
        function dispText(renderer, msg, x, y, id) {
            var text = renderer.select('#group')
                .append('text')
                .attr('id', id)
                .text(msg)
                .attr('x', x)
                .attr('y', y);

            return text;
        }

        /**
         * checks that a given object contains a set of properties with a
         * given name.
         *
         * @param {any} obj
         * @param {any} properties
         * @returns true if the object has properties with those names
         */
        function hasProperties(obj, properties) {
            return properties.map(function (prop) {
                return obj.hasOwnProperty(prop);
            }).find(function (condition) {
                return condition === false;
            }) === undefined;
        }

        /**
         * Returns true is the object is of expected type. Concretely, this
         * function is used to check the ROI type and employ the corresponding
         * function to display and manipulate them.
         *
         * @param {any} obj
         * @param {any} expected_type
         * @returns true if object is of expected type. false otherwise.
         */
        function checkObjType(obj, expected_type) {
            if (!(obj && obj instanceof Object)) {
                return false;
            }
            if (expected_type === 'rectangle') {
                return hasProperties(obj, ['x', 'y', 'width', 'height']);
            }
            if (expected_type === 'circle') {
                return hasProperties(obj, ['x', 'y', 'r']);
            }
            if (expected_type === 'xld_contours') {
                // this may be too slow, and we then need to assume that the input data is correct
                if (hasProperties(obj, ['contours', 'Id']) && (obj.contours instanceof Array)) {
                    return obj.contours.map(function (cont) {
                        return hasProperties(cont, ['points']);
                    }).find(function (result) {
                        return result === false;
                    }) === undefined;
                }
            }
            return false;
        }

        /**
         * Displays a HALCON contour.
         *
         * @param {any} renderer
         * @param {any} xld
         * @param {any} varName variable ID
         * @returns reference to the container (a SVG)
         */
        function dispXLD(renderer, xld, varName) {
            if (!checkObjType(xld, 'xld_contours')) {
                return null;
            }

            var svgxld = renderer.select('#group')
                .append('g')
                .attr('id', varName)
                .classed('contour', true);
            svgxld
                .selectAll('polyline')
                .data(xld.contours)
                .enter()
                .append('polyline')
                .attr('points', function (d) {
                    return d.points;
                })
                .each(function (d) {
                    if (d.closed === 'false') {
                        d3.select(this).attr('fill', 'none');
                    }
                });

            return svgxld;
        }

        /**
         * dispMergedXLD maps the input array of contours into a path. This cover situations where
         * you want to treat the set of contours as a whole.
         *
         * @param {any} renderer
         * @param {any} xld
         * @param {any} varName variable ID
         * @returns reference to the SVG element
         */
        function dispMergedXLD(renderer, xld, varName) {
            if (!checkObjType(xld, 'xld_contours')) {
                return null;
            }

            var path = xld.contours.map(function (cont) {
                return 'M ' + cont.points;
            }).join(' ');

            var svgpath = renderer.select('#group')
                .append('path')
                .attr('id', varName)
                .classed('contour', true)
                .attr('d', path);
            return svgpath;
        }

        /**
         * Whaaat? you might rightly ask. When plotting, a region is a closed contour.
         * For the time being (until our first demo), we do not add the semantic
         * concept of region so far we dunno have the need to.
         *
         * @param {any} renderer
         * @param {any} region
         * @param {any} varName variable ID
         * @returns reference to the container (a SVG)
         */
        function dispRegion(renderer, region, varName) {
            return dispXLD(renderer, region, varName);
        }

        /**
         * clearWindow deletes all elements contained in the web control
         *
         * @param {any} renderer
         * @returns the SVG selection
         */
        function clearWindow(renderer) {
            renderer.select('#group').selectAll('*').remove();
            return renderer;
        }

        var ControlModi = {
            DEFAULT: 0,
            ROI: 1
        };

        /**
         * HWindowControl creates a new web control and adds it to the parent
         * element given by parent.
         *
         * @param {any} parent          CSS selector of the containing element.
         * @param {any} renderid        id for the web control.
         * @param {any} oninitialized   callback triggered as soon as the web
         *                              control is ready for action.
         * @returns an instance of a new HSmartControl
         */
        function HSmartControl(parent, renderid) {
            if (!parent || !_.isString(parent)) {
                throw new Error('Unexpected input parameter type');
            }
            if (!renderid || !_.isString(renderid)) {
                throw new Error('An id must be provided');
            }
            this._parent = parent;
            this._id = renderid;
            this._modus = ControlModi.DEFAULT;
            return this;
        }

        var p = HSmartControl.prototype;

        /**
         * init initializes and displays the smart control. It is to be used together with
         * dispose, so that a control can be created and destroyed during the application
         * lifetime several times.
         *
         * @returns the reference to the smart control.
         */
        p.init = function () {
            this.renderer = d3.select(this._parent)
                .append('svg')
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('id', this._id)
                .attr('class', 'hcontrol');

            this.renderer
                .append('g')
                .attr('id', 'group');

            /* So far, we initialize the viewbox to the current size of the HTML element.
               We implicitly assume that it corresponds to the size of the image being
               displayed. */
            var box = this.renderer.node().getBoundingClientRect();
            this.setViewBox(0, 0, roundCoordinate(box.width), roundCoordinate(box.height));

            /**
             * Size of the currently displayed image.
             */
            this.imSizeObservable = observable({
                height: roundCoordinate(box.height),
                width: roundCoordinate(box.width)
            });
            this.zoomSizeObservable = observable({
                height: roundCoordinate(box.height),
                width: roundCoordinate(box.width),
                factor: 1.0
            });
            this.panPositionObservable = observable({
                height: roundCoordinate(box.height),
                width: roundCoordinate(box.width),
                factor: 1.0
            });
            this.touchPointObservable = observable({
                posx: 0,
                posy: 0
            });
            this.clickObservable = observable({
                event: 0
            });
            this.imageClickObservable = observable({
                event: 0
            });


            /**
             * list of ROIs which can be manually modified through mouse interaction.
             */
            this.ManualROIs = new ROIList(this.renderer, this.imSizeObservable);

            /**
             * list of ROIs which are the result of some image processing operation (region, contours).
             */
            this._selected_rois = [];

            this._tooltip = d3.select('body')
                .append('div')
                .attr('class', 'tooltip')
                .style('display', 'none')
                .style('position', 'absolute');

            // per default pan-zooming is on
            this._panZoom(true);
            return this;
        };


        /**
         * Delete all generated elements from DOM.
         *
         */
        p.dispose = function () {
            d3.select('div.tooltip').remove();
            this.renderer.remove();
            this.imSizeObservable = null;
            this.zoomSizeObservable = null;
            this.panPositionObservable = null;
            this.touchPointObservable = null;
            this.clickObservable = null;
            this.imageClickObservable = null;
            this.ManualROIs = null;
        };
        /**
         * Sets the equivalent of dev_set_part. Please notice that we stick to
         * the conventions of SVG, namely the viewbox is given by x, y, width,
         * height.
         *
         * @param {any} x
         * @param {any} y
         * @param {any} width
         * @param {any} height
         * @returns a reference to the corresponding HSmartControl
         */
        p.setViewBox = function (x, y, width, height) {
            if (typeof (width) !== 'number' || width < 1) {
                return;
            }
            if (typeof (height) !== 'number' || height < 1) {
                return;
            }
            if (typeof (x) !== 'number' || typeof (y) !== 'number') {
                return;
            }
            this.renderer
                .attr('viewBox', [x, y, width, height].map(String).join(' '));
            return this;
        };

        /**
         * Gets the current viewBox, i.e. the equivalent of dev_get_part.
         *
         * @returns a reference to the corresponding HSmartControl
         */
        p.getViewBox = function () {
            return this.renderer
                .attr('viewBox')
                .split(' ')
                .map(function (n) {
                    return parseInt(n);
                });
        };

        /**
         * _panZoom activates or deactivates the pan/zooming functionality in the control.
         * This is necessary so that the contents of the control remain unchanges as the
         * user interacts with an ROI.
         *
         * @param {any} status
         * @returns
         */
        p._panZoom = function (status) {
            if (status === true) {
                var control = this;
                this.renderer
                    .on('mousedown.panzoom', function (event) {
                        var targetClassList = d3.event.target.classList;
                        if (!(targetClassList.contains("moveHandle")) &&
                            !(targetClassList.contains("sizeHandle")) &&
                            !(targetClassList.contains("turnHandle")) &&
                            !(targetClassList.contains("freehand")) &&
                            !(targetClassList.contains("ellipse"))) {
                            this.drag = true;
                            this.mouse = d3.mouse(this);
                            this.mouseMove = false;
                            event = this.mouse = d3.mouse(this);
                            control.imageClickObservable({
                                event: event
                            });

                        } else {
                            event = this.mouse = d3.mouse(this);
                            control.clickObservable({
                                event: event
                            });
                        }
                    })
                    .on('mousemove.panzoom', function () {
                        if (this.drag) {
                            var pointer = d3.mouse(this),
                                dx = pointer[0] - this.mouse[0],
                                dy = pointer[1] - this.mouse[1],
                                viewbox = control.getViewBox();
                            control.setViewBox(viewbox[0] - dx, viewbox[1] - dy,
                                viewbox[2], viewbox[3]);
                            control.panPositionObservable({
                                x: viewbox[0],
                                y: viewbox[1]
                            });

                            if ((Math.abs(dx) > 3) || (Math.abs(dy) > 3)) {
                                this.mouseMove = true;
                            }
                        }
                    })
                    .on('mouseup.panzoom', function () {
                        if (this.drag && this.mouseMove === false) {
                            var pointer = d3.mouse(this),
                                px = pointer[0],
                                py = pointer[1];
                            control.touchPointObservable({
                                posx: px,
                                posy: py
                            });
                        }
                        this.drag = false;
                    })
                    .on('mouseleave.panzoom', function () {
                        var event = d3.event,
                            noMouseButtonPressed = 0;
                        if (event.relatedTarget == null || event.buttons !== noMouseButtonPressed) { //image movable by pressing any mouse button
                            this.drag = false;
                        }
                    })


                    // mouse wheel works accross the whole SVG
                    .on('wheel.panzoom', function () {
                        /* zoom as in Google Maps */
                        var event = d3.event,
                            cursor = d3.mouse(this),
                            // CAUTION: Use factors which do not lead to rounding errors e.g. use 1.25 -> 1/1.25 = 0.8
                            factor = (event.wheelDelta < 0) ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
                        control._scaleContent(cursor[0], cursor[1], factor);
                        d3.event.preventDefault();
                    });
            } else {
                this.renderer
                    .on('wheel.panzoom', null)
                    .on('mousedown.panzoom', null)
                    .on('mousemove.panzoom', null)
                    .on('mouseup.panzoom', null)
                    .on('mouseleave.panzoom', null);
            }
            return this;
        };

        p.getZoomFactor = function () {
            return ZOOM_FACTOR;
        };


        /**
         * roiModus turns off pan/zoom and allows the user to interact
         * with the manual ROI.
         *
         * @returns
         */
        p.roiModus = function () {
            this._panZoom(false);
            this._modus = ControlModi.ROI;
            return this.ManualROIs.active(true);
        };

        /**
         * defaultModus "freezes" the manual ROI and switches pan/zoom
         * back on.
         *
         * @returns
         */
        p.defaultModus = function () {
            this.ManualROIs.active(false);
            this._modus = ControlModi.DEFAULT;
            return this._panZoom(true);
        };

        /**
         * resetViewBox sets the viewBox to its original position.
         */
        p.resetViewBox = function () {
            var size = this.imSizeObservable();
            this.setViewBox(0, 0, roundCoordinate(size.width), roundCoordinate(size.height));

            var viewbox = this.getViewBox();
            this.panPositionObservable({
                width: roundCoordinate(viewbox[2]),
                height: roundCoordinate(viewbox[3])
            });
        };

        /**
         * getInfo returns information stored in data- attributes
         *
         * @param {any} param
         * @returns an object containing the stored information
         */
        function getInfo(id) {
            var attributes = document.getElementById(id).attributes,
                obj = {};

            for (var i in attributes) {
                if (attributes[i].nodeName && attributes[i].nodeName.match(/^data-/)) {
                    obj[attributes[i].nodeName.replace('data-', '')] = attributes[i].nodeValue;
                }
            }
            return obj;
        }

        /**
         * addInfo attaches info to the element in data- attributes.
         *
         * @param {any} id
         * @param {any} info
         */
        function addInfo(id, info) {
            var element = document.getElementById(id);
            for (var prop in info) {
                if (info.hasOwnProperty(prop)) {
                    element.setAttribute('data-' + prop, info[prop]);
                }
            }
        }

        /**
         * clone a d3 selection and add it to the SVG.
         *
         * @param {any} selector
         * @returns the cloned element
         */
        function clone(selector) {
            var node = d3.select(selector).node();
            return d3.select(node.parentNode.insertBefore(node.cloneNode(true),
                node.nextSibling));
        }

        /**
         * asInteractive wraps callbacks for mouse interaction so that the
         * suscriber gets the mouse pointer coordinates in terms of the HALCON
         * image coordinates.
         *
         * @param {any} roi
         */
        p._asInteractive = function (roi) {
            if (!roi) return;
            roi.addInfo = function (info) {
                addInfo(this.node().id, info);
            };

            roi.getInfo = function () {
                return getInfo(this.node().id);
            };

            roi.on('mouseover.interaction', function () {
                d3.selectAll('.roi_over').remove();
            });

            roi.on('mouseout.interaction', function () {
                d3.selectAll('.roi_over').remove();
            });

            var control = this;
            roi.on('click.interaction', function () {
                d3.selectAll('.roi_over').remove();
                d3.selectAll('.roi_active').remove();
                if (!d3.event.ctrlKey) {
                    control._selected_rois = [this.id];
                } else {
                    // deselect an already selected element when clicking on it again
                    // while keeping the ctrl key pressed
                    if (control._selected_rois.indexOf(this.id) < 0) {
                        control._selected_rois.push(this.id);
                    } else {
                        var self = this;
                        control._selected_rois = control._selected_rois.filter(function (id) {
                            return id !== self.id;
                        });
                    }
                }

                control._selected_rois.forEach(function (id) {
                    clone('#' + id)
                        .classed('roi', false)
                        .classed('roi_active', true);
                });
            });

            ['mousedown', 'mousemove', 'click', 'mouseenter',
                'mouseover', 'mouseup', 'wheel', 'mouseleave',
                'dblclick'
            ].forEach(function (eventtype) {
                roi['on' + eventtype] = function (callback) {
                    var eventhandler = callback;
                    roi.on(eventtype, function () {
                        if (control._modus === ControlModi.ROI) {
                            return;
                        }
                        var cursor = d3.mouse(d3.event.target);
                        eventhandler({
                            x: cursor[0],
                            y: cursor[1],
                            target: d3.event.target,
                            altKey: d3.event.altKey,
                            ctrlKey: d3.event.ctrlKey,
                            info: getInfo(d3.event.target.id)
                        });
                        // avoid dragging the whole image when clicking on a ROI
                        // d3.event.stopPropagation();
                        d3.event.preventDefault();
                    });
                    return this;
                };
            });

            return roi;
        };

        /**
         * onDisplayImageFinished is called when the process of displaying a received image is finished.
         * It is currently an empty function that is used in jasmine tests.
         */
        p.onDisplayImageFinished = function () {};

        /**
         * selectedROIs returns all currently selected ROIs. The user may select several ROIs
         * by keeping the Control key pressed.
         * @returns an array with all selected ROIs
         */
        p.selectedROIs = function () {
            return this._selected_rois;
        };

        /**
         * dispImage displays an image and sets the control's viewport so that the image
         * fills up the control content.
         *
         * @param {any} src
         * @param {any} varName
         * @param {any} semantic
         * @returns
         */
        p.dispImage = function (src, varName, semantic) {
            var control = this;
            dispImage(this.renderer, src, varName)
                .done(function (image) {
                    d3.select('#' + varName)
                        .attr('width', image.width)
                        .attr('height', image.height);
                    control.setViewBox(0, 0, image.width, image.height);
                    control.imSizeObservable({
                        width: roundCoordinate(image.width),
                        height: roundCoordinate(image.height)
                    });
                    control.panPositionObservable({
                        width: roundCoordinate(image.width),
                        height: roundCoordinate(image.height)
                    });
                    control.onDisplayImageFinished();
                });
            var img = this.renderer.select('image#' + varName);
            if (_.isString(semantic)) {
                img.classed(semantic, true);
            }
            return img;
        };

        p.dispRegion = function (src, varName, semantic) {
            var region = dispRegion(this.renderer, src, varName);
            if (_.isString(semantic)) {
                region.classed(semantic, true);
            }
            return this._asInteractive(region);
        };

        /**
         * dispXLD displays all contours as a single group, so that when the user clicks
         * on one of them, the whole group is selected.
         *
         * @param {any} src
         * @param {any} varName
         * @param {any} semantic
         * @returns
         */
        p.dispXLD = function (src, varName, semantic) {
            var xld = dispMergedXLD(this.renderer, src, varName);
            if (_.isString(semantic)) {
                xld.classed(semantic, true);
            }
            return this._asInteractive(xld);
        };

        /**
         * dispXLDs displays each of the contours separately, so that the user can interact with each
         * one of them.
         *
         * @param {any} src
         * @param {any} varName
         * @param {any} semantic
         * @returns
         */
        p.dispXLDs = function (src, varName, semantic) {
            var xld = dispXLD(this.renderer, src, varName);
            if (_.isString(semantic)) {
                xld.classed(semantic, true);
            }
            return this._asInteractive(xld);
        };

        /**
         * dispText displays a text in the SVG element.
         *
         * @param {any} msg the string.
         * @param {any} x column coordinate of top left corner
         * @param {any} y row coordinate of top left corner
         * @param {any} id the element identifier
         * @param {any} semantic (optional)
         * @returns
         */
        p.dispText = function (msg, x, y, id, semantic) {
            var txt = dispText(this.renderer, msg, x, y, id);
            if (_.isString(semantic)) {
                txt.classed(semantic, true);
            }
            return txt;
        };

        /**
         * clearWindow clears all elements contained in the SVG.
         *
         * @returns the reference to the HSmartControl.
         */
        p.clearWindow = function () {
            clearWindow(this.renderer);
            return this;
        };

        /**
         * remove clears elements specified with 'what' from the SVG.
         * Elements are selected as they are in jQuery or d3.js.
         *
         * @param {any} what
         */
        p.remove = function (what) {
            this.renderer.selectAll(what).remove();
        };

        /**
         * dispRectangle displays a rectangle in the SVG.
         *
         * @param {any} renderer
         * @param {any} rect
         * @returns a reference to the displayed rectangle
         */
        function dispRectangle(renderer, rect, id) {
            if (!checkObjType(rect, 'rectangle')) {
                throw new Error('Unexpected object type : ' + rect);
            }

            var svgrect = renderer.select('#group')
                .append('rect')
                .attr('x', rect.x)
                .attr('y', rect.y)
                .attr('width', roundCoordinate(rect.width))
                .attr('height', roundCoordinate(rect.height));
            if (id && _.isString(id)) {
                svgrect.attr('id', id);
            }

            return svgrect;
        }

        /**
         * The method dispRectangle first displays a rectangle in the control,
         * and depending on the semantics, may add some functionality to it.
         * For more details see web_control.css.
         *
         * @param {any} rect
         * @param {any} id
         * @param {any} semantic
         * @returns a reference to the ROI
         */
        p.dispRectangle = function (rect, id, semantic) {
            var type = semantic || 'roi',
                svgrect = dispRectangle(this.renderer, rect, id).classed(type, true);
            return (type === 'roi') ? this._asInteractive(svgrect) : svgrect;
        };

        /**
         * dispCircle displays a circle in the SVG.
         *
         * @param {any} renderer
         * @param {any} circle
         * @returns a reference to the displayed circle
         */
        function dispCircle(renderer, circle, id) {
            if (!checkObjType(circle, 'circle')) {
                throw new Error('Unexpected object type : ' + circle);
            }

            var svgcircle = renderer.select('#group')
                .append('circle')
                .attr('cx', circle.x)
                .attr('cy', circle.y)
                .attr('r', circle.radius);
            if (id && _.isString(id)) {
                svgcircle.attr('id', id);
            }
            return svgcircle;
        }

        /**
         * The method dispCircle first displays a circle in the control,
         * and depending on the semantics, may add some functionality to it.
         * For more details see web_control.css.
         *
         * @param {any} circle
         * @param {any} semantic
         * @returns a reference to the ROI
         */
        p.dispCircle = function (circle, id, semantic) {
            var type = semantic || 'roi',
                svgcircle = dispCircle(this.renderer, circle, id).classed(type, true);
            return (type === 'roi') ? this._asInteractive(svgcircle) : svgcircle;
        };

        p.dispHObj = function (obj) {
            switch (obj.type) {
                case 'rectangle':
                    return this.dispRectangle(obj);
                case 'circle':
                    return this.dispCircle(obj);
                case 'xld_contours':
                    return this.dispXLD(obj, obj.Id);
                default:
                    throw new Error('Unexpected object type ', obj);
            }
        };

        /**
         * Shows tooltip when mouse cursor is over SVG element.
         *
         * @param {any} id of the SVG element.
         * @param {any} message can be either a string or a function
         * which returns the string to be displayed in the tooltip.
         * @returns a reference to the HSmartControl
         */
        p.addTooltip = function (id, message) {
            var msg = message,
                control = this.renderer;
            d3.select(id)
                .on('mouseover.tooltip', function () {
                    var box = d3.select(d3.event.target)
                        .node()
                        .getBoundingClientRect();

                    d3.select('div.tooltip')
                        .style('display', 'block')
                        .style('left', box.left + 'px')
                        .style('top', box.bottom + 'px')
                        .html(msg);
                    control.style('cursor', 'hand');
                })
                .on('mouseout.tooltip', function () {
                    d3.select('div.tooltip').style('display', 'none');
                    control.style('cursor', 'auto');
                });

            return this;
        };

        /**
         * roundCoordinate rounds up pixel coordinates. The center
         * lies at (0.5, 0.5).
         *
         * @param {any} x
         * @returns the rounded up value of the coordinate
         */

        function roundCoordinate(x) {
            return (x > 0.0) ? Math.floor(x + 0.5) : Math.ceil(x - 0.5);
        }

        p.hide_selection = function (what) {
            this.renderer.selectAll(what).style('display', 'none');
        };

        p.show_selection = function (what) {
            this.renderer.selectAll(what).style('display', 'block');
        };

        /**
         * Zooms the contents of the web control.
         *
         * @param {any} cx column coordinate of fixed point
         * @param {any} cy row coordinate of fixed point
         * @param {any} factor scaling factor
         */
        p._scaleContent = function (cx, cy, factor) {
            var viewbox = this.getViewBox(),
                scale = new Affine().scale(factor, factor, cx, cy),
                topleft = scale.transform([viewbox[0], viewbox[1]]),
                bottomright = scale.transform([
                    viewbox[0] + viewbox[2], viewbox[1] + viewbox[3]
                ]),
                // because of rounding, if you zoom above this limit, you will not be able
                // to zoom back out
                minsize = (factor > 1.0) ? 1.0 / (factor - 1) : 1.0,
                zoomWidth = roundCoordinate(Math.max(bottomright[1] - topleft[1], minsize));

            if ((zoomWidth > MIN_ZOOM_WIDTH) && (zoomWidth < MAX_ZOOM_WIDTH)) {

                this.setViewBox(roundCoordinate(topleft[0]),
                    roundCoordinate(topleft[1]),
                    roundCoordinate(Math.max(bottomright[0] - topleft[0], minsize)),
                    roundCoordinate(Math.max(bottomright[1] - topleft[1], minsize)));

                this.panPositionObservable({
                    width: roundCoordinate(viewbox[2]),
                    height: roundCoordinate(viewbox[3]),
                    factor: factor
                });

            }
        };

        /**
         * zooms the contents of the web control. If factor > 1 it zooms out,
         * else it zooms in.
         *
         * @param {any} factor
         * @returns a reference to the HSmartControl
         */
        p.zoom = function (factor) {
            if (typeof (factor) !== 'number' || factor <= 0) {
                return;
            }
            var viewbox = this.getViewBox(),
                cx = viewbox[0] + viewbox[2] * 0.5,
                cy = viewbox[1] + viewbox[3] * 0.5;
            this._scaleContent(cx, cy, factor);
            return this;
        };


        p.precisionRound = function (value, precision) {
            var result = value;

            if (precision === undefined) {
                precision = 0.5;
            }

            if ((value % precision) !== 0) {
                result = Math.floor((value / precision + 0.5)) * precision;
            }
            return result;
        };

        p.isPixelInsidePolygon = function (point, polygon) {
            var x = point.x,
                y = point.y,
                inside = false,
                intersect,
                i, j, xi, yi, xj, yj;

            j = polygon.length - 1;

            for (i = 0; i < polygon.length; i++) {
                xi = polygon[i].x;
                yi = polygon[i].y;
                xj = polygon[j].x;
                yj = polygon[j].y;

                intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
                j = i;
            }
            return inside;
        };

    return HSmartControl;
    });
