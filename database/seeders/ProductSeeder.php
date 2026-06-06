<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Categories
        $gents = Category::firstOrCreate(['name' => 'Gents Item'], ['slug' => 'gents-item']);
        $ladies = Category::firstOrCreate(['name' => 'Ladies Item'], ['slug' => 'ladies-item']);
        $kids = Category::firstOrCreate(['name' => 'Kids Item'], ['slug' => 'kids-item']);
        $household = Category::firstOrCreate(['name' => 'Household Item'], ['slug' => 'household-item']);
        $others = Category::firstOrCreate(['name' => 'Others Item'], ['slug' => 'others-item']);

        // Units
        $pcs = Unit::firstOrCreate(['short_name' => 'pcs'], ['name' => 'Pieces']);
        $sqft = Unit::firstOrCreate(['short_name' => 'sqft'], ['name' => 'Square Feet']);

        // Outlets (Kept from your original setup)
        $mainOutlet = Outlet::first() ?? Outlet::create(['name' => 'Main Outlet', 'location' => 'Dhaka']);
        $dhakaOutlet = Outlet::create(['name' => 'Dhaka Branch', 'location' => 'Dhaka']);

        $products = [
            // ================= GENTS ITEMS (জেন্টস আইটেম) =================
            ['name' => 'Shirt (শার্ট)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 15, 'outlet_prices' => []],
            ['name' => 'T-Shirt (টি-শার্ট)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 15, 'outlet_prices' => []],
            ['name' => 'Fatua (ফতুয়া)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 20, 'outlet_prices' => []],
            ['name' => 'Panjabi Cotton (পাঞ্জাবি সুতি)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 25, 'outlet_prices' => []],
            ['name' => 'Panjabi Cotton With Starch (পাঞ্জাবি সুতি - মাড় সহ)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 30, 'outlet_prices' => []],
            ['name' => 'Panjabi Silk (পাঞ্জাবি সিল্ক)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 40, 'outlet_prices' => []],
            ['name' => 'Jubba (জুব্বা)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 30, 'outlet_prices' => []],
            ['name' => 'Pant Formal (প্যান্ট ফরমাল)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 15, 'outlet_prices' => []],
            ['name' => 'Jeans Pant (জিন্স প্যান্ট)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 25, 'outlet_prices' => []],
            ['name' => 'Pajama (পায়জামা)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 15, 'outlet_prices' => []],
            ['name' => 'Trouser (টাউজার)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 15, 'outlet_prices' => []],
            ['name' => 'Half Pant (হাফ প্যান্ট)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 15, 'outlet_prices' => []],
            ['name' => 'Lungi With Starch (লুঙ্গি - মাড় সহ)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 25, 'outlet_prices' => []],
            ['name' => 'Shawl (শাল)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 40, 'outlet_prices' => []],
            ['name' => 'Sweater (সোয়েটার)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 80, 'outlet_prices' => []],
            ['name' => 'Sherwani Normal (শেরওয়ানি সাধারণ)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 170, 'outlet_prices' => []],
            ['name' => 'Sherwani Designer (শেরওয়ানি ডিজাইনার)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 250, 'outlet_prices' => []],
            ['name' => 'Blazer / Coat (ব্লেজার / কোট)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 120, 'outlet_prices' => []],
            ['name' => 'Suit 3 Pcs (স্যুট ৩ পিস)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 160, 'outlet_prices' => []],
            ['name' => 'Prince Coat (প্রিন্স কোট)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 120, 'outlet_prices' => []],
            ['name' => 'Koti (কটি)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 80, 'outlet_prices' => []],
            ['name' => 'Tie (টাই)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 15, 'outlet_prices' => []],
            ['name' => 'Jacket Fabric (জ্যাকেট কাপড়)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 80, 'outlet_prices' => []],
            ['name' => 'Jacket Leather (জ্যাকেট চামড়া)', 'category_id' => $gents->id, 'unit_id' => $pcs->id, 'price' => 180, 'outlet_prices' => []],

            // ================= LADIES ITEMS (লেডিস আইটেম) =================
            ['name' => 'Kameez / Kurti (কামিজ / কুর্তি)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 30, 'outlet_prices' => []],
            ['name' => '3 Piece Normal (৩ পিস সাধারণ)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 60, 'outlet_prices' => []],
            ['name' => '3 Piece Designer (৩ পিস ডিজাইনার)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 150, 'outlet_prices' => []],
            ['name' => 'Orna (ওড়না)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 30, 'outlet_prices' => []],
            ['name' => 'Hijab (হিজাব)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 20, 'outlet_prices' => []],
            ['name' => 'Scarf (স্কার্ফ)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 20, 'outlet_prices' => []],
            ['name' => 'Shirt (শার্ট)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 20, 'outlet_prices' => []],
            ['name' => 'Pant Formal (প্যান্ট ফরমাল)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 20, 'outlet_prices' => []],
            ['name' => 'Salwar (সিল্ক/সেলোয়ার)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 20, 'outlet_prices' => []],
            ['name' => 'Skirt (স্কার্ট)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 40, 'outlet_prices' => []],
            ['name' => 'Saree Cotton With Starch (শাড়ি সুতি - মাড় সহ)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 100, 'outlet_prices' => []],
            ['name' => 'Saree Benarasi Katan (শাড়ি বেনারসি কাতান)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 350, 'outlet_prices' => []],
            ['name' => 'Saree Georgette (শাড়ি জর্জেট)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 150, 'outlet_prices' => []],
            ['name' => 'Saree Jamdani Cotton (শাড়ি জামদানি সুতি)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 140, 'outlet_prices' => []],
            ['name' => 'Saree Silk (শাড়ি সিল্ক)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 160, 'outlet_prices' => []],
            ['name' => 'Lehenga (লেহেঙ্গা)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 350, 'outlet_prices' => []],
            ['name' => 'Gown Normal (গাউন সাধারণ)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 220, 'outlet_prices' => []],
            ['name' => 'Gown Designer (গাউন ডিজাইনার)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 300, 'outlet_prices' => []],
            ['name' => 'Blouse (ব্লাউজ)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 25, 'outlet_prices' => []],
            ['name' => 'Maxi (মেক্সি)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 35, 'outlet_prices' => []],
            ['name' => 'Petticoat (পেটিকোট)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 35, 'outlet_prices' => []],
            ['name' => 'Suit 2 Pcs (স্যুট ২ পিস)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 160, 'outlet_prices' => []],
            ['name' => 'Blazer (ব্লেজার)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 140, 'outlet_prices' => []],
            ['name' => 'Sweater (সোয়েটার)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 80, 'outlet_prices' => []],
            ['name' => 'Shawl (শাল)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 40, 'outlet_prices' => []],
            ['name' => 'Burqa (বোরকা)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 60, 'outlet_prices' => []],
            ['name' => 'Abaya (আবায়া)', 'category_id' => $ladies->id, 'unit_id' => $pcs->id, 'price' => 60, 'outlet_prices' => []],

            // ================= KIDS ITEMS (বাচ্চাদের আইটেম) =================
            ['name' => 'Shirt (শার্ট)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 15, 'outlet_prices' => []],
            ['name' => 'T-Shirt (টি-শার্ট)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 15, 'outlet_prices' => []],
            ['name' => 'Panjabi Cotton With Starch (পাঞ্জাবি সুতি - মাড় সহ)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 25, 'outlet_prices' => []],
            ['name' => 'Panjabi Silk (পাঞ্জাবি সিল্ক)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 30, 'outlet_prices' => []],
            ['name' => 'Pant (প্যান্ট)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 15, 'outlet_prices' => []],
            ['name' => 'Pajama (পায়জামা)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 15, 'outlet_prices' => []],
            ['name' => 'Trouser (টাউজার)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 15, 'outlet_prices' => []],
            ['name' => 'Kameez 2 Pcs (কামিজ ২ পিস)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 40, 'outlet_prices' => []],
            ['name' => 'Kameez 3 Pcs (কামিজ ৩ পিস)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 60, 'outlet_prices' => []],
            ['name' => 'Frock Heavy (ফ্রক - ভারী)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 120, 'outlet_prices' => []],
            ['name' => 'Orna (ওড়না)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 25, 'outlet_prices' => []],
            ['name' => 'Lehenga (লেহেঙ্গা)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 300, 'outlet_prices' => []],
            ['name' => 'School Dress (স্কুল ড্রেস)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 60, 'outlet_prices' => []],
            ['name' => 'Suit 3 Pcs (স্যুট ৩ পিস)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 160, 'outlet_prices' => []],
            ['name' => 'Blazer (ব্লেজার)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 100, 'outlet_prices' => []],
            ['name' => 'Jacket Fabric (জ্যাকেট কাপড়)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 60, 'outlet_prices' => []],
            ['name' => 'Jacket Leather (জ্যাকেট চামড়া)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 120, 'outlet_prices' => []],
            ['name' => 'Jacket Wool (জ্যাকেট উল)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 80, 'outlet_prices' => []],
            ['name' => 'Sherwani Normal (শেরওয়ানি সাধারণ)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 150, 'outlet_prices' => []],
            ['name' => 'Sherwani Designer (শেরওয়ানি ডিজাইনার)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 220, 'outlet_prices' => []],
            ['name' => 'Prince Coat (প্রিন্স কোট)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 80, 'outlet_prices' => []],
            ['name' => 'Tie (টাই)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 15, 'outlet_prices' => []],
            ['name' => 'Baby Blanket (বেবি কম্বল)', 'category_id' => $kids->id, 'unit_id' => $pcs->id, 'price' => 100, 'outlet_prices' => []],

            // ================= HOUSEHOLD ITEMS (গৃহস্থালি আইটেম) =================
            ['name' => 'Curtain Small (পর্দা ছোট)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 50, 'outlet_prices' => []],
            ['name' => 'Curtain Large (পর্দা বড়)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 70, 'outlet_prices' => []],
            ['name' => 'Curtain Small Heavy (পর্দা ছোট - ভারী)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 70, 'outlet_prices' => []],
            ['name' => 'Curtain Large Heavy (পর্দা বড় - ভারী)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 90, 'outlet_prices' => []],
            ['name' => 'Sofa Cover Small (সোফা কাভার ছোট)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 30, 'outlet_prices' => []],
            ['name' => 'Sofa Cover Large (সোফা কাভার বড়)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 50, 'outlet_prices' => []],
            ['name' => 'TV Cover (টিভি কাভার)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 30, 'outlet_prices' => []],
            ['name' => 'Table Cloth Small (টেবিল ক্লথ ছোট)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 30, 'outlet_prices' => []],
            ['name' => 'Table Cloth Large (টেবিল ক্লথ বড়)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 50, 'outlet_prices' => []],
            ['name' => 'Chair Cover (চেয়ার কাভার)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 25, 'outlet_prices' => []],
            ['name' => 'Bed Sheet Small (বেড শিট ছোট)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 30, 'outlet_prices' => []],
            ['name' => 'Bed Sheet Large (বেড শিট বড়)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 50, 'outlet_prices' => []],
            ['name' => 'Bed Cover Small (বেড কাভার ছোট)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 40, 'outlet_prices' => []],
            ['name' => 'Bed Cover Large (বেড কাভার বড়)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 60, 'outlet_prices' => []],
            ['name' => 'Pillow Cover (বালিশ কাভার)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 20, 'outlet_prices' => []],
            ['name' => 'Quilt Cover Small (লেপের কাভার ছোট)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 60, 'outlet_prices' => []],
            ['name' => 'Quilt Cover Large (লেপের কাভার বড়)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 80, 'outlet_prices' => []],
            ['name' => 'Kantha Small (কাঁথা ছোট)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 80, 'outlet_prices' => []],
            ['name' => 'Kantha Large (কাঁথা বড়)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 120, 'outlet_prices' => []],
            ['name' => 'Blanket Small (কম্বল ছোট)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 120, 'outlet_prices' => []],
            ['name' => 'Blanket Large (কম্বল বড়)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 150, 'outlet_prices' => []],
            ['name' => 'Comforter Small (কমফোর্টার ছোট)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 120, 'outlet_prices' => []],
            ['name' => 'Comforter Large (কমফোর্টার বড়)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 150, 'outlet_prices' => []],
            ['name' => 'Janamaz (জায়নামাজ)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 40, 'outlet_prices' => []],
            ['name' => 'Towel (টাওয়েল)', 'category_id' => $household->id, 'unit_id' => $pcs->id, 'price' => 40, 'outlet_prices' => []],

            // ================= OTHERS ITEMS (অন্যান্য আইটেম) =================
            ['name' => 'Doll Small (পুতুল ছোট)', 'category_id' => $others->id, 'unit_id' => $pcs->id, 'price' => 100, 'outlet_prices' => []],
            ['name' => 'Doll Medium (পুতুল মাঝারি)', 'category_id' => $others->id, 'unit_id' => $pcs->id, 'price' => 300, 'outlet_prices' => []],
            ['name' => 'Doll Large (পুতুল বড়)', 'category_id' => $others->id, 'unit_id' => $pcs->id, 'price' => 500, 'outlet_prices' => []],
            ['name' => 'Backpack (পিঠের ব্যাগ)', 'category_id' => $others->id, 'unit_id' => $pcs->id, 'price' => 200, 'outlet_prices' => []],
            ['name' => 'Carry Bag (কেরি ব্যাগ)', 'category_id' => $others->id, 'unit_id' => $pcs->id, 'price' => 250, 'outlet_prices' => []],
            ['name' => 'Sneakers (স্নিকার্স)', 'category_id' => $others->id, 'unit_id' => $pcs->id, 'price' => 150, 'outlet_prices' => []],
            ['name' => 'Ladies Handbag (লেডিস হ্যান্ড ব্যাগ)', 'category_id' => $others->id, 'unit_id' => $pcs->id, 'price' => 200, 'outlet_prices' => []],
            ['name' => 'Car Seat Cover Small (কার সিট কাভার ছোট)', 'category_id' => $others->id, 'unit_id' => $pcs->id, 'price' => 80, 'outlet_prices' => []],
            ['name' => 'Car Seat Cover Large (কার সিট কাভার বড়)', 'category_id' => $others->id, 'unit_id' => $pcs->id, 'price' => 150, 'outlet_prices' => []],
            ['name' => 'Carpet - Per SqFt (কার্পেট - স্কয়ার ফিট)', 'category_id' => $others->id, 'unit_id' => $sqft->id, 'price' => 15, 'outlet_prices' => []],
        ];

        foreach ($products as $pData) {
            $outletPrices = $pData['outlet_prices'];
            unset($pData['outlet_prices']);

            $product = Product::create($pData);

            foreach ($outletPrices as $op) {
                $product->outletPrices()->create($op);
            }
        }
    }
}
