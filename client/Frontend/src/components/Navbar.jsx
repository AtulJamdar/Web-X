import React from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Stack } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ mode, toggleMode }) {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <AppBar position="static">
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography component={Link} to="/" variant="h6" sx={{ color: "inherit", textDecoration: "none" }}>
                        Web-X
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton onClick={toggleMode} color="inherit">
                        {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>

                    {!token ? (
                        <>
                            <Button component={Link} to="/login" color="inherit">Login</Button>
                            <Button component={Link} to="/register" color="inherit">Register</Button>
                        </>
                    ) : (
                        <>
                            <Button component={Link} to="/dashboard" color="inherit">Dashboard</Button>
                            <Button component={Link} to="/add" color="inherit">Add Data</Button>
                            <Button onClick={handleLogout} color="inherit">Logout</Button>
                        </>
                    )}
                </Stack>
            </Toolbar>
        </AppBar>
    );
}
