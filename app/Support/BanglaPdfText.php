<?php

namespace App\Support;

use MirazMac\BanglaString\Translator\AvroToBijoy\Translator;

/**
 * DOMPDF can't shape Bangla Unicode glyphs correctly, so any Bangla run in a PDF gets converted to
 * legacy Bijoy encoding and rendered in a Bijoy-compatible font (SutonnyMJ) instead. Non-Bangla runs
 * are left untouched — the surrounding SolaimanLipi/Helvetica stack already renders those fine.
 *
 * Used from Blade PDF views via the `@bn(...)` directive (registered in AppServiceProvider) rather
 * than called directly, so views stay free of business/formatting logic.
 */
class BanglaPdfText
{
    private const BANGLA_CHAR = '/[\x{0980}-\x{09FF}]/u';

    private static ?Translator $translator = null;

    public static function render(?string $text): string
    {
        if (empty($text)) {
            return '';
        }

        $parts = preg_split('/([\x{0980}-\x{09FF}]+)/u', $text, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);

        $html = '';
        foreach ($parts as $part) {
            $html .= preg_match(self::BANGLA_CHAR, $part)
                ? '<span style="font-family: \'SutonnyMJ\'; font-size: 16px;">'.htmlspecialchars(self::translator()->translate($part), ENT_QUOTES, 'UTF-8').'</span>'
                : htmlspecialchars($part, ENT_QUOTES, 'UTF-8');
        }

        return $html;
    }

    private static function translator(): Translator
    {
        return self::$translator ??= new Translator;
    }
}
