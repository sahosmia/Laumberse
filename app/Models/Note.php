<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'details', 'note_category_id'];

    public function category()
    {
        return $this->belongsTo(NoteCategory::class, 'note_category_id');
    }
}
