jest.mock("../services/authenticateUser", () => (req, res, next) => {
  req.user = { userId: "testUser" }; 
  next();
});

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const { getAlluser } = require("../controller/userController");
const request = require('supertest');
const app = require('../app');
const JWT = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const requestModel = require('../schema/requestSchema');
const userModel = require('../schema/userSchema');
const smtp = require('../services/sendmail')
const crypto = require('crypto');
const axios = require('axios');
const {createdeliveryrequest}= require('../controller/requestcontroller');
const {getAvailableRequests}= require('../controller/requestcontroller');
const {acceptRequest}= require('../controller/requestcontroller')
const {updateStatus}= require('../controller/requestcontroller');
const {getAnalytics} = require('../controller/requestcontroller');
const {getAllRequest} = require('../controller/requestcontroller')
const {getSingleRequest}= require('../controller/requestcontroller');
const {deleteSingleRequest}= require('../controller/requestcontroller');
const {updateRiderLocation} = require('../controller/requestcontroller');
const {trackRiderLocation} = require('../controller/requestcontroller');

jest.mock('axios');
jest.mock('../schema/requestSchema')
jest.mock('../schema/userSchema')
jest.mock('../services/sendmail');




describe('Api health test',()=>{
it('it should reject invalid signature',async ()=>{
    const res = await request(app).post('/payment/webhook')
    .set('X-paystack-signature', 'wrong-signature')
    .send({event:'charges.success'});

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('invalid signature');
})
it('should process valid charges.success event',async ()=>{
    const body = {
        event:'charge.success',
        data:{
            reference : 'ref_12345',
            metadata:{userId: 'user123', requestId: 'req123'},
        }
    }
    const secret = process.env.PAYSTACK_SECRET_KEY || "test_secret";
    const hash = crypto.createHmac('sha512', secret)
    .update(JSON.stringify(body)).digest('hex');
    const res = await request(app).post('/payment/webhook')
    .set('x-paystack-signature', hash).send(body);
    expect(res.status).toBe(200);
    expect(requestModel.findByIdAndUpdate).toHaveBeenCalledWith('req123',{
        paymentStatus : 'paid',
        paidBy : 'user123',
        transactionRef : 'ref_12345'
    })
})
})

const mongoose = require("mongoose");
const { error } = require('console');

afterAll(async () => {
  await mongoose.disconnect();
});

describe('paystack initialize paymen', ()=>{
    it('should return 400 if require fields are miss',async ()=>{
    const res = await request(app).post('/payment/initialize')
    .send({email: 'test@gmail.com'});

    expect(res.status).toBe(400);
    expect(res.text).toBe('Email, Amount, and requestId are required');
    })

    it('should initialize payment successful', async ()=>{
        axios.post.mockResolvedValue({
            data :{
                data :{
                    authorization_url : "https://paystack.com/pay/auth123",
                    access_code : "access_123",
                    reference: "reference_123"
                }
            }
        })
  
        const res = await request(app).post('/payment/initialize')
        .send({
            Email:'test@gmail.com',
            requestId: 'req_123',
            Amount: 5000,
        }).set('Authorization', 'Bearer faketoken');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Payment initialized');
        expect(res.body).toHaveProperty('authorization_url', 'https://paystack.com/pay/auth123');
        expect(res.body).toHaveProperty('access_code', 'access_123');
        expect(res.body).toHaveProperty("reference", "reference_123");

  

        
    })
      it("should handle failure", async () => {
  axios.post.mockRejectedValue(new Error("Api down"));

  const res = await request(app).post("/payment/initialize")
    .send({
      Email: "test@example.com",
      Amount: 1000,
      requestId: "req_123"
    })
    .set("Authorization", "Bearer faketoken");

  expect(res.status).toBe(500);
  expect(res.text).toBe("Payment initialization failed");
});

})

