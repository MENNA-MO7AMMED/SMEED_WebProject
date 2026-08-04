import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Mayer#2&4D',
  database: 'smee',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database!');
});

const verificationCodes = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'cybersystem100@gmail.com',
    pass: 'eibihmhuuqqhvrdi',
  },
});

const sendVerificationEmail = async (email, verificationCode) => {
  const mailOptions = {
    from: 'SMEED System',
    to: email,
    subject: '🔐 Your Verification Code from SMEED | كود التحقق الخاص بك من سميد',
    text: 
`👋 Thank you for using SMEED Platform for Students! 🎓✨

🔒 Your verification code is:
✨🔢 [${verificationCode}] ✨

Please enter this code to complete your verification. ⏰ The code will expire in 60 seconds and should not be shared with anyone. ⚠️

If you did not request this code, please disregard this message or contact our support team. 🛟

Best regards,
The SMEED Team 😊

----------------------------

👋 شكراً لاستخدامك منصة سميد للطلاب! 🎓✨

🔒 كود التحقق الخاص بك هو:
✨🔢 [${verificationCode}] ✨

يرجى إدخال هذا الكود لإكمال عملية التحقق. ⏰ سينتهي صلاحية الكود خلال 60 ثانية ولا يجب مشاركته مع أي شخص. ⚠️

إذا لم تطلب هذا الكود، يرجى تجاهل هذه الرسالة أو التواصل مع فريق الدعم لدينا. 🛟

مع أطيب التحيات،
فريق سميد 😊
`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification code sent to ${email}: ${verificationCode}`);
    verificationCodes[email] = {
      code: verificationCode,
      expiresAt: Date.now() + 60 * 1000,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification code');
  }
};

// Endpoint للتحقق من الكود
app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;

  console.log('Received verification request:', { email, code });

  if (!email || !code) {
    console.log('Missing required fields:', { email: !!email, code: !!code });
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const storedData = verificationCodes[email];
  console.log('Stored verification data:', { email, storedData });

  if (!storedData) {
    return res.status(400).json({ error: 'No OTP found for this email' });
  }

  if (Date.now() > storedData.expiresAt) {
    console.log('OTP expired:', { 
      email, 
      expiryTime: new Date(storedData.expiresAt).toISOString(),
      currentTime: new Date().toISOString()
    });
    delete verificationCodes[email];
    return res.status(400).json({ error: 'OTP has expired' });
  }

  if (storedData.code !== code) {
    console.log('Invalid OTP:', { 
      email,
      providedCode: code,
      storedCode: storedData.code
    });
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  // Don't delete the OTP yet as it's needed for password update
  console.log('Verification successful:', { email });
  res.status(200).json({ message: 'Verification code is valid' });
});

app.post('/check-user', (req, res) => {
  const { user_name, national_id, email, phone_number } = req.body;

  const query = `
    SELECT * FROM Students 
    WHERE user_name = ? OR national_id = ? OR email = ? OR phone_number = ?
  `;
  db.query(query, [user_name, national_id, email, phone_number], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (results.length > 0) {
      const existingUser = results[0];
      if (existingUser.user_name === user_name) {
        return res.status(400).json({ exists: true, message: 'Username already exists' });
      }
      if (existingUser.national_id === national_id) {
        return res.status(400).json({ exists: true, message: 'National ID already exists' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ exists: true, message: 'Email already exists' });
      }
      if (existingUser.phone_number === phone_number) {
        return res.status(400).json({ exists: true, message: 'Phone number already exists' });
      }
    }

    res.status(200).json({ exists: false });
  });
});

app.post('/signup', async (req, res) => {
  const { user_name, national_id, email, phone_number, birthdate, password } = req.body;

  console.log('Signup request received:', { user_name, email }); // Debug log

  try {
    if (!user_name || !national_id || !email || !phone_number || !birthdate || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!/^[a-zA-Z0-9]{3,}$/.test(user_name)) {
      return res.status(400).json({ error: 'User name must be at least 3 characters long and contain only letters and numbers' });
    }

    if (!/^[2-3]\d{13}$/.test(national_id)) {
      return res.status(400).json({ error: 'National ID must be exactly 14 digits and start with 2 or 3' });
    }

    if (!/^(010|011|012|015)\d{8}$/.test(phone_number)) {
      return res.status(400).json({ error: 'Phone number must start with 010, 011, 012, or 015 and be exactly 11 digits' });
    }

    const birthDate = new Date(birthdate);
    const today = new Date();
    const ageDiffMs = today.getTime() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (birthDate >= today || age < 16) {
      return res.status(400).json({ error: 'Birthdate must be in the past and you must be at least 16 years old' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const encryption_key = crypto.randomBytes(16).toString('hex');
    
    const query = 'INSERT INTO Students (user_name, national_id, email, phone_number, birthdate, password_hash, encryption_key) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    db.query(query, [user_name, national_id, email, phone_number, birthdate, hashedPassword, encryption_key], (err, result) => {
      if (err) {
        console.error('Database error during signup:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          const duplicateField = err.sqlMessage.match(/'([^']+)'/)?.[1];
          if (duplicateField === email) {
            return res.status(400).json({ error: 'Email already exists' });
          } else if (duplicateField === user_name) {
            return res.status(400).json({ error: 'Username already exists' });
          } else if (duplicateField === national_id) {
            return res.status(400).json({ error: 'National ID already exists' });
          } else if (duplicateField === phone_number) {
            return res.status(400).json({ error: 'Phone number already exists' });
          }
          return res.status(400).json({ error: 'A duplicate entry was detected' });
        }
        return res.status(500).json({ error: 'Database error occurred' });
      }

      // Get the newly created student_id
      const student_id = result.insertId;
      console.log('New student created with ID:', student_id);

      res.status(201).json({ 
        message: 'Student created successfully',
        user: {
          student_id: student_id,
          user_name: user_name,
          email: email
        }
      });
    });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/send-verification-email', async (req, res) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.status(400).json({ error: 'Email and verification code are required' });
  }

  try {
    await sendVerificationEmail(email, verificationCode);
    res.status(200).json({ message: 'Verification code sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Login attempt for username:', username);

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const query = 'SELECT * FROM Students WHERE user_name = ?';
    db.query(query, [username], async (err, results) => {
      if (err) {
        console.error('MySQL Error during login:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const user = results[0];
      console.log('Found user:', { 
        student_id: user.student_id, 
        user_name: user.user_name 
      });

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Add a verification query to double-check the student_id
      db.query('SELECT student_id FROM Students WHERE student_id = ?', [user.student_id], (verifyErr, verifyResults) => {
        if (verifyErr || verifyResults.length === 0) {
          console.error('Error verifying student_id:', verifyErr);
          return res.status(500).json({ error: 'Error verifying user data' });
        }

        const responseData = {
          message: 'Login successful',
          user: {
            id: user.student_id,
            student_id: user.student_id.toString(),
            username: user.user_name,
            email: user.email
          }
        };

        console.log('Sending login response:', responseData);
        res.status(200).json(responseData);
      });
    });
  } catch (err) {
    console.error('Server Error during login:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a debug endpoint to check student_id
app.get('/debug/check-student/:username', (req, res) => {
  const { username } = req.params;
  
  db.query('SELECT student_id, user_name, email FROM Students WHERE user_name = ?', [username], (err, results) => {
    if (err) {
      console.error('Debug query error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(results[0]);
  });
});

// Add a test endpoint to verify student_id
app.get('/verify-student/:student_id', (req, res) => {
  const { student_id } = req.params;
  
  db.query('SELECT * FROM Students WHERE student_id = ?', [student_id], (err, results) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ exists: true, student: results[0] });
  });
});

// Add the update-password endpoint
app.post('/update-password', async (req, res) => {
  const { email, newPassword, verificationCode: otp } = req.body;

  console.log('Received password update request:', { 
    email,
    hasPassword: !!newPassword,
    hasOTP: !!otp
  });

  if (!email || !newPassword || !otp) {
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!newPassword) missingFields.push('newPassword');
    if (!otp) missingFields.push('OTP');
    
    console.log('Missing required fields:', missingFields);
    return res.status(400).json({ 
      success: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    });
  }

  // Verify the OTP again
  const storedData = verificationCodes[email];
  console.log('Stored OTP data:', { 
    email,
    hasStoredData: !!storedData,
    storedOTP: storedData?.code,
    providedOTP: otp
  });

  if (!storedData) {
    return res.status(400).json({ 
      success: false, 
      error: 'No OTP found for this email. Please request a new OTP.' 
    });
  }

  if (Date.now() > storedData.expiresAt) {
    console.log('OTP expired during password update:', {
      email,
      expiryTime: new Date(storedData.expiresAt).toISOString(),
      currentTime: new Date().toISOString()
    });
    delete verificationCodes[email];
    return res.status(400).json({ 
      success: false, 
      error: 'OTP has expired. Please request a new OTP.' 
    });
  }

  if (storedData.code !== otp) {
    console.log('Invalid OTP during password update:', {
      email,
      providedOTP: otp,
      storedOTP: storedData.code
    });
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid OTP. Please check and try again.' 
    });
  }

  try {
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password in the database
    const query = 'UPDATE Students SET password_hash = ? WHERE email = ?';
    db.query(query, [hashedPassword, email], (err, result) => {
      if (err) {
        console.error('Database error during password update:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Database error while updating password. Please try again.' 
        });
      }

      if (result.affectedRows === 0) {
        console.log('No user found for password update:', { email });
        return res.status(404).json({ 
          success: false, 
          error: 'No user found with this email address.' 
        });
      }

      // Clear the OTP only after successful password update
      delete verificationCodes[email];
      console.log('Password updated successfully:', { email });

      res.status(200).json({ 
        success: true, 
        message: 'Password updated successfully' 
      });
    });
  } catch (error) {
    console.error('Error during password update:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process password update. Please try again.' 
    });
  }
});

// Financial Endpoints
app.get('/accounts', (req, res) => {
  const query = 'SELECT * FROM FinancialAccounts WHERE student_id = ?';
  db.query(query, [req.query.student_id], (err, results) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.get('/expenses', (req, res) => {
  const query = `
    SELECT e.*, fa.account_name, fa.currency 
    FROM Expenses e 
    JOIN FinancialAccounts fa ON e.account_id = fa.account_id 
    WHERE fa.student_id = ?
    ORDER BY e.expense_date DESC
  `;
  db.query(query, [req.query.student_id], (err, results) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.get('/savings-goals', (req, res) => {
  if (!req.query.student_id) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  const query = `
    SELECT 
      sg.*,
      COUNT(DISTINCT CASE WHEN gp.completed = true THEN gp.day_index END) as completed_days,
      COUNT(DISTINCT gp.day_index) as total_days,
      CASE 
        WHEN COUNT(DISTINCT gp.day_index) > 0 
        AND COUNT(DISTINCT CASE WHEN gp.completed = true THEN gp.day_index END) = COUNT(DISTINCT gp.day_index) 
        THEN true 
        ELSE false 
      END as is_completed
    FROM SavingsGoals sg
    LEFT JOIN GoalProgress gp ON sg.goal_id = gp.goal_id
    WHERE sg.student_id = ?
    GROUP BY sg.goal_id, sg.goal_name, sg.target_amount, sg.deadline, sg.student_id
    ORDER BY sg.deadline
  `;

  db.query(query, [req.query.student_id], (err, results) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const processedGoals = results.map(goal => {
      const deadline = new Date(goal.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(deadline.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const daily_target = Math.round((goal.target_amount / diffDays) * 100) / 100;
      const totalDays = goal.total_days || 0;
      const completedDays = goal.completed_days || 0;
      const progress = totalDays > 0 ? Math.min(100, Math.round((completedDays / totalDays) * 100)) : 0;

      return {
        ...goal,
        daily_target: daily_target.toFixed(2),
        progress: progress,
        completed: goal.is_completed
      };
    });

    res.json(processedGoals);
  });
});

app.post('/accounts', async (req, res) => {
  const { student_id, account_name, balance, currency, account_type } = req.body;
  
  console.log('Account creation request:', {
    student_id,
    account_name,
    balance,
    currency,
    account_type
  });

  // Validate required fields
  if (!student_id) {
    console.log('Missing student_id');
    return res.status(400).json({ error: 'Student ID is required' });
  }

  // First verify that the student exists
  try {
    const [studentExists] = await db.promise().query(
      'SELECT student_id FROM Students WHERE student_id = ?',
      [student_id]
    );

    console.log('Student check result:', studentExists);

    if (studentExists.length === 0) {
      console.log('Student not found:', student_id);
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check account limit
    const [countResult] = await db.promise().query(
      'SELECT COUNT(*) as count FROM FinancialAccounts WHERE student_id = ?',
      [student_id]
    );

    console.log('Account count:', countResult[0].count);

    if (countResult[0].count >= 4) {
      return res.status(400).json({ error: 'Maximum number of accounts (4) reached' });
    }

    // Create account
    const [result] = await db.promise().query(
      `INSERT INTO FinancialAccounts 
       (student_id, account_name, balance, currency, account_type) 
       VALUES (?, ?, ?, ?, ?)`,
      [student_id, account_name.trim(), balance || 0, currency || 'EGP', account_type]
    );

    console.log('Account created:', result);

    res.status(201).json({
      message: 'Account created successfully',
      account_id: result.insertId
    });
  } catch (error) {
    console.error('Database error:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Get total balance for a student
app.get('/total-balance/:student_id', (req, res) => {
  const { student_id } = req.params;
  
  const query = `
    SELECT currency, SUM(balance) as total
    FROM FinancialAccounts 
    WHERE student_id = ?
    GROUP BY currency
  `;
  
  db.query(query, [student_id], (err, results) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Calculate total in EGP (assuming EGP as base currency)
    const balances = {};
    let totalInEGP = 0;
    
    // Define exchange rates (you might want to use a real exchange rate API)
    const exchangeRates = {
      EGP: 1,
      USD: 30.90,
      EUR: 33.51,
      GBP: 39.12
    };
    
    results.forEach(row => {
      balances[row.currency] = row.total;
      totalInEGP += row.total * exchangeRates[row.currency];
    });
    
    res.json({
      balances,
      totalInEGP,
      exchangeRates
    });
  });
});

// Get expense analytics for a student
app.get('/expense-analytics/:student_id', (req, res) => {
  const { student_id } = req.params;
  
  const query = `
    SELECT 
      e.category,
      COUNT(*) as transactions,
      SUM(e.amount) as total,
      fa.currency
    FROM Expenses e
    JOIN FinancialAccounts fa ON e.account_id = fa.account_id
    WHERE fa.student_id = ?
    GROUP BY e.category, fa.currency
  `;
  
  db.query(query, [student_id], (err, results) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Process the results into the required format
    const analytics = {};
    
    results.forEach(row => {
      if (!analytics[row.category]) {
        analytics[row.category] = {
          total: 0,
          transactions: 0,
          by_currency: {}
        };
      }
      
      analytics[row.category].transactions += row.transactions;
      analytics[row.category].by_currency[row.currency] = row.total;
      analytics[row.category].total += row.total; // This will be in mixed currencies
    });
    
    res.json(analytics);
  });
});

// Get expense details for a specific category
app.get('/expense-details/:category/:student_id', (req, res) => {
  const { category, student_id } = req.params;
  
  const query = `
    SELECT 
      e.*,
      fa.account_name,
      fa.currency
    FROM Expenses e
    JOIN FinancialAccounts fa ON e.account_id = fa.account_id
    WHERE fa.student_id = ? AND e.category = ?
    ORDER BY e.expense_date DESC
  `;
  
  db.query(query, [student_id, category], (err, results) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

// Add expense
app.post('/expenses', async (req, res) => {
  const { account_id, amount, category, description, expense_date } = req.body;

  // Input validation
  if (!account_id || !amount || !category || !expense_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Start transaction
    await db.promise().beginTransaction();

    // Check if account exists and has sufficient balance
    const [accounts] = await db.promise().query(
      'SELECT balance, student_id FROM FinancialAccounts WHERE account_id = ?',
      [account_id]
    );

    if (accounts.length === 0) {
      await db.promise().rollback();
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = accounts[0];
    if (account.balance < amount) {
      await db.promise().rollback();
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Update account balance
    await db.promise().query(
      'UPDATE FinancialAccounts SET balance = balance - ? WHERE account_id = ?',
      [amount, account_id]
    );

    // Add expense record
    const [result] = await db.promise().query(
      'INSERT INTO Expenses (account_id, amount, category, description, expense_date) VALUES (?, ?, ?, ?, ?)',
      [account_id, amount, category, description, expense_date]
    );

    await db.promise().commit();

    res.status(201).json({
      message: 'Expense added successfully',
      expense_id: result.insertId
    });
  } catch (error) {
    await db.promise().rollback();
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Add money to account (deposit)
app.post('/accounts/:account_id/deposit', async (req, res) => {
  const { account_id } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    // Start transaction
    await db.promise().beginTransaction();

    // Check if account exists
    const [accounts] = await db.promise().query(
      'SELECT account_id FROM FinancialAccounts WHERE account_id = ?',
      [account_id]
    );

    if (accounts.length === 0) {
      await db.promise().rollback();
      return res.status(404).json({ error: 'Account not found' });
    }

    // Update account balance
    await db.promise().query(
      'UPDATE FinancialAccounts SET balance = balance + ? WHERE account_id = ?',
      [amount, account_id]
    );

    await db.promise().commit();

    res.json({ message: 'Deposit successful' });
  } catch (error) {
    await db.promise().rollback();
    console.error('Error processing deposit:', error);
    res.status(500).json({ error: 'Failed to process deposit' });
  }
});

// Transfer money between accounts
app.post('/transactions', async (req, res) => {
  const { from_account_id, to_account_id, amount } = req.body;

  // Input validation
  if (!from_account_id || !to_account_id || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  if (from_account_id === to_account_id) {
    return res.status(400).json({ error: 'Cannot transfer to the same account' });
  }

  try {
    // Start transaction
    await db.promise().beginTransaction();

    // Get source and destination accounts
    const [accounts] = await db.promise().query(
      'SELECT account_id, balance, currency, student_id FROM FinancialAccounts WHERE account_id IN (?, ?)',
      [from_account_id, to_account_id]
    );

    if (accounts.length !== 2) {
      await db.promise().rollback();
      return res.status(404).json({ error: 'One or both accounts not found' });
    }

    const sourceAccount = accounts.find(a => a.account_id === parseInt(from_account_id));
    const destAccount = accounts.find(a => a.account_id === parseInt(to_account_id));

    // Check if accounts belong to the same student
    if (sourceAccount.student_id !== destAccount.student_id) {
      await db.promise().rollback();
      return res.status(403).json({ error: "Cannot transfer between different students' accounts" });
    }

    // Check sufficient balance
    if (sourceAccount.balance < amount) {
      await db.promise().rollback();
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // If currencies are different, apply exchange rate
    let transferAmount = amount;
    if (sourceAccount.currency !== destAccount.currency) {
      const exchangeRates = {
        EGP: 1,
        USD: 30.90,
        EUR: 33.51,
        GBP: 39.12
      };

      // Convert to EGP first, then to destination currency
      const amountInEGP = amount * exchangeRates[sourceAccount.currency];
      transferAmount = amountInEGP / exchangeRates[destAccount.currency];
    }

    // Update source account
    await db.promise().query(
      'UPDATE FinancialAccounts SET balance = balance - ? WHERE account_id = ?',
      [amount, from_account_id]
    );

    // Update destination account
    await db.promise().query(
      'UPDATE FinancialAccounts SET balance = balance + ? WHERE account_id = ?',
      [transferAmount, to_account_id]
    );

    await db.promise().commit();

    res.json({
      message: 'Transfer successful',
      sourceBalance: sourceAccount.balance - amount,
      destBalance: destAccount.balance + transferAmount
    });
  } catch (error) {
    await db.promise().rollback();
    console.error('Error processing transfer:', error);
    res.status(500).json({ error: 'Failed to process transfer' });
  }
});

// Delete an account
app.delete('/accounts/:account_id', async (req, res) => {
  const { account_id } = req.params;

  try {
    await db.promise().beginTransaction();

    // First check if account exists and get its details
    const [accounts] = await db.promise().query(
      'SELECT * FROM FinancialAccounts WHERE account_id = ?',
      [account_id]
    );

    if (accounts.length === 0) {
      await db.promise().rollback();
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = accounts[0];

    // Check if account has any balance
    if (account.balance > 0) {
      await db.promise().rollback();
      return res.status(400).json({ 
        error: 'Cannot delete account with positive balance. Please transfer or withdraw all funds first.' 
      });
    }

    // Check if account has any associated expenses
    const [expenses] = await db.promise().query(
      'SELECT COUNT(*) as count FROM Expenses WHERE account_id = ?',
      [account_id]
    );

    if (expenses[0].count > 0) {
      // Delete all associated expenses first
      await db.promise().query(
        'DELETE FROM Expenses WHERE account_id = ?',
        [account_id]
      );
    }

    // Now delete the account
    await db.promise().query(
      'DELETE FROM FinancialAccounts WHERE account_id = ?',
      [account_id]
    );

    await db.promise().commit();
    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    await db.promise().rollback();
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Delete an expense
app.delete('/expenses/:expense_id', async (req, res) => {
  const { expense_id } = req.params;

  try {
    await db.promise().beginTransaction();

    // First get the expense details to refund the amount
    const [expenses] = await db.promise().query(
      'SELECT e.*, fa.student_id FROM Expenses e ' +
      'JOIN FinancialAccounts fa ON e.account_id = fa.account_id ' +
      'WHERE e.expense_id = ?',
      [expense_id]
    );

    if (expenses.length === 0) {
      await db.promise().rollback();
      return res.status(404).json({ error: 'Expense not found' });
    }

    const expense = expenses[0];

    // Refund the amount back to the account
    await db.promise().query(
      'UPDATE FinancialAccounts SET balance = balance + ? WHERE account_id = ?',
      [expense.amount, expense.account_id]
    );

    // Delete the expense
    await db.promise().query(
      'DELETE FROM Expenses WHERE expense_id = ?',
      [expense_id]
    );

    await db.promise().commit();
    res.json({ 
      message: 'Expense deleted successfully',
      refundedAmount: expense.amount,
      accountId: expense.account_id
    });

  } catch (error) {
    await db.promise().rollback();
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Create a new savings goal
app.post('/savings-goals', async (req, res) => {
  const { student_id, goal_name, target_amount, deadline } = req.body;

  try {
    await db.promise().beginTransaction();

    // Validate input
    if (!student_id || !goal_name || !target_amount || !deadline) {
      await db.promise().rollback();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if student exists
    const [students] = await db.promise().query(
      'SELECT student_id FROM Students WHERE student_id = ?',
      [student_id]
    );

    if (students.length === 0) {
      await db.promise().rollback();
      return res.status(404).json({ error: 'Student not found' });
    }

    // Calculate daily target
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deadlineDate <= today) {
      await db.promise().rollback();
      return res.status(400).json({ error: 'Deadline must be in the future' });
    }

    const diffTime = Math.abs(deadlineDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daily_target = Math.round((target_amount / diffDays) * 100) / 100;

    // Create the goal
    const [result] = await db.promise().query(
      'INSERT INTO SavingsGoals (student_id, goal_name, target_amount, deadline) VALUES (?, ?, ?, ?)',
      [student_id, goal_name, target_amount, deadline]
    );

    const goal_id = result.insertId;

    // Create daily progress entries
    const progressValues = [];
    let currentDate = new Date(today);
    
    while (currentDate < deadlineDate) {
      progressValues.push([goal_id, progressValues.length, false, daily_target, null]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (progressValues.length > 0) {
      await db.promise().query(
        'INSERT INTO GoalProgress (goal_id, day_index, completed, amount, completed_at) VALUES ?',
        [progressValues]
      );
    }

    await db.promise().commit();

    res.status(201).json({
      message: 'Goal created successfully',
      goal_id,
      daily_target
    });

  } catch (error) {
    await db.promise().rollback();
    console.error('Error creating savings goal:', error);
    res.status(500).json({ error: 'Failed to create savings goal' });
  }
});

// Update goal progress
app.post('/savings-goals/:goal_id/progress', async (req, res) => {
  const { goal_id } = req.params;
  const { day_index, completed, amount } = req.body;

  try {
    await db.promise().beginTransaction();

    // Get goal and account details
    const [goals] = await db.promise().query(
      'SELECT g.*, s.student_id FROM SavingsGoals g JOIN Students s ON g.student_id = s.student_id WHERE g.goal_id = ?',
      [goal_id]
    );

    if (goals.length === 0) {
      await db.promise().rollback();
      return res.status(404).json({ error: 'Goal not found' });
    }

    const goal = goals[0];

    // Get student's total balance
    const [balanceResult] = await db.promise().query(
      'SELECT SUM(balance) as total_balance FROM FinancialAccounts WHERE student_id = ?',
      [goal.student_id]
    );

    const currentBalance = balanceResult[0].total_balance || 0;

    // If marking as complete, check if there's enough balance
    if (completed && currentBalance < amount) {
      await db.promise().rollback();
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Update progress
    await db.promise().query(
      'UPDATE GoalProgress SET completed = ?, completed_at = ? WHERE goal_id = ? AND day_index = ?',
      [completed, completed ? new Date() : null, goal_id, day_index]
    );

    // If marking as complete, deduct the amount from the account with the highest balance
    if (completed) {
      const [accounts] = await db.promise().query(
        'SELECT account_id, balance FROM FinancialAccounts WHERE student_id = ? ORDER BY balance DESC',
        [goal.student_id]
      );

      if (accounts.length === 0) {
        await db.promise().rollback();
        return res.status(400).json({ error: 'No accounts found' });
      }

      await db.promise().query(
        'UPDATE FinancialAccounts SET balance = balance - ? WHERE account_id = ?',
        [amount, accounts[0].account_id]
      );
    }
    // If unmarking, refund the amount to the account with highest balance
    else {
      const [accounts] = await db.promise().query(
        'SELECT account_id FROM FinancialAccounts WHERE student_id = ? ORDER BY balance DESC',
        [goal.student_id]
      );

      if (accounts.length > 0) {
        await db.promise().query(
          'UPDATE FinancialAccounts SET balance = balance + ? WHERE account_id = ?',
          [amount, accounts[0].account_id]
        );
      }
    }

    // Get new total balance
    const [newBalanceResult] = await db.promise().query(
      'SELECT SUM(balance) as total_balance FROM FinancialAccounts WHERE student_id = ?',
      [goal.student_id]
    );

    await db.promise().commit();

    res.json({
      message: 'Progress updated successfully',
      new_balance: newBalanceResult[0].total_balance || 0
    });

  } catch (error) {
    await db.promise().rollback();
    console.error('Error updating goal progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Delete a savings goal
app.delete('/savings-goals/:goal_id', async (req, res) => {
  const { goal_id } = req.params;

  try {
    await db.promise().beginTransaction();

    // Get goal details first
    const [goals] = await db.promise().query(
      'SELECT * FROM SavingsGoals WHERE goal_id = ?',
      [goal_id]
    );

    if (goals.length === 0) {
      await db.promise().rollback();
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Delete progress entries first
    await db.promise().query(
      'DELETE FROM GoalProgress WHERE goal_id = ?',
      [goal_id]
    );

    // Then delete the goal
    await db.promise().query(
      'DELETE FROM SavingsGoals WHERE goal_id = ?',
      [goal_id]
    );

    await db.promise().commit();
    res.json({ message: 'Goal deleted successfully' });

  } catch (error) {
    await db.promise().rollback();
    console.error('Error deleting savings goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

/*
CREATE TABLE Students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(50) UNIQUE NOT NULL,
  national_id VARCHAR(14) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone_number VARCHAR(11) UNIQUE NOT NULL,
  birthdate DATE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  encryption_key VARCHAR(32) NOT NULL
);

CREATE TABLE FinancialAccounts (
  account_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  account_name VARCHAR(50) NOT NULL,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency ENUM('EGP', 'USD', 'EUR', 'GBP') NOT NULL DEFAULT 'EGP',
  account_type ENUM('cash', 'bank', 'savings', 'investment') NOT NULL,
  FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

CREATE TABLE Expenses (
  expense_id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category ENUM('food', 'transport', 'housing', 'entertainment', 'education', 'other') NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  FOREIGN KEY (account_id) REFERENCES FinancialAccounts(account_id)
);

CREATE TABLE SavingsGoals (
  goal_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  goal_name VARCHAR(100) NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  deadline DATE NOT NULL,
  FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

CREATE TABLE GoalProgress (
  goal_id INT NOT NULL,
  day_index INT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  amount DECIMAL(10,2) NOT NULL,
  completed_at DATETIME,
  PRIMARY KEY (goal_id, day_index),
  FOREIGN KEY (goal_id) REFERENCES SavingsGoals(goal_id) ON DELETE CASCADE
);
*/

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});