var module = angular.module('simpleHandsontable', []);

module.factory('simpleHandsontableFactory', [
        function () {
            return {
                containerClassName: 'handsontable-container',
                instance: null,

                /**
                 * Append handsontable container div and initialize handsontable instance inside element
                 *
                 * @param element
                 * @param htSettings
                 */
                initialize: function (element, htSettings) {
                    var container = document.createElement('DIV');
                    container.className = this.containerClassName;
                    element[0].appendChild(container);
                    this.instance = new Handsontable(container, htSettings);
                    return this.getInstance();
                },

                /**
                 * Getter for instance
                 * @returns {null}
                 */
                getInstance: function () {
                    return this.instance;
                }

            };
        }
    ]
);

module.directive('simpleHandsontable', ['simpleHandsontableFactory', '$parse', '$timeout', function (simpleHandsontableFactory, $parse, $timeout) {

        return {
            restrict: 'EA',
            scope: {
                settings: '=',
                data: '='
            },
            controller: ['$scope', function ($scope) {
            }],
            link: function (scope, element, attrs) {

                var data = $parse(attrs.data);
                var settings = $parse(attrs.settings);

                function parseAttributes() {

                    var attrSettings = settings(scope.$parent);
                    var settingsArgument = {};

                    // If data is not supplied via the settings attribute, copy the settings attribute so that it stays unpolluted by the data property
                    if (!attrSettings['data']) {
                        settingsArgument = angular.copy(attrSettings);
                        scope.htData = data(scope.$parent);
                        settingsArgument['data'] = scope.htData;
                    } else {
                        scope.htData = attrSettings['data'];
                        settingsArgument = attrSettings;
                    }

                    scope.htSettings = settingsArgument;

                }

                parseAttributes();

                scope.handsontableInstance = simpleHandsontableFactory.initialize(element, scope.htSettings);

                /**
                 * Check if settings has been changed in parent scope.
                 * If so, update the settings for the handsontable instance
                 */
                scope.$parent.$watch(
                    attrs.settings,
                    function () {
                        parseAttributes();
                        scope.handsontableInstance.updateSettings(scope.htSettings);
                    },
                    true
                );

                /**
                 * Check if data has been changed in parent scope.
                 * If so, run render() on the handsontable instance
                 * http://docs.handsontable.com/0.19.0/tutorial-data-binding.html
                 */
                scope.$parent.$watch(
                    attrs.data,
                    function () {
                        scope.handsontableInstance.render();
                    },
                    true
                );

                /**
                 * Make sure changes made within the handsontable are advocated to angular scopes
                 */
                scope.handsontableInstance.addHook('afterChange', function (changes, source) {
                    if (source === 'loadData') {
                        return; // we only need to apply changes made after the initial data loading
                    }
                    // inform angular that we have updated the data by implicitly calling $apply via $timeout
                    $timeout(function () {
                    });
                });

            }
        };
    }
    ]
);
