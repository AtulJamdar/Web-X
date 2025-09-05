import React, { useEffect, useState } from "react";
import {
    Paper, TextField, Button, Box, List, ListItem, ListItemText,
    IconButton, Typography
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { CSVLink } from "react-csv";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const schema = Yup.object({
    name: Yup.string().required("Name is required"),
    company: Yup.string().required("Company is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function ClientForm({ token }) {
    const [clients, setClients] = useState([]);
    const [editing, setEditing] = useState(null);
    const [query, setQuery] = useState("");

    useEffect(() => { load(); }, [token]);

    const load = async () => {
        const res = await axios.get("http://localhost:5000/api/auth/clients", {
            headers: { Authorization: "Bearer " + token }
        });
        setClients(res.data || []);
    };

    const handleSearch = async (e) => {
        const q = e.target.value;
        setQuery(q);
        if (q.length > 0) {
            const res = await axios.get(`http://localhost:5000/api/auth/search?q=${q}`, {
                headers: { Authorization: "Bearer " + token },
            });
            setClients(res.data);
        } else {
            setResults();
        }
    };

    const submit = async (values, { resetForm }) => {
        if (editing) {
            await axios.put(`http://localhost:5000/api/auth/clients/${editing._id}`, values, {
                headers: { Authorization: "Bearer " + token }
            });
            setEditing(null);
        } else {
            await axios.post("http://localhost:5000/api/auth/clients", values, {
                headers: { Authorization: "Bearer " + token }
            });
        }
        resetForm();
        load();
    };

    const del = async (id) => {
        await axios.delete(`http://localhost:5000/api/auth/clients/${id}`, {
            headers: { Authorization: "Bearer " + token }
        });
        load();
    };

    return (
        <Box>

            <Paper sx={{ p: 3, mb: 3 }} elevation={4}>
                <Typography variant="h6" gutterBottom>
                    {editing ? "Update Client" : "Add Client"}
                </Typography>
                <Formik
                    initialValues={editing || { name: "", company: "", email: "" }}
                    enableReinitialize
                    validationSchema={schema}
                    onSubmit={submit}
                >
                    {({ errors, touched, handleChange, values }) => (
                        <Form>
                            <TextField
                                fullWidth name="name" label="Name" value={values.name}
                                onChange={handleChange}
                                error={touched.name && Boolean(errors.name)}
                                helperText={touched.name && errors.name}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth name="company" label="Company" value={values.company}
                                onChange={handleChange}
                                error={touched.company && Boolean(errors.company)}
                                helperText={touched.company && errors.company}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth name="email" label="Email" value={values.email}
                                onChange={handleChange}
                                error={touched.email && Boolean(errors.email)}
                                helperText={touched.email && errors.email}
                                sx={{ mb: 2 }}
                            />
                            <Button type="submit" variant="contained">
                                {editing ? "Update" : "Add"}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Paper>

            <Paper sx={{ p: 3 }} elevation={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h6">Clients</Typography>

                    <TextField
                        id="outlined-required"
                        label="Search Clients..."
                        defaultValue=""
                        onChange={handleSearch}
                    />


                    <Button variant="outlined">
                        <CSVLink data={clients} filename="clients.csv"
                            style={{ textDecoration: "none", color: "inherit" }}>
                            Export CSV
                        </CSVLink>
                    </Button>
                </Box>
                <List>
                    <AnimatePresence>
                        {clients.map(c => (
                            <motion.div
                                key={c._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <ListItem
                                    secondaryAction={
                                        <>
                                            <IconButton onClick={() => setEditing(c)}><EditIcon /></IconButton>
                                            <IconButton onClick={() => del(c._id)}><DeleteIcon /></IconButton>
                                        </>
                                    }
                                >
                                    <ListItemText primary={c.name} secondary={`${c.company} • ${c.email}`} />
                                </ListItem>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </List>
            </Paper>
        </Box>
    );
}
