<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Invoice - {{ $invoice->invoice_uuid }}</title>
    <style>
        body {
            font-family: 'Helvetica', sans-serif;
            color: #333;
            line-height: 1.5;
            font-size: 14px;
        }

        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }

        .title {
            color: #2563eb;
            font-size: 32px;
            font-weight: bold;
        }

        .company-info {
            text-align: right;
        }

        .details-grid {
            width: 100%;
            margin-bottom: 40px;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
            padding: 20px 0;
        }

        .details-grid td {
            vertical-align: top;
            width: 50%;
        }

        .section-title {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            color: #999;
            margin-bottom: 10px;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }

        .items-table th {
            text-align: left;
            background: #f9fafb;
            color: #666;
            font-weight: 600;
            padding: 12px 8px;
            border-bottom: 1px solid #eee;
        }

        .items-table td {
            padding: 12px 8px;
            border-bottom: 1px solid #f3f4f6;
            vertical-align: middle;
        }

        .product-image {
            width: 40px;
            height: 40px;
            border-radius: 4px;
            object-fit: cover;
            margin-right: 10px;
        }

        .product-placeholder {
            width: 40px;
            height: 40px;
            border-radius: 4px;
            background: #f3f4f6;
            color: #9ca3af;
            text-align: center;
            line-height: 40px;
            font-weight: bold;
            display: inline-block;
            margin-right: 10px;
            text-transform: uppercase;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .summary-wrapper {
            text-align: right;
        }

        .summary-table {
            width: 250px;
            margin-left: auto;
        }

        .summary-table td {
            padding: 8px 0;
        }

        .total-row {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            border-top: 1px solid #eee;
        }

        .remarks {
            margin-top: 40px;
            font-style: italic;
            color: #666;
            font-size: 12px;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #999;
        }
    </style>
</head>

<body>
    <div class="invoice-box">
        <table style="width: 100%;">
            <tr>
                <td>
                    <div class="title">INVOICE</div>
                    <div style="font-family: monospace;">{{ $invoice->invoice_uuid }}</div>
                </td>
                <td class="company-info">
                    <div style="font-size: 20px; font-weight: bold;">Laurnverse CRM</div>
                    <div>Dhaka, Bangladesh</div>
                    <div>Phone: +880 1234 567890</div>
                </td>
            </tr>
        </table>

        <table class="details-grid">
            <tr>
                <td>
                    <div class="section-title">Billed To</div>
                    <div style="font-size: 16px; font-weight: bold;">{{ $invoice->client->name }}</div>
                    <div>{{ $invoice->client->phone }}</div>
                    <div>{{ $invoice->client->address ?? 'N/A' }}</div>
                </td>
                <td class="text-right">
                    <div class="section-title">Invoice Details</div>
                    <div><strong>Date:</strong> {{ $invoice->date }}</div>
                    <div><strong>Status:</strong> {{ $invoice->status }}</div>
                    <div><strong>Method:</strong> {{ $invoice->method }}</div>
                </td>
            </tr>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                @php $subtotal = 0; @endphp
                @foreach ($invoice->items as $item)
                    @php
                        $itemAmount = $item->qty * $item->price;
                        $subtotal += $itemAmount;
                    @endphp
                    <tr>
                        <td>
                            @if ($item->product->image)
                                <img src="{{ public_path('storage/' . $item->product->image) }}" class="product-image" align="left">
                            @else
                                <div class="product-placeholder" style="float: left;">{{ substr($item->product->name, 0, 1) }}</div>
                            @endif
                            <div style="padding-top: 10px;">{{ $item->product->name }}</div>
                        </td>
                        <td class="text-center">{{ $item->qty }}</td>
                        <td class="text-right">{{ number_format($item->price, 2) }}</td>
                        <td class="text-right">{{ number_format($itemAmount, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="summary-wrapper">
            <table class="summary-table">
                @if ($invoice->discount_amount != 0)

                    <tr>
                        <td style="color: #666;">Subtotal</td>
                        <td class="text-right">{{ number_format($subtotal, 2) }}</td>
                    </tr>
                    <tr>
                        <td style="color: #d97706;">Discount ({{ $invoice->discount_type }})</td>
                        <td class="text-right">
                            @if ($invoice->discount_type === 'Percentage')
                                {{ $invoice->discount_amount }}%
                            @else
                                {{ number_format($invoice->discount_amount, 2) }}
                            @endif
                        </td>
                    </tr>
                @endif
                <tr>
                    <td style="color: #059669;">Paid</td>
                    <td class="text-right">{{ number_format($invoice->paid, 2) }}</td>
                </tr>
                <tr>
                    <td style="color: #dc2626;">Due</td>
                    <td class="text-right">{{ number_format($invoice->due, 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td>Total</td>
                    <td class="text-right">{{ number_format($invoice->total, 2) }}</td>
                </tr>
            </table>
        </div>

        @if ($invoice->remarks)
            <div class="remarks">
                <div class="section-title">Remarks</div>
                {{ $invoice->remarks }}
            </div>
        @endif

        <div class="footer">
            Generated on {{ date('Y-m-d H:i:s') }} | Thank you for your business!
        </div>
    </div>
</body>

</html>
