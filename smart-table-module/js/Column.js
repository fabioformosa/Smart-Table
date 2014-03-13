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

