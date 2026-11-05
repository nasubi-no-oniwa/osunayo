// 称号の人数のルールの試験（試し用のデータベースで試す。本番には触らない）
const B = 'http://127.0.0.1:9000';
const NS = '?ns=ft-green-default-rtdb';
const tok = uid => { const e = o => Buffer.from(JSON.stringify(o)).toString('base64url'); return e({ alg: 'none', typ: 'JWT' }) + '.' + e({ uid, sub: uid, user_id: uid, provider_id: 'anonymous', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600, aud: 'ft-green', iss: 'https://securetoken.google.com/ft-green', firebase: { sign_in_provider: 'anonymous' } }) + '.'; };
async function req(method, path, body, uid) {
  const r = await fetch(B + '/osunayo' + path + '.json' + NS + (uid ? '&auth=' + tok(uid) : ''), { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return r.status;
}
const now = { '.sv': 'timestamp' };
let bad = 0;
async function ok(name, p, want) { const s = await p; const pass = want ? s === 200 : s !== 200; console.log((pass ? 'OK ' : 'NG ') + name + ' (' + s + ')'); if (!pass) bad++; }
await ok('KYで初めて記録', req('PATCH', '', { 'g3/userAaaaaaaaaaaaaaaaaaaaa': { t: now } }, 'userAaaaaaaaaaaaaaaaaaaaa'), true);
await ok('同じ称号を書きなおし', req('PUT', '/g3/userAaaaaaaaaaaaaaaaaaaaa', { t: now }, 'userAaaaaaaaaaaaaaaaaaaaa'), false);
await ok('芸人に上がる', req('PATCH', '', { 'g2/userAaaaaaaaaaaaaaaaaaaaa': { t: now }, 'g3/userAaaaaaaaaaaaaaaaaaaaa': null }, 'userAaaaaaaaaaaaaaaaaaaaa'), true);
await ok('下の称号に戻ろうとする', req('PATCH', '', { 'g3/userAaaaaaaaaaaaaaaaaaaaa': { t: now } }, 'userAaaaaaaaaaaaaaaaaaaaa'), false);
await ok('芸人のまま下を消すだけ', req('PATCH', '', { 'g3/userAaaaaaaaaaaaaaaaaaaaa': null }, 'userAaaaaaaaaaaaaaaaaaaaa'), true);
await ok('最高の芸人に上がる', req('PATCH', '', { 'g0/userAaaaaaaaaaaaaaaaaaaaa': { t: now }, 'g1/userAaaaaaaaaaaaaaaaaaaaa': null, 'g2/userAaaaaaaaaaaaaaaaaaaaa': null, 'g3/userAaaaaaaaaaaaaaaaaaaaa': null }, 'userAaaaaaaaaaaaaaaaaaaaa'), true);
await ok('最高の芸人を消す', req('DELETE', '/g0/userAaaaaaaaaaaaaaaaaaaaa', undefined, 'userAaaaaaaaaaaaaaaaaaaaa'), false);
await ok('ほかの人の場所に書く', req('PUT', '/g1/userAaaaaaaaaaaaaaaaaaaaa', { t: now }, 'userBbbbbbbbbbbbbbbbbbbbb'), false);
await ok('ログインなしで書く', req('PUT', '/g1/userCccccccccccccccccccccc', { t: now }), false);
await ok('時刻をごまかす', req('PUT', '/g1/userBbbbbbbbbbbbbbbbbbbbb', { t: 123 }, 'userBbbbbbbbbbbbbbbbbbbbb'), false);
await ok('よけいな中身', req('PUT', '/g1/userBbbbbbbbbbbbbbbbbbbbb', { t: now, x: 1 }, 'userBbbbbbbbbbbbbbbbbbbbb'), false);
await ok('Bがほどほどで記録', req('PATCH', '', { 'g1/userBbbbbbbbbbbbbbbbbbbbb': { t: now }, 'g2/userBbbbbbbbbbbbbbbbbbbbb': null, 'g3/userBbbbbbbbbbbbbbbbbbbbb': null }, 'userBbbbbbbbbbbbbbbbbbbbb'), true);
await ok('人数を読む（ログインなし）', fetch(B + '/osunayo/g1.json' + NS + '&shallow=true').then(r => r.status), true);
const c = await fetch(B + '/osunayo/g1.json' + NS + '&shallow=true').then(r => r.json());
console.log('ほどほどの人数', Object.keys(c || {}).length); if (Object.keys(c || {}).length !== 1) bad++;
if (bad) { console.log(bad + ' 件が合いません'); process.exit(1); } else console.log('すべて合いました');
