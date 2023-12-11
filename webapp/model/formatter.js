sap.ui.define(
  [
    "sap/ui/core/format/DateFormat"
  ],
  function (DateFormat) {
    "use strict";

    return {
      formatDate: function (dateValue) {
        if (dateValue) {
          var oDateFormat = DateFormat.getDateInstance({
            pattern: "dd/MM/YYY"
          })
          var oDate = new Date(dateValue);
          return oDateFormat.format(oDate);
        }
      },
      formatTime: function (timeValue) {
        if (timeValue) {
          var oTimeFormat = DateFormat.getTimeInstance({
            pattern: "HH:mm"
          });
          var oMili = timeValue - (5.5 * 60 * 60 * 1000);
          var oTime = new Date(oMili);
          return oTimeFormat.format(oTime);
        }
      },
      formatRoute(routes) {
        if (routes) {
          var newRoute = routes.replaceAll(",", "\n");
          return newRoute;
        }
      },
      formatButton(date, time) {
        debugger;
        var currDate = new Date();
        if(currDate < date) {
          return true;
        }
        
      }
    }
  }
);
