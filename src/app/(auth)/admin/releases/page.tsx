"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Box,
  Divider,
  Button,
} from "@mui/material";
import Link from "next/link";
import { releaseAPI } from "@/services/api";

export default function AdminReleasesPage({ searchParams }: any) {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusFilter = searchParams?.status;

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setLoading(true);
        const response = await releaseAPI.getReleases();
        if (response && response.success) {
          let data = Array.isArray(response.data) ? response.data : [];
          if (statusFilter) {
            data = data.filter((r) => r.status === statusFilter);
          }
          setReleases(data);
        } else {
          setError("Failed to load releases");
          setReleases([]);
        }
      } catch (err) {
        setError("An error occurred while fetching releases");
        setReleases([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReleases();
  }, [statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={2}>
        Releases {statusFilter && `- ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : releases.length === 0 ? (
        <Typography color="text.secondary">No releases found.</Typography>
      ) : (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, mb: 4 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Artist</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>UPC</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>DSPs</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {releases.map((release) => (
                  <TableRow key={release._id}>
                    <TableCell>{release.releaseTitle || "Untitled"}</TableCell>
                    <TableCell>{release.primaryArtist || "N/A"}</TableCell>
                    <TableCell>{release.label || "N/A"}</TableCell>
                    <TableCell>{release.upc || "N/A"}</TableCell>
                    <TableCell>
                      <Chip
                        label={release.status.charAt(0).toUpperCase() + release.status.slice(1)}
                        color={
                          release.status === "approved"
                            ? "success"
                            : release.status === "pending"
                            ? "warning"
                            : "error"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {Array.isArray(release.stores)
                        ? release.stores.join(", ")
                        : "N/A"}
                    </TableCell>
                    <TableCell>{formatDate(release.createdAt)}</TableCell>
                    <TableCell>{formatDate(release.updatedAt)}</TableCell>
                    <TableCell align="right">
                      <Button
                        component={Link}
                        href={`/admin/releases/${release._id}`}
                        size="small"
                        variant="outlined"
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
}
