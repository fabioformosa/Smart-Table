/* Column module */

var smartTableColumnModule = angular.module('smartTable.column', ['smartTable.templateUrlList']).constant('DefaultColumnConfiguration', {
    isSortable: true,
    isEditable: false,
    type: 'text',


    //it is useless to have that empty strings, but it reminds what is available
    headerTemplateUrl: '',
    map: '',
    label: '',
    sortPredicate: '',
    formatFunction: '',
    formatParameter: '',
    filterPredicate: '',
    cellTemplateUrl: '',
    headerClass: '',
    cellClass: ''
});


function ColumnProvider(DefaultColumnConfiguration, templateUrlList) {

    function Column(config) {
        if (!(this instanceof Column)) {
            return new Column(config);
        }
        var extendedFilter = angular.extend({}, this.filter, config.filter);
        config.filter = extendedFilter;
        angular.extend(this, config);
    }

    this.setDefaultOption = function (option) {
        angular.extend(Column.prototype, option);
    };

    DefaultColumnConfiguration.headerTemplateUrl = templateUrlList.defaultHeader;
    DefaultColumnConfiguration.filter = new Object();
    DefaultColumnConfiguration.filter.filterTemplateUrl = templateUrlList.defaultFilter;
    this.setDefaultOption(DefaultColumnConfiguration);

    this.$get = function () {
        return Column;
    };
}

ColumnProvider.$inject = ['DefaultColumnConfiguration', 'templateUrlList'];
smartTableColumnModule.provider('Column', ColumnProvider);


