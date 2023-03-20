from odoo import models, fields, api
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import json


class PurchaseOrder(models.Model):
    _inherit = 'purchase.order'

    @api.model
    def get_tiles_data(self):
        """Get the data tiles for the Custom Dashboard

        Returns:
            dict: A dictionary data for used in the dashboard
        """
        all_rfq = self.env['purchase.order'].search([('state', 'in', ('draft', 'sent'))])
        all_po = self.env['purchase.order'].search([('state', '=', 'purchase')])
        incoming = self.env['stock.move'].search([('picking_type_id.code', '=', 'incoming'), ('state', '=', 'assigned')])
        all_vendor = self.env['account.invoice'].search([('type', '=', 'in_invoice')])

        currency_id = self.env.user.company_id.currency_id
        currency_name = currency_id.name
        currency_symbol = currency_id.symbol

        to_pay = sum(all_vendor.mapped('residual_signed'))
        amount_total_rfq = sum(all_rfq.mapped('amount_total'))
        amount_total_po = sum(all_po.mapped('amount_total'))

        today = datetime.now().date()
        one_month_ago = today - relativedelta(months=1)
        three_months_ago = today - relativedelta(months=3)
        six_months_ago = today - relativedelta(months=6)

        bills = self.env['account.invoice'].search([('type', '=', 'in_invoice'), ('state', '=', 'open'), ('date_invoice', '>=', six_months_ago)])

        today_bills = bills.filtered(lambda r: r.date_invoice == today)
        today_bill_count = len(today_bills)
        today_bill_total = sum(today_bills.mapped('amount_total'))

        one_month_bills = bills.filtered(lambda r: one_month_ago <= r.date_invoice <= today)
        one_month_bill_count = len(one_month_bills)
        one_month_bill_total = sum(one_month_bills.mapped('amount_total'))

        three_months_bills = bills.filtered(lambda r: three_months_ago <= r.date_invoice <= today)
        three_months_bill_count = len(three_months_bills)
        three_months_bill_total = sum(three_months_bills.mapped('amount_total'))

        six_months_bills = bills.filtered(lambda r: six_months_ago <= r.date_invoice <= today)
        six_months_bill_count = len(six_months_bills)
        six_months_bill_total = sum(six_months_bills.mapped('amount_total'))


        return {
            'total_rfq': len(all_rfq),
            'total_po': len(all_po),
            'total_incoming': len(incoming),
            'total_vendor': len(all_vendor),
            'amount_total_rfq_str': currency_symbol + ' ' +'{:,.2f}'.format(amount_total_rfq) + ' ' + currency_name,
            'amount_total_po_str': currency_symbol + ' ' +'{:,.2f}'.format(amount_total_po) + ' ' + currency_name,
            'to_pay_str': currency_symbol + ' ' +'{:,.2f}'.format(to_pay) + ' ' + currency_name,
            'today_bill_count': today_bill_count,
            'today_bill_total': '{:,.2f}'.format(today_bill_total)+ ' ' + currency_name,
            'one_month_bill_count': one_month_bill_count,
            'one_month_bill_total': '{:,.2f}'.format(one_month_bill_total)+ ' ' + currency_name,
            'three_months_bill_count': three_months_bill_count,
            'three_months_bill_total': '{:,.2f}'.format(three_months_bill_total)+ ' ' + currency_name,
            'six_months_bill_count': six_months_bill_count,
            'six_months_bill_total': '{:,.2f}'.format(six_months_bill_total)+ ' ' + currency_name,
        }
    
    @api.model
    def get_purchase_order_pie_graph(self):
        cr = self._cr
        cr.execute("""SELECT res_partner.id, res_partner.name, COUNT(purchase_order.partner_id) AS order_count
            FROM purchase_order
            JOIN res_partner ON res_partner.id = purchase_order.partner_id
            GROUP BY res_partner.id, res_partner.name
            ORDER BY order_count DESC;""")
        dat = cr.fetchall()
        pie = []
        for i in range(0, len(dat)):
            pie.append({'label': dat[i][1], 'value': dat[i][2]})
        return {
            'pie': pie
        }
    
    @api.model
    def get_rfqs_char_bar(self):
        query = """
            SELECT res_partner.name AS partner_name, COUNT(purchase_order.partner_id) AS total_count
            FROM purchase_order
            INNER JOIN res_partner ON res_partner.id = purchase_order.partner_id
            GROUP BY res_partner.id, res_partner.name
            ORDER BY total_count DESC
        """
        self._cr.execute(query)
        result = self._cr.dictfetchall()

        total_count = []
        partner_name = []
        for record in result:
            total_count.append(record.get('total_count'))
            partner_name.append(record.get('partner_name'))

        final = [total_count, partner_name]
        return final
