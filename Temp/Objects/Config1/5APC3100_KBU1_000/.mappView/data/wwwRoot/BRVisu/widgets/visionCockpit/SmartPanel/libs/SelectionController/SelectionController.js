/*
 * This class is the main class for the selectionController. 
 */

/*global define*/
define([], function () {
    'use strict';

    function SelectionController(smartPanel) {
        this.firstSelectedTool = undefined;
        this.smartPanel = smartPanel;
    }

    SelectionController.prototype.setFirstSelectedRoiTool = function (tool, selected) {
        if ((selected === true) && (this.firstSelectedTool === undefined)) {
            this.firstSelectedTool = tool;
        } else if (selected === false) {
            this.firstSelectedTool = undefined;
        }
    };

    SelectionController.prototype.setSizeOfAllSelectedRoiTools = function (context) {
        var roiToolWidth, roiToolHeight;

        if (this.firstSelectedTool) {
            roiToolWidth = this.firstSelectedTool.getRoiParams().width;
            roiToolHeight = this.firstSelectedTool.getRoiParams().height;

            context.executionTools.forEach(function (tool) {
                if (tool.isSelected() === true) {
                    tool.setSize(roiToolWidth, roiToolHeight);
                }
            });

            context.teachTools.forEach(function (tool) {
                if (tool.isSelected() === true) {
                    tool.setSize(roiToolWidth, roiToolHeight);
                }
            });
        }
    };

    SelectionController.prototype.setSameAngleOfAllSelectedRoiTools = function (context) {
        var roiToolAngle;

        if (this.firstSelectedTool) {
            roiToolAngle = this.firstSelectedTool.getRoiParams().angle;

            context.executionTools.forEach(function (tool) {
                if (tool.isSelected() === true) {
                    tool.setAngle(roiToolAngle);
                }
            });

            context.teachTools.forEach(function (tool) {
                if (tool.isSelected() === true) {
                    tool.setAngle(roiToolAngle);
                }
            });
        }
    };

    SelectionController.prototype.setAlignmentOfAllSelectedRoiTools = function (context) {
        var refCenterPosition, refRoiToolAngle, firstSelectedTool;

        firstSelectedTool = this.firstSelectedTool;
        if (firstSelectedTool) {
            refCenterPosition = firstSelectedTool.getCenterPosition();
            refRoiToolAngle = firstSelectedTool.getRoiParams().angle;

            context.executionTools.forEach(function (tool) {
                if ((tool.isSelected() === true) && (tool !== firstSelectedTool)) {
                    tool.setAlignment(refRoiToolAngle, refCenterPosition);
                }
            });

            context.teachTools.forEach(function (tool) {
                if ((tool.isSelected() === true) && (tool !== firstSelectedTool)) {
                    tool.setAlignment(refRoiToolAngle, refCenterPosition);
                }
            });
        }
    };

    SelectionController.prototype.getDistancesToRefObjectParllelToCenterOfGravityLine = function (context, referenceTool, angleOfRefTool) {
        var centerPositionOfRefTool, distanceToRefTool, toolObjetsAndDistancesToRef = [];
        if (referenceTool) {
            centerPositionOfRefTool = referenceTool.getCenterPosition();
            context.executionTools.forEach(function (tool) {
                if ((tool.isSelected() === true) && (tool !== referenceTool)) {
                    distanceToRefTool = tool.getDistanceToRefObjectParllelToCenterOfGravityLine(angleOfRefTool, centerPositionOfRefTool);
                    toolObjetsAndDistancesToRef.push({ tool: tool, distance: distanceToRefTool });
                }
            });

            context.teachTools.forEach(function (tool) {
                if ((tool.isSelected() === true) && (tool !== referenceTool)) {
                    distanceToRefTool = tool.getDistanceToRefObjectParllelToCenterOfGravityLine(angleOfRefTool, centerPositionOfRefTool);
                    toolObjetsAndDistancesToRef.push({ tool: tool, distance: distanceToRefTool });
                }
            });
        }
        return toolObjetsAndDistancesToRef;
    };

    SelectionController.prototype.setSpacingOfAllSelectedRoiTools = function (context) {
        var referenceTool, angleOfRefTool, index, equidistance, toolObjetsAndDistancesToRef = [], sortedToolObjetsAndDistancesToRef = [];

        referenceTool = this.firstSelectedTool;
        angleOfRefTool = referenceTool.getRoiParams().angle;

        toolObjetsAndDistancesToRef = this.getDistancesToRefObjectParllelToCenterOfGravityLine(context, referenceTool, angleOfRefTool);

        sortedToolObjetsAndDistancesToRef = this.sortDistancesLowToHigh(toolObjetsAndDistancesToRef);

        equidistance = this.getEquidistance(sortedToolObjetsAndDistancesToRef);

        for (index = 0; index < sortedToolObjetsAndDistancesToRef.length; index++) {
            sortedToolObjetsAndDistancesToRef[index].tool.setSpacing(sortedToolObjetsAndDistancesToRef[index].distance, index + 1, equidistance, angleOfRefTool);
        }

    };

    SelectionController.prototype.sortDistancesLowToHigh = function (distancesToRefTool) {
        distancesToRefTool.sort(function (a, b) {
            return a.distance - b.distance;
        });
        return distancesToRefTool;
    };

    SelectionController.prototype.getEquidistance = function (sortedToolObjetsAndDistancesToRef) {
        var equidistance, indexOfLastElement;
        indexOfLastElement = sortedToolObjetsAndDistancesToRef.length - 1;
        equidistance = sortedToolObjetsAndDistancesToRef[indexOfLastElement].distance / sortedToolObjetsAndDistancesToRef.length;

        if (equidistance < 0) {
            equidistance = 0;
        }
        return equidistance;
    };

    SelectionController.prototype.onMouseMoved = function (x, y) {
        this.smartPanel.executionTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.hideHandles();
                tool.moveRelativePosition(x, y);
            }
        });

        this.smartPanel.teachTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.hideHandles();
                tool.moveRelativePosition(x, y);
            }
        });
    };

    SelectionController.prototype.onHandleDragend = function () {
        this.smartPanel.executionTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.handleDragend();
            }
        });

        this.smartPanel.teachTools.forEach(function (tool) {
            if (tool.isSelected() === true) {
                tool.handleDragend();
            }
        });
    };


    return SelectionController;
});