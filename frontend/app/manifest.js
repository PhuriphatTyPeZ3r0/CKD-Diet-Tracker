export default function manifest() {
  return {
    name: "CKD Diet Tracker",
    short_name: "CKDDiet",
    description: "ระบบค้นหาและบันทึกอาหารสำหรับผู้ป่วยโรคไตเรื้อรังระยะที่ 3",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
