# ZZZ Damage Calculator｜絕區零傷害乘區實驗室

以繁體中文呈現的《絕區零》互動傷害計算與公式教學網頁。調整數值，即可查看各乘區如何影響最終傷害，並對照完整公式與數值代入過程。

## 功能

- 三個模塊，以頂端分頁切換，同一時間只顯示一個：**角色攻略**（預設）、**隊伍攻略**、**傷害計算**。網址 hash 對應模塊：`#/agents`、`#/teams`、`#/calc`；頁內錨點（如 `#workbench`）會自動切到所屬模塊。
- 角色攻略列出全部代理人（新版本在前），還沒有攻略的角色顯示灰色；點頭像進入 `#/agent/<id>`，頁尾自動列出含這個角色的隊伍攻略。
- 隊伍攻略頁 `#/team/<id>` 顯示成員頭像，點頭像跳回該角色攻略。
- 攻略以 Markdown 撰寫：`##` 區塊可折疊（預設展開）、影片連結自動嵌入、`{{角色id}}` 變成角色頭像連結。詳見下方「撰寫攻略」。
- 九種傷害模式：直傷、貫穿、銳化、異常、紊亂、亂流、異放、耀變、真實傷害。
- 完整傷害公式、變數說明、倍率表與即時計算結果。
- 逐步乘區拆解、比較基準、預設範例與觀念練習。
- 每個參數欄位附「填什麼／值從哪來」說明，另有常數與係數表（防禦係數 794、等級區、各屬性異常倍率等）。
- 都市龐克風格：橘色輔色 `#de8a1e`、粗黑體、流動漸層背景、ZZ 標誌 favicon（本機 PNG，離線可用）。
- 傷害計算頁右上角角色頭像每 10 秒隨機替換，點擊可提早換下一張；外框上貼版本標籤與角色名稱標籤。共 108 張 1000×1000 原圖，涵蓋 1.0–3.2 共 20 個版本，依版本分資料夾放在 `assets/avatars/<版本>/`，未經壓縮；角色名稱與版本讀自角色表 `data/characters.json`。
- 支援桌面與手機；HTML、CSS、JavaScript 集中於 `index.html`，角色表與頭像為獨立檔案，不連外部網域。

## 本機開啟

網頁會用 `fetch` 讀取 `data/characters.json`，瀏覽器禁止 `file://` 頁面讀取本機檔案，所以**不能直接雙擊 `index.html`**，需在專案資料夾啟動任一靜態伺服器，例如：

```sh
npx serve .
# 或
python -m http.server 8000
```

再以瀏覽器開啟終端機顯示的網址（例如 http://localhost:8000）。GitHub Pages 本身就是伺服器，不受影響。

favicon 與左上角標誌共用 `assets/icon.png`，頭像放在 `assets/avatars/`，都以相對路徑引用。除了攻略內嵌入的 YouTube／B 站影片，全站不連外部網域；Markdown 解析器 marked 也放在 repo 內（`assets/vendor/`，MIT 授權）。頭像版權屬 miHoYo／HoYoverse，此處為個人非商業用途。

## 檔案結構

```text
zzz-damage-calc/
├── index.html          # 網頁入口、模塊切換、樣式與計算邏輯
├── data/characters.json # 角色表：id、名稱、版本、頭像路徑、攻略檔
├── data/teams.json     # 隊伍表：id、名稱、成員 id、攻略檔
├── guides/agents/      # 角色攻略 .md（檔名建議用角色 id）
├── guides/teams/       # 隊伍攻略 .md
├── guides/img/         # 攻略用圖片
├── guides/_templates/  # 攻略範本（不會出現在網站上）
├── assets/vendor/      # marked v18.0.14（Markdown 解析）與授權檔
├── assets/icon.png     # 站台圖示與左上角標誌（512×512 PNG）
├── assets/avatars/     # 角色頭像，依版本分資料夾（1.0–3.2，108 張原圖，約 29 MB）
├── verify-damage.cjs   # 數值、離線依賴與瀏覽器互動驗證
└── README.md           # 專案說明
```

## 角色表

`data/characters.json` 是角色相關資訊的唯一來源，每個角色一行：

```json
{"id":1001,"name":"11號","version":"1.0","avatars":["assets/avatars/1.0/11號.png"]}
```

- `id`：整數流水號，從 1001 起依版本順序編。**已發出的 id 不可改、不可重用**，日後攻略會用它指向角色；新角色接在最大 id 之後。
- `name`：顯示名稱（繁體中文）。頭像檔名可與名稱不同（例如雨果、維琳娜、諾姆的檔名沿用原始字元）。
- `version`：登場版本，須與頭像所在的 `assets/avatars/<版本>/` 資料夾一致。
- `avatars`：頭像路徑陣列，第一張用於角色列表，全部參與傷害計算頁的輪播。
- `guide`（選填）：攻略 md 路徑，例如 `"guides/agents/1011.md"`。沒填的角色在列表顯示灰色。

新增角色：把頭像放進對應版本資料夾，在表尾加一行，執行 `node verify-damage.cjs` 確認 id 不重複、檔案都存在，且沒有未登記的頭像。日後要加欄位（屬性、陣營、攻略檔名等）直接加在同一物件上。

## 撰寫攻略

範本在 `guides/_templates/`。

**角色攻略**：複製 `agent.md` 到 `guides/agents/<角色id>.md`，再到 `data/characters.json` 該角色加上 `"guide":"guides/agents/<角色id>.md"`。

