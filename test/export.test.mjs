import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import ExcelJS from 'exceljs';
import { EXPORT_COLUMNS } from '../shared/contracts/contract-v1.mjs';
import { createExceptionRow, createExportRow, verifyExportWorkbook, writeExportWorkbook } from '../src/export/index.mjs';

const withTemporaryDirectory = async (run) => {
  const directory = await mkdtemp(join(tmpdir(), 'dewu-export-'));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

test('writer preserves the exact six headers, row mapping, and special Dewu size text', async () => {
  await withTemporaryDirectory(async (directory) => {
    const outputPath = join(directory, 'synthetic.xlsx');
    const result = await writeExportWorkbook({
      outputPath,
      rows: [{
        '货号': 'SYNTHETIC-1',
        '得物商品名': 'Synthetic shoe',
        '得物显示尺码': '40⅔',
        '得物卖价（元）': 899,
        '总销量': '169万+人付款',
        '异常或人工复核说明': ''
      }]
    });

    assert.deepEqual(result, { rows: 1, worksheetName: '得物结果' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(outputPath);
    const worksheet = workbook.getWorksheet('得物结果');
    assert.deepEqual(worksheet.getRow(1).values.slice(1), EXPORT_COLUMNS);
    assert.deepEqual(worksheet.getRow(2).values.slice(1), ['SYNTHETIC-1', 'Synthetic shoe', '40⅔', 899, '169万+人付款', '']);
  });
});

test('empty quote is blank while exception rows retain only SKU and explanation', async () => {
  const exception = createExceptionRow({ sku: 'SYNTHETIC-NO-QUOTE', note: '无报价' });
  assert.deepEqual(exception, {
    '货号': 'SYNTHETIC-NO-QUOTE',
    '得物商品名': '',
    '得物显示尺码': '',
    '得物卖价（元）': '',
    '总销量': '',
    '异常或人工复核说明': '无报价'
  });
  assert.equal(createExportRow({ '货号': 'SYNTHETIC-2', '得物卖价（元）': null })['得物卖价（元）'], '');
});

test('writer rejects invalid rows and silently excludes internal fields', () => {
  assert.throws(() => createExportRow({ '货号': '' }), /货号/);
  assert.throws(() => createExportRow({ '货号': 'SYNTHETIC-3', '得物卖价（元）': {} }), /得物卖价/);
  assert.deepEqual(Object.keys(createExportRow({ '货号': 'SYNTHETIC-4', evidenceHash: 'forbidden' })), EXPORT_COLUMNS);
});

test('verifier rejects formula and error cells', async () => {
  await withTemporaryDirectory(async (directory) => {
    const outputPath = join(directory, 'formula.xlsx');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('得物结果');
    worksheet.addRow(EXPORT_COLUMNS);
    worksheet.addRow(['SYNTHETIC-5', '', '', { formula: '1+1' }, '', '']);
    await workbook.xlsx.writeFile(outputPath);
    await assert.rejects(verifyExportWorkbook(outputPath), /formula or error cells/);

    const errorPath = join(directory, 'error.xlsx');
    const errorWorkbook = new ExcelJS.Workbook();
    const errorWorksheet = errorWorkbook.addWorksheet('得物结果');
    errorWorksheet.addRow(EXPORT_COLUMNS);
    errorWorksheet.addRow(['SYNTHETIC-6', '', '', { error: '#DIV/0!' }, '', '']);
    await errorWorkbook.xlsx.writeFile(errorPath);
    await assert.rejects(verifyExportWorkbook(errorPath), /formula or error cells/);
  });
});
