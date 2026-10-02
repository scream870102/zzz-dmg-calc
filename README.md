# ZZZ Lab｜絕區零傷害乘區實驗室

以繁體中文呈現的《絕區零》攻略與傷害計算網站：代理人、音擎、驅動盤資料與攻略，隊伍配置，以及互動傷害計算與公式教學。調整數值，即可查看各乘區如何影響最終傷害，並對照完整公式與數值代入過程。

## 圖示引用

攻略可引用官方圖示與文字，例如 `{{1185}}`（克拉蕾的 Wiki ID）、`{{stat:crit_rate}}`、`{{wengine:1189}}`（音擎）、`{{disc:1177}}`（驅動盤）。角色清單、路由、攻略檔名與數字引用统一採官方 Wiki ID。請參閱 [圖示預覽／搜尋表](icon-reference.html)。

資料同步爬蟲、驗證程式與 Shorts 產生器放在另一個非公開 repo（zzz-lab-tools），本 repo 只保存 GitHub Pages 網站內容。

## 功能

- 五個模塊，以頂端分頁切換，同一時間只顯示一個：**代理人**（預設）、**音擎**、**驅動盤**、**隊伍**、**傷害計算**。網址 hash 對應模塊：`#/agents`、`#/wengines`、`#/discs`、`#/teams`、`#/calc`；頁內錨點（如 `#workbench`）會自動切到所屬模塊。
- 代理人模塊列出全部代理人（新版本在前），還沒有攻略的角色顯示灰色；點頭像進入 `#/agent/<id>`，頁尾自動列出含這個角色的隊伍攻略。
- 代理人頁顯示稀有度、元素、職業、陣營。爬蟲取得的「推薦音擎」以可折疊區塊（預設展開）放在上方（先列官方代理人頁的推薦，再補上在音擎頁把這位代理人列為推薦的音擎），自己撰寫的 Markdown 攻略與相關隊伍放在下方。
- 音擎總覽可依稀有度、職業篩選，點進 `#/wengine/<id>` 看 Lv.60 基礎／高級屬性、音擎效果、推薦代理人（連回代理人頁）與簡介；驅動盤總覽只提供排序（各套皆有 S 級，不設篩選、不顯示稀有度圖示），點進 `#/disc/<id>` 看 2 件／4 件套效果。資料都由爬蟲自官方 HoYoWiki 抓取，也可選填攻略 Markdown，接在資料下方。
- 代理人、音擎總覽的「篩選與排序」可展開，篩選為**複選**：同一類勾選多項時符合任一即顯示，不同類同時套用，都不勾（「全部」）即不限；代理人可依稀有度、元素、職業、陣營篩選。排序選單與篩選群組同樣式。可依版本新舊、名稱正反、稀有度或 Wiki ID 排序；未提供版本的項目在版本排序時置後，重設恢復全部與最新版本優先。當頁切換後再返回會保留條件。
- 篩選條件以帶圖示的核取方塊呈現（已勾選顯示 ✓），Tab 移動、空白鍵勾選。角色卡左側沿肖像斜邊显示稀有度、職業、元素、陣營圖示（陣營沒有官方圖示時不顯示），名稱透過提示及輔助文字提供；缺少的官方資料不顯示猜測圖示。版本標籤仍在右上方。
- 卡片外觀：代理人維持沿肖像斜邊的平行四邊形卡，外加黑色描邊與硬陰影；音擎、驅動盤原圖是正方形，使用圓角方形膠囊卡（粗黑框、內側灰線、下方硬陰影），詳細頁頭像同樣是不傾斜的圓角方框。
- 隊伍頁 `#/team/<id>` 顯示成員頭像，點頭像跳回該代理人頁。
- 攻略以 Markdown 撰寫：`##` 區塊可折疊（預設展開）、影片連結自動嵌入、`{{角色id}}` 變成角色頭像連結。詳見下方「撰寫攻略」。
- 九種傷害模式：直傷、貫穿、銳化、異常、紊亂、亂流、異放、耀變、真實傷害。
- 完整傷害公式、變數說明、倍率表與即時計算結果。
- 逐步乘區拆解、比較基準、預設範例與觀念練習。
- 每個參數欄位附「填什麼／值從哪來」說明，另有常數與係數表（防禦係數 794、等級區、各屬性異常倍率等）。
- 都市龐克風格：橘色輔色 `#de8a1e`、粗黑體、流動漸層背景、ZZ 標誌 favicon（本機 PNG，離線可用）。
- 傷害計算頁右上角角色頭像每 10 秒隨機替換，點擊可提早換下一張；外框上貼版本標籤與角色名稱標籤。共 108 張 1000×1000 原圖，涵蓋 1.0–3.2 共 20 個版本，依版本分資料夾放在 `assets/images/manual/avatars/<版本>/`，未經壓縮；角色名稱與版本讀自角色表 `data/characters.json`。
- 支援桌面與手機；HTML、CSS、JavaScript 集中於 `index.html`，角色表與頭像為獨立檔案，不連外部網域。

