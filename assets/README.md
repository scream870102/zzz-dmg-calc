# 素材來源與用途

| 目錄 | 管理方式 | 用途 |
| --- | --- | --- |
| `images/manual/avatars/<版本>/` | 使用者手動下載、維護 | Q 版頭像：攻略內文角色引用、隊伍小頭像、計算頁輪播 |
| `images/synced/` | `node scripts/sync-icons.cjs` 自動下載 | 官方完整角色肖像、音擎、驅動盤、屬性、職業、稀有度、操作圖示 |
| `images/site/` | 專案維護 | favicon、網站標誌等 |
| `vendor/` | 專案維護 | 第三方程式庫，非圖片 |

手動 Q 版圖片不能由爬蟲取得；更新程式不下載、不改寫、不刪除 `manual/`。自動圖片採內容雜湊檔名，禁止將手動圖片放入 `synced/`。

新增 Q 版頭像：

1. 將下載原圖放入 `images/manual/avatars/<版本>/`；現有檔名與版本資料夾保留。
2. 在 `data/characters.json` 對應 Wiki ID 的 `avatars` 陣列填入從專案根目錄起算的路徑。第一張用於攻略內文及隊伍小頭像，該角色已確認版本的所有圖片可參與輪播。
3. 執行 `node verify-icons.cjs` 和 `node verify-damage.cjs`，核對檔案存在、未孤立及資料引用。

例如克拉蕾（Wiki `1185`）：

```json
"avatars": [
  "assets/images/manual/avatars/3.2/克拉蕾01.png",
  "assets/images/manual/avatars/3.2/克拉蕾02.png"
]
```

尚未手動下載時保持 `avatars: []`，內文顯示角色名字，不以完整肖像代替。總覽與角色詳情繼續使用爬蟲提供的 `icon`。更新程式保留手動填寫的 `avatars`、`version`、`guide` 及显示簡稱；新角色不自動填 Q 版頭像。
