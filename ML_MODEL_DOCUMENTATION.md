# Machine Learning Credit Scoring Model - Complete Documentation

## 🎯 Overview

The ML Credit Scoring Model is a **self-learning system** that continuously improves from loan outcomes. It combines rule-based scoring with machine learning to provide increasingly accurate credit assessments.

---

## 🧠 How It Works

### Hybrid Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER DATA INPUT                       │
│  (Utility, UPI, Location, Social)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              FEATURE EXTRACTION                          │
│  Deterministic metrics from raw data                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  RULE-BASED      │    │   ML MODEL       │
│  MODEL           │    │  (if trained)    │
│  • Fixed weights │    │  • Learned       │
│  • Deterministic │    │    weights       │
│  • Always works  │    │  • Adaptive      │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  TRUST SCORE OUTPUT                      │
│  • Score (300-900)                                      │
│  • Default probability                                  │
│  • Risk category                                        │
│  • Loan eligibility                                     │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  LOAN OUTCOME                            │
│  User repays or defaults                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              ML MODEL LEARNS                             │
│  Updates weights based on outcome                       │
│  Improves for next prediction                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Machine Learning Algorithm

### Logistic Regression with Online Learning

**Why Logistic Regression?**
- ✅ Interpretable (can explain decisions)
- ✅ Fast training and prediction
- ✅ Works well with limited data
- ✅ Provides probability estimates
- ✅ Suitable for binary classification (repay/default)

### Mathematical Model

```
P(repay) = 1 / (1 + e^(-z))

where:
z = β₀ + β₁·utility + β₂·upi + β₃·location + β₄·social

β₀ = intercept (learned)
β₁, β₂, β₃, β₄ = coefficients (learned)
```

### Online Learning Process

**Step 1: Make Prediction**
```
predicted_prob = sigmoid(β₀ + Σ(βᵢ · xᵢ))
```

**Step 2: Observe Actual Outcome**
```
actual = 1 (repaid) or 0 (default)
```

**Step 3: Calculate Error**
```
error = actual - predicted
```

**Step 4: Update Weights (Gradient Descent)**
```
β₀ = β₀ + α · error
βᵢ = βᵢ + α · error · xᵢ

where α = learning rate (0.01)
```

**Step 5: Normalize Weights**
```
Ensure weights sum to 1.0 for interpretability
```

---

## 🔄 Learning Lifecycle

### Phase 1: Bootstrap (0-10 samples)
- **Model Used:** Rule-based only
- **Weights:** Fixed (35%, 30%, 20%, 15%)
- **Confidence:** Low
- **Action:** Collect loan outcomes

### Phase 2: Initial Learning (10-100 samples)
- **Model Used:** ML model activated
- **Weights:** Starting to adapt
- **Confidence:** Medium (10-50%)
- **Action:** Weights adjust based on outcomes

### Phase 3: Mature Model (100-1000 samples)
- **Model Used:** ML model primary
- **Weights:** Well-optimized
- **Confidence:** High (50-90%)
- **Action:** Fine-tuning continues

### Phase 4: Production (1000+ samples)
- **Model Used:** ML model fully trained
- **Weights:** Highly optimized
- **Confidence:** Very High (90-100%)
- **Action:** Continuous improvement

---

## 📈 Model Performance Metrics

### Accuracy Tracking

```typescript
{
  training_samples: 1000,
  learned_weights: {
    utility: 0.38,    // Increased from 0.35
    upi: 0.32,        // Increased from 0.30
    location: 0.18,   // Decreased from 0.20
    social: 0.12      // Decreased from 0.15
  },
  confidence: 95,     // 95% confidence
  default_probability: 0.15  // 15% chance of default
}
```

### Key Metrics

1. **Accuracy:** % of correct predictions
2. **Precision:** % of predicted defaults that actually defaulted
3. **Recall:** % of actual defaults that were predicted
4. **F1 Score:** Harmonic mean of precision and recall

---

## 🎓 Training the Model

### Method 1: Automatic (Production)

When a loan is completed:
```typescript
// Automatically called when loan status changes
await recordLoanOutcome(userId, loanId, repaid, repaymentRate)
```

### Method 2: Batch Training (Historical Data)

Train from all historical loans:
```typescript
// API: POST /api/ml/train
await trainModelFromHistory()
```

### Method 3: Simulation (Demo/Testing)

Generate synthetic training data:
```typescript
// API: POST /api/ml/train
// Body: { mode: 'simulate', samples: 100 }
await simulateLoanOutcomes(100)
```

---

## 🔌 API Endpoints

### 1. Record Loan Outcome
```http
POST /api/ml/record-outcome
Content-Type: application/json

{
  "userId": "uuid",
  "loanId": "uuid",
  "repaid": true,
  "repaymentRate": 0.95
}
```

**Response:**
```json
{
  "success": true,
  "message": "Loan outcome recorded and model updated"
}
```

### 2. Get Model Statistics
```http
GET /api/ml/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "current_weights": {
      "utility": 0.38,
      "upi": 0.32,
      "location": 0.18,
      "social": 0.12
    },
    "training_samples": 1000,
    "model_version": "1.0-ML",
    "confidence": 95
  }
}
```