## 本機開啟

網頁會用 `fetch` 讀取 `data/characters.json`，瀏覽器禁止 `file://` 頁面讀取本機檔案，所以**不能直接雙擊 `index.html`**，需在專案資料夾啟動任一靜態伺服器，例如：

```sh
npx serve .
# 或
python -m http.server 8000
```

再以瀏覽器開啟終端機顯示的網址（例如 http://localhost:8000）。GitHub Pages 本身就是伺服器，不受影響。

favicon 與左上角標誌共用 `assets/images/site/icon.png`，頭像放在 `assets/images/manual/avatars/`，都以相對路徑引用。除了攻略內嵌入的 YouTube／B 站影片，全站不連外部網域；Markdown 解析器 marked 也放在 repo 內（`assets/vendor/`，MIT 授權）。頭像版權屬 miHoYo／HoYoverse，此處為個人非商業用途。

## 檔案結構

```text
zzz-lab/
├── index.html          # 網頁入口、模塊切換、樣式與計算邏輯
├── data/characters.json # 角色表：id、名稱、版本、頭像路徑、攻略檔
├── data/wengines.json  # 音擎表：Wiki ID、名稱、稀有度、職業、Lv.60 屬性、效果、推薦代理人、圖示
├── data/discs.json     # 驅動盤表：Wiki ID、名稱、稀有度、2／4 件套效果、圖示
├── data/teams.json     # 隊伍表：id、名稱、成員 id、攻略檔
├── guides/agents/      # 代理人攻略 .md（檔名建議用角色 id）
├── guides/teams/       # 隊伍攻略 .md
├── guides/img/         # 攻略用圖片
├── guides/_templates/  # 攻略範本（不會出現在網站上）
├── assets/vendor/      # marked v18.0.14（Markdown 解析）與授權檔
├── assets/images/site/icon.png     # 站台圖示與左上角標誌（512×512 PNG）
├── assets/images/manual/avatars/     # 手動 Q 版頭像，依版本分資料夾（108 張原圖，約 29 MB）
├── assets/images/synced/            # 爬蟲下載的完整肖像與共用圖示
├── assets/README.md                # 圖片來源分區與手動更新步驟
└── README.md           # 專案說明
```

## 角色表

`data/characters.json` 是角色相關資訊的唯一來源，每個角色一行：

```json
{"id":22,"name":"11號","version":"1.0","avatars":["assets/images/manual/avatars/1.0/11號.png"]}
```

- `id`：官方 HoYoWiki 角色條目數字 ID，角色表由同步程式更新，不自行編號。例如克拉蕾 `1185`、麗娜 `30`、哲 `7`、鈴 `8`。Wiki ID 與遊戲 ID 不同。
- `faction`、`factionId`、`factionWiki`、`recommendedWengines`：陣營名稱與圖示 ID（官方代理人陣營篩選選項，20 個皆有圖示）、爬蟲從代理人詳細頁表格讀到的原文、官方推薦音擎 Wiki ID。
- `overrides`（選填，人工校正）：例如 `"overrides":{"faction":"對空洞特別行動部第六課"}`。同步時爬蟲資料照常更新，但以人工值為準，爬蟲原值存在 `wikiValues`，方便日後比對；刪除 `overrides` 後重新同步即回到官方值。
- `icon`、`elementId`、`professionId`、`rarity`：角色表集中保存官方頭像、元素、職業、稀有度，以及來源 URL、圖檔雜湊、`sourceMetadata`。角色引用直接讀此表，圖示 registry 不重複保存 agent；操作只使用 `action`。
- `name`：顯示名稱（繁體中文）。頭像檔名可與名稱不同（例如雨果、維琳娜、諾姆的檔名沿用原始字元）。
- `version`：登場版本，須與頭像所在的 `assets/images/manual/avatars/<版本>/` 資料夾一致。
- `avatars`：只能填手動下載的 Q 版頭像，第一張用於內文及隊伍小頭像；有已確認版本的角色參與傷害計算頁輪播。空陣列表示尚未手動下載，內文顯示名字。總覽與角色詳情使用爬蟲提供的完整 `icon`。
- `guide`（選填）：攻略 md 路徑，例如 `"guides/agents/1185.md"`。沒填的角色在列表顯示灰色。

## 音擎與驅動盤表

`data/wengines.json`、`data/discs.json` 由爬蟲（工具 repo）從官方 HoYoWiki 清單與詳細頁產生，`id` 同樣是 Wiki ID。官方富文字轉為純文字（保留換行）後才存入，網頁不插入官方 HTML；原始欄位保留在 `sourceMetadata`。

