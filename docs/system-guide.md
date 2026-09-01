# Launverse সিস্টেম গাইড (বাংলা)

এই ডকুমেন্টটা লেখা হয়েছে যাতে বোঝা যায় — সিস্টেমে একটা ইনপুট (ইনভয়েস, খরচ, ইনভেস্টর, লোন, স্টাফ অ্যাডভান্স ইত্যাদি) দিলে সেটা ঠিক **কোথায় কোথায় প্রভাব ফেলে**, টাকাটা আসলে **কোন পথে যায়**, এবং Financial Position রিপোর্টের প্রতিটা সংখ্যা **কিভাবে হিসাব হয়**। কোড পড়ে-পড়ে যাচাই করে লেখা — অনুমান নয়।

---

## ১. আউটলেট সিস্টেম — সব হিসাবের ভিত্তি

সিস্টেমে একাধিক আউটলেট (শাখা) থাকতে পারে। প্রায় প্রতিটা টেবিলে (`invoices`, `expenses`, `accounts`, `investor_transactions`, `company_loan_transactions`, `employees`, `assets`, `client_activities`...) একটা `outlet_id` কলাম আছে।

- **সাধারণ ইউজার**: শুধু নিজের অ্যাসাইন করা আউটলেটের ডেটা দেখে/তৈরি করে। এটা override করা যায় না।
- **যাদের `outlets.switch` পারমিশন আছে** (যেমন Admin): তারা উপরে থেকে আউটলেট বদলাতে পারে, অথবা **"All Outlets"** মোডে যেতে পারে — তখন সব আউটলেটের ডেটা একসাথে দেখা যায়।
- **"All Outlets" মোডে নতুন কিছু তৈরি করলে** (ইনভয়েস, খরচ, ইনভেস্টর ইত্যাদি) — outlet সিলেক্ট করা বাধ্যতামূলক, কারণ প্রতিটা রেকর্ডকে ঠিক একটা আউটলেটের নামে লিখতে হয়। কোন আউটলেট সিলেক্ট না করলে সিস্টেম ভ্যালিডেশন এরর দেখাবে।

**এর মানে**: Dashboard, Reports, Financial Position — সবকিছুই এই "এখন কোন আউটলেট দেখছি" এর উপর নির্ভর করে ফিল্টার হয়। একই ডেটা একজন ম্যানেজারের কাছে শুধু তার আউটলেটেরটাই দেখাবে, কিন্তু Admin "All Outlets" এ গেলে সব একসাথে দেখাবে।

**Investor/Company Loan একটা ব্যতিক্রম**: বিনিয়োগকারী (Investor) বা ঋণদাতা (Company Loan-এর lender) নিজে **গ্লোবাল** — একই ইনভেস্টর একাধিক আউটলেটে টাকা দিতে পারে। কিন্তু তার প্রতিটা **লেনদেন** (invest/withdraw, loan/repay) — তার opening balance-সহ — নির্দিষ্ট একটা আউটলেটের নামে জমা হয়।

---

## ২. টাকা কোথায় যায় — মূল প্রবাহ

সিস্টেমের প্রতিটা আর্থিক লেনদেন শেষ পর্যন্ত একটা **Account** (ব্যাংক/ক্যাশ অ্যাকাউন্ট)-এ গিয়ে জমা হয়, `AccountTransaction` লেজারে রেকর্ড হয়ে। দুই ধরনের এন্ট্রি:

- **Credit** = অ্যাকাউন্টে টাকা ঢুকল (balance বাড়ল)
- **Debit** = অ্যাকাউন্ট থেকে টাকা বের হলো (balance কমল)

