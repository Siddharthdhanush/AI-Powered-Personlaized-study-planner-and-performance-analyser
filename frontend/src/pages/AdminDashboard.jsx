import React, { useState, useEffect } from "react";
import API from "../api";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/metrics");
      setMetrics(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch admin metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const gpu = metrics?.gpu_metrics || {};
  const vllm = metrics?.vllm_health || {};
  const llm = metrics?.llm_telemetry || {};
  const sys = metrics?.system_stats || {};
  const ml = metrics?.ml_pipeline_status || {};

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", color: "#e2e8f0" }}>
      {/* Header Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
        padding: "1.5rem",
        background: "rgba(15, 23, 42, 0.75)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#60a5fa" }}>
            🖥️ Central Server Orchestrator & vLLM Telemetry
          </h1>
          <p style={{ margin: "0.4rem 0 0 0", color: "#94a3b8", fontSize: "0.95rem" }}>
            Real-time monitor for WSL2 GPU inference, server API load, and client connectivity.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "#cbd5e1" }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (5s)
          </label>
          <button
            onClick={fetchMetrics}
            style={{
              padding: "0.6rem 1.2rem",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            🔄 Refresh Now
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "1rem",
          marginBottom: "1.5rem",
          background: "rgba(239, 68, 68, 0.2)",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          color: "#fca5a5"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
        
        {/* Card 1: GPU Metrics */}
        <div style={{
          background: "rgba(30, 41, 59, 0.7)",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#38bdf8", display: "flex", alignItems: "center", justifyBetween: "space-between" }}>
            <span>⚡ GPU Usage & VRAM Metrics</span>
            <span style={{
              fontSize: "0.8rem",
              padding: "0.2rem 0.6rem",
              borderRadius: "12px",
              background: gpu.available ? "rgba(34, 197, 94, 0.2)" : "rgba(148, 163, 184, 0.2)",
              color: gpu.available ? "#4ade80" : "#94a3b8"
            }}>
              {gpu.available ? "Active GPU" : "WSL2 Direct"}
            </span>
          </h3>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>Device Name</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#f8fafc" }}>{gpu.gpu_name || "NVIDIA GPU"}</div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.3rem" }}>
              <span>GPU Utilization</span>
              <span style={{ color: "#38bdf8", fontWeight: "bold" }}>{gpu.utilization_pct || 0}%</span>
            </div>
            <div style={{ width: "100%", background: "#334155", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, gpu.utilization_pct || 0)}%`, background: "#38bdf8", height: "100%", transition: "width 0.5s ease" }} />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.3rem" }}>
              <span>VRAM Usage ({gpu.used_vram_mb || 0} / {gpu.total_vram_mb || 0} MB)</span>
              <span style={{ color: "#a855f7", fontWeight: "bold" }}>{gpu.vram_utilization_pct || 0}%</span>
            </div>
            <div style={{ width: "100%", background: "#334155", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, gpu.vram_utilization_pct || 0)}%`, background: "#a855f7", height: "100%", transition: "width 0.5s ease" }} />
            </div>
          </div>

          {gpu.temperature_c !== null && gpu.temperature_c !== undefined && (
            <div style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>
              🌡️ GPU Temperature: <strong style={{ color: "#fb923c" }}>{gpu.temperature_c} °C</strong>
            </div>
          )}
        </div>

        {/* Card 2: vLLM Server Health */}
        <div style={{
          background: "rgba(30, 41, 59, 0.7)",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#4ade80", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>🤖 vLLM Engine Health</span>
            <span style={{
              fontSize: "0.8rem",
              padding: "0.2rem 0.6rem",
              borderRadius: "12px",
              background: vllm.status === "online" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
              color: vllm.status === "online" ? "#4ade80" : "#fca5a5"
            }}>
              {vllm.status === "online" ? "🟢 ONLINE" : "🔴 OFFLINE"}
            </span>
          </h3>

          <div style={{ marginBottom: "0.8rem" }}>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>API Base Endpoint</div>
            <code style={{ background: "#0f172a", padding: "0.2rem 0.5rem", borderRadius: "4px", color: "#38bdf8" }}>
              {vllm.base_url || "http://localhost:8000/v1"}
            </code>
          </div>

          <div style={{ marginBottom: "0.8rem" }}>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Configured Model</div>
            <div style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#e2e8f0" }}>
              {vllm.configured_model || "meta-llama/Llama-3.2-1B-Instruct"}
            </div>
          </div>

          <div style={{ marginBottom: "0.8rem" }}>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Ping Latency</div>
            <div style={{ color: "#facc15", fontWeight: "bold" }}>
              {vllm.latency_seconds !== null ? `${vllm.latency_seconds} sec` : "N/A"}
            </div>
          </div>

          {vllm.error && (
            <div style={{ fontSize: "0.8rem", color: "#fca5a5", background: "rgba(239,68,68,0.1)", padding: "0.5rem", borderRadius: "4px" }}>
              Error: {vllm.error}
            </div>
          )}
        </div>

        {/* Card 3: Inference Telemetry */}
        <div style={{
          background: "rgba(30, 41, 59, 0.7)",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#f472b6" }}>📈 LLM Inference Telemetry</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ background: "#0f172a", padding: "0.8rem", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#60a5fa" }}>{llm.total_requests || 0}</div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Total LLM Calls</div>
            </div>
            <div style={{ background: "#0f172a", padding: "0.8rem", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4ade80" }}>{llm.successful_requests || 0}</div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Success Rate</div>
            </div>
          </div>

          <div style={{ fontSize: "0.85rem", color: "#cbd5e1", marginBottom: "0.5rem" }}>Calls by Feature:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {Object.entries(llm.feature_counts || {}).map(([feat, count]) => (
              <span key={feat} style={{
                background: "rgba(51, 65, 85, 0.8)",
                padding: "0.2rem 0.6rem",
                borderRadius: "6px",
                fontSize: "0.8rem",
                color: "#e2e8f0"
              }}>
                {feat}: <strong style={{ color: "#38bdf8" }}>{count}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Card 4: System & Database Stats */}
        <div style={{
          background: "rgba(30, 41, 59, 0.7)",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#fbbf24" }}>👥 System & Connected Clients</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
            <div>
              <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Registered Students:</span>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#f8fafc" }}>{sys.registered_students || 0}</div>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Subjects Ingested:</span>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#f8fafc" }}>{sys.total_subjects || 0}</div>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Topics Managed:</span>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#f8fafc" }}>{sys.total_topics || 0}</div>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Study Plans Solved:</span>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#f8fafc" }}>{sys.study_plans_generated || 0}</div>
            </div>
          </div>

          <div style={{ marginTop: "1rem", paddingTop: "0.8rem", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "0.85rem" }}>
            🤖 ML Models Status: <span style={{ color: "#4ade80" }}>{ml.mastery_decision_tree || "trained"}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
