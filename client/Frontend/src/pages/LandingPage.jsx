import React from "react";
import { Container, Box, Typography, Button, Grid, Paper, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";


export default function LandingPage() {
    const [open, setOpen] = useState(false);
    return (
        <Container maxWidth="lg" sx={{ mt: 6 }}>
            {/* Hero */}
            <Paper sx={{ p: 6, borderRadius: 3, mb: 4 }}>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={7}>
                        <Typography variant="h2" gutterBottom>
                            B-Dashboard — client & invoice management for developers
                        </Typography>
                        <Typography variant="h6" color="text.secondary" paragraph>
                            Keep clients, projects and invoices organized. Track monthly revenue and grow your freelancing or agency business — all in one beautiful dashboard.
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Button component={Link} to="/register" variant="contained" size="large">Get Started — it's free</Button>
                            <Button component={Link} to="/login" variant="outlined" size="large">Sign in</Button>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Paper elevation={6} sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
                            <Typography variant="subtitle1">Your next client dashboard</Typography>
                            <Box sx={{ mt: 2 }}>
                                {/* simple mock stats */}
                                <Typography variant="h5">3 Clients</Typography>
                                <Typography variant="h5">5 Projects</Typography>
                                <Typography variant="h5">₹ 42,000 / month</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>

            {/* Features */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>Why B-Dashboard?</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6">Organize clients</Typography>
                            <Typography color="text.secondary">Store client details and contacts in one place.</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6">Manage projects</Typography>
                            <Typography color="text.secondary">Track status, deadlines and client relationships.</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6">Invoices & revenue</Typography>
                            <Typography color="text.secondary">Create invoices and view monthly revenue charts.</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Pricing (fake, for marketing) */}

            <Box sx={{ mb: 6 }}>
                <Typography variant="h4" gutterBottom>Pricing</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6">Starter</Typography>
                            <Typography>Free — suitable for testing</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Button variant="contained" onClick={() => setOpen(true)}>Upgrade to Pro</Button>

                            <Dialog open={open} onClose={() => setOpen(false)}>
                                <DialogTitle>Upgrade to Pro</DialogTitle>
                                <DialogContent>
                                    <Typography>Pro plan gives you unlimited projects & invoices. (This is a demo!)</Typography>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                                    <Button variant="contained" onClick={() => { alert("Fake payment success!"); setOpen(false); }}>
                                        Pay ₹499
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography variant="h5">Ready to manage clients like a pro?</Typography>
                <Button component={Link} to="/register" variant="contained" sx={{ mt: 2 }}>Create account</Button>
            </Box>
        </Container>
    );
}
