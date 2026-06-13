import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { UserPlus, Users, Search, CheckCircle2, Clock, Filter } from "lucide-react";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBFJnEkDXW9-JdxYItTqfLRRXSbw4hAwbU",
  authDomain: "khubaib-8d6c6.firebaseapp.com",
  databaseURL: "https://khubaib-8d6c6-default-rtdb.firebaseio.com",
  projectId: "khubaib-8d6c6",
  storageBucket: "khubaib-8d6c6.firebasestorage.app",
  messagingSenderId: "461513777104",
  appId: "1:461513777104:web:e445addd85a258b2bd23d5",
  measurementId: "G-8LN1VD8MFN",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BATCHES = ["Batch 1", "Batch 2", "Batch 3", "Batch 4"];

function genId(num) {
  return "YTA-" + String(num).padStart(4, "0");
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [view, setView] = useState("register"); // register | list
  const [filterBatch, setFilterBatch] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastId, setLastId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    batch: BATCHES[0],
    course: "",
  });

  // Live data from Firestore
  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("registeredAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ docId: d.id, ...d.data() }));
        setStudents(data);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.course.trim()) return;

    const nextNum = students.length + 1;
    const id = genId(nextNum);

    const newStudent = {
      id,
      name: form.name.trim(),
      phone: form.phone.trim(),
      batch: form.batch,
      course: form.course.trim(),
      paymentStatus: "Unpaid",
      registeredAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "students"), newStudent);
      setLastId(id);
      setForm({ name: "", phone: "", batch: BATCHES[0], course: "" });
    } catch (err) {
      console.error("Failed to register", err);
    }
  }

  async function togglePayment(student) {
    try {
      await updateDoc(doc(db, "students", student.docId), {
        paymentStatus: student.paymentStatus === "Paid" ? "Unpaid" : "Paid",
      });
    } catch (err) {
      console.error("Failed to update payment", err);
    }
  }

  const filtered = students.filter((s) => {
    const matchesBatch = filterBatch === "All" || s.batch === filterBatch;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);
    return matchesBatch && matchesSearch;
  });

  const totalPaid = students.filter((s) => s.paymentStatus === "Paid").length;

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E8E6E1] font-sans">
      {/* Header */}
      <header className="border-b border-[#2A2D34] sticky top-0 bg-[#0F1115]/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Creator Academy
            </h1>
            <p className="text-xs text-[#8B8F99]">Student & Payment Tracker</p>
          </div>
          <div className="flex gap-1 bg-[#1A1D24] rounded-lg p-1">
            <button
              onClick={() => setView("register")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                view === "register" ? "bg-[#E8654B] text-white" : "text-[#8B8F99] hover:text-[#E8E6E1]"
              }`}
            >
              <UserPlus size={14} /> Register
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                view === "list" ? "bg-[#E8654B] text-white" : "text-[#8B8F99] hover:text-[#E8E6E1]"
              }`}
            >
              <Users size={14} /> Students
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        {loading ? (
          <p className="text-[#8B8F99] text-sm">Loading...</p>
        ) : view === "register" ? (
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                New Student
              </h2>
              <p className="text-sm text-[#8B8F99]">
                Form fill karke unique Student ID generate hoga — payment ke time yehi ID reference dein.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8B8F99] mb-1.5">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#1A1D24] border border-[#2A2D34] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8654B] focus:border-transparent"
                  placeholder="e.g. Ali Raza"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8B8F99] mb-1.5">WhatsApp Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-[#1A1D24] border border-[#2A2D34] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8654B] focus:border-transparent"
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8B8F99] mb-1.5">Batch</label>
                <select
                  value={form.batch}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  className="w-full bg-[#1A1D24] border border-[#2A2D34] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8654B] focus:border-transparent"
                >
                  {BATCHES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8B8F99] mb-1.5">Course</label>
                <input
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full bg-[#1A1D24] border border-[#2A2D34] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8654B] focus:border-transparent"
                  placeholder="e.g. YouTube Automation"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#E8654B] hover:bg-[#D5573F] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
              >
                Register Student
              </button>
            </form>

            {lastId && (
              <div className="mt-5 bg-[#1A1D24] border border-[#3A4D3F] rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#7FB069] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Registered successfully</p>
                  <p className="text-xs text-[#8B8F99] mt-0.5">
                    Student ID: <span className="text-[#E8654B] font-mono font-bold">{lastId}</span> — payment karte waqt is ID ka zikar karna zaroori hai.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Students
                </h2>
                <p className="text-sm text-[#8B8F99]">
                  {students.length} total — {totalPaid} paid, {students.length - totalPaid} pending
                </p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B8F99]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, ID, phone"
                    className="bg-[#1A1D24] border border-[#2A2D34] rounded-lg pl-8 pr-3 py-2 text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-[#E8654B] focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B8F99]" />
                  <select
                    value={filterBatch}
                    onChange={(e) => setFilterBatch(e.target.value)}
                    className="bg-[#1A1D24] border border-[#2A2D34] rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8654B] focus:border-transparent appearance-none"
                  >
                    <option value="All">All Batches</option>
                    {BATCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#2A2D34] rounded-lg">
                <p className="text-[#8B8F99] text-sm">
                  {students.length === 0
                    ? "Abhi koi student register nahi hua. Register tab se shuru karein."
                    : "Koi student match nahi hua."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-[#2A2D34]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#1A1D24] text-left text-xs text-[#8B8F99] uppercase tracking-wide">
                      <th className="px-4 py-3 font-medium">ID</th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Batch</th>
                      <th className="px-4 py-3 font-medium">Course</th>
                      <th className="px-4 py-3 font-medium">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, idx) => (
                      <tr
                        key={s.docId}
                        className={`${idx % 2 === 0 ? "bg-[#0F1115]" : "bg-[#15171D]"} border-t border-[#2A2D34]`}
                      >
                        <td className="px-4 py-3 font-mono text-[#E8654B] font-semibold">{s.id}</td>
                        <td className="px-4 py-3">{s.name}</td>
                        <td className="px-4 py-3 text-[#8B8F99]">{s.phone}</td>
                        <td className="px-4 py-3">
                          <span className="bg-[#2A2D34] px-2 py-0.5 rounded text-xs">{s.batch}</span>
                        </td>
                        <td className="px-4 py-3 text-[#8B8F99]">{s.course}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => togglePayment(s)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              s.paymentStatus === "Paid"
                                ? "bg-[#1F2E22] text-[#7FB069] border border-[#3A4D3F]"
                                : "bg-[#2E211F] text-[#E8654B] border border-[#4D3A37]"
                            }`}
                          >
                            {s.paymentStatus === "Paid" ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <Clock size={12} />
                            )}
                            {s.paymentStatus}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
