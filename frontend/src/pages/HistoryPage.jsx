
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem("access");
        const res = await fetch("http://localhost:8000/api/history/", {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const navigate = useNavigate();

  // Helper: go to playground session with this prompt/models
  const handleGoToSession = (item) => {
    // Save prompt and models to localStorage for PlaygroundSession
    localStorage.setItem("historyPrompt", item.prompt);
    // Convert models to Playground format (provider, label)
    const models = item.models.map(m => ({ provider: m.provider, label: m.model_label }));
    localStorage.setItem("selectedModels", JSON.stringify(models));
    // Store responses as {"provider-label": response}
    const responses = {};
    item.models.forEach(m => {
      responses[`${m.provider}-${m.model_label}`] = m.response;
    });
    localStorage.setItem("historyResponses", JSON.stringify(responses));
    navigate("/playground/session?fromHistory=1");
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#30e3ca]">
        Comparison History
      </h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && history.length === 0 && (
        <div>No history found.</div>
      )}
      <div className="space-y-4">
        {history.map((item, idx) => (
          <div
            key={idx}
            className="bg-white/10 rounded-lg p-4 shadow cursor-pointer hover:bg-[#30e3ca]/10 transition"
            onClick={() => handleGoToSession(item)}
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">{new Date(item.created_at).toLocaleString()}</span>
              <span className="ml-2 px-2 py-0.5 bg-[#30e3ca]/20 text-[#30e3ca] text-xs rounded">{item.models.length} models</span>
            </div>
            <div className="font-medium text-white mt-2 truncate" style={{maxWidth:'90%'}}>
              {item.prompt.length > 120 ? item.prompt.slice(0,120)+"..." : item.prompt}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center text-gray-400 text-xs">Click a prompt to revisit the comparison session.</div>
    </div>
  );
}
