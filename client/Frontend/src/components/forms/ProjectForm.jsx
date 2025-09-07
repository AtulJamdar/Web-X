import React, { useEffect, useState } from "react";
import {
    Paper, TextField, Button, Box, List, ListItem, ListItemText,
    IconButton, Typography, MenuItem
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { CSVLink } from "react-csv";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const schema = Yup.object({
    title: Yup.string().required("Title is required"),
    clientId: Yup.string().required("Client is required"),
});

export default function ProjectForm({ token }) {
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [editing, setEditing] = useState(null);
    const [query, setQuery] = useState("");

    useEffect(() => { load(); }, [token]);

    const load = async () => {
        const resP = await axios.get(import.meta.env.VITE_API_URL + "/api/auth/projects", {
            headers: { Authorization: "Bearer " + token }
        });
        setProjects(resP.data || []);
        const resC = await axios.get(import.meta.env.VITE_API_URL + "/api/auth/clients", {
            headers: { Authorization: "Bearer " + token }
        });
        setClients(resC.data || []);
    };

    const handleSearch = async (e) => {
        const q = e.target.value;
        setQuery(q);
        if (q.length > 0) {
            const res = await axios.get(import.meta.env.VITE_API_URL + `/api/auth/search?q=${q}`, {
                headers: { Authorization: "Bearer " + token },
            });
            setClients(res.data);
        } else {
            setClients([]);
        }
    };

    const submit = async (values, { resetForm }) => {
        if (editing) {
            await axios.put(import.meta.env.VITE_API_URL + `/api/auth/projects/${editing._id}`, values, {
                headers: { Authorization: "Bearer " + token }
            });
            setEditing(null);
        } else {
            await axios.post(import.meta.env.VITE_API_URL + "/api/auth/projects", values, {
                headers: { Authorization: "Bearer " + token }
            });
        }
        resetForm();
        load();
    };

    const del = async (id) => {
        await axios.delete(import.meta.env.VITE_API_URL + `/api/auth/projects/${id}`, {
            headers: { Authorization: "Bearer " + token }
        });
        load();
    };

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }} elevation={4}>
                <Typography variant="h6" gutterBottom>
                    {editing ? "Update Project" : "Add Project"}
                </Typography>
                <Formik
                    initialValues={editing || { title: "", clientId: "" }}
                    enableReinitialize
                    validationSchema={schema}
                    onSubmit={submit}
                >
                    {({ errors, touched, handleChange, values }) => (
                        <Form>
                            <TextField
                                fullWidth name="title" label="Project Title" value={values.title}
                                onChange={handleChange}
                                error={touched.title && Boolean(errors.title)}
                                helperText={touched.title && errors.title}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth select name="clientId" label="Client"
                                value={values.clientId} onChange={handleChange}
                                error={touched.clientId && Boolean(errors.clientId)}
                                helperText={touched.clientId && errors.clientId}
                                sx={{ mb: 2 }}
                            >
                                {clients.map(c => (
                                    <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                                ))}
                            </TextField>
                            <Button type="submit" variant="contained">
                                {editing ? "Update" : "Add"}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Paper>

            <Paper sx={{ p: 3 }} elevation={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h6">Projects</Typography>

                    <TextField
                        id="outlined-required"
                        label="Search Projects..."
                        defaultValue=""
                        onChange={handleSearch}
                    />

                    <Button variant="outlined">
                        <CSVLink data={projects} filename="projects.csv"
                            style={{ textDecoration: "none", color: "inherit" }}>
                            Export CSV
                        </CSVLink>
                    </Button>
                </Box>
                <List>
                    <AnimatePresence>
                        {projects.map(p => (
                            <motion.div
                                key={p._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <ListItem
                                    secondaryAction={
                                        <>
                                            <IconButton onClick={() => setEditing(p)}><EditIcon /></IconButton>
                                            <IconButton onClick={() => del(p._id)}><DeleteIcon /></IconButton>
                                        </>
                                    }
                                >
                                    <ListItemText
                                        primary={p.title}
                                        secondary={p.clientId?.name || "No client"}
                                    />
                                </ListItem>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </List>
            </Paper>
        </Box>
    );
}
