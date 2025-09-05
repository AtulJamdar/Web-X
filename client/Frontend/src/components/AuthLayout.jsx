import { Container, Box, Paper, Typography } from "@mui/material";

export default function AuthLayout({ title, children }) {
    return (
        <Container maxWidth="sm">
            <Box mt={8}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        {title}
                    </Typography>
                    {children}
                </Paper>
            </Box>
        </Container>
    );
}
