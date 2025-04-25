export const userSheetColumns = [
  { header: 'ID', key: 'id' },
  { header: 'Name', key: 'name' },
  { header: 'Username', key: 'username' },
  { header: 'Email', key: 'email' },
  { header: 'Phone Number', key: 'phoneNumber' },
  { header: 'Referral Code', key: 'referralCode' },
  { header: 'Referrer Code', key: 'referrerCode' },
  { header: 'Joined', key: 'createdAt' },
];

export const userWithWalletSheetColumns = [
  { header: 'ID', key: 'id' },
  { header: 'Name', key: 'name' },
  { header: 'Username', key: 'username' },
  { header: 'Email', key: 'email' },
  { header: 'Phone Number', key: 'phoneNumber' },
  { header: 'Referral Code', key: 'referralCode' },
  { header: 'Referrer Code', key: 'referrerCode' },
  { header: 'Joined', key: 'createdAt' },
  { header: 'wallets', key: 'wallets' },
  { header: 'Managed wallet', key: 'managedWallet' },
];

export const DepositsSheetColumns = [
  // userId
  { header: 'ID', key: 'id' },
  { header: 'email', key: 'userId' },
  { header: 'Bank account', key: 'bankAccount' },
  { header: 'Total amount', key: 'totalAmount' },
  { header: 'Exchange rate', key: 'exchangeRate' },
  { header: 'Recipient wallet address', key: 'recipientWalletAddress' },
  { header: 'Status', key: 'status' },
  { header: 'ReferenceId', key: 'referenceId' },
  { header: 'Notes', key: 'notes' },
  { header: 'Created at', key: 'createdAt' },
];



export const withdrawSheetColumns = [
  // userId
  { header: 'ID', key: 'id' },
  { header: 'email', key: 'userId' },
  { header: 'Bank account', key: 'bankAccountName' },
  { header: 'Sent amount', key: 'sentAmount' },
  { header: 'Exchange rate', key: 'exchangeRate' },
  { header: 'Currency', key: 'currency' },
  { header: 'Status', key: 'status' },
  { header: 'ReferenceId', key: 'referenceId' },
  { header: 'Created at', key: 'createdAt' },
  { header: 'Notes', key: 'notes' },
];


export const interestedUserSheetColumns = [
  { header: 'ID', key: 'id' },
  { header: 'Name', key: 'name' },
  { header: 'Username', key: 'username' },
  { header: 'Email', key: 'email' },
  { header: 'Interested', key: 'interested' },
  { header: 'Joined', key: 'createdAt' },
];



export const affiliateCommissionsSheetColumns = [
  { header: 'id', key: 'id' },
  { header: '_id', key: '_id' },
  { header: 'buyerId', key: 'buyerId' },
  { header: 'status', key: 'status' },
  { header: 'assetId', key: 'assetId' },
  { header: 'referrerCode', key: 'referrerCode' },
  { header: 'fundraisingAddress', key: 'fundraisingAddress' },
  { header: 'quantity', key: 'quantity' },
  { header: 'unitPrice', key: 'unitPrice' },
  { header: 'commission', key: 'commission' },
  { header: 'hashAddress', key: 'hashAddress' },
  { header: 'Created At', key: 'createdAt' },
  { header: 'updated At', key: 'updatedAt' },
];


export const emailsSheetColumns = [
  { header: 'ID', key: 'id' },
  { header: 'Email Action', key: 'emailAction' },
  { header: 'From', key: 'from' },
  { header: 'To', key: 'to' },
  { header: 'Name', key: 'userName' },
  { header: 'Username', key: 'userUsername' },
  { header: 'Email', key: 'userEmail' },
  { header: 'Joined', key: 'createdAt' },
];


export const formsEventSheetColumns = [
  { header: 'ID', key: 'id' },
  { header: 'Name', key: 'name' },
  { header: 'Email', key: 'email' },
  { header: 'Phone Number', key: 'phoneNumber' },
  { header: 'Number Of Attendees', key: 'NumberOfAttendees' },
  { header: 'Form Type', key: 'formType' },
  { header: 'Created at', key: 'createdAt' },
];


export const assetReportSheetColumns = [
  { header: 'ID', key: 'id' },
  { header: 'Transaction Hash', key: 'transactionHash' },
  { header: 'Buyer', key: 'buyer' },
  { header: 'Amount', key: 'amount' },
  { header: 'Total', key: 'total' },
  { header: 'Currency', key: 'currency' },
  { header: 'Tag', key: 'tag' },
  { header: 'BuyToken:', key: 'buyToken' },
  { header: 'Email', key: 'email' },
  { header: 'Phone', key: 'phone' },
];


export const formsFundingEventSheetColumns = [
  { header: 'project name', key: 'projectName' },
  { header: 'project type', key: 'projectType' },
  { header: 'project location', key: 'projectLocation' },
  { header: 'project description', key: 'projectDescription' },
  { header: 'project visionAndGoals', key: 'projectVisionAndGoals' },
  { header: 'project totalCost', key: 'projectTotalCost' },
  { header: 'requested fundingAmount', key: 'requestedFundingAmount' },
  { header: 'business plans and budgets', key: 'businessPlansAndBudgets' },
  { header: 'project status', key: 'projectStatus' },
  { header: 'required permits', key: 'requiredPermits' },
  { header: 'building permits and studies', key: 'buildingPermitsAndStudies' },
  { header: 'project timeline', key: 'projectTimeline' },
  { header: 'additional supportNeeded', key: 'additionalSupportNeeded' },
  { header: 'video upload', key: 'videoUpload' },
  { header: 'work references', key: 'workReferences' },
  { header: 'information verification', key: 'informationVerification' },
  { header: 'name', key: 'name' },
  { header: 'email', key: 'email' },
  { header: 'phone number', key: 'phoneNumber' },
  { header: 'nationality', key: 'nationality' },
  { header: 'residence location', key: 'residenceLocation' },
  { header: 'createdAt', key: 'createdAt' },
  { header: 'updatedAt', key: 'updatedAt' },
]

export const emailSubscribersSheetColumns = [
  { header: 'email', key: 'email' },

]