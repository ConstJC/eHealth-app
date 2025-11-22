# JSDoc Documentation Rules

This document defines the comprehensive JSDoc documentation standards for the project, based on the established patterns in the cost-centers module.

## 📋 General JSDoc Standards

### Class-Level Documentation
Every class must have comprehensive JSDoc comments including:

```typescript
/**
 * Brief description of the class purpose.
 *
 * Detailed description explaining the class functionality,
 * its role in the system, and key features. Include information
 * about relationships, dependencies, and business logic.
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 *
 * @example
 * ```typescript
 * // Practical usage example
 * const instance = new ClassName();
 * const result = await instance.method();
 * ```
 */
```

### Constructor Documentation
All constructors must be documented:

```typescript
/**
 * Creates an instance of [ClassName].
 *
 * @param dependencyName - Description of the dependency and its purpose
 * @param anotherDependency - Description of another dependency
 */
constructor(
  private readonly dependencyName: DependencyType,
  private readonly anotherDependency: AnotherType,
) {}
```

### Method Documentation
All public and private methods must have comprehensive JSDoc comments:

```typescript
/**
 * Brief description of what the method does.
 *
 * Detailed explanation of the method's functionality, including
 * business logic, validation rules, and side effects. Explain
 * any complex algorithms or data transformations.
 *
 * @param paramName - Description of the parameter with type information
 * @param anotherParam - Description of another parameter
 * @returns Promise<ReturnType> - Description of what the method returns
 *
 * @throws {ExceptionType} When specific error condition occurs
 * @throws {AnotherException} When another error condition occurs
 *
 * @example
 * ```typescript
 * const result = await this.method(param1, param2);
 * // Returns: { id: 1, name: 'Example', ... }
 * ```
 */
```

## 🏗️ Architecture-Specific Rules

### Service Classes
Service classes must include:
- Business logic explanation
- Dependencies documentation
- Error handling patterns
- Usage examples with real data

```typescript
/**
 * Service for managing [entity] in the organizational hierarchy.
 *
 * This service provides comprehensive business logic for [entity] operations,
 * including creation, retrieval, updates, status management, and bulk operations.
 * [Entities] are [business description] and follow [business rules].
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 */
```

### Controller Classes
Controller classes must include:
- API endpoint documentation
- HTTP method descriptions
- Request/response examples
- Authentication requirements

```typescript
/**
 * Controller for managing [entity] in the organizational hierarchy.
 *
 * This controller provides comprehensive CRUD operations for [entity],
 * including creation, retrieval, updates, status management, and bulk operations.
 * [Entities] are [business description] and follow [business rules].
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 */
```

### Repository Classes
Repository classes must include:
- Data access patterns
- Query optimization details
- Transaction handling
- Relationship management

```typescript
/**
 * Repository implementation for [entity] data operations.
 *
 * This repository provides concrete implementations of all [entity] data access
 * operations. It handles complex queries, filtering, pagination, and relationship
 * management using TypeORM.
 *
 * The repository includes advanced features such as:
 * - DevExtreme-compatible filtering and sorting
 * - Complex relationship queries with joins
 * - Soft delete operations with transaction support
 * - Advanced lookup operations with exclusion support
 * - Status-based filtering and search capabilities
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 */
```

### Entity Classes
Entity classes must include:
- Database structure explanation
- Field constraints and validation
- Relationship descriptions
- Audit field documentation

```typescript
/**
 * TypeORM entity representing a [entity] in the database.
 *
 * This entity defines the database structure for [entities], including
 * all necessary fields, relationships, and constraints. It extends
 * EntityHelper for common audit functionality and includes relationships
 * with [related entities].
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 */
```

### DTO Classes
DTO classes must include:
- Validation rules
- Field constraints
- Usage scenarios
- Example data

```typescript
/**
 * Data Transfer Object for [operation] [entity].
 *
 * This DTO defines the [required/optional] fields needed to [operation]
 * a [entity] in the system. It includes validation rules for
 * [field constraints] ensuring data integrity and consistency.
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 */
```

### Domain Classes
Domain classes must include:
- Business object description
- Property explanations
- Usage examples
- Relationship information

