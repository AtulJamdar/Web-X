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
    projectId: Yup.string().required("Project is required"),
    amount: Yup.number().required("Amount is required").positive(),
    status: Yup.string().required("Status is required"),
});

export default function InvoiceForm({ token }) {
    const [invoices, setInvoices] = useState([]);
    const [projects, setProjects] = useState([]);
    const [editing, setEditing] = useState(null);
    const [query, setQuery] = useState("");

    useEffect(() => { load(); }, [token]);

    const load = async () => {
        const resI = await axios.get("http://localhost:5000/api/auth/invoices", {
            headers: { Authorization: "Bearer " + token }
        });
        setInvoices(resI.data || []);
        const resP = await axios.get("http://localhost:5000/api/auth/projects", {
            headers: { Authorization: "Bearer " + token }
        });
        setProjects(resP.data || []);
    };

    const handleSearch = async (e) => {
        const q = e.target.value;
        setQuery(q);
        if (q.length > 0) {
            const res = await axios.get(`http://localhost:5000/api/auth/search?q=${q}`, {
                headers: { Authorization: "Bearer " + token },
            });
            setInvoices(res.data);
        } else {
            load();
        }
    };

    const submit = async (values, { resetForm }) => {
        if (editing) {
            await axios.put(`http://localhost:5000/api/auth/invoices/${editing._id}`, values, {
                headers: { Authorization: "Bearer " + token }
            });
            setEditing(null);
        } else {
            await axios.post("http://localhost:5000/api/auth/invoices", values, {
                headers: { Authorization: "Bearer " + token }
            });
        }
        resetForm();
        load();
    };

    const del = async (id) => {
        await axios.delete(`http://localhost:5000/api/auth/invoices/${id}`, {
            headers: { Authorization: "Bearer " + token }
        });
        load();
    };

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }} elevation={4}>
                <Typography variant="h6" gutterBottom>
                    {editing ? "Update Invoice" : "Add Invoice"}
                </Typography>
                <Formik
                    initialValues={editing || { projectId: "", amount: "", status: "unpaid" }}
                    enableReinitialize
                    validationSchema={schema}
                    onSubmit={submit}
                >
                    {({ errors, touched, handleChange, values }) => (
                        <Form>
                            <TextField
                                fullWidth select name="projectId" label="Project"
                                value={values.projectId} onChange={handleChange}
                                error={touched.projectId && Boolean(errors.projectId)}
                                helperText={touched.projectId && errors.projectId}
                                sx={{ mb: 2 }}
                            >
                                {projects.map(p => (
                                    <MenuItem key={p._id} value={p._id}>{p.title}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth name="amount" label="Amount" type="number" value={values.amount}
                                onChange={handleChange}
                                error={touched.amount && Boolean(errors.amount)}
                                helperText={touched.amount && errors.amount}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth select name="status" label="Status"
                                value={values.status} onChange={handleChange}
                                error={touched.status && Boolean(errors.status)}
                                helperText={touched.status && errors.status}
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="paid">Paid</MenuItem>
                                <MenuItem value="unpaid">Unpaid</MenuItem>
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

                    <Typography variant="h6">Invoices</Typography>

                    <TextField
                        id="outlined-required"
                        label="Search Invoices..."
                        defaultValue=""
                        onChange={handleSearch}
                    />

                    <Button variant="outlined">
                        <CSVLink data={invoices} filename="invoices.csv"
                            style={{ textDecoration: "none", color: "inherit" }}>
                            Export CSV
                        </CSVLink>
                    </Button>
                </Box>
                <List>
                    <AnimatePresence>
                        {invoices.map(i => (
                            <motion.div
                                key={i._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <ListItem
                                    secondaryAction={
                                        <>
                                            <IconButton onClick={() => setEditing(i)}><EditIcon /></IconButton>
                                            <IconButton onClick={() => del(i._id)}><DeleteIcon /></IconButton>
                                        </>
                                    }
                                >
                                    <ListItemText
                                        primary={`₹${i.amount} - ${i.status}`}
                                        secondary={i.projectId?.title || "No project"}
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