| ঘটনা | Account-এ কী হয় | কোন মডেলে ইতিহাস থাকে |
|---|---|---|
| ইনভয়েসে পেমেন্ট নেওয়া হলো (`paid` > 0) | **Credit** | কোনো আলাদা ট্রানজেকশন টেবিল নেই — `Invoice.paid`/`due` নিজেই লাইভ ভ্যালু |
| খরচ (Expense) রেকর্ড করা হলো | **Debit** | — |
| ইনভেস্টর টাকা বিনিয়োগ করলেন (`invest`, opening balance সহ) | **Credit** | `InvestorTransaction` |
| ইনভেস্টর টাকা তুলে নিলেন (`withdraw`) | **Debit** | `InvestorTransaction` |
| কোম্পানি লোন নিলো (`loan`, শুরুর অ্যামাউন্ট সহ) | **Credit** | `CompanyLoanTransaction` |
| কোম্পানি লোন শোধ করলো (`repay`) | **Debit** | `CompanyLoanTransaction` |
| স্টাফকে অ্যাডভান্স/লোন দেওয়া হলো | **Debit** | `EmployeeTransaction` |
| স্টাফ অ্যাডভান্স ফেরত দিলো (`loan_return`) | **Credit** | `EmployeeTransaction` |

তাহলে **যেকোনো Account-এর `current_balance`** = তার `opening_balance` + এই সব credit/debit-এর যোগফল। এটাই ক্যাশ/ব্যাংকে আসলে কত টাকা আছে তার লাইভ হিসাব।

### Invoice-এর নিজস্ব হিসাব (আলাদা রুট)

ইনভয়েস একটু আলাদা — এখানে দুটো জিনিস আলাদাভাবে ট্র্যাক হয়:

1. **`Invoice.status`** — অর্ডারের অবস্থা: `Pending → Processing → In House → Delivered` (অথবা `Cancelled`)। এটা **কাজ কতদূর এগোলো** তার হিসাব, টাকার না।
2. **`Invoice.paid` / `Invoice.due` / `payment_status`** — টাকার হিসাব: কত পাওয়া গেছে, কত বাকি। `due` না থাকলে (`<= 0`) `payment_status = Paid`, নাহলে `Unpaid`।

পেমেন্ট নেওয়ার সময় (create বা পরে আলাদা পেমেন্ট-আপডেট থেকে) `paid` অ্যামাউন্ট যদি ০-এর বেশি হয় এবং একটা Account সিলেক্ট করা থাকে, তখনই সেই টাকা Account-এ **credit** হয়ে জমা হয়। একই সাথে ক্লায়েন্টের `total_paid`/`total_due` (গ্লোবাল, সব আউটলেট মিলিয়ে) আপডেট হয়।

**গুরুত্বপূর্ণ**: `status = Processing`/`Pending`/`In House` অবস্থায় থাকা কোনো ইনভয়েসের বাকি টাকা (`due`) কে সিস্টেম আর "পাওনা" হিসেবে গণ্য করে না Financial Position-এ (নিচে দেখুন) — কারণ ডেলিভারি না হওয়া পর্যন্ত এটা একটা নিশ্চিত বিক্রি না।

---

## ৩. Financial Position রিপোর্ট — প্রতিটা সংখ্যা কিভাবে হিসাব হয়

`GetFinancialPositionAction` — এই একটা ফাইলেই পুরো রিপোর্টের লজিক। রিপোর্টে দুই পাশ:

### দায় (Liabilities)

**Capital (মূলধন)**
- একটা নির্দিষ্ট আউটলেট দেখলে: সেই আউটলেটের সব `InvestorTransaction`-এর যোগফল — `invest` হলে +, `withdraw` হলে −। (Investor-এর নিজের `current_balance` কলাম ব্যবহার হয় **না়**, কারণ সেটা সব আউটলেট মিলিয়ে গ্লোবাল টোটাল — একটা আউটলেটের হিসাবে সেটা ব্যবহার করলে ভুল/ডাবল-কাউন্ট হবে।)
- "All Outlets" মোডে (তারিখ ছাড়া): প্রতিটা ইনভেস্টরের `current_balance` কলাম সরাসরি যোগ হয় — এটাই তখন সঠিক কোম্পানি-ওয়াইড টোটাল।

**Company Loan** — একই নিয়ম, শুধু `InvestorTransaction`-এর জায়গায় `CompanyLoanTransaction` (`loan` = +, `repay` = −)।