describe('api create users test',()=>{
    it('should return 403 if fields are missing', async()=>{
        const res = await request(app).post('/auth/signUp').send({
            email: 'test@gmail.com'
        });
        expect(res.status).toBe(403);
        expect(res.text).toBe('all feilds are required')
    });

    it('should return 409 if email has already exist',async ()=>{
      userModel.findOne.mockResolvedValue({email:'test@gmail.com'});

        const res = await request(app).post('/auth/signUp').send({
            firstName: 'isaac',
            surnName: 'emmanuel',
            email: 'test@gmail.com',
            passWord : 'secure123',
            role : 'costumer'
        });
        expect(res.status).toBe(409);
        expect(res.text).toBe('this email has already been used');
    });

    it('should create user successfully', async ()=>{
        userModel.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashpassword123');
        userModel.create.mockResolvedValue({
            _id : 'user123',
            firstName: 'Isaac',
            surnName: 'Emmanuel',
            email : 'test@gmail.com',
            role: 'costumer'
        });
        JWT.sign.mockReturnValue('faketoken123')
        const res = await request(app).post('/auth/signUp').send({
             firstName: 'Isaac',
            surnName: 'Emmanuel',
            email : 'test@gmail.com',
            passWord : 'secure123',
            role: 'costumer'
        })

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message', 'user successfully created');
        expect(res.body).toHaveProperty('firstName', 'Isaac');
        expect(res.body).toHaveProperty('surnName','Emmanuel');
        expect(res.body).toHaveProperty('token','faketoken123');

    });

    it('should return 500 if something goes wrong', async ()=>{
        userModel.findOne.mockRejectedValue(new Error('DB error'));
        const res = await request(app).post('/auth/signUp').send({
           firstName: 'Isaac',
            surnName: 'Emmanuel',
            email : 'test@gmail.com',
            passWord : 'secure123',
            role: 'costumer'  
        });
        expect(res.status).toBe(500);
        expect(res.text).toContain('internal server error');

    })

});

describe('login user test',()=>{
    it('should return 403 if feilds are missing', async ()=>{
        const res = await request(app).post('/auth/login').send({
            email : '',
            passWord: ''
        })
        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Email and password are required');
    });

    it('should return 404 if user not found ', async ()=>{
        userModel.findOne.mockReturnValue({select: jest.fn().mockResolvedValue(null)});

        const res = await request(app).post('/auth/login').send({
            email : 'test@gmail.com',
            passWord : 'secure123'
        });
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Invalid credentials')
    });

    it('should return 401 if password does not match', async () => {
  
  userModel.findOne.mockReturnValue({
    select: jest.fn().mockResolvedValue({
      _id: 'user123',
      passWord: 'hashpassword' 
    })
  });

  
  bcrypt.compare.mockResolvedValue(false);

  const res = await request(app).post('/auth/login').send({
    email: 'test@gmail.com',
    passWord: 'wrongpassword' 
  });

  expect(res.status).toBe(401);
  expect(res.body.message).toBe('Invalid password');
});


    it('should login user successfully', async () => {
  const user = {
    _id: 'user123',
    firstName: 'Isaac',
    surnName: 'Emmanuel',
    email: 'test@gmail.com',
    passWord: 'hashpassword',
    role: 'customer'
  };

  userModel.findOne.mockReturnValue({
    select: jest.fn().mockResolvedValue(user)
  });
  bcrypt.compare.mockResolvedValue(true);
  JWT.sign.mockReturnValue('faketoken');

  const res = await request(app).post('/auth/login').send({
    email: 'test@gmail.com',
    passWord: 'secure123'
  });

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('message', 'Login successfully');
  expect(res.body).toHaveProperty('token', 'faketoken');
});


    it('should return 500 if something goes wrong', async () => {
  userModel.findOne.mockImplementation(() => ({
    select: jest.fn().mockRejectedValue(new Error('DB error'))
  }));

  const res = await request(app).post('/auth/login').send({
    email: 'test@gmail.com',
    passWord: 'secure123'
  });

  expect(res.status).toBe(500);
  expect(res.body.message).toBe('Internal server error');
});

})

describe("get all user", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return 200 and users when users exist", async () => {
    const fakeUsers = [
      { _id: "1", firstName: "John", surnName: "Doe", role: "admin" },
      { _id: "2", firstName: "Jane", surnName: "Smith", role: "user" },
    ];

    userModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUsers),
    });

    await getAlluser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      message: "users fetched successfully",
      data: [
        { userId: "1", firstNname: "John", surnName: "Doe", role: "admin" },
        { userId: "2", firstNname: "Jane", surnName: "Smith", role: "user" },
      ],
    });
  });

  it("should return 404 if no users are found", async () => {
    userModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([]),
    });

    await getAlluser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "No users found" });
  });

  it("should return 500 if an error occurs", async () => {
    userModel.find.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("DB error")),
    });

    await getAlluser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith("internal server error");
  });
});

