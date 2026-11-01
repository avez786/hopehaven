HOPEHAVEN REACT COMPLETE UPDATE

This update was built against the controllers and DTOs found in your supplied hopehaven.zip.

FRONTEND
Copy the files under src/ into hopehaven-react/src/, replacing matching files:
- Admin.jsx and Admin.css: admin overview, children CRUD, adoption approval/rejection, donation totals/history/categories, registered users.
- App.jsx: routes, navigation, role-aware links, logout, fallback route.
- Login.jsx: reads the actual LoginResponse shape: token, email, role.

BACKEND
Copy backend-patch/SecurityConfig.java to:
hopehaven/src/main/java/com/hopehaven/hopehaven_backend/config/SecurityConfig.java

Copy backend-patch/UserController.java to:
hopehaven/src/main/java/com/hopehaven/hopehaven_backend/controller/UserController.java

The security fix explicitly restricts /api/users/** to ADMIN. JwtFilter grants ROLE_ADMIN, so the corrected UserController uses hasRole('ADMIN') instead of hasAuthority('ADMIN').

RUN
1. Keep Spring Boot running on localhost:8080.
2. Copy the frontend files into the paths above.
3. Replace the two backend files at the paths above.
4. In hopehaven-react run: npm run dev
5. Log in with your admin account and open /admin.

ENDPOINTS USED
GET /api/children; POST/PUT/DELETE /api/children
GET /api/adoptions; PUT /api/adoptions/{id}/approve and /reject
GET /api/donations; /total; /category; /recent
GET /api/users

Approval marks the child ADOPTED. Donations are recorded but no payment gateway is implemented. The dashboard displays endpoint errors when an API call fails and keeps successfully loaded sections available.
