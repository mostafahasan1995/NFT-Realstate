import exceljs from 'exceljs';
import {
  affiliateCommissionsSheetColumns,
  assetReportSheetColumns,
  DepositsSheetColumns,
  emailsSheetColumns,
  emailSubscribersSheetColumns,
  formsEventSheetColumns,
  formsFundingEventSheetColumns,
  interestedUserSheetColumns,
  userSheetColumns,
  userWithWalletSheetColumns,
  withdrawSheetColumns
} from '../column/worksheet-columns';
import { File } from '../../file/schemas/file.schema';

export function createUserWorkbook(data, fileName) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet(fileName);

  // Add column headers to the worksheet
  worksheet.columns = userSheetColumns;
  // Add data rows to the worksheet
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const itemWithId = { id: i + 1, ...item.toObject() };
    worksheet.addRow(itemWithId);
  }
  return workbook;
}

export function createUserWithWalletWorkbook(data, fileName) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet(fileName);
  // Add column headers to the worksheet
  worksheet.columns = userWithWalletSheetColumns
  // Add data rows to the worksheet
  for (let i = 0; i < data.length; i++) {
    const item: any = formatValues(data[i]);
    const itemWithId = { id: i + 1, ...item };
    worksheet.addRow(itemWithId);
  }

  return workbook;
}

function formatValues(item: Record<string, any>) {
  const data = item._doc || item;
  return Object.entries(data).reduce((acc, [k, v]: [string, any]) => {
    if (Array.isArray(v)) v = v.join(', ');
    if (typeof v === 'object' && k === 'managedWallet') v = v.address;
    acc[k] = v;
    return acc;
  }, {});
}

export function createDepositsWorkbook(data, fileName) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet(fileName);
  // Add column headers to the worksheet
  worksheet.columns = DepositsSheetColumns;

  // Add data rows to the worksheet
  for (let i = 0; i < data.length; i++) {
    const item = { ...data[i].toObject(), ...{ userId: data[i].userId.email } };
    const itemWithId = { id: i + 1, ...item };
    worksheet.addRow(itemWithId);
  }

  return workbook;
}

export function createWithdrawWorkbook(data, fileName) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet(fileName);
  // Add column headers to the worksheet
  worksheet.columns = withdrawSheetColumns;

  // Add data rows to the worksheet
  for (let i = 0; i < data.length; i++) {
    const item = { ...data[i].toObject(), ...{ userId: data[i].userId.email } };
    const itemWithId = { id: i + 1, ...item };
    worksheet.addRow(itemWithId);
  }
  return workbook;
}

export function createInterestedUserWorkbook(data, fileName) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet(fileName);

  // Add column headers to the worksheet
  worksheet.columns = interestedUserSheetColumns;
  // Add data rows to the worksheet
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const itemWithId = { id: i + 1, ...item };
    worksheet.addRow(itemWithId);
  }

  return workbook;
}

export function createAffiliateCommissionsWorkbook(data, fileName) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet(fileName);
  // Add column headers to the worksheet
  worksheet.columns = affiliateCommissionsSheetColumns;
  // Add data rows to the worksheet
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const itemWithId = { id: i + 1, ...item.toObject() };
    worksheet.addRow(itemWithId);
  }
  return workbook;
}

export function createEmailsWorkbook(data, fileName) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet(fileName);

  // Add column headers to the worksheet
  worksheet.columns = emailsSheetColumns;
  // Add data rows to the worksheet
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const itemWithId = { id: i + 1, ...item };
    worksheet.addRow(itemWithId);
  }

  return workbook;
}

export function createFormsEventWorkbook(data, fileName) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet(fileName);
  // Add column headers to the worksheet
  worksheet.columns = formsEventSheetColumns;

  // Add data rows to the worksheet
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const itemWithId = { id: i + 1, ...item.toObject() };
    worksheet.addRow(itemWithId);
  }

  return workbook;
}


export function createFormsFundingEventWorkbook(data, fileName) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet(fileName);
  // Add column headers to the worksheet
  worksheet.columns = formsFundingEventSheetColumns;
  const convertFileObject2Url = (files: File[]) => files?.map(file => file)
  // Add data rows to the worksheet
  for (let i = 0; i < data.length; i++) {
    const item = {
      ...data[i].toObject(),
      ...data[i].contactId.toObject(),
      businessPlansAndBudgets: convertFileObject2Url(data[i]?.businessPlansAndBudgets),
      buildingPermitsAndStudies: convertFileObject2Url(data[i]?.buildingPermitsAndStudies),
      videoUpload: data[i]?.videoUpload?.url,
    }
    const itemWithId = { id: i + 1, ...item };
    worksheet.addRow(itemWithId);
  }

  return workbook;
}



export function createAssetReportWorkbook(data, fileName) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet(fileName);
  worksheet.columns = assetReportSheetColumns;

  let i = 0;
  for (const address in data) {
    const item = data[address];
    const itemWithId = {
      id: i++,
      transactionHash: item.transactionHash ? item.transactionHash.join(', ') : '',
      buyer: item.buyer,
      amount: item.amount.toString(),
      tag: item.tag ? item.tag.join(', ') : '',
      buyToken: item.buyToken ? item.buyToken.join(', ') : '',
      email: item.user?.email ?? '',
      phone: item.user?.phoneNumber ?? '',
      total: item.total,
      currency: item.currency.join(', ') ?? '',
    };
    worksheet.addRow(itemWithId);
  }
  return workbook;
}



export function createEmailSubscriberWorkbook(data: { email: string }[], fileName: string) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet(fileName);
  worksheet.columns = emailSubscribersSheetColumns;

  let i = 0;
  for (const { email } of data) {
    const itemWithId = { id: i++, email };
    worksheet.addRow(itemWithId);
  }
  return workbook
}