```typescript
/**
 * Domain entity representing a [entity] in the [business context].
 *
 * This domain entity represents a [complete/simplified] [entity] with
 * [all/essential] properties, relationships, and audit information.
 * It serves as the [primary/simplified] business object for [entity] operations.
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 */
```

### Entity Classes (TypeORM)
Entity classes must include:
- Database structure explanation
- Field constraints and validation
- Relationship descriptions
- Audit field documentation
- Database-specific information

```typescript
/**
 * TypeORM entity representing a [entity] in the database.
 *
 * This entity defines the database structure for [entities], including
 * all necessary fields, relationships, and constraints. It extends
 * EntityHelper for common audit functionality and includes relationships
 * with [related entities].
 *
 * The entity includes database-specific features such as:
 * - Unique constraints for business keys
 * - Foreign key relationships with proper joins
 * - Soft delete functionality with audit trails
 * - Status management with enum constraints
 * - Automatic timestamp management
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 */
```

### Mapper Classes
Mapper classes must include:
- Data transformation purpose
- Domain-persistence mapping
- Relationship handling
- Data conversion logic

```typescript
/**
 * Mapper class for converting between [entity] domain and persistence models.
 *
 * This mapper handles the transformation between domain objects and
 * TypeORM entities, ensuring proper data mapping and relationship
 * handling. It manages complex object conversions and maintains
 * data integrity across the domain-persistence boundary.
 *
 * The mapper includes features such as:
 * - Bidirectional domain-persistence conversion
 * - Relationship mapping with proper entity handling
 * - Audit field preservation and conversion
 * - Null safety and error handling
 * - Type-safe transformations
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 *
 * @example
 * ```typescript
 * const domainEntity = DivisionMapper.toDomain(persistenceEntity);
 * const persistenceEntity = DivisionMapper.toPersistence(domainEntity);
 * ```
 */
```

### Persistence Module Classes
Persistence module classes must include:
- Module purpose and scope
- Dependency injection setup
- Provider configuration
- Export definitions

```typescript
/**
 * Persistence module for [entity] data access operations.
 *
 * This module configures all persistence-related components for [entity]
 * operations, including repository providers, entity registration, and
 * dependency injection setup. It provides a clean abstraction layer
 * for data access operations.
 *
 * The module includes:
 * - TypeORM entity registration
 * - Repository provider configuration
 * - Abstract repository implementation
 * - Clean dependency injection
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 */
```

### Simplified Domain Classes
Simplified domain classes must include:
- Purpose and usage context
- Field explanations
- API documentation
- Exclusion rules

```typescript
/**
 * Simplified domain entity for [entity] lookup operations.
 *
 * This domain entity represents a lightweight [entity] object containing
 * only essential fields for lookup and selection operations. It's optimized
 * for API responses and client-side operations where full entity data
 * is not required.
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 *
 * @example
 * ```typescript
 * const lookupEntity = new FindAllDivision();
 * lookupEntity.id = 1;
 * lookupEntity.division_code = '01';
 * lookupEntity.division_name = 'Engineering';
 * ```
 */
```

## 📝 Property Documentation

### Class Properties
All class properties must be documented:

```typescript
/**
 * Brief description of the property.
 *
 * Detailed explanation of the property's purpose, constraints,
 * and usage. Include examples and validation rules.
 *
 * @example "Example value"
 * @example 123
 * @example { id: 1, name: 'Example' }
 */
@ApiProperty({
  type: String,
  example: 'Example value',
  description: 'Brief description for API documentation'
})
propertyName: string;
```

### Entity Properties (TypeORM)
Entity properties must include database-specific information:

```typescript
/**
 * Unique business code for the division.
 *
 * This field represents the human-readable business code for the division.
 * It must be unique across all divisions and follows a specific format.
 * The code is used for business operations and reporting.
 *
 * @example '00'
 * @example '01'
 */
@Column({
  type: 'char',
  length: 2,
  unique: true,
  nullable: false,
})
division_code: string;
```

### Mapper Methods
Mapper methods must include transformation details:

