odoo.define('purchase_dashboard.dashboard_action', function (require){
    "use strict";
    var AbstractAction = require('web.AbstractAction');
    var core = require('web.core');
    var QWeb = core.qweb;
    var rpc = require('web.rpc');
    var ajax = require('web.ajax');
    var today = moment().format("YYYY-MM-DD");
    var one_month_ago = moment().subtract(1, 'months').format("YYYY-MM-DD");
    var three_months_ago = moment().subtract(3, 'months').format("YYYY-MM-DD");
    var six_months_ago = moment().subtract(6, 'months').format("YYYY-MM-DD");
    var CustomDashBoard = AbstractAction.extend({
        template: 'CustomDashBoard',
        cssLibs: [
            '/purchase_dashboard/static/src/css/lib/nv.d3.css'
        ],
        jsLibs: [
            '/purchase_dashboard/static/src/js/lib/d3.min.js'
        ],

        events: {
            'click .total_rfq': 'rfq',
            'click .total_po': 'po',
            'click .total_incoming': 'incoming',
            'click .total_vendor': 'vendor',
            'click .today_bills': 'todaybill',
            'click .onemonth_bills': 'onemonthbill',
            'click .threemonth_bills': 'threemonthbill',
            'click .sixmonth_bills': 'sixmonthbill',
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
                self.render_graphs();
            });
        },

        render_dashboards: function() {
            var self = this;
            _.each(this.dashboards_templates, function(template) {
                self.$('.o_pj_dashboard').append(QWeb.render(template, {widget: self}));
            });
        },

        render_graphs: function(){
            var self = this;
                self.render_purchase_order();
                self.render_rfqs_graph();
        },

        render_purchase_order:function(){
            var self = this;
            var w = 300;
            var h = 300;
            var r = h/2;
            var elem = this.$('.emp_graph');
            var colors = ['#70cac1', '#659d4e', '#208cc2', '#4d6cb1', '#584999', '#8e559e', '#cf3650', '#f65337', '#fe7139',
            '#ffa433', '#ffc25b', '#f8e54b'];
            var color = d3.scale.ordinal().range(colors);
            rpc.query({
                model: "purchase.order",
                method: "get_purchase_order_pie_graph",
            }).then(function (data) {
                var segColor = {};
                var vis = d3.select(elem[0]).append("svg:svg").data([data.pie]).attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + r + "," + r + ")");
                var pie = d3.layout.pie().value(function(d){return d.value;});
                var arc = d3.svg.arc().outerRadius(r);
                var arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
                arcs.append("svg:path")
                    .attr("fill", function(d, i){
                        return color(i);
                    })
                    .attr("d", function (d) {   
                        return arc(d);
                    });

                var legend = d3.select(elem[0]).append("table").attr('class','legend');
                
                // create one row per segment.
                var tr = legend.append("tbody").selectAll("tr" ).data(data.pie).enter().append("tr");

                // create the first column for each segment.
                tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
                    .attr("width", '16').attr("height", '16')
                    .attr("fill",function(d, i){ return color(i) });
                
                // create the second column for each segment.
                tr.append("td").text(function(d){ return d.label;}).attr("style", 'padding-left:20px');

                // create the third column for each segment.
                tr.append("td").attr("class",'legendFreq')
                    .text(function(d){ return d.value;});
            });

        },   


        render_rfqs_graph: function() {
            var self = this;
            var ctx = self.$('.top_rfqs_bar_chart');
        
            rpc.query({
                model: 'purchase.order',
                method: 'get_rfqs_char_bar',
            }).then(function(arrays) {
                var data = {
                    labels: arrays[1],
                    datasets: [{
                        label: 'RFQs',
                        data: arrays[0],
                        backgroundColor: [
                            'rgba(190, 27, 75, 0.7)',
                            'rgba(31, 241, 91, 0.7)',
                            'rgba(103, 23, 252, 0.7)',
                            'rgba(158, 106, 198, 0.7)',
                            'rgba(250, 217, 105, 0.7)',
                            'rgba(255, 98, 31, 0.7)',
                            'rgba(255, 31, 188, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(10, 20, 30, 0.7)'
                        ],
                        borderColor: [
                            'rgba(190, 27, 75, 0.2)',
                            'rgba(190, 223, 122, 0.2)',
                            'rgba(103, 23, 252, 0.2)',
                            'rgba(158, 106, 198, 0.2)',
                            'rgba(250, 217, 105, 0.2)',
                            'rgba(255, 98, 31, 0.2)',
                            'rgba(255, 31, 188, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(10, 20, 30, 0.3)'
                        ],
                        borderWidth: 1
                    }]
                };
        
                var options = {
                    responsive: true,
                    // title: {
                    //     display: true,
                    //     position: 'top',
                    //     // text: ' Time by Employees',
                    //     // fontSize: 18,
                    //     fontColor: 'white'
                    // },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            fontColor: 'white',
                            fontSize: 16
                        }
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                min: 0,
                                fontColor: 'white',                             
                            },
                            
                        }], 
                        xAxes: [{
                            ticks: {
                                fontColor: 'white', // chartjs bar font color
                            },
                            gridLines: { color: "#6D7792" } //charjs bar line color 
                        }]
                        
                    }
                };
        
                var chart = new Chart(ctx, {

                    type: 'bar',
                    data: data,
                    options: options

                });
                Chart.defaults.global.elements.rectangle.borderColor = '#fff';
            });
        },
        
        
        fetch_data: function() {
            var self = this;
            var def1 = this._rpc({
                model: 'purchase.order',
                method: 'get_tiles_data'
            }).then(function(result) {
                self.total_rfq = result['total_rfq'];
                self.total_po = result['total_po'];
                self.total_incoming = result['total_incoming'];
                self.total_vendor = result['total_vendor'];
                self.amount_total_rfq_str = result['amount_total_rfq_str'];
                self.amount_total_po_str = result['amount_total_po_str'];
                self.to_pay_str = result['to_pay_str'];
                self.today_bill_count = result['today_bill_count'];
                self.today_bill_total = result['today_bill_total'];
                self.one_month_bill_count = result['one_month_bill_count'];
                self.one_month_bill_total = result['one_month_bill_total'];
                self.three_months_bill_count = result['three_months_bill_count'];
                self.three_months_bill_total = result['three_months_bill_total'];
                self.six_months_bill_count = result['six_months_bill_count'];
                self.six_months_bill_total = result['six_months_bill_total'];
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
        
        vendor: function(e) {
            this.do_action({
              name: _t("Vendor Bills"),
              type: 'ir.actions.act_window',
              res_model: 'account.invoice',
              view_mode: 'tree,form',
              view_type: 'form',
              views: [[false, 'list'], [false, 'form']],
              domain: [['type', '=', 'in_invoice']],
              target: 'current'
            });
        },

        todaybill: function(e) {
            this.do_action({
              name: _t("Today Bills"),
              type: 'ir.actions.act_window',
              res_model: 'account.invoice',
              view_mode: 'tree,form',
              view_type: 'form',
              views: [[false, 'list'], [false, 'form']],
              domain: [['type', '=', 'in_invoice'], ['state', '=', 'open'],['date_invoice', '=', today]],
              target: 'current'
            });
        },

        onemonthbill: function(e) {
            this.do_action({
              name: _t("One Month Bills"),
              type: 'ir.actions.act_window',
              res_model: 'account.invoice',
              view_mode: 'tree,form',
              view_type: 'form',
              views: [[false, 'list'], [false, 'form']],
              domain: [['type', '=', 'in_invoice'], ['state', '=', 'open'], ['date_invoice', '>=', one_month_ago], ['date_invoice', '<=', today]],
              target: 'current'
            });
        },

        threemonthbill: function(e) {
            this.do_action({
              name: _t("Three Month Bills"),
              type: 'ir.actions.act_window',
              res_model: 'account.invoice',
              view_mode: 'tree,form',
              view_type: 'form',
              views: [[false, 'list'], [false, 'form']],
              domain: [['type', '=', 'in_invoice'], ['state', '=', 'open'], ['date_invoice', '>=', three_months_ago], ['date_invoice', '<=', today]],
              target: 'current'
            });
        },

        sixmonthbill: function(e) {
            this.do_action({
              name: _t("Six Month Bills"),
              type: 'ir.actions.act_window',
              res_model: 'account.invoice',
              view_mode: 'tree,form',
              view_type: 'form',
              views: [[false, 'list'], [false, 'form']],
              domain: [['type', '=', 'in_invoice'], ['state', '=', 'open'], ['date_invoice', '>=', six_months_ago], ['date_invoice', '<=', today]],
              target: 'current'
            });
        },
    });

    core.action_registry.add('purchase_dashboard_tag', CustomDashBoard);
    return CustomDashBoard;
});
