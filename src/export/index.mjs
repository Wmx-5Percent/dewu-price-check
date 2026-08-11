import { access } from 'node:fs/promises';
import ExcelJS from 'exceljs';
import { EXPORT_COLUMNS } from '../../shared/contracts/contract-v1.mjs';

const worksheetName = '得物结果';

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const requiredString = (value, column) => {
  if (typeof value !== 'string') {
    throw new TypeError(`${column} must be a string`);
  }
  return value;
};

export const createExportRow = (record) => {
  if (!isPlainObject(record)) {
    throw new TypeError('export record must be an object');
  }

  const row = {
    '货号': requiredString(record['货号'], '货号'),
    '得物商品名': requiredString(record['得物商品名'] ?? '', '得物商品名'),
    '得物显示尺码': requiredString(record['得物显示尺码'] ?? '', '得物显示尺码'),
    '得物卖价（元）': record['得物卖价（元）'] ?? '',
    '总销量': requiredString(record['总销量'] ?? '', '总销量'),
    '异常或人工复核说明': requiredString(record['异常或人工复核说明'] ?? '', '异常或人工复核说明')
  };

  if (row['货号'].trim() === '') {
    throw new TypeError('货号 must not be empty');
  }
  if (typeof row['得物卖价（元）'] !== 'string' && typeof row['得物卖价（元）'] !== 'number') {
    throw new TypeError('得物卖价（元） must be a string, number, or null');
  }

  return row;
};

export const createExceptionRow = ({ sku, note }) => createExportRow({
  '货号': sku,
  '异常或人工复核说明': note
});

const formulaOrErrorCells = (worksheet) => {
  const findings = [];
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      const value = cell.value;
      if (cell.type === ExcelJS.ValueType.Error || (isPlainObject(value) && 'formula' in value)) {
        findings.push(cell.address);
      }
    });
  });
  return findings;
};

export const verifyExportWorkbook = async (outputPath) => {
  await access(outputPath);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(outputPath);

  if (workbook.worksheets.length !== 1) {
    throw new Error('export workbook must contain exactly one worksheet');
  }

  const worksheet = workbook.getWorksheet(worksheetName);
  if (!worksheet) {
    throw new Error(`export workbook must contain worksheet ${worksheetName}`);
  }

  const headers = worksheet.getRow(1).values.slice(1);
  if (headers.length !== EXPORT_COLUMNS.length || headers.some((header, index) => header !== EXPORT_COLUMNS[index])) {
    throw new Error('export workbook headers must exactly match the six-column contract');
  }

  const findings = formulaOrErrorCells(worksheet);
  if (findings.length > 0) {
    throw new Error(`export workbook contains formula or error cells: ${findings.join(', ')}`);
  }

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    if (row.cellCount !== EXPORT_COLUMNS.length) {
      throw new Error(`export workbook row ${rowNumber} must contain exactly six cells`);
    }
  });

  return { rows: Math.max(worksheet.rowCount - 1, 0), worksheetName };
};

export const writeExportWorkbook = async ({ rows, outputPath }) => {
  if (!Array.isArray(rows)) {
    throw new TypeError('rows must be an array');
  }

  const exportRows = rows.map(createExportRow);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(worksheetName);
  worksheet.addRow(EXPORT_COLUMNS);
  for (const row of exportRows) {
    worksheet.addRow(EXPORT_COLUMNS.map((column) => row[column]));
  }

  await workbook.xlsx.writeFile(outputPath);
  return verifyExportWorkbook(outputPath);
};
