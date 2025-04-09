
# Restaurant Backend

This is the backend system of Restaurant Management where User can reserved seats in advance.User choose number of guest  and time duration .




## Features

- New Restaurants can register themsleves
- User can select a restaurant , date,time  and number of guest
-  User get resvation email
- use can  cancel the reservation at any time
- User see their reservation history
- No duplicate booking  in the existing time slot





## Api Endpoint
 

### For user Schema:
- /createAccount -> create an account
- /login -> login 
- /userLogout  -> logout
- /profile  -> user can show their profile
- /reservation-details -> to get all details of reservation

###  For Restaurant Schema

- /open -> New Restaurants can register themsleves
- / all -> Get all Restaurant with capcity , avaliable seat in that  time

### For Booking Schema

- /book/:restaurantID -> User can reserve their seat accroding to their time

- /cancel/:restaurantID/:bookedAt: User can cancel their booking 