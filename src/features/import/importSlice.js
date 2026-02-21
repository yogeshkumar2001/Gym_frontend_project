import { createSlice } from '@reduxjs/toolkit';

// ─── Mock CSV headers (simulates what would be parsed from a real file) ────────
export const MOCK_CSV_HEADERS = ['Name', 'Mobile', 'PlanType', 'StartDate', 'Amount', 'Email'];

// ─── Mock CSV rows (simulates file parsing output) ────────────────────────────
export const MOCK_CSV_ROWS = [
  { Name: 'Arjun Sharma',    Mobile: '9876543210', PlanType: 'monthly',   StartDate: '2024-01-15', Amount: '49.99',  Email: 'arjun@example.com'   },
  { Name: 'Priya Patel',     Mobile: '9123456789', PlanType: 'quarterly', StartDate: '2024-02-01', Amount: '129.99', Email: 'priya@example.com'   },
  { Name: 'Ravi Kumar',      Mobile: '',           PlanType: 'monthly',   StartDate: '2024-01-20', Amount: '49.99',  Email: ''                    },
  { Name: 'Sunita Gupta',    Mobile: '9988776655', PlanType: 'annually',  StartDate: '2024-03-10', Amount: '449.99', Email: 'sunita@example.com'  },
  { Name: '',                Mobile: '9012345678', PlanType: 'monthly',   StartDate: '2024-02-15', Amount: '49.99',  Email: ''                    },
  { Name: 'Amit Singh',      Mobile: '9345678901', PlanType: 'quarterly', StartDate: 'invalid-dt', Amount: '129.99', Email: 'amit@example.com'    },
  { Name: 'Kavya Reddy',     Mobile: '9456789012', PlanType: 'monthly',   StartDate: '2024-04-05', Amount: 'abc',    Email: 'kavya@example.com'   },
  { Name: 'Deepak Joshi',    Mobile: '9567890123', PlanType: 'annually',  StartDate: '2024-05-01', Amount: '449.99', Email: 'deepak@example.com'  },
  { Name: 'Nisha Verma',     Mobile: '9678901234', PlanType: 'monthly',   StartDate: '2024-01-25', Amount: '49.99',  Email: 'nisha@example.com'   },
  { Name: 'Rajesh Nair',     Mobile: '9789012345', PlanType: 'quarterly', StartDate: '2024-03-20', Amount: '129.99', Email: 'rajesh@example.com'  },
  { Name: 'Pooja Iyer',      Mobile: '9890123456', PlanType: 'annually',  StartDate: '2024-06-01', Amount: '449.99', Email: 'pooja@example.com'   },
  { Name: 'Suresh Pillai',   Mobile: '9901234567', PlanType: 'monthly',   StartDate: '2024-02-28', Amount: '49.99',  Email: ''                    },
  { Name: 'Meena Krishnan',  Mobile: '9012345670', PlanType: 'quarterly', StartDate: '2024-04-15', Amount: '129.99', Email: 'meena@example.com'   },
  { Name: 'Vikram Bose',     Mobile: '9123456780', PlanType: 'monthly',   StartDate: '2024-05-10', Amount: '49.99',  Email: 'vikram@example.com'  },
  { Name: 'Anita Desai',     Mobile: '9234567891', PlanType: 'annually',  StartDate: '2024-03-25', Amount: '449.99', Email: 'anita@example.com'   },
];

// ─── Default column mapping (CSV header → system field) ───────────────────────
export const DEFAULT_COLUMN_MAPPING = {
  fullName:    'Name',
  phone:       'Mobile',
  email:       'Email',
  plan:        'PlanType',
  joiningDate: 'StartDate',
  expiryDate:  '',
  feeAmount:   'Amount',
  status:      '',
};

// ─── System fields metadata (for mapping UI) ──────────────────────────────────
export const SYSTEM_FIELDS = [
  { key: 'fullName',    label: 'Full Name',    required: true  },
  { key: 'phone',       label: 'Phone',        required: true  },
  { key: 'email',       label: 'Email',        required: false },
  { key: 'plan',        label: 'Plan',         required: false },
  { key: 'joiningDate', label: 'Joining Date', required: false },
  { key: 'expiryDate',  label: 'Expiry Date',  required: false },
  { key: 'feeAmount',   label: 'Fee Amount',   required: false },
  { key: 'status',      label: 'Status',       required: false },
];

// ─── Initial state ─────────────────────────────────────────────────────────────
const initialState = {
  fileName:         null,
  parsedData:       [],          // Raw rows from CSV (array of objects keyed by CSV headers)
  columnMapping:    { ...DEFAULT_COLUMN_MAPPING },
  mappedData:       [],          // Rows after applying columnMapping
  validationResult: [],          // [{rowIndex, ...row, isValid, errors}]
  importSummary: {
    total:   0,
    success: 0,
    failed:  0,
  },
  loading:     false,
  currentStep: 0,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const importSlice = createSlice({
  name: 'import',
  initialState,
  reducers: {
    setFileName:         (state, action) => { state.fileName = action.payload; },
    setParsedData:       (state, action) => { state.parsedData = action.payload; },
    setColumnMapping:    (state, action) => { state.columnMapping = action.payload; },
    setMappedData:       (state, action) => { state.mappedData = action.payload; },
    setValidationResult: (state, action) => { state.validationResult = action.payload; },
    setImportSummary:    (state, action) => { state.importSummary = action.payload; },
    setLoading:          (state, action) => { state.loading = action.payload; },
    setCurrentStep:      (state, action) => { state.currentStep = action.payload; },
    resetImport:         ()              => initialState,
  },
});

export const {
  setFileName,
  setParsedData,
  setColumnMapping,
  setMappedData,
  setValidationResult,
  setImportSummary,
  setLoading,
  setCurrentStep,
  resetImport,
} = importSlice.actions;

export default importSlice.reducer;