describe("creating delivery request test", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {
        pickup: "Location A",
        dropoff: "Location B",
        package_details: "Small box",
        cost: 1000,
      },
      user: { userId: "123" },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("should return 400 if any required field is missing", async () => {
    mockReq.body = { pickup: "", dropoff: "", package_details: "", cost: "" };

    await createdeliveryrequest(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith("all fields are required");
  });

  it("should return 201 and created request if successful", async () => {
    const fakeRequest = {
      _id: "req1",
      costumerId: "123",
      pickup: "Location A",
      dropoff: "Location B",
      package_details: "Small box",
      cost: 1000,
    };

    requestModel.create.mockResolvedValue(fakeRequest);

    await createdeliveryrequest(mockReq, mockRes);

    expect(requestModel.create).toHaveBeenCalledWith({
      costumerId: "123",
      pickup: "Location A",
      dropoff: "Location B",
      package_details: "Small box",
      cost: 1000,
    });

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "request has been created successfully",
      data: fakeRequest,
    });
  });

  it("should return 303 if request creation fails", async () => {
    requestModel.create.mockResolvedValue(null);

    await createdeliveryrequest(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(303);
    expect(mockRes.send).toHaveBeenCalledWith("failed to create a request");
  });

  it("should return 500 if an error occurs", async () => {
    requestModel.create.mockRejectedValue(new Error("DB error"));

    await createdeliveryrequest(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith("internal server error");
  });
});

describe("getAvailableRequests", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {}; 
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return 200 and pending requests if available", async () => {
    const fakeRequests = [
      { _id: "1", pickup: "A", dropoff: "B", status: "pending" },
      { _id: "2", pickup: "C", dropoff: "D", status: "pending" },
    ];

    requestModel.find.mockResolvedValue(fakeRequests);

    await getAvailableRequests(mockReq, mockRes);

    expect(requestModel.find).toHaveBeenCalledWith({ status: "pending" });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Available requests",
      data: fakeRequests,
    });
  });

  it("should return 404 if no pending requests are available", async () => {
    requestModel.find.mockResolvedValue([]);

    await getAvailableRequests(mockReq, mockRes);

    expect(requestModel.find).toHaveBeenCalledWith({ status: "pending" });
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith({
      message: "No pending requests are available at the moment",
    });
  });

  it("should return 500 if an error occurs", async () => {
    requestModel.find.mockRejectedValue(new Error("DB error"));

    await getAvailableRequests(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith("Internal server error");
  });
});

describe("acceptRequest test", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      params: { id: "req123" },
      user: { userId: "rider123", firstName: "John", surnName: "Doe" },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should accept a pending request and notify the customer", async () => {
    const fakeRequest = {
      _id: "req123",
      status: "pending",
      costumerId: "cust123",
      save: jest.fn().mockResolvedValue(true),
    };

    const fakeCustomer = { _id: "cust123", email: "customer@example.com" };

    requestModel.findById.mockResolvedValue(fakeRequest);
    userModel.findById.mockResolvedValue(fakeCustomer);
    smtp.sendMail.mockImplementation((mail, cb) => cb(null, { response: "OK" }));

    await acceptRequest(mockReq, mockRes);

    expect(requestModel.findById).toHaveBeenCalledWith("req123");
    expect(fakeRequest.status).toBe("accepted");
    expect(fakeRequest.riderId).toBe("rider123");
    expect(fakeRequest.save).toHaveBeenCalled();
    expect(userModel.findById).toHaveBeenCalledWith("cust123");
    expect(smtp.sendMail).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Request accepted",
      data: fakeRequest,
    });
  });

  it("should return 400 if request is not found or not pending", async () => {
    requestModel.findById.mockResolvedValue(null);

    await acceptRequest(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith("Request not available");
  });

  it("should return 404 if customer is not found", async () => {
    const fakeRequest = {
      _id: "req123",
      status: "pending",
      costumerId: "cust123",
      save: jest.fn().mockResolvedValue(true),
    };

    requestModel.findById.mockResolvedValue(fakeRequest);
    userModel.findById.mockResolvedValue(null);

    await acceptRequest(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith("Customer not found");
  });

  it("should return 500 if an error occurs", async () => {
    requestModel.findById.mockRejectedValue(new Error("DB error"));

    await acceptRequest(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith("Internal server error");
  });
});

describe("getAnalytics controller", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  it("should return analytics data successfully", async () => {
    // Mock user counts
    userModel.countDocuments.mockImplementation((query) => {
      if (query.role === "costumer") return Promise.resolve(10);
      if (query.role === "rider") return Promise.resolve(5);
    });

    // Mock requests counts
    requestModel.countDocuments.mockImplementation((query) => {
      if (!query) return Promise.resolve(20);
      if (query.status === "completed") return Promise.resolve(15);
    });

    // Mock revenue aggregation
    requestModel.aggregate.mockResolvedValue([{ totalRevenue: 5000 }]);

    // Call controller
    await getAnalytics(mockReq, mockRes);

    // Assertions
    expect(userModel.countDocuments).toHaveBeenCalledWith({ role: "costumer" });
    expect(userModel.countDocuments).toHaveBeenCalledWith({ role: "rider" });
    expect(requestModel.countDocuments).toHaveBeenCalledWith();
    expect(requestModel.countDocuments).toHaveBeenCalledWith({ status: "completed" });
    expect(requestModel.aggregate).toHaveBeenCalledWith([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$cost" } } },
    ]);

    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Analytics",
      data: {
        totalCostumer: 10,
        totalRider: 5,
        totalRequests: 20,
        completedRequests: 15,
        totalRevenue: 5000,
      },
    });
  });

  it("should handle errors gracefully", async () => {
    // Force error
    userModel.countDocuments.mockRejectedValue(new Error("DB error"));

    await getAnalytics(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error fetching analytics",
      error: "DB error",
    });
  });
});


