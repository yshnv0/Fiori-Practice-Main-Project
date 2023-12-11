sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/core/format/NumberFormat",
    "sap/m/MessageToast",
    "../model/formatter",
    "sap/m/MessageBox"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, NumberFormat, MessageToast, formatter, MessageBox) {
        "use strict";
        var oStop = 0, check = 0;
        return Controller.extend("com.applexus.commutecompanion.controller.Provider", {
            customFormatter: formatter,
            onInit: function () {
                this.router = this.getOwnerComponent().getRouter();
                this.router.getRoute("RouteProvider").attachPatternMatched(this.getId, this);

            },
            onProviderSelect: function (oEvent) {
                var key = oEvent.getParameters().key;
                if (key === 'my_trips') {
                    this.onReadTrips();
                }
                else if (key === 'logout') {
                    this.onLogoutPress();
                }
                else if (key === 'welc') {
                    var that = this;
                    var oPointsModel = this.getOwnerComponent().getModel();
                    var oBusyDialogL = new sap.m.BusyDialog({
                        title: "Loading",
                        text: "Hang on...",
                        customIcon: "../css/loading.png",
                        customIconRotationSpeed: 3000
                    });
                    oBusyDialogL.open();
                    oPointsModel.read("/User_PointsSet(UserId='" + this.pId + "',UserRole='P')", {
                        success: function (oResponse) {
                            debugger;
                            oBusyDialogL.close();
                            that.getView().byId("label_welcome_admin1").setText("You have " + oResponse.UserPoints + " points");
                            oBusyDialogL.close();
                        },
                        error: function () {
                            oBusyDialogL.close();
                        }
                    });
                }
            },
            getId: function (oEvent) {
                this.pId = oEvent.getParameter("arguments").userId;
                debugger;

                debugger;
                this.byId("add_trip_date").setMinDate(new Date());
                var currentDate = new Date();
                var numberOfDaysToAdd = 7;
                var max = new Date(currentDate.getTime() + numberOfDaysToAdd * 24 * 60 * 60 * 1000);
                this.byId("add_trip_date").setMaxDate(max);

            },
            onAddVehicle: function () {
                debugger;
                var oIntFormat = NumberFormat.getIntegerInstance();
                var oDataModel = this.getOwnerComponent().getModel();
                var vNo = this.getView().byId("add_vhcl_vno").getValue();
                var vName = this.getView().byId("add_vhcl_vname").getValue();
                var vType = this.getView().byId("add_vhcl_type").getSelectedKey();
                var noSeats = parseInt(this.getView().byId("add_vhcl_vseats").getValue());
                var namePattern = /^[A-Za-z\s]{3,15}$/;
                var vehicleNumberPattern = /^[A-Z0-9]{5,10}$/;

                if (!vNo || !vName || !vType || !noSeats) {

                    if (!vNo) {
                        this.getView().byId("add_vhcl_vno").setValueState("Error");
                    } else {
                        this.getView().byId("add_vhcl_vno").setValueState("None");
                    }

                    if (!vName) {
                        this.getView().byId("add_vhcl_vname").setValueState("Error");
                    } else {
                        this.getView().byId("add_vhcl_vname").setValueState("None");
                    }

                    // if (!vType) {
                    //     this.getView().byId("add_vhcl_vtyp").setValueState("Error");
                    // } else {
                    //     this.getView().byId("add_vhcl_vtyp").setValueState("None");
                    // }

                    if (!noSeats) {
                        this.getView().byId("add_vhcl_vseats").setValueState("Error");
                    } else {
                        this.getView().byId("add_vhcl_vseats").setValueState("None");
                    }

                    MessageToast.show("All fields need to be filled");
                    return;
                }

                else {
                    this.getView().byId("add_vhcl_vno").setValueState("None");
                    this.getView().byId("add_vhcl_vname").setValueState("None");
                    // this.getView().byId("add_vhcl_vtyp").setValueState("None");
                    this.getView().byId("add_vhcl_vseats").setValueState("None");
                }


                if (!vehicleNumberPattern.test(vNo)) {
                    this.getView().byId("add_vhcl_vno").setValueState("Error");
                    MessageToast.show("Invalid Vehicle No ");
                    return;
                } else {
                    this.getView().byId("add_vhcl_vno").setValueState("None");
                }


                if (!namePattern.test(vName)) {
                    this.getView().byId("add_vhcl_vname").setValueState("Error").setValueText("invalid name");
                    MessageToast.show("Vehicle name should be atleast 3");
                    return;
                } else {
                    this.getView().byId("add_vhcl_vname").setValueState("None");
                }


                if (isNaN(noSeats) || 7 > noSeats <= 0) {
                    this.getView().byId("add_vhcl_vseats").setValueState("Error");
                    MessageToast.show("add valid seats");
                    return;
                } else {
                    this.getView().byId("add_vhcl_vseats").setValueState("None");
                }

                var oAdd = {
                    "VehicleNumber": vNo,
                    "ProviderId": this.pId,
                    "VehicleName": vName,
                    "VehicleType": vType,
                    "NoOfSeats": noSeats
                };
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Adding vehicle details...",
                    text: "Hang on ...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialog.open();
                debugger;
                oDataModel.create("/VehicleSet", oAdd, {
                    success: function (oResponse) {
                        oBusyDialog.close();
                        MessageToast.show("Vehicle added successfully");
                    }.bind(this),
                    error: function (oError) {
                        oBusyDialog.close();
                        MessageToast.show("Error adding the vehicle: " + oError.message);
                    }.bind(this)
                });
            },
            onAddStop: function () {
                check++;
                oStop++;
                if (check < 7) {
                    var oInput = new sap.m.Input({
                        placeholder: "Stop" + oStop,
                        id: "stop" + oStop,
                        width: "40%"
                    });
                    this.getView().byId("add_trip_vbox2").addItem(oInput);
                }
                else {
                    MessageToast.show("Maximum stops")
                }
            },
            onAddTrip: function () {
                debugger;
                var oTripModel = this.getOwnerComponent().getModel();
                var TripDate = this.getView().byId("add_trip_date").getDateValue();
                var Triptime = this.getView().byId("add_trip_time").getDateValue();
                var TripFrom = this.getView().byId("add_trip_from").getValue();
                var TripTo = this.getView().byId("add_trip_to").getValue();
                var vno = this.getView().byId("add_trip_vno").getValue();
                var noSeats = parseInt(this.getView().byId("add_trip_vseats").getValue());
                var currentDate = new Date();
                var stop = '';
                var vehicleNumberPattern = /^[A-Z0-9]{5,10}$/;
                var namePattern = /^[A-Za-z\s]{3,15}$/;
                var that = this;
                debugger;


                if (!TripDate || !Triptime || !TripFrom || !TripTo || !vno || !noSeats) {
                    if (!TripTo) {
                        this.getView().byId("add_trip_date").setValueState("Error");
                    } else {
                        this.getView().byId("add_trip_date").setValueState("None");
                    }

                    if (!Triptime) {
                        this.getView().byId("add_trip_time").setValueState("Error");
                    } else {
                        this.getView().byId("add_trip_time").setValueState("None");
                    }

                    if (!TripFrom) {
                        this.getView().byId("add_trip_from").setValueState("Error");
                    } else {
                        this.getView().byId("add_trip_from").setValueState("None");
                    }

                    if (!TripTo) {
                        this.getView().byId("add_trip_to").setValueState("Error");
                    } else {
                        this.getView().byId("add_trip_to").setValueState("None");
                    }
                    if (!vno) {
                        this.getView().byId("add_trip_vno").setValueState("Error");
                    } else {
                        this.getView().byId("add_trip_vno").setValueState("None");
                    }
                    if (!noSeats) {
                        this.getView().byId("add_trip_vseats").setValueState("Error");
                    } else {
                        this.getView().byId("add_trip_vseats").setValueState("None");
                    }

                    MessageToast.show("All fields need to be filled");
                    return;

                } else {
                    that.getView().byId("add_trip_date").setValueState("None");
                    that.getView().byId("add_trip_time").setValueState("None");
                    that.getView().byId("add_trip_from").setValueState("None");
                    that.getView().byId("add_trip_to").setValueState("None");
                    that.getView().byId("add_trip_vno").setValueState("None");
                    that.getView().byId("add_trip_vseats").setValueState("None");
                }



                if (TripDate.getFullYear()<=currentDate.getFullYear() 
                      && TripDate.getMonth() <= currentDate.getMonth() 
                      && TripDate.getDate() < currentDate.getDate())
                 { 
                    this.getView().byId("add_trip_date").setValueState("Error");
                    MessageToast.show("Add Valid Date");
                    return;
                }else { 
                    this.getView().byId("add_trip_date").setValueState("None");
                }
                debugger
                if (
                    TripDate.getFullYear() === currentDate.getFullYear() &&
                    TripDate.getMonth() === currentDate.getMonth() &&
                    TripDate.getDate() === currentDate.getDate()
                ) {
                    var selectedTime = Triptime.getHours() * 60 + Triptime.getMinutes();
                    var currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();


                    if (selectedTime < currentTime) {
                        this.getView().byId("add_trip_time").setValueState("Error");
                        MessageToast.show("Add Valid Time");
                        return;
                    } else {
                        this.getView().byId("add_trip_time").setValueState("None");
                    }
                }

                if (!namePattern.test(TripFrom)) {
                    this.getView().byId("add_trip_from").setValueState("Error");
                    MessageToast.show("Add Valid place");
                    return;
                } else {
                    this.getView().byId("add_trip_from").setValueState("None");
                }
                if (!namePattern.test(TripTo)) {
                    this.getView().byId("add_trip_to").setValueState("Error");
                    MessageToast.show("Add Valid place");
                    return;
                } else {
                    this.getView().byId("add_trip_to").setValueState("None");
                }
                if (!vehicleNumberPattern.test(vno)) {
                    this.getView().byId("add_trip_vno").setValueState("Error");
                    MessageToast.show("Add valid Vehicle no");
                    return;
                } else {
                    this.getView().byId("add_trip_vno").setValueState("None");
                }
                if (isNaN(noSeats) || noSeats <= 0) {
                    this.getView().byId("add_trip_vseats").setValueState("Error");
                    MessageToast.show("Add Valid Seats");
                    return;
                } else {
                    this.getView().byId("add_trip_vseats").setValueState("None");
                }



                var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({ pattern: "PTHH'H'mm'M'ss'S'" });
                var convTime = timeFormat.format(new Date(Triptime));

                TripDate.setDate(TripDate.getDate() + 1);

                var stops = this.getView().byId("add_trip_vbox2").getItems();

                for (var i = 0; i < stops.length; i++) {
                    stop = stop + ',' + stops[i].getValue();

                }
                stop = stop + ',';



                var oAddtrip = {
                    "VehicleNo": vno,
                    "ProviderId": this.pId,
                    "TripDate": TripDate,
                    "TripTime": convTime,
                    "FromLocation": TripFrom,
                    "ToLocation": TripTo,
                    "SeatsProvided": noSeats,
                    "Stops": stop
                };
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Creating Trip...",
                    text: "Hang on ...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialog.open();
                oTripModel.create("/Trip_DetailsSet", oAddtrip, {
                    success: function (oResponse) {
                        oBusyDialog.close();
                        this.getView().byId("add_trip_date").setValue("");
                        this.getView().byId("add_trip_time").setValue("");
                        this.getView().byId("add_trip_from").setValue("");
                        this.getView().byId("add_trip_to").setValue("");
                        this.getView().byId("add_trip_vno").setValue("");
                        this.getView().byId("add_trip_vseats").setValue("");
                        MessageToast.show("Trip Created successfully");
                    }.bind(this),
                    error: function (oError) {
                        oBusyDialog.close();
                        MessageToast.show("Error in creating Trip: " + oError.message);
                    }.bind(this)
                });
            },
            onReadTrips: function () {
                var oTripsModel = this.getOwnerComponent().getModel();
                var oJsonModel = new sap.ui.model.json.JSONModel();
                var oFilter = new sap.ui.model.Filter({
                    path: "ProviderId",
                    operator: "EQ",
                    value1: this.pId
                });
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading Data",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialog.open();
                oTripsModel.read("/Trip_DetailsSet", {
                    filters: [oFilter],
                    success: function (oResponse) {
                        oJsonModel.setProperty("/Trips", oResponse.results);
                        this.getView().setModel(oJsonModel, "oTripsJsonModel");
                        oBusyDialog.close();
                    }.bind(this),
                    error: function (oError) {
                        oBusyDialog.close();
                    }.bind(this)
                });
            },
            changeDate: function (oEvent) {
                var oDatePicker = oEvent.getSource();
                var currentDate = new Date();
                var selectedDate = oDatePicker.getDateValue();
            
                if (!selectedDate) {
                    
                    oDatePicker.setDateValue(this.firstSelectedDate); 
                }
            
                if (!this.firstSelectedDate) {
                   
                    this.firstSelectedDate = selectedDate;
                } else {
                    if (selectedDate < currentDate) {
                       
                        MessageToast.show("Invalid Date. Please select a future date.");
                        
                        oDatePicker.setDateValue(this.firstSelectedDate);
                    }
                }
            },
            
            onTripIdPress: function (oEvent) {
                debugger;
                var tripId = oEvent.oSource.mProperties.text
                var that = this;
                var oTripDetailsModel = this.getOwnerComponent().getModel();
                var oBusyDialogT = new sap.m.BusyDialog({
                    title: "Fetching trip details",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialogT.open();
                oTripDetailsModel.read("/Trip_DetailsSet(TripId='" + tripId + "')", {
                    success: function (oResponse) {
                        debugger;
                        console.log(oResponse.TripTime);
                        oBusyDialogT.close();
                        if (!that.oDialog) {
                            Fragment.load({
                                id: "trip_details",
                                name: "com.applexus.commutecompanion.fragment.tripdetails",
                                controller: that
                            }).then(function (oDialog) {
                                that.oDialog = oDialog;
                                that.getView().addDependent(oDialog);
                                that.oDialog.setModel(new sap.ui.model.json.JSONModel({
                                    "oTripDetails": oResponse
                                }), "oTripModel");
                                that.oDialog.open();
                            }.bind(that));
                        }
                        else {
                            that.oDialog.setModel(new sap.ui.model.json.JSONModel({
                                "oTripDetails": oResponse
                            }), "oTripModel");
                            that.oDialog.open();
                        }
                    }
                })
            },
            onCloseTripDetails: function () {
                this.oDialog.close();
            },
            onCancelTrip: function (oEvent) {
                var oContexts = oEvent.getSource().getBindingContext("oTripsJsonModel").getObject();
                MessageBox.confirm("Please note that you can only cancel the trip only if no bookings are made for the trip, do you want to continue ?", {
                    title: "Confirm",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            this.checkBookingsForCancel(oContexts);
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });

            },
            onCancel: function (oTrips) {
                var oModel = this.getOwnerComponent().getModel();
                var blockPayload = {
                    "TripId": oTrips.TripId,
                    "TripStatus": "C"
                };
                var oBusyDialogb = new sap.m.BusyDialog({
                    title: "Cancelling Trip",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialogb.open();
                oModel.sDefaultUpdateMethod = "PUT";
                oModel.update("/Trip_DetailsSet(TripId='" + blockPayload.TripId + "')", blockPayload, {
                    success: function () {
                        oBusyDialogb.close();
                        this.onReadTrips();
                    }.bind(this),
                    error: function () {
                        oBusyDialogb.close();
                    }.bind(this)
                });
            },
            onEditTrip: function (oEvent) {
                var oTripContext = oEvent.getSource().getBindingContext("oTripsJsonModel").getObject();
                MessageBox.confirm("Please note that you can only edit the trip details only if no bookings are made for the trip, do you want to continue ?", {
                    title: "Confirm",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            this.checkBookings(oTripContext);
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });
            },
            checkBookings: function (oTripData) {
                var oModel = this.getOwnerComponent().getModel();
                var tripId = oTripData.TripId;
                var oBusyDialogCb = new sap.m.BusyDialog({
                    title: "Checking for bookings",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialogCb.open();
                oModel.read("/Booking_DetailsSet", {
                    filters: [new sap.ui.model.Filter("TripId", sap.ui.model.FilterOperator.EQ, tripId)],
                    success: function (oResponse) {

                        if (oResponse.results.length > 0) {
                            oBusyDialogCb.close();
                            MessageBox.error("Bookings are already made for this trip. Editing/Cancelling is not allowed.");
                        } else {
                            oBusyDialogCb.close();
                            this.editTrip(oTripData);
                        }
                    }.bind(this),
                    error: function (oError) {
                        oBusyDialogCb.close();
                        MessageBox.error("Error checking bookings: " + oError.message);
                    }
                });
            },
            editTrip: function (oTrip) {
                debugger;
                oTrip.TripStatus = "U";
                if (!this.editDialog) {
                    Fragment.load({
                        id: "edit_trip",
                        name: "com.applexus.commutecompanion.fragment.edittrip",
                        controller: this
                    }).then(function (editDialog) {
                        this.editDialog = editDialog;
                        this.editDialog.setModel(new sap.ui.model.json.JSONModel({
                            "oEditTripPayload": oTrip
                        }), "oEditTripPayloadModel");
                        this.getView().addDependent(this.editDialog);
                        this.editDialog.open();
                    }.bind(this));
                }
                else {
                    this.editDialog.setModel(new sap.ui.model.json.JSONModel({
                        "oEditTripPayload": oTrip
                    }), "oEditTripPayloadModel");
                    this.getView().addDependent(this.editDialog);
                    this.editDialog.open();
                }
                Fragment.byId("edit_trip", "edit_trip_date").setMinDate(new Date());
            },
            onSaveEditedTrip: function () {
                debugger;
                var oTripEditModel = this.getOwnerComponent().getModel();
                var oTripEditedData = this.editDialog.getModel("oEditTripPayloadModel").getProperty("/oEditTripPayload");
                var editedTimeFormat = sap.ui.core.format.DateFormat.getTimeInstance({ pattern: "PTHH'H'mm'M'ss'S'" });
                var editedConvTime = editedTimeFormat.format(new Date(Fragment.byId("edit_trip", "edit_trip_time").getDateValue()));

                oTripEditedData.TripDate = Fragment.byId("edit_trip", "edit_trip_date").getDateValue();
                oTripEditedData.TripDate.setDate(oTripEditedData.TripDate.getDate() + 1);
                oTripEditedData.TripTime = editedConvTime;
                oTripEditedData.VehicleNo = Fragment.byId("edit_trip", "vehcl_no").getValue();

                var oEditTripBusyDialog = new sap.m.BusyDialog({
                    title: "Updating trip details",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oEditTripBusyDialog.open();
                oTripEditModel.sDefaultUpdateMethod = "PUT";
                oTripEditModel.update("/Trip_DetailsSet(TripId='" + oTripEditedData.TripId + "')", oTripEditedData, {
                    success: function () {
                        oEditTripBusyDialog.close();
                        MessageToast.show("Trip Edited successfully");
                        this.onReadTrips();
                    }.bind(this),
                    error: function (oError) {
                        oEditTripBusyDialog.close();
                    }.bind(this)
                });
            },
            onCloseEditTripDetails: function () {
                this.editDialog.close();
            },
            onSelectTrip: function (oEvent) {
                if (this.getView().byId("tb_my_trips").getSelectedItem() !== null) {
                    var oBookContext = this.getView().byId("tb_my_trips").getSelectedItem().getBindingContext("oTripsJsonModel").getObject();
                    var tripId = oBookContext.TripId;
                    this.router.navTo("RouteTripBooking", { tripId });
                }
            },
            onLogoutPress: function () {
                MessageBox.confirm("Are you sure want to logout ?", {
                    title: "Confirm",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            debugger;
                            this.router.navTo("RouteLogin", {}, true);
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });
            },
            checkBookingsForCancel: function (oTripData) {
                var oModel = this.getOwnerComponent().getModel();
                var tripId = oTripData.TripId;
                var oBusyDialogCb = new sap.m.BusyDialog({
                    title: "Checking for bookings",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialogCb.open();
                oModel.read("/Booking_DetailsSet", {
                    filters: [new sap.ui.model.Filter("TripId", sap.ui.model.FilterOperator.EQ, tripId)],
                    success: function (oResponse) {

                        if (oResponse.results.length > 0) {
                            oBusyDialogCb.close();
                            MessageBox.error("Bookings are already made for this trip. Editing/Cancelling is not allowed.");
                        } else {
                            oBusyDialogCb.close();
                            this.onCancel(oTripData);
                        }
                    }.bind(this),
                    error: function (oError) {
                        oBusyDialogCb.close();
                        MessageBox.error("Error checking bookings: " + oError.message);
                    }
                });
            },
            handleValueHelp: function (oEvent) {
                debugger;
                var that = this;
                this.selectedField = oEvent.getSource();
                var oView = this.getView();
                if (!this.oValueHelpDialog) {
                    this.oValueHelpDialog = Fragment.load({
                        id: "vehicle",
                        name: "com.applexus.commutecompanion.fragment.vehicleselectdialog",
                        controller: this
                    }).then(function (oValueHelp) {
                        oView.addDependent(oValueHelp);
                        var oVehicleModel = that.getOwnerComponent().getModel();
                        var oVehicleJsonModel = new sap.ui.model.json.JSONModel();
                        var oVehicleFilter = new sap.ui.model.Filter({
                            path: "ProviderId",
                            operator: "EQ",
                            value1: that.pId
                        });
                        oVehicleModel.read("/VehicleSet", {
                            filters: [oVehicleFilter],
                            success: function (oResponse) {
                                oVehicleJsonModel.setProperty("/Vehicles", oResponse.results);
                                that.getView().setModel(oVehicleJsonModel, "oVehicleModel");
                            }.bind(that),
                            error: function (oError) {
                            }.bind(that)
                        });
                        oValueHelp.bindAggregation("items", {
                            path: 'oVehicleModel>/Vehicles',
                            template: new sap.m.DisplayListItem({
                                label: "{oVehicleModel>VehicleNumber}",
                                value: "{oVehicleModel>VehicleName}"
                            })
                        })
                        oValueHelp.open();
                    });
                }
                else {
                    // this.oValueHelpDialog.then(function(oValueHelp) {
                        // oView.addDependent(oValueHelp);
                        var oVehicleModel = that.getOwnerComponent().getModel();
                        var oVehicleJsonModel = new sap.ui.model.json.JSONModel();
                        var oVehicleFilter = new sap.ui.model.Filter({
                            path: "ProviderId",
                            operator: "EQ",
                            value1: that.pId
                        });
                        oVehicleModel.read("/VehicleSet", {
                            filters: [oVehicleFilter],
                            success: function (oResponse) {
                                oVehicleJsonModel.setProperty("/Vehicles", oResponse.results);
                                that.getView().setModel(oVehicleJsonModel, "oVehicleModel");
                            }.bind(that),
                            error: function (oError) {
                            }.bind(that)
                        });
                        // oValueHelp.bindAggregation("items", {
                        //     path: 'oVehicleModel>/Vehicles',
                        //     template: new sap.m.DisplayListItem({
                        //         label: "{oVehicleModel>VehicleNumber}",
                        //         value: "{oVehicleModel>VehicleName}"
                        //     })
                        // })
                        // oValueHelp.open();
                        Fragment.byId("vehicle","sd1").open();
                    // });
                }
            },
            onConfirmVehicle: function (oEvent) {
                debugger;
                var sId = oEvent.getSource().getId();
                if (sId.indexOf("vehicle !=== -1")) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    var oItem = oSelectedItem.mProperties.label;
                    this.selectedField.setValue(oItem);
                }
            }
        });
    });