**隊伍攻略**：複製 `team.md` 到 `guides/teams/<隊伍id>.md`，在 `data/teams.json` 加一筆：

```json
{"id":2001,"title":"隊伍名稱","members":[1011,1016,1040],"guide":"guides/teams/2001.md"}
```

隊伍 id 從 2001 起編，規則同角色 id（不可改、不可重用）。`members` 的順序就是頁面顯示順序；每個成員的角色攻略頁會自動列出這支隊伍，不用另外維護。`guide` 可以先不填，頁面會顯示「攻略撰寫中」。

**Markdown 規則**

| 寫法 | 效果 |
| --- | --- |
| 第一個 `##` 之前的文字 | 開頭導言，不折疊 |
| `## 標題` | 可折疊區塊，預設展開，到下一個 `##` 為止 |
| `###`、清單、表格、`>` 引言 | 一般 Markdown |
| `![說明](../img/a.png)` | 圖片，路徑相對於 md 檔本身（編輯器預覽也看得到） |
| YouTube／B 站連結**單獨一行** | 嵌入播放器；YouTube 可帶 `t=1m30s` 指定開始、`end=2m` 指定結束（兩者都從影片開頭算，也可寫純秒數如 `t=90`） |
| 其他平台 | 直接貼該平台分享的 `<iframe>` 原始碼 |
| `{{1016}}` | 角色頭像＋名稱，點擊跳到該角色攻略；id 不存在時顯示橘色虛線框提醒 |

寫在句子裡或 `[文字](網址)` 形式的影片連結會保持一般連結。放在行內程式碼（反引號包住）裡的 `{{id}}` 不會轉換。

改完執行 `node verify-damage.cjs`，會檢查攻略檔是否存在、隊伍成員 id 是否都在角色表內。

## 驗證

已在 Node.js 24 執行驗證，不需安裝 npm 套件。在專案資料夾執行：

```sh
node verify-damage.cjs
```

執行數值與離線依賴檢查。若也要驗證桌面、手機版面和互動：

```sh
node verify-damage.cjs --browser
```

瀏覽器驗證會在本機啟動暫時的 HTTP 伺服器載入測試頁，並使用 Windows 的下列安裝路徑，依序尋找 Chrome 或 Edge：

- `C:/Program Files/Google/Chrome/Application/chrome.exe`
- `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`

程式使用獨立的暫存瀏覽器設定檔；執行結果會列出截圖位置。其他作業系統或自訂安裝位置需先調整 `verify-damage.cjs` 的瀏覽器路徑。

瀏覽器驗證的攻略頁測試使用寫在暫存資料夾的假資料，不會動到 `data/` 與 `guides/`。

最近一次驗證：120 項數值、離線與資料表檢查，加上桌面、手機各 127 項互動／版面檢查，共 374 項通過。

## 發布到 GitHub Pages

本專案為純靜態網頁，不需自行執行建置指令或安裝依賴。

1. 建立 GitHub repository，例如 `zzz-damage-calc`，將專案檔案上傳至根目錄，確保 `index.html` 不在額外的子資料夾裡，且 `assets/` 一併上傳（頭像靠相對路徑讀取）。
2. 前往 repository 的 **Settings → Pages**。
3. 在 **Build and deployment → Source** 選擇 **Deploy from a branch**。
4. 選擇存放檔案的分支（例如 `main`），資料夾選 **/(root)**，按 **Save**。
5. 等待部署完成，從 Pages 設定頁開啟網站連結。若部署失敗，可至 **Actions** 查看執行紀錄。

後續更新發布分支內的檔案，GitHub Pages 就會重新發布。免費方案可使用公開 repository。

步驟依據：[GitHub Pages 官方發布來源設定文件](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。本 README 提供部署方式，不表示專案已上線。

## 公式來源與適用範圍

這是玩家整理的計算與教學工具，並非官方計算器。主要參考：

- [巴哈姆特：傷害種類與乘區](https://forum.gamer.com.tw/Co.php?bsn=74860&sn=32943)
- [巴哈姆特：異常傷害機制](https://forum.gamer.com.tw/Co.php?bsn=74860&sn=32963)
- [巴哈姆特：異放與快照進階觀念](https://forum.gamer.com.tw/Co.php?bsn=74860&sn=36497)
- [日文 Wiki：傷害計算式](https://wikiwiki.jp/zenless/ダメージ計算式)
- [日文 Wiki：狀態異常](https://wikiwiki.jp/zenless/状態異常)
- [GAMEUI：視覺風格參考](https://www.gameui.net/games/14605)

公式核對日期為 2026-09-18。耀變取自 5F「蕾米埃爾的耀變傷害」，真實傷害取自 1F「四、真實傷害」；防禦公式的 Lv.60 係數 794 在所引文章中只有「須查表得知」的框架，未列出數字，本專案沿用社群通行值並在頁面標註。特殊公式依玩家實測整理；多人混合積蓄未提供自動計算。角色專屬變體（極性紊亂、極性強擊、決算傷害）未做成獨立模式，頁面說明如何用現有模式代入。浮點計算結果於顯示時四捨五入，遊戲版本、角色機制與實際情境可能影響結果。各模式的詳細假設與限制請見網頁中的「來源與範圍」。

## 修改方式

編輯 `index.html` 即可調整網頁，角色資料改 `data/characters.json`。模塊切換與攻略渲染在 `site-ui` script（`route()`、`renderMarkdown()`）。計算邏輯位於 `damage-engine` script，畫面與互動位於 `damage-ui` script；修改公式後請執行驗證，並同步更新畫面上的公式說明。