**Gross Profit (নিট লাভ/লোকসান)** — এটা কোনো আলাদা হিসাব থেকে আসে না, বরং **ব্যালান্স করার সংখ্যা**:
```
Gross Profit = মোট সম্পদ − (Capital + Company Loan)
```
মানে দায় আর সম্পদ সবসময় সমান হবেই — এই লাইনটাই সেই ভারসাম্য তৈরি করে। এটাই মূলত এখন পর্যন্ত না-হিসাব-করা লাভ/লোকসান।

*(Sundry Creditors আর Other Liabilities সিস্টেমে ট্র্যাকই হয় না — কোনো vendor-payable বা inventory concept নেই — তাই এই দুইটা সবসময় ০।)*

### সম্পদ (Assets)

**Sundry Debtors (বাকি পাওনা)**
- শুধুমাত্র **`Delivered`** status-এর ইনভয়েসের `due` যোগ হয় (ক্লায়েন্ট-ভিত্তিক গ্রুপ করে)।
- `Pending`/`Processing`/`In House` অবস্থার ইনভয়েসের বাকি টাকা এখানে **আসে না** — ডেলিভারি না হলে সেটা এখনো নিশ্চিত বিক্রি না।
- `Cancelled` ইনভয়েসের বাকিও কখনো পাওনা হিসেবে গণ্য হয় না।
- ক্লায়েন্টের গ্লোবাল `total_due` কলাম এখানে ব্যবহার হয় না (ওটা সব আউটলেট মিলিয়ে) — বরং সরাসরি Invoice টেবিল থেকে ঐ আউটলেটের হিসাব বের করা হয়।

**Cash at Bank** — প্রতিটা Account-এর `current_balance`-এর যোগফল।

**Company / Staff Advances** — প্রতিটা কর্মচারীর `current_balance` (opening balance + সব `loan`/`loan_return` ট্রানজেকশনের যোগফল), শুধু যাদের ব্যালান্স ০ না তারাই তালিকায় আসে।

**Other Assets** — যেসব Asset (মেশিন, ফার্নিচার ইত্যাদি) এখনো **disposed (বাতিল/বিক্রি) হয়নি**, তাদের `cost`-এর যোগফল। Disposed হয়ে গেলে সেটা আর সম্পদ হিসেবে গণ্য হয় না।

### As of Date (একটা নির্দিষ্ট তারিখ পর্যন্ত হিসাব)

তারিখ দিলে যেগুলো রিক্যালকুলেট হয় (কারণ এদের **তারিখসহ লেজার** আছে):
- Capital, Company Loan — `InvestorTransaction.date` / `CompanyLoanTransaction.date` অনুযায়ী ফিল্টার
- Cash at Bank — `AccountTransaction.created_at` অনুযায়ী (এই টেবিলে আলাদা `date` কলাম নেই, তাই তৈরির সময়টাই ব্যবহার হয়)
- Staff Advances — `EmployeeTransaction.date` অনুযায়ী

যেগুলো **কখনো তারিখ-ভিত্তিক হয় না**, সবসময় বর্তমান হিসাব দেখায়:
- **Sundry Debtors** — কারণ `Invoice.due` একটা লাইভ ভ্যালু, এর কোনো পেমেন্ট-হিস্ট্রি রাখা হয় না (কবে কত পেমেন্ট হয়েছিল তা সংরক্ষিত নয়)।
- **Other Assets** — কারণ কোনো Asset কবে disposed হয়েছিল তার কোনো টাইমস্ট্যাম্প রাখা হয় না, শুধু বর্তমান status থাকে।

এই দুইটার জন্য অতীতের হিসাব বানানো মানে ইতিহাস "কল্পনা" করা — তাই এগুলো সবসময় আজকের সংখ্যা দেখায়, তারিখ যাই দেওয়া হোক না কেন।

---

## ৪. একটা ইনপুট দিলে কোথায় কোথায় প্রভাব পড়ে

