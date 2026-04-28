const express = require('express');
const app = express();
app.use(express.json());

// Temporary storage (in real app, use MongoDB)
let users = [
    {
        id: "user1",
        email: "demo@example.com",
        name: "Demo User",
        referralCode: "DEMO123",
        referredBy: null,
        isPremium: false,
        wallet: 5.50
    }
];

// Homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Get user info
app.get('/api/user/:userId', (req, res) => {
    const user = users.find(u => u.id === req.params.userId);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

// Sign up with referral
app.post('/api/signup', (req, res) => {
    const { email, name, referrerCode } = req.body;
    
    // Check if referrer exists
    const referrer = users.find(u => u.referralCode === referrerCode);
    
    const newUser = {
        id: "user" + Date.now(),
        email: email,
        name: name,
        referralCode: "REF" + Math.random().toString(36).substring(7).toUpperCase(),
        referredBy: referrer ? referrer.id : null,
        isPremium: false,
        wallet: 0
    };
    
    users.push(newUser);
    res.json({ success: true, user: newUser });
});

// Buy premium
app.post('/api/buy-premium', (req, res) => {
    const { userId, amount } = req.body;
    
    if (amount < 9.99) {
        return res.status(400).json({ error: "Minimum price is $9.99" });
    }
    
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    
    user.isPremium = true;
    
    // Give 10% commission to referrer
    if (user.referredBy) {
        const referrer = users.find(u => u.id === user.referredBy);
        if (referrer) {
            const commission = amount * 0.10;
            referrer.wallet += commission;
            console.log(`💰 ${referrer.name} earned $${commission} commission!`);
        }
    }
    
    res.json({ success: true, message: "Premium activated!", wallet: user.wallet });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📋 Demo user referral code: DEMO123`);
});