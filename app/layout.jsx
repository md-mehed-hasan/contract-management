import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'SOAS Contract Signing',
  description: 'Contract upload, sending, tracking, and browser signing for SOAS.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
