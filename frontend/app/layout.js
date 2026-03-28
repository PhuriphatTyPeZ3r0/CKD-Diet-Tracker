import "./globals.css";
import { DateProvider } from '../context/DateContext';
import Header from '../components/Header';

export const metadata = {
  title: "CKD Diet Tracker",
  description: "ระบบค้นหาและบันทึกอาหารสำหรับผู้ป่วยโรคไตเรื้อรังระยะที่ 3",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="bg-slate-50 text-slate-900 antialiased flex flex-col min-h-screen">
        <DateProvider>
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </DateProvider>
      </body>
    </html>
  );
}
