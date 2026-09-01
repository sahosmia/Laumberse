<!DOCTYPE html>
<html>

<head>
    <!-- Dompdf এর জন্য প্রপার মেটা ট্যাগ -->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Invoice - {{ $invoiceUuid }}</title>
    <style>
        /* ১. বাংলা ফন্টটি পিডিএফে রেজিস্টার করা */
        @font-face {
            font-family: 'SolaimanLipi';
            /* নিশ্চিত করুন public/fonts/ ফোল্ডারে ঠিক এই বানানে ফাইলটি আছে */
            src: url('{{ public_path("fonts/SolaimanLipi-Normal.ttf") }}') format('truetype');
            font-weight: normal;
            font-style: normal;
        }

        @font-face {
            font-family: 'SutonnyMJ';
            src: url('{{ public_path("fonts/SutonnyMJ.ttf") }}') format('truetype');
            font-weight: normal;
            font-style: normal;
        }

        * {
            box-sizing: border-box;
        }

        body {
            /* ২. ডিফল্ট ফন্ট হিসেবে বাংলা ফন্ট সেট করা এবং ফলব্যাক হিসেবে Helvetica রাখা */
            font-family: 'SolaimanLipi', 'Helvetica', sans-serif;
            color: #1f2937;
            line-height: 1.5;
            font-size: 13px;
            margin: 0;
        }

        .top-bar {
            height: 6px;
            background: #2563eb;
        }

        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 36px 40px 30px;
        }

        .w-full {
            width: 100%;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .align-top {
            vertical-align: top;
        }

        /* ৩. হেডার */
        .brand-title {
            color: #2563eb;
            font-size: 30px;
            font-weight: bold;
            letter-spacing: 1px;
            margin: 0 0 4px;
        }

        .invoice-number {
            font-family: monospace;
            color: #6b7280;
            font-size: 12px;
        }

        .company-info {
            text-align: right;
        }

        .company-name {
            font-size: 17px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 3px;
        }

        .company-info div {
            color: #6b7280;
            font-size: 12px;
        }

        /* ৪. বিলিং ও ইনভয়েস ডিটেইলস কার্ড */
        .details-wrap {
            margin: 28px 0;
        }

        .info-card {
            background: #f8fafc;
            border-radius: 8px;
            padding: 16px 20px;
            vertical-align: top;
        }

        .info-card-gap {
            width: 16px;
        }

        .section-title {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #9ca3af;
            margin-bottom: 8px;
        }

        .client-name {
            font-size: 15px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 2px;
        }

        .info-line {
            color: #4b5563;
            font-size: 12px;
            margin-top: 2px;
        }

        .detail-row {
            font-size: 12px;
            color: #4b5563;
            margin-top: 6px;
        }

        .detail-row strong {
            color: #111827;
            font-weight: bold;
        }

        .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: bold;
        }

        /* ৫. আইটেম টেবিল */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
        }

        .items-table th {
            text-align: left;
            background: #f8fafc;
            color: #6b7280;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 10px 10px;
            border-bottom: 2px solid #e5e7eb;
        }

        .items-table td {
            padding: 12px 10px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
        }

        .product-image {
            width: 38px;
            height: 38px;
            border-radius: 6px;
            object-fit: cover;
            margin-right: 10px;
        }

        .product-placeholder {
            width: 38px;
            height: 38px;
            border-radius: 6px;
            background: #eff6ff;
            color: #2563eb;
            text-align: center;
            line-height: 38px;
            font-weight: bold;
            display: inline-block;
            margin-right: 10px;
            text-transform: uppercase;
        }

        .product-name {
            padding-top: 8px;
            font-size: 13px;
            color: #111827;
        }

        /* ৬. সামারি সেকশন */
        .summary-wrapper {
            text-align: right;
            margin-top: 8px;
        }

        .summary-table {
            width: 280px;
            margin-left: auto;
        }

        .summary-table td {
            padding: 7px 0;
            font-size: 12.5px;
            color: #4b5563;
        }

        .total-row td {
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
        }

        .total-row .total-label {
            font-size: 13px;
            font-weight: bold;
            color: #111827;
        }

        .total-row .total-value {
            font-size: 20px;
            font-weight: bold;
            color: #2563eb;
        }

        /* ৭. রিমার্কস */
        .remarks {
            margin-top: 34px;
            background: #f8fafc;
            border-left: 3px solid #2563eb;
            border-radius: 0 6px 6px 0;
            padding: 12px 16px;
            color: #4b5563;
            font-size: 12px;
        }

        /* ৮. ফুটার */
        .footer {
            margin-top: 44px;
            padding-top: 14px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
        }
    </style>