- 音擎：`rarity`、`professionId`／`profession`（沒有職業限制的留 `null`）、`baseStat`／`advancedStat`（Lv.60 改裝後）、`effectName`、`effectCondition`、`effect`、`intro`、`recommendedAgents`（Wiki 的推薦／專屬代理人 ID）。
- 驅動盤：`rarities`（該套可出現的品質）、`twoPiece`、`fourPiece`。
- `version`：取自 Wiki「實裝版本」。官方未填時為 `null`，不推測；可手動填入，重新同步時官方仍未提供就保留手填值。
- `guide`（選填）：例如 `"guides/wengines/1189.md"`、`"guides/discs/1177.md"`，會接在資料下方以攻略格式顯示。

新增角色：由工具 repo 的同步程式從官方清單加入，未確認的版本留 `null`。之後可補上版本、原有頭像素材與攻略路徑；同步會保留這些欄位。

圖片統一放在 `assets/images/`：`manual/avatars/` 是手動 Q 版，`synced/` 是爬蟲圖，`site/` 是網站圖示；`vendor/` 繼續保存程式庫。爬蟲不會取得或覆寫手動 Q 版。詳見 [素材管理說明](assets/README.md)。

## 修改圖示表與新增項目

圖示表（`icon-reference.html`、`data/icon-reference.md`）與 `data/` 內的官方資料都是爬蟲**產物**，不要直接改 `sourceMetadata`、`icon`、`sha256` 這類爬蟲欄位。同步、新增圖示與驗證工具放在另一個非公開 repo（zzz-lab-tools），流程寫在那邊的 README。


## 撰寫攻略

範本在 `guides/_templates/`。

**代理人攻略**：複製 `agent.md` 到 `guides/agents/<角色id>.md`，再到 `data/characters.json` 該角色加上 `"guide":"guides/agents/<角色id>.md"`。

**隊伍攻略**：複製 `team.md` 到 `guides/teams/<隊伍id>.md`，在 `data/teams.json` 加一筆：

```json
{"id":2001,"title":"隊伍名稱","members":[29,30,837],"guide":"guides/teams/2001.md"}
```

隊伍是本站自創內容，隊伍 id 從 2001 起編，不可改或重用；這與官方 Wiki 角色 ID 分開。`members` 填成員的 Wiki ID，順序就是頁面顯示順序；每個成員的代理人頁會自動列出這支隊伍，不用另外維護。`guide` 可以先不填，頁面會顯示「攻略撰寫中」。

**Markdown 規則**

| 寫法 | 效果 |
| --- | --- |
| 第一個 `##` 之前的文字 | 開頭導言，不折疊 |
| `## 標題` | 可折疊區塊，預設展開，到下一個 `##` 為止 |
| `###`、清單、表格、`>` 引言 | 一般 Markdown |
| `![說明](../img/a.png)` | 圖片，路徑相對於 md 檔本身（編輯器預覽也看得到） |
| YouTube／B 站連結**單獨一行** | 嵌入播放器；YouTube 可帶 `t=1m30s` 指定開始、`end=2m` 指定結束（兩者都從影片開頭算，也可寫純秒數如 `t=90`） |
| 其他平台 | 直接貼該平台分享的 `<iframe>` 原始碼 |
| `{{30}}` 或 `{{agent:30}}` | 麗娜的官方頭像＋名稱，點擊跳到該代理人頁；未知 Wiki ID 顯示橘色虛線框提醒 |
| `{{wengine:1189}}`、`{{disc:1177}}` | 音擎／驅動盤官方圖示＋名稱，點擊跳到其專屬頁 |

寫在句子裡或 `[文字](網址)` 形式的影片連結會保持一般連結。放在行內程式碼（反引號包住）裡的 `{{id}}` 不會轉換。

改完用工具 repo 的 `verify-damage.cjs` 檢查攻略檔是否存在、隊伍成員 id 是否都在角色表內。

## 驗證

數值、資料表與桌面／手機版面的驗證程式放在非公開的工具 repo（zzz-lab-tools）。

最近一次驗證（2026-10-02）：120 項數值、離線與資料表檢查，加上桌面、手機各 134 項互動／版面檢查，以及圖示／引用代碼的瀏覽器檢查，全部通過。


## 發布到 GitHub Pages

本專案為純靜態網頁，不需自行執行建置指令或安裝依賴。

1. 建立 GitHub repository，例如 `zzz-lab`，將專案檔案上傳至根目錄，確保 `index.html` 不在額外的子資料夾裡，且 `assets/` 一併上傳（頭像靠相對路徑讀取）。
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

編輯 `index.html` 即可調整網頁，角色資料改 `data/characters.json`。模塊切換與攻略渲染在 `site-ui` script（`route()`、`renderMarkdown()`）；三個總覽共用 `CATALOGS` 設定與 `renderCatalog()`，新增篩選維度只需在對應設定的 `filters` 加一個取值函式並在 HTML 放同名 fieldset。計算邏輯位於 `damage-engine` script，畫面與互動位於 `damage-ui` script；修改公式後請執行驗證，並同步更新畫面上的公式說明。
