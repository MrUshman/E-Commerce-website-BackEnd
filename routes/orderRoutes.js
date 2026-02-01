const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');

// ---------------------------------------------------------
// ✅ 0. ADMIN ANALYTICS STATS (Pehle jaisa hi hai)
// ---------------------------------------------------------
router.get('/admin/stats', protect, admin, async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $facet: {
          "totalSales": [
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
          ],
          "orderCounts": [
            { $group: { _id: "$status", count: { $sum: 1 } } }
          ],
          "totalOrders": [
            { $count: "count" }
          ],
          "recentOrders": [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 1,
                totalPrice: 1,
                status: 1,
                createdAt: 1
              }
            }
          ]
        }
      }
    ]);

    const result = {
      totalSales: stats[0].totalSales[0]?.total || 0,
      totalOrders: stats[0].totalOrders[0]?.count || 0,
      orderStatus: stats[0].orderCounts,
      recentActivity: stats[0].recentOrders
    };

    res.json(result);
  } catch (error) {
    console.error("Stats Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------
// ✅ 1. CREATE NEW ORDER (FIXED: Screenshot & Address)
// ---------------------------------------------------------
router.post('/', protect, async (req, res) => {
  try {
    const {
      orderItems, 
      shippingAddress, 
      paymentMethod,
      paymentScreenshot, // ✅ Body se screenshot nikala
      itemsPrice, 
      taxPrice, 
      shippingPrice, 
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress: {
        ...shippingAddress,
        fullName: shippingAddress.fullName, // ✅ Model ki requirement
        phone: shippingAddress.phone,       // ✅ Model ki requirement
        country: shippingAddress.country || 'India'
      },
      paymentMethod: typeof paymentMethod === 'object' ? paymentMethod.method : paymentMethod,
      paymentScreenshot: paymentScreenshot || "", // ✅ Database mein save kiya
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: paymentMethod === 'Online',
      paidAt: paymentMethod === 'Online' ? Date.now() : null,
      status: 'Pending'
    });

    const createdOrder = await order.save();
    console.log("✅ Order Saved with Screenshot:", createdOrder._id);
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("❌ Order Create Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------
// ✅ 2. GET ORDER BY ID
// ---------------------------------------------------------
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------
// ✅ 3. GET LOGGED IN USER ORDERS
// ---------------------------------------------------------
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------
// ✅ 4. GET ALL ORDERS (ADMIN ONLY)
// ---------------------------------------------------------
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------
// ✅ 5. UPDATE ORDER STATUS (Fixed Shipped Logic)
// ---------------------------------------------------------
router.patch('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;

    if (status === 'Delivered') {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else if (status === 'Shipped') {
        // Agar Shipped ho gaya hai toh iska matlab payment verify ho gayi hogi
        order.isPaid = true; 
        order.paidAt = order.paidAt || Date.now();
    }

    const updatedOrder = await order.save();
    console.log(`✅ Order ${order._id} status updated to ${status}`);
    res.json(updatedOrder);
  } catch (error) {
    console.error("Status Update Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------
// ✅ 6. DELETE ORDER (ADMIN ONLY)
// ---------------------------------------------------------
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: 'Order removed' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;