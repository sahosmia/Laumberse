<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

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

        $products = [
            // ================= GENTS ITEMS (জেন্টস আইটেম) =================
            ['name' => 'Shirt - Gents (শার্ট)', 'category_id' => $gents->id, 'price' => 15],
            ['name' => 'T-Shirt - Gents (টি-শার্ট)', 'category_id' => $gents->id, 'price' => 15],
            ['name' => 'Fatua (ফতুয়া)', 'category_id' => $gents->id, 'price' => 20],
            ['name' => 'Panjabi Cotton (পাঞ্জাবি সুতি)', 'category_id' => $gents->id, 'price' => 25],
            ['name' => 'Panjabi Cotton With Starch - Gents (পাঞ্জাবি সুতি - মাড় সহ)', 'category_id' => $gents->id, 'price' => 30],
            ['name' => 'Panjabi Silk - Gents (পাঞ্জাবি সিল্ক)', 'category_id' => $gents->id, 'price' => 40],
            ['name' => 'Jubba (জুব্বা)', 'category_id' => $gents->id, 'price' => 30],
            ['name' => 'Pant Formal - Gents (প্যান্ট ফরমাল)', 'category_id' => $gents->id, 'price' => 15],
            ['name' => 'Jeans Pant (জিন্স প্যান্ট)', 'category_id' => $gents->id, 'price' => 25],
            ['name' => 'Pajama - Gents (পায়জামা)', 'category_id' => $gents->id, 'price' => 15],
            ['name' => 'Trouser - Gents (টাউজার)', 'category_id' => $gents->id, 'price' => 15],
            ['name' => 'Half Pant (হাফ প্যান্ট)', 'category_id' => $gents->id, 'price' => 15],
            ['name' => 'Lungi With Starch (লুঙ্গি - মাড় সহ)', 'category_id' => $gents->id, 'price' => 25],
            ['name' => 'Shawl - Gents (শাল)', 'category_id' => $gents->id, 'price' => 40],
            ['name' => 'Sweater - Gents (সোয়েটার)', 'category_id' => $gents->id, 'price' => 80],
            ['name' => 'Sherwani Normal - Gents (শেরওয়ানি সাধারণ)', 'category_id' => $gents->id, 'price' => 170],
            ['name' => 'Sherwani Designer - Gents (শেরওয়ানি ডিজাইনার)', 'category_id' => $gents->id, 'price' => 250],
            ['name' => 'Blazer / Coat (ব্লেজার / কোট)', 'category_id' => $gents->id, 'price' => 120],
            ['name' => 'Suit 3 Pcs - Gents (স্যুট ৩ পিস)', 'category_id' => $gents->id, 'price' => 160],
            ['name' => 'Prince Coat - Gents (প্রিন্স কোট)', 'category_id' => $gents->id, 'price' => 120],
            ['name' => 'Koti (কটি)', 'category_id' => $gents->id, 'price' => 80],
            ['name' => 'Tie - Gents (টাই)', 'category_id' => $gents->id, 'price' => 15],
            ['name' => 'Jacket Fabric - Gents (জ্যাকেট কাপড়)', 'category_id' => $gents->id, 'price' => 80],
            ['name' => 'Jacket Leather - Gents (জ্যাকেট চামড়া)', 'category_id' => $gents->id, 'price' => 180],

            // ================= LADIES ITEMS (লেডিস আইটেম) =================
            ['name' => 'Kameez / Kurti (কামিজ / কুর্তি)', 'category_id' => $ladies->id, 'price' => 30],
            ['name' => '3 Piece Normal (৩ পিস সাধারণ)', 'category_id' => $ladies->id, 'price' => 60],
            ['name' => '3 Piece Designer (৩ পিস ডিজাইনার)', 'category_id' => $ladies->id, 'price' => 150],
            ['name' => 'Orna - Ladies (ওড়না)', 'category_id' => $ladies->id, 'price' => 30],
            ['name' => 'Hijab (হিজাব)', 'category_id' => $ladies->id, 'price' => 20],
            ['name' => 'Scarf (স্কার্ফ)', 'category_id' => $ladies->id, 'price' => 20],
            ['name' => 'Shirt - Ladies (শার্ট)', 'category_id' => $ladies->id, 'price' => 20],
            ['name' => 'Pant Formal - Ladies (প্যান্ট ফরমাল)', 'category_id' => $ladies->id, 'price' => 20],
            ['name' => 'Salwar (সিল্ক/সেলোয়ার)', 'category_id' => $ladies->id, 'price' => 20],
            ['name' => 'Skirt (স্কার্ট)', 'category_id' => $ladies->id, 'price' => 40],
            ['name' => 'Saree Cotton With Starch (শাড়ি সুতি - মাড় সহ)', 'category_id' => $ladies->id, 'price' => 100],
            ['name' => 'Saree Benarasi Katan (শাড়ি বেনারসি কাতান)', 'category_id' => $ladies->id, 'price' => 350],
            ['name' => 'Saree Georgette (শাড়ি জর্জেট)', 'category_id' => $ladies->id, 'price' => 150],
            ['name' => 'Saree Jamdani Cotton (শাড়ি জামদানি সুতি)', 'category_id' => $ladies->id, 'price' => 140],
            ['name' => 'Saree Silk (শাড়ি সিল্ক)', 'category_id' => $ladies->id, 'price' => 160],
            ['name' => 'Lehenga - Ladies (লেহেঙ্গা)', 'category_id' => $ladies->id, 'price' => 350],
            ['name' => 'Gown Normal (গাউন সাধারণ)', 'category_id' => $ladies->id, 'price' => 220],
            ['name' => 'Gown Designer (গাউন ডিজাইনার)', 'category_id' => $ladies->id, 'price' => 300],
            ['name' => 'Blouse (ব্লাউজ)', 'category_id' => $ladies->id, 'price' => 25],
            ['name' => 'Maxi (মেক্সি)', 'category_id' => $ladies->id, 'price' => 35],
            ['name' => 'Petticoat (পেটিকোট)', 'category_id' => $ladies->id, 'price' => 35],
            ['name' => 'Suit 2 Pcs (স্যুট ২ পিস)', 'category_id' => $ladies->id, 'price' => 160],
            ['name' => 'Blazer - Ladies (ব্লেজার)', 'category_id' => $ladies->id, 'price' => 140],
            ['name' => 'Sweater - Ladies (সোয়েটার)', 'category_id' => $ladies->id, 'price' => 80],
            ['name' => 'Shawl - Ladies (শাল)', 'category_id' => $ladies->id, 'price' => 40],
            ['name' => 'Burqa (বোরকা)', 'category_id' => $ladies->id, 'price' => 60],
            ['name' => 'Abaya (আবায়া)', 'category_id' => $ladies->id, 'price' => 60],

            // ================= KIDS ITEMS (বাচ্চাদের আইটেম) =================
            ['name' => 'Shirt - Kids (শার্ট)', 'category_id' => $kids->id, 'price' => 15],
            ['name' => 'T-Shirt - Kids (টি-শার্ট)', 'category_id' => $kids->id, 'price' => 15],
            ['name' => 'Panjabi Cotton With Starch - Kids (পাঞ্জাবি সুতি - মাড় সহ)', 'category_id' => $kids->id, 'price' => 25],
            ['name' => 'Panjabi Silk - Kids (পাঞ্জাবি সিল্ক)', 'category_id' => $kids->id, 'price' => 30],
            ['name' => 'Pant (প্যান্ট)', 'category_id' => $kids->id, 'price' => 15],
            ['name' => 'Pajama - Kids (পায়জামা)', 'category_id' => $kids->id, 'price' => 15],
            ['name' => 'Trouser - Kids (টাউজার)', 'category_id' => $kids->id, 'price' => 15],
            ['name' => 'Kameez 2 Pcs (কামিজ ২ পিস)', 'category_id' => $kids->id, 'price' => 40],
            ['name' => 'Kameez 3 Pcs (কামিজ ৩ পিস)', 'category_id' => $kids->id, 'price' => 60],
            ['name' => 'Frock Heavy (ফ্রক - ভারী)', 'category_id' => $kids->id, 'price' => 120],
            ['name' => 'Orna - Kids (ওড়না)', 'category_id' => $kids->id, 'price' => 25],
            ['name' => 'Lehenga - Kids (লেহেঙ্গা)', 'category_id' => $kids->id, 'price' => 300],
            ['name' => 'School Dress (স্কুল ড্রেস)', 'category_id' => $kids->id, 'price' => 60],
            ['name' => 'Suit 3 Pcs - Kids (স্যুট ৩ পিস)', 'category_id' => $kids->id, 'price' => 160],
            ['name' => 'Blazer - Kids (ব্লেজার)', 'category_id' => $kids->id, 'price' => 100],
            ['name' => 'Jacket Fabric - Kids (জ্যাকেট কাপড়)', 'category_id' => $kids->id, 'price' => 60],
            ['name' => 'Jacket Leather - Kids (জ্যাকেট চামড়া)', 'category_id' => $kids->id, 'price' => 120],
            ['name' => 'Jacket Wool (জ্যাকেট উল)', 'category_id' => $kids->id, 'price' => 80],
            ['name' => 'Sherwani Normal - Kids (শেরওয়ানি সাধারণ)', 'category_id' => $kids->id, 'price' => 150],
            ['name' => 'Sherwani Designer - Kids (শেরওয়ানি ডিজাইনার)', 'category_id' => $kids->id, 'price' => 220],
            ['name' => 'Prince Coat - Kids (প্রিন্স কোট)', 'category_id' => $kids->id, 'price' => 80],
            ['name' => 'Tie - Kids (টাই)', 'category_id' => $kids->id, 'price' => 15],
            ['name' => 'Baby Blanket (বেবি কম্বল)', 'category_id' => $kids->id, 'price' => 100],

            // ================= HOUSEHOLD ITEMS (গৃহস্থালি আইটেম) =================
            ['name' => 'Curtain Small (পর্দা ছোট)', 'category_id' => $household->id, 'price' => 50],
            ['name' => 'Curtain Large (পর্দা বড়)', 'category_id' => $household->id, 'price' => 70],
            ['name' => 'Curtain Small Heavy (পর্দা ছোট - ভারী)', 'category_id' => $household->id, 'price' => 70],
            ['name' => 'Curtain Large Heavy (পর্দা বড় - ভারী)', 'category_id' => $household->id, 'price' => 90],
            ['name' => 'Sofa Cover Small (সোফা কাভার ছোট)', 'category_id' => $household->id, 'price' => 30],
            ['name' => 'Sofa Cover Large (সোফা কাভার বড়)', 'category_id' => $household->id, 'price' => 50],
            ['name' => 'TV Cover (টিভি কাভার)', 'category_id' => $household->id, 'price' => 30],
            ['name' => 'Table Cloth Small (টেবিল ক্লথ ছোট)', 'category_id' => $household->id, 'price' => 30],
            ['name' => 'Table Cloth Large (টেবিল ক্লথ বড়)', 'category_id' => $household->id, 'price' => 50],
            ['name' => 'Chair Cover (চেয়ার কাভার)', 'category_id' => $household->id, 'price' => 25],
            ['name' => 'Bed Sheet Small (বেড শিট ছোট)', 'category_id' => $household->id, 'price' => 30],
            ['name' => 'Bed Sheet Large (বেড শিট বড়)', 'category_id' => $household->id, 'price' => 50],
            ['name' => 'Bed Cover Small (বেড কাভার ছোট)', 'category_id' => $household->id, 'price' => 40],
            ['name' => 'Bed Cover Large (বেড কাভার বড়)', 'category_id' => $household->id, 'price' => 60],
            ['name' => 'Pillow Cover (বালিশ কাভার)', 'category_id' => $household->id, 'price' => 20],
            ['name' => 'Quilt Cover Small (লেপের কাভার ছোট)', 'category_id' => $household->id, 'price' => 60],
            ['name' => 'Quilt Cover Large (লেপের কাভার বড়)', 'category_id' => $household->id, 'price' => 80],
            ['name' => 'Kantha Small (কাঁথা ছোট)', 'category_id' => $household->id, 'price' => 80],
            ['name' => 'Kantha Large (কাঁথা বড়)', 'category_id' => $household->id, 'price' => 120],
            ['name' => 'Blanket Small (কম্বল ছোট)', 'category_id' => $household->id, 'price' => 120],
            ['name' => 'Blanket Large (কম্বল বড়)', 'category_id' => $household->id, 'price' => 150],
            ['name' => 'Comforter Small (কমফোর্টার ছোট)', 'category_id' => $household->id, 'price' => 120],
            ['name' => 'Comforter Large (কমফোর্টার বড়)', 'category_id' => $household->id, 'price' => 150],
            ['name' => 'Janamaz (জায়নামাজ)', 'category_id' => $household->id, 'price' => 40],
            ['name' => 'Towel (টাওয়েল)', 'category_id' => $household->id, 'price' => 40],

            // ================= OTHERS ITEMS (অন্যান্য আইটেম) =================
            ['name' => 'Doll Small (পুতুল ছোট)', 'category_id' => $others->id, 'price' => 100],
            ['name' => 'Doll Medium (পুতুল মাঝারি)', 'category_id' => $others->id, 'price' => 300],
            ['name' => 'Doll Large (পুতুল বড়)', 'category_id' => $others->id, 'price' => 500],
            ['name' => 'Backpack (পিঠের ব্যাগ)', 'category_id' => $others->id, 'price' => 200],
            ['name' => 'Carry Bag (কেরি ব্যাগ)', 'category_id' => $others->id, 'price' => 250],
            ['name' => 'Sneakers (স্নিকার্স)', 'category_id' => $others->id, 'price' => 150],
            ['name' => 'Ladies Handbag (লেডিস হ্যান্ড ব্যাগ)', 'category_id' => $others->id, 'price' => 200],
            ['name' => 'Car Seat Cover Small (কার সিট কাভার ছোট)', 'category_id' => $others->id, 'price' => 80],
            ['name' => 'Car Seat Cover Large (কার সিট কাভার বড়)', 'category_id' => $others->id, 'price' => 150],
            ['name' => 'Carpet - Per SqFt (কার্পেট - স্কয়ার ফিট)', 'category_id' => $others->id, 'price' => 15],
        ];

        foreach ($products as $pData) {
            Product::create($pData);
        }
    }
}
