/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"mrscombr/zmm_diesel_nf_retorno/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
