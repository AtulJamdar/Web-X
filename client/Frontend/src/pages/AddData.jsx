import React from "react";
import { Container, Tabs, Tab, Box, Paper, Typography } from "@mui/material";
import ClientForm from "../components/forms/ClientForm";
import ProjectForm from "../components/forms/ProjectForm";
import InvoiceForm from "../components/forms/InvoiceForm";
import { motion, AnimatePresence } from "framer-motion";

function TabPanel({ children, value, index }) {
    return (
        <AnimatePresence mode="wait">
            {value === index && (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.1 }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function AddData({ token }) {
    const [value, setValue] = React.useState(0);
    const handleChange = (e, v) => setValue(v);

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h5">Add / Manage Data</Typography>
                <Tabs value={value} onChange={handleChange} sx={{ mt: 2 }}>
                    <Tab label="Clients" />
                    <Tab label="Projects" />
                    <Tab label="Invoices" />
                </Tabs>

                <TabPanel value={value} index={0}>
                    <ClientForm token={token} />
                </TabPanel>

                <TabPanel value={value} index={1}>
                    <ProjectForm token={token} />
                </TabPanel>

                <TabPanel value={value} index={2}>
                    <InvoiceForm token={token} />
                </TabPanel>
            </Paper>
        </Container>
    );
}
