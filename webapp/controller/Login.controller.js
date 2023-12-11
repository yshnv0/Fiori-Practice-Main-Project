sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, MessageToast, MessageBox) {
        "use strict";
        var userId;
        var router;
        var userRole;
        return Controller.extend("com.applexus.commutecompanion.controller.Login", {
            onInit: function () {
                router = this.getOwnerComponent().getRouter();


            },



            onRegisterPress: function () {
                router.navTo("RouteReg");
            },
            onLogin: function () {
                debugger;
                var that = this;
                userId = this.getView().byId("userid").getValue();
                var passwd = this.getView().byId("password").getValue();
                var oDataModel = this.getOwnerComponent().getModel();
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Checking credentials",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialog.open();
                oDataModel.read("/User_LoginSet(UserId='" + userId + "',Password='" + passwd + "')", {
                    success: function (oResponse) {
                        debugger;
                        userRole = oResponse.UserRole;
                        oBusyDialog.close();
                        // if(userId === oResponse.UserId && passwd === oResponse.Password){
                        if (oResponse.UserRole === "A") {
                            that.getView().byId("userid").setValue("");
                            that.getView().byId("password").setValue("");
                            router.navTo("RouteAdmin", { userId });
                        }
                        else {
                            if (!that.oDialog) {
                                Fragment.load({
                                    id: "role",
                                    name: "com.applexus.commutecompanion.fragment.selectrole",
                                    controller: that
                                }).then(function (oDialog) {
                                    that.oDialog = oDialog;
                                    that.getView().addDependent(that.oDialog);
                                    that.oDialog.open();
                                }.bind(that));
                            }
                            else {
                                that.oDialog.open();
                            }
                        }
                        // }
                        // else{
                        //     oBusyDialog.close();
                        //      MessageToast.show("Invalid credentials.");
                        //      that.getView().byId("userid").setValueState("Error");
                        //      that.getView().byId("password").setValueState("Error");
                        // }

                    },

                    error: function (oError) {
                        oBusyDialog.close();
                        var obj = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error(obj);
                        that.getView().byId("userid").setValue("");
                        that.getView().byId("password").setValue("");
                    }
                });
            },
            onProviderSelect: function () {
                console.log(userRole);
                var that = this;
                var oPointsModel = this.getOwnerComponent().getModel();
                var oBusyDialogL = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialogL.open();
                oPointsModel.read("/User_PointsSet(UserId='" + userId + "',UserRole='P')", {
                    success: function (oPoints) {
                        debugger;
                        if(oPoints.UserPoints < -30) {
                            oBusyDialogL.close();
                            MessageBox.error("You don't have enough points to access your account");
                        }
                        else {
                            that.checkLicenseDetails();
                        }
                    },
                    error: function() {
                        oBusyDialogL.close();
                    }
                });
            },
            onSeekerSelect: function () {
                this.getView().byId("userid").setValue("");
                this.getView().byId("password").setValue("");
                var that = this;
                var oPointsModel = this.getOwnerComponent().getModel();
                var oBusyDialogL = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialogL.open();
                oPointsModel.read("/User_PointsSet(UserId='" + userId + "',UserRole='S')", {
                    success: function (oPoints) {
                        debugger;
                        if(oPoints.UserPoints < -20) {
                            oBusyDialogL.close();
                            MessageBox.error("You don't have enough points to access your account");
                        }
                        else {
                            router.navTo("RouteSeeker", { userId });
                        }
                    },
                    error: function() {
                        oBusyDialogL.close();
                    }
                });
            },
            oNCancel: function () {
                this.oDialog.close();

            },
            checkLicenseDetails: function () {
                var that1 = this;
                var oLicenseModel = this.getOwnerComponent().getModel();
                var oBusyDialogL = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialogL.open();
                oLicenseModel.read("/License_DetailsSet(UserId='" + userId + "')", {
                    success: function (oLicense) {
                        console.log(oLicense);
                        if (oLicense.LicenceNumber == '' || oLicense.LicenceValididty == '') {
                            if (!that1.oDialogL) {
                                Fragment.load({
                                    id: "no_lic",
                                    name: "com.applexus.commutecompanion.fragment.nolicence",
                                    controller: that1
                                }).then(function (oDialogL) {
                                    that1.oDialogL = oDialogL;
                                    that1.getView().addDependent(that1.oDialogL);
                                    that1.oDialogL.open();
                                    oBusyDialogL.close();
                                }.bind(that1));
                            }
                            else {
                                that1.oDialogL.open();
                            }
                        }
                        else {
                            that1.getView().byId("userid").setValue("");
                            that1.getView().byId("password").setValue("");
                            router.navTo("RouteProvider", { userId });
                            oBusyDialogL.close();
                        }
                    }
                });
            },
            onAddLicence: function () {
                if (!this.oDialogLA) {
                    Fragment.load({
                        id: "add_lic",
                        name: "com.applexus.commutecompanion.fragment.addlicence",
                        controller: this
                    }).then(function (oDialogLA) {
                        this.oDialogLA = oDialogLA;
                        this.getView().addDependent(this.oDialogLA);
                        this.oDialogLA.open();
                    }.bind(this));
                }
                else {
                    this.oDialogLA.open();
                }
            },
            onCancel: function () {
                this.oDialogL.close();
                this.oDialogLA.close()
            },
            onSaveLicence: function () {

                var oLicenseModels = this.getOwnerComponent().getModel();
                var licNo = Fragment.byId("add_lic", "add_lic_lno").getValue();
                var licVal = Fragment.byId("add_lic", "add_lic_lval").getDateValue();
                var licensePattern = /^[A-Z]{2}\d{2}\d{4}\d{5}$/;
                var currentDate = new Date();
                var that = this;
                if (!licNo || !licVal) {

                    if (!licNo) {
                        Fragment.byId("add_lic", "add_lic_lno").setValueState("Error");
                    } else {
                        Fragment.byId("add_lic", "add_lic_lno").setValueState("None");
                    }

                    if (!licVal) {
                        Fragment.byId("add_lic", "add_lic_lval").setValueState("Error");
                    } else {
                        Fragment.byId("add_lic", "add_lic_lval").setValueState("None");
                    }

                    MessageToast.show("All fields need to be filled");
                    return;
                }

                else {
                    Fragment.byId("add_lic", "add_lic_lno").setValueState("None");
                    Fragment.byId("add_lic", "add_lic_lval").setValueState("None");

                }

                if (!licensePattern.test(licNo)) {
                    Fragment.byId("add_lic", "add_lic_lno").setValueState("Error");
                    MessageToast.show("Invalid license no");
                    return;
                } else {
                    Fragment.byId("add_lic", "add_lic_lno").setValueState("None");
                }

                if (licVal.getFullYear() <= currentDate.getFullYear()
                    && licVal.getMonth() <= currentDate.getMonth()
                    && licVal.getDate() < currentDate.getDate()) {
                    Fragment.byId("add_lic", "add_lic_lval").setValueState("Error");
                    MessageToast.show("Your licence has expired");
                    return;
                } else {
                    Fragment.byId("add_lic", "add_lic_lval").setValueState("None");
                }

                // if (licVal<currentDate)  {
                //     Fragment.byId("add_lic","add_lic_lval").setValueState("Error");
                //     MessageToast.show("Invalid Date");
                //     return; 
                // } else {
                //     Fragment.byId("add_lic","add_lic_lval").setValueState("None");
                // }
                var licencePayload = {
                    "UserId": userId,
                    "LicenceNumber": licNo,
                    "LicenceValidity": licVal
                };
                var oBusyDialogLU = new sap.m.BusyDialog({
                    title: "Adding licence details",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialogLU.open();
                oLicenseModels.sDefaultUpdateMethod = "PUT";
                oLicenseModels.update("/License_DetailsSet(UserId='" + userId + "')", licencePayload, {
                    success: function () {
                        oBusyDialogLU.close();
                        that.getView().byId("userid").setValue("");
                        that.getView().byId("password").setValue("");
                        router.navTo("RouteProvider", { userId });
                        oBusyDialogLU.close();
                    },
                    error: function (oErrorResponse) {
                        that.getView().byId("userid").setValue("");
                        that.getView().byId("password").setValue("");
                        oBusyDialogLU.close();
                    }
                })
            }
        });
    });
