require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); // Use promise-based API
const cors = require('cors'); // Import cors middleware
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS
app.use((req, res, next) => {
  console.log(`Request received with method: ${req.method} and origin: ${req.headers.origin}`);
  next();
});

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // Limit to 15 MB
});

// Gcloud Database Connection with Connection Pool
const db = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  socketPath: `/cloudsql/${process.env.DB_HOST}`,
  waitForConnections: true,
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0,
});

// Local Database Connection with Connection Pool
// const db = mysql.createPool({
//   user: 'root',
//   password: 'test1234',
//   database: 'HandyIllinois',
//   host: 'localhost', // Add your database host if necessary
//   waitForConnections: true,
//   connectionLimit: 10, // Maximum number of connections in the pool
//   queueLimit: 0,
// });

// Test the database connection
(async () => {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('Connected to MySQL database');
  } catch (err) {
    console.error('Database connection error:', err.message);
  }
})();

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Database Queries
const getServiceEarningsProcedure = `
    CREATE PROCEDURE GetServiceEarningsByManager(
        IN managerId INT,
        IN serviceType VARCHAR(255)
    )
    BEGIN
        IF serviceType IS NOT NULL THEN
            SELECT 
                sr.Type AS ServiceType,
                COUNT(sr.ServiceRequestId) AS TotalRequests,
                SUM(sr.Charges) AS TotalEarnings
            FROM ServiceRequest sr
            WHERE sr.Status = 'Completed' 
              AND sr.ManagerId = managerId
              AND sr.Type = serviceType
            GROUP BY sr.Type
            ORDER BY TotalEarnings DESC, TotalRequests DESC;
        ELSE
            SELECT 
                sr.Type AS ServiceType,
                COUNT(sr.ServiceRequestId) AS TotalRequests,
                SUM(sr.Charges) AS TotalEarnings
            FROM ServiceRequest sr
            WHERE sr.Status = 'Completed' 
              AND sr.ManagerId = managerId
            GROUP BY sr.Type
            ORDER BY TotalEarnings DESC, TotalRequests DESC;
        END IF;
    END;
`;

const getTopHandypersonsProcedure = `
    CREATE PROCEDURE GetTopHandypersonsByManager(
        IN managerId INT,
        IN limitCount INT
    )
    BEGIN
        SELECT 
            h.HandyId,
            h.Name AS HandypersonName,
            h.Skills,
            h.Rating AS AverageRating,
            COUNT(r.ReviewId) AS TotalReviews
        FROM Handyperson h
        JOIN Agency a ON h.AgencyId = a.AgencyId
        JOIN Manager m ON a.AgencyId = m.AgencyId
        LEFT JOIN Review r ON h.HandyId = r.HandyId
        WHERE m.ManagerId = managerId
        GROUP BY h.HandyId, h.Name, h.Skills, h.Rating
        ORDER BY h.Rating DESC, TotalReviews DESC
        LIMIT limitCount;
    END;
`;

const updateHandypersonRatingTrigger = `
    CREATE TRIGGER UpdateHandypersonRating
    AFTER INSERT ON Review
    FOR EACH ROW
    BEGIN
        DECLARE avgRating DECIMAL(3, 1);

        -- Calculate the new average rating
        SELECT AVG(r.Rating)
        INTO avgRating
        FROM Review r
        WHERE r.HandyId = NEW.HandyId;

        -- Update the Handyperson table
        UPDATE Handyperson
        SET Rating = avgRating
        WHERE HandyId = NEW.HandyId;
    END;
`;

const registerQuery =
  "INSERT INTO Customer (Name, Address, ZIP, ContactNumber, Password, Email, ProfileImage) VALUES (?, ?, ?, ?, ?, ?, ?)";
const loginQuery = "SELECT * FROM Customer WHERE Email = ?";
const deleteCustomerQuery = "DELETE FROM Customer WHERE CustomerId = ?";
// Get personal information
const getUserDetailsQuery = `
    SELECT Name, Address, ZIP, ContactNumber, Email, ProfileImage
    FROM Customer
    WHERE CustomerId = ?
`;

