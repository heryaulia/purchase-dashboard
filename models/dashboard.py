from odoo import models, fields, api

class PosDashboard(models.Model):
    _inherit = 'purchase.order'

    @api.model
    def get_tiles_data(self):
        """Get the data tiles for the Custom Dashboard

        Returns:
            dict: A dictionary data for used in the dashboard
        """

        all_rfq = self.env['purchase.order'].search([('state', 'in', ['draft', 'sent'])])
        all_po = self.env['purchase.order'].search([('state', 'in', ['purchase'])])
        incoming_shipment_lines = self.env['stock.move'].search([('picking_type_id.code', '=', 'incoming'), ('state', '=', 'assigned')])

        amount_total = sum(all_rfq.mapped('amount_total'))
        
        # Alternative way to calculate amount_total_po
        amount_total_po = sum([po.amount_total for po in all_po if po.state == 'purchase'])

        return {
            'total_rfq': len(all_rfq),
            'total_po': len(all_po),
            'total_incoming': len(incoming_shipment_lines),
            'amount_total': amount_total,
            'amount_total_po': amount_total_po,
        }