/* Directives */
angular.module('smartTable.directives', ['smartTable.templateUrlList', 'smartTable.templates'])
    .directive('smartTable', ['templateUrlList', 'DefaultTableConfiguration', function (templateList, defaultConfig) {
        return {
            restrict: 'EA',
            scope: {
                columnCollection: '=columns',
                config: '='
            },
            replace: 'true',
            templateUrl: templateList.smartTable,
            controller: 'TableCtrl',
            link: function (scope, element, attr, ctrl) {

                var templateObject;

                scope.$watch('config', function (config) {
                    var newConfig = angular.extend({}, defaultConfig, config),
                        length = scope.columns !== undefined ? scope.columns.length : 0;

                    ctrl.setGlobalConfig(newConfig);

                    //remove the checkbox column if needed
                    if (newConfig.selectionMode !== 'multiple' || newConfig.displaySelectionCheckbox !== true) {
                        for (var i = length - 1; i >= 0; i--) {
                            if (scope.columns[i].isSelectionColumn === true) {
                                ctrl.removeColumn(i);
                            }
                        }
                    } else {
                        //add selection box column if required
                        ctrl.insertColumn({cellTemplateUrl: templateList.selectionCheckbox, headerTemplateUrl: templateList.selectAllCheckbox, isSelectionColumn: true}, 0);
                    }
                }, true);

                //insert columns from column config
                //TODO add a way to clean all columns
                scope.$watch('columnCollection', function (oldValue, newValue) {
                    if (scope.columnCollection) {
                        for (var i = 0, l = scope.columnCollection.length; i < l; i++) {
                        	
                        	//if filter label is not specified in columnCollection then set it with column label
                        	var normalizedColumn = angular.extend({},scope.columnCollection[i]);
                        	normalizedColumn.filter = angular.extend({},scope.columnCollection[i].filter);
                        	 if((normalizedColumn.filter != undefined) && (normalizedColumn.filter.label == undefined))
                        		 normalizedColumn.filter.label = normalizedColumn.label;
                        	 
                            ctrl.insertColumn(normalizedColumn);
                        }
                    } else {
                        //or guess data Structure
                        if (scope.dataCollection && scope.dataCollection.length > 0) {
                            templateObject = scope.dataCollection[0];
                            angular.forEach(templateObject, function (value, key) {
                                if (key[0] != '$') {
                                    ctrl.insertColumn({label: key, map: key});
                                }
                            });
                        }
                    }
                }, true);

                //if item are added or removed into the data model from outside the grid
                scope.$watch('dataCollection.length', function (oldValue, newValue) {
                    if (oldValue !== newValue) {
                        ctrl.sortBy();//it will trigger the refresh... some hack ?
                    }
                });

            }
        };
    }])
    //just to be able to select the row
    .directive('smartTableDataRow', function () {

        return {
            require: '^smartTable',
            restrict: 'C',
            link: function (scope, element, attr, ctrl) {

                element.bind('click', function () {
                    scope.$apply(function () {
                        ctrl.toggleSelection(scope.dataRow);
                    })
                });
            }
        };
    })
    //header cell with sorting functionality or put a checkbox if this column is a selection column
    .directive('smartTableHeaderCell',function () {
        return {
            restrict: 'C',
            require: '^smartTable',
            link: function (scope, element, attr, ctrl) {
                element.bind('click', function () {
                    scope.$apply(function () {
                        ctrl.sortBy(scope.column);
                    });
                })
            }
        };
    }).directive('smartTableSelectAll', function () {
        return {
            restrict: 'C',
            require: '^smartTable',
            scope: {},
            link: function (scope, element, attr, ctrl) {
                scope.isChecked = false;
                scope.$watch('isChecked', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        ctrl.toggleSelectionAll(newValue);
                    }
                });
            }
        };
    })
    //credit to Valentyn shybanov : http://stackoverflow.com/questions/14544741/angularjs-directive-to-stoppropagation
    .directive('stopEvent', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                element.bind(attr.stopEvent, function (e) {
                    e.stopPropagation();
                });
            }
        }
    })
    //the global filter
    .directive('smartTableGlobalSearch', ['templateUrlList', function (templateList) {
        return {
            restrict: 'C',
            require: '^smartTable',
            scope: {
                columnSpan: '@'
            },
            templateUrl: templateList.smartTableGlobalSearch,
            replace: false,
            link: function (scope, element, attr, ctrl) {

                scope.searchValue = '';

                scope.$watch('searchValue', function (value) {
                    //todo perf improvement only filter on blur ?
                    ctrl.search(value);
                });
            }
        };
    }])
    //the global filter
    .directive('smartTableFilterForm', ['templateUrlList', '$compile', function (templateList, compile) {
    	return {
    		restrict: 'C',
    		require: '^smartTable',
    		templateUrl: templateList.smartTableFilterSearchBox,
            replace: false,
    		link: function (scope, element, attr, ctrl) {
//    				var filteringHTML = '';
//    				for (i in scope.columnCollection){
//    					var column = scope.columnCollection[i];
//    					if(column.isInFilterForm)
//    						filteringHTML += "<tr>" +
//    										 "	<td>" + 
//    										 	column.label +
//    										 "	</td>" +
//    										 " 	<td><input ng-model=\"" + column.map+"Filter" + "\" type=\"text\" /></td>" +
//    										 "</tr>";
//    				}
//    				if(filteringHTML.length > 0){
//    					
//    					element.html(filteringHTML);
//    					compile(element.contents())(scope);
//    				}
    				
    				scope.filterFormSubmit = function(){
    					for(field in scope.filterInput){
    		        		if(scope.filterInput[field] != undefined)
    		        			ctrl.predicate[field] = scope.filterInput[field]; 
    		        	} 
    		        	
    		        	ctrl.pipe();
    		        };

    		        scope.resetFormSubmit = function(){
    		        	for(filterFieldname in ctrl.predicate){
    		        		ctrl.predicate[filterFieldname] = "";
    		        		if(scope.filterInput[filterFieldname] != undefined)
    		        			scope.filterInput[filterFieldname] = "";
    		        	}
    		        	ctrl.pipe();
    		        };
    		}
    	};
    }])
    //a customisable cell (see templateUrl) and editable
    //TODO check with the ng-include strategy
    .directive('smartTableDataCell', ['$filter', '$http', '$templateCache', '$compile', function (filter, http, templateCache, compile) {
        return {
            restrict: 'C',
            link: function (scope, element) {
                var
                    column = scope.column,
                    row = scope.dataRow,
                    format = filter('format'),
                    childScope;

                //can be useful for child directives
                scope.formatedValue = format(row[column.map], column.formatFunction, column.formatParameter);

                function defaultContent() {
                    //clear content
                    if (column.isEditable) {
                        element.html('<editable-cell row="dataRow" column="column" type="column.type" value="dataRow[column.map]"></editable-cell>');
                        compile(element.contents())(scope);
                    } else {
                        element.text(scope.formatedValue);
                    }
                }

                scope.$watch('column.cellTemplateUrl', function (value) {

                    if (value) {
                        //we have to load the template (and cache it) : a kind of ngInclude
                        http.get(value, {cache: templateCache}).success(function (response) {

                            //create a scope
                            childScope = scope.$new();
                            //compile the element with its new content and new scope
                            element.html(response);
                            compile(element.contents())(childScope);
                        }).error(defaultContent);

                    } else {
                        defaultContent();
                    }
                });
            }
        };
    }])
    //directive that allows type to be bound in input
    .directive('inputType', ['$parse', function (parse) {
        return {
            restrict: 'A',
            priority: 1,
            link: function (scope, ielement, iattr) {
                //force the type to be set before inputDirective is called
                var getter = parse(iattr.type),
                    type = getter(scope);
                iattr.$set('type', type);
            }
        };
    }])
    //an editable content in the context of a cell (see row, column)
    .directive('editableCell', ['templateUrlList', function (templateList) {
        return {
            restrict: 'E',
            require: '^smartTable',
            templateUrl: templateList.editableCell,
            scope: {
                row: '=',
                column: '=',
                type: '='
            },
            replace: true,
            link: function (scope, element, attrs, ctrl) {
                var form = angular.element(element.children()[1]),
                    input = angular.element(form.children()[0]);

                //init values
                scope.isEditMode = false;

                scope.submit = function () {
                    //update model if valid
                    if (scope.myForm.$valid === true) {
                        scope.row[scope.column.map] = scope.value;
                        ctrl.sortBy();//it will trigger the refresh...  (ie it will sort, filter, etc with the new value)
                    }
                    scope.isEditMode = false;
                };

                scope.toggleEditMode = function () {
                    scope.value = scope.row[scope.column.map];
                    scope.isEditMode = true;
                };

                scope.$watch('isEditMode', function (newValue, oldValue) {
                    if (newValue) {
                        input[0].select();
                        input[0].focus();
                    }
                });

                input.bind('blur', function () {
                    scope.$apply(function () {
                        scope.submit();
                    });
                });
            }
        };
    }]);


