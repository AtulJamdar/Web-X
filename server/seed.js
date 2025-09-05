const mongoose = require("mongoose");
const Invoice = require("./models/Invoice");



async function seedData() {
    try {
        await mongoose.connect("mongodb+srv://atuljamdar4:aQK1aAuGo1aJvoI5@cluster0.tdcww.mongodb.net/webdb");
        console.log("MongoDB Connected for Seeding");

        // Clear old invoices
        await Invoice.deleteMany({});


        // Example userId (replace with a real User _id from your DB if needed)
        const userId = new mongoose.Types.ObjectId();

        // Create 12 invoices (one per month)
        const invoices = [
            { amount: 500, dueDate: new Date(2025, 0, 15), userId }, // Jan
            { amount: 700, dueDate: new Date(2025, 1, 10), userId }, // Feb
            { amount: 300, dueDate: new Date(2025, 2, 20), userId }, // Mar
            { amount: 450, dueDate: new Date(2025, 3, 5), userId }, // Apr
            { amount: 600, dueDate: new Date(2025, 4, 18), userId }, // May
            { amount: 200, dueDate: new Date(2025, 5, 25), userId }, // Jun
            { amount: 900, dueDate: new Date(2025, 6, 8), userId }, // Jul
            { amount: 750, dueDate: new Date(2025, 7, 14), userId }, // Aug
            { amount: 400, dueDate: new Date(2025, 8, 3), userId }, // Sep
            { amount: 850, dueDate: new Date(2025, 9, 12), userId }, // Oct
            { amount: 1000, dueDate: new Date(2025, 10, 30), userId }, // Nov
            { amount: 650, dueDate: new Date(2025, 11, 7), userId }, // Dec
        ];

        await Invoice.insertMany(invoices);

        console.log("✅ Dummy invoices inserted!");
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        mongoose.connection.close();
    }
}

seedData();