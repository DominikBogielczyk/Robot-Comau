/*
 * This class is the main class for the crosshair roi. 
 */
/*global define, */
define(['libs/d3/d3', './DragHandler'], function (d3, DragHandler) {  
    'use strict';

    function CrosshairRoi(smartControl, xpos, ypos ) {

        this.smartControl = smartControl;
        this.className = "CrosshairRoi";
    
        this.style = {
            activeStyleClass: "crosshair" + '_active',
            passiveStyleClass: "crosshair" + '_passive'
        };

        this.defaultSettings = {
            x: xpos,
            y: ypos,
            height: 100,
            width: 100,
            opacity: 0.7,
            markerWidth: 20,
            ratioViewBoxToImageMin: 0.2,    
        };

        this.settings = {
            strokes: [],
            circle: {
                strokeWidth_max: 5,
                strokeWidth_min: 2,
                strokeWidth: 5,
                strokeZoomFactor: 100,
                strokeColor: 'darkgreen'
            },
            cross: {
                strokeWidth_max: 5,
                strokeWidth_min: 0.3,
                strokeWidth: 5,
                strokeZoomFactor: 100,
                strokeColor: 'darkgreen'
            }
        };

        this.drawing = {
            rootContainer: this.smartControl.renderer.select('#group')
        };

        this.prepareInternalSettings();
        this.initialDraw();
    }

    CrosshairRoi.prototype.onClick = function (/*event*/) {
        var mousePosistion = d3.mouse(this.drawing.rootContainer[0][0]);
        var x = Math.floor(mousePosistion[0]);
        var y = Math.floor(mousePosistion[1]);
        this.setCenterPosition(x,y);
    };


    CrosshairRoi.prototype.prepareInternalSettings = function () {
        this.settings.position = [{
            x: this.defaultSettings.x,
            y: this.defaultSettings.y
        }];
    };

    CrosshairRoi.prototype.initialDraw = function () {
        // append a root group element that will contain all svg parts of the roi
        this.drawing.anchor = this.drawing.rootContainer.append('g')
            .data(this.settings.position)
            .attr('class', 'CrosshairRoi');

        //// the crosshair
        this.drawing.anchor.append('circle')
            .attr('cx', 0.5)
            .attr('cy', 0.5)
            .attr('r', 20)
            .attr('opacity', this.defaultSettings.opacity)
            .attr('fill', 'transparent')
            .attr('stroke', this.settings.circle.strokeColor)
            .attr('stroke-width', this.settings.circle.strokeWidth)
            // strokes are always drawn in the center of the coordinate, so it's always wrong for this widget. See https://stackoverflow.com/a/7273346
            // To avoid this issue, this rectangle should be split into four rectangles that have no stroke, but only a fill like the move handles
            .attr('class', 'outline moveHandle ' + this.style.activeStyleClass);
            


        //// horizontal line 
        this.drawing.anchor.append('line')
            .attr('x1', - this.defaultSettings.width / 2)
            .attr('y1', 0.5)
            .attr('x2', this.defaultSettings.width / 2)
            .attr('y2', 0.5)
            .attr('opacity', this.defaultSettings.opacity)
            .attr('fill', 'transparent')
            .attr('stroke', this.settings.cross.strokeColor)
            .attr('stroke-width', this.settings.cross.strokeWidth)
            .attr('stroke-linecap','round')
            // strokes are always drawn in the center of the coordinate, so it's always wrong for this widget. See https://stackoverflow.com/a/7273346
            // To avoid this issue, this rectangle should be split into four rectangles that have no stroke, but only a fill like the move handles
            .attr('class', 'outline moveHandle ' + this.style.activeStyleClass);

        //// vertical line 
        this.drawing.anchor.append('line')
            .attr('x1', 0.5)
            .attr('y1', - this.defaultSettings.height / 2)
            .attr('x2', 0.5)
            .attr('y2', this.defaultSettings.height / 2)
            .attr('opacity', this.defaultSettings.opacity)
            .attr('fill', 'transparent')
            .attr('stroke', this.settings.cross.strokeColor)
            .attr('stroke-width', this.settings.cross.strokeWidth)
            .attr('stroke-linecap','round')
            // strokes are always drawn in the center of the coordinate, so it's always wrong for this widget. See https://stackoverflow.com/a/7273346
            // To avoid this issue, this rectangle should be split into four rectangles that have no stroke, but only a fill like the move handles
            .attr('class', 'outline moveHandle ' + this.style.activeStyleClass);


        this.drawing.anchor
            .call(new DragHandler(this))
            .attr('transform', function (d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });

        this.onUpdateZoomValue();
    };

    CrosshairRoi.prototype.getCenterPosition = function() {
        var pos = this.settings.position[0];
        var posResult = { x: Math.round(pos.x), y: Math.round(pos.y) };
        return posResult;
    };

    CrosshairRoi.prototype.setCenterPosition = function (x, y) {
            this.settings.position[0].x = x;
            this.settings.position[0].y = y;
            this.drawing.anchor.attr('transform', 'translate(' + x + ',' + y + ')');
    };

    CrosshairRoi.prototype.dispose = function () {
        this.drawing.anchor.remove();
    };


    CrosshairRoi.prototype.onUpdateZoomValue = function() {
          var viewBox = this.smartControl.getViewBox(),
          zoom = {width: roundCoordinate(viewBox[2]), height: roundCoordinate(viewBox[3])};

          this.settings.cross.strokeWidth =   Math.floor(zoom.width / this.settings.cross.strokeZoomFactor) + this.settings.cross.strokeWidth_min;
          this.settings.circle.strokeWidth =   Math.floor(zoom.width / this.settings.circle.strokeZoomFactor) +  this.settings.circle.strokeWidth_min;

          if(this.settings.cross.strokeWidth > this.settings.cross.strokeWidth_max){
            this.settings.cross.strokeWidth = this.settings.cross.strokeWidth_max;
          }
          if(this.settings.circle.strokeWidth > this.settings.cross.strokeWidth_max){
            this.settings.circle.strokeWidth = this.settings.circle.strokeWidth_max;
          }

          this.drawing.anchor.selectAll("line.outline.moveHandle").style('stroke-width', this.settings.cross.strokeWidth);
          this.drawing.anchor.selectAll("circle.outline.moveHandle").style('stroke-width', this.settings.circle.strokeWidth);
    };
  
    CrosshairRoi.prototype.onWheelPanZoom = function(){
    };

    CrosshairRoi.prototype.isSelected = function () {
        return true;
    };

    CrosshairRoi.prototype.clearSelection = function () {
    };

    CrosshairRoi.prototype.setSelected = function (/*mode*/) {
        this.moveToFront(); 
    };

    CrosshairRoi.prototype.redraw = function (/*mode*/) {
    };

    CrosshairRoi.prototype.setWidthSameAsHight = function () {
    };

    CrosshairRoi.prototype.show = function () { 
        this.drawing.anchor.style('visibility', 'visible');
    }; 

    CrosshairRoi.prototype.hide = function () {  
        this.drawing.anchor.style('visibility', 'hidden');
    };

    CrosshairRoi.prototype.setAngle = function (/*angle*/) {
    };

    CrosshairRoi.prototype.rotateCounterclockwise = function (/*rotationAngle*/) {
    };


    function roundCoordinate(x) {
        return (x > 0.0) ? Math.floor(x + 0.5) : Math.ceil(x - 0.5);
    }

    CrosshairRoi.prototype.moveToFront = function () {
        var thisElement = $(this.drawing.anchor[0][0])[0];
        var parentNode = thisElement.parentNode;
        if (parentNode) {
            parentNode.append(thisElement);
        }
    };

    CrosshairRoi.prototype.moveToBottom = function () {
        var el,el1,el2,thisElement = $(this.drawing.anchor[0][0])[0];
        var parentNode = thisElement.parentNode;
        if (parentNode) {
            el1 = parentNode.firstElementChild;
            if(el1){
            el = el1;    
            el2 = el1.nextSibling;
            if(el2){
                el = el2;
            }

            this.setSelected(false);
            this.redraw();            
                parentNode.insertBefore(thisElement, el);
            }
        }
    };

    return CrosshairRoi;
});