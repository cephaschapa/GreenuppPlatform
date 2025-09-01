# TODO Tracking and Technical Debt

This document tracks all TODO items and technical debt found in the codebase. Items are categorized by priority and impact.

## High Priority TODOs

### Security & Authorization

- **File**: `server/controllers/PlantAnalysisController.ts:66`

  - **Issue**: Missing field ownership verification
  - **Impact**: Security vulnerability - users could access other users' field data
  - **Action Required**: Implement field ownership check before returning analyses

- **File**: `server/controllers/PlantAnalysisController.ts:77`
  - **Issue**: Missing crop ownership verification
  - **Impact**: Security vulnerability - users could access other users' crop data
  - **Action Required**: Implement crop ownership check before returning analyses

### Core Functionality

- **File**: `server/models/PestDiseaseModel.ts:187`
  - **Issue**: Geographical distance calculation not implemented
  - **Impact**: Location-based pest reporting is inaccurate
  - **Action Required**: Implement proper geographical distance calculation using PostGIS or similar

## Medium Priority TODOs

### Data Integration

- **File**: `server/models/PestDiseaseModel.ts:370-375`

  - **Issue**: Weather data integration missing
  - **Impact**: Risk assessment lacks weather-based factors
  - **Action Required**: Integrate with weather API for real-time data

- **File**: `server/models/PestDiseaseModel.ts:374`

  - **Issue**: Seasonal risk calculation not implemented
  - **Impact**: Risk assessment lacks seasonal patterns
  - **Action Required**: Implement seasonal risk calculation based on historical data

- **File**: `server/models/PestDiseaseModel.ts:375`
  - **Issue**: Geographic proximity calculation missing
  - **Impact**: Risk assessment lacks geographic outbreak patterns
  - **Action Required**: Calculate based on known outbreak locations

### Notification System

- **File**: `server/services/pest-alert-service.ts:276`

  - **Issue**: Expert email list hardcoded
  - **Impact**: Limited notification reach to experts
  - **Action Required**: Create experts table and management interface

- **File**: `server/routes/pest-outbreaks.ts:332`
  - **Issue**: No resolution notifications to farmers
  - **Impact**: Poor user communication when outbreaks are resolved
  - **Action Required**: Implement notification system for outbreak resolution

### Settings Management

- **File**: `server/models/SettingsModel.ts:75-76`

  - **Issue**: Settings table not implemented
  - **Impact**: User preferences not persisted
  - **Action Required**: Create settings table and CRUD operations

- **File**: `server/models/SettingsModel.ts:86`
  - **Issue**: Settings persistence not implemented
  - **Impact**: User preference changes not saved
  - **Action Required**: Implement database persistence for user settings

## Low Priority TODOs

### API Implementation

- **File**: `client/src/pages/farmer/DealerDirectoryPage.tsx:310`

  - **Issue**: Mock API call needs replacement
  - **Impact**: Dealers directory using mock data
  - **Action Required**: Implement real API endpoint for dealers

- **File**: `client/src/pages/farmer/ExpertDirectoryPage.tsx:220`
  - **Issue**: Mock API call needs replacement
  - **Impact**: Experts directory using mock data
  - **Action Required**: Implement real API endpoint for experts

### UI/UX Improvements

- **File**: `client/src/components/Footer.tsx:165-183`

  - **Issue**: Placeholder phone numbers
  - **Impact**: Users see fake contact information
  - **Action Required**: Update with real contact information

- **File**: `client/src/pages/farmer/ListCropOnMarketplace.tsx:607`

  - **Issue**: Placeholder phone format
  - **Impact**: Minor UX issue with placeholder text
  - **Action Required**: Update placeholder format

- **File**: `client/src/components/checkout/MetatronPayment.tsx:352`

  - **Issue**: Placeholder phone format
  - **Impact**: Minor UX issue with placeholder text
  - **Action Required**: Update placeholder format

- **File**: `update-phone.js:10`
  - **Issue**: Placeholder phone number in script
  - **Impact**: Script won't work without manual update
  - **Action Required**: Update script to use actual phone number or make configurable

## Resolved Items

_(Items will be moved here when completed)_

## Notes

- Priority levels are based on security impact and core functionality requirements
- All security-related TODOs should be addressed immediately
- Data integration TODOs can be addressed incrementally
- UI/UX TODOs can be handled in maintenance cycles

Last Updated: $(date)
