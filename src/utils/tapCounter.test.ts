import test from 'node:test';
import assert from 'node:assert/strict';
import { createTapCounter } from './tapCounter';

test('ten rapid taps trigger once without needing React renders',()=>{
  const tap=createTapCounter();
  for(let i=0;i<9;i++)assert.equal(tap(1000),false);
  assert.equal(tap(1000),true);
  for(let i=0;i<9;i++)assert.equal(tap(1001),false);
  assert.equal(tap(1001),true);
});
test('tap sequence resets after inactivity, not after a fixed overall deadline',()=>{
  const tap=createTapCounter();
  for(let i=0;i<5;i++)assert.equal(tap(i*100),false);
  for(let i=0;i<9;i++)assert.equal(tap(10000+i*1500),false);
  assert.equal(tap(10000+9*1500),true);
});
