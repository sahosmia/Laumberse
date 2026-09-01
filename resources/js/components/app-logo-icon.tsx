import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    const { settings } = usePage<SharedData>().props;

    return <img className="w-100" src={settings.logo_url || '/logo3.jpeg'} alt={settings.business_name || 'App Logo'} {...props} />;
}