// Update personal information, including profile image
const updatePersonalInfoQuery = `
    UPDATE Customer 
    SET Name = ?, Address = ?, ZIP = ?, ProfileImage = ?
    WHERE CustomerId = ?
`;

// Update contact details
const updateContactDetailsQuery = `
    UPDATE Customer 
    SET ContactNumber = ?, Email = ? 
    WHERE CustomerId = ?
`;

// Search HandyMen
const searchHandymenQuery = `
  SELECT 
    h.HandyId, 
    h.Name, 
    h.Skills, 
    h.Rating, 
    h.Contact, 
    h.ProfileImage, 
    a.HQLocation AS Location,
    h.BaseCharge
  FROM Handyperson h
  LEFT JOIN Agency a ON h.AgencyId = a.AgencyId
  WHERE (a.HQLocation LIKE ? OR ? IS NULL)
    AND (h.Skills LIKE ? OR ? IS NULL)
    AND (h.Rating >= ? OR ? IS NULL)
    AND (h.BaseCharge >= ? AND h.BaseCharge <= ? OR (? IS NULL AND ? IS NULL));
`;
// view handyman profile 
const handymanProfileQuery = `
  SELECT 
    h.HandyId, 
    h.Name, 
    h.Skills, 
    h.Rating, 
    h.Contact, 
    h.ProfileImage, 
    a.Name AS AgencyName, 
    a.HQLocation AS Location, 
    a.Contact AS AgencyContact
  FROM Handyperson h
  LEFT JOIN Agency a ON h.AgencyId = a.AgencyId
  WHERE h.HandyId = ?
`;


const SET_TRANSACTION_LEVEL_SERIALIZABLE = 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;';
const SET_TRANSACTION_LEVEL_REPEATABLE_READ = 'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;';
const BEGIN_TRANSACTION = 'START TRANSACTION;';
const COMMIT_TRANSACTION = 'COMMIT;';
const ROLLBACK_TRANSACTION = 'ROLLBACK;';

const getHandypersonDetailsQuery = `
  SELECT Skills, BaseCharge 
  FROM Handyperson 
  WHERE HandyId = ?;
`;

// service request create
const createServiceRequestQuery = `
  INSERT INTO ServiceRequest (
    Description, 
    Date, 
    Time, 
    Status, 
    Type, 
    Charges, 
    CustomerId, 
    HandyId, 
    ManagerId
  ) 
  SELECT 
    ?, -- Description
    CURDATE(), 
    CURTIME(), 
    'Request created', -- Default status
    ?, -- Type (Skill)
    ?, -- Charges (BaseCharge)
    ?, -- CustomerId
    ?, -- HandyId
    m.ManagerId -- Retrieved ManagerId
  FROM Handyperson h
  JOIN Agency a ON h.AgencyId = a.AgencyId
  JOIN Manager m ON a.AgencyId = m.AgencyId
  WHERE h.HandyId = ?;
`;

const checkHandypersonAvailabilityQuery = `
  SELECT COUNT(*) AS ActiveRequests 
  FROM ServiceRequest 
  WHERE HandyId = ? AND Status IN ('Request created', 'Accepted', 'In progress');
`;

const getServiceRequestsQuery = `
  SELECT 
    sr.ServiceRequestId,
    sr.Description,
    sr.Date,
    sr.Time,
    sr.Status,
    sr.Type,
    sr.Charges,
    c.Name AS CustomerName,
    h.Name AS HandypersonName,
    h.Skills AS HandypersonSkills
  FROM ServiceRequest sr
  JOIN Customer c ON sr.CustomerId = c.CustomerId
  LEFT JOIN Handyperson h ON sr.HandyId = h.HandyId
  WHERE sr.ManagerId = ?
    AND (sr.Type = ? OR ? IS NULL)
    AND (sr.HandyId = ? OR ? IS NULL)
    AND (sr.Status = ? OR ? IS NULL)
  ORDER BY sr.Date DESC, sr.Time DESC;
`;

const updateServiceRequestStatusQuery = `
  UPDATE ServiceRequest 
  SET Status = ?
  WHERE ServiceRequestId = ? AND ManagerId = ?;
`;

