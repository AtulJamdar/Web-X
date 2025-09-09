const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Project = require('../models/Project');
const mongoose = require('mongoose')
const { authorizeRole } = require("../middleware/role");
const rateLimit = require("express-rate-limit");
//new
const { check, validationResult } = require("express-validator");


const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already in use' });

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hash });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
});

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 5,
    message: "Too many login attempts, try again later.",
});

// LOGIN
// router.post('/login', loginLimiter, async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         const user = await User.findOne({ email });
//         if (!user) return res.status(400).json({ message: 'Invalid email or password' });

//         const ok = await bcrypt.compare(password, user.password);
//         if (!ok) return res.status(400).json({ message: 'Invalid email or password' });

//         const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             token,
//             user: { id: user._id, username: user.username, email: user.email }
//         });
//     } catch (e) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });
//------------------------------------

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  "/login",loginLimiter,
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }
      
      const payload = {
        user: {
          id: user.id,
        },
      };

      // Corrected line: Use process.env.JWT_SECRET
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "5h" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

//Get current logged-in user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password'); // hide password
        if (!user) {
            return res.status(404).json({ msg: "User not found" })
        }
        res.json(user);
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: 'Server error' });
    }
});

// Revenue by month (only logged-in user's invoices)
router.get("/revenue-by-month", auth, async (req, res) => {
    try {
        const revenue = await Invoice.aggregate([
            { $match: { userId: req.userId } }, // filter invoices by logged-in user
            {
                $group: {
                    _id: { $month: "$dueDate" }, // group by month of dueDate
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json(revenue);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});


//*****************************   Client *******************/

// Get all clients for logged-in user
router.get('/clients', auth, async (req, res) => {
    try {
        const clients = await Client.find({ userId: req.userId });
        res.json(clients);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new client
router.post("/clients", auth, async (req, res) => {
    try {
        const { name, email, company } = req.body;

        const client = await Client.create({
            name,
            email,
            company,
            userId: req.userId // link to logged-in user
        });

        res.json(client);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

//Update Client

router.put("/clients/:id", auth, async (req, res) => {
    try {
        const client = await Client.findOneAndUpdate({ _id: req.params.id, userId: req.userId },
            req.body, { new: true }
        );
        res.json(client);
    } catch (err) { res.status(500).send("Server error"); }
});

// Only admins can delete a client

router.delete("/clients/:id", auth,  async (req, res) => {
    await Client.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Client deleted" });
});

// Search Clients by name or company
router.get("/search", auth, async (req, res) => {
    try {
        const query = req.query.q || "";
        const clients = await Client.find({
            userId: req.userId,
            $or: [
                { name: { $regex: query, $options: "i" } },
                { company: { $regex: query, $options: "i" } }
            ]
        });
        res.json(clients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


//*****************************   Project *******************/

// Get logged-in user's projects
router.get("/projects", auth, async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.userId })
            .populate("clientId", "name email company");
        // populate client details (but only name, email, company)

        res.json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// Create a new project
router.post("/projects", auth, async (req, res) => {
    try {
        const { title, description, status, clientId } = req.body;

        const project = await Project.create({
            title,
            description,
            status,
            clientId,
            userId: req.userId // link to logged-in user
        });

        res.json(project);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

//Update Project

router.put("/projects/:id", auth, async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate({ _id: req.params.id, userId: req.userId },
            req.body, { new: true }
        );
        res.json(project);
    } catch (err) { res.status(500).send("Server error"); }
});

// Only Admins can Delete Project

router.delete("/projects/:id", auth, async (req, res) => {

    await Project.findOneAndDelete({ _id: req.params.id, userId: req.userId }),
        res.json({ message: "Project deleted" })
})

// Search Projects by title
router.get("/search", auth, async (req, res) => {
    try {
        const query = req.query.q || "";
        const projects = await Project.find({
            userId: req.userId,
            title: { $regex: query, $options: "i" }
        }).populate("clientId");
        res.json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


//*****************************   Invoice *******************/

// Get logged-in user's invoices

router.get("/invoices", auth, async (req, res) => {
    try {
        const invoices = await Invoice.find({ userId: req.userId })
            .populate("clientId", "name company email")
            .populate({
                path: "projectId",
                populate: { path: "clientId", select: "name company email" }
            });

        res.json(invoices);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// Create a new invoice
router.post("/invoices", auth, async (req, res) => {
    try {
        const { projectId, clientId, amount, dueDate } = req.body;

        const invoice = await Invoice.create({
            projectId,
            clientId,
            amount,
            dueDate,
            userId: req.userId // link to logged-in user
        });

        res.json(invoice);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

//update Invoices

router.put("/invoices/:id", auth, async (req, res) => {
    try {
        const invoice = await Invoice.findOneAndUpdate({ _id: req.params.id, userId: req.userId },
            req.body, { new: true }
        );
        res.json(invoice);
    } catch (err) { res.status(500).send("Server error"); }
});

//Only Admins can Delete Invoice
router.delete("/invoices/:id", auth, async (req, res) => {
    await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.userId }),
        res.json({ message: "Invoice deleted" })
})

// Search Invoices by client name
router.get("/search", auth, async (req, res) => {
    try {
        const query = req.query.q || "";
        const invoices = await Invoice.find({ userId: req.userId })
            .populate("clientId")
            .populate("projectId");

        // Filter after populate (since client name is in related doc)
        const filtered = invoices.filter(inv =>
            inv.projectId?.status?.toLowerCase().includes(query.toLowerCase()) ||
            inv.projectId?.title?.toLowerCase().includes(query.toLowerCase())
        );

        res.json(filtered);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


//**************************************** Dashboard *****************************/


//Dashboar API

router.get("/dashboard", auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);

        const clients = await Client.find({ userId });
        const projects = await Project.find({ userId }).populate("clientId");
        const invoices = await Invoice.find({ userId }).populate("clientId");

        const revenue = await Invoice.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: { $month: "$dueDate" },
                    total: { $sum: "$amount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // New insights
        const outstandingRevenue = await Invoice.aggregate([
            { $match: { userId, status: "outstanding" } },
            {
                $group: {
                    _id: "$clientId",
                    totalOutstanding: { $sum: "$amount" },
                },
            },
            {
                $lookup: {
                    from: "clients",
                    localField: "_id",
                    foreignField: "_id",
                    as: "client",
                },
            },
            { $unwind: "$client" },
            { $project: { clientName: "$client.name", totalOutstanding: 1 } },
        ]);

        const upcomingDeadlines = await Project.find({
            userId,
            deadline: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
        }).populate("clientId", "name");

        res.json({
            clients,
            projects,
            invoices,
            revenue,
            outstandingRevenue,
            upcomingDeadlines,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }


});





module.exports = router;
