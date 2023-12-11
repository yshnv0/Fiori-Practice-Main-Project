sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, formatter, MessageToast, MessageBox) {
        "use strict";

        return Controller.extend("com.applexus.commutecompanion.controller.Seeker", {
            customFormatter: formatter,
            onInit: function () {
                this.router = this.getOwnerComponent().getRouter();
                this.router.getRoute("RouteSeeker").attachPatternMatched(this.getId, this);
            },
            getId: function (oEvent) {
                this.sId = oEvent.getParameter("arguments").userId;
                this.byId("search_trip_date").setMinDate(new Date());
            },
            onSelectChanged: function (oEvent) {
                var key = oEvent.getParameters().key;
                if (key === 'my_books') {
                    this.onViewBookings();
                }
                else if (key === 'logout') {
                    this.onLogoutPress();
                }
                else if (key === 'welc_seeker') {
                    var that = this;
                    var oPointsModel = this.getOwnerComponent().getModel();
                    var oBusyDialogL = new sap.m.BusyDialog({
                        title: "Loading",
                        text: "Hang on...",
                        customIcon: "../css/loading.png",
                        customIconRotationSpeed: 3000
                    });
                    oBusyDialogL.open();
                    oPointsModel.read("/User_PointsSet(UserId='" + this.sId + "',UserRole='S')", {
                        success: function (oResponse) {
                            debugger;
                            oBusyDialogL.close();
                            that.getView().byId("label_welcome_seeker1").setText("You have " + oResponse.UserPoints + " points");
                        },
                        error: function () {
                            oBusyDialogL.close();
                        }
                    });
                }
            },
            onSearchTrips: function () {
                debugger;
                // var tripDate = this.getView().byId("search_trip_date").getDateValue();
                debugger;
                var tripDate1 = this.getView().byId("search_trip_date").getValue();
                var seekDate = new Date(tripDate1)
                // seekDate.setDate(seekDate.getDate() + 1);
                var oBookingModel = this.getOwnerComponent().getModel();
                var oJsonModel = new sap.ui.model.json.JSONModel();
                var oFilter = new sap.ui.model.Filter({
                    path: "TripDate",
                    operator: "EQ",
                    value1: seekDate
                });
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Searching for trips",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialog.open();
                oBookingModel.read("/View_TripsSet", {
                    filters: [oFilter],
                    success: function (oResponse) {
                        oJsonModel.setProperty("/AvailableTrips", oResponse.results);
                        this.getView().setModel(oJsonModel, "oAvailableTripsModel");
                        oBusyDialog.close();
                    }.bind(this),
                    error: function (oError) {
                        oBusyDialog.close();
                    }.bind(this)
                });
            },
            onBookTrip: function (oEvent) {
                debugger;
                var oContext = oEvent.getSource().getBindingContext("oAvailableTripsModel").getObject();
                oContext.SeatsBooked = parseInt(oContext.SeatsBooked);
                debugger;
                if (oContext.ProviderId === this.sId) {
                    MessageBox.error("You cannot book a trip created by yourself!");
                    return;
                }
                if (oContext.SeatsBooked > oContext.SeatsAvailable) {
                    MessageToast.show("Seats entered are greater than available seats");
                    return;
                }
                if (oContext.SeatsBooked <= 0) {
                    MessageToast.show("Invalid number of seats");
                    return;
                }
                var oBookingsModel = this.getOwnerComponent().getModel();
                var oBooking = {
                    "SeekerId": this.sId,
                    "TripId": oContext.TripId,
                    "SeatsBooked": oContext.SeatsBooked,
                    "BookingStatus": "B"
                };
                var oBusyDialogs = new sap.m.BusyDialog({
                    title: "Booking in process",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialogs.open();
                oBookingsModel.create("/Booking_DetailsSet", oBooking, {
                    success: function () {
                        oBusyDialogs.close();
                        MessageToast.show("Booking success");
                        this.onSearchTrips();
                    }.bind(this),
                    error: function () {
                        oBusyDialogs.close();
                    }.bind(this)
                });
            },
            onViewBookings: function () {
                var oViewBookingModel = this.getOwnerComponent().getModel();
                var oBookingsJsonModel = new sap.ui.model.json.JSONModel();
                var oBookingFilter = new sap.ui.model.Filter({
                    path: "SeekerId",
                    operator: "EQ",
                    value1: this.sId
                });
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Fetching your bookings",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialog.open();
                oViewBookingModel.read("/View_BookingsSet", {
                    filters: [oBookingFilter],
                    success: function (oResponse) {
                        oBookingsJsonModel.setProperty("/Bookings", oResponse.results);
                        this.getView().setModel(oBookingsJsonModel, "oViewBookModel");
                        oBusyDialog.close();
                    }.bind(this),
                    error: function (oError) {
                        oBusyDialog.close();
                    }.bind(this)
                });
            },
            onCancelTrip: function (oEvent) {
                var oContexts = oEvent.getSource().getBindingContext("oViewBookModel").getObject();
                MessageBox.confirm("Are you sure want to cancel the booking ?", {
                    title: "Confirm",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            this.onCancel(oContexts);
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });
            },
            onCancel: function (oBooking) {
                var oModel = this.getOwnerComponent().getModel();
                var onCancelPayload = {
                    "BookingId": oBooking.BookingId,
                    "BookingStatus": "C",
                    "TripId": oBooking.TripId,
                    "SeatsBooked": oBooking.SeatsBooked
                };
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Cancelling Booking",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                var tripDate = oBooking.TripDate
                var tripTime = oBooking.TripTime;
                var currentTime = new Date();
                if (currentTime > tripDate) {

                    button.setEnabled(true);
                } else {

                  
                    button.setEnabled(false);
                }
                oBusyDialog.open();
                oModel.sDefaultUpdateMethod = "PUT";
                oModel.update("/Booking_DetailsSet(BookingId='" + onCancelPayload.BookingId + "')", onCancelPayload, {
                    success: function () {
                        oBusyDialog.close();
                        this.onViewBookings();
                    }.bind(this),
                    error: function (oError) {
                        oBusyDialog.close();
                    }
                });
            },
            onFeedback: function (oEvent) {
                debugger;
                var oFeedbackContext = oEvent.getSource().getBindingContext("oViewBookModel").getObject();
                var oFeedbackModel = this.getOwnerComponent().getModel();
                var oFeedBackPayload = {
                    "BookingId": oFeedbackContext.BookingId,
                    "TripId": oFeedbackContext.TripId,
                    "SeatsBooked": oFeedbackContext.SeatsBooked,
                    "ProviderFeedback": oFeedbackContext.ProviderFeedback,
                    "BookingStatus": "B"
                };
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Submitting feedback",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                var tripDateTime = new Date(oFeedbackContext.TripDate + " " + oFeedbackContext.TripTime);
                var currentTime = new Date();
                var timeDifferenceMinutes = (tripDateTime - currentTime) / (60 * 1000);
                var enableMinutesAfterTrip = 10;

                if (tripDateTime > currentTime) {
        
                var button = this.getView().byId("btn_feedback");
                button.setEnabled(false);
                } else if (timeDifferenceMinutes <= enableMinutesAfterTrip) {
       
                var button = this.getView().byId("btn_feedback");
                button.setEnabled(true);
                } else {
               MessageToast.show("Feedback can no longer be submitted.");
               return;
               }
                oBusyDialog.open();
                oFeedbackModel.sDefaultUpdateMethod = "PUT";
                oFeedbackModel.update("/Booking_DetailsSet(BookingId='" + oFeedBackPayload.BookingId + "')", oFeedBackPayload, {
                    success: function () {
                        oBusyDialog.close();
                        this.onViewBookings();
                    }.bind(this),
                    error: function () {
                        oBusyDialog.close();
                    }.bind(this)
                });
            },
            onLogoutPress: function () {
                MessageBox.confirm("Are you sure want to logout ?", {
                    title: "Confirm",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            debugger;
                            // var oHistory = History.getInstance();
                            // var sPreviousHash = oHistory.getPreviousHash();

                            // if (sPreviousHash !== undefined) {
                            //     window.history.go(-1);
                            // } else {
                            this.router.navTo("RouteLogin", {}, true);
                            // }
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });
            }
        });
    });
