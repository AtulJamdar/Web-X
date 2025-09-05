import { useEffect, useState } from "react";
import { Container, Box, Typography, CircularProgress, Button, Grid, Paper, List, ListItem, ListItemText } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("http://localhost:5000/api/auth/dashboard", {
                    headers: { Authorization: "Bearer " + token },
                });
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box mt={10} display="flex" justifyContent="center">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (!data) return null;

    const revenueData = (data.revenue || []).map(r => ({
        month: months[(r._id || r.month) - 1] || r.month,
        total: r.total
    }));

    return (
        <Container maxWidth="lg">
            <Box mt={4} mb={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4">Dashboard</Typography>
                <Button
                    variant="outlined"
                    onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}
                >
                    Logout
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Clients</Typography>
                        <List dense>
                            {data.clients.map(c => (
                                <ListItem key={c._id} disableGutters>
                                    <ListItemText primary={c.name} secondary={c.company} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Projects</Typography>
                        <List dense>
                            {data.projects.map(p => (
                                <ListItem key={p._id} disableGutters>
                                    <ListItemText
                                        primary={`${p.title} — ${p.status}`}
                                        secondary={`Client: ${p.clientId?.name || "N/A"}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Invoices</Typography>
                        <List dense>
                            {data.invoices.map(i => (
                                <ListItem key={i._id} disableGutters>
                                    <ListItemText
                                        primary={`₹${i.amount} — ${new Date(i.dueDate).toLocaleDateString()}`}
                                        secondary={`Client: ${i.clientId?.name || "N/A"} • Status: ${i.status}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2, height: 360 }}>
                        <Typography variant="h6" gutterBottom>Revenue by Month</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.revenue.map(r => ({
                                month: new Date(2025, r._id - 1).toLocaleString("default", { month: "short" }),
                                total: r.total
                            }))}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total" fill="#4CAF50" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Outstanding Revenue */}
                <section>
                    <h3>Outstanding Revenue by Client</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.outstandingRevenue}>
                            <XAxis dataKey="clientName" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="totalOutstanding" fill="#FF9800" />
                        </BarChart>
                    </ResponsiveContainer>
                </section>

                {/* Upcoming Deadlines */}
                <section>
                    <h3>Projects Nearing Deadline (Next 7 Days)</h3>
                    <ul>
                        {data.upcomingDeadlines.map((p) => (
                            <li key={p._id}>
                                {p.title} (Client: {p.clientId?.name || "N/A"}) –
                                Due: {new Date(p.deadline).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                </section>


            </Grid>
        </Container>
    );
}