### 3. Train Model
```http
POST /api/ml/train
Content-Type: application/json

{
  "mode": "simulate",
  "samples": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Simulated 100 loan outcomes and trained model",
  "samples_trained": 100,
  "learned_weights": {
    "utility": 0.36,
    "upi": 0.31,
    "location": 0.19,
    "social": 0.14
  }
}
```

---

## 💾 Database Schema

### loan_outcomes Table
```sql
CREATE TABLE loan_outcomes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  loan_id UUID,
  trust_score INTEGER NOT NULL,
  component_scores JSONB NOT NULL,
  loan_amount DECIMAL(10, 2) NOT NULL,
  repaid BOOLEAN NOT NULL,
  default_occurred BOOLEAN NOT NULL,
  repayment_rate DECIMAL(5, 4),
  created_at TIMESTAMP
);
```

### ml_model_stats Table
```sql
CREATE TABLE ml_model_stats (
  id UUID PRIMARY KEY,
  weights JSONB NOT NULL,
  coefficients JSONB NOT NULL,
  training_samples INTEGER NOT NULL,
  model_version TEXT NOT NULL,
  learning_rate DECIMAL(5, 4) NOT NULL,
  created_at TIMESTAMP
);
```

---

## 🎯 Example Learning Scenario

### Initial State (No Training)
```
Weights: utility=35%, upi=30%, location=20%, social=15%
Training Samples: 0
Confidence: 0%
```

### After 10 Loans
```
User A: Score 750, Repaid ✓
User B: Score 650, Repaid ✓
User C: Score 550, Defaulted ✗
User D: Score 800, Repaid ✓
...

Learned Pattern: Higher utility scores correlate with repayment
New Weights: utility=37%, upi=29%, location=20%, social=14%
Training Samples: 10
Confidence: 10%
```

### After 100 Loans
```
Learned Patterns:
- UPI consistency is strong predictor
- Location stability matters less than expected
- Social graph has limited impact

New Weights: utility=38%, upi=32%, location=18%, social=12%
Training Samples: 100
Confidence: 50%
```

### After 1000 Loans
```
Highly Optimized Weights: utility=39%, upi=33%, location=17%, social=11%
Training Samples: 1000
Confidence: 95%
Accuracy: 92%
```

---

## ✨ Key Advantages

### 1. Self-Improving
- ✅ Gets smarter with every loan
- ✅ Adapts to real-world patterns
- ✅ No manual retraining needed

### 2. Explainable
- ✅ Clear weight adjustments
- ✅ Transparent learning process
- ✅ Auditable decisions

### 3. Fast
- ✅ Online learning (instant updates)
- ✅ No batch retraining delays
- ✅ Real-time predictions

### 4. Robust
- ✅ Falls back to rule-based if untrained
- ✅ Gradual improvement (no sudden changes)
- ✅ Stable and reliable

### 5. Production-Ready
- ✅ Handles missing data
- ✅ Scales to millions of users
- ✅ Low computational cost

---

## 🚀 Getting Started

### Step 1: Run Database Migration
```bash
# Apply ML schema
psql -h your-db-host -d your-db -f supabase-ml-schema.sql
```

### Step 2: Simulate Training Data (Demo)
```bash
curl -X POST http://localhost:3000/api/ml/train \
  -H "Content-Type: application/json" \
  -d '{"mode": "simulate", "samples": 100}'
```

### Step 3: Check Model Stats
```bash
curl http://localhost:3000/api/ml/stats
```

### Step 4: Calculate Trust Score
```bash
# ML model will be used automatically if trained
curl -X POST http://localhost:3000/api/trust-score/calculate
```

---

## 📊 Monitoring & Maintenance

### Check Model Health
```typescript
const stats = await getMLModelStats()
console.log('Training Samples:', stats.training_samples)
console.log('Confidence:', stats.confidence + '%')
console.log('Learned Weights:', stats.learned_weights)
```

### Reset Model (if needed)
```typescript
MLCreditScoringModel.resetModel()
```

### Retrain from Scratch
```typescript
await trainModelFromHistory()
```

---

## 🎓 Future Enhancements

### Planned Features
1. **Advanced Algorithms**
   - Neural networks
   - Random forests
   - Gradient boosting

2. **Feature Engineering**
   - Interaction terms
   - Polynomial features
   - Time-series patterns

3. **Ensemble Methods**
   - Combine multiple models
   - Voting classifiers
   - Stacking

4. **Real-time Monitoring**
   - Model drift detection
   - Performance dashboards
   - Automated retraining

---

## 📝 Summary

The ML Credit Scoring Model provides:
- ✅ **Self-learning** from loan outcomes
- ✅ **Adaptive weights** that improve over time
- ✅ **Default probability** predictions
- ✅ **Explainable** decisions
- ✅ **Production-ready** implementation

**Status:** ✅ Complete and Deployed  
**Version:** 1.0-ML  
**Last Updated:** January 2026
