import "./globals.css";
import { DateProvider } from '../context/DateContext';
import { LanguageProvider } from '../context/LanguageContext';
import Header from '../components/Header';

export const metadata = {
  title: "CKD Diet Tracker",
  description: "ระบบค้นหาและบันทึกอาหารสำหรับผู้ป่วยโรคไตเรื้อรังระยะที่ 3",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CKD Diet Tracker",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="bg-slate-50 text-slate-900 antialiased flex flex-col min-h-screen">
        <LanguageProvider>
          <DateProvider>
              <Header />
              <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                  {children}
              </main>
          </DateProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
