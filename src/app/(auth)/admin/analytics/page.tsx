"use client";
import { useEffect, useState } from "react";
import { Container, Typography, Box, Paper, CircularProgress, Grid } from "@mui/material";
import { releaseAPI, trackAPI, adminAPI } from "@/services/api";
import dynamic from "next/dynamic";
import { registerChartElements } from "./registerChartElements";

// Dynamically import react-chartjs-2 components for client-side rendering
const Bar = dynamic(() => import("react-chartjs-2").then(mod => mod.Bar), { ssr: false });
const Pie = dynamic(() => import("react-chartjs-2").then(mod => mod.Pie), { ssr: false });
const Line = dynamic(() => import("react-chartjs-2").then(mod => mod.Line), { ssr: false }); 

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [releaseData, setReleaseData] = useState<any[]>([]);
  const [trackData, setTrackData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chartReady, setChartReady] = useState(false);

  // Register Chart.js elements only once and mark charts as ready
  useEffect(() => {
    registerChartElements();
    setChartReady(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [releasesRes, tracksRes, usersRes] = await Promise.all([
          releaseAPI.getReleases(),
          trackAPI.getTracks(),
          adminAPI.getUsers()
        ]);
        setReleaseData(releasesRes.data || []);
        setTrackData(tracksRes.data || []);
        setUserData((usersRes.data && (usersRes.data.users || usersRes.data)) || []);
      } catch (e) {
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare chart data
  const releaseStatusCounts = releaseData.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userRoleCounts = userData.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const releasesPerMonth = (() => {
    const months: Record<string, number> = {};
    releaseData.forEach(r => {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      months[key] = (months[key] || 0) + 1;
    });
    return months;
  })();

  const tracksPerRelease = releaseData.map(r => r.tracks?.length || 0);

  const chartColors = [
    "#42a5f5", "#66bb6a", "#ffa726", "#ef5350", "#ab47bc", "#26c6da", "#d4e157", "#ff7043"
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={2}>
        Analytics Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Beautiful, dynamic, and animated charts visualizing your platform's data
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : !chartReady ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading charts...</Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 6, background: "linear-gradient(135deg, #42a5f5 0%, #478ed1 100%)" }}>
              <Typography variant="h6" color="white" gutterBottom>
                Releases by Status
              </Typography>
              <Pie
                data={{
                  labels: Object.keys(releaseStatusCounts),
                  datasets: [{
                    data: Object.values(releaseStatusCounts),
                    backgroundColor: chartColors,
                    borderWidth: 1,
                  }]
                }}
                options={{
                  plugins: {
                    legend: { labels: { color: "white", font: { size: 16 } } },
                    tooltip: { enabled: true },
                  },
                  animation: { animateRotate: true, animateScale: true },
                }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 6, background: "linear-gradient(135deg, #66bb6a 0%, #43a047 100%)" }}>
              <Typography variant="h6" color="white" gutterBottom>
                User Roles Distribution
              </Typography>
              <Bar
                data={{
                  labels: Object.keys(userRoleCounts),
                  datasets: [{
                    label: "Users",
                    data: Object.values(userRoleCounts),
                    backgroundColor: chartColors,
                  }]
                }}
                options={{
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                  },
                  animation: { duration: 1200, easing: "easeInOutQuart" },
                  scales: {
                    x: { ticks: { color: "white" } },
                    y: { ticks: { color: "white" }, beginAtZero: true },
                  }
                }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 6, background: "linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)" }}>
              <Typography variant="h6" color="white" gutterBottom>
                Releases Per Month
              </Typography>
              <Line
                data={{
                  labels: Object.keys(releasesPerMonth),
                  datasets: [{
                    label: "Releases",
                    data: Object.values(releasesPerMonth),
                    fill: true,
                    borderColor: "#fff",
                    backgroundColor: "rgba(255,255,255,0.3)",
                    tension: 0.4,
                  }]
                }}
                options={{
                  plugins: {
                    legend: { labels: { color: "white" } },
                    tooltip: { enabled: true },
                  },
                  animation: { duration: 1200, easing: "easeInOutQuart" },
                  scales: {
                    x: { ticks: { color: "white" } },
                    y: { ticks: { color: "white" }, beginAtZero: true },
                  }
                }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 6, background: "linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)" }}>
              <Typography variant="h6" color="white" gutterBottom>
                Tracks Per Release
              </Typography>
              <Bar
                data={{
                  labels: releaseData.map((r, i) => r.releaseTitle || `Release ${i + 1}`),
                  datasets: [{
                    label: "Tracks",
                    data: tracksPerRelease,
                    backgroundColor: chartColors,
                  }]
                }}
                options={{
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                  },
                  animation: { duration: 1200, easing: "easeInOutQuart" },
                  scales: {
                    x: { ticks: { color: "white" } },
                    y: { ticks: { color: "white" }, beginAtZero: true },
                  }
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
