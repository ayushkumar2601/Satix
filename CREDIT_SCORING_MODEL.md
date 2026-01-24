# Alternative Credit Scoring Model Documentation

## Overview

This document describes the **Alternative Credit Scoring Model** developed for Satix, which assesses creditworthiness using non-traditional data sources for micro-lending decisions.

## Problem Statement

Develop an Alternative Credit Scoring Model that assesses creditworthiness using non-traditional data:
- ✅ Utility bill payments
- ✅ UPI transaction velocity
- ✅ Geolocation stability
- ✅ Social graph analysis

**Output:** A single 'Trust Score' (300-900) that banks can use for micro-lending.

---

## Model Architecture

### 1. Input Data Sources

#### A. Utility Bill Payments
- **Metrics Tracked:**
  - On-time payment ratio
  - Number of missed payments
  - Months of payment history
  - Average payment amount
  
#### B. UPI Transaction Velocity
- **Metrics Tracked:**
  - Average transactions per day
  - Transaction variance (low/medium/high)
  - Income consistency (low/medium/high)
  - Average monthly income
  - Average monthly expense
  - Cash flow ratio

#### C. Geolocation Stability
- **Metrics Tracked:**
  - Months at current location
  - Stability score (0-1)
  - Address verification status

#### D. Social Graph Analysis
- **Metrics Tracked:**
  - Network strength (low/medium/high)
  - Number of trust connections
  - Number of referrals
  - Network diversity

---

## 2. Scoring Methodology

### Component Scores (0-100 scale)

Each data source is scored independently on a 0-100 scale:

#### **Utility Payment Score (0-100)**
```
Base Score (0-50):  on_time_ratio × 50
Penalty:            missed_payments × 5 (max -20)
History Bonus:      12+ months = +20, 6+ = +15, 3+ = +10
Consistency Bonus:  +10 for regular payments
Perfect Record:     +10 for zero missed payments (6+ months)
```

#### **UPI Velocity Score (0-100)**
```
Frequency (0-25):   (avg_txn_per_day / 10) × 25
Income (0-30):      high = 30, medium = 20, low = 10
Variance (0-20):    low = 20, medium = 12, high = 5
Cash Flow (0-15):   ratio ≥1.3 = 15, ≥1.1 = 10, ≥1.0 = 5
Regular Income:     +10 bonus for high consistency + income >5000
```

#### **Location Stability Score (0-100)**
```
Base (0-50):        stability_score × 50
Duration (0-30):    24+ months = 30, 12+ = 20, 6+ = 10
Verification:       +20 for verified stable address (6+ months)
```

#### **Social Graph Score (0-100)**
```
Network (0-40):     high = 40, medium = 25, low = 10
Connections (0-30): trust_connections × 3 (max 30)
Referrals (0-20):   referrals_count × 5 (max 20)
Diversity:          +10 for 5+ connections with strong network
```

---

## 3. Weighted Composite Score

### Model Weights (Research-Based)

```
Utility Payment:      35%  (Most reliable indicator)
UPI Velocity:         30%  (Transaction behavior)
Location Stability:   20%  (Residential stability)
Social Graph:         15%  (Network trust)
────────────────────────
Total:               100%
```

### Composite Score Calculation

```
Composite = (Utility × 0.35) + (UPI × 0.30) + (Location × 0.20) + (Social × 0.15)
```

Result: 0-100 scale

---

## 4. Trust Score Transformation

The composite score (0-100) is transformed to Trust Score (300-900):

```
Trust Score = 300 + (Composite / 100) × 600
```

**Range:** 300 (lowest) to 900 (highest)

---

## 5. Risk Categorization

| Trust Score | Risk Category | Description |
|-------------|---------------|-------------|
| 750-900 | LOW | Excellent creditworthiness |
| 650-749 | MEDIUM | Good creditworthiness |
| 550-649 | HIGH | Fair creditworthiness |
| 300-549 | VERY HIGH | Poor creditworthiness |

---

## 6. Loan Eligibility Matrix

| Trust Score | Min Loan | Max Loan | Interest Rate | Tenure |
|-------------|----------|----------|---------------|--------|
| 750+ | ₹10,000 | ₹50,000 | 12% | 12 months |
| 650-749 | ₹5,000 | ₹25,000 | 15% | 9 months |
| 550-649 | ₹2,000 | ₹10,000 | 18% | 6 months |
| 450-549 | ₹1,000 | ₹5,000 | 22% | 3 months |
| <450 | ₹0 | ₹2,000 | 24% | 3 months |

**Note:** Max loan amount is adjusted by confidence level (data completeness).

---

## 7. Confidence Level Calculation