```typescript
/**
 * Converts a persistence entity to a domain object.
 *
 * This method transforms a TypeORM entity into a domain object,
 * handling all relationship mappings and data conversions. It ensures
 * proper type safety and maintains data integrity during transformation.
 *
 * @param raw - The TypeORM entity to convert
 * @returns Division - The converted domain object
 *
 * @example
 * ```typescript
 * const domainEntity = DivisionMapper.toDomain(persistenceEntity);
 * // Returns: { id: 1, division_code: '01', division_name: 'Engineering', ... }
 * ```
 */
static toDomain(raw: DivisionEntity): Division {
  // Implementation
}
```

### Relationship Properties
Relationship properties must include join information:

```typescript
/**
 * The user who serves as the head of the division.
 *
 * This field represents the person responsible for leading the division.
 * It establishes a many-to-one relationship with the UserEntity and
 * includes eager loading for performance optimization.
 *
 * @example UserEntity with id: 1, first_name: 'John', last_name: 'Doe'
 */
@ManyToOne(() => UserEntity, { eager: true, nullable: false })
@JoinColumn({ name: 'division_head' })
division_head: UserEntity;
```

### Method Parameters
All method parameters must be documented:

```typescript
/**
 * @param paramName - Description of the parameter with type and constraints
 * @param anotherParam - Description of another parameter
 */
```

### Return Types
All return types must be documented:

```typescript
/**
 * @returns Promise<ReturnType> - Description of what the method returns
 * @returns ReturnType - Description for synchronous methods
 */
```

## 🔧 Technical Documentation Standards

### Error Handling
Document all possible exceptions:

```typescript
/**
 * @throws {NotFoundException} When [entity] with the specified ID doesn't exist
 * @throws {UnprocessableEntityException} When [business rule] is violated
 * @throws {BadRequestException} When invalid data is provided
 */
```

### Examples
Include practical examples for all methods:

```typescript
/**
 * @example
 * ```typescript
 * const result = await this.method({
 *   field1: 'value1',
 *   field2: 'value2'
 * });
 * // Returns: { id: 1, field1: 'value1', ... }
 * ```
 */
```

### Version Information
Always include version information:

```typescript
/**
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 */
```

## 🎯 Quality Standards

### Completeness
- Every public method must have JSDoc comments
- Every class must have class-level documentation
- Every constructor must be documented
- Every property must be documented

### Consistency
- Use consistent formatting across all files
- Follow the same pattern for similar methods
- Maintain consistent example formats
- Use consistent parameter descriptions

### Clarity
- Write clear, concise descriptions
- Use business language, not technical jargon
- Include practical examples
- Explain complex logic thoroughly

### Accuracy
- Keep documentation up-to-date with code changes
- Verify all examples work correctly
- Ensure parameter types match actual implementation
- Validate return type descriptions

## 📚 Documentation Templates

### Entity Class Template
```typescript
/**
 * TypeORM entity representing a [entity] in the database.
 *
 * This entity defines the database structure for [entities], including
 * all necessary fields, relationships, and constraints. It extends
 * EntityHelper for common audit functionality and includes relationships
 * with [related entities].
 *
 * The entity includes database-specific features such as:
 * - Unique constraints for business keys
 * - Foreign key relationships with proper joins
 * - Soft delete functionality with audit trails
 * - Status management with enum constraints
 * - Automatic timestamp management
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 */
```

### Mapper Class Template
```typescript
/**
 * Mapper class for converting between [entity] domain and persistence models.
 *
 * This mapper handles the transformation between domain objects and
 * TypeORM entities, ensuring proper data mapping and relationship
 * handling. It manages complex object conversions and maintains
 * data integrity across the domain-persistence boundary.
 *
 * The mapper includes features such as:
 * - Bidirectional domain-persistence conversion
 * - Relationship mapping with proper entity handling
 * - Audit field preservation and conversion
 * - Null safety and error handling
 * - Type-safe transformations
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 *
 * @example
 * ```typescript
 * const domainEntity = [Entity]Mapper.toDomain(persistenceEntity);
 * const persistenceEntity = [Entity]Mapper.toPersistence(domainEntity);
 * ```
 */
```

### Persistence Module Template
```typescript
/**
 * Persistence module for [entity] data access operations.
 *
 * This module configures all persistence-related components for [entity]
 * operations, including repository providers, entity registration, and
 * dependency injection setup. It provides a clean abstraction layer
 * for data access operations.
 *
 * The module includes:
 * - TypeORM entity registration
 * - Repository provider configuration
 * - Abstract repository implementation
 * - Clean dependency injection
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 */
```

