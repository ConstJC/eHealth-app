# HTTP Files Documentation Rules

This document defines the comprehensive standards for HTTP test files in the project, based on the established patterns in the masters modules.

## 📋 General HTTP File Standards

### File Structure
Every HTTP file must follow this standardized structure:

```http
### Get Auth Token
# @name login
POST {{BACKEND_DOMAIN}}/api/v1/auth/email/login
Content-Type: application/json

{
  "email": "{{TEST_EMAIL}}",
  "password": "{{TEST_PASSWORD}}"
}

### Set token variable from login response
@token = {{login.token}}

### ===========================================
### [OPERATION] [ENTITY] ENDPOINTS
### ===========================================

### [Operation Description]
[HTTP_METHOD] {{BACKEND_DOMAIN}}/api/v1/[entity]/[endpoint]
[Headers as needed]
Authorization: Bearer {{token}}

[Request body if needed]
```

## 🏗️ Operation-Specific Rules

### GET Operations (get-[entity].http)
GET files must include comprehensive examples for all retrieval patterns:

```http
### Get All [Entity] (DevExtreme Pagination)
GET {{BACKEND_DOMAIN}}/api/v1/[entity]/?requireTotalCount=true&skip=0&take=20
Authorization: Bearer {{token}}

### Get All [Entity] with Filter (Active Status)
GET {{BACKEND_DOMAIN}}/api/v1/[entity]/?filter=[%22status%22,%22=%22,%22Active%22]&requireTotalCount=true&skip=0&take=20
Authorization: Bearer {{token}}

### Get All [Entity] with Search
GET {{BACKEND_DOMAIN}}/api/v1/[entity]/?searchValue=[search_term]&searchOperation=contains&requireTotalCount=true&skip=0&take=20
Authorization: Bearer {{token}}

### Get All [Entity] with Sort
GET {{BACKEND_DOMAIN}}/api/v1/[entity]/?sort=[{%22selector%22:%22[field]%22,%22desc%22:false}]&requireTotalCount=true&skip=0&take=20
Authorization: Bearer {{token}}

### Get All [Entity] (V2 Pagination)
GET {{BACKEND_DOMAIN}}/api/v1/[entity]/v2?page=1&limit=20&search=[term]&status=Active
Authorization: Bearer {{token}}

### Get All [Entity] (Simple List)
GET {{BACKEND_DOMAIN}}/api/v1/[entity]/all
Authorization: Bearer {{token}}

### Get [Entity] Lookup (For Dropdowns)
GET {{BACKEND_DOMAIN}}/api/v1/[entity]/lookup?searchValue=[term]&searchOperation=contains&skip=0&take=10
Authorization: Bearer {{token}}

### Get [Entity] by ID
GET {{BACKEND_DOMAIN}}/api/v1/[entity]/1
Authorization: Bearer {{token}}
```

### POST Operations (post-[entity].http)
POST files must include one comprehensive creation example:

```http
### Create [Entity]
POST {{BACKEND_DOMAIN}}/api/v1/[entity]
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "[field1]": "[value1]",
  "[field2]": "[value2]",
  "[field3]": "[value3]",
  "status": "Active"
}
```

### PATCH Operations (patch-[entity].http)
PATCH files must include various update scenarios:

```http
### Update [Entity] (Basic Fields)
PATCH {{BACKEND_DOMAIN}}/api/v1/[entity]/1
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "[field1]": "Updated [field1]",
  "[field2]": "Updated [field2]",
  "remarks": "Updated remarks"
}

### Update [Entity] (Status Change)
PATCH {{BACKEND_DOMAIN}}/api/v1/[entity]/1
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "status": "Active"
}

### Update [Entity] (Complete Update)
PATCH {{BACKEND_DOMAIN}}/api/v1/[entity]/1
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "[field1]": "Updated [field1]",
  "[field2]": "Updated [field2]",
  "remarks": "Updated remarks",
  "status": "Active"
}

### Update [Entity] (Multiple Fields)
PATCH {{BACKEND_DOMAIN}}/api/v1/[entity]/1
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "[field1]": "Updated [field1]",
  "[field2]": "Updated [field2]",
  "remarks": "Updated remarks"
}
```

### DELETE Operations (delete-[entity].http)
DELETE files must include both individual and bulk delete examples:

```http
### Delete [Entity] by ID
DELETE {{BACKEND_DOMAIN}}/api/v1/[entity]/1
Authorization: Bearer {{token}}

### ===========================================
### BULK DELETE [ENTITY] ENDPOINTS
### ===========================================

### Bulk Delete [Entity] (Small Batch)
DELETE {{BACKEND_DOMAIN}}/api/v1/[entity]/bulk-delete
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "ids": [10, 11, 12]
}
```

## 🎯 Quality Standards

### Completeness
- Every HTTP file must have authentication setup
- Every operation type must have comprehensive examples
- Every endpoint must include proper headers
- Every request body must be properly formatted

### Consistency
- Use consistent variable naming ({{BACKEND_DOMAIN}}, {{token}})
- Use consistent header formatting
- Use consistent JSON formatting
- Use consistent comment structure

### Clarity
- Use descriptive comments for each example
- Use meaningful test data
- Use consistent ID ranges to avoid conflicts
- Use clear section separators

### Accuracy
- Ensure all endpoints match actual API routes
- Ensure all request bodies match DTOs
- Ensure all headers are correct
- Ensure all examples are functional

## 📝 File Organization Options

### Option 1: Separate Files by Operation Type (Current Approach)
**Pros:**
- Clear separation of concerns
- Easy to find specific operation types
- Smaller, focused files
- Better for team collaboration (different people can work on different operations)
- Easier to maintain individual operation types

