"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Mail as MailIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

const InboxManagement = ({ user, onBack }) => {
  const [mounted, setMounted] = useState(false);
  const [receivedMails, setReceivedMails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMail, setSelectedMail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchReceivedMails();
  }, []);

  const fetchReceivedMails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/mail/inbox", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch inbox mails");
      }

      const data = await response.json();
      setReceivedMails(data.mails || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchReceivedMails();
  };

  const openMailDetail = (mail) => {
    setSelectedMail(mail);
    setShowDetailModal(true);
  };

  const closeMailDetail = () => {
    setSelectedMail(null);
    setShowDetailModal(false);
  };

  const clearError = () => setError("");

  if (!mounted) {
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100" }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "transparent",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="primary"
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, color: "text.primary" }}
          >
            Inbox - Received Mails
          </Typography>
          <IconButton
            color="primary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Inbox Content */}
        <Paper elevation={2} sx={{ borderRadius: 3 }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <MailIcon color="primary" />
              <Typography variant="h6" color="primary.main">
                Your Inbox
              </Typography>
            </Box>

            {/* User Position Info */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Position-Based Inbox:</strong> You receive mails sent to your current position. To know your current position, please check your profile.
                {user?.role === "management" && " As management, you can view all emails with complete recipient details including TO and CC recipients."}
              </Typography>
            </Alert>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : receivedMails.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <MailIcon
                  sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Mails Received Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mails sent to your position will appear here.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>From</TableCell>
                      <TableCell>Request Type</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {receivedMails.map((mail) => (
                      <TableRow key={mail._id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(mail.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {new Date(mail.createdAt).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {mail.senderName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {mail.senderEmail}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={mail.requestType}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ pointerEvents: "none" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {mail.subject}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={mail.priority}
                            color={
                              mail.priority === "High"
                                ? "error"
                                : mail.priority === "Medium"
                                ? "warning"
                                : "default"
                            }
                            sx={{ pointerEvents: "none" }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => openMailDetail(mail)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Mail Detail Modal */}
      <Dialog
        open={showDetailModal}
        onClose={closeMailDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Mail Details</DialogTitle>
        <DialogContent>
          {selectedMail && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    From
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedMail.senderName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMail.senderEmail}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Request Type
                  </Typography>
                  <Chip
                    label={selectedMail.requestType}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ pointerEvents: "none" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip
                    label={selectedMail.priority}
                    sx={{ pointerEvents: "none" }}
                    color={
                      selectedMail.priority === "High"
                        ? "error"
                        : selectedMail.priority === "Medium"
                        ? "warning"
                        : "default"
                    }
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Recipient Type
                  </Typography>
                  <Chip
                    label={selectedMail.recipientType || "TO"}
                    color={selectedMail.recipientType === "CC" ? "secondary" : "primary"}
                    size="small"
                    variant="filled"
                    sx={{ pointerEvents: "none" }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subject
                  </Typography>
                  <Typography variant="body1">
                    {selectedMail.subject}
                  </Typography>
                </Grid>
                {user?.role === "management" && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Recipients (TO)
                      </Typography>
                      <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {selectedMail.recipients && selectedMail.recipients.length > 0 ? (
                          [...new Set(selectedMail.recipients.map(recipient => recipient.position))].map((position, index) => (
                            <Chip
                              key={index}
                              label={position}
                              color="primary"
                              variant="outlined"
                              size="small"
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No recipients
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        CC Recipients
                      </Typography>
                      <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {selectedMail.ccRecipients && selectedMail.ccRecipients.length > 0 ? (
                          [...new Set(selectedMail.ccRecipients.map(ccRecipient => ccRecipient.position))].map((position, index) => (
                            <Chip
                              key={index}
                              label={position}
                              color="secondary"
                              variant="outlined"
                              size="small"
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No CC recipients
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Message
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, mt: 1, bgcolor: "grey.50" }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {selectedMail.message}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Received On
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedMail.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMailDetail}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InboxManagement;
