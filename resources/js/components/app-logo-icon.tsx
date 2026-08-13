import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return <img className="w-100" src="/logo3.jpeg" alt="App Logo" {...props} />;
}
