angular.module('ui.bootstrap.pagination', ['smartTable.templateUrlList'])

    .constant('paginationConfig', {
        boundaryLinks: false,
        directionLinks: true,
        firstText: 'First',
        previousText: '&lt;',
        nextText: '&gt;',
        lastText: 'Last'
    })

    .directive('pagination', ['paginationConfig', 'templateUrlList', function (paginationConfig, templateUrlList) {
        return {
            restrict: 'EA',
            require: '^smartTable',
            scope: {
                numPages: '=',
                currentPage: '=',
                maxSize: '=',
                numberOfPagesError : '=errored'
            },
            templateUrl: templateUrlList.pagination,
            replace: true,
            link: function (scope, element, attrs, ctrl) {

                // Setup configuration parameters
                var boundaryLinks = angular.isDefined(attrs.boundaryLinks) ? scope.$eval(attrs.boundaryLinks) : paginationConfig.boundaryLinks;
                var directionLinks = angular.isDefined(attrs.directionLinks) ? scope.$eval(attrs.directionLinks) : paginationConfig.directionLinks;
                var firstText = angular.isDefined(attrs.firstText) ? attrs.firstText : paginationConfig.firstText;
                var previousText = angular.isDefined(attrs.previousText) ? attrs.previousText : paginationConfig.previousText;
                var nextText = angular.isDefined(attrs.nextText) ? attrs.nextText : paginationConfig.nextText;
                var lastText = angular.isDefined(attrs.lastText) ? attrs.lastText : paginationConfig.lastText;

                // Create page object used in template
                function makePage(number, text, isActive, isDisabled) {
                    return {
                        number: number,
                        text: text + "",
                        active: isActive,
                        disabled: isDisabled
                    };
                }

                scope.$watch('numPages + currentPage + maxSize + numberOfPagesError', function () {
                    scope.pages = [];

                    // Default page limits
                    var startPage = 1, endPage = scope.numPages;

                    // recompute if maxSize
                    if (scope.maxSize && scope.maxSize < scope.numPages) {
                        startPage = Math.max(scope.currentPage - Math.floor(scope.maxSize / 2), 1);
                        endPage = startPage + scope.maxSize - 1;

                        // Adjust if limit is exceeded
                        if (endPage > scope.numPages) {
                            endPage = scope.numPages;
                            startPage = endPage - scope.maxSize + 1;
                        }
                    }
                    
                    if(scope.numberOfPagesError){
                    	var previousPage = makePage(0, previousText, false, false);
                        scope.pages.unshift(previousPage);
                    	
                    	var	page = makePage("Error", "<img height=\"16\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAACXBIWXMAAAsTAAALEwEAmpwYAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAACSklEQVR42mL8//8/A60BQAAxMdABAAQQC5zFyIhNXheIpwKxEhD/wSIP0vQLiPuBeBqGLDSUAAKIARRcYAwSQ8UKQHzpP0QpIfwPiGMxzICaDRBAjPA4QfWJChCvBGIjIL4AxI1A/BtHcMcBcQgQ/wRiPyDehe4TgADC5hNlIH4IdeFxIJbD4ktkzAzETVD134A4Dt0nAAGEbokSEJ+HajgDxLJoBvoDcTsQ1wCxKJI4IxB3QPX9AOIYZEsAAgjZEjWkOMDlg2VI8aCNxUdLkCyKgpkNEEDIlhyCKjiNxQcwPBeq5jsQa2CR5wDiydCEcA9mNkAAIVvyDGqAD57wJ2QJDF8D4g8wswECCDkz/oLS/6iQ9/5CMRgABBATDUoBRiiGA4AAokuxAhBATGSqZyZFE0AAsWARw1csg3L1dyiNC2DoBwggJrSwZECOMCygGlpo6gHxPRxq/qCZxwAQQNgsSUKPOCQgCMRVQGyDoywDgRggVkb2EUAAIeeTZCD+Cc0HTdCiggGt6NiClOMNseSPcGgeAsnPgJkNEEDoZReocPsKVQQqo1jQDJkFlXsJLYaQ5VyhBSRIfjkQ88DMBgggbKWwGxD/hipeAi0qkIsNV2hdg6wnDIi/QPV0wB0HNRsggHBVWjFIQQcqi9iBmBWImZDUgPhsULUw33dCC0qUoh4ggHBVWiAQDcTzgJgNiK/hSdraUBpUyUWhFEtQswECCF/1C8KRQHwDiN8D8Vsc+DkQzwRiblzVL0AAMdKjSQQQQHQpuwACDABJg/CaxuUWmgAAAABJRU5ErkJggg==\"/>", false, false);
                    	scope.pages.push(page);
                        
                        var nextPage = makePage(0, nextText, false, false);
                        scope.pages.push(nextPage);
                        
                        return
                    }

                    // Add page number links
                    for (var number = startPage; number <= endPage; number++) {
                        var page = makePage(number, number, scope.isActive(number), false);
                        scope.pages.push(page);
                    }

                    // Add previous & next links
                    if (directionLinks) {
                        var previousPage = makePage(scope.currentPage - 1, previousText, false, scope.noPrevious());
                        scope.pages.unshift(previousPage);

                        var nextPage = makePage(scope.currentPage + 1, nextText, false, scope.noNext());
                        scope.pages.push(nextPage);
                    }

                    // Add first & last links
                    if (boundaryLinks) {
                        var firstPage = makePage(1, firstText, false, scope.noPrevious());
                        scope.pages.unshift(firstPage);

                        var lastPage = makePage(scope.numPages, lastText, false, scope.noNext());
                        scope.pages.push(lastPage);
                    }


                    if (scope.currentPage > scope.numPages) {
                        scope.selectPage(scope.numPages);
                    }
                });
                scope.noPrevious = function () {
                    return scope.currentPage === 1;
                };
                scope.noNext = function () {
                    return scope.currentPage === scope.numPages;
                };
                scope.isActive = function (page) {
                    return scope.currentPage === page;
                };

                scope.selectPage = function (page) {
                    if (!scope.isActive(page) && page > 0 && page <= scope.numPages) {
                        scope.currentPage = page;
                        ctrl.changePage({ page: page });
                    }
                };
            }
        };
    }]);
