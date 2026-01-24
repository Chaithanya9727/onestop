import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useApi from "../../hooks/useApi";
import SubmissionTable from "../../components/events/SubmissionTable";
import { Filter, X } from "lucide-react";

export default function JudgePanel() {
  const { id } = useParams(); // eventId
  const { get, post } = useApi();

  const [event, setEvent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [round, setRound] = useState("");

  const load = async () => {
    try {
      const ev = await get(`/events/${id}`);
      setEvent(ev);
      const subs = await get(`/events/${id}/submissions`);
      setSubmissions(subs.submissions || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const filtered = round ? submissions.filter((s) => String(s.round) === String(round)) : submissions;

  const handleScore = async (_submission, payload) => {
    await post(`/events/${id}/evaluate`, payload);
    await load();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
       <div className="max-w-7xl mx-auto px-6">
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div>
                   <h1 className="text-3xl font-black text-slate-900 mb-2">Judge Panel</h1>
                   <p className="text-slate-500 font-medium">Evaluate submissions for <span className="text-indigo-600 font-bold">{event?.title || "Loading..."}</span></p>
                </div>
                
                <div className="flex items-center gap-2">
                   <div className="relative">
                      <Filter className="absolute left-3 top-3 text-slate-400" size={16}/>
                      <select 
                        value={round} 
                        onChange={(e) => setRound(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 appearance-none min-w-[150px]"
                      >
                         <option value="">All Rounds</option>
                         <option value="1">Round 1</option>
                         <option value="2">Round 2</option>
                         <option value="3">Round 3</option>
                      </select>
                   </div>
                   {round && (
                      <button onClick={() => setRound("")} className="p-2.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-xl transition-colors">
                         <X size={18}/>
                      </button>
                   )}
                </div>
             </div>

             <SubmissionTable submissions={filtered} onScore={handleScore} />
          </div>
          
       </div>
    </div>
  );
}
