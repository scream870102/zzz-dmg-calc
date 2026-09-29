# 圖示名稱來源核對

圖片來自 HoYoLAB 戰績前端與 HoYoWiki 提供的 CDN URL；`icon-registry.json` 保存共用圖示來源及雜湊，`characters.json` 集中保存角色 metadata、官方頭像及其來源與雜湊。Wiki 內容可能由社群維護；採官方網站來源不代表每個欄位都不會有筆誤。

通用技能名稱取戰績官方 [zh-tw 語系檔](https://webstatic.hoyoverse.com/admin/mi18n/nap_global/m20240410hy38foxb7k/m20240410hy38foxb7k-zh-tw.json)，元素／職業名稱取 Wiki zh-tw filters，圖示优先採戰績原檔。

| 戰績 property ID | 圖示 key | 繁中名稱 | 名稱證據 |
| --- | --- | --- | --- |
| 19 | perforation | 貫穿力 | [儀玄](https://wiki.hoyolab.com/pc/zzz/entry/752)突破表 combatList，基礎值 104；核心被動同名 |
| 20 | energyaccumulation | 閃能自動累積 | 儀玄突破表 combatList，基礎值 2 |
| 25 | accumulation | 銳能自動累積 | [克拉蕾](https://wiki.hoyolab.com/pc/zzz/entry/1185)突破表 combatList，基礎值 1.5；符合使用者截圖 |
| 28 | sharp | 銳暴傷害 | 克拉蕾突破表 combatList，基礎值 150%；核心被動同名 |

ID → 圖示的對應由戰績角色頁 bundle 靜態枚舉核對；ID → 欄位名稱另核對[官方養成工具 bundle](https://act.hoyolab.com/zzz/event/character-builder/index_21798c0aea810d8b8fff.js)。數字為此版來源證據，非計算器角色基礎值設定。

曾發現其他角色 Wiki 突破表將貫穿力誤寫為穿透力／穿透率，因此採儀玄突破表與多個核心被動一致的「貫穿力」。未呼叫需登入的玩家戰績 API。

角色引用、列表、攻略檔名與路由統一採 Wiki ID：克拉蕾 `1185`；遊戲 ID `1611` 來自使用者提供的戰績路由，僅留作 metadata。哲 `7`、鈴 `8` 由官方 Random Play 清單及各自條目核實。不保留本站自編數字 aliases；未儲存玩家 UID 或伺服器參數。
