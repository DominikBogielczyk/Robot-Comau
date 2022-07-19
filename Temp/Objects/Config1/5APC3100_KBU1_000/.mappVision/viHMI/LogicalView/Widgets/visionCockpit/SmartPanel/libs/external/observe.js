/**
 * Patterns for event processing.
 *
*/
/*global define, _*/
define([], function () {
    'use strict';

    function observable(value, validate) {
        var listeners = [],
          check = validate || function () {
              return true;
          };

        function notify(newValue) {
            listeners.forEach(function (listener) {
                listener(newValue);
            });
        }

        function accessor(newValue) {
            value.height = Math.round(value.height);
            value.width = Math.round(value.width);

            if (newValue !== undefined && !_.isEqual(value, newValue)) {
                if (!check(newValue)) {
                    throw new Error('Invalid value: ' + newValue.toString());
                }
                value.height = Math.round(newValue.height);
                value.width = Math.round(newValue.width);
                notify(newValue);
            }
            return value;
        }

        accessor.subscribe = function (listener) {
            listeners.push(listener);
        };

        return accessor;
    }

    return observable;
});