/* Filters */

angular.module('smartTable.filters', []).
    constant('DefaultFilters', ['currency', 'date', 'json', 'lowercase', 'number', 'uppercase']).
    filter('format', ['$filter', 'DefaultFilters', function (filter, defaultfilters) {
        return function (value, formatFunction, filterParameter) {

            var returnFunction;
            
            if(value == undefined){
        			return "";
        	}

            if (formatFunction && angular.isFunction(formatFunction)) {
                returnFunction = formatFunction;
            } else {
                returnFunction = defaultfilters.indexOf(formatFunction) !== -1 ? filter(formatFunction) : function (value) {
                    return value;
                };
            }
            return returnFunction(value, filterParameter);
        };
    }]);

/*table module */

//TODO be able to register function on remove/add column and rows or use the scope to emit the events

angular.module('smartTable.table', ['smartTable.column', 'smartTable.utilities', 'smartTable.directives', 'smartTable.filters', 'ui.bootstrap.pagination'])
    .constant('DefaultTableConfiguration', {
        selectionMode: 'none',
        isGlobalSearchActivated: false,
        isFilterFormActivated: false,
        displaySelectionCheckbox: false,
        isPaginationEnabled: true,
        itemsByPage: 10,
        maxSize: 5,

        //just to remind available option
        sortAlgorithm: '',
        filterAlgorithm: '',
    })
    .controller('TableCtrl', ['$scope', 'Column', '$filter', 'ArrayUtility', 'DefaultTableConfiguration', '$http', '$log', function (scope, Column, filter, arrayUtility, defaultConfig, http, log) {

        scope.columns = [];

        scope.displayedCollection = []; //init empty array so that if pagination is enabled, it does not spoil performances
        scope.showSpinner = true;
        scope.showError = false;
        scope.numberOfPagesError = false;
        scope.totalCountItems = "";
        
        scope.numberOfPages = 1;
        scope.currentPage = 1;

        this.predicate = {};
        var lastColumnSort;
        
        scope.filterInput = [];

        function sortDataRow(array, column) {
            var sortAlgo = (scope.sortAlgorithm && angular.isFunction(scope.sortAlgorithm)) === true ? scope.sortAlgorithm : filter('orderBy');
            if (column) {
                return arrayUtility.sort(array, sortAlgo, column.sortPredicate, column.reverse);
            } else {
                return array;
            }
        }

        function selectDataRow(array, selectionMode, index, select) {

            var dataRow;

            if ((!angular.isArray(array)) || (selectionMode !== 'multiple' && selectionMode !== 'single')) {
                return;
            }

            if (index >= 0 && index < array.length) {
                dataRow = array[index];
                if (selectionMode === 'single') {
                    //unselect all the others
                    for (var i = 0, l = array.length; i < l; i++) {
                        array[i].isSelected = false;
                    }
                    dataRow.isSelected = select;
                } else if (selectionMode === 'multiple') {
                    dataRow.isSelected = select;
                }
            }
        }

        /**
         * set the config (config parameters will be available through scope
         * @param config
         */
        this.setGlobalConfig = function (config) {
            angular.extend(scope, defaultConfig, config);
        };

        /**
         * change the current page displayed
         * @param page
         */
        this.changePage = function (page) {
            if (angular.isNumber(page.page)) {
                scope.currentPage = page.page;
                this.pipe();
            }
        };

        /**
         * set column as the column used to sort the data (if it is already the case, it will change the reverse value)
         * @method sortBy
         * @param column
         */
        this.sortBy = function (column) {
            var index = scope.columns.indexOf(column);
            if (index !== -1) {
                if (column.isSortable === true) {
                    // reset the last column used
                    if (lastColumnSort && lastColumnSort !== column) {
                        lastColumnSort.reverse = 'none';
                    }

                    column.sortPredicate = column.sortPredicate || column.map;
                    column.reverse = column.reverse !== true;
                    lastColumnSort = column;
                }
            }

            this.pipe();
        };

        /**
         * set the filter predicate used for searching
         * @param input
         * @param column
         */
        this.search = function (input, column) {

            //update column and global predicate
            if (column && scope.columns.indexOf(column) !== -1) {
                this.predicate.$ = '';
                column.filterPredicate = input;
            } else {
                for (var j = 0, l = scope.columns.length; j < l; j++) {
                    scope.columns[j].filterPredicate = '';
                }
                this.predicate.$ = input;
            }

            for (var j = 0, l = scope.columns.length; j < l; j++) {
                this.predicate[scope.columns[j].map] = scope.columns[j].filterPredicate;
            }
            this.pipe();

        };

        /**
         * combine sort, search and limitTo operations on an array,
         * @param array
         * @returns Array, an array result of the operations on input array
         */
        this.pipe = function () {
        	
            //use the scope and private data to build a request :
            // here the content of a post request, but can be an url, ... depends on the server API
            var postData = {
                orderBy: lastColumnSort || null,
                filter: this.predicate,
                page: scope.currentPage || 1,
                itemsByPage: scope.config.itemsByPage || 10,
            };

            log.log(JSON.stringify(postData));

            scope.showSpinner = true;
            scope.showError = false;
            scope.displayedCollection = [];
            
            http.post(scope.config.resourceBaseURL, postData)
            	.success(function (res) {
            		scope.showSpinner = false;
            		scope.displayedCollection = res.items;
            		scope.numberOfPages = Math.ceil(res.total / scope.config.itemsByPage);
	    			scope.totalCountItems = res.total;
                })
            	.error(function(data, status){
            		scope.showSpinner = false;
            		scope.showError = true;
            		scope.smartTableErrorMsg = "Server Connection Error [code: " + status + "]";
            		log.log("[SmartTable Error] status: " + status + " data: " + data);
            	});
        };

        /*////////////
         Column API
         ///////////*/


        /**
         * insert a new column in scope.collection at index or push at the end if no index
         * @param columnConfig column configuration used to instantiate the new Column
         * @param index where to insert the column (at the end if not specified)
         */
        this.insertColumn = function (columnConfig, index) {
            var column = new Column(columnConfig);
            arrayUtility.insertAt(scope.columns, index, column);
        };

        /**
         * remove the column at columnIndex from scope.columns
         * @param columnIndex index of the column to be removed
         */
        this.removeColumn = function (columnIndex) {
            arrayUtility.removeAt(scope.columns, columnIndex);
        };

        /**
         * move column located at oldIndex to the newIndex in scope.columns
         * @param oldIndex index of the column before it is moved
         * @param newIndex index of the column after the column is moved
         */
        this.moveColumn = function (oldIndex, newIndex) {
            arrayUtility.moveAt(scope.columns, oldIndex, newIndex);
        };


        /*///////////
         ROW API
         */

        /**
         * select or unselect the item of the displayedCollection with the selection mode set in the scope
         * @param dataRow
         */
        this.toggleSelection = function (dataRow) {
            var index = scope.displayedCollection.indexOf(dataRow);
            if (index !== -1) {
                selectDataRow(scope.displayedCollection, scope.selectionMode, index, dataRow.isSelected !== true);
            }
        };

        /**
         * select/unselect all the currently displayed rows
         * @param value if true select, else unselect
         */
        this.toggleSelectionAll = function (value) {
            var i = 0,
                l = scope.displayedCollection.length;

            if (scope.selectionMode !== 'multiple') {
                return;
            }
            for (; i < l; i++) {
                selectDataRow(scope.displayedCollection, scope.selectionMode, i, value === true);
            }
        };

        /**
         * remove the item at index rowIndex from the displayed collection
         * @param rowIndex
         * @returns {*} item just removed or undefined
         */
        this.removeDataRow = function (rowIndex) {
            var toRemove = arrayUtility.removeAt(scope.displayedCollection, rowIndex);
        };

        /**
         * move an item from oldIndex to newIndex in displayedCollection
         * @param oldIndex
         * @param newIndex
         */
        this.moveDataRow = function (oldIndex, newIndex) {
            arrayUtility.moveAt(scope.displayedCollection, oldIndex, newIndex);
        };
    }]);