### Simplified Domain Template
```typescript
/**
 * Simplified domain entity for [entity] lookup operations.
 *
 * This domain entity represents a lightweight [entity] object containing
 * only essential fields for lookup and selection operations. It's optimized
 * for API responses and client-side operations where full entity data
 * is not required.
 *
 * @version 3
 * @since 1.0.0
 * @author Masters Module Team
 *
 * @example
 * ```typescript
 * const lookupEntity = new FindAll[Entity]();
 * lookupEntity.id = 1;
 * lookupEntity.code = '01';
 * lookupEntity.name = 'Example';
 * ```
 */
```

### Service Method Template
```typescript
/**
 * [Action] a [entity] in the [business context].
 *
 * [Detailed description of the method's functionality, including
 * business logic, validation rules, and side effects.]
 *
 * @param paramName - [Description of the parameter]
 * @param causer - [The user performing the action]
 * @returns Promise<[ReturnType]> - [Description of the return value]
 *
 * @throws {[ExceptionType]} When [specific error condition]
 *
 * @example
 * ```typescript
 * const result = await this.method(param, causer);
 * // Returns: [example return value]
 * ```
 */
```

### Controller Endpoint Template
```typescript
/**
 * [Action] a [entity] in the [business context].
 *
 * [Detailed description of the endpoint's functionality, including
 * HTTP method, request/response format, and business logic.]
 *
 * @param paramName - [Description of the parameter]
 * @param currentUser - [The authenticated user]
 * @returns Promise<[ReturnType]> - [Description of the response]
 *
 * @throws {[ExceptionType]} When [specific error condition]
 *
 * @example
 * ```typescript
 * const result = await this.endpoint(param, currentUser);
 * // Returns: [example response]
 * ```
 */
```

### Repository Method Template
```typescript
/**
 * [Action] [entity] data with [specific functionality].
 *
 * [Detailed description of the data access method, including
 * query patterns, performance considerations, and relationship handling.]
 *
 * @param paramName - [Description of the parameter]
 * @returns Promise<[ReturnType]> - [Description of the return value]
 *
 * @example
 * ```typescript
 * const result = await this.method(param);
 * // Returns: [example return value]
 * ```
 */
```

## 🚀 Implementation Guidelines

1. **Start with class-level documentation** - Always document the class purpose first
2. **Document constructors** - Explain dependencies and their purposes
3. **Document all public methods** - Include parameters, returns, and exceptions
4. **Add practical examples** - Show real usage scenarios
5. **Include error handling** - Document all possible exceptions
6. **Use consistent formatting** - Follow the established patterns
7. **Keep it updated** - Maintain documentation as code evolves

## 📖 Reference Examples

See the following files for complete JSDoc documentation examples:

### Service and Controller Layer
- `src/masters/cost-centers/cost-centers.service.ts`
- `src/masters/cost-centers/cost-centers.controller.ts`
- `src/masters/departments/departments.service.ts`
- `src/masters/departments/departments.controller.ts`
- `src/masters/divisions/divisions.service.ts`
- `src/masters/divisions/divisions.controller.ts`

### Repository and Persistence Layer
- `src/masters/cost-centers/persistence/repositories/cost-center.repository.ts`
- `src/masters/divisions/persistence/repositories/division.repository.ts`
- `src/masters/divisions/persistence/base-division.repository.ts`

### Domain and Entity Layer
- `src/masters/divisions/domain/division.ts`
- `src/masters/divisions/domain/find-all-division.ts`
- `src/masters/divisions/persistence/entities/division.entity.ts`

### Mapper and Module Layer
- `src/masters/divisions/persistence/mappers/division.mapper.ts`
- `src/masters/divisions/persistence/persistence.module.ts`

### DTO Layer
- `src/masters/divisions/dto/create-division.dto.ts`
- `src/masters/divisions/dto/update-division.dto.ts`
- `src/masters/divisions/dto/bulk-delete-divisions.dto.ts`
- `src/masters/divisions/dto/find-all-divisions.dto.ts`
- `src/masters/divisions/dto/division.dto.ts`
