import { ThemeProvider } from "@/providers/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-bg-body text-fg-body">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