**Cons:**
- More files to manage
- Duplicate authentication setup in each file
- Need to switch between files for complete testing

**File Naming Pattern:**
- `get-[entity].http` - For GET operations
- `post-[entity].http` - For POST operations  
- `patch-[entity].http` - For PATCH operations
- `delete-[entity].http` - For DELETE operations

**Examples:**
- `get-departments.http`
- `post-departments.http`
- `patch-departments.http`
- `delete-departments.http`

### Option 2: Single File per Entity
**Pros:**
- Single file contains all operations for an entity
- No duplicate authentication setup
- Complete testing workflow in one place
- Easier to see all available operations
- Better for comprehensive testing scenarios

**Cons:**
- Larger files (potentially 200+ lines)
- Harder to navigate in large files
- More complex to maintain
- Potential merge conflicts in team environments

**File Naming Pattern:**
- `[entity].http` - For all operations
- `[entity]-api.http` - Alternative naming

**Examples:**
- `departments.http`
- `cost-centers.http`
- `divisions.http`

### Single File Template (Option 2)
If you choose the single file approach, use this structure:

```http
### Get Auth Token
# @name login
POST {{BACKEND_DOMAIN}}/api/v1/auth/email/login
Content-Type: application/json

{
  "email": "{{TEST_EMAIL}}",
  "password": "{{TEST_PASSWORD}}"
}

### Set token variable from login response
@token = {{login.token}}

### ===========================================
### GET [ENTITY] ENDPOINTS
### ===========================================

### Get All [Entity] (DevExtreme Pagination)
GET {{BACKEND_DOMAIN}}/api/v1/[entity]/?requireTotalCount=true&skip=0&take=20
Authorization: Bearer {{token}}

### Get [Entity] by ID
GET {{BACKEND_DOMAIN}}/api/v1/[entity]/1
Authorization: Bearer {{token}}

### ===========================================
### POST [ENTITY] ENDPOINTS (CREATE)
### ===========================================

### Create [Entity]
POST {{BACKEND_DOMAIN}}/api/v1/[entity]
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "[field1]": "[value1]",
  "[field2]": "[value2]",
  "status": "Active"
}

### ===========================================
### PATCH [ENTITY] ENDPOINTS (UPDATE)
### ===========================================

### Update [Entity] (Basic Fields)
PATCH {{BACKEND_DOMAIN}}/api/v1/[entity]/1
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "[field1]": "Updated [field1]",
  "[field2]": "Updated [field2]"
}

### ===========================================
### DELETE [ENTITY] ENDPOINTS
### ===========================================

### Delete [Entity] by ID
DELETE {{BACKEND_DOMAIN}}/api/v1/[entity]/1
Authorization: Bearer {{token}}

### Bulk Delete [Entity] (Small Batch)
DELETE {{BACKEND_DOMAIN}}/api/v1/[entity]/bulk-delete
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "ids": [10, 11, 12]
}
```

### Recommendation
**Use Option 1 (Separate Files) when:**
- Working in a team environment
- Files are likely to be large (50+ lines per operation)
- Different team members work on different operations
- You need quick access to specific operation types

**Use Option 2 (Single File) when:**
- Working solo or in small teams
- Files are relatively small (under 200 lines total)
- You frequently test complete workflows
- You prefer having all operations in one place

## 🔧 Technical Standards

### Authentication Setup
Every HTTP file must start with:

```http
### Get Auth Token
# @name login
POST {{BACKEND_DOMAIN}}/api/v1/auth/email/login
Content-Type: application/json

{
  "email": "{{TEST_EMAIL}}",
  "password": "{{TEST_PASSWORD}}"
}

### Set token variable from login response
@token = {{login.token}}
```

### Section Headers
Use consistent section headers:

```http
### ===========================================
### [OPERATION] [ENTITY] ENDPOINTS
### ===========================================
```

### Request Headers
Always include required headers:

```http
Content-Type: application/json
Authorization: Bearer {{token}}
```

### JSON Formatting
Use consistent JSON formatting:

```json
{
  "field1": "value1",
  "field2": "value2",
  "field3": "value3"
}
```

## 🚀 Implementation Guidelines

1. **Start with authentication** - Always include auth setup
2. **Add section headers** - Use clear separators
3. **Include comprehensive examples** - Cover all use cases
4. **Use consistent formatting** - Follow established patterns
5. **Avoid redundant examples** - Keep only necessary variations
6. **Use non-overlapping IDs** - Prevent test conflicts
7. **Keep it organized** - Group related operations

## 📚 Reference Examples

See the following files for complete HTTP file examples:

### Department Module
- `src/masters/departments/http/get-departments.http`
- `src/masters/departments/http/post-departments.http`
- `src/masters/departments/http/patch-departments.http`
- `src/masters/departments/http/delete-departments.http`

### Cost Centers Module
- `src/masters/cost-centers/http/get-cost-centers.http`
- `src/masters/cost-centers/http/post-cost-centers.http`
- `src/masters/cost-centers/http/patch-cost-centers.http`
- `src/masters/cost-centers/http/delete-cost-centers.http`

## 🎯 Best Practices

### ID Management
- Use different ID ranges for different examples
- Individual operations: IDs 1-5
- Small batch operations: IDs 10-15
- Large batch operations: IDs 20-30

### Example Variety
- Include basic examples
- Include advanced examples with filters
- Include error scenarios
- Include edge cases

### Documentation
- Use descriptive comments
- Explain complex queries
- Document special parameters
- Include expected responses

### Maintenance
- Keep examples up-to-date
- Remove redundant examples
- Update when APIs change
- Test all examples regularly
