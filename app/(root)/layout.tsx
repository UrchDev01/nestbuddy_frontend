import SiteLayout from '@/components/SiteLayout';

export default function RootLayout({
        children,
}: Readonly<{
        children: React.ReactNode;
}>) {
        return <SiteLayout>{children}</SiteLayout>;
}
