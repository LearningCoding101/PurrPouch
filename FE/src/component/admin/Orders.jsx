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
  Divider,
} from "@mui/material";
import {
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
} from "../../services/adminApi";

const statusColors = {
  PENDING: "warning",
  PROCESSING: "info",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELLED: "error",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getAllOrders(page, rowsPerPage, statusFilter);
      setOrders(response.data.content);
      setTotalOrders(response.data.totalElements);
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Mock data for development
      const mockOrders = Array(10)
        .fill()
        .map((_, index) => ({
          id: `ORD-${1000 + index}`,
          userId: `USER-${2000 + index}`,
          userName: `Customer ${index + 1}`,
          totalPrice: Math.floor(Math.random() * 500000) + 100000,
          status: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"][
            Math.floor(Math.random() * 4)
          ],
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
          ).toISOString(),
          address: {
            street: `${Math.floor(Math.random() * 100)} Main St`,
            city: "Ho Chi Minh City",
            district: ["District 1", "District 2", "District 3"][
              Math.floor(Math.random() * 3)
            ],
            postalCode: "70000",
          },
        }));
      setOrders(mockOrders);
      setTotalOrders(100);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, statusFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await getOrderDetails(orderId);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      // Mock data for development
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setSelectedOrder({
          ...order,
          items: Array(Math.floor(Math.random() * 5) + 1)
            .fill()
            .map((_, index) => ({
              id: `ITEM-${index}`,
              name: `Cat Food Meal Kit ${index + 1}`,
              quantity: Math.floor(Math.random() * 3) + 1,
              price: Math.floor(Math.random() * 100000) + 50000,
            })),
          deliveryInfo: {
            preferredTime: "9:00 AM - 12:00 PM",
            trackingNumber: `TRK-${Math.floor(Math.random() * 10000)}`,
            estimatedDelivery: new Date(
              Date.now() + 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        });
      }
    }
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = (orderId, currentStatus) => {
    setSelectedOrder(orders.find((o) => o.id === orderId));
    setNewStatus(currentStatus);
    setStatusUpdateOpen(true);
  };

  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await updateOrderStatus(selectedOrder.id, newStatus);
      // Update the local state
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      // For development, just update the UI anyway
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: newStatus }
            : order
        )
      );
    }

    setStatusUpdateOpen(false);
    setSelectedOrder(null);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.userName &&
        order.userName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
        Order Management
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            variant="outlined"
            label="Search by Order ID or Customer Name"
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
              <MenuItem value="PROCESSING">Processing</MenuItem>
              <MenuItem value="SHIPPED">Shipped</MenuItem>
              <MenuItem value="DELIVERED">Delivered</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
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
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.userName || "N/A"}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={statusColors[order.status] || "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleViewDetails(order.id)}
                      sx={{ mr: 1 }}
                    >
                      Details
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleUpdateStatus(order.id, order.status)}
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
          count={totalOrders}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Order Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Order Information
                      </Typography>
                      <Typography variant="body1">
                        <strong>Order ID:</strong> {selectedOrder.id}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Date:</strong>{" "}
                        {formatDate(selectedOrder.createdAt)}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Status:</strong>{" "}
                        <Chip
                          label={selectedOrder.status}
                          color={
                            statusColors[selectedOrder.status] || "default"
                          }
                          size="small"
                        />
                      </Typography>
                      <Typography variant="body1">
                        <strong>Total:</strong>{" "}
                        {formatCurrency(selectedOrder.totalPrice)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Customer & Delivery Information
                      </Typography>
                      <Typography variant="body1">
                        <strong>Customer:</strong>{" "}
                        {selectedOrder.userName || "N/A"}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Customer ID:</strong>{" "}
                        {selectedOrder.userId || "N/A"}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Delivery Address:</strong>{" "}
                        {selectedOrder.address?.street},{" "}
                        {selectedOrder.address?.district},{" "}
                        {selectedOrder.address?.city}
                      </Typography>
                      {selectedOrder.deliveryInfo && (
                        <>
                          <Typography variant="body1">
                            <strong>Preferred Time:</strong>{" "}
                            {selectedOrder.deliveryInfo.preferredTime}
                          </Typography>
                          <Typography variant="body1">
                            <strong>Tracking #:</strong>{" "}
                            {selectedOrder.deliveryInfo.trackingNumber}
                          </Typography>
                          <Typography variant="body1">
                            <strong>Est. Delivery:</strong>{" "}
                            {formatDate(
                              selectedOrder.deliveryInfo.estimatedDelivery
                            )}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Order Items
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items &&
                      selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <strong>Total</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          {formatCurrency(selectedOrder.totalPrice)}
                        </strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              handleCloseDetails();
              handleUpdateStatus(selectedOrder.id, selectedOrder.status);
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={statusUpdateOpen}
        onClose={() => setStatusUpdateOpen(false)}
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={handleStatusChange}
              label="Status"
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PROCESSING">Processing</MenuItem>
              <MenuItem value="SHIPPED">Shipped</MenuItem>
              <MenuItem value="DELIVERED">Delivered</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
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

export default Orders;
