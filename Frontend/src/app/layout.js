import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'CoreInventory',
  description: 'Modern Inventory Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text-primary antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
