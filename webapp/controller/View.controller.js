sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/core/Fragment'
    
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, Filter, FilterOperator,Fragment) {
        "use strict";

        var sServiceUrl = "/sap/opu/odata/SAP/ZMM_DIESEL_RETORNO_PERDA_SRV";
        var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

        var oRouter;
        var nf;
        var oGlobalBusyDialog = new sap.m.BusyDialog();

        var aFilters = [];

        const REAL = value => currency(value, {
            symbol: '',
            decimal: ',',
            separator: '.'
        });
        

        return Controller.extend("mrs.com.br.zmmdieselnfretorno.controller.View", {
            onInit: function () {
                
            oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            sap.ui.getCore().getConfiguration().setLanguage("pt_BR")
            sap.ui.getCore().getConfiguration().setFormatLocale("pt-BR-x-sapufmt");
            this.getView().setModel(new sap.ui.model.json.JSONModel(), "ViewModel");
            this.getView().getModel("ViewModel").setProperty("/temNF", false);
            this.getView().getModel("ViewModel").setProperty("/semNF", false);
            this.getView().getModel("ViewModel").setProperty("/semNFTable", false);
            this.getView().getModel("ViewModel").setProperty("/titleAndButton", false);

            this.inicializarPostoMC();

            var oTable = this.getView().byId("tableItem");

            oTable.setFixedColumnCount(1);

            oRouter.attachRouteMatched(function (oEvent) {
                var sRouteName, oArgs, oView;

                sRouteName = oEvent.getParameter("name");
                debugger;
                if (sRouteName === "View") {

                    this._onRouteMatched(oEvent);
                }
            }, this);

            },
            _onRouteMatched: function (oEvent) {

                this.inicializarPostoMC();

            },
            montarfiltros: function (){

                aFilters = [];


                var dataInicio = this.getView().byId("dataInicio");
                var dataFim = this.getView().byId("dataFim");
                var cboPosto = this.getView().byId("cboPosto");
                var iptVolume = this.getView().byId("iptVolume");

                if (dataFim.mProperties.value !== "")
                    aFilters.push(new Filter("IvDataFim", FilterOperator.EQ, dataFim.mProperties.value));

                if (dataInicio.mProperties.value !== "")
                    aFilters.push(new Filter("IvDataInicio", FilterOperator.EQ, dataInicio.mProperties.value));

                if (cboPosto.getSelectedKey() !== "")
                    aFilters.push(new Filter("IvPosto", FilterOperator.EQ, cboPosto.getSelectedKey()));
                
                if (iptVolume.getValue() !== "")
                    aFilters.push(new Filter("IvVolume", FilterOperator.EQ, iptVolume.getValue()));

                return aFilters;  
             
            
            },

            montarfiltrosSemNF: function (){

                aFilters = [];


                var dataInicio = this.getView().byId("dataInicio");
                var dataFim = this.getView().byId("dataFim");
                var cboPosto = this.getView().byId("cboPosto");
                var iptVolume = this.getView().byId("iptVolume");
                var iptVolumeGanho = this.getView().byId("iptVolumeGanho");

                if (dataFim.mProperties.value !== "")
                    aFilters.push(new Filter("IvDataFim", FilterOperator.EQ, dataFim.mProperties.value));

                if (dataInicio.mProperties.value !== "")
                    aFilters.push(new Filter("IvDataInicio", FilterOperator.EQ, dataInicio.mProperties.value));

                if (cboPosto.getSelectedKey() !== "")
                    aFilters.push(new Filter("IvPosto", FilterOperator.EQ, cboPosto.getSelectedKey()));
                
                if (iptVolume.getValue() !== "")
                    aFilters.push(new Filter("IvVolume", FilterOperator.EQ, iptVolume.getValue()));

                    if (iptVolumeGanho.getValue() !== "")
                    aFilters.push(new Filter("IvVolumeGanho", FilterOperator.EQ, iptVolumeGanho.getValue()));

                return aFilters;  
             
            
            },

            montarfiltroPosto: function (){

                aFilters = [];
                var that = this;
                var nf;
                var cboPosto = this.getView().byId("cboPosto");

                
                
                if (cboPosto.getSelectedKey() !== "")
                    aFilters.push(new Filter("Posto", FilterOperator.EQ, cboPosto.getSelectedKey()));

                    try {

                        oGlobalBusyDialog.open();
    
                        oModel.read("/PostosSet?$format=json", {
                            filters: aFilters,
                            async: false,
    
                            success: function _OnSuccess(oData, response) {
                               nf = oData.results[0].Nf;
                                oGlobalBusyDialog.close();
                                if(nf == 'X'){
                                    that.getView().getModel("ViewModel").setProperty("/temNF", true);
                                    that.getView().getModel("ViewModel").setProperty("/semNFTable", false);
                                    that.getView().getModel("ViewModel").setProperty("/semNF", true);


                                }else{
                                    that.getView().getModel("ViewModel").setProperty("/semNF", true);
                                    that.getView().getModel("ViewModel").setProperty("/semNFTable", true);
                                    that.getView().getModel("ViewModel").setProperty("/temNF", false);

                                }


                            },
                            error: function _OnError(oError) {
                                oGlobalBusyDialog.close();
    
                            }
                        });
                        
    
                    } catch (ex) {
                        var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
    
                        MessageBox.error(
                            ex.message, {
                            styleClass: bCompact ? "sapUiSizeCompact" : ""
                        }
                        );
                    }

                    return nf; 
            },
            validarFiltros: function (){
                var dataInicio = this.getView().byId("dataInicio");
                var dataFim = this.getView().byId("dataFim");
                var cboPosto = this.getView().byId("cboPosto");
                var isValido = true;
                

                if (dataFim.mProperties.value !== ""){
                    dataFim.setValueState("None");
                    dataFim.setValueStateText("");
                }else{
                    dataFim.setValueState("Error");
                    dataFim.setValueStateText("O campo Data Fim Encerrante é obrigatório!");
                    isValido = false;
                }
                    
                if (dataInicio.mProperties.value !== ""){
                    dataInicio.setValueState("None");
                    dataInicio.setValueStateText("");
                }else{
                    dataInicio.setValueState("Error");
                    dataInicio.setValueStateText("O campo Data Início Encerrante é obrigatório!");
                    isValido = false;
                }
                    
                if (cboPosto.getSelectedKey() !== ""){
                    cboPosto.setValueState("None");
                    cboPosto.setValueStateText("");
                }else{
                    cboPosto.setValueState("Error");
                    cboPosto.setValueStateText("O campo Posto é obrigatório!");
                    isValido = false;
                }
                    
                
                    return isValido;
            },
            onSearch: function (){
            debugger;
            this.clearDados();    
            this.getView().getModel("ViewModel").setProperty("/titleAndButton", true);
            if(this.validarFiltros()){    
            this.carregarCabecalho();    
            }else{
                MessageBox.error("Preencher os campos obrigatórios!")
            }
                

            },
            clearFiltros: function (){
                var dataInicio = this.getView().byId("dataInicio");
                var dataFim = this.getView().byId("dataFim");
                var cboPosto = this.getView().byId("cboPosto");
                var volume = this.getView().byId("iptVolume");
                var volumeGanho = this.getView().byId("iptVolumeGanho");

                dataInicio.setDateValue(null);
                dataFim.setDateValue(null);
                cboPosto.setSelectedKey("")
                volume.setValue("");
                volumeGanho.setValue("");

            },
            clearDados: function (){
                var fornecedor = this.getView().byId("parid");
                var dataDocumento = this.getView().byId("dataDocumento");
                var dataLancamento = this.getView().byId("dataLancamento");
                var empresa = this.getView().byId("empresa");
                var localNegocios = this.getView().byId("branch");
                var moeda = this.getView().byId("waerk");
                var tipoDocumento = this.getView().byId("nftype");
                var direcao = this.getView().byId("direct");
                var modelo = this.getView().byId("model");
                var form = this.getView().byId("form");
                var oTable = this.getView().byId("tableItem");
                var oTableItem = this.getView().byId("tableItemSemNf");
                var referencia = this.getView().byId("referencia");
                
                var blankModel = new sap.ui.model.json.JSONModel();

                
                fornecedor.setText("");
                referencia.setText("");
                dataDocumento.setText("");
                dataLancamento.setText("");
                empresa.setText("");
                localNegocios.setText("");
                moeda.setText("");
                tipoDocumento.setText("");
                direcao.setText("");
                modelo.setText("");
                form.setText("");
                
                blankModel.setData([]);
                oTable.setModel(blankModel);
                oTableItem.setModel(blankModel);
            },
            formatData: function (data){
                return data.substring(6,8) + "/" + data.substring(4,6) + "/" + data.substring(0,4);
                
            },
            onPressGerarNota:function (){

                if(this.validarFiltros()){
                    this.gerarNota();
                }
                
                

            },
            gerarNota:function (){

                var dataInicio = this.getView().byId("dataInicio");
                var dataFim = this.getView().byId("dataFim");
                var cboPosto = this.getView().byId("cboPosto");
                var iptVolume = this.getView().byId("iptVolume");
                var iptVolumeGanho = this.getView().byId("iptVolumeGanho");

                var that = this;

                var entry = {};
                entry.Posto = cboPosto.getSelectedKey();
                entry.DataInicio=  dataInicio.mProperties.value;
                entry.DataFim =  dataFim.mProperties.value;
                entry.Volume = iptVolume.getValue();
                entry.Ganho = iptVolumeGanho.getValue();
                

                oModel.create("/NotaSet", entry, {
                    method: "POST",
                    success: function(data, response) {
                        debugger;
                        MessageBox.success("Dados enviados para emissão de NF-e!");
                        that.clearFiltros();
                        that.clearDados();                        
                        
                    },
                    error: function(oEvent) {
                        debugger;
                        var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
					var message = JSON.parse(oEvent.response.body);
					var details = "";

					if (message.error.innererror.errordetails.length !== 0) {
						for (var k = 0; k < message.error.innererror.errordetails.length; k++) {
							if (message.error.innererror.errordetails[k].severity === "error") {
								if (message.error.innererror.errordetails[k].code !== "/IWBEP/CX_MGW_BUSI_EXCEPTION") {
									details = details + "<li>" + message.error.innererror.errordetails[k].message + "</li>";
								}

							}

						}
					} else {
						details = message.error.message.value;
					}

					MessageBox.show("Erro", {
						icon: MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.CLOSE],
						id: "messageBoxId2",
						details: details,
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						contentWidth: "100px"
					});
                    }
                });
            },

            carregarCabecalho: function (){

                nf =  this.montarfiltroPosto();
                var fornecedor = this.getView().byId("parid");
                var dataDocumento = this.getView().byId("dataDocumento");
                var dataLancamento = this.getView().byId("dataLancamento");
                var empresa = this.getView().byId("empresa");
                var localNegocios = this.getView().byId("branch");
                var moeda = this.getView().byId("waerk");
                var tipoDocumento = this.getView().byId("nftype");
                var direcao = this.getView().byId("direct");
                var modelo = this.getView().byId("model");
                var form = this.getView().byId("form");
                var referencia = this.getView().byId("referencia");


                var that = this;
                
                if(nf === 'X'){

                    try {

                        var aFilters = this.montarfiltros();
                        
                        oGlobalBusyDialog.open();

                        oModel.read("/NfHeaderSet?$format=json", {
                            filters: aFilters,
                            async: true,

                            success: function _OnSuccess(oData, response) {

                                fornecedor.setText(oData.results[0].Parid);
                                dataDocumento.setText(that.formatData(oData.results[0].Docdat));
                                dataLancamento.setText(that.formatData(oData.results[0].Pstdat));
                                empresa.setText(oData.results[0].Bukrs);
                                localNegocios.setText(oData.results[0].Branch);
                                moeda.setText(oData.results[0].Waerk);
                                tipoDocumento.setText(oData.results[0].Nftype);
                                direcao.setText(oData.results[0].Direct);
                                modelo.setText(oData.results[0].Model);
                                form.setText(oData.results[0].Form);
                               
                                that.carregarItens();
                                that.carregarItensTax();
                                oGlobalBusyDialog.close();
                            },
                            error: function(oEvent) {
                                debugger;
                                var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
                            var message = JSON.parse(oEvent.response.body);
                            var details = "";
        
                            if (message.error.innererror.errordetails.length !== 0) {
                                for (var k = 0; k < message.error.innererror.errordetails.length; k++) {
                                    if (message.error.innererror.errordetails[k].severity === "error") {
                                        if (message.error.innererror.errordetails[k].code !== "/IWBEP/CX_MGW_BUSI_EXCEPTION") {
                                            details = details + "<li>" + message.error.innererror.errordetails[k].message + "</li>";
                                        }
        
                                    }
        
                                }
                            } else {
                                details = message.error.message.value;
                            }
                            
                            MessageBox.show("Erro", {
                                icon: MessageBox.Icon.ERROR,
                                title: "Error",
                                actions: [sap.m.MessageBox.Action.CLOSE],
                                id: "messageBoxId2",
                                details: details,
                                styleClass: bCompact ? "sapUiSizeCompact" : "",
                                contentWidth: "100px"
                            });
                            oGlobalBusyDialog.close();
                            }
                        });

                    } catch (ex) {
                        var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;

                        MessageBox.error(
                            ex.message, {
                            styleClass: bCompact ? "sapUiSizeCompact" : ""
                        }
                        );
                    }
                } else{

                    try {

                        var aFilters = this.montarfiltrosSemNF();
                        
                        oGlobalBusyDialog.open();

                        oModel.read("/DocFatHeaderSet?$format=json", {
                            filters: aFilters,
                            async: true,

                            success: function _OnSuccess(oData, response) {

                                dataDocumento.setText(that.formatData(oData.results[0].DocDate));
                                empresa.setText(oData.results[0].CompCode);
                                referencia.setText(oData.results[0].RefDocNo);
                                tipoDocumento.setText(oData.results[0].DocType);
                                dataLancamento.setText(that.formatData(oData.results[0].PstngDate));
                                that.carregarItens();
                                that.carregarItensTax();
                                oGlobalBusyDialog.close();
                            },
                            error: function(oEvent) {
                                debugger;
                                var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
                                var message = JSON.parse(oEvent.response.body);
                                var details = "";
        
                            if (message.error.innererror.errordetails.length !== 0) {
                                for (var k = 0; k < message.error.innererror.errordetails.length; k++) {
                                    if (message.error.innererror.errordetails[k].severity === "error") {
                                        if (message.error.innererror.errordetails[k].code !== "/IWBEP/CX_MGW_BUSI_EXCEPTION") {
                                            details = details + "<li>" + message.error.innererror.errordetails[k].message + "</li>";
                                        }
        
                                    }
        
                                }
                            } else {
                                details = message.error.message.value;
                            }
                            
                            MessageBox.show("Erro", {
                                icon: MessageBox.Icon.ERROR,
                                title: "Error",
                                actions: [sap.m.MessageBox.Action.CLOSE],
                                id: "messageBoxId2",
                                details: details,
                                styleClass: bCompact ? "sapUiSizeCompact" : "",
                                contentWidth: "100px"
                            });
                            oGlobalBusyDialog.close();
                            }
                        });

                    } catch (ex) {
                        var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;

                        MessageBox.error(
                            ex.message, {
                            styleClass: bCompact ? "sapUiSizeCompact" : ""
                        }
                        );
                    }
                };

               

                
                
                

                    

                    
            


            },
            onPressImpostos: function (oEvent){
                var itmnum = oEvent.getSource().getBindingContext().getProperty('Itmnum');

                var impostosModel = this.carregarItensTax(itmnum);

                debugger;

                var oButton = oEvent.getSource();
			// create popover
			if (!this._oPopover) {
				Fragment.load({
					id: "popoverNavCon",
					name: "mrs.com.br.zmmdieselnfretorno.view.Impostos",
					controller: this
				}).then(function(oPopover){
					this._oPopover = oPopover;
                    this._oPopover.setModel(impostosModel);
					this.getView().addDependent(this._oPopover);
					this._oPopover.openBy(oButton);
				}.bind(this));
			} else {
                this._oPopover.setModel(impostosModel);
				this._oPopover.openBy(oButton);
			}

                
            },
            carregarItens: function (){

                var table = this.getView().byId("tableItem");
                var itemModel = new sap.ui.model.json.JSONModel();
                var tableSemNF = this.getView().byId("tableItemSemNf");
                var that = this;

                if(nf === 'X'){

                    try {

                        var aFilters = this.montarfiltros();

                        oGlobalBusyDialog.open();

                        oModel.read("/NfItemSet?$format=json", {
                            filters: aFilters,
                            async: false,

                            success: function _OnSuccess(oData, response) {

                                debugger;
                                itemModel.setData(oData);

                               /* for (let index = 0; index < itemModel.oData.results.length; index++) {
                                    var item = itemModel.oData.results[index];
                                    itemModel.oData.results[index]
                                    
                                }    */

                                table.setModel(itemModel);
                    
                                oGlobalBusyDialog.close();
                            },
                            error: function _OnError(oError) {
                                oGlobalBusyDialog.close();

                            }
                        });

                    } catch (ex) {
                        var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;

                        MessageBox.error(
                            ex.message, {
                            styleClass: bCompact ? "sapUiSizeCompact" : ""
                        }
                        );
                    }
                }else{
                    try {

                        var aFilters = this.montarfiltrosSemNF();
                        
                        oGlobalBusyDialog.open();

                        oModel.read("/DocFatItemSet?$format=json", {
                            filters: aFilters,
                            async: false,

                            success: function _OnSuccess(oData, response) {

                                debugger;
                                itemModel.setData(oData);

                               /* for (let index = 0; index < itemModel.oData.results.length; index++) {
                                    var item = itemModel.oData.results[index];
                                    itemModel.oData.results[index]
                                    
                                }    */

                                tableSemNF.setModel(itemModel);
                    
                                oGlobalBusyDialog.close();
                            },
                            error: function _OnError(oError) {
                                oGlobalBusyDialog.close();

                            }
                        });

                    } catch (ex) {
                        var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;

                        MessageBox.error(
                            ex.message, {
                            styleClass: bCompact ? "sapUiSizeCompact" : ""
                        }
                        );
                    }
                }

            },
            formatter: function (value) {
                if (value !== null && value !== undefined)
                    return REAL(parseFloat(value.toString().replace(",", "."))).format();
            },
            carregarItensTax: function (itmnum){

                var matchCodeStr = '{"Impostos":[]}';
			    var fields = JSON.parse(matchCodeStr);
                
			    var impostosmodel = new sap.ui.model.json.JSONModel();
                
                var that = this;

                    try {

                        var aFilters = this.montarfiltros();

                        
                        oGlobalBusyDialog.open();

                        oModel.read("/NfItemTaxSet?$format=json", {
                            filters: aFilters,
                            async: false,

                            success: function _OnSuccess(oData, response) {

                                debugger;
                                for (let index = 0; index < oData.results.length; index++) {
                                    var item = oData.results[index];

                                    if (item.Itmnum === itmnum){
                                        fields['Impostos'].push(item);
                                    }
                                    
                                }

                                oGlobalBusyDialog.close();
                            },
                            error: function _OnError(oError) {
                                oGlobalBusyDialog.close();

                            }
                        });

                    } catch (ex) {
                        var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;

                        MessageBox.error(
                            ex.message, {
                            styleClass: bCompact ? "sapUiSizeCompact" : ""
                        }
                        );
                    }

                    impostosmodel.setData(fields);

                    
                    return impostosmodel;


            },

            inicializarPostoMC: function (){
                var postoModel = new sap.ui.model.json.JSONModel();

                var cboPosto = this.getView().byId("cboPosto");
                
                var that = this;

                    try {

                        var aFilters = [];

                        
                        oGlobalBusyDialog.open();

                        oModel.read("/PostosSet?$format=json", {
                            filters: aFilters,
                            async: true,

                            success: function _OnSuccess(oData, response) {

                                
                                postoModel.setData(oData);
                    
                                oGlobalBusyDialog.close();
                            },
                            error: function _OnError(oError) {
                                oGlobalBusyDialog.close();

                            }
                        });

                    } catch (ex) {
                        var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;

                        MessageBox.error(
                            ex.message, {
                            styleClass: bCompact ? "sapUiSizeCompact" : ""
                        }
                        );
                    }

                    cboPosto.setModel(postoModel);
            }

        });
    });