angular.module('smartTable.templates', ['partials/defaultCell.html', 'partials/defaultFilter.html', 'partials/defaultHeader.html', 'partials/editableCell.html', 'partials/filterSearchBox.html', 'partials/globalSearchCell.html', 'partials/pagination.html', 'partials/selectAllCheckbox.html', 'partials/selectionCheckbox.html', 'partials/smartTable.html']);

angular.module("partials/defaultCell.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("partials/defaultCell.html",
    "<span>{{row[column.map] | format:column.formatFunction:column.formatParameter}}</span>");
}]);

angular.module("partials/defaultFilter.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("partials/defaultFilter.html",
    "<td>{{column.filter.label}}</td>\n" +
    "<td><input ng-model=\"filterInput[column.map]\" type=\"text\"></td>");
}]);

angular.module("partials/defaultHeader.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("partials/defaultHeader.html",
    "<span class=\"header-content\" ng-class=\"{'sort-ascent':column.reverse==true,'sort-descent':column.reverse==false}\">{{column.label}}</span>");
}]);

angular.module("partials/editableCell.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("partials/editableCell.html",
    "<div ng-dblclick=\"toggleEditMode($event)\">\n" +
    "    <span ng-hide=\"isEditMode\">{{row[column.map] | format:column.formatFunction:column.formatParameter}}</span>\n" +
    "\n" +
    "    <form ng-submit=\"submit()\" ng-show=\"isEditMode\" name=\"myForm\">\n" +
    "        <input name=\"myInput\" ng-model=\"value\" type=\"type\" input-type/>\n" +
    "    </form>\n" +
    "</div>");
}]);

