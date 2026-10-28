import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isRemovedAdminUrl, publicScreenFromUrl } from './navigation';

test('legacy admin URLs cannot select the admin screen',()=>{
  for(const [path,hash] of [['/admin',''],['/admin/settings',''],['/','#admin']]) {
    assert.equal(isRemovedAdminUrl(path,hash),true);
    assert.equal(publicScreenFromUrl(path,hash),'welcome');
  }
  assert.equal(isRemovedAdminUrl('/privacy',''),false);
  assert.equal(publicScreenFromUrl('/privacy',''),'privacy');
  assert.equal(publicScreenFromUrl('/terms',''),'terms');
  const rules=readFileSync(new URL('../../public/_redirects',import.meta.url),'utf8').trim().split(/\r?\n/);
  assert.deepEqual(rules,['/admin / 302','/admin/* / 302']);
});
