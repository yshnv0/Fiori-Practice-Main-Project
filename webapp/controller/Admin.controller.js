sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, formatter, MessageBox, History) {
        "use strict";
        var oJsonModel;

        return Controller.extend("com.applexus.commutecompanion.controller.Admin", {
            customFormatter: formatter,
            onInit: function () {
                this.router = this.getOwnerComponent().getRouter();
                oJsonModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(oJsonModel, "oRequestsJsonModel");
            },
            onSelectChanged: function (oEvent) {
                var key = oEvent.getParameters().key;
                if (key === 'req') {
                    this.onReadRequest();
                }
                else if (key === 'user') {
                    this.onReadUsers();
                }
                else if (key === 'ldb') {
                    this.onLeaderboard();
                }
                else if (key === 'logout') {
                    this.onLogoutPress();
                }
            },
            onReadRequest: function () {
                var oDataModel = this.getOwnerComponent().getModel();
                
                var oFilter = new sap.ui.model.Filter({
                    path: "Flag",
                    operator: "EQ",
                    value1: "R"
                });
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading Data",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialog.open();
                oDataModel.read("/Registered_UserSet", {
                    filters: [oFilter],
                    success: function (oResponse) {
                        oJsonModel.setProperty("/Requests", oResponse.results);
                        
                        oBusyDialog.close();
                    }.bind(this),
                    error: function (oError) {
                        oBusyDialog.close();
                    }.bind(this)
                });
            },
            onApprove: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext("oRequestsJsonModel").getObject();
                MessageBox.confirm("Are you sure want to approve this user ?", {
                    title: "Confirm",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            this.onApproveUser(oContext);
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });
            },
            onApproveUser: function (oUser) {
                var oDataModel = this.getOwnerComponent().getModel();
                var updatePayload = {
                    "UserId": oUser.UserId,
                    "Status": "A"
                };
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Accepting user",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialog.open();
                oDataModel.sDefaultUpdateMethod = "PUT";
                oDataModel.update("/User_StatusSet(UserId='" + updatePayload.UserId + "')", updatePayload, {
                    success: function () {
                        oBusyDialog.close();
                        this.onReadRequest();
                    }.bind(this),
                    error: function () {
                        oBusyDialog.close();
                    }.bind(this)
                });
            },
            onReject: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext("oRequestsJsonModel").getObject();
                MessageBox.confirm("Are you sure want to reject this user ?", {
                    title: "Confirm",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            this.onRejectUser(oContext);
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });
            },
            onRejectUser: function (oUser) {
                var oDataModel = this.getOwnerComponent().getModel();
                var updatePayload = {
                    "UserId": oUser.UserId,
                    "Status": "B"
                };
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Rejecting user",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialog.open();
                oDataModel.sDefaultUpdateMethod = "PUT";
                oDataModel.update("/User_StatusSet(UserId='" + updatePayload.UserId + "')", updatePayload, {
                    success: function () {
                        oBusyDialog.close();
                        this.onReadRequest();
                    }.bind(this),
                    error: function () {
                        oBusyDialog.close();
                    }.bind(this)
                });
            },
            onReadUsers: function () {
                var oDataModels = this.getOwnerComponent().getModel();
                var oJsonModels = new sap.ui.model.json.JSONModel();
                var oFilters = new sap.ui.model.Filter({
                    path: "Flag",
                    operator: "EQ",
                    value1: "U"
                });
                var oBusyDialogs = new sap.m.BusyDialog({
                    title: "Loading Data",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialogs.open();
                oDataModels.read("/Registered_UserSet", {
                    filters: [oFilters],
                    success: function (oResponse) {
                        oJsonModels.setProperty("/Users", oResponse.results);
                        this.getView().setModel(oJsonModels, "oUsersJsonModel");
                        oBusyDialogs.close();
                    }.bind(this),
                    error: function (oError) {
                        oBusyDialogs.close();
                    }.bind(this)
                });
            },
            onBlock: function (oEvent) {
                var oContexts = oEvent.getSource().getBindingContext("oUsersJsonModel").getObject();
                MessageBox.confirm("Are you sure want to block this user ?", {
                    title: "Confirm",
                    onClose: function (sAction) {
                        if (sAction === 'OK') {
                            this.onBlockUser(oContexts);
                        }
                    }.bind(this),
                    actions: [sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });
            },
            onBlockUser: function (oUsers) {
                var oModel = this.getOwnerComponent().getModel();
                var blockPayload = {
                    "UserId": oUsers.UserId,
                    "Status": "C"
                };
                var oBusyDialogb = new sap.m.BusyDialog({
                    title: "Rejecting user",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialogb.open();
                oModel.sDefaultUpdateMethod = "PUT";
                oModel.update("/User_StatusSet(UserId='" + blockPayload.UserId + "')", blockPayload, {
                    success: function () {
                        oBusyDialogb.close();
                        this.onReadUsers();
                    }.bind(this),
                    error: function () {
                        oBusyDialogb.close();
                    }.bind(this)
                });
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
            onLeaderboard: function () {
                var oPointsModel = this.getOwnerComponent().getModel();
                var oPointsJsonModel = new sap.ui.model.json.JSONModel();
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading leaderboard",
                    text: "Hang on...",
                    customIcon: "../css/loading.png",
                    customIconRotationSpeed: 3000
                });
                oBusyDialog.open();
                oPointsModel.read("/User_PointsSet", {
                    success: function (oResponse) {
                        oPointsJsonModel.setProperty("/Points", oResponse.results);
                        this.getView().setModel(oPointsJsonModel, "oPointsModel");
                        oBusyDialog.close();
                    }.bind(this),
                    error: function (oError) {
                        oBusyDialog.close();
                    }.bind(this)
                });
            }
        });
    });
