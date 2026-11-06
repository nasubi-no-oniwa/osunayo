// 前の数え方（g0〜g3：1人1つ・いちばん良い称号）にいる人を、新しい数え方（称号ごとに取ったことがある人数）へ引き継ぐ
// 何回動かしても同じ人を二重には数えない（印がある人はとばす）
import { token, api } from './fb.mjs';
const MAP = { g0: 'dive', g1: 'both', g2: 'clear', g3: 'ky' };
const tk = await token();
const u = JSON.parse(await api('GET', '/osunayo/u.json', undefined, tk)) || {};
const patch = {}, add = {};
for (const [g, id] of Object.entries(MAP)) {
  const j = JSON.parse(await api('GET', '/osunayo/' + g + '.json?shallow=true', undefined, tk)) || {};
  for (const uid of Object.keys(j)) {
    if (u[uid] && u[uid][id]) continue;
    patch['u/' + uid + '/' + id] = Date.now();
    add[id] = (add[id] || 0) + 1;
  }
}
for (const [id, n] of Object.entries(add)) patch['c/' + id] = { '.sv': { increment: n } };
if (!Object.keys(patch).length) { console.log('引き継ぐ人はいませんでした'); process.exit(0); }
await api('PATCH', '/osunayo.json', JSON.stringify(patch), tk);
const c = JSON.parse(await api('GET', '/osunayo/c.json', undefined, tk));
console.log('引き継いだ人数', JSON.stringify(add), 'いまの人数', JSON.stringify(c));
