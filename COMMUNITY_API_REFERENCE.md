# 🔌 Community API Reference

## Quick Start - Test All Endpoints

### 1. Register Admin
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin",
  "phone": "9876543210"
}
```

### 2. Create Community (Admin)
```bash
POST http://localhost:5000/api/communities/create
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Sunrise Apartments",
  "description": "Beautiful 5-star apartment complex with modern facilities",
  "location": "Downtown, City Center",
  "facilities": ["Gym", "Swimming Pool", "Parking", "Clubhouse", "Garden"],
  "rules": [
    "No noise after 10 PM",
    "Visitors must register at entrance",
    "No parking in common areas",
    "Maintain cleanliness of common spaces"
  ]
}
```

### 3. Register Resident
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Resident Name",
  "email": "resident@example.com",
  "password": "password123",
  "role": "resident",
  "phone": "9876543211"
}
```

### 4. Search Communities (Public)
```bash
GET http://localhost:5000/api/communities/all?search=Sunrise&page=1&limit=10
```

### 5. Get Community Details (Public)
```bash
GET http://localhost:5000/api/communities/<community_id>
```

### 6. Request to Join Community (Resident/Security)
```bash
POST http://localhost:5000/api/communities/join
Authorization: Bearer <resident_token>
Content-Type: application/json

{
  "communityId": "<community_id>"
}
```

### 7. Get Pending Join Requests (Admin)
```bash
GET http://localhost:5000/api/communities/admin/join-requests?communityId=<community_id>&status=pending
Authorization: Bearer <admin_token>
```

### 8. Approve Join Request (Admin)
```bash
POST http://localhost:5000/api/communities/admin/approve-request/<request_id>
Authorization: Bearer <admin_token>
```

### 9. Reject Join Request (Admin)
```bash
POST http://localhost:5000/api/communities/admin/reject-request/<request_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "rejectionReason": "Does not meet community requirements"
}
```

### 10. Get User's Community (Any Member)
```bash
GET http://localhost:5000/api/communities/my-community
Authorization: Bearer <token>
```

### 11. Remove Member (Admin)
```bash
DELETE http://localhost:5000/api/communities/admin/remove-member/<community_id>/<member_id>
Authorization: Bearer <admin_token>
```

### 12. Update Community (Admin)
```bash
PUT http://localhost:5000/api/communities/admin/update/<community_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Community Name",
  "description": "Updated description",
  "location": "New Location",
  "facilities": ["Gym", "Pool", "Updated Facility"],
  "rules": ["Updated Rule 1", "Updated Rule 2"]
}
```

### 13. Delete Community (Admin)
```bash
DELETE http://localhost:5000/api/communities/admin/delete/<community_id>
Authorization: Bearer <admin_token>
```

---

## Response Examples

### Success Response - Create Community
```json
{
  "message": "Community created successfully",
  "community": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Sunrise Apartments",
    "description": "Beautiful apartment complex",
    "location": "Downtown",
    "adminId": "507f1f77bcf86cd799439012",
    "members": [
      {
        "userId": "507f1f77bcf86cd799439012",
        "role": "admin",
        "joinedAt": "2025-11-27T10:30:00Z",
        "isActive": true,
        "_id": "507f1f77bcf86cd799439013"
      }
    ],
    "totalMembers": 1,
    "facilities": ["Gym", "Swimming Pool"],
    "rules": ["No noise after 10 PM"],
    "isActive": true,
    "createdAt": "2025-11-27T10:30:00Z"
  }
}
```

### Success Response - Join Request
```json
{
  "message": "Join request sent successfully",
  "joinRequest": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439015",
    "communityId": "507f1f77bcf86cd799439011",
    "userRole": "resident",
    "status": "pending",
    "message": null,
    "reviewedBy": null,
    "reviewedAt": null,
    "createdAt": "2025-11-27T10:35:00Z"
  }
}
```

### Error Response - Invalid Role
```json
{
  "message": "Invalid role. Must be admin, resident, or security"
}
```

### Error Response - Already Member
```json
{
  "message": "You are already a member of this community"
}
```

---

## Complete Workflow

### Step-by-Step Flow

1. **Admin Creates Account & Community**
   - POST `/auth/register` (role: admin)
   - POST `/communities/create` (with community details)

2. **Residents Register & Request Join**
   - POST `/auth/register` (role: resident)
   - GET `/communities/all` (search for community)
   - POST `/communities/join` (send join request)

3. **Admin Reviews & Approves**
   - GET `/communities/admin/join-requests` (see pending requests)
   - POST `/communities/admin/approve-request/:id` (approve user)
   - User now in community

4. **Members Access Community**
   - GET `/communities/my-community` (user can see their community)
   - All community features now available

5. **Admin Manages Members**
   - Can remove members: DELETE `/communities/admin/remove-member`
   - Can update community: PUT `/communities/admin/update`
   - Can delete community: DELETE `/communities/admin/delete`

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

Get token from login/register response and include in Authorization header.

---

## Notes

- Admin can have ONLY ONE community
- Members can belong to ONE community at a time
- Rejection reason is optional when rejecting requests
- Removing member marks them as inactive (soft delete)
- Community name is unique across system
- Search is case-insensitive and searches name, location, description
