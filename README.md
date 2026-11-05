# 空気を読むゲーム

目の前に背中。その先は熱湯。「押すなよ」と言われたら、どうする？

遊ぶ：https://nasubi-no-oniwa.github.io/osunayo/

- `index.html` … ゲーム本体（1つのファイル）
- `database.rules.osunayo.json` … 称号の人数のルール。GitHub に上げると自動で ft-green の `osunayo` に反映（ほかのゲームのルールはそのまま）
- 称号の人数は1人1回、その人のいちばん良い称号で数える（良い称号を取ると下の称号から移る）
- `test/rules-test.mjs` … ルールの試験（GitHub の上で試し用のデータベースを立てて試す）
