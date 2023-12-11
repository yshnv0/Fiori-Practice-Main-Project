sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, formatter) {
        "use strict";

        return Controller.extend("com.applexus.commutecompanion.controller.TripBooking", {
            customFormatter: formatter,
            onInit: function () {
                this.router = this.getOwnerComponent().getRouter();
                this.router.getRoute("RouteTripBooking").attachPatternMatched(this.getId,this);
            },
            getId: function(oEvent) {
                this.tripId = oEvent.getParameter("arguments").tripId;
                this.onLoadTrips();
            },
            onLoadTrips: function() {     
                var oModel = this.getOwnerComponent().getModel();
                var oJsonModel = new sap.ui.model.json.JSONModel();
                var oFilter = new sap.ui.model.Filter({
                    path    : "TripId",
                    operator: "EQ",
                    value1  : this.tripId
                });
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Fetching booking details",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialog.open();
                oModel.read("/View_Trip_BookingsSet", {
                    filters: [oFilter],
                    success: function(oResponse) {
                        oJsonModel.setProperty("/TripBookings", oResponse.results);
                        this.getView().setModel(oJsonModel, "oTripBookingsModel");
                        oBusyDialog.close();
                    }.bind(this),
                    error: function(oError) {
                        oBusyDialog.close();
                    }.bind(this)
                });
            },
            onFeedback: function (oEvent) {
                debugger;
                var oFeedbackContext = oEvent.getSource().getBindingContext("oTripBookingsModel").getObject();
                var oFeedbackModel = this.getOwnerComponent().getModel();
                var oFeedBackPayload = {
                    "BookingId": oFeedbackContext.BookingId,
                    "TripId": oFeedbackContext.TripId,
                    "SeatsBooked": oFeedbackContext.SeatsBooked,
                    "SeekerFeedback": oFeedbackContext.SeekerFeedback,
                    "BookingStatus": "S"
                };
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Submitting feedback",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialog.open();
                oFeedbackModel.sDefaultUpdateMethod = "PUT";
                oFeedbackModel.update("/Booking_DetailsSet(BookingId='" + oFeedBackPayload.BookingId + "')", oFeedBackPayload, {
                    success: function () {
                        oBusyDialog.close();
                        this.onLoadTrips();
                    }.bind(this),
                    error: function () {
                        oBusyDialog.close();
                    }.bind(this)
                });
            }
        });
});