angular.module("partials/filterSearchBox.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("partials/filterSearchBox.html",
    "<tr ng-repeat=\"column in columns | filter:{filter.active:true}\" ng-include=\"column.filter.filterTemplateUrl\">\n" +
    "<!-- 	<td>{{column.label}}</td> -->\n" +
    "<!-- 	<td><input ng-model=\"filterInput[column.map]\" type=\"text\"></td> -->\n" +
    "</tr>\n" +
    "");
}]);

angular.module("partials/globalSearchCell.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("partials/globalSearchCell.html",
    "<label>Search :</label>\n" +
    "<input type=\"text\" ng-model=\"searchValue\"/>");
}]);

angular.module("partials/pagination.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("partials/pagination.html",
    "<div class=\"pagination\">\n" +
    "    <ul>\n" +
    "         <li ng-repeat=\"page in pages\" ng-class=\"{active: page.active, disabled: page.disabled}\">\n" +
    "    		<a ng-click=\"selectPage(page.number)\">\n" +
    "    			<div ng-bind-html-unsafe=\"page.text\"></div>\n" +
    "    		</a>\n" +
    "    	</li>\n" +
    "    </ul>\n" +
    "</div> ");
}]);

angular.module("partials/selectAllCheckbox.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("partials/selectAllCheckbox.html",
    "<input class=\"smart-table-select-all\" type=\"checkbox\" ng-model=\"isChecked\"/>");
}]);

