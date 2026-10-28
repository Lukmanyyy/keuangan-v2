import test from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, email, hashPassword, money, password, verifyPassword } from '../cloudflare/security';
import { imageBytes } from '../cloudflare/api';

test('passwords are salted and verified without storing plaintext',async()=>{
  const one=await hashPassword('Strong Password 123');const two=await hashPassword('Strong Password 123');
  assert.notEqual(one,two);assert.ok(!one.includes('Strong'));
  assert.equal(await verifyPassword('Strong Password 123',one),true);
  assert.equal(await verifyPassword('Wrong password',one),false);
  assert.equal(await verifyPassword('password',null),false);
});
test('validate amounts, email, password and uploaded file signatures',()=>{
  assert.equal(money(12000),12000);assert.equal(money(-100,false),-100);
  for(const value of [0,-1,1.5,NaN,'100',1e15])assert.throws(()=>money(value));
  assert.equal(email(' TEST@EXAMPLE.COM '),'test@example.com');assert.throws(()=>email('not-email'));
  assert.equal(password('123456'),'123456');assert.throws(()=>password('12345'));
  assert.throws(()=>password('      '));assert.throws(()=>password('x'.repeat(129)));
  assert.throws(()=>imageBytes('data:image/png;base64,aGVsbG8='));
  assert.throws(()=>imageBytes('data:image/svg+xml;base64,PHN2Zz4='));
});
test('CSV quotes cells and neutralizes spreadsheet formulas',()=>{
  assert.equal(csvCell('a"b'),'"a""b"');assert.equal(csvCell(' =SUM(A1)'),'"\' =SUM(A1)"');
  assert.equal(csvCell(100),'"100"');
});
