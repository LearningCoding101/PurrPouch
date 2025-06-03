import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  getAllDeliveries,
  updateDeliveryStatus,
} from "../../services/adminApi";

const statusColors = {
  PENDING: "warning",
  IN_TRANSIT: "info",
  OUT_FOR_DELIVERY: "primary",
  DELIVERED: "success",
  FAILED: "error",
};

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await getAllDeliveries(page, rowsPerPage, statusFilter);
      setDeliveries(response.data.content);
      setTotalDeliveries(response.data.totalElements);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      // Mock data for development
      const mockDeliveries = Array(10)
        .fill()
        .map((_, index) => ({
          id: `DEL-${1000 + index}`,
          orderId: `ORD-${1000 + index}`,
          customerName: `Customer ${index + 1}`,
          scheduledDate: new Date(
            Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000
          ).toISOString(),
          address: {
            street: `${Math.floor(Math.random() * 100)} Main St`,
            city: "Ho Chi Minh City",
            district: ["District 1", "District 2", "District 3"][
              Math.floor(Math.random() * 3)
            ],
            postalCode: "70000",
          },
          status: [
            "PENDING",
            "IN_TRANSIT",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "FAILED",
          ][Math.floor(Math.random() * 5)],
          preferredTimeWindow: [
            "9:00 AM - 12:00 PM",
            "1:00 PM - 5:00 PM",
            "6:00 PM - 9:00 PM",
          ][Math.floor(Math.random() * 3)],
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
          ).toISOString(),
        }));
      setDeliveries(mockDeliveries);
      setTotalDeliveries(100);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [page, rowsPerPage, statusFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedDelivery(null);
  };

  const handleUpdateStatus = (deliveryId, currentStatus) => {
    setSelectedDelivery(deliveries.find((d) => d.id === deliveryId));
    setNewStatus(currentStatus);
    setStatusUpdateOpen(true);
  };

  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

  const handleSaveStatus = async () => {
    if (!selectedDelivery || !newStatus) return;

    try {
      await updateDeliveryStatus(selectedDelivery.id, newStatus);
      // Update the local state
      setDeliveries(
        deliveries.map((delivery) =>
          delivery.id === selectedDelivery.id
            ? { ...delivery, status: newStatus }
            : delivery
        )
      );
    } catch (error) {
      console.error("Error updating delivery status:", error);
      // For development, just update the UI anyway
      setDeliveries(
        deliveries.map((delivery) =>
          delivery.id === selectedDelivery.id
            ? { ...delivery, status: newStatus }
            : delivery
        )
      );
    }

    setStatusUpdateOpen(false);
    setSelectedDelivery(null);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Delivery Management
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            variant="outlined"
            label="Search by Delivery ID, Order ID or Customer Name"
            value={searchTerm}
            onChange={handleSearch}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="IN_TRANSIT">In Transit</MenuItem>
              <MenuItem value="OUT_FOR_DELIVERY">Out for Delivery</MenuItem>
              <MenuItem value="DELIVERED">Delivered</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Delivery ID</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Scheduled Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={40} sx={{ my: 2 }} />
                </TableCell>
              </TableRow>
            ) : filteredDeliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No deliveries found
                </TableCell>
              </TableRow>
            ) : (
              filteredDeliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>{delivery.id}</TableCell>
                  <TableCell>{delivery.orderId}</TableCell>
                  <TableCell>{delivery.customerName}</TableCell>
                  <TableCell>{formatDate(delivery.scheduledDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={delivery.status}
                      color={statusColors[delivery.status] || "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleViewDetails(delivery)}
                      sx={{ mr: 1 }}
                    >
                      Details
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        handleUpdateStatus(delivery.id, delivery.status)
                      }
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalDeliveries}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Delivery Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Delivery Details</DialogTitle>
        <DialogContent>
          {selectedDelivery && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Delivery Information
                      </Typography>
                      <Typography variant="body1">
                        <strong>Delivery ID:</strong> {selectedDelivery.id}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Order ID:</strong> {selectedDelivery.orderId}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Status:</strong>{" "}
                        <Chip
                          label={selectedDelivery.status}
                          color={
                            statusColors[selectedDelivery.status] || "default"
                          }
                          size="small"
                        />
                      </Typography>
                      <Typography variant="body1">
                        <strong>Created:</strong>{" "}
                        {formatDate(selectedDelivery.createdAt)}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Scheduled Date:</strong>{" "}
                        {formatDate(selectedDelivery.scheduledDate)}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Preferred Time:</strong>{" "}
                        {selectedDelivery.preferredTimeWindow}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Customer & Address Information
                      </Typography>
                      <Typography variant="body1">
                        <strong>Customer:</strong>{" "}
                        {selectedDelivery.customerName}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Delivery Address:</strong>{" "}
                        {selectedDelivery.address?.street},{" "}
                        {selectedDelivery.address?.district},{" "}
                        {selectedDelivery.address?.city}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Postal Code:</strong>{" "}
                        {selectedDelivery.address?.postalCode}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    handleCloseDetails();
                    handleUpdateStatus(
                      selectedDelivery.id,
                      selectedDelivery.status
                    );
                  }}
                >
                  Update Status
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={statusUpdateOpen}
        onClose={() => setStatusUpdateOpen(false)}
      >
        <DialogTitle>Update Delivery Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={handleStatusChange}
              label="Status"
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="IN_TRANSIT">In Transit</MenuItem>
              <MenuItem value="OUT_FOR_DELIVERY">Out for Delivery</MenuItem>
              <MenuItem value="DELIVERED">Delivered</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveStatus} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Deliveries;