describe("getAnalytics controller", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it("should return analytics data successfully", async () => {
    
    userModel.countDocuments.mockImplementation((query) => {
      if (query.role === "costumer") return 10;
      if (query.role === "rider") return 5;
    });

    requestModel.countDocuments.mockImplementation((query) => {
      if (!query) return 20;
      if (query.status === "completed") return 15;
    });

    requestModel.aggregate.mockResolvedValue([{ totalRevenue: 5000 }]);

    await getAnalytics(mockReq, mockRes);

    expect(userModel.countDocuments).toHaveBeenCalledWith({ role: "costumer" });
    expect(userModel.countDocuments).toHaveBeenCalledWith({ role: "rider" });
    expect(requestModel.countDocuments).toHaveBeenCalledWith();
    expect(requestModel.countDocuments).toHaveBeenCalledWith({ status: "completed" });
    expect(requestModel.aggregate).toHaveBeenCalledWith([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$cost" } } }
    ]);

    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Analytics",
      data: {
        totalCostumer: 10,
        totalRider: 5,
        totalRequests: 20,
        completedRequests: 15,
        totalRevenue: 5000,
      }
    });
  });

  it("should handle errors gracefully", async () => {
    userModel.countDocuments.mockRejectedValue(new Error("DB error"));

    await getAnalytics(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error fetching analytics",
      error: "DB error"
    });
  });
});

describe("getAllRequest", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should fetch all requests successfully", async () => {
    const fakeRequests = [
      { _id: "1", status: "pending" },
      { _id: "2", status: "completed" },
    ];

    
    const populateRiderMock = jest.fn().mockResolvedValue(fakeRequests);
    const populateCustomerMock = jest.fn(() => ({ populate: populateRiderMock }));
    requestModel.find.mockReturnValue({ populate: populateCustomerMock });

    await getAllRequest(mockReq, mockRes);

    expect(requestModel.find).toHaveBeenCalled();
    expect(populateCustomerMock).toHaveBeenCalledWith("costumerId", "fistName surnName");
    expect(populateRiderMock).toHaveBeenCalledWith("riderId", "firstName surnName");
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "delivery request successfully fetched",
      data: fakeRequests,
    });
  });

  it("should return 404 if no requests found", async () => {
  
    const populateRiderMock = jest.fn().mockResolvedValue([]);
    const populateCustomerMock = jest.fn(() => ({ populate: populateRiderMock }));
    requestModel.find.mockReturnValue({ populate: populateCustomerMock });

    await getAllRequest(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith("no request found");
  });

  it("should handle errors and return 500", async () => {
    const populateRiderMock = jest.fn().mockRejectedValue(new Error("DB error"));
    const populateCustomerMock = jest.fn(() => ({ populate: populateRiderMock }));
    requestModel.find.mockReturnValue({ populate: populateCustomerMock });

    await getAllRequest(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith("internal error");
  });
});