angular.module("partials/selectionCheckbox.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("partials/selectionCheckbox.html",
    "<input type=\"checkbox\" ng-model=\"dataRow.isSelected\" stop-event=\"click\"/>");
}]);

angular.module("partials/smartTable.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("partials/smartTable.html",
    "<div class=\"smart-table-container\">\n" +
    "    <table class=\"smart-table\">\n" +
    "        <thead>\n" +
    "        	<tr class=\"smart-table-global-search-row\" ng-show=\"isGlobalSearchActivated || isFilterFormActivated\">\n" +
    "    			<td colspan=\"{{columns.length}}\">	\n" +
    "	    			 <table id=\"smartTableSearchTable\">\n" +
    "	    				<tr ng-show=\"isGlobalSearchActivated\">		\n" +
    "	    		            <td class=\"smart-table-global-search\" column-span=\"{{columns.length}}\" colspan=\"{{columnSpan}}\">\n" +
    "	    		            </td>\n" +
    "	    				</tr>\n" +
    "	    				<tr ng-show=\"isFilterFormActivated\">		\n" +
    "	     		            <td colspan=\"{{columns.length}}\">\n" +
    "    					   		<table class=\"smart-table-filter-form\">\n" +
    "    							</table>\n" +
    "	    					   <div id=\"smartTableFilterBtns\">			\n" +
    "	    						   <button class=\"btn btn-xs btn-default\" ng-click=\"filterFormSubmit()\">Filter</button>	\n" +
    "	    						   <button class=\"btn btn-xs btn-default\" ng-click=\"resetFormSubmit()\">Reset</button>	\n" +
    "	    					   </div>			\n" +
    "	    	           		</td>\n" +
    "	    				</tr>\n" +
    "	    			 </table>\n" +
    "    			</td>\n" +
    "            </tr>\n" +
    "	        <tr class=\"smart-table-header-row\">\n" +
    "	            <th ng-repeat=\"column in columns\" ng-include=\"column.headerTemplateUrl\"\n" +
    "	                class=\"smart-table-header-cell {{column.headerClass}}\" scope=\"col\">\n" +
    "	            </th>\n" +
    "	        </tr>\n" +
    "        </thead>\n" +
    "        <tbody>\n" +
    "	        <tr ng-repeat=\"dataRow in displayedCollection\" ng-class=\"{selected:dataRow.isSelected}\"\n" +
    "	            class=\"smart-table-data-row\">\n" +
    "	            <td ng-repeat=\"column in columns\" class=\"smart-table-data-cell {{column.cellClass}}\"></td>\n" +
    "	        </tr>\n" +
    " 	 		<tr ng-show=\"showSpinner\">\n" +
    "    			<td id=\"smartTableSpinnerRow\" colspan=\"{{columns.length}}\" align=\"center\">\n" +
    "    				<div class=\"smartTableSpinner\">			\n" +
    "    					<img src=\"data:image/gif;base64,R0lGODlhKwALAPEAAP///4qLkMXFyIqLkCH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAKwALAAACMoSOCMuW2diD88UKG95W88uF4DaGWFmhZid93pq+pwxnLUnXh8ou+sSz+T64oCAyTBUAACH5BAkKAAAALAAAAAArAAsAAAI9xI4IyyAPYWOxmoTHrHzzmGHe94xkmJifyqFKQ0pwLLgHa82xrekkDrIBZRQab1jyfY7KTtPimixiUsevAAAh+QQJCgAAACwAAAAAKwALAAACPYSOCMswD2FjqZpqW9xv4g8KE7d54XmMpNSgqLoOpgvC60xjNonnyc7p+VKamKw1zDCMR8rp8pksYlKorgAAIfkECQoAAAAsAAAAACsACwAAAkCEjgjLltnYmJS6Bxt+sfq5ZUyoNJ9HHlEqdCfFrqn7DrE2m7Wdj/2y45FkQ13t5itKdshFExC8YCLOEBX6AhQAADsAAAAAAAAAAAA=\" />\n" +
    "    				</div>				\n" +
    "    			</td>\n" +
    "    		 </tr>\n" +
    "    		 <tr ng-show=\"showError\">\n" +
    "    			<td id=\"smartTableErrorRow\" colspan=\"{{columns.length}}\" align=\"center\">\n" +
    "    				<div class=\"smartTableErrorBox\">			\n" +
    "    					<img class=\"smartTableErrorImg\" src=\"data:image/png;base64,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\" />\n" +
    "    					<span class=\"smartTableErrorTxt\">{{smartTableErrorMsg}}</span>				\n" +
    "    				</div>				\n" +
    "    			</td>\n" +
    "    		 </tr>\n" +
    "        </tbody>\n" +
    "        <tfoot ng-show=\"isPaginationEnabled\">\n" +
    "         	<tr class=\"smart-table-footer-row\">\n" +
    "               	 <td colspan=\"{{columns.length}}\">\n" +
    "                   	<pagination num-pages=\"numberOfPages\" max-size=\"maxSize\" current-page=\"currentPage\" errored=\"numberOfPagesError\" ></pagination>\n" +
    "                   		<div ng-show=\"displayedCollection.length != 0 && totalCountItems != -1\" class=\"paginationCounter\"><span>Showing {{((currentPage-1) * itemsByPage) + 1}} - {{((currentPage-1) * itemsByPage) + displayedCollection.length}} of {{totalCountItems}} total</span></div>				\n" +
    "                   		<div ng-show=\"totalCountItems == -1\" class=\"paginationCounter paginationCounterError\"><span>Connection Error in total item counting</span></div>				\n" +
    "    	             </td>\n" +
    "           	</tr>\n" +
    "        </tfoot>\n" +
    "    </table>\n" +
    "</div>\n" +
    "");
}]);

