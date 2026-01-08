import './globals.css';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <title>MIGRION™ | Move with certainty</title>
                <meta name="description" content="Outcome-based migration infrastructure." />
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}