describe("getSingleRequest test", () => {
  let mockReq, mockRes, fakeRequest;

  beforeEach(() => {
    fakeRequest = { _id: "123", status: "pending" };

    mockReq = { params: { id: "123" } };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("should return 200 and the request if found", async () => {
    const populateMock = jest.fn().mockReturnThis();

    requestModel.findById.mockReturnValue({
      populate: populateMock,
      then: (resolve) => resolve(fakeRequest), // resolves directly
    });

    await getSingleRequest(mockReq, mockRes);

    expect(requestModel.findById).toHaveBeenCalledWith("123");
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "successfully fetched request",
      data: fakeRequest,
    });
  });

  it("should return 404 if request is not found", async () => {
    const populateMock = jest.fn().mockReturnThis();

    requestModel.findById.mockReturnValue({
      populate: populateMock,
      then: (resolve) => resolve(null),
    });

    await getSingleRequest(mockReq, mockRes);

    expect(requestModel.findById).toHaveBeenCalledWith("123");
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "this request in no longer available",
    });
  });

  it("should return 500 if an error occurs", async () => {
    requestModel.findById.mockImplementation(() => {
      throw new Error("DB error");
    });

    await getSingleRequest(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "internal error",
    });
  });
});


describe("deleteSingleRequest", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      params: { id: "123" },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should delete a request and return 200 if found", async () => {
    requestModel.findByIdAndDelete.mockResolvedValue({ _id: "123" });

    await deleteSingleRequest(mockReq, mockRes);

    expect(requestModel.findByIdAndDelete).toHaveBeenCalledWith("123");
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Request has been successfully deleted",
    });
  });

  it("should return 404 if request is not found", async () => {
    requestModel.findByIdAndDelete.mockResolvedValue(null);

    await deleteSingleRequest(mockReq, mockRes);

    expect(requestModel.findByIdAndDelete).toHaveBeenCalledWith("123");
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "this request is not available",
    });
  });

  it("should return 500 if an error occurs", async () => {
    requestModel.findByIdAndDelete.mockRejectedValue(new Error("DB error"));

    await deleteSingleRequest(mockReq, mockRes);

    expect(requestModel.findByIdAndDelete).toHaveBeenCalledWith("123");
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "internal server error",
    });
  });
});

describe("updateRiderLocation", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      params: { id: "123" },
      user: { userId: "rider123" },
      body: { latitude: 6.5244, longitude: 3.3792 }, 
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return 400 if latitude or longitude is missing", async () => {
    mockReq.body = { latitude: null }; 

    await updateRiderLocation(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Latitude and longitude are required",
    });
  });

  it("should update rider location and return 200", async () => {
    const updatedRequest = {
      _id: "123",
      riderId: "rider123",
      riderLocation: { latitude: 6.5244, longitude: 3.3792 },
    };

    requestModel.findOneAndUpdate.mockResolvedValue(updatedRequest);

    await updateRiderLocation(mockReq, mockRes);

    expect(requestModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "123", riderId: "rider123" },
      { $set: { riderLocation: { latitude: 6.5244, longitude: 3.3792 } } },
      { new: true }
    );

    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Location updated successfully",
      request: updatedRequest,
    });
  });

  it("should return 404 if request is not found or not assigned to rider", async () => {
    requestModel.findOneAndUpdate.mockResolvedValue(null);

    await updateRiderLocation(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Request not found or not assigned to this rider",
    });
  });

  it("should return 500 if an error occurs", async () => {
    requestModel.findOneAndUpdate.mockRejectedValue(new Error("DB error"));

    await updateRiderLocation(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Internal server error",
    });
  });
});

describe("trackRiderLocation", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { params: { id: "123" } };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return 200 and rider location if request is found", async () => {
    const fakeRequest = {
      _id: "123",
      riderLocation: { latitude: 6.5244, longitude: 3.3792 },
    };

    requestModel.findById.mockResolvedValue(fakeRequest);

    await trackRiderLocation(mockReq, mockRes);

    expect(requestModel.findById).toHaveBeenCalledWith("123");
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Rider location retrieved successfully",
      location: fakeRequest.riderLocation,
    });
  });

  it("should return 404 if request is not found", async () => {
    requestModel.findById.mockResolvedValue(null);

    await trackRiderLocation(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Request not found",
    });
  });

  it("should return 500 if an error occurs", async () => {
    requestModel.findById.mockRejectedValue(new Error("DB error"));

    await trackRiderLocation(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Internal server error",
    });
  });
})
