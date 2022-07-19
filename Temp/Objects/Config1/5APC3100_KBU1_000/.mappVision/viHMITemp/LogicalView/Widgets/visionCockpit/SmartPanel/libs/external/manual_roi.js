/**
 * wrapper module for the different ROI types
 *
*/
define(['./rectangle1', './rectangle2', './circle'],
  function (Rectangle1, Rectangle2, Circle) {
      'use strict';

      return {
          'Rectangle1': Rectangle1,
          'Rectangle2': Rectangle2,
          'Circle': Circle
      };
  });