Measures data completeness and reliability:

```
Utility Confidence (35%):
  - 6+ months data = 0.35
  - 3+ months data = 0.25
  - Any data = 0.15

UPI Confidence (30%):
  - 3+ txn/day = 0.30
  - 1+ txn/day = 0.20
  - Any data = 0.10

Location Confidence (20%):
  - 6+ months = 0.20
  - 3+ months = 0.15
  - Any data = 0.10

Social Confidence (15%):
  - 3+ connections = 0.15
  - 1+ connections = 0.10
  - Any data = 0.05

Total Confidence = Sum / Max Possible
```

**Loan Adjustment:** `Max Loan = Base Max × Confidence Level`

---

## 8. Model Output

```typescript
{
  trust_score: 742,                    // 300-900
  risk_category: "MEDIUM",             // LOW/MEDIUM/HIGH/VERY_HIGH
  component_scores: {
    utility_score: 88,                 // 0-100
    upi_velocity_score: 72,            // 0-100
    location_stability_score: 90,      // 0-100
    social_graph_score: 65             // 0-100
  },
  weighted_scores: {
    utility_weighted: 30.8,            // Component × Weight
    upi_weighted: 21.6,
    location_weighted: 18.0,
    social_weighted: 9.75
  },
  explanations: {
    utility: "Excellent payment discipline...",
    upi: "Stable transaction activity...",
    location: "Strong residential stability...",
    social: "Good social trust network..."
  },
  loan_eligibility: {
    min_amount: 5000,
    max_amount: 25000,
    interest_rate: 15,
    recommended_tenure_months: 9
  },
  confidence_level: 85                 // 0-100%
}
```

---

## 9. Model Advantages

### ✅ Financial Inclusion
- Serves credit-invisible population
- No traditional credit history required
- Based on actual financial behavior

### ✅ Explainability
- Clear component scores
- Human-readable explanations
- Transparent weighting system

### ✅ Fairness
- Objective, data-driven
- No demographic bias
- Equal opportunity assessment

### ✅ Real-time
- Instant score calculation
- No external API dependencies
- Deterministic and reproducible

### ✅ Regulatory Compliance
- Auditable scoring logic
- Documented methodology
- Explainable to regulators

---

## 10. Use Cases

### For Banks/Lenders
- Micro-lending decisions (₹1,000 - ₹50,000)
- Risk-based pricing
- Portfolio management
- Fraud detection

### For Users
- Access to credit without traditional history
- Transparent scoring process
- Actionable feedback for improvement
- Fair assessment

---

## 11. Model Validation

### Testing Scenarios

**Scenario 1: Excellent User**
- 12 months utility history, 100% on-time
- 5 UPI txn/day, high income consistency
- 24 months at location
- 10 trust connections
- **Expected Score:** 800-850

**Scenario 2: Good User**
- 6 months utility history, 90% on-time
- 3 UPI txn/day, medium consistency
- 12 months at location
- 5 trust connections
- **Expected Score:** 650-750

**Scenario 3: Fair User**
- 3 months utility history, 80% on-time
- 1 UPI txn/day, low consistency
- 6 months at location
- 2 trust connections
- **Expected Score:** 550-650

**Scenario 4: Poor User**
- 1 month utility history, 60% on-time
- Irregular UPI activity
- 2 months at location
- 0 trust connections
- **Expected Score:** 400-500

---

## 12. Future Enhancements

### Planned Improvements
1. **Machine Learning Layer:** Train on historical loan performance data
2. **Dynamic Weights:** Adjust weights based on regional patterns
3. **Fraud Detection:** Add anomaly detection algorithms
4. **Behavioral Patterns:** Analyze spending categories
5. **Credit Bureau Integration:** Hybrid scoring when available

### Additional Data Sources
- Rent payment history
- Insurance premium payments
- Mobile recharge patterns
- E-commerce purchase behavior
- Educational loan repayment

---

## 13. Implementation

### File Location
```
lib/models/credit-scoring-model.ts
```

### Usage
```typescript
import { AlternativeCreditScoringModel } from '@/lib/models/credit-scoring-model'

const features = await extractAllFeatures(userId)
const result = AlternativeCreditScoringModel.calculateTrustScore(features)

console.log('Trust Score:', result.trust_score)
console.log('Risk Category:', result.risk_category)
console.log('Loan Eligibility:', result.loan_eligibility)
```

---

## 14. Model Version

**Current Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Conclusion

This Alternative Credit Scoring Model provides a robust, explainable, and fair method for assessing creditworthiness using non-traditional data. It enables financial inclusion while maintaining risk management standards suitable for micro-lending operations.
