angular.module('agrgtrApp')
    .filter('mysqlDatetime', function () {
        return function (item) {
            if (item instanceof Date) {
                return item.getFullYear() + '-' + ('0' + (item.getMonth() + 1)).slice(-2) + '-' + ('0' + item.getDate()).slice(-2);
            } else if(typeof item == "string" ) {
                var date_string = item.split(/[- :]/);
                return new Date(parseInt(date_string[0]), parseInt(date_string[1]) - 1, parseInt(date_string[2]), parseInt(date_string[3]), parseInt(date_string[4]), parseInt(date_string[5]));
            }
        };
    });