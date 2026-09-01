import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { settings } = usePage<SharedData>().props;

    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md">
                <AppLogoIcon className="size-8 object-cover" />
            </div>
            <div className="grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{settings.business_name || 'Launverse'}</span>
            </div>
        </>
    );
}