// Handyperson Performance Analytics
const handypersonPerformanceQuery = `
  SELECT 
      h.HandyId,
      h.Name AS HandypersonName,
      h.Skills,
      AVG(r.Rating) AS AverageRating,
      COUNT(r.ReviewId) AS TotalReviews
  FROM Handyperson h
  LEFT JOIN Review r ON h.HandyId = r.HandyId
  LEFT JOIN ServiceRequest sr ON r.ServiceRequestID = sr.ServiceRequestId
  WHERE sr.ManagerId = ?
    AND (sr.Type = ? OR ? IS NULL) -- Optional filter by service type
  GROUP BY h.HandyId, h.Name, h.Skills
  ORDER BY AverageRating DESC;
`;

// Customer Satisfaction Tracking
const customerSatisfactionQuery = `
  SELECT 
      sr.Type AS ServiceType,
      AVG(r.Rating) AS AverageCustomerSatisfaction
  FROM Review r
  JOIN ServiceRequest sr ON r.ServiceRequestID = sr.ServiceRequestId
  WHERE sr.ManagerId = ?
    AND (sr.Type = ? OR ? IS NULL)
  GROUP BY sr.Type
  ORDER BY AverageCustomerSatisfaction DESC;
`;
const getCustomerOngoingBookingsQuery = `
    SELECT sr.ServiceRequestId, sr.Description, sr.Date, sr.Time, sr.Status, sr.Type, sr.Charges,
       h.Name AS HandypersonName, h.BaseCharge, m.ManagerName
    FROM ServiceRequest sr
    JOIN Handyperson h ON sr.HandyId = h.HandyId
    JOIN Manager m ON sr.ManagerId = m.ManagerId
    WHERE sr.CustomerId = ? AND sr.Status IN ('Request created', 'Accepted', 'In progress')
    ORDER BY sr.Date ASC, sr.Time ASC;
`;
const getCustomerPastBookingsQuery = `
    SELECT sr.ServiceRequestId, sr.Description, sr.Date, sr.Time, sr.Status, sr.Type, sr.Charges,
          h.Name AS HandypersonName, h.BaseCharge, m.ManagerName
    FROM ServiceRequest sr
    JOIN Handyperson h ON sr.HandyId = h.HandyId
    JOIN Manager m ON sr.ManagerId = m.ManagerId
    WHERE sr.CustomerId = ? AND sr.Status IN ('Completed', 'Declined', 'Cancelled')
    ORDER BY sr.Date DESC, sr.Time DESC;
`;
// Cancel Booking
const cancelBookingQuery = `
      UPDATE ServiceRequest
      SET Status = 'Cancelled'
      WHERE ServiceRequestId = ? AND CustomerId = ? AND Status IN ('Request created', 'Accepted', 'In progress');
`;
// Leave Review
const leaveReviewQuery = `
      INSERT INTO Review (Comment, ReviewTitle, Rating, Date, Time, CustomerId, HandyId, ServiceRequestID)
      SELECT ?, ?, ?, CURDATE(), CURTIME(), ?, sr.HandyId, sr.ServiceRequestId
      FROM ServiceRequest sr
      WHERE sr.ServiceRequestId = ? AND sr.CustomerId = ? AND sr.Status = 'Completed';
`;
const serviceRequestsByHandyId = `
            SELECT 
                sr.ServiceRequestId,
                sr.Description,
                sr.Date,
                sr.Time,
                sr.Status,
                sr.Type,
                sr.Charges,
                c.Name AS CustomerName,
                c.ContactNumber AS CustomerContact,
                c.Address AS CustomerAddress
            FROM ServiceRequest sr
            JOIN Customer c ON sr.CustomerId = c.CustomerId
            WHERE sr.HandyId = ? AND (sr.Status = ? OR ? IS NULL)
            ORDER BY sr.Date ASC, sr.Time ASC;
        `;


//****************************** API ENDPOINTS IMPLEMENTATION *****************************************************/
async function initializeDatabase() {
  try {
      await db.query(getServiceEarningsProcedure);
      await db.query(getTopHandypersonsProcedure);

      await db.query(`DROP TRIGGER IF EXISTS UpdateHandypersonRating;`);
      console.log('Old trigger dropped (if existed).');

      // Execute the trigger definition
      await db.query(updateHandypersonRatingTrigger);
      console.log('Trigger "UpdateHandypersonRating" created successfully.');

      console.log('Stored procedures and triggers initialized successfully');
  } catch (err) {
      console.error('Error initializing stored procedures or triggers:', err.message);
  }
}

