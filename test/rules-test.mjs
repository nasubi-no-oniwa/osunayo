// 称号の人数のルールの試験（試し用のデータベースで試す。本番には触らない）
const B = 'http://127.0.0.1:9000';
const NS = '?ns=ft-green-default-rtdb';
const tok = uid => { const e = o => Buffer.from(JSON.stringify(o)).toString('base64url'); return e({ alg: 'none', typ: 'JWT' }) + '.' + e({ uid, sub: uid, user_id: uid, provider_id: 'anonymous', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600, aud: 'ft-green', iss: 'https://securetoken.google.com/ft-green', firebase: { sign_in_provider: 'anonymous' } }) + '.'; };
async function req(method, path, body, uid) {
  const r = await fetch(B + '/osunayo' + path + '.json' + NS + (uid ? '&auth=' + tok(uid) : ''), { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return r.status;
}
const now = { '.sv': 'timestamp' }, inc = { '.sv': { increment: 1 } };
const A = 'userAaaaaaaaaaaaaaaaaaaaa', Bu = 'userBbbbbbbbbbbbbbbbbbbbb', C = 'userCccccccccccccccccccccc';
let bad = 0;
async function ok(name, p, want) { const s = await p; const pass = want ? s === 200 : s !== 200; console.log((pass ? 'OK ' : 'NG ') + name + ' (' + s + ')'); if (!pass) bad++; }
// ---- 前からある書き方（開いたままの古いページ用）がはじかれないこと ----
await ok('古い形：KYで初めて記録', req('PATCH', '', { ['g3/' + A]: { t: now } }, A), true);
await ok('古い形：同じ称号を書きなおし', req('PUT', '/g3/' + A, { t: now }, A), false);
await ok('古い形：芸人に上がる', req('PATCH', '', { ['g2/' + A]: { t: now }, ['g3/' + A]: null }, A), true);
await ok('古い形：下の称号に戻ろうとする', req('PATCH', '', { ['g3/' + A]: { t: now } }, A), false);
await ok('古い形：最高の芸人に上がる', req('PATCH', '', { ['g0/' + A]: { t: now }, ['g1/' + A]: null, ['g2/' + A]: null, ['g3/' + A]: null }, A), true);
await ok('古い形：ほかの人の場所に書く', req('PUT', '/g1/' + A, { t: now }, Bu), false);
// ---- 新しい形：称号ごとに「取ったことがある人数」 ----
await ok('新：Aが芸人を取る（数を1ふやす）', req('PATCH', '', { ['u/' + A + '/clear']: now, ['c/clear']: inc }, A), true);
await ok('新：Aがもう一度芸人を数える', req('PATCH', '', { ['u/' + A + '/clear']: now, ['c/clear']: inc }, A), false);
await ok('新：印なしで数だけふやす', req('PATCH', '', { ['c/clear']: inc }, A), false);
await ok('新：数をふやさず印だけつける', req('PATCH', '', { ['u/' + A + '/dive']: now }, A), false);
await ok('新：2つふやす', req('PATCH', '', { ['u/' + A + '/dive']: now, ['c/dive']: { '.sv': { increment: 2 } } }, A), false);
await ok('新：Bが芸人を取る', req('PATCH', '', { ['u/' + Bu + '/clear']: now, ['c/clear']: inc }, Bu), true);
await ok('新：BがAの印をつける', req('PATCH', '', { ['u/' + A + '/fui']: now, ['c/fui']: inc }, Bu), false);
await ok('新：ない称号', req('PATCH', '', { ['u/' + Bu + '/xxx']: now, ['c/xxx']: inc }, Bu), false);
await ok('新：時刻をごまかす', req('PATCH', '', { ['u/' + Bu + '/gaya']: 123, ['c/gaya']: inc }, Bu), false);
await ok('新：ログインなし', req('PATCH', '', { ['u/' + C + '/gaya']: now, ['c/gaya']: inc }), false);
await ok('新：数を消す', req('DELETE', '/c/clear', undefined, A), false);
await ok('新：印を消す', req('DELETE', '/u/' + A + '/clear', undefined, A), false);
await ok('新：Bが炎上を取る', req('PATCH', '', { ['u/' + Bu + '/enjo']: now, ['c/enjo']: inc }, Bu), true);
await ok('人数を読む（ログインなし）', fetch(B + '/osunayo/c.json' + NS).then(r => r.status), true);
await ok('ほかの人の印は読めない', fetch(B + '/osunayo/u/' + A + '.json' + NS + '&auth=' + tok(Bu)).then(r => r.status), false);
const c = await fetch(B + '/osunayo/c.json' + NS).then(r => r.json());
console.log('人数', JSON.stringify(c));
if (!c || c.clear !== 2 || c.enjo !== 1 || c.dive) bad++;
if (bad) { console.log(bad + ' 件が合いません'); process.exit(1); } else console.log('すべて合いました');
