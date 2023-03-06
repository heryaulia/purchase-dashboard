# -*- coding: utf-8 -*-
{
    'name': "Purchase Dashboard",

    'summary': """
        """,

    'description': """
        
    """,

    'author': "Hery",
    'website': "http://h3ry.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/12.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Custom Module',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': [ 'base',
        'purchase',
        'stock',],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        'views/dashboard_view.xml',
    ],
    'qweb': ["static/src/xml/purchase_dashboard.xml"],
}