initializeDatabase();

// Register Endpoint
app.post('/register', upload.single('profileImage'), async (req, res) => {
  const { name, address, zip, contactNumber, password, email } = req.body;
  const profileImage = req.file ? req.file.buffer : null;

  try {
      const sql = registerQuery;
      const values = [name, address, zip, contactNumber, password, email, profileImage];

      const [result] = await db.query(sql, values);

      res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size exceeds limit of 5 MB' });
      }

      res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const sql = loginQuery;

    // Use promise-based query to fetch user details by email and password
    const [results] = await db.query(sql, [email, password]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];

    // Return CustomerId to the UI
    res.json({ message: 'Login successful', customerId: user.CustomerId });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Logout Endpoint
app.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Endpoint for Managing Customer's Bookings
app.get('/bookings/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const type = req.query.type; // 'ongoing' or 'past'

  if (!customerId) {
    return res.status(400).json({ error: 'CustomerId is required' });
  }

  let query;
  if (type === 'ongoing') {
    query = getCustomerOngoingBookingsQuery;
  } else if (type === 'past') {
    query = getCustomerPastBookingsQuery;
  } else {
    return res
      .status(400)
      .json({ error: "Invalid 'type' query parameter. Use 'ongoing' or 'past'." });
  }

  try {
    // Execute the query with the customerId parameter
    const [results] = await db.query(query, [customerId]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Cancel Booking Endpoint
app.put('/bookings/:customerId/cancel/:serviceRequestId', async (req, res) => {
  const { customerId, serviceRequestId } = req.params;

  if (!customerId || !serviceRequestId) {
    return res.status(400).json({ error: 'CustomerId and ServiceRequestId are required' });
  }

  const query = cancelBookingQuery;

  try {
    // Execute the query with the provided parameters
    const [result] = await db.query(query, [serviceRequestId, customerId]);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        error: 'Cancellation failed. Either the booking does not exist or it cannot be canceled.',
      });
    }

    res.json({ message: 'Booking successfully canceled.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Leave Review and Rating Endpoint
app.post('/bookings/:customerId/review/:serviceRequestId', async (req, res) => {
  const { customerId, serviceRequestId } = req.params;
  const { comment, reviewTitle, rating } = req.body;

  // Validate input
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
  }
  if (!comment || !reviewTitle) {
    return res.status(400).json({ error: 'Comment and ReviewTitle are required.' });
  }

  const query = leaveReviewQuery;
  const values = [comment, reviewTitle, rating, customerId, serviceRequestId, customerId];

  try {
    // Execute the query with the provided parameters
    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        error: 'Review submission failed. The service must be completed, and it must belong to the customer.',
      });
    }

    console.log(`Review added successfully for ServiceRequestId: ${serviceRequestId}`);
    console.log('Trigger execution should have updated the handyperson rating.');

    res.json({ message: 'Review submitted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete Account Endpoint
app.delete('/delete-account', async (req, res) => {
  const { customerId } = req.body;

  if (!customerId) {
    return res.status(400).json({ error: 'CustomerId is required' });
  }

  try {
    const [result] = await db.query(deleteCustomerQuery, [customerId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get User Details Endpoint
app.get('/profile/:customerId', async (req, res) => {
  const { customerId } = req.params;

  if (!customerId) {
    return res.status(400).json({ error: 'CustomerId is required' });
  }

  try {
    const [results] = await db.query(getUserDetailsQuery, [customerId]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDetails = results[0];

    // Convert ProfileImage (buffer) to base64 if it exists
    if (userDetails.ProfileImage) {
      userDetails.ProfileImage = userDetails.ProfileImage.toString('base64');
    }

    res.json(userDetails); // Send back user details including profile image
  } catch (err) {
    console.error('Error fetching user profile:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update Profile Endpoint
app.put('/profile/update', upload.single('profileImage'), async (req, res) => {
  const { customerId, Name, Address, ZIP, ContactNumber, Email } = req.body;
  const profileImage = req.file ? req.file.buffer : null; // Use the uploaded file buffer if provided

  if (!customerId) {
    return res.status(400).json({ error: 'CustomerId is required' });
  }

  const connection = await db.getConnection();

  try {
    // Set transaction isolation level to ensure consistent reads
    await connection.query(SET_TRANSACTION_LEVEL_REPEATABLE_READ);
    // Start a transaction
    await connection.query(BEGIN_TRANSACTION);

    // Update personal information, including ProfileImage only if it's provided
    if (profileImage) {
      await connection.query(updatePersonalInfoQuery, [
        Name,
        Address,
        ZIP,
        profileImage,
        customerId,
      ]);
    } else {
      const updateWithoutImageQuery = `
        UPDATE Customer
        SET Name = ?, Address = ?, ZIP = ?
        WHERE CustomerId = ?`;
      await connection.query(updateWithoutImageQuery, [
        Name,
        Address,
        ZIP,
        customerId,
      ]);
    }

    // Update contact details
    await connection.query(updateContactDetailsQuery, [
      ContactNumber,
      Email,
      customerId,
    ]);

    // Commit the transaction
    await connection.query(COMMIT_TRANSACTION);

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    // Roll back the transaction on error
    await connection.query(ROLLBACK_TRANSACTION);
    res.status(500).json({ error: 'Database error while updating profile', details: err.message });
  } finally {
    connection.release();
  }
});

// Search Endpoint
app.get('/search-handyperson', async (req, res) => {
  const { location, skills, minRating, minCharge, maxCharge } = req.query;

  const locationFilter = location ? `%${location}%` : null;
  const skillsFilter = skills ? `%${skills}%` : null;
  const ratingFilter = minRating ? parseFloat(minRating) : null;
  const minChargeFilter = minCharge ? parseFloat(minCharge) : null;
  const maxChargeFilter = maxCharge ? parseFloat(maxCharge) : null;

  try {
    const [results] = await db.query(
      searchHandymenQuery,
      [
        locationFilter,
        locationFilter,
        skillsFilter,
        skillsFilter,
        ratingFilter,
        ratingFilter,
        minChargeFilter,
        maxChargeFilter,
        minChargeFilter,
        maxChargeFilter,
      ]
    );

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Handyperson Profile Endpoint
app.get('/handyperson-profile/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Execute the query with the provided ID
    const [results] = await db.query(handymanProfileQuery, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Handyman not found' });
    }

    const handymanProfile = results[0];

    // Convert ProfileImage (buffer) to Base64 if it exists
    if (handymanProfile.ProfileImage) {
      handymanProfile.ProfileImage = handymanProfile.ProfileImage.toString('base64');
    }

    res.status(200).json(handymanProfile);
  } catch (err) {
    console.error('Error fetching handyman profile:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Endpoint for Creating Work Order
app.post('/create-work-order', async (req, res) => {
  const { description, customerId, handyId } = req.body;

  if (!description || !customerId || !handyId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const connection = await db.getConnection();

  try {
    // Set transaction isolation level
    await connection.query(SET_TRANSACTION_LEVEL_SERIALIZABLE);

    // Begin transaction
    await connection.query(BEGIN_TRANSACTION);

    // Check handyperson's availability
    const [availabilityResult] = await connection.query(checkHandypersonAvailabilityQuery, [handyId]);
    const { ActiveRequests } = availabilityResult[0];

    if (ActiveRequests > 0) {
      throw new Error('Handyperson is already assigned to an active request.');
    }

    // Fetch handyperson details (skills and base charge)
    const [handypersonDetailsResult] = await connection.query(getHandypersonDetailsQuery, [handyId]);
    if (handypersonDetailsResult.length === 0) {
      throw new Error('Handyperson not found.');
    }

    const { Skills: type, BaseCharge: charges } = handypersonDetailsResult[0];

    // Insert the service request
    const [serviceRequestResult] = await connection.query(
      createServiceRequestQuery,
      [
        description,
        type,
        charges,
        customerId,
        handyId,
        handyId, // HandyId passed again for mapping ManagerId
      ]
    );

    // Commit transaction
    await connection.query(COMMIT_TRANSACTION);

    res.status(201).json({
      message: 'Work order created successfully',
      serviceRequestId: serviceRequestResult.insertId,
    });
  } catch (err) {
    // Rollback transaction on error
    await connection.query(ROLLBACK_TRANSACTION);
    res.status(500).json({ error: 'Transaction failed', details: err.message });
  } finally {
    connection.release();
  }
});

// API Endpoint to Get All Service Requests for a Manager
app.get('/manager/service-requests', async (req, res) => {
  const { managerId, type, handyId, status } = req.query;

  if (!managerId) {
    return res.status(400).json({ error: 'ManagerId is required' });
  }

  const sql = getServiceRequestsQuery;
  const values = [
    managerId,
    type || null,
    type || null,
    handyId || null,
    handyId || null,
    status || null,
    status || null,
  ];

  try {
    // Execute the query with the provided parameters
    const [results] = await db.query(sql, values);

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// API Endpoint to Update Service Request Status
app.put('/manager/service-request/status', async (req, res) => {
  const { serviceRequestId, status, managerId } = req.body;

  if (!serviceRequestId || !status || !managerId) {
    return res.status(400).json({ error: 'ServiceRequestId, Status, and ManagerId are required' });
  }

  if (!['Accepted', 'Declined'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Only "Accepted" or "Declined" are allowed.' });
  }

  const sql = updateServiceRequestStatusQuery;
  const values = [status, serviceRequestId, managerId];

  try {
    // Execute the query with the provided parameters
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service request not found or not authorized' });
    }

    res.status(200).json({ message: `Service request ${status.toLowerCase()} successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Handyperson Performance Analytics API
app.get('/manager/handyperson-performance', async (req, res) => {
  const { managerId, type } = req.query;

  if (!managerId) {
    return res.status(400).json({ error: 'ManagerId is required' });
  }

  try {
    // Execute the query with the provided parameters
    const [results] = await db.query(
      handypersonPerformanceQuery,
      [managerId, type || null, type || null]
    );

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Customer Satisfaction Tracking
app.get('/manager/customer-satisfaction', async (req, res) => {
  const { managerId, type } = req.query;

  if (!managerId) {
    return res.status(400).json({ error: 'ManagerId is required' });
  }

  try {
    // Execute the query with the provided parameters
    const [results] = await db.query(
      customerSatisfactionQuery,
      [managerId, type || null, type || null]
    );

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Earnings and Popular Services Analysis
app.get('/manager/service-earnings', async (req, res) => {
  const { managerId, serviceType } = req.query;

    if (!managerId) {
        return res.status(400).json({ error: 'ManagerId is required' });
    }

    try {
        const [results] = await db.query('CALL GetServiceEarningsByManager(?, ?)', [
            managerId,
            serviceType || null,
        ]);

        res.status(200).json(results[0]); // Results from the stored procedure
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// Get top handypersons 
app.get('/manager/top-handypersons', async (req, res) => {
  const { managerId, limit } = req.query;

  if (!managerId) {
      return res.status(400).json({ error: 'ManagerId is required' });
  }

  try {
      const [results] = await db.query('CALL GetTopHandypersonsByManager(?, ?)', [
          managerId,
          parseInt(limit) || 5, // Default limit to 5 if not provided
      ]);

      res.status(200).json(results[0]); // Results from the stored procedure
  } catch (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Handyperson service requests
app.get('/handyperson/:handyId/service-requests', async (req, res) => {
  const { handyId } = req.params;
  const { status } = req.query; // Optional status filter

  if (!handyId) {
      return res.status(400).json({ error: 'HandyId is required' });
  }

  try {
      const query = serviceRequestsByHandyId;

      const [results] = await db.query(query, [handyId, status || null, status || null]);

      if (results.length === 0) {
          return res.status(404).json({ message: 'No service requests found for this handyperson.' });
      }

      res.status(200).json(results);
  } catch (err) {
      console.error('Error fetching service requests for handyperson:', err.message);
      res.status(500).json({ error: 'Database error', details: err.message });
  }
});



