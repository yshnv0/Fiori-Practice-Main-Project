sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,MessageToast, MessageBox) {
        "use strict";
        var emplId;

        return Controller.extend("com.applexus.commutecompanion.controller.Registration", {
            onInit: function () {
                this.router = this.getOwnerComponent().getRouter();
                this.byId("licval").setMinDate(new Date());
            },
            onLoginPress: function() {
                this.router.navTo("RouteLogin");
            },
            onRegister: function() {
                var oDataModel = this.getOwnerComponent().getModel();
                
                var empId      = this.getView().byId("empid").getValue();
                var fName      = this.getView().byId("firstname").getValue();
                var lName      = this.getView().byId("lastname").getValue();
                var email      = this.getView().byId("email").getValue();
                var phNo       = this.getView().byId("phno").getValue();
                var licNo      = this.getView().byId("licenceno").getValue();
                var licVal     = this.getView().byId("licval").getDateValue();
                var password   = this.getView().byId("pass").getValue();
                var cPswd      = this.getView().byId("cpass").getValue();

                var namePattern = /^[A-Za-z]{3,15}$/;
                var phNoPattern = /^\d{10}$/;
                var emailPattern = /^[^\s@]+@applexus\.com$/;
                var licensePattern = /^[A-Z]{2}\d{2}\d{4}\d{5}$/; 
                var that = this;
                 
                // var oBusyDialog = new sap.m.BusyDialog({
                //     title: "Checking employee id",
                //     text: "Hang on...",
                //     customIcon: "../css/loading.png",
                //     customIconRotationSpeed: 3000
                // });
                // oBusyDialog.open();

                // if(empId) {
                //     debugger;
                //     oDataModel.read("/EmpIdSet(EmployeeId='" + empId + "')", {
                //         success: function(oResponse) {
                //             debugger;
                //             // debugger;
                //             // console.log(oResponse);
                //             if(oResponse.EmployeeId > 0) {
                //                 debugger;
                //                 this.emplId = oResponse.EmployeeId;
                //                 // MessageBox.error("Employee id already exists");
                //                 // that.getView().byId("empid").setValueState("Error");
                //             }
                //             else{
                //                 this.emplId = "";
                //             }
                //             that.getView().byId("empid").setValueState("None");
                //             // oBusyDialog.close();
                //         }.bind(that),
                //         error: function(oError) {
                //             // debugger;
                //             // MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                //             // that.getView().byId("empid").setValueState("Error");
                //             // oBusyDialog.close();
                //         }.bind(that)
                //     });
                // }
                if (!empId || !/^\d{5}$/.test(empId) ){
                    this.getView().byId("empid").setValueState("Error");
                    MessageToast.show("Employee id must be 5 digits long.");
                }
                else {
                    this.getView().byId("empid").setValueState("None");
                }
                // debugger;
                // if (this.emplId > 0){
                //     debugger;
                //     MessageToast.show("Employee id already registered");
                //     this.getView().byId("empid").setValueState("Error");
                //     return;
                // } else {
                //     debugger;
                //     this.getView().byId("empid").setValueState("None");
                // }
                if (!namePattern.test(fName) ) {
                    this.getView().byId("firstname").setValueState("Error");
                    MessageToast.show("Invalid first name, enter atleast 3 characters");
                    return; 
                } else {
                    this.getView().byId("firstname").setValueState("None");
                }
                if (!namePattern.test(lName) ) {
                    this.getView().byId("lastname").setValueState("Error");
                    MessageToast.show("Invalid last name, enter atleast 3 characters");
                    return; 
                } else {
                    this.getView().byId("lastname").setValueState("None");
                }
                 if (!emailPattern.test(email ) ) {
                    this.getView().byId("email").setValueState("Error");
                    MessageToast.show("Invalid email id");
                    return; 
                } else {
                    this.getView().byId("email").setValueState("None");
                }
                if (!phNoPattern.test(phNo)) {
                    this.getView().byId("phno").setValueState("Error");
                    MessageToast.show("Phone number must be 10 digits long.");
                    return;
                } else {
                    this.getView().byId("phno").setValueState("None");
                }
                if (licNo && !licensePattern.test(licNo ) ){
                    this.getView().byId("licenceno").setValueState("Error");
                    MessageToast.show("Invalid license no");
                    return; 
                } else {
                    this.getView().byId("licenceno").setValueState("None");
                }
                // if (licVal && licVal < new Date(1960, 0, 1) || licVal > new Date(2040, 11, 31))  {
                //     this.getView().byId("licval").setValueState("Error");
                //     MessageToast.show("Invalid Date");
                //     return; 
                // } else {
                //     this.getView().byId("licval").setValueState("None");
                // }
                if (!password || password.length < 8) {
                    this.getView().byId("pass").setValueState("Error");
                    this.getView().byId("pass").setValueStateText("Password must be at least 8 characters long.");
                    MessageToast.show("Password must be at least 8 characters long.")
                    return;
                } else {
                    this.getView().byId("pass").setValueState("None");
                }
                if (password !== cPswd) {
                    this.getView().byId("cpass").setValueState("Error");
                    MessageToast.show("Password does not match.");
                    return; 
                } else {
                    this.getView().byId("cpass").setValueState("None");
                }
                
             
                var oRegister  = {
                    "EmployeeId"     : empId,
                    "FirstName"      : fName,
                    "LastName"       : lName,
                    "Email"          : email,
                    "PhoneNumber"    : phNo,
                    "LicenceNumber"  : licNo,
                    "LicenceValidity": licVal,
                    "Password"       : password
                };
                var oBusyDialog = new sap.m.BusyDialog({
                    title                  : "Registering",
                    text                   : "Hang on ...",
                    customIcon             : "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialog.open();
                oDataModel.create("/User_DetailsSet", oRegister, {
                    success: function(oResponse){
                        debugger;
                        oBusyDialog.close();
                        MessageToast.show("Registered Successfully.Wait for Approval.");
                        this.getView().byId("empid").setValue("");
                        this.getView().byId("firstname").setValue("");
                        this.getView().byId("lastname").setValue("");
                        this.getView().byId("email").setValue("");
                        this.getView().byId("phno").setValue("");
                        this.getView().byId("licenceno").setValue("");
                        this.getView().byId("licval").setValue("");
                        this.getView().byId("pass").setValue("");
                        this.getView().byId("cpass").setValue("");
                        this.router.navTo("RouteLogin");
                    }.bind(this),
                    error: function(oError) {
                        debugger;
                        oBusyDialog.close();
                        var obj = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error(obj);
                    }.bind(this)
                });
            }
        });
    });
