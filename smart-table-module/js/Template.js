angular.module('smartTable.templates', ['partials/defaultCell.html', 'partials/defaultHeader.html', 'partials/editableCell.html', 'partials/filterSearchBox.html', 'partials/globalSearchCell.html', 'partials/pagination.html', 'partials/selectAllCheckbox.html', 'partials/selectionCheckbox.html', 'partials/smartTable.html']);

angular.module("partials/defaultCell.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("partials/defaultCell.html",
    "<span>{{row[column.map] | format:column.formatFunction:column.formatParameter}}</span>");
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
    "<tr ng-repeat=\"column in columns | filter:isInFilterForm:true\">\n" +
    "	<td>{{column.label}}</td>\n" +
    "	<td><input ng-model=\"filterInput[column.map]\" type=\"text\"></td>\n" +
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
