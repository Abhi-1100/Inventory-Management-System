import './globals.css';

export const metadata = {
  title: 'CoreInventory',
  description: 'Modern Inventory Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text-primary antialiased">{children}</body>
    </html>
  );
}
