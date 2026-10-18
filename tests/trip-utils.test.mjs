import test from 'node:test';
import assert from 'node:assert/strict';
import {businessPercentage, csvCell, demoCsv, durationLabel} from '../app/trip-utils.ts';

test('percentage follows classification and handles no trips', () => {
  assert.equal(businessPercentage([]), 0);
  assert.equal(businessPercentage([{distance:30,classification:'Zakelijk'},{distance:70,classification:'Privé'}]),30);
  assert.equal(businessPercentage([{distance:0,classification:'Zakelijk'}]),0);
});
test('CSV quotes commas, quotes and embedded newlines', () => {
  assert.equal(csvCell('A,"B"\nC'), '"A,""B""\nC"');
});
test('CSV neutralizes formula prefixes including whitespace', () => {
  for (const value of ['=1+1','+SUM(A1)','-1+2','@SUM(A1)',' \t=1+1']) assert.ok(csvCell(value).startsWith('"\''));
});
test('demo export explicitly marks data and missing plate', () => {
  const csv = demoCsv([{date:'Vandaag',time:'08:00–08:35',route:'A → B',distance:35,classification:'Privé',driver:'Jesse'}]);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('NIET VOOR FISCALE INDIENING'));
  assert.ok(csv.includes('ONTBREEKT'));
  assert.equal(csv.split('\r\n').length,2);
});
test('duration belongs to selected trip; invalid and overnight times remain unknown', () => {
  assert.equal(durationLabel('08:12–08:47'),'0:35 u');
  assert.equal(durationLabel('09:05–09:32'),'0:27 u');
  for (const value of ['onbekend','25:00–26:00','23:50–00:10','09:99–10:00']) assert.equal(durationLabel(value),'Onbekend');
});