| আপনি যা করলেন | সাথে সাথে যা বদলায় | Financial Position-এ প্রভাব |
|---|---|---|
| নতুন ইনভয়েস তৈরি, `paid` দিয়ে টাকা নেওয়া হলো | Account-এ credit, ক্লায়েন্টের `total_paid`/`total_due` আপডেট | ইনভয়েস `Delivered` না হওয়া পর্যন্ত Debtors-এ যুক্ত হয় না; কিন্তু পেমেন্ট নেওয়া অংশ সাথে সাথে Cash at Bank বাড়ায় |
| ইনভয়েসের status `Delivered`-এ পরিবর্তন করা হলো | শুধু status বদলায়, টাকার লেনদেন হয় না | যদি ইনভয়েসে বাকি (`due`) থাকে, সেটা এখন Sundry Debtors-এ দেখাবে |
| ইনভয়েস `Cancelled` করা হলো | status বদলায় | সেই ইনভয়েসের বাকি কখনো Debtors-এ দেখাবে না |
| নতুন খরচ (Expense) রেকর্ড করা হলো | Account-এ debit | Cash at Bank কমে, ফলে মোট সম্পদ কমে → Gross Profit কমে |
| ইনভেস্টর নতুন opening balance নিয়ে যুক্ত হলো | সেই আউটলেটে `InvestorTransaction (invest)` তৈরি, Account-এ credit | ঐ আউটলেটের Capital বাড়ে, Cash at Bank-ও বাড়ে |
| ইনভেস্টর টাকা তুলে নিলো | Account-এ debit | Capital কমে, Cash at Bank কমে |
| কোম্পানি লোন নেওয়া হলো | Account-এ credit | Company Loan বাড়ে, Cash at Bank বাড়ে |
| লোন কিস্তি শোধ করা হলো | Account-এ debit | Company Loan কমে, Cash at Bank কমে |
| স্টাফকে অ্যাডভান্স দেওয়া হলো | Account-এ debit | Staff Advances বাড়ে, Cash at Bank কমে (মোট সম্পদ একই থাকে — এক জায়গা থেকে আরেক জায়গায় সরলো) |
| স্টাফ অ্যাডভান্স ফেরত দিলো | Account-এ credit | Staff Advances কমে, Cash at Bank বাড়ে |
| একটা Asset (মেশিন ইত্যাদি) disposed করা হলো | Asset-এর status বদলায় | Other Assets থেকে তার cost বাদ যায়, মোট সম্পদ কমে |
| আউটলেট পরিবর্তন / "All Outlets" এ যাওয়া | কোনো ডেটা বদলায় না | শুধু **কী দেখানো হচ্ছে** সেটা বদলায় — সব রিপোর্ট (Dashboard, Reports, Financial Position) নতুন স্কোপ অনুযায়ী রিক্যালকুলেট হয় |

**সংক্ষেপে মনে রাখার নিয়ম**: Cash at Bank, Capital, Company Loan, Staff Advances — এই চারটার প্রতিটা পরিবর্তনের পেছনে একটা প্রকৃত টাকার লেনদেন (Account credit/debit) আছে, তাই এদের তারিখ-ভিত্তিক ইতিহাস টানা যায়। Sundry Debtors আর Other Assets শুধু **বর্তমান অবস্থা** (status) থেকে হিসাব হয়, কোনো লেনদেন-লেজার নেই — তাই এদের অতীতের হিসাব দেখানো সম্ভব না।

---

## ৫. দ্রুত রেফারেন্স — কোন ফাইলে কী

| কী বুঝতে চান | ফাইল |
|---|---|
| আউটলেট স্কোপিং-এর মূল লজিক | `app/Support/OutletContext.php` |
| Financial Position-এর হিসাব | `app/Actions/Reports/GetFinancialPositionAction.php` |
| Dashboard-এর সংখ্যাগুলো | `app/Actions/Dashboard/GetDashboardMetricsAction.php` |
| Reports & Analytics-এর হিসাব | `app/Actions/Reports/GetReportSummaryAction.php`, `app/Support/PeriodResolver.php` |
| ইনভয়েস তৈরি/পেমেন্ট লজিক | `app/Services/InvoiceService.php` |
| Account-এ টাকা জমা/খরচ করার একমাত্র জায়গা | `app/Services/AccountService.php` (`recordTransaction()`) |
| ইনভেস্টর লেনদেন | `app/Services/InvestorService.php` |
| কোম্পানি লোন লেনদেন | `app/Services/CompanyLoanService.php` |
| স্টাফ অ্যাডভান্স লেনদেন | `app/Services/EmployeeTransactionService.php` |
