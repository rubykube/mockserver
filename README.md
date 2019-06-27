# Quick start

## Run the mock server

  `node src/index.js`

## Run the frontend server

 * Use the following application ID: 923937b3467b9ea668a5e9fdd573cc338a1ae529a46feb12a509b4eccf3f057b
 * Run the frontend application on http://localhost:4200

## Session

Use any user and password to login.

Use the following credentials to simulate specific scenarios:

|            Scenario              |           Email          | Password | Level | OTP code |
|:--------------------------------:|:------------------------:|:--------:|:-----:|:--------:|
| Login a level 3 member           |             *            |     *    |   3   |          |
| Login a level 1 member           |       user1@peatio.tech  |  123123  |   1   |          |
| Login a level 2 member           |       user2@peatio.tech  |  123123  |   2   |          |
| Login a level 3 admin            |       admin@peatio.tech  |  123123  |   3   |          |
| Error invalid email or pass      |       wrong@peatio.tech  |  123123  |       |          |
| OTP code is requested            |         otp@peatio.tech  |  123123  |       |          |
| OTP code is valid                |         otp@peatio.tech  |  123123  |       |  123456  |
| Login a level 3 admin tower      |  toweradmin@peatio.tech  |  123123  |   3   |          |
| Login a level 3 superadmin tower |  superadmin@peatio.tech  |  123123  |   3   |          |
| Login a level 3 accountant tower |  accountant@peatio.tech  |  123123  |   3   |          |
| Login a level 3 compliance tower |  compliance@peatio.tech  |  123123  |   3   |          |
| Login a level 3 technical tower  |   technical@peatio.tech  |  123123  |   3   |          |
| Login a level 3 support tower    |     support@peatio.tech  |  123123  |   3   |          |
