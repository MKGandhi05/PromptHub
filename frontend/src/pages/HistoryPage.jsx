
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken, refreshAccessToken } from "../utils/tokenManager";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Use centralized tokenManager for refresh

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

  let accessToken = getAccessToken();
    try {
      let res = await fetch("http://localhost:8000/api/history/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      // If token expired, try refresh
      if (res.status === 401) {
  accessToken = await refreshAccessToken();
        res = await fetch("http://localhost:8000/api/history/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (!res.ok) {
        throw new Error("Failed to fetch history");
      }

      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Go to session by UUID if available, else fallback
  const handleGoToSession = (item) => {
    if (item.session_id) {
      navigate(`/playground/session/${item.session_id}`);
    } else {
      // fallback for old history
      localStorage.setItem("historyPrompt", item.prompt);
      const models = item.models.map((m) => ({
        provider: m.provider,
        label: m.model_label,
      }));
      localStorage.setItem("selectedModels", JSON.stringify(models));
      const responses = {};
      item.models.forEach((m) => {
        responses[`${m.provider}-${m.model_label}`] = m.response;
      });
      localStorage.setItem("historyResponses", JSON.stringify(responses));
      navigate("/playground/session?fromHistory=1");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-[#30e3ca] drop-shadow-lg tracking-tight">
        <span className="bg-gradient-to-r from-[#30e3ca] to-[#11998e] bg-clip-text text-transparent">Comparison History</span>
      </h1>
      {loading && <div className="text-center text-lg text-gray-300">Loading...</div>}
      {error && <div className="text-center text-red-500 font-semibold">{error}</div>}
      {!loading && !error && history.length === 0 && (
        <div className="text-center text-gray-400">No history found.</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {history.map((item, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-[#232526]/80 to-[#30e3ca]/10 border border-[#30e3ca]/20 rounded-xl p-5 shadow-lg cursor-pointer hover:scale-[1.025] hover:shadow-xl transition-all group"
            onClick={() => handleGoToSession(item)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">
                {new Date(item.created_at).toLocaleString()}
              </span>
              <span className="ml-2 px-2 py-0.5 bg-[#30e3ca]/20 text-[#30e3ca] text-xs rounded-full font-semibold">
                {item.models.length} model{item.models.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {item.models.map((m, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-[#30e3ca]/10 text-[#30e3ca] text-xs font-semibold border border-[#30e3ca]/30"
                >
                  {m.provider} <span className="font-bold">{m.model_label}</span>
                </span>
              ))}
            </div>
            <div className="font-semibold text-white/90 mb-1 truncate" style={{ maxWidth: "100%" }}>
              {item.prompt.length > 100 ? item.prompt.slice(0, 100) + "..." : item.prompt}
            </div>
            <div className="text-xs text-gray-300 mt-1">
              {item.models[0]?.response && (
                <>
                  <span className="font-bold text-[#30e3ca]">Response:</span> {item.models[0].response.length > 80 ? item.models[0].response.slice(0, 80) + "..." : item.models[0].response}
                </>
              )}
            </div>
            <div className="flex justify-end mt-3">
              <button
                className="px-4 py-1.5 rounded-lg bg-[#30e3ca] text-white font-bold text-xs shadow hover:bg-[#11998e] transition"
                onClick={e => { e.stopPropagation(); handleGoToSession(item); }}
              >
                Open Session
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center text-gray-400 text-xs">
        Click a prompt or <span className="text-[#30e3ca] font-semibold">Open Session</span> to revisit your comparison.
      </div>
    </div>
  );
}
