"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle,
  Info,
  Plus,
  Search,
  Utensils,
  X,
  XCircle,
} from "lucide-react";

const foodDatabase = [
  {
    id: 1,
    name: "ไข่ขาว",
    category: "โปรตีน",
    status: "safe",
    reason:
      "ปราศจากฟอสฟอรัสอย่างสิ้นเชิง และมีโปรตีนอัลบูมินช่วยลดอาการบวมน้ำ (มาตรฐานทองคำ)",
    image: "🥚",
  },
  {
    id: 2,
    name: "ปลากระพง",
    category: "โปรตีน",
    status: "safe",
    reason: "แหล่งโปรตีนชั้นเลิศ มีโอเมก้า-3 ต้านการอักเสบ",
    image: "🐟",
  },
  {
    id: 3,
    name: "เนื้อวัว",
    category: "โปรตีน",
    status: "danger",
    reason: "เส้นใยกล้ามเนื้อซับซ้อน เกิดของเสียไนโตรเจนและพิวรีนสูง ไตทำงานหนัก",
    image: "🥩",
  },
  {
    id: 4,
    name: "ปูอัด / ลูกชิ้น",
    category: "โปรตีน",
    status: "danger",
    reason:
      "มีฟอสเฟตอนินทรีย์สูง ดูดซึมเข้าเลือด 100% ทำให้ฟอสฟอรัสพุ่งเฉียบพลัน",
    image: "🍢",
  },
  {
    id: 5,
    name: "วุ้นเส้น / สาคู",
    category: "คาร์โบไฮเดรต",
    status: "safe",
    reason: "แป้งปลอดโปรตีน ให้พลังงานแต่ไม่เพิ่มภาระไนโตรเจนให้ไต",
    image: "🍜",
  },
  {
    id: 6,
    name: "ข้าวขาวเสาไห้",
    category: "คาร์โบไฮเดรต",
    status: "safe",
    reason:
      "ขัดสีแล้ว กำจัดฟอสฟอรัสและโพแทสเซียมออกไป ปลอดภัยกว่าข้าวกล้อง",
    image: "🍚",
  },
  {
    id: 7,
    name: "ข้าวกล้อง / โฮลวีท",
    category: "คาร์โบไฮเดรต",
    status: "danger",
    reason:
      "มีกรดไฟติกสูง (กักเก็บฟอสฟอรัส) และโพแทสเซียมสูง นำไปสู่เกลือแร่เสียสมดุล",
    image: "🌾",
  },
  {
    id: 8,
    name: "มะเขือเปราะ / บวบ",
    category: "ผัก",
    status: "safe",
    reason: "กลุ่มผักสีอ่อน โพแทสเซียมต่ำ",
    image: "🍆",
  },
  {
    id: 9,
    name: "มะเขือเทศ",
    category: "ผัก",
    status: "warning",
    reason:
      "ทานได้พอเหมาะ (ฝานบางๆ) ถ้าระดับโพแทสเซียมในเลือดปกติ ห้ามทานเยอะ",
    image: "🍅",
  },
  {
    id: 10,
    name: "ยอดตำลึง / ชะอม",
    category: "ผัก",
    status: "danger",
    reason:
      "ผักยอดมีเซลล์แบ่งตัว กระจุกตัวของโพแทสเซียม ฟอสฟอรัส และพิวรีนสูงมาก",
    image: "🌿",
  },
  {
    id: 11,
    name: "สาลี่ / ส้มโอ",
    category: "ผลไม้",
    status: "safe",
    reason: "ผลไม้โพแทสเซียมต่ำ ทานได้ 1 ส่วนต่อมื้อ (6-8 ชิ้นคำ)",
    image: "🍐",
  },
  {
    id: 12,
    name: "กล้วย / กีวี่ / อะโวคาโด",
    category: "ผลไม้",
    status: "danger",
    reason:
      "ระเบิดโพแทสเซียม (Potassium bombs) เสี่ยงต่อภาวะหัวใจเต้นผิดจังหวะฉับพลัน",
    image: "🍌",
  },
  {
    id: 13,
    name: "น้ำมันรำข้าว",
    category: "เครื่องปรุง",
    status: "safe",
    reason: "ไขมันดี ช่วยลด LDL",
    image: "🛢️",
  },
  {
    id: 14,
    name: "เกลือลดโซเดียม",
    category: "เครื่องปรุง",
    status: "danger",
    reason:
      "ใช้โพแทสเซียมคลอไรด์ (KCl) แทนเกลือ ทำให้โพแทสเซียมคั่งจนหัวใจวายได้",
    image: "🧂",
  },
];

const STATUS_LABELS = {
  safe: "ปลอดภัย",
  warning: "ควรระวัง",
  danger: "อันตราย",
};

function getTodayInputValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffset).toISOString().split("T")[0];
}