angular.module('smartTable.templateUrlList', [])
    .constant('templateUrlList', {
        smartTable: 'partials/smartTable.html',
        smartTableGlobalSearch: 'partials/globalSearchCell.html',
        smartTableFilterSearchBox: 'partials/filterSearchBox.html',
        editableCell: 'partials/editableCell.html',
        selectionCheckbox: 'partials/selectionCheckbox.html',
        selectAllCheckbox: 'partials/selectAllCheckbox.html',
        defaultHeader: 'partials/defaultHeader.html',
        defaultFilter: 'partials/defaultFilter.html',
        pagination: 'partials/pagination.html'
    });

angular.module('smartTable.utilities', [])

    .factory('ArrayUtility', function () {

        /**
         * remove the item at index from arrayRef and return the removed item
         * @param arrayRef
         * @param index
         * @returns {*}
         */
        var removeAt = function (arrayRef, index) {
                if (index >= 0 && index < arrayRef.length) {
                    return arrayRef.splice(index, 1)[0];
                }
            },

            /**
             * insert item in arrayRef at index or a the end if index is wrong
             * @param arrayRef
             * @param index
             * @param item
             */
                insertAt = function (arrayRef, index, item) {
                if (index >= 0 && index < arrayRef.length) {
                    arrayRef.splice(index, 0, item);
                } else {
                    arrayRef.push(item);
                }
            },

            /**
             * move the item at oldIndex to newIndex in arrayRef
             * @param arrayRef
             * @param oldIndex
             * @param newIndex
             */
                moveAt = function (arrayRef, oldIndex, newIndex) {
                var elementToMove;
                if (oldIndex >= 0 && oldIndex < arrayRef.length && newIndex >= 0 && newIndex < arrayRef.length) {
                    elementToMove = arrayRef.splice(oldIndex, 1)[0];
                    arrayRef.splice(newIndex, 0, elementToMove);
                }
            },

            /**
             * sort arrayRef according to sortAlgorithm following predicate and reverse
             * @param arrayRef
             * @param sortAlgorithm
             * @param predicate
             * @param reverse
             * @returns {*}
             */
                sort = function (arrayRef, sortAlgorithm, predicate, reverse) {

                if (!sortAlgorithm || !angular.isFunction(sortAlgorithm)) {
                    return arrayRef;
                } else {
                    return sortAlgorithm(arrayRef, predicate, reverse === true);//excpet if reverse is true it will take it as false
                }
            },

            /**
             * filter arrayRef according with filterAlgorithm and predicate
             * @param arrayRef
             * @param filterAlgorithm
             * @param predicate
             * @returns {*}
             */
                filter = function (arrayRef, filterAlgorithm, predicate) {
                if (!filterAlgorithm || !angular.isFunction(filterAlgorithm)) {
                    return arrayRef;
                } else {
                    return filterAlgorithm(arrayRef, predicate);
                }
            },

            /**
             * return an array, part of array ref starting at min and the size of length
             * @param arrayRef
             * @param min
             * @param length
             * @returns {*}
             */
                fromTo = function (arrayRef, min, length) {

                var out = [],
                    limit,
                    start;

                if (!angular.isArray(arrayRef)) {
                    return arrayRef;
                }

                start = Math.max(min, 0);
                start = Math.min(start, (arrayRef.length - 1) > 0 ? arrayRef.length - 1 : 0);

                length = Math.max(0, length);
                limit = Math.min(start + length, arrayRef.length);

                for (var i = start; i < limit; i++) {
                    out.push(arrayRef[i]);
                }
                return out;
            };


        return {
            removeAt: removeAt,
            insertAt: insertAt,
            moveAt: moveAt,
            sort: sort,
            filter: filter,
            fromTo: fromTo
        };
    });


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
                        text: text,
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
