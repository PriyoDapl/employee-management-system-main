"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Mail as MailIcon,
  History as HistoryIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

const MailManagement = ({ user, onBack }) => {
  const [mounted, setMounted] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [mailHistory, setMailHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    requestType: "",
    subject: "",
    message: "",
    selectedPosition: null,
    ccPositions: [],
    priority: "Medium",
  });

  // Modal state
  const [selectedMail, setSelectedMail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const requestTypes = [
    "Leave Application",
    "Work from Home",
    "General Request",
    "Others",
  ];

  const priorities = ["Low", "Medium", "High"];

  useEffect(() => {
    setMounted(true);
    fetchAvailablePositions();
    fetchMailHistory();
  }, []);

  const fetchAvailablePositions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/mail?action=get-positions", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch available positions");
      }

      const data = await response.json();
      setAvailablePositions(data.positions || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchMailHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/mail", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch mail history");
      }

      const data = await response.json();
      setMailHistory(data.mails || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePositionChange = (field, newValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const resetForm = () => {
    setFormData({
      requestType: "",
      subject: "",
      message: "",
      selectedPosition: null,
      ccPositions: [],
      priority: "Medium",
    });
  };

  const handleSendMail = async () => {
    if (
      !formData.requestType ||
      !formData.subject ||
      !formData.message ||
      !formData.selectedPosition
    ) {
      setError(
        "Please fill in all required fields and select a recipient position"
      );
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem("token");

      // Extract position IDs from selected position objects
      const requestData = {
        ...formData,
        selectedPositions: [formData.selectedPosition._id], // Convert single position to array for backend compatibility
        ccPositions: formData.ccPositions.map((pos) => pos._id),
      };

      const response = await fetch("/api/mail", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        let successMessage = "Mail sent successfully!";
        if (data.emailResults) {
          const { sent = 0, failed = 0 } = data.emailResults;
          if (sent > 0 && failed === 0) {
            successMessage += ` Email delivered to ${sent} recipient(s).`;
          } else if (sent > 0 && failed > 0) {
            successMessage += ` Email delivered to ${sent} recipient(s), ${failed} failed.`;
          } else if (failed > 0) {
            successMessage += ` Warning: Email delivery failed for ${failed} recipient(s).`;
          }
        }
        setSuccess(successMessage);
        resetForm();
        fetchMailHistory();
        setTimeout(() => setSuccess(""), 7000);
      } else {
        setError(data.error || "Failed to send mail");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
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
            Internal Mail System
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Tabs */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab icon={<SendIcon />} label="Send Mail" iconPosition="start" />
            <Tab
              icon={<HistoryIcon />}
              label="Mail History"
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Send Mail Tab */}
        {currentTab === 0 && (
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <MailIcon color="primary" />
              <Typography variant="h6" color="primary.main">
                Compose Internal Request
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl sx={{ width: "15vw" }} required>
                  <InputLabel>Request Type</InputLabel>
                  <Select
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleFormChange}
                    label="Request Type"
                  >
                    {requestTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    label="Priority"
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  sx={{ width: "20vw" }}
                  name="subject"
                  label="Subject"
                  value={formData.subject}
                  onChange={handleFormChange}
                  placeholder="Brief description of your request"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={availablePositions}
                  getOptionLabel={(option) => option.position}
                  value={formData.selectedPosition}
                  onChange={(event, newValue) =>
                    handlePositionChange("selectedPosition", newValue)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Send To Position (Required)"
                      placeholder="Select position to send to"
                      required={!formData.selectedPosition}
                      helperText="Select the position that should receive this mail"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  options={availablePositions.filter(
                    (pos) => !formData.selectedPosition || pos._id !== formData.selectedPosition._id
                  )}
                  getOptionLabel={(option) => option.position}
                  value={formData.ccPositions}
                  onChange={(event, newValue) =>
                    handlePositionChange("ccPositions", newValue)
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option.position}
                        {...getTagProps({ index })}
                        key={option._id}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="CC Positions (Optional)"
                      placeholder="Select positions to CC"
                      helperText="Positions that will receive a copy of this mail"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="message"
                  label="Message"
                  value={formData.message}
                  onChange={handleFormChange}
                  placeholder="Provide detailed information about your request..."
                  multiline
                  rows={6}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}
                >
                  <Button
                    onClick={resetForm}
                    disabled={sending}
                    sx={{ minWidth: 100 }}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSendMail}
                    variant="contained"
                    startIcon={
                      sending ? <CircularProgress size={20} /> : <SendIcon />
                    }
                    disabled={sending}
                    sx={{ minWidth: 120 }}
                  >
                    {sending ? "Sending..." : "Send Mail"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Mail History Tab */}
        {currentTab === 1 && (
          <Paper elevation={2} sx={{ borderRadius: 3 }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Mail History
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>About Position-Based Mailing:</strong> All mails are
                  sent to positions rather than individual email addresses. When
                  you send a mail to "HR Manager", it goes to whoever currently
                  holds that position. This ensures continuity even when
                  employees change roles.
                </Typography>
              </Alert>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : mailHistory.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <MailIcon
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Mails Sent Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your sent mail history will appear here.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Request Type</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Sent To Positions</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mailHistory.map((mail) => (
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
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.5,
                              }}
                            >
                              {[...new Set(mail.recipients.map(recipient => recipient.position))].map((position, index) => (
                                <Chip
                                  key={index}
                                  sx={{
                                    pointerEvents: "none",
                                    alignSelf: "flex-start",
                                  }}
                                  label={position}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              ))}
                              {mail.ccRecipients &&
                                mail.ccRecipients.length > 0 && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mt: 0.5 }}
                                  >
                                    CC:{" "}
                                    {[...new Set(mail.ccRecipients
                                      .map((cc) => cc.position))]
                                      .join(", ")}
                                  </Typography>
                                )}
                            </Box>
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
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Chip
                                label={mail.status}
                                color={
                                  mail.status === "Sent" ? "success" : "default"
                                }
                                size="small"
                                sx={{ pointerEvents: "none" }}
                              />
                              {mail.emailStatus && (
                                <Chip
                                  label={`Email: ${mail.emailStatus}`}
                                  color={
                                    mail.emailStatus === "Sent" ? "success" :
                                    mail.emailStatus === "Partially Sent" ? "warning" :
                                    mail.emailStatus === "Failed" ? "error" : "default"
                                  }
                                  size="small"
                                  variant="outlined"
                                  sx={{ pointerEvents: "none" }}
                                />
                              )}
                            </Box>
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
        )}
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
                    Request Type
                  </Typography>
                  <Typography variant="body1">
                    {selectedMail.requestType}
                  </Typography>
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
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subject
                  </Typography>
                  <Typography variant="body1">
                    {selectedMail.subject}
                  </Typography>
                </Grid>
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
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Recipients (Positions)
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}
                  >
                    {[...new Set(selectedMail.recipients?.map(recipient => recipient.position) || [])].map((position, index) => (
                      <Chip
                        key={index}
                        label={position}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ pointerEvents: "none" }}
                      />
                    ))}
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Mail will be delivered to employees holding these positions
                  </Typography>
                </Grid>
                {selectedMail.ccRecipients &&
                  selectedMail.ccRecipients.length > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        CC Recipients (Positions)
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          mt: 1,
                        }}
                      >
                        {[...new Set(selectedMail.ccRecipients.map(cc => cc.position))].map((position, index) => (
                          <Chip
                            key={index}
                            label={position}
                            size="small"
                            variant="outlined"
                            color="secondary"
                            sx={{ pointerEvents: "none" }}
                          />
                        ))}
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        These positions will receive a copy
                      </Typography>
                    </Grid>
                  )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sent On
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

export default MailManagement;