function formatThaiDate(dateValue) {
  if (!dateValue) {
    return "กำลังตั้งค่าวันที่...";
  }

  const date = new Date(`${dateValue}T00:00:00`);
  return new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function getStatusCardClasses(status) {
  switch (status) {
    case "safe":
      return "border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:border-emerald-300";
    case "warning":
      return "border-amber-200 bg-amber-50/70 text-amber-700 hover:border-amber-300";
    case "danger":
      return "border-red-200 bg-red-50/70 text-red-700 hover:border-red-300";
    default:
      return "border-slate-200 bg-white text-slate-700 hover:border-slate-300";
  }
}

function getStatusHeaderClasses(status) {
  switch (status) {
    case "safe":
      return "bg-emerald-100";
    case "warning":
      return "bg-amber-100";
    case "danger":
      return "bg-red-100";
    default:
      return "bg-slate-100";
  }
}

function getStatusBadgeClasses(status) {
  switch (status) {
    case "safe":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "warning":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "danger":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200";
  }
}

function getLogStatusTextColor(status) {
  switch (status) {
    case "safe":
      return "text-emerald-600";
    case "warning":
      return "text-amber-600";
    case "danger":
      return "text-red-600";
    default:
      return "text-slate-600";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "safe":
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case "danger":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
}

export default function CKDDietApp() {
  const [foods, setFoods] = useState([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
     fetch(`${API_URL}/api/foods`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(item => ({
          id: item.FoodId,
          name: item.FoodName,
          category: item.Category,
          status: item.Status,
          reason: item.PhysiologyReason,
          image: item.IconImage
        }));
        setFoods(mapped);
      })
      .catch(err => console.error("Failed to fetch foods:", err));
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedFood, setSelectedFood] = useState(null);
  const [showDailyPopup, setShowDailyPopup] = useState(true);
  const [dailyRecommendation, setDailyRecommendation] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [eatLogs, setEatLogs] = useState({});

  useEffect(() => {
    setSelectedDate(getTodayInputValue());
  }, []);

  useEffect(() => {
    const safeFoods = foods.filter((food) => food.status === "safe");
    const todayKey = getTodayInputValue();
    const seed = Array.from(todayKey).reduce(
      (total, character) => total + character.charCodeAt(0),
      0
    );

    setDailyRecommendation(safeFoods[seed % safeFoods.length]);
  }, [foods]);

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchSearch = food.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchCategory =
        filterCategory === "All" || food.category === filterCategory;
      const matchStatus = filterStatus === "All" || food.status === filterStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [filterCategory, filterStatus, foods, searchTerm]);

  const categories = useMemo(() => {
    return ["All", ...new Set(foods.map((food) => food.category))];
  }, [foods]);

  const logFoodToDate = (food) => {
    const targetDate = selectedDate || getTodayInputValue();

    setEatLogs((previousLogs) => {
      const logsForDate = previousLogs[targetDate] || [];

      return {
        ...previousLogs,
        [targetDate]: [...logsForDate, food],
      };
    });

    if (!selectedDate) {
      setSelectedDate(targetDate);
    }

    setSelectedFood(null);
    window.alert(`บันทึก ${food.name} ลงในวันที่ ${targetDate} เรียบร้อยแล้ว`);
  };

  const removeLog = (date, index) => {
    setEatLogs((previousLogs) => {
      const logsForDate = previousLogs[date] || [];
      const nextLogs = logsForDate.filter((_, itemIndex) => itemIndex !== index);

      return {
        ...previousLogs,
        [date]: nextLogs,
      };
    });
  };

  const currentLogs = selectedDate ? eatLogs[selectedDate] || [] : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-10 font-sans">
      {showDailyPopup && dailyRecommendation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="animate-popup-in w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-center text-white">
              <button
                onClick={() => setShowDailyPopup(false)}
                className="absolute right-3 top-3 text-white/80 transition-colors hover:text-white"
                aria-label="ปิดเมนูแนะนำ"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="mb-1 text-xl font-bold">เมนูแนะนำวันนี้ 🌟</h2>
              <p className="text-sm text-emerald-100">
                ทานได้อย่างปลอดภัย ไม่ทำร้ายไต
              </p>
            </div>
            <div className="p-6 text-center">
              <div className="mb-4 text-6xl">{dailyRecommendation.image}</div>
              <h3 className="mb-2 text-2xl font-bold text-slate-800">
                {dailyRecommendation.name}
              </h3>
              <span className="mb-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                หมวด: {dailyRecommendation.category}
              </span>
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                &quot;{dailyRecommendation.reason}&quot;
              </p>
              <button
                onClick={() => setShowDailyPopup(false)}
                className="w-full rounded-xl bg-emerald-500 py-3 font-medium text-white transition-colors hover:bg-emerald-600"
              >
                เข้าสู่ระบบค้นหาอาหาร
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                CKD Diet Tracker
              </h1>
              <p className="text-xs text-slate-500">โภชนบำบัดโรคไตระยะ 3</p>
            </div>
          </div>

          <div className="flex w-full rounded-lg bg-slate-100 p-1 sm:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full border-none bg-transparent px-2 text-sm font-medium text-slate-700 outline-none"
              aria-label="เลือกวันที่สำหรับบันทึกอาหาร"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่ออาหาร..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "ทุกหมวด" : category}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">ทุกสถานะ</option>
              <option value="safe">✅ ปลอดภัย</option>
              <option value="warning">⚠️ ระวัง</option>
              <option value="danger">❌ ห้ามกิน</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => setSelectedFood(food)}
                  className={`relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all hover:-translate-y-1 hover:shadow-md ${getStatusCardClasses(
                    food.status
                  )}`}
                >
                  <div className="text-4xl">{food.image}</div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <h4 className="font-bold text-slate-800">{food.name}</h4>
                      {getStatusIcon(food.status)}
                    </div>
                    <span className="text-xs font-medium opacity-80">
                      {food.category}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-slate-500">
                ไม่พบข้อมูลอาหารที่ค้นหา
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-24 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2 border-b pb-4">
              <CalendarIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-bold text-slate-800">บันทึกการกิน</h2>
            </div>

            <div className="mb-4">
              <div className="mb-1 text-sm text-slate-500">วันที่เลือก</div>
              <div className="text-lg font-semibold text-slate-800">
                {formatThaiDate(selectedDate)}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {currentLogs.length > 0 ? (
                currentLogs.map((log, index) => (
                  <div
                    key={`${log.id}-${index}`}
                    className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{log.image}</span>
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {log.name}
                        </div>
                        <div
                          className={`flex items-center gap-1 text-xs ${getLogStatusTextColor(
                            log.status
                          )}`}
                        >
                          {log.status === "danger" && (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {STATUS_LABELS[log.status]}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLog(selectedDate, index)}
                      className="text-slate-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                      aria-label={`ลบบันทึก ${log.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border-2 border-dashed border-slate-100 py-8 text-center text-sm text-slate-400">
                  ยังไม่มีบันทึกอาหารสำหรับวันนี้
                  <br />
                  คลิกที่เมนูอาหารเพื่อเพิ่ม
                </div>
              )}
            </div>

            {currentLogs.length > 0 && (
              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <div className="mb-2 text-xs font-semibold text-blue-600">
                  จำลองการคำนวณโควตา (Demo)
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-slate-600">โปรตีน</span>
                      <span className="font-medium">20g / 45g</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-blue-200">
                      <div className="h-1.5 w-[45%] rounded-full bg-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div
              className={`flex items-start justify-between border-b p-6 ${getStatusHeaderClasses(
                selectedFood.status
              )}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{selectedFood.image}</div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {selectedFood.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1 text-sm font-semibold opacity-80">
                    {getStatusIcon(selectedFood.status)}
                    <span>
                      {selectedFood.status === "safe"
                        ? "ทานได้อย่างปลอดภัย"
                        : selectedFood.status === "warning"
                          ? "ทานได้แต่ต้องระวังปริมาณ"
                          : "อันตรายต่อไต ห้ามทานเด็ดขาด"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFood(null)}
                className="rounded-full p-1 text-slate-500 transition-colors hover:bg-white/60"
                aria-label="ปิดรายละเอียดอาหาร"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <h4 className="mb-2 flex items-center gap-2 font-bold text-slate-800">
                <Info className="h-4 w-4 text-blue-500" />
                คำอธิบายทางการแพทย์
              </h4>
              <p className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                {selectedFood.reason}
              </p>

              <div
                className={`mt-4 flex gap-2 rounded-lg border p-3 text-xs ${getStatusBadgeClasses(
                  selectedFood.status
                )}`}
              >
                {selectedFood.status === "safe" ? (
                  <CheckCircle className="h-4 w-4 shrink-0" />
                ) : selectedFood.status === "warning" ? (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0" />
                )}
                <p>
                  {selectedFood.status === "safe"
                    ? "อาหารชนิดนี้มีปริมาณแร่ธาตุอยู่ในเกณฑ์เหมาะสม และไม่เพิ่มภาระของเสียให้ไตมากเกินไป"
                    : selectedFood.status === "warning"
                      ? "อาหารชนิดนี้ทานได้ในปริมาณจำกัด ควรพิจารณาระดับโพแทสเซียมหรือคำแนะนำจากแพทย์ร่วมด้วย"
                      : "อาหารชนิดนี้มีความเสี่ยงเพิ่มภาระต่อไตหรือรบกวนสมดุลแร่ธาตุ จึงควรหลีกเลี่ยง"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 border-t bg-slate-50 p-4">
              <button
                type="button"
                onClick={() => setSelectedFood(null)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                ปิดหน้าต่าง
              </button>
              <button
                type="button"
                onClick={() => logFoodToDate(selectedFood)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                เพิ่มลงบันทึกวันที่เลือก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