</head>

<body>
    {{-- <div class="top-bar"></div> --}}

    <div class="invoice-box">
        <!-- Header: বাম পাশে ইনভয়েস টাইটেল ও নাম্বার, ডান পাশে বিজনেস তথ্য -->
        <table class="w-full">
            <tr>
                <td class="align-top">
                    <p class="brand-title">INVOICE</p>
                    <div class="invoice-number">#{{ $invoiceUuid }}</div>
                </td>
                <td class="company-info align-top">
                    @if ($business['logoPath'])
                        <img src="{{ $business['logoPath'] }}" style="max-height: 42px; margin-bottom: 6px;">
                    @endif
                    <div class="company-name">@bn($business['name'])</div>
                    @if ($business['address'])
                        <div>@bn($business['address'])</div>
                    @endif
                    @if ($business['phone'])
                        <div>Phone: {{ $business['phone'] }}</div>
                    @endif
                </td>
            </tr>
        </table>

        <!-- Billing & Customer Info -->
        <table class="w-full details-wrap">
            <tr>
                <td class="info-card" style="width: 50%;">
                    <div class="section-title">Billed To</div>
                    <div class="client-name">@bn($client['name'])</div>
                    <div class="info-line">@bn($client['phone'])</div>
                    @if ($client['address'])
                        <div class="info-line">@bn($client['address'])</div>
                    @endif
                </td>
                <td class="info-card-gap"></td>
                <td class="info-card text-right" style="width: 50%;">
                    <div class="section-title">Invoice Details</div>
                    <div class="detail-row"><strong>Date:</strong> {{ $invoiceDate }}</div>
                    <div class="detail-row"><strong>Status:</strong> {{ $status }}</div>
                    @if ($method)
                        <div class="detail-row"><strong>Method:</strong> {{ $method }}</div>
                    @endif
                    <div class="detail-row">
                        <strong>Payment:</strong>
                        <span class="badge" style="background-color: {{ $paymentStatusColor }}1a; color: {{ $paymentStatusColor }};">{{ $paymentStatus }}</span>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Product Item Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 52%;">Description</th>
                    <th class="text-center" style="width: 12%;">Qty</th>
                    <th class="text-right" style="width: 18%;">Unit Price</th>
                    <th class="text-right" style="width: 18%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($items as $item)
                    <tr>
                        <td>
                            @if ($item['productImagePath'])
                                <img src="{{ $item['productImagePath'] }}" class="product-image" align="left">
                            @else
                                <div class="product-placeholder" style="float: left;">@bn($item['productInitial'])</div>
                            @endif
                            <div class="product-name">@bn($item['productName'])</div>
                        </td>
                        <td class="text-center">{{ $item['qty'] }}</td>
                        <td class="text-right">{{ $item['priceFormatted'] }}</td>
                        <td class="text-right">{{ $item['amountFormatted'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Financial Calculation Summary -->
        <div class="summary-wrapper">
            <table class="summary-table">
                @if ($discount)
                    <tr>
                        <td>Subtotal</td>
                        <td class="text-right">{{ $subtotalFormatted }}</td>
                    </tr>
                    <tr>
                        <td style="color: #d97706;">{{ $discount['label'] }}</td>
                        <td class="text-right" style="color: #d97706;">-{{ $discount['valueFormatted'] }}</td>
                    </tr>
                @endif
                @if ($showDeliveryCharge)
                    <tr>
                        <td style="color: #2563eb;">Delivery Charge</td>
                        <td class="text-right">{{ $deliveryChargeFormatted }}</td>
                    </tr>
                @endif
                <tr>
                    <td style="color: #059669;">Paid Amount</td>
                    <td class="text-right" style="color: #059669; font-weight: bold;">{{ $paidFormatted }}</td>
                </tr>
                <tr class="total-row">
                    <td class="total-label">Total Payable</td>
                    <td class="text-right total-value">{{ $totalFormatted }}</td>
                </tr>
            </table>
        </div>

        <!-- নোট / রিমার্কস -->
        @if ($remarks)
            <div class="remarks">
                <div class="section-title" style="margin-bottom: 4px;">Remarks / Notes</div>
                @bn($remarks)
            </div>
        @endif

        <!-- ডায়নামিক ফুটার -->
        <div class="footer">
            Generated on {{ $generatedAt }} &middot; Thank you for your business!
        </div>
    </div>
</body>

</html>
