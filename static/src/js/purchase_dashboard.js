odoo.define('purchase_dashboard.dashboard_action', function (require){
    "use strict";
    var AbstractAction = require('web.AbstractAction');
    var core = require('web.core');
    var QWeb = core.qweb;
    var rpc = require('web.rpc');
    var ajax = require('web.ajax');
    var CustomDashBoard = AbstractAction.extend({
        template: 'CustomDashBoard',

        events: {
            'click .total_rfq': 'rfq',
            'click .total_po': 'po',
            'click .total_incoming': 'incoming',
        },

        init: function(parent, context) {
            this._super(parent, context);
            this.dashboards_templates = ['DashboardProject'];
            this.today_sale = [];
        },

        willStart: function() {
            var self = this;
            return $.when(ajax.loadLibs(this), this._super()).then(function() {
                return self.fetch_data();
            });
        },

        start: function() {
            var self = this;
            this.set("title", 'Dashboard');
            return this._super().then(function() {
                self.render_dashboards();
            });
        },

        render_dashboards: function() {
            var self = this;
            _.each(this.dashboards_templates, function(template) {
                self.$('.o_pj_dashboard').append(QWeb.render(template, {widget: self}));
            });
        },

        fetch_data: function() {
            var self = this;
            var def1 = this._rpc({
                model: 'purchase.order',
                method: 'get_tiles_data'
            }).then(function(result) {
                self.total_rfq = result['total_rfq'],
                self.total_po = result['total_po'],
                self.total_incoming = result['total_incoming'],
                self.amount_total = result['amount_total'],
                self.amount_total_po = result['amount_total_po']
            });
            return $.when(def1);
        },
        

        rfq: function(e) {
            this.do_action({
                name: _t("Requests for Quotation"),
                type: 'ir.actions.act_window',
                res_model: 'purchase.order',
                view_mode: 'tree,form,calendar',
                view_type: 'form',
                views: [[false, 'list'],[false, 'form']],
                domain: [['state', 'in', ['draft', 'sent']]],
                target: 'current'
            });
        },        

       po: function(e) {
            this.do_action({
                name: _t("Purchase Order"),
                type: 'ir.actions.act_window',
                res_model: 'purchase.order',
                view_mode: 'tree,form',
                view_type: 'form',
                views: [[false, 'list'], [false, 'form']],
                domain: [['state', 'in', ['purchase', 'done']]],
                target: 'current'
            });
        },
    

        incoming: function(e) {
            this.do_action({
                name: _t("Incoming Products"),
                type: 'ir.actions.act_window',
                res_model: 'stock.move',
                view_mode: 'tree,form',
                view_type: 'form',
                views: [[false, 'list'], [false, 'form']],
                domain: [['picking_id.picking_type_id.code', '=', 'incoming'], ['location_id.usage', '!=', 'internal'], ['location_dest_id.usage', '=', 'internal'], ['state', '=', 'assigned']],
                target: 'current'
            });
        },               
    });

    core.action_registry.add('purchase_dashboard_tag', CustomDashBoard);
    return CustomDashBoard;
